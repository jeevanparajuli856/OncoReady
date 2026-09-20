import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";
import {dirname, join} from "node:path";

interface TreeNode { split_feature?: number; threshold?: number; decision_type?: "<="; default_left?: boolean; left_child?: TreeNode; right_child?: TreeNode; leaf_value?: number }
interface RuntimeArtifact {
  format_version: "oncoready-lightgbm-portable-v1"; model_version: string; feature_schema_version: string;
  features: Array<{name: string; type: string; minimum: number; maximum: number; missing_allowed: boolean; missing_value: null}>;
  trees: Array<{tree_index: number; shrinkage: number; tree_structure: TreeNode}>;
  calibrator: {type: "sigmoid"; input: "raw_margin"; coefficient: number; intercept: number};
  explanation: {method: "tree_shap_raw_margin"; expected_value: number; feature_display_names: Record<string, string>};
  training: {training_timestamp: string}; evaluation_manifest_sha256: string;
}
interface GoldenVectors {
  model_version:string; feature_schema_version:string; tolerance:{raw_margin:number;probability:number;explanation:number};
  vectors:Array<{feature_snapshot_sha256:string;ordered_feature_values:Array<number|null>;raw_margin:number;calibrated_probability:number;explanation:{base_value:number;contributions:Record<string,number>}}>;
}
interface Manifest {format_version:string;model_version:string;feature_schema_version:string;files:Record<string,string>}

const unavailable = (reason: string) => ({status: "unavailable", use: "supportive_outreach_ordering_only", reason});
const sha = (value:string|Buffer) => createHash("sha256").update(value).digest("hex");

function canonical(value:unknown):string{
  if(Array.isArray(value))return`[${value.map(canonical).join(",")}]`;
  if(value&&typeof value==="object")return`{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,child])=>`${JSON.stringify(key)}:${canonical(child)}`).join(",")}}`;
  return JSON.stringify(value);
}

function predictNode(node:TreeNode,features:Array<number|null>,depth=0):number{
  if(depth>64)throw new Error("tree depth exceeded");
  if(typeof node.leaf_value==="number")return node.leaf_value;
  if(typeof node.split_feature!=="number"||typeof node.threshold!=="number"||!node.left_child||!node.right_child)throw new Error("malformed tree");
  const value=features[node.split_feature];
  const goLeft=value==null?node.default_left===true:value<=node.threshold;
  return predictNode(goLeft?node.left_child:node.right_child,features,depth+1);
}

function rawMargin(model:RuntimeArtifact,features:Array<number|null>):number{
  // LightGBM dump leaf values already include the configured learning rate.
  return model.trees.reduce((sum,tree)=>sum+predictNode(tree.tree_structure,features),0);
}
const calibrated=(model:RuntimeArtifact,margin:number)=>1/(1+Math.exp(-(model.calibrator.coefficient*margin+model.calibrator.intercept)));

async function loadValidated(modelPath:string):Promise<{model:RuntimeArtifact;golden:GoldenVectors}|null>{
  try{
    const root=dirname(modelPath);
    const [modelRaw,goldenRaw,manifestRaw,evaluationRaw]=await Promise.all([readFile(modelPath,"utf8"),readFile(join(root,"golden-vectors.json"),"utf8"),readFile(join(root,"manifest.json"),"utf8"),readFile(join(root,"evaluation.json"),"utf8")]);
    const model=JSON.parse(modelRaw) as RuntimeArtifact; const golden=JSON.parse(goldenRaw) as GoldenVectors; const manifest=JSON.parse(manifestRaw) as Manifest;
    if(model.format_version!=="oncoready-lightgbm-portable-v1"||manifest.format_version!==model.format_version||manifest.model_version!==model.model_version||golden.model_version!==model.model_version||manifest.feature_schema_version!==model.feature_schema_version||golden.feature_schema_version!==model.feature_schema_version)return null;
    if(manifest.files["model.json"]!==sha(modelRaw)||manifest.files["golden-vectors.json"]!==sha(goldenRaw)||manifest.files["evaluation.json"]!==sha(evaluationRaw)||model.evaluation_manifest_sha256!==sha(evaluationRaw))return null;
    for(const vector of golden.vectors){
      const margin=rawMargin(model,vector.ordered_feature_values);
      if(Math.abs(margin-vector.raw_margin)>golden.tolerance.raw_margin||Math.abs(calibrated(model,margin)-vector.calibrated_probability)>golden.tolerance.probability)return null;
      const sum=vector.explanation.base_value+Object.values(vector.explanation.contributions).reduce((a,b)=>a+b,0);
      if(Math.abs(sum-vector.raw_margin)>golden.tolerance.explanation)return null;
    }
    return {model,golden};
  }catch{return null;}
}

export async function scorePriority(snapshot: Record<string, number | null>, modelPath = "artifacts/ml/supportive-outreach-v1/model.json", now = new Date()): Promise<Record<string, unknown>> {
  let raw:string;
  try{raw=await readFile(modelPath,"utf8");}catch{return unavailable("artifact_missing");}
  try{JSON.parse(raw);}catch{return unavailable("artifact_malformed");}
  const validated=await loadValidated(modelPath); if(!validated)return unavailable("schema_mismatch");
  const {model,golden}=validated;
  let values:Array<number|null>;
  try{values=model.features.map((feature)=>{const value=snapshot[feature.name];if(value==null)return null;if(!Number.isFinite(value)||value<feature.minimum||value>feature.maximum)throw new Error("snapshot mismatch");return value;});}catch{return unavailable("snapshot_mismatch");}
  const snapshotObject=Object.fromEntries(model.features.map((feature,index)=>[feature.name,values[index]]));
  const snapshotHash=sha(`${canonical(snapshotObject)}\n`);
  const reviewed=golden.vectors.find((vector)=>vector.feature_snapshot_sha256===snapshotHash);
  // Explanation output is shown only for an exact reviewed TreeSHAP vector.
  if(!reviewed)return unavailable("snapshot_mismatch");
  try{
    const margin=rawMargin(model,values); const probability=calibrated(model,margin);
    const contributors=Object.entries(reviewed.explanation.contributions).sort(([,a],[,b])=>Math.abs(b)-Math.abs(a)).slice(0,8).map(([feature,contribution])=>({feature:model.explanation.feature_display_names[feature]??feature,value:snapshot[feature],direction:contribution>=0?"increases_priority":"decreases_priority",raw_margin_contribution:contribution,observed_at:now.toISOString()}));
    return {status:"available",use:"supportive_outreach_ordering_only",model_version:model.model_version,feature_schema_version:model.feature_schema_version,feature_snapshot_hash:snapshotHash,scored_at:now.toISOString(),calibrated_probability:probability,contributors};
  }catch{return unavailable("runtime_error");}
}

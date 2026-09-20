import {readFile} from "node:fs/promises";
import {describe,expect,it} from "vitest";
import {scorePriority} from "../../packages/server/src/ml.js";

describe("portable ML runtime",()=>{
  it("fails closed when the artifact set is absent",async()=>{
    await expect(scorePriority({},"/definitely/not/an/artifact/model.json")).resolves.toMatchObject({status:"unavailable",reason:"artifact_missing"});
  });

  it("matches a reviewed golden vector when the integrated artifacts are present",async()=>{
    const modelPath="artifacts/ml/supportive-outreach-v1/model.json";
    try{
      const golden=JSON.parse(await readFile("artifacts/ml/supportive-outreach-v1/golden-vectors.json","utf8")) as {vectors:Array<{features:Record<string,number>;calibrated_probability:number;feature_snapshot_sha256:string}>};
      const vector=golden.vectors[0]!;
      const result=await scorePriority(vector.features,modelPath,new Date("2026-09-20T00:00:00Z"));
      expect(result).toMatchObject({status:"available",feature_snapshot_hash:vector.feature_snapshot_sha256});
      expect(Number(result.calibrated_probability)).toBeCloseTo(vector.calibrated_probability,10);
    }catch(error){
      if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error;
      await expect(scorePriority({},modelPath)).resolves.toMatchObject({status:"unavailable",reason:"artifact_missing"});
    }
  });
});

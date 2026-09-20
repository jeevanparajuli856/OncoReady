import {describe,expect,it} from "vitest";
import {readinessDrafts,transportDraft,workItemDraft,classifySms,isProviderStatusRegression} from "../../packages/server/src/domain.js";
import {AppError} from "../../packages/server/src/types.js";

const scenario="11111111-1111-4111-8111-111111111111" as const;
const context={scenario_id:scenario,actor_role:"patient" as const,idempotency_key:"readiness-001",expected_aggregate_version:1};

describe("workflow domain",()=>{
  it("preserves clinical words and separates clinical, transport, and callback ownership",()=>{
    const drafts=readinessDrafts({...context,channel:"web",transport_status:"needs_help",clinical_concern_verbatim:"I have mild tingling to discuss.",callback_requested:true},"2026-10-12T18:00:00.000Z");
    expect(drafts[0]?.payload.clinical_concern_verbatim).toBe("I have mild tingling to discuss.");
    expect(drafts.filter((draft)=>draft.event_type==="work_item.created").map((draft)=>draft.payload.owner_role)).toEqual(["triage_nurse","transport_coordinator","navigator"]);
  });

  it("does not create clinical work without a clinical concern",()=>{
    const drafts=readinessDrafts({...context,channel:"web",transport_status:"confirmed",clinical_concern_verbatim:null,callback_requested:false},"2026-10-12T18:00:00.000Z");
    expect(drafts).toHaveLength(1);
  });

  it("requires closure evidence and keeps clinical authority with staff",()=>{
    expect(()=>workItemDraft({...context,actor_role:"staff",action:"close",closure_evidence:null},"55555555-5555-4555-8555-555555555555","actioned",2,"clinical_review")).toThrow(AppError);
    expect(()=>workItemDraft({...context,actor_role:"patient",action:"close",closure_evidence:"reviewed"},"55555555-5555-4555-8555-555555555555","actioned",2,"clinical_review")).toThrow(AppError);
  });

  it("enforces work resource and action role policy",()=>{
    const command={...context,actor_role:"transport_coordinator" as const,action:"assign" as const,owner_id:"carelink-team"};
    expect(()=>workItemDraft(command,"55555555-5555-4555-8555-555555555555","open",2,"clinical_review")).toThrow(AppError);
    expect(workItemDraft(command,"55555555-5555-4555-8555-555555555555","open",2,"transport_navigation").payload.to_status).toBe("assigned");
  });

  it("does not close transport before complete plan and pickup evidence",()=>{
    const command={...context,actor_role:"transport_coordinator" as const,action:"complete" as const,closure_evidence:"Maria arrived safely."};
    expect(()=>transportDraft(command,"44444444-4444-4444-8444-444444444444","driver_assigned",3,false)).toThrow(AppError);
    expect(()=>transportDraft({...command,closure_evidence:"   "},"44444444-4444-4444-8444-444444444444","picked_up",3,true)).toThrow(AppError);
    expect(transportDraft(command,"44444444-4444-4444-8444-444444444444","picked_up",3,true).payload.to_status).toBe("completed");
  });

  it("allows Maria's patient role to acknowledge only from patient_notified",()=>{
    const patient={...context,actor_role:"patient" as const,action:"acknowledge_patient" as const};
    expect(transportDraft(patient,"44444444-4444-4444-8444-444444444444","patient_notified",8,false).payload.to_status).toBe("patient_acknowledged");
    expect(()=>transportDraft(patient,"44444444-4444-4444-8444-444444444444","driver_assigned",8,false)).toThrow(AppError);
    expect(()=>transportDraft({...patient,actor_role:"transport_coordinator" as const},"44444444-4444-4444-8444-444444444444","patient_notified",8,false)).toThrow(AppError);
  });

  it("enforces the action-specific transport role matrix",()=>{
    const staffOffer={...context,actor_role:"staff" as const,action:"offer" as const};
    expect(()=>transportDraft(staffOffer,"44444444-4444-4444-8444-444444444444","request_ready",2,false)).toThrow(AppError);
    const coordinatorOffer={...staffOffer,actor_role:"transport_coordinator" as const};
    expect(transportDraft(coordinatorOffer,"44444444-4444-4444-8444-444444444444","request_ready",2,false).payload.to_status).toBe("offered");
  });

  it("treats STOP as opt-out without fuzzy fallback",()=>{
    expect(classifySms(" STOP ")).toBe("opt_out");
    expect(classifySms("I need a ride")).toBe("ride_help");
    expect(classifySms("something unexpected")).toBe("unstructured");
  });

  it("rejects duplicate-rank and regressive provider callbacks",()=>{
    expect(isProviderStatusRegression("delivered","sent")).toBe(true);
    expect(isProviderStatusRegression("delivered","failed")).toBe(true);
    expect(isProviderStatusRegression("sent","delivered")).toBe(false);
  });
});

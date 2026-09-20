import {describe,expect,it} from "vitest";
import {generateFhirEvidence,sha256} from "../../packages/server/src/evidence.js";

const source={scenarioId:"11111111-1111-4111-8111-111111111111",sourceEventVersion:4,generatedAt:"2026-10-12T14:00:00.000Z",patientId:"22222222-2222-4222-8222-222222222222",patientDisplayName:"Maria Santos",treatmentId:"33333333-3333-4333-8333-333333333333",treatmentStartsAt:"2026-10-15T15:00:00.000Z",locationDisplayName:"Benson Cancer Center",transportStatus:"accepted"};

describe("FHIR evidence",()=>{
  it("reports generated until the exact bundle hash has a passing validator report",()=>{
    const generated=generateFhirEvidence(source);
    expect(generated.status).toBe("generated"); expect((generated.validator as {passed:boolean}).passed).toBe(false);
    const wrong=generateFhirEvidence(source,{artifact_hash:"0".repeat(64),name:"HL7 validator",version:"6.5.0",passed:true,report:[]});
    expect(wrong.status).toBe("generated");
    const exactHash=sha256(generated.bundle);
    const validated=generateFhirEvidence(source,{artifact_hash:exactHash,name:"HL7 validator",version:"6.5.0",passed:true,report:[]});
    expect(validated.status).toBe("validated");
  });
});

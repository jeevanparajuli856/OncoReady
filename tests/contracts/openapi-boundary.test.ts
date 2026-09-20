import {readFile} from "node:fs/promises";
import {describe,expect,it} from "vitest";

describe("governed HTTP boundary",()=>{
  it("keeps every implemented route and recovery projection registered",async()=>{
    const contract=await readFile("contracts/openapi.yaml","utf8");
    for(const path of ["/api/v1/scenarios/finals:","/api/v1/scenarios/finals/reset:","/api/v1/readiness-submissions:","/api/v1/transport/requests:","/api/v1/communications/sms:","/api/v1/communications/voice:","/api/v1/operations/tick:"]) expect(contract).toContain(path);
    expect(contract).toContain("ProviderReconciliationSummary:");
    expect(contract).toContain("outcome_unknown");
    expect(contract).toContain("not: {required: [transport]}");
  });
});

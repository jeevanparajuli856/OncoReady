import {mkdtemp,rm,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {afterEach,describe,expect,it} from "vitest";
import {applyMigrations,loadMigrations,MigrationError,type Migration,type MigrationClient,type MigrationQueryResult} from "../../packages/server/src/migrations.js";

const temporaryDirectories:string[]=[];
afterEach(async()=>{await Promise.all(temporaryDirectories.splice(0).map((directory)=>rm(directory,{recursive:true,force:true})));});

class FakeClient implements MigrationClient {
  readonly calls:Array<{text:string;values?:unknown[]}>=[];
  constructor(private readonly applied:Array<{migration_name:string;checksum_sha256:string}>=[],private readonly rejectedSql?:string){}
  async query<Row=Record<string,unknown>>(text:string,values?:unknown[]):Promise<MigrationQueryResult<Row>>{
    this.calls.push({text,...(values?{values}:{})});
    if(text===this.rejectedSql)throw new Error("postgres://user:super-secret@database.example/finals");
    if(text.startsWith("select migration_name"))return {rows:this.applied as Row[]};
    return {rows:[]};
  }
}

const migration=(name:string,checksum:string,sql:string):Migration=>({name,checksum,sql});

describe("Railway PostgreSQL migration runner",()=>{
  it("loads timestamped SQL files in deterministic lexical order with stable checksums",async()=>{
    const directory=await mkdtemp(join(tmpdir(),"oncoready-migrations-"));temporaryDirectories.push(directory);
    await writeFile(join(directory,"20260920174500_seed.sql"),"select 2;\n");
    await writeFile(join(directory,"20260920172033_core.sql"),"select 1;\n");
    const loaded=await loadMigrations(directory);
    expect(loaded.map((entry)=>entry.name)).toEqual(["20260920172033_core.sql","20260920174500_seed.sql"]);
    expect(loaded.every((entry)=>/^[a-f0-9]{64}$/.test(entry.checksum))).toBe(true);
  });

  it("takes the advisory lock and applies each pending migration in its own transaction",async()=>{
    const client=new FakeClient();
    const migrations=[migration("20260920172033_core.sql","a".repeat(64),"select 1;"),migration("20260920174500_seed.sql","b".repeat(64),"select 2;")];
    const result=await applyMigrations(client,migrations);
    expect(result).toEqual({applied:migrations.map((entry)=>entry.name),skipped:[]});
    expect(client.calls[0]?.text).toContain("pg_advisory_lock");
    expect(client.calls.filter((call)=>call.text==="begin")).toHaveLength(2);
    expect(client.calls.at(-1)?.text).toContain("pg_advisory_unlock");
  });

  it("skips an exact applied prefix and rejects checksum drift before new SQL runs",async()=>{
    const migrations=[migration("20260920172033_core.sql","a".repeat(64),"select 1;"),migration("20260920174500_seed.sql","b".repeat(64),"select 2;")];
    const exact=new FakeClient([{migration_name:migrations[0]!.name,checksum_sha256:migrations[0]!.checksum}]);
    await expect(applyMigrations(exact,migrations)).resolves.toEqual({applied:[migrations[1]!.name],skipped:[migrations[0]!.name]});
    const drifted=new FakeClient([{migration_name:migrations[0]!.name,checksum_sha256:"f".repeat(64)}]);
    await expect(applyMigrations(drifted,migrations)).rejects.toMatchObject({code:"checksum_drift",migration:migrations[0]!.name});
    expect(drifted.calls.some((call)=>call.text==="begin")).toBe(false);
    expect(drifted.calls.at(-1)?.text).toContain("pg_advisory_unlock");
  });

  it("rejects non-prefix database history instead of backfilling out of order",async()=>{
    const migrations=[migration("20260920172033_core.sql","a".repeat(64),"select 1;"),migration("20260920174500_seed.sql","b".repeat(64),"select 2;")];
    const client=new FakeClient([{migration_name:migrations[1]!.name,checksum_sha256:migrations[1]!.checksum}]);
    await expect(applyMigrations(client,migrations)).rejects.toMatchObject({code:"history_drift"});
    expect(client.calls.some((call)=>call.text==="begin")).toBe(false);
  });

  it("rolls back a rejected migration without exposing the underlying connection error",async()=>{
    const item=migration("20260920172033_core.sql","a".repeat(64),"select rejected;"); const client=new FakeClient([],item.sql);
    let failure:unknown;
    try{await applyMigrations(client,[item]);}catch(error){failure=error;}
    expect(failure).toBeInstanceOf(MigrationError);
    expect(failure).toMatchObject({code:"apply_failed",migration:item.name});
    expect(String(failure)).not.toContain("super-secret");
    expect(client.calls.some((call)=>call.text==="rollback")).toBe(true);
    expect(client.calls.at(-1)?.text).toContain("pg_advisory_unlock");
  });
});

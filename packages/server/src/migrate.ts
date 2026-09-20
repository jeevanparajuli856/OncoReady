import {join} from "node:path";
import {Client} from "pg";
import {assertDatabaseUrl} from "./config.js";
import {applyMigrations,loadMigrations,MigrationError,type MigrationClient} from "./migrations.js";

const databaseUrl=process.env.DATABASE_URL??"";
let client:Client|undefined;

try{
  assertDatabaseUrl(databaseUrl);
  const migrations=await loadMigrations(join(process.cwd(),"database","migrations"));
  client=new Client({connectionString:databaseUrl});
  await client.connect();
  const adapter:MigrationClient={query:async<Row>(text:string,values?:unknown[])=>{
    const result=await client!.query(text,values);
    return {rows:result.rows as Row[]};
  }};
  const summary=await applyMigrations(adapter,migrations);
  console.log(JSON.stringify({event:"database_migrations_complete",applied:summary.applied,skipped_count:summary.skipped.length}));
}catch(error){
  const detail=error instanceof MigrationError?{code:error.code,migration:error.migration??null}:{code:"migration_runner_failed",migration:null};
  console.error(JSON.stringify({event:"database_migrations_failed",...detail}));
  process.exitCode=1;
}finally{
  if(client)await client.end().catch(()=>undefined);
}

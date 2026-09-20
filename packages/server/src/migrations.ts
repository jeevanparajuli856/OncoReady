import {createHash} from "node:crypto";
import {readdir,readFile} from "node:fs/promises";
import {join} from "node:path";

const MIGRATION_NAME = /^\d{14}_[a-z0-9_]+\.sql$/;
const LOCK_NAME = "oncoready.schema-migrations.v1";

export interface Migration {
  name: string;
  checksum: string;
  sql: string;
}

export interface MigrationQueryResult<Row = Record<string, unknown>> {
  rows: Row[];
}

export interface MigrationClient {
  query<Row = Record<string, unknown>>(text: string, values?: unknown[]): Promise<MigrationQueryResult<Row>>;
}

export interface MigrationSummary {
  applied: string[];
  skipped: string[];
}

export class MigrationError extends Error {
  constructor(public readonly code: "invalid_migration_set"|"history_drift"|"checksum_drift"|"apply_failed", public readonly migration?: string) {
    super(migration ? `${code}: ${migration}` : code);
    this.name = "MigrationError";
  }
}

export async function loadMigrations(directory: string): Promise<Migration[]> {
  const entries = (await readdir(directory,{withFileTypes:true}))
    .filter((entry)=>entry.isFile()&&entry.name.endsWith(".sql"))
    .map((entry)=>entry.name)
    .sort((left,right)=>left.localeCompare(right));
  if(entries.length===0||entries.some((name)=>!MIGRATION_NAME.test(name)))throw new MigrationError("invalid_migration_set");
  const migrations:Migration[]=[];
  for(const name of entries){
    const sql=await readFile(join(directory,name),"utf8");
    migrations.push({name,sql,checksum:createHash("sha256").update(sql).digest("hex")});
  }
  return migrations;
}

export async function applyMigrations(client: MigrationClient, migrations: Migration[]): Promise<MigrationSummary> {
  const names=new Set(migrations.map((migration)=>migration.name));
  if(names.size!==migrations.length||migrations.some((migration)=>!MIGRATION_NAME.test(migration.name)))throw new MigrationError("invalid_migration_set");
  const summary:MigrationSummary={applied:[],skipped:[]};
  let locked=false;
  try{
    await client.query("select pg_advisory_lock(hashtextextended($1,0))",[LOCK_NAME]);
    locked=true;
    await client.query(`create table if not exists public.oncoready_schema_migrations (
      migration_name text primary key,
      checksum_sha256 char(64) not null check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
      applied_at timestamptz not null default clock_timestamp()
    )`);
    const result=await client.query<{migration_name:string;checksum_sha256:string}>("select migration_name,checksum_sha256 from public.oncoready_schema_migrations order by migration_name");
    const applied=result.rows;
    for(let index=0;index<applied.length;index++){
      const expected=migrations[index]; const recorded=applied[index]!;
      if(!expected||recorded.migration_name!==expected.name)throw new MigrationError("history_drift",recorded.migration_name);
      if(recorded.checksum_sha256!==expected.checksum)throw new MigrationError("checksum_drift",expected.name);
      summary.skipped.push(expected.name);
    }
    for(const migration of migrations.slice(applied.length)){
      try{
        await client.query("begin");
        await client.query(migration.sql);
        await client.query("insert into public.oncoready_schema_migrations (migration_name,checksum_sha256) values ($1,$2)",[migration.name,migration.checksum]);
        await client.query("commit");
        summary.applied.push(migration.name);
      }catch{
        try{await client.query("rollback");}catch{}
        throw new MigrationError("apply_failed",migration.name);
      }
    }
    return summary;
  }finally{
    if(locked)await client.query("select pg_advisory_unlock(hashtextextended($1,0))",[LOCK_NAME]);
  }
}

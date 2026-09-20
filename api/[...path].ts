import {loadConfig} from "../packages/server/src/config.js";
import {createHttpHandler} from "../packages/server/src/http.js";
import {PostgresWorkflowRepository} from "../packages/server/src/postgres-repository.js";

const config=loadConfig();
const repository=new PostgresWorkflowRepository(config.databaseUrl);
const handler=createHttpHandler(repository,config);

export default handler;

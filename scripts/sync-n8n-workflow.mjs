// scripts/sync-n8n-workflow.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

console.log("Memperbarui workflow aktif di database n8n container...");

const workflowFile = path.join(process.cwd(), "n8n/ekalaya-luna-workflow.json");
const workflowData = JSON.parse(fs.readFileSync(workflowFile, "utf8"));

const nodesJson = JSON.stringify(workflowData.nodes);
const connectionsJson = JSON.stringify(workflowData.connections);

const script = `
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/home/node/.n8n/database.sqlite');

const nodes = ${JSON.stringify(nodesJson)};
const connections = ${JSON.stringify(connectionsJson)};

const resEntity = db.prepare('UPDATE workflow_entity SET nodes = ?, connections = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(nodes, connections, 'K8ZPDkG1DB7ujsEw');
console.log('Update workflow_entity rows:', resEntity.changes);

const resHist = db.prepare('UPDATE workflow_history SET nodes = ?, connections = ? WHERE versionId = ?').run(nodes, connections, '800c4c4d-e615-4d9a-9260-be1347a6ca20');
console.log('Update workflow_history rows:', resHist.changes);
`;

const b64 = Buffer.from(script).toString("base64");
const cmd = `docker exec n8n-n8n-1 node --experimental-sqlite -e "eval(Buffer.from('${b64}', 'base64').toString())"`;

try {
  const out = execSync(cmd, { encoding: "utf8" });
  console.log(out);
  console.log("✅ Workflow n8n berhasil disinkronkan!");
} catch (e) {
  console.error("Gagal sinkronisasi workflow:", e.message);
}

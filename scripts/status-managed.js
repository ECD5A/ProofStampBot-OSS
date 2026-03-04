const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const logsDir = path.join(rootDir, 'logs');
const pidFile = path.join(logsDir, 'bot.pid');
const outLog = path.join(logsDir, 'bot.out.log');
const errLog = path.join(logsDir, 'bot.err.log');

function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

if (!fs.existsSync(pidFile)) {
  console.log('Status: stopped');
  process.exit(0);
}

const pid = Number(String(fs.readFileSync(pidFile, 'utf8')).trim());
if (!isAlive(pid)) {
  console.log('Status: stopped (stale pid file)');
  process.exit(0);
}

console.log(`Status: running (pid ${pid})`);
console.log(`Out log: ${outLog}`);
console.log(`Err log: ${errLog}`);

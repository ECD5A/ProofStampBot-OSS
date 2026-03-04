const fs = require('node:fs');
const path = require('node:path');

const rootDir = process.cwd();
const pidFile = path.join(rootDir, 'logs', 'bot.pid');

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
  console.log('Bot is not running (pid file not found).');
  process.exit(0);
}

const pid = Number(String(fs.readFileSync(pidFile, 'utf8')).trim());
if (!isAlive(pid)) {
  fs.unlinkSync(pidFile);
  console.log('Bot is not running (stale pid file removed).');
  process.exit(0);
}

try {
  process.kill(pid);
} catch (e) {
  console.error(`Failed to stop pid ${pid}:`, e);
  process.exit(1);
}

const started = Date.now();
while (Date.now() - started < 5000) {
  if (!isAlive(pid)) break;
}

if (isAlive(pid)) {
  try {
    process.kill(pid, 'SIGKILL');
  } catch (e) {
    console.error(`Failed to force-stop pid ${pid}:`, e);
    process.exit(1);
  }
}

if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile);
console.log(`Bot stopped (pid ${pid}).`);

const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const rootDir = process.cwd();
const logsDir = path.join(rootDir, 'logs');
const pidFile = path.join(logsDir, 'bot.pid');
const outLog = path.join(logsDir, 'bot.out.log');
const errLog = path.join(logsDir, 'bot.err.log');

const maxMb = Number(process.env.LOG_MAX_MB || '10');
const keepFiles = Number(process.env.LOG_KEEP_FILES || '8');
const maxBytes = Math.max(1, Math.trunc(maxMb)) * 1024 * 1024;
const keep = Math.max(1, Math.trunc(keepFiles));

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function nowStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${y}${m}${day}-${hh}${mm}${ss}`;
}

function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function rotateIfNeeded(currentPath, archivePrefix) {
  if (!fs.existsSync(currentPath)) return;
  const stat = fs.statSync(currentPath);
  if (stat.size < maxBytes) return;

  const archived = path.join(logsDir, `${archivePrefix}.${nowStamp()}.log`);
  fs.renameSync(currentPath, archived);
}

function cleanupArchives(prefix) {
  const files = fs.readdirSync(logsDir)
    .filter((name) => name.startsWith(`${prefix}.`) && name.endsWith('.log'))
    .map((name) => {
      const full = path.join(logsDir, name);
      const mtimeMs = fs.statSync(full).mtimeMs;
      return { full, mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  for (let i = keep; i < files.length; i++) {
    fs.unlinkSync(files[i].full);
  }
}

ensureDir(logsDir);

if (fs.existsSync(pidFile)) {
  const pid = Number(String(fs.readFileSync(pidFile, 'utf8')).trim());
  if (isAlive(pid)) {
    console.log(`Bot is already running (pid ${pid}).`);
    process.exit(0);
  }
  fs.unlinkSync(pidFile);
}

rotateIfNeeded(outLog, 'bot.out');
rotateIfNeeded(errLog, 'bot.err');
cleanupArchives('bot.out');
cleanupArchives('bot.err');

const npmExecPath = process.env.npm_execpath;
if (!npmExecPath) {
  console.error('Build failed, bot not started: npm_execpath is not set.');
  process.exit(1);
}

const build = spawnSync(process.execPath, [npmExecPath, 'run', 'build'], {
  cwd: rootDir,
  env: process.env,
  stdio: 'inherit',
});

if (build.error) {
  console.error(`Build failed, bot not started: ${build.error.message}`);
  process.exit(1);
}

if (build.status !== 0) {
  console.error(`Build failed, bot not started (exit ${build.status}).`);
  process.exit(build.status || 1);
}

const outFd = fs.openSync(outLog, 'a');
const errFd = fs.openSync(errLog, 'a');

const child = spawn(process.execPath, ['dist/index.js'], {
  cwd: rootDir,
  env: process.env,
  detached: true,
  stdio: ['ignore', outFd, errFd],
});

child.unref();
fs.closeSync(outFd);
fs.closeSync(errFd);
fs.writeFileSync(pidFile, String(child.pid), 'utf8');

console.log(`Bot started (pid ${child.pid}).`);
console.log(`Logs: ${outLog}, ${errLog}`);

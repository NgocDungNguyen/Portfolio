'use strict';
const { execFile } = require('child_process');

function git(root, args) {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: root, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } },
      (err, stdout, stderr) => (err ? reject(new Error((stderr || err.message).trim())) : resolve(stdout.trim())));
  });
}

const PATHS = ['content/media.json', 'images/uploads', 'videos'];

async function status(root) {
  const branch = await git(root, ['rev-parse', '--abbrev-ref', 'HEAD']).catch(() => '?');
  const out = await git(root, ['status', '--porcelain', '--', ...PATHS]).catch(() => '');
  return { branch, changes: out ? out.split('\n') : [] };
}

async function push(root, branch, message) {
  if (!/^[\w][\w./-]{0,80}$/.test(branch) || branch.includes('..')) throw new Error('Invalid branch name');
  const exists = await git(root, ['rev-parse', '--verify', '--quiet', `refs/heads/${branch}`]).then(() => true, () => false);
  const current = await git(root, ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (current !== branch) await git(root, exists ? ['switch', branch] : ['switch', '-c', branch]);
  const log = [];
  await git(root, ['add', '--', ...PATHS.filter((p) => require('fs').existsSync(require('path').join(root, p)))]);
  const staged = await git(root, ['diff', '--cached', '--name-only']);
  if (!staged) return { branch, committed: false, log: ['Nothing to commit.'] };
  await git(root, ['commit', '-m', message, '--', ...staged.split('\n')]);
  log.push(`Committed ${staged.split('\n').length} file(s) on ${branch}.`);
  let lastErr;
  for (let i = 0; i < 4; i++) {
    try { await git(root, ['push', '-u', 'origin', branch]); log.push(`Pushed origin/${branch}.`); return { branch, committed: true, pushed: true, log }; }
    catch (e) { lastErr = e; await new Promise((r) => setTimeout(r, 1500 * 2 ** i)); }
  }
  return { branch, committed: true, pushed: false, log: [...log, `Push failed: ${lastErr.message}`] };
}

module.exports = { status, push };

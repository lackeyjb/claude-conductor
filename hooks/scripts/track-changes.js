#!/usr/bin/env node
// PostToolUse hook - Track plan.md modifications

const fs = require('fs').promises;
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const filePath = data.tool_input?.file_path || '';
  const cwd = data.cwd || process.cwd();

  // Only track conductor plan.md changes
  if (filePath.includes('conductor') && filePath.includes('plan.md')) {
    const timestamp = new Date().toISOString();
    const logFile = path.join(cwd, 'conductor', '.conductor_session_log');
    await fs.appendFile(logFile, `${timestamp}: Modified ${filePath}\n`);
  }
}

main().catch(() => process.exit(1));

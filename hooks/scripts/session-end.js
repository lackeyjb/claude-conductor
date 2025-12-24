#!/usr/bin/env node
// Stop hook - Remind about in-progress work

const fs = require('fs').promises;
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const cwd = data.cwd || process.cwd();
  const tracksFile = path.join(cwd, 'conductor', 'tracks.md');

  // Try to read tracks file (TOCTOU fix)
  const content = await fs.readFile(tracksFile, 'utf8').catch(() => null);
  if (!content) {
    process.exit(0);
  }

  const inProgress = (content.match(/\[in-progress\]/g) || []).length;

  if (inProgress > 0) {
    console.error('');
    console.error(`Conductor: ${inProgress} track(s) still in progress.`);
    console.error('Run /conductor:status to see details.');
  }
}

main().catch(() => process.exit(1));

#!/usr/bin/env node
// SessionStart hook - Load Conductor context

const fs = require('fs').promises;
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const cwd = data.cwd || process.cwd();
  const conductorDir = path.join(cwd, 'conductor');
  const tracksFile = path.join(conductorDir, 'tracks.md');
  const tracksDir = path.join(conductorDir, 'tracks');

  // Parallel reads: tracks.md + directory listing
  const [content, trackIds] = await Promise.all([
    fs.readFile(tracksFile, 'utf8').catch(() => null),
    fs.readdir(tracksDir).catch(() => [])
  ]);

  // Exit if no conductor project
  if (!content) {
    process.exit(0);
  }

  let context = '## Conductor Project Detected\n\n';
  const lines = content.split('\n');

  // Count tracks by status with single-pass regex
  const STATUS_REGEX = /\[(completed|in-progress|pending)\]/g;
  const counts = { completed: 0, 'in-progress': 0, pending: 0 };
  let match;
  while ((match = STATUS_REGEX.exec(content)) !== null) {
    counts[match[1]]++;
  }
  const total = counts.completed + counts['in-progress'] + counts.pending;

  context += `**Tracks:** ${total} total (${counts.completed} completed, ${counts['in-progress']} in-progress, ${counts.pending} pending)\n\n`;

  // Find current in-progress track
  const inProgressLine = lines.find(line => line.includes('[in-progress]'));
  if (inProgressLine) {
    const lineMatch = inProgressLine.match(/\[([^\]]+)\]/);
    if (lineMatch) {
      context += `**Current Track:** ${lineMatch[1]}\n`;
    }
  }

  // Check for pending handoff state (parallel reads)
  const handoffChecks = trackIds.map(async (trackId) => {
    try {
      const handoffContent = await fs.readFile(
        path.join(tracksDir, trackId, 'handoff-state.json'),
        'utf8'
      );
      return { trackId, handoff: JSON.parse(handoffContent) };
    } catch {
      return null;
    }
  });

  const handoffs = (await Promise.all(handoffChecks)).filter(Boolean);
  if (handoffs.length > 0) {
    const { trackId, handoff } = handoffs[0]; // Only show first
    context += `\n**⚠️ Handoff Pending:** Track '${trackId}' was paused at ${handoff.threshold_percent || 70}% context threshold.\n`;
    context += `**Next Task:** ${handoff.next_task || 'Unknown'}\n`;
    context += `**Resume:** Run \`/conductor:implement\` to continue.\n`;
  }

  // Output JSON with context
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context
    }
  }));
}

main().catch(() => process.exit(1));

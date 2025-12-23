#!/usr/bin/env node
// SessionStart hook - Load Conductor context

const fs = require('fs');
const path = require('path');

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const cwd = data.cwd || process.cwd();
  const conductorDir = path.join(cwd, 'conductor');

  // Check for conductor directory
  if (!fs.existsSync(conductorDir)) {
    process.exit(0);
  }

  const tracksFile = path.join(conductorDir, 'tracks.md');
  let context = '## Conductor Project Detected\n\n';

  if (fs.existsSync(tracksFile)) {
    const content = fs.readFileSync(tracksFile, 'utf8');
    const lines = content.split('\n');

    // Count tracks by status
    const completed = (content.match(/\[completed\]/g) || []).length;
    const inProgress = (content.match(/\[in-progress\]/g) || []).length;
    const pending = (content.match(/\[pending\]/g) || []).length;
    const total = completed + inProgress + pending;

    context += `**Tracks:** ${total} total (${completed} completed, ${inProgress} in-progress, ${pending} pending)\n\n`;

    // Find current in-progress track
    const inProgressLine = lines.find(line => line.includes('[in-progress]'));
    if (inProgressLine) {
      const match = inProgressLine.match(/\[([^\]]+)\]/);
      if (match) {
        context += `**Current Track:** ${match[1]}\n`;
      }
    }
  }

  // Check for pending handoff state
  const tracksDir = path.join(conductorDir, 'tracks');
  if (fs.existsSync(tracksDir)) {
    try {
      const tracks = fs.readdirSync(tracksDir);
      for (const trackId of tracks) {
        const handoffFile = path.join(tracksDir, trackId, 'handoff-state.json');
        if (fs.existsSync(handoffFile)) {
          try {
            const handoff = JSON.parse(fs.readFileSync(handoffFile, 'utf8'));
            context += `\n**⚠️ Handoff Pending:** Track '${trackId}' was paused at ${handoff.threshold_percent || 70}% context threshold.\n`;
            context += `**Next Task:** ${handoff.next_task || 'Unknown'}\n`;
            context += `**Resume:** Run \`/conductor:implement\` to continue.\n`;
            break; // Only show first handoff
          } catch {
            // Ignore malformed handoff files
          }
        }
      }
    } catch {
      // Ignore errors reading tracks directory
    }
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

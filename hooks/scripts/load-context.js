#!/usr/bin/env node
// SessionStart hook - Load Conductor context and show resumption info

const fs = require('fs').promises;
const path = require('path');

// Batched file reads with concurrency limit to prevent file descriptor exhaustion
async function batchedReadPlans(trackIds, tracksDir, concurrency = 5) {
  const results = [];
  for (let i = 0; i < trackIds.length; i += concurrency) {
    const batch = trackIds.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(async (trackId) => {
      try {
        const content = await fs.readFile(
          path.join(tracksDir, trackId, 'plan.md'),
          'utf8'
        );
        return { trackId, plan: content };
      } catch {
        return null;
      }
    }));
    results.push(...batchResults);
  }
  return results.filter(Boolean);
}

// Find next task from plan.md content
function findNextTask(planContent) {
  const lines = planContent.split('\n');
  let currentPhase = null;

  for (const line of lines) {
    // Track current phase
    const phaseMatch = line.match(/^## Phase \d+:\s*(.+?)(?:\s*\[checkpoint:|\s*$)/);
    if (phaseMatch) {
      currentPhase = phaseMatch[1].trim();
    }

    // Find in-progress task first
    const inProgressMatch = line.match(/^- \[~\]\s*(?:Task:\s*)?(.+)/);
    if (inProgressMatch) {
      return {
        task: inProgressMatch[1].trim(),
        phase: currentPhase,
        status: 'in_progress'
      };
    }

    // Find first pending task
    const pendingMatch = line.match(/^- \[ \]\s*(?:Task:\s*)?(.+)/);
    if (pendingMatch) {
      return {
        task: pendingMatch[1].trim(),
        phase: currentPhase,
        status: 'pending'
      };
    }
  }

  return null;
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const input = chunks.join('');

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
  let currentTrackId = null;
  if (inProgressLine) {
    // Extract track ID from the line (last bracket content that looks like an ID)
    const trackMatch = inProgressLine.match(/\[([a-z0-9_-]+)\]$/i);
    if (trackMatch) {
      currentTrackId = trackMatch[1];
    }
    // Extract description
    const descMatch = inProgressLine.match(/Track:\s*(.+?)\s*\[/);
    if (descMatch) {
      context += `**Current Track:** ${descMatch[1]}\n`;
    }
  }

  // Find next task from in-progress track's plan.md
  if (currentTrackId && trackIds.includes(currentTrackId)) {
    const plans = await batchedReadPlans([currentTrackId], tracksDir);
    if (plans.length > 0) {
      const nextTask = findNextTask(plans[0].plan);
      if (nextTask) {
        if (nextTask.phase) {
          context += `**Current Phase:** ${nextTask.phase}\n`;
        }
        const statusLabel = nextTask.status === 'in_progress' ? 'Resuming' : 'Next';
        context += `**${statusLabel} Task:** ${nextTask.task}\n`;
      }
    }
  }

  // Check for orphaned worktrees (agents that may have crashed)
  const worktreesDir = path.join(cwd, '.worktrees');
  const worktrees = await fs.readdir(worktreesDir).catch(() => []);
  if (worktrees.length > 0) {
    context += `\n**Warning:** ${worktrees.length} worktree(s) detected. Run \`/conductor:agents\` to check status.\n`;
  }

  context += `\nRun \`/conductor:implement\` to continue.`;

  // Output JSON with context
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: context
    }
  }));
}

main().catch(() => process.exit(1));

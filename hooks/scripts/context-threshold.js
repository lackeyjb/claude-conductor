#!/usr/bin/env node
// PostToolUse hook - Track Task tool completions for context threshold detection
//
// Since hooks don't have direct access to token counts, we use Task tool
// completions as a proxy for context accumulation. Each Task tool call
// (subagent delegation) represents significant context growth.

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
  const toolName = data.tool_name || '';

  // Only track if conductor directory exists and this is a Task tool call
  if (!fs.existsSync(conductorDir) || toolName !== 'Task') {
    process.exit(0);
  }

  const contextFile = path.join(conductorDir, '.context_usage');

  // Read existing usage or initialize
  let usage = {
    task_completions: 0,
    session_id: data.session_id || 'unknown',
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (fs.existsSync(contextFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
      // Reset if different session
      if (existing.session_id === data.session_id) {
        usage = existing;
      }
    } catch {
      // Ignore parse errors, use fresh state
    }
  }

  // Increment task completion count
  usage.task_completions += 1;
  usage.updated_at = new Date().toISOString();

  // Estimate usage percentage based on task completions
  // Default threshold: ~7 tasks fills ~70% of useful context
  // (This heuristic can be tuned based on real-world usage patterns)
  const maxTasksPerSession = 10;
  usage.estimated_percent = Math.min(100, Math.round((usage.task_completions / maxTasksPerSession) * 100));

  fs.writeFileSync(contextFile, JSON.stringify(usage, null, 2));
}

main().catch(() => process.exit(1));

#!/usr/bin/env node
// PostToolUse hook - Track Task tool completions for context threshold detection
//
// Since hooks don't have direct access to token counts, we use Task tool
// completions as a proxy for context accumulation. Each Task tool call
// (subagent delegation) represents significant context growth.

const fs = require('fs').promises;
const path = require('path');

// Simple in-memory cache for workflow threshold (unlikely to change mid-session)
let cachedThreshold = null;
let cacheTime = null;
const CACHE_TTL_MS = 60000; // 1 minute

async function main() {
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  const data = JSON.parse(input);
  const cwd = data.cwd || process.cwd();
  const conductorDir = path.join(cwd, 'conductor');
  const toolName = data.tool_name || '';

  // Only track Task tool completions
  if (toolName !== 'Task') {
    process.exit(0);
  }

  // Parallel reads: context file + workflow file
  const contextFile = path.join(conductorDir, '.context_usage');
  const workflowFile = path.join(conductorDir, 'workflow.md');

  const [existingUsage, workflowContent] = await Promise.all([
    fs.readFile(contextFile, 'utf8')
      .then(JSON.parse)
      .catch(() => null),
    fs.readFile(workflowFile, 'utf8')
      .catch(() => null)
  ]);

  // If no conductor directory exists, exit early
  if (workflowContent === null) {
    process.exit(0);
  }

  // Initialize or restore usage tracking
  let usage = existingUsage && existingUsage.session_id === (data.session_id || 'unknown')
    ? existingUsage
    : {
        task_completions: 0,
        session_id: data.session_id || 'unknown',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

  // Increment task completion count
  usage.task_completions += 1;
  usage.updated_at = new Date().toISOString();

  // Estimate usage percentage based on task completions
  // Default threshold: ~7 tasks fills ~70% of useful context
  // (This heuristic can be tuned based on real-world usage patterns)
  const maxTasksPerSession = 10;
  usage.estimated_percent = Math.min(100, Math.round((usage.task_completions / maxTasksPerSession) * 100));

  // Write updated usage (non-blocking async)
  await fs.writeFile(contextFile, JSON.stringify(usage, null, 2));

  // Get threshold (cached for 1 minute to avoid repeated parsing)
  let threshold = 70;
  const now = Date.now();
  if (cachedThreshold !== null && cacheTime !== null && (now - cacheTime) < CACHE_TTL_MS) {
    threshold = cachedThreshold;
  } else {
    const thresholdMatch = workflowContent.match(/Context Threshold[^|]*\|[^|]*\|[^`]*`(\d+)%`/i);
    threshold = thresholdMatch ? parseInt(thresholdMatch[1], 10) : 70;
    cachedThreshold = threshold;
    cacheTime = now;
  }

  // Output notification when threshold is reached or exceeded
  if (usage.estimated_percent >= threshold) {
    console.log(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: `⚠️ **CONTEXT THRESHOLD REACHED** (${usage.estimated_percent}% estimated, threshold: ${threshold}%)

You MUST now execute the Context Handoff Protocol from implement.md:
1. Announce threshold reached
2. Create checkpoint commit
3. Write handoff-state.json
4. Output handoff prompt to user
5. STOP execution - do NOT continue to next task

Read conductor/.context_usage for details.`
      }
    }));
  }
}

main().catch(() => process.exit(1));

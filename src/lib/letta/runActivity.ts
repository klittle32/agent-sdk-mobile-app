/** A run row from GET /v1/runs, narrowed to the fields the list spinner needs. */
export interface RunActivityRow {
  status?: string;
  agent_id?: string | null;
  conversation_id?: string | null;
}

export interface RunActivity {
  runningAgents: Set<string>;
  runningConversations: Set<string>;
}

/** One unfiltered sweep of recent runs. Completed runs are not activity. */
export function runningIdsFromRuns(runs: unknown): RunActivity {
  const runningAgents = new Set<string>();
  const runningConversations = new Set<string>();
  if (!Array.isArray(runs)) return { runningAgents, runningConversations };
  for (const run of runs as RunActivityRow[]) {
    if (run?.status !== "running") continue;
    if (run.agent_id) runningAgents.add(run.agent_id);
    if (run.conversation_id) runningConversations.add(run.conversation_id);
  }
  return { runningAgents, runningConversations };
}

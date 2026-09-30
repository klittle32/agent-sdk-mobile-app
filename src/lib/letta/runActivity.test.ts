import { describe, expect, test } from "bun:test";

import { runningIdsFromRuns } from "./runActivity";

describe("running conversation sweep", () => {
  test("keeps only runs that are still running", () => {
    const activity = runningIdsFromRuns([
      { status: "running", agent_id: "agent-1", conversation_id: "conv-1" },
      { status: "completed", agent_id: "agent-2", conversation_id: "conv-2" },
      { status: "running", agent_id: "agent-3" },
      { status: "running", conversation_id: "conv-4" },
    ]);

    expect([...activity.runningAgents]).toEqual(["agent-1", "agent-3"]);
    expect([...activity.runningConversations]).toEqual(["conv-1", "conv-4"]);
  });

  test("an empty or unexpected payload marks nothing running", () => {
    expect(runningIdsFromRuns([]).runningConversations.size).toBe(0);
    expect(runningIdsFromRuns(null).runningAgents.size).toBe(0);
  });
});

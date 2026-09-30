/** A computer choice saved on a cloud profile. deviceId survives reconnects. */
export interface StoredComputer {
  deviceId: string;
  name: string;
  /** Directory to use on that computer. Absent means the listener's current directory. */
  cwd?: string;
}

export interface ListedComputer {
  deviceId: string;
  status: "online" | "offline";
  connectionId: string | null;
}

/**
 * What to pass to resumeSession. An offline or unknown device falls back to
 * the SDK sandbox instead of failing the send.
 */
export function computerForSession(
  selector: StoredComputer | undefined,
  computers: ListedComputer[],
): { deviceId: string } | undefined {
  if (!selector) return undefined;
  const online = computers.some(
    (computer) =>
      computer.deviceId === selector.deviceId && computer.status === "online" && computer.connectionId,
  );
  return online ? { deviceId: selector.deviceId } : undefined;
}

export function environmentLabel(selector: StoredComputer | undefined): string {
  return selector?.name || "cloud";
}

/** What resumeSession should receive. A directory is only sent with its computer. */
export function sessionRoute(
  selector: StoredComputer | undefined,
  computers: ListedComputer[],
): { computer?: { deviceId: string }; cwd?: string } {
  const computer = computerForSession(selector, computers);
  if (!computer) return {};
  const cwd = selector?.cwd?.trim();
  return cwd ? { computer, cwd } : { computer };
}

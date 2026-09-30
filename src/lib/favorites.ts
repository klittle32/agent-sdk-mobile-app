/**
 * Pinned-item storage for the list screens. A device preference, not server state.
 *
 * Keys:
 *   letta.pin.agent.<profileId>
 *   letta.pin.conv.<agentId>
 *   letta.pin.profile
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

async function loadSet(key: string): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(arr) ? arr.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

async function saveSet(key: string, ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify([...ids]));
}

export function pinnedAgentsKey(profileId: string): string {
  return `letta.pin.agent.${profileId}`;
}

export function pinnedConversationsKey(agentId: string): string {
  return `letta.pin.conv.${agentId}`;
}

export const PINNED_PROFILES_KEY = "letta.pin.profile";

export function loadPinned(key: string): Promise<Set<string>> {
  return loadSet(key);
}

export async function togglePinned(key: string, id: string): Promise<Set<string>> {
  const set = await loadSet(key);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  await saveSet(key, set);
  return set;
}

/** Pinned ids lead. Order within each group is preserved. */
export function pinFirst<T extends { id: string }>(items: T[], pinned: Set<string>): T[] {
  const leading: T[] = [];
  const rest: T[] = [];
  for (const item of items) (pinned.has(item.id) ? leading : rest).push(item);
  return [...leading, ...rest];
}

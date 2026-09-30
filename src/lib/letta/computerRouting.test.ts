import { expect, test } from "bun:test";

import { computerForSession, environmentLabel, type StoredComputer } from "./computerRouting";

const mac: StoredComputer = { deviceId: "dev-mac", name: "m1p" };

test("no selection uses the cloud sandbox", () => {
  expect(computerForSession(undefined, [{ deviceId: "dev-mac", status: "online", connectionId: "lease" }])).toBeUndefined();
  expect(environmentLabel(undefined)).toBe("cloud");
});

test("an online computer is routed by stable device id", () => {
  expect(
    computerForSession(mac, [
      { deviceId: "dev-mac", status: "online", connectionId: "lease-now" },
      { deviceId: "dev-other", status: "online", connectionId: "other" },
    ]),
  ).toEqual({ deviceId: "dev-mac" });
  expect(environmentLabel(mac)).toBe("m1p");
});

test("an offline or unknown computer falls back to the sandbox", () => {
  expect(computerForSession(mac, [{ deviceId: "dev-mac", status: "offline", connectionId: null }])).toBeUndefined();
  expect(computerForSession(mac, [])).toBeUndefined();
});

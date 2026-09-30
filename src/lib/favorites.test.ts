import { expect, test } from "bun:test";

import { pinFirst } from "./favorites";

test("pinned items lead and keep their relative order", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  expect(pinFirst(items, new Set(["c", "a"])).map((item) => item.id)).toEqual(["a", "c", "b", "d"]);
});

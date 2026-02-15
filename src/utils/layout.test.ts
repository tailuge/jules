import { describe, test, expect } from "bun:test";
import { getOrientation } from "./layout";

describe("layout utils", () => {
  test("returns 'wide' when width is much larger than height", () => {
    expect(getOrientation(100, 30)).toBe("wide");
  });

  test("returns 'tall' when width is not much larger than height", () => {
    expect(getOrientation(80, 60)).toBe("tall");
  });
});

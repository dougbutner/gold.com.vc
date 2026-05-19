import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = path.dirname(fileURLToPath(import.meta.url));
const recordsPath = path.join(dir, "records.json");

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

describe("tests/transactions/records.json", () => {
  it("parses and matches the expected top-level shape", () => {
    const raw = readFileSync(recordsPath, "utf8");
    const data: unknown = JSON.parse(raw);
    expect(isPlainObject(data)).toBe(true);
    expect(typeof data.description).toBe("string");
    expect(data.snapshotUtc).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    );
    expect(Array.isArray(data.transactions)).toBe(true);
    for (const row of data.transactions as unknown[]) {
      expect(isPlainObject(row)).toBe(true);
    }
  });
});

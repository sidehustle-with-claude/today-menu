// 예제 16-2: src/cache.ts
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DIR = ".cache";

export function cacheKey(...parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

export async function cached<T>(
  key: string,
  make: () => Promise<T>,
): Promise<T> {
  const file = `${DIR}/${key}.json`;
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"));
  const value = await make();
  mkdirSync(DIR, { recursive: true });
  writeFileSync(file, JSON.stringify(value));
  return value;
}

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const srcDir = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

const STATIC_IMPORT = /^\s*(?:import|export)\s+(?!type\s)(?:[^'";]*?\sfrom\s+)?["']([^"']+)["']/gm;
const DYNAMIC_IMPORT = /import\(\s*["']([^"']+)["']\s*\)/g;

function importsOf(file: string): string[] {
  const code = readFileSync(file, "utf8");
  return [...code.matchAll(STATIC_IMPORT), ...code.matchAll(DYNAMIC_IMPORT)].flatMap((match) =>
    match[1] ? [match[1]] : [],
  );
}

function resolveLocal(from: string, specifier: string): string | null {
  let base: string;
  if (specifier.startsWith("@/")) base = path.join(srcDir, specifier.slice(2));
  else if (specifier.startsWith(".")) base = path.resolve(path.dirname(from), specifier);
  else return null;
  for (const suffix of ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]) {
    const candidate = base + suffix;
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Every module reachable from Client Components (and therefore shipped to the browser). */
function clientGraph(): Map<string, string[]> {
  const entries = sourceFiles(srcDir).filter((file) =>
    /^\s*["']use client["']/m.test(readFileSync(file, "utf8")),
  );
  const graph = new Map<string, string[]>();
  const queue = [...entries];
  while (queue.length > 0) {
    const file = queue.pop();
    if (!file || graph.has(file)) continue;
    const specifiers = importsOf(file);
    graph.set(file, specifiers);
    for (const specifier of specifiers) {
      const resolved = resolveLocal(file, specifier);
      if (resolved && !graph.has(resolved)) queue.push(resolved);
    }
  }
  return graph;
}

const FORBIDDEN: Record<string, string> = {
  "tailwind-merge": "client code uses `cx` (clsx); `cn` + tailwind-merge stay server-side",
  zod: "Zod is build-time only; content modules are plain typed data",
  "server-only": "server-only modules must not be reachable from Client Components",
};

describe("client bundle hygiene", () => {
  const graph = clientGraph();

  it("walks the client module graph", () => {
    expect(graph.size).toBeGreaterThan(10);
  });

  for (const [dependency, reason] of Object.entries(FORBIDDEN)) {
    it(`never reaches ${dependency} from a Client Component`, () => {
      const offenders = [...graph.entries()]
        .filter(([file, specifiers]) =>
          specifiers.some((specifier) => {
            if (specifier === dependency) return true;
            const resolved = resolveLocal(file, specifier);
            return resolved !== null && importsOf(resolved).includes(dependency);
          }),
        )
        .map(([file]) => path.relative(srcDir, file));
      expect(offenders, reason).toEqual([]);
    });
  }
});

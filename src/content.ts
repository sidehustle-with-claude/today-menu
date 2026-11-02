// 서버에서만 쓴다. 저장소 안의 글(content/)과 문서(docs/)를 읽어 온다.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Kind = "updates" | "guides";
export type Post = { slug: string; title: string; date: string; description: string; body: string };

const root = process.cwd();

export function readDoc(relPath: string): string {
  return readFileSync(join(root, relPath), "utf8");
}

// 글 맨 위의 --- 로 둘러싼 줄(title:, date:, description:)을 읽는다.
export function parsePost(slug: string, raw: string): Post {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(raw.replace(/\r\n/g, "\n"));
  const meta: Record<string, string> = {};
  if (m) {
    for (const line of m[1].split("\n")) {
      const k = /^(\w+):\s*(.*)$/.exec(line);
      if (k) meta[k[1]] = k[2].trim();
    }
  }
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "",
    description: meta.description ?? "",
    body: m ? m[2] : raw,
  };
}

export function listPosts(kind: Kind): Post[] {
  const dir = join(root, "content", kind);
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parsePost(f.replace(/\.md$/, ""), readFileSync(join(dir, f), "utf8")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(kind: Kind, slug: string): Post | undefined {
  return listPosts(kind).find((p) => p.slug === slug);
}

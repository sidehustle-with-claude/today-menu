import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../site-footer";
import { getPost, listPosts } from "../../../src/content";
import { renderMarkdown } from "../../../src/markdown";

export function generateStaticParams() {
  return listPosts("guides").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost("guides", slug);
  if (!post) return {};
  return {
    title: `${post.title} | 오늘 뭐 먹지`,
    description: post.description,
    alternates: { canonical: `/guides/${post.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost("guides", slug);
  if (!post) notFound();
  return (
    <main className="wide doc">
      <p className="hint">{post.date}</p>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
      <p>
        <Link href="/">오늘 뭐 먹지 소개로 돌아가기</Link>
      </p>
      <SiteFooter />
    </main>
  );
}

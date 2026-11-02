import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { restaurants } from "../../../src/places";
import { clampTitle, SITE_NAME } from "../../../src/site";

export function generateStaticParams() {
  return restaurants.map((r) => ({ id: r.id }));
}

// 가게마다 title 과 description 이 달라야 한다.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const place = restaurants.find((r) => r.id === id);
  if (!place) return { title: SITE_NAME };
  return {
    title: clampTitle(`${place.name}: ${place.area} ${place.category} | ${SITE_NAME}`),
    description: `${place.area}의 ${place.category} 가게 ${place.name}. 영업시간 ${place.hours}. 화면의 가게 정보는 가상 데이터입니다.`,
    alternates: { canonical: `/place/${place.id}` },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = restaurants.find((r) => r.id === id);
  if (!place) notFound();
  return (
    <main>
      <h1>{place.name}</h1>
      <p className="hint">
        {place.area} · {place.category} · {place.hours}
      </p>
      <p className="hint">화면의 가게 정보는 가상 데이터입니다.</p>
      <Link href="/">추천 목록으로 돌아가기</Link>
    </main>
  );
}

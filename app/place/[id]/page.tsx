import Link from "next/link";
import { notFound } from "next/navigation";
import { restaurants } from "../../../src/places";

export function generateStaticParams() {
  return restaurants.map((r) => ({ id: r.id }));
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
      <Link href="/">처음으로</Link>
    </main>
  );
}

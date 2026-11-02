"use client";

import { useEffect, useMemo, useState } from "react";
import { recommend } from "../src/recommend";
import { MOCK_WEATHER, restaurants } from "../src/places";

const CATEGORIES = ["한식", "분식", "카페", "중식"];
const KEY = "favorites";

// 예제 12-1: 즐겨찾기 읽기와 쓰기
function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "null") ?? [];
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): string[] {
  const now = readFavorites();
  const next = now.includes(id) ? now.filter((x) => x !== id) : [...now, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />
    </svg>
  );
}

export default function Home() {
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const picks = useMemo(() => {
    const pool = restaurants.filter((r) => !area.trim() || r.area.includes(area.trim()));
    return recommend(pool, category ? { category } : {}, MOCK_WEATHER);
  }, [area, category]);

  return (
    <main>
      <h1>오늘 뭐 먹지</h1>
      <p className="hint">동네와 메뉴를 고르면 오늘 갈 만한 곳 3곳을 골라 드려요.</p>
      <input
        type="text"
        placeholder="동네 이름을 넣어 주세요"
        aria-label="동네 이름"
        value={area}
        onChange={(e) => setArea(e.target.value)}
      />
      <div className="menus">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? "" : c)}
          >
            {c}
          </button>
        ))}
      </div>
      <section className="cards" aria-live="polite">
        {picks.length === 0 && (
          <p className="empty">조건에 맞는 가게가 없어요. 동네나 메뉴를 바꿔 보세요.</p>
        )}
        {picks.map((r) => (
          <article className="card" key={r.id} data-id={r.id}>
            <h2>{r.name}</h2>
            <p>
              {r.area} · {r.category} · {r.hours}
            </p>
            <button
              type="button"
              className="star"
              aria-label="즐겨찾기"
              aria-pressed={favorites.includes(r.id)}
              onClick={() => setFavorites(toggleFavorite(r.id))}
            >
              <Star />
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

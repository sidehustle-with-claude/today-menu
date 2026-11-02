"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { recommend, type Filter } from "../src/recommend";
import { MOCK_WEATHER, restaurants } from "../src/places";
import { detectLang, lang, setLang, t, type Lang } from "../src/i18n";
import { fmtDistance } from "../src/format";
import { apiBase, pullFavorites, pushFavorite } from "../src/favorites-api";

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
  const [appliedArea, setAppliedArea] = useState(""); // 추천 받기를 누르면 반영된다
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [taste, setTaste] = useState("");
  const [tasteFilter, setTasteFilter] = useState<Filter>({});
  const [tasteMsg, setTasteMsg] = useState("");
  const [, setTick] = useState(0); // 언어를 바꾸면 화면을 다시 그린다

  useEffect(() => {
    setFavorites(readFavorites());
    // API 주소가 있으면 서버에 저장된 즐겨찾기를 합친다. 실패하면 localStorage 만 쓴다.
    pullFavorites(apiBase()).then((ids) => {
      if (!ids) return;
      const merged = Array.from(new Set([...readFavorites(), ...ids]));
      try {
        localStorage.setItem(KEY, JSON.stringify(merged));
      } catch {}
      setFavorites(merged);
    });
    setLang(detectLang());
    setTick((n) => n + 1);
  }, []);

  function chooseLang(next: Lang) {
    setLang(next);
    document.documentElement.lang = next;
    setTick((n) => n + 1);
  }

  const picks = useMemo(() => {
    const pool = restaurants.filter((r) => !appliedArea.trim() || r.area.includes(appliedArea.trim()));
    const filter: Filter = { ...tasteFilter, ...(category ? { category } : {}) };
    return recommend(pool, filter, MOCK_WEATHER);
  }, [appliedArea, category, tasteFilter]);

  // 한 줄 취향은 내 서버(/api/taste)에만 보낸다. 키는 서버에만 있다.
  async function applyTaste() {
    setTasteMsg("");
    try {
      const res = await fetch("/api/taste", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: taste }),
      });
      const data = await res.json();
      if (!res.ok) {
        setTasteFilter({});
        setTasteMsg(data.error ?? t("taste.fail"));
        return;
      }
      setTasteFilter(data.filter);
      setTasteMsg(t("taste.done"));
    } catch {
      setTasteMsg(t("taste.fail"));
    }
  }

  return (
    <main>
      <div className="langs" role="group" aria-label={t("lang.label")}>
        {(["ko", "en"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={lang === l} onClick={() => chooseLang(l)}>
            {t(`lang.${l}`)}
          </button>
        ))}
      </div>
      <h1>{t("app.title")}</h1>
      <p className="hint">{t("app.hint")}</p>
      <input
        type="text"
        placeholder={t("area.placeholder")}
        aria-label={t("area.label")}
        value={area}
        onChange={(e) => setArea(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && setAppliedArea(area)}
      />
      <button type="button" className="search" onClick={() => setAppliedArea(area)}>
        {t("search.button")}
      </button>
      <div className="taste">
        <input
          type="text"
          maxLength={100}
          placeholder={t("taste.placeholder")}
          aria-label={t("taste.label")}
          value={taste}
          onChange={(e) => setTaste(e.target.value)}
        />
        <button type="button" onClick={applyTaste} disabled={!taste.trim()}>
          {t("taste.apply")}
        </button>
      </div>
      <p className="hint">{t("taste.privacy")} {tasteMsg}</p>
      <div className="menus">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(category === c ? "" : c)}
          >
            {t(`category.${c}`)}
          </button>
        ))}
      </div>
      <section className="cards" aria-live="polite">
        {picks.length === 0 && (
          <p className="empty">{t("result.none")}</p>
        )}
        {picks.map((r) => (
          <article className="card" key={r.id} data-id={r.id}>
            <h2>
              <Link href={`/place/${r.id}`}>{r.name}</Link>
            </h2>
            <p>
              {r.area} · {t(`category.${r.category}`)} · {r.hours} · {fmtDistance(r.distanceM)}
            </p>
            <p>
              {t("result.reason", {
                weather: t(MOCK_WEATHER.rain ? "weather.rain" : "weather.clear"),
                category: t(`category.${r.category}`),
              })}
            </p>
            <button
              type="button"
              className="star"
              aria-label={t("favorite.label")}
              aria-pressed={favorites.includes(r.id)}
              onClick={() => {
                const next = toggleFavorite(r.id);
                setFavorites(next);
                if (next.includes(r.id)) void pushFavorite(apiBase(), r.id, r.name);
              }}
            >
              <Star />
            </button>
          </article>
        ))}
      </section>
      <p className="hint source">{t("footer.source")}. {t("footer.mock")}</p>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { recommend, type Filter } from "../src/recommend";
import { MOCK_WEATHER, restaurants } from "../src/places";
import { detectLang, lang, setLang, t, type Lang } from "../src/i18n";
import { fmtDistance } from "../src/format";
import { apiBase, pullFavorites, pushFavorite } from "../src/favorites-api";
import { getSupabase } from "../src/supabase";
import { addFavorite, loadFavoriteIds, removeFavorite, type FavoritesDb } from "../src/favorites-supabase";
import AuthBox, { type AuthUser } from "./auth-box";
import { track } from "../src/analytics";

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
  const sb = getSupabase(); // 환경변수가 없으면 null: 로그인 없이 localStorage 로만 동작한다
  const [user, setUser] = useState<AuthUser>(null);
  const [needLogin, setNeedLogin] = useState(false);

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

  // 로그인 상태를 따라가고, 로그인하면 내 즐겨찾기(RLS 가 내 것만 돌려준다)를 합친다.
  useEffect(() => {
    if (!sb) return;
    const apply = (u: { id: string; email?: string } | undefined) => {
      setUser(u ? { id: u.id, email: u.email ?? "" } : null);
      if (!u) return;
      setNeedLogin(false);
      loadFavoriteIds(sb as unknown as FavoritesDb).then((ids) => {
        if (!ids) return;
        const merged = Array.from(new Set([...readFavorites(), ...ids]));
        try {
          localStorage.setItem(KEY, JSON.stringify(merged));
        } catch {}
        setFavorites(merged);
      });
    };
    const { data } = sb.auth.onAuthStateChange((_event, session) => apply(session?.user));
    return () => data.subscription.unsubscribe();
  }, [sb]);

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
      {sb && <AuthBox sb={sb} user={user} />}
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
      {needLogin && <p className="hint" role="status">{t("auth.needLogin")}</p>}
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
                if (sb && !user) {
                  setNeedLogin(true); // 로그인하지 않으면 즐겨찾기 대신 로그인 안내를 보여 준다
                  return;
                }
                const next = toggleFavorite(r.id);
                setFavorites(next);
                if (next.includes(r.id)) track("favorite_add", { menu_category: r.category }); // 가게 이름·사용자 정보는 보내지 않는다
                if (sb && user) {
                  const db = sb as unknown as FavoritesDb;
                  if (next.includes(r.id)) void addFavorite(db, user.id, r.id, r.name);
                  else void removeFavorite(db, r.id);
                } else if (next.includes(r.id)) {
                  void pushFavorite(apiBase(), r.id, r.name);
                }
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

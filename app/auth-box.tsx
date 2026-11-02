"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { t } from "../src/i18n";

export type AuthUser = { id: string; email: string } | null;

// 27장: 이메일 가입, 로그인, 로그아웃. 로그인한 사용자 이메일을 보여 준다.
// 호스팅 Supabase 는 가입 뒤 확인 메일의 링크를 눌러야 로그인할 수 있다(링크는 사람이 직접 연다).
export default function AuthBox({ sb, user }: { sb: SupabaseClient; user: AuthUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function signUp() {
    const { error } = await sb.auth.signUp({ email, password });
    setMsg(error ? t("auth.error") : t("auth.checkMail"));
  }

  async function signIn() {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    setMsg(error ? t("auth.error") : "");
  }

  async function signOut() {
    await sb.auth.signOut();
    setMsg("");
  }

  if (user) {
    return (
      <div className="auth">
        <span>{t("auth.signedInAs", { email: user.email })}</span>
        <button type="button" onClick={signOut}>
          {t("auth.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="auth">
      <input
        type="email"
        autoComplete="email"
        placeholder={t("auth.email")}
        aria-label={t("auth.email")}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder={t("auth.password")}
        aria-label={t("auth.password")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="auth-actions">
        <button type="button" onClick={signIn} disabled={!email || !password}>
          {t("auth.login")}
        </button>
        <button type="button" onClick={signUp} disabled={!email || !password}>
          {t("auth.signup")}
        </button>
      </div>
      {msg && <p className="hint">{msg}</p>}
    </div>
  );
}

import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { findRlsProblems } from "./rls-check";

describe("RLS 검사", () => {
  it("db/ 의 SQL 은 모든 표에 RLS 와 정책이 있다", () => {
    const all = readdirSync("db")
      .filter((f) => f.endsWith(".sql"))
      .sort()
      .map((f) => readFileSync(`db/${f}`, "utf8"))
      .join("\n");
    expect(findRlsProblems(all)).toEqual([]);
  });

  it("RLS 를 안 켠 표를 찾아낸다", () => {
    const sql = "create table public.notes (id uuid primary key);";
    expect(findRlsProblems(sql)).toEqual(["RLS 꺼짐: notes", "정책 없음: notes"]);
  });

  it("켰지만 정책이 없는 표도 찾아낸다", () => {
    const sql = "create table public.notes (id uuid);\nalter table public.notes enable row level security;";
    expect(findRlsProblems(sql)).toEqual(["정책 없음: notes"]);
  });

  it("주석 안의 글자는 세지 않는다", () => {
    const sql = "-- drop table x\ncreate table public.a (id int);\nalter table public.a enable row level security;\ncreate policy \"p\" on public.a for select using (true);";
    expect(findRlsProblems(sql)).toEqual([]);
  });
});

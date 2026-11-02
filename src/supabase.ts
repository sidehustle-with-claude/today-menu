// 27장: Supabase 클라이언트. 프로젝트 주소와 공개 키(publishable)만 쓴다.
// 비밀 키(sb_secret_...)와 service_role 키는 어떤 클라이언트 코드에도 쓰지 않는다.
// 환경변수가 없으면 null 을 돌려주고, 화면은 localStorage 즐겨찾기로만 동작한다.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  client = url && key ? createClient(url, key) : null;
  return client;
}

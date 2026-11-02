// 즐겨찾기 API 두 개
//   POST /api/favorites  { place_id, place_name } -> 추가 (이미 있으면 무시)
//   GET  /api/favorites                           -> 최신순 목록
// D1 바인딩은 env.DB. SQL 은 물음표 자리표시와 bind 로만 만든다(문자열 이어 붙이기 금지).

// @cloudflare/workers-types 없이도 타입이 맞도록 쓰는 만큼만 적은 모양
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      run(): Promise<unknown>;
      all<T = unknown>(): Promise<{ results: T[] }>;
    };
  };
}
export interface Env {
  DB: D1Like;
  ALLOWED_ORIGIN?: string;
}

const MAX_LEN = 100;

function cors(env: Env): Record<string, string> {
  // 허용할 웹 주소 하나만 응답 헤더에 넣는다. 별표(*)로 모두 허용하지 않는다.
  return {
    "access-control-allow-origin": env.ALLOWED_ORIGIN ?? "http://localhost:3000",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "origin",
  };
}

function json(env: Env, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...cors(env) },
  });
}

function validText(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= MAX_LEN;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/api/favorites") return json(env, { error: "not found" }, 404);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });

    if (request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, place_id, place_name, created_at FROM favorites ORDER BY id DESC LIMIT ?",
      )
        .bind(200)
        .all();
      return json(env, { favorites: results });
    }

    if (request.method === "POST") {
      let body: any;
      try {
        body = await request.json();
      } catch {
        return json(env, { error: "JSON 이 아니에요" }, 400);
      }
      if (!validText(body?.place_id) || !validText(body?.place_name)) {
        return json(env, { error: "place_id 와 place_name 은 1~100자 문자열이어야 해요" }, 400);
      }
      await env.DB.prepare("INSERT OR IGNORE INTO favorites (place_id, place_name) VALUES (?, ?)")
        .bind(body.place_id, body.place_name)
        .run();
      return json(env, { ok: true }, 201);
    }

    return json(env, { error: "method not allowed" }, 405);
  },
};

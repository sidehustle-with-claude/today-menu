// 결제 라우트가 같이 쓰는 도우미.
import { LiveKeyError } from "./mode";
import { PaymentError } from "./service";
import { runtime } from "./runtime";

export function getRuntime(): { rt: ReturnType<typeof runtime> & object } | { error: Response } {
  try {
    const rt = runtime();
    if (!rt) return { error: Response.json({ error: "결제 기능이 꺼져 있습니다." }, { status: 503 }) };
    return { rt };
  } catch (e) {
    if (e instanceof LiveKeyError) return { error: Response.json({ error: e.message }, { status: 503 }) };
    throw e;
  }
}

export function errorResponse(e: unknown): Response {
  if (e instanceof PaymentError) return Response.json({ error: e.message }, { status: e.status });
  return Response.json({ error: "결제를 처리하지 못했습니다." }, { status: 502 });
}

export async function readJson(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json();
    return b && typeof b === "object" ? (b as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

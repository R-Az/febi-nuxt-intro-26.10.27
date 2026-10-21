import "server-only";
import { isValidDate, isValidMonth } from "@/lib/time";

export type ApiError = { error: string; details?: string[] };

export function jsonError(status: number, error: string, details?: string[]): Response {
  const body: ApiError = details ? { error, details } : { error };
  return Response.json(body, { status });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** クエリの month を検証する。不正なら 400 のレスポンスを返す。 */
export function parseMonthParam(value: string | null): { month: string } | { response: Response } {
  if (!value || !isValidMonth(value)) {
    return { response: jsonError(400, "月は YYYY-MM の形式で指定してください。") };
  }
  return { month: value };
}

export function parseDateParam(value: string): { date: string } | { response: Response } {
  if (!isValidDate(value)) {
    return { response: jsonError(400, "日付は YYYY-MM-DD の形式で指定してください。") };
  }
  return { date: value };
}

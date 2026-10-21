// 画面から API を呼ぶための小さなヘルパー（ブラウザでだけ使う）。

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as { error?: string; details?: string[] };
  return new ApiError(res.status, body.error ?? `通信に失敗しました（${res.status}）。`, body.details ?? []);
}

/** API を呼んで JSON を返す。未ログイン（401）ならログイン画面へ移動する。 */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: { ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers },
  });
  if (res.status === 401 && !path.startsWith("/api/auth/login")) {
    // セッション切れ。画面の状態を捨てるため、ルーターではなく再読み込みでログイン画面へ移る
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

/** API からファイルをダウンロードする。 */
export async function apiDownload(path: string, fallbackName: string): Promise<void> {
  const res = await fetch(path, { cache: "no-store" });
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  if (res.status === 401) window.location.href = "/login";
  if (!res.ok) throw await toApiError(res);
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename\*=UTF-8''([^;]+)/.exec(disposition);
  const filename = match ? decodeURIComponent(match[1]) : fallbackName;
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "予期しないエラーが発生しました。";
}

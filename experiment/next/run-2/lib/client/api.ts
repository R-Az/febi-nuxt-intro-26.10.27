// 画面から API を呼ぶための小さなラッパー。
// エラー時は API が返したメッセージを持つ ApiClientError を投げる。

export class ApiClientError extends Error {
  constructor(
    public status: number,
    message: string,
    public details: string[] = [],
  ) {
    super(message);
  }
}

async function toError(res: Response): Promise<ApiClientError> {
  try {
    const body = (await res.json()) as { error?: string; details?: string[] };
    return new ApiClientError(res.status, body.error ?? "エラーが発生しました。", body.details);
  } catch {
    return new ApiClientError(res.status, `エラーが発生しました（${res.status}）。`);
  }
}

/** ログイン切れ（401）のときはログイン画面へ移る。 */
function handleUnauthorized(status: number) {
  if (status === 401 && typeof window !== "undefined" && window.location.pathname !== "/login") {
    // React の外から呼ばれるので router は使えない。画面の状態ごと捨てて移りたいので全体を読み直す。
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw await toError(res);
  }
  return (await res.json()) as T;
}

export async function apiDownload(url: string): Promise<{ blob: Blob; filename: string }> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    handleUnauthorized(res.status);
    throw await toError(res);
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "download.csv";
  return { blob: await res.blob(), filename };
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "エラーが発生しました。";
}

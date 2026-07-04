// A thin wrapper around fetch, not a full HTTP library. Every API call in
// this app goes through here, so there is exactly one place that knows
// how to build a URL, parse JSON, and turn a failed response into a
// JS Error with a useful message.

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  // Try to parse JSON even on error responses, since our Flask routes
  // return { "error": "..." } bodies that are worth surfacing to the user.
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    const message = body?.error ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const apiGet = <T>(path: string) => request<T>(path);

export const apiPost = <T>(path: string, data?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

import { getApiBaseUrl } from '../config';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
  body?: unknown;
  userId?: number | null;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const baseUrl = await getApiBaseUrl();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.userId != null) headers['x-user-id'] = String(options.userId);

  let res: Response;
  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body != null ? JSON.stringify(options.body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, `Couldn't reach the Home Hub server at ${baseUrl}. Check Settings for the right address.`);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/**
 * Generic admin API CRUD helpers.
 * Provides typed wrappers around common admin REST operations.
 */

export type ApiResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; status?: number };

export async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data?.error || `Request failed (${res.status})`, status: res.status };
    }
    return { success: true, data: data as T };
  } catch (err) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export function apiGet<T>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url);
}

export function apiPost<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'POST', body: JSON.stringify(body) });
}

export function apiPut<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'PUT', body: JSON.stringify(body) });
}

export function apiPatch<T>(url: string, body: unknown): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'PATCH', body: JSON.stringify(body) });
}

export function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(url, { method: 'DELETE' });
}

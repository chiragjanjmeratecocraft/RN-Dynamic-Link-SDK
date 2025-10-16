import { getApiBaseUrl } from './constants';
import { IDynamicLinkResponse } from './types';

export async function fetchDynamicLink(
  shortCode: string,
): Promise<IDynamicLinkResponse> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 10000);

  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/${encodeURIComponent(shortCode)}`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const { data } = await res.json();
    return data;
  } finally {
    clearTimeout(id);
  }
}

export function extractShortCode(url: string): string | null {
  try {
    // Extract the query string part
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return null;

    const queryString = url.substring(queryIndex + 1);
    const params = queryString.split('&');

    for (const param of params) {
      const [key, value] = param.split('=');
      if (key === 'short_code') return value || null;
    }

    return null;
  } catch {
    return null;
  }
}

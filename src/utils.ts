import { API_ROUTES, BASE_URL, TIMEOUT_DURATION } from './constants';
import { IDynamicLinkResponse } from './types';

export async function firstLaunchDynamicLinkCheck(): Promise<IDynamicLinkResponse | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

  try {
    const res = await fetch(`${BASE_URL.concat(API_ROUTES.PENDING_REDIRECT)}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const { data } = await res.json();
    return data;
  } catch(error) {
    return null;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchDynamicLink(
  shortCode: string
): Promise<IDynamicLinkResponse> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

  try {
    const res = await fetch(`${BASE_URL.concat(API_ROUTES.GET_DETAILS)}/${encodeURIComponent(shortCode)}`, {
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

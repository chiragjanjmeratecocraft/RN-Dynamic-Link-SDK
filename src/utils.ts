import { getApiBaseUrl } from './constants';
import { IDynamicLinkResponse, IResolveOptions } from './types';
import { Platform, Linking } from 'react-native';

export async function resolveDynamicLink(
  url: string,
  options: IResolveOptions = {},
): Promise<IDynamicLinkResponse | null> {
  const { autoOpenFallback = true } = options;
  const shortCode = extractShortCode(url);
  if (!shortCode) return null;

  const data = await fetchDynamicLink(shortCode);
  // auto-open fallback if required
  let fallbackUrl: string | null = null;
  if (Platform.OS === 'android') {
    fallbackUrl = data.androidFallbackUrl;
  } else if (Platform.OS === 'ios') {
    fallbackUrl = data.iosFallbackUrl;
  } else {
    fallbackUrl = data.desktopFallbackUrl;
  }

  if (fallbackUrl && autoOpenFallback) {
    try {
      await Linking.openURL(fallbackUrl);
    } catch {
      console.warn('Failed to open fallback URL');
    }
  }

  return data;
}

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

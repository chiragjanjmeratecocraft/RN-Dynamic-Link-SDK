import { getApiBaseUrl } from './constants';
import { IDynamicLinkResponse, IResolveOptions } from './types';
import { Platform, Linking } from 'react-native';

export async function resolveDynamicLink(url: string, options: IResolveOptions = {}): Promise<IDynamicLinkResponse | null> {
    const { autoOpenFallback = true } = options;
    const shortCode = extractShortCode(url);
    if (!shortCode) return null;

    const data = await fetchDynamicLink(shortCode);
    // auto-open fallback if required
    let fallbackUrl: string | null = null;
    if (Platform.OS === "android") {
        fallbackUrl = data.androidFallbackUrl;
    } else if (Platform.OS === "ios") {
        fallbackUrl = data.iosFallbackUrl;
    } else {
        fallbackUrl = data.desktopFallbackUrl;
    }

    if (fallbackUrl && autoOpenFallback) {
        try {
            await Linking.openURL(fallbackUrl);
        } catch {
            console.warn("Failed to open fallback URL");
        }
    }

    return data;
}


export function normalizeResponse(apiResponse: any): IDynamicLinkResponse {
    return {
        title: apiResponse.title,
        description: apiResponse.description,
        longUrl: apiResponse.long_url,
        androidFallbackUrl: apiResponse.android_fallback_url,
        iosFallbackUrl: apiResponse.ios_fallback_url,
        desktopFallbackUrl: apiResponse.desktop_fallback_url,
        customParams: Object.fromEntries((apiResponse.custom_params || []).map((c: any) => [c.key, c.value])),
        customDomain: apiResponse.custom_domain,
        shortCode: apiResponse.short_code,
    };
}


export async function fetchDynamicLink(shortCode: string): Promise<IDynamicLinkResponse> {

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);

    try {
        const base = getApiBaseUrl();
        const res = await fetch(`${base}/${encodeURIComponent(shortCode)}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        const data = await res.json();
        return normalizeResponse(data);
    } finally {
        clearTimeout(id);
    }
}


export function extractShortCode(url: string): string | null {

    try {
        // Remove query/hash and trailing slashes
        const clean = url.split('#')[0].split('?')[0].replace(/\/+$/, '');
        const parts = clean.split('/');
        const last = parts[parts.length - 1];
        return last || null;
    } catch {
        return null;
    }
}

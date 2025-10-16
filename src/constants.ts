// Default backend URL. Consumers can override at runtime using setApiBaseUrl().

export const DEFAULT_API_BASE_URL = "https://backend-dynamiclink.tecocraft.us/api/links/code";

let apiBaseUrl = DEFAULT_API_BASE_URL;

export function setApiBaseUrl(url: string) {
    if (typeof url !== 'string' || !url.trim()) return;
    apiBaseUrl = url.trim();
}

export function getApiBaseUrl(): string {
    return apiBaseUrl;
}
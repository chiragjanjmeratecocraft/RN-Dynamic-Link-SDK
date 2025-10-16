export interface IDynamicLinkResponse {
    title: string;
    description: string;
    longUrl: string;
    androidFallbackUrl: string;
    iosFallbackUrl: string;
    desktopFallbackUrl: string;
    customParams: Record<string, string>;
    customDomain: string | null;
    shortCode: string;
}


export interface ISmartLinkingOptions {
    onSuccess?: (data: IDynamicLinkResponse) => void;
    onError?: (error: Error) => void;
    onFallback?: (url: string) => void;
    onUrl?: (url: string) => void;
    autoOpenFallback?: boolean;
}


export interface IResolveOptions {
    autoOpenFallback?: boolean;
}
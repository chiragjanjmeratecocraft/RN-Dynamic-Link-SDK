import { useEffect } from "react";
import { ISmartLinkingOptions } from "./types";
import { extractShortCode, fetchDynamicLink } from "./utils";
import { Linking, Platform } from "react-native";

export function useSmartLinking(options: ISmartLinkingOptions = {}) {
    const {
        onSuccess,
        onError,
        onFallback,
        onUrl,
        autoOpenFallback = true,
    } = options;

    useEffect(() => {
        async function handleUrl(url: string) {
            onUrl?.(url);
            const shortCode = extractShortCode(url);
            if (!shortCode) return;

            try {
                const data = await fetchDynamicLink(shortCode);
                onSuccess?.(data);

                // fallback handling
                let fallbackUrl: string | null = null;
                if (Platform.OS === "android") {
                    fallbackUrl = data.androidFallbackUrl;
                } else if (Platform.OS === "ios") {
                    fallbackUrl = data.iosFallbackUrl;
                } else {
                    fallbackUrl = data.desktopFallbackUrl;
                }

                if (fallbackUrl) {
                    onFallback?.(fallbackUrl);
                    if (autoOpenFallback) {
                        await Linking.openURL(fallbackUrl).catch(() => {
                            onError?.(new Error("Failed to open fallback URL"));
                        });
                    }
                }
            } catch (err) {
                onError?.(err as Error);
            }
        }

        // Initial link
        Linking.getInitialURL().then((url) => {
            if (url) handleUrl(url);
        });

        // Subsequent links
        const sub = Linking.addEventListener("url", ({ url }) => {
            handleUrl(url);
        });

        return () => sub.remove();

    }, [onSuccess, onError, onFallback, onUrl, autoOpenFallback]);
}

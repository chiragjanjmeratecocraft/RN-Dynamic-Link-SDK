import { useEffect } from "react";
import { ISmartLinkingOptions } from "./types";
import { extractShortCode, fetchDynamicLink, firstLaunchDynamicLinkCheck } from "./utils";
import { Linking } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "./constants";

export function useSmartLinking(options: ISmartLinkingOptions = {}) {
    const {
        onSuccess,
        onError,
        onFallback,
        onUrl
    } = options;

    useEffect(() => {
        (async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LAUNCHED);
                if (hasLaunched !== null) return;
                await AsyncStorage.setItem(STORAGE_KEYS.HAS_LAUNCHED, 'true');
                const data = await firstLaunchDynamicLinkCheck();
                if (data && onSuccess) onSuccess(data);
            } catch (err) {
                onError && onError(err as Error);
            }
        })();
    },[onSuccess, onError]);

    useEffect(() => {
        async function handleUrl(url: string) {
            onUrl?.(url);
            const shortCode = extractShortCode(url);
            if (!shortCode) return;

            try {
                const data = await fetchDynamicLink(shortCode);
                onSuccess?.(data);
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

    }, [onSuccess, onError, onFallback, onUrl]);
}

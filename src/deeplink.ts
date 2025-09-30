import { Linking } from 'react-native';

export type DeeplinkListener = (url: string) => void;

/**
 * Lightweight wrapper over React Native Linking to provide a simple API.
 */

export const Deeplink = {
    /**
     * Adds a listener for deep link events.
     * Returns an unsubscribe function.
     */
    addListener(callback: DeeplinkListener): () => void {
        // RN 0.71+ returns subscription with remove()
        const subscription = Linking.addEventListener('url', ({ url }) => {
            try {
                callback(url);
            } catch {
                // Swallow listener errors to avoid crashing
            }
        });

        return () => {
            // New API: subscription.remove exists
            // Older RN: addEventListener returns EmitterSubscription
            // which also has remove().
            // @ts-ignore - both shapes provide remove
            subscription?.remove?.();
        };
    },

    /**
     * Gets the URL that initially launched the app, if any.
     */
    async getInitialURL(): Promise<string | null> {
        try {
            return await Linking.getInitialURL();
        } catch {
            return null;
        }
    },
};

import { useEffect } from 'react';
import { InstallReferrerResult, ISmartLinkingOptions } from './types';
import { extractShortCode, fetchDynamicLink } from './utils';
import { Linking } from 'react-native';
import RNDynamicLinking from './specs/NativeRNDynamicLinkingSpec';

export function useSmartLinking(options: ISmartLinkingOptions = {}) {
  const { onSuccess, onError, onFallback, onUrl } = options;

  useEffect(() => {
    (() => {
      RNDynamicLinking.getInstallReferrer()
      .then((result : InstallReferrerResult) => {
        console.log("RNDynamicLinking", result);
      })
      .catch((err) => {
        console.warn('Install referrer failed:', err);
      });
    })();
  }, []);

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
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => sub.remove();
  }, [onSuccess, onError, onFallback, onUrl]);
}

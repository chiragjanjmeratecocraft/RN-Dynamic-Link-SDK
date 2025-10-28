import { useEffect } from 'react';
import type { ISmartLinkingOptions } from './types/common';
import { extractShortCode, fetchDynamicLink } from './utils';
import { Linking, Platform } from 'react-native';
import type { InstallReferrerResult, RNDynamicLinkingNativeModule } from './types/native';
import { NativeModules } from 'react-native';

const { RNDynamicLinking } = NativeModules as {
  RNDynamicLinking: RNDynamicLinkingNativeModule;
};

export function useSmartLinking(options: ISmartLinkingOptions = {}) {
  const { onSuccess, onError, onFallback, onUrl } = options;

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    (() => {
      RNDynamicLinking?.getInstallReferrer()
        .then((result: InstallReferrerResult) => {
          console.log('RNDynamicLinking', result);
        })
        .catch((err: any) => {
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

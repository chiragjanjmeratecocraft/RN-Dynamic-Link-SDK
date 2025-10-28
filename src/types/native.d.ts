import { Promise } from 'react-native';

export interface RNDynamicLinkingNativeModule {
  getReferralCode(): Promise<string | null>;
}

import { Promise } from 'react-native';

export interface InstallReferrerResult {
  raw: string;
  utmCampaign?: string;
}

export interface RNDynamicLinkingNativeModule {
  getInstallReferrer(): Promise<InstallReferrerResult>;
}

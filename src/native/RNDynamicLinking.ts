import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { InstallReferrerResult } from '../types';

export interface Spec extends TurboModule {
  getInstallReferrer(): Promise<InstallReferrerResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RNDynamicLinking');

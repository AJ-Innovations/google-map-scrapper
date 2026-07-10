import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xscrapper.dashboard',
  appName: 'XScrapper',
  webDir: 'out',
  server: {
    cleartext: true
  }
};

export default config;

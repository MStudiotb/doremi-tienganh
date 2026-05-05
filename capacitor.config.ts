import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mstudiotb.doremi',
  appName: 'DOREMI - TIẾNG ANH',
  webDir: 'out',
  server: {
    url: 'https://doremi-tienganh.vercel.app',
    cleartext: true
  }
};

export default config;

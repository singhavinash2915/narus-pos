import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.narusbiryani.pos',
  appName: "NARU's POS",
  webDir: 'dist',
  // Important: Capacitor serves the web app from local files, so the
  // Vite `base: '/narus-pos/'` setting (used for GitHub Pages) does NOT
  // apply here. We override it at build time in the cap-build script.
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#f97316',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#f97316',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'native',
      style: 'light',
      resizeOnFullScreen: true,
    },
  },
}

export default config

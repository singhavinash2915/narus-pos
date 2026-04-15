import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard } from '@capacitor/keyboard'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform() // 'ios' | 'android' | 'web'

/**
 * Initialize native plugins. Safe to call on web — all calls are no-ops.
 * Run this once at app boot (in main.tsx).
 */
export async function initNative() {
  if (!isNative) return

  try {
    // Status bar: orange brand background, dark icons (light style = white icons)
    await StatusBar.setStyle({ style: Style.Dark })
    if (platform === 'android') {
      await StatusBar.setBackgroundColor({ color: '#f97316' })
    }
    await StatusBar.setOverlaysWebView({ overlay: false })
  } catch (e) {
    console.warn('StatusBar init failed', e)
  }

  try {
    // Hide splash after web app is ready
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch (e) {
    console.warn('SplashScreen hide failed', e)
  }

  try {
    // Auto-scroll inputs into view when keyboard opens
    await Keyboard.setResizeMode({ mode: 'native' as any })
  } catch (e) {
    // Plugin might not be available on all platforms
  }
}

/**
 * Trigger a light haptic on user actions (button taps, item adds).
 * No-op on web.
 */
export async function hapticLight() {
  if (!isNative) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {}
}

export async function hapticMedium() {
  if (!isNative) return
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch {}
}

export async function hapticHeavy() {
  if (!isNative) return
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy })
  } catch {}
}

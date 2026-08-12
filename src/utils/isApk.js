export function isApkRuntime() {
  if (typeof window === 'undefined') return false

  try {
    // 1) Explicit JS flag injected by the APK WebView (preferred)
    if (window.__BORADEAI_APK__ === true) return true

    // 2) Local storage flag the APK can set once
    const ls = window.localStorage?.getItem?.('boradeai_apk')
    if (ls === '1' || ls === 'true') return true

    // 3) User-agent token appended by the APK WebView
    const ua = window.navigator?.userAgent || ''
    if (/boradeai-apk/i.test(ua)) return true
    if (/\bboradeai\b/i.test(ua)) return true
  } catch {
    // ignore
  }

  return false
}


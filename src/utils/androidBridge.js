// src/utils/androidBridge.js
// ─────────────────────────────────────────────────────────────────────────────
// Bridges the Android WebView (window.AndroidBridge) with your Redux RTK setup.
// Drop this file into your project and follow the 3 integration steps below.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when the app is running inside the Android WebView */
export const isAndroid = () => typeof window !== 'undefined' && !!window.AndroidBridge


// ─── Write helpers (called after successful auth) ────────────────────────────

/**
 * Saves accessToken + user to Android SharedPreferences.
 * Call this inside every onQueryStarted that dispatches setAuth().
 *
 * @param {string} accessToken  - data.accessToken from your API
 * @param {object} user         - decryptedUser object
 */
export const androidSaveAuth = (accessToken, user) => {
  if (!isAndroid()) return
  try {
    window.AndroidBridge.saveToken(accessToken)
    window.AndroidBridge.saveUser(JSON.stringify(user))
  } catch (e) {
    console.warn('[AndroidBridge] saveAuth failed', e)
  }
}

/**
 * Clears all auth from Android SharedPreferences + cookies.
 * Call this inside your logOut onQueryStarted and clearAuth reducer.
 */
export const androidClearAuth = () => {
  if (!isAndroid()) return
  try {
    window.AndroidBridge.clearAuth()
  } catch (e) {
    console.warn('[AndroidBridge] clearAuth failed', e)
  }
}

// ─── Read helpers (called on app startup) ────────────────────────────────────

/**
 * Returns { accessToken, user } from Android storage, or null if not found.
 * Use this in your App.js / store to re-hydrate Redux on cold start.
 */
export const androidGetAuth = () => {
  if (!isAndroid()) return null
  try {
    const accessToken = window.AndroidBridge.getToken()
    if (!accessToken) return null
    const userStr = window.AndroidBridge.getUser()
    const user = userStr && userStr !== 'null' ? JSON.parse(userStr) : null
    return { accessToken, user }
  } catch (e) {
    console.warn('[AndroidBridge] getAuth failed', e)
    return null
  }
}

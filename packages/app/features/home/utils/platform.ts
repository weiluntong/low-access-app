/**
 * Platform detection utilities for distinguishing between Tauri desktop app and web browser
 */

/**
 * Detects if the current environment is a Tauri desktop application
 * Uses Tauri-specific APIs which are only present in the Tauri runtime
 */
export const detectPlatform = () => {
  if (typeof window === 'undefined') {
    return { isTauriApp: false }
  }

  // Check for Tauri-specific APIs/globals - the ONLY reliable way to detect Tauri
  // These are present in both dev and production Tauri builds
  const isTauriApp = (window as any).__TAURI__ !== undefined ||
    (window as any).__TAURI_METADATA__ !== undefined ||
    (window as any).__TAURI_INTERNALS__ !== undefined

  return { isTauriApp }
}
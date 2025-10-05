/**
 * auth.ts
 * Wrapper around expo-local-authentication so the rest of app can call requireAuth()
 * Exports:
 *  - isAuthAvailable(): boolean (true if PIN/pattern OR biometric is enrolled)
 *  - requireAuth(): Prompts auth and returns boolean
 *
 *  NOTE: We also export isBiometricAvailable() as a backwards-compatible alias
 *  that simply calls isAuthAvailable(), so older imports won't break.
 */

import * as LocalAuthentication from "expo-local-authentication";

/**
 * Return true if *any* device auth exists (PIN/pattern OR biometric).
 * Levels:
 *  - NONE = 0
 *  - SECRET = 1 (PIN/Pattern/Passcode)
 *  - BIOMETRIC = 2 (Fingerprint/Face)
 */
export async function isAuthAvailable(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return (
      level === LocalAuthentication.SecurityLevel.SECRET ||
      level === LocalAuthentication.SecurityLevel.BIOMETRIC
    );
  } catch (err) {
    console.warn("isAuthAvailable error", err);
    return false;
  }
}

/**
 * Back-compat alias (some files may still import this name).
 * We intentionally treat device credentials as "available" too.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  return isAuthAvailable();
}

/**
 * Request authentication. Returns true if authenticated.
 * Caller should handle UI for failure (e.g., show toast).
 */
export async function requireAuth(
  promptMessage = "Authenticate to proceed"
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      // iOS: allow device passcode fallback. Android sheet already includes it.
      disableDeviceFallback: false,
      fallbackLabel: "Use device passcode",
    });
    return !!result.success;
  } catch (err) {
    console.warn("Authentication error", err);
    return false;
  }
}
/**
 * auth.ts
 * Small wrapper around expo-local-authentication so the rest of app can call requireAuth()
 * Exports:
 *  - requireAuth(): Prompts biometric auth and returns boolean
 *  - isBiometricAvailable(): boolean
 */

import * as LocalAuthentication from "expo-local-authentication";

/**
 * Check if biometric (or device) authentication is possible and enrolled.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  try {
    // Some devices may not report biometric hardware but still have a device
    // passcode / keyguard set. Treat the device as "auth available" when
    // the system reports any enrollment (biometric or passcode).
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return !!isEnrolled;
  } catch (err) {
    console.warn("isBiometricAvailable error", err);
    return false;
  }
}

/**
 * Request authentication. Returns true if authenticated.
 * Caller should handle the UI for failure (e.g. show toast).
 */
export async function requireAuth(
  promptMessage = "Authenticate to proceed"
): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: "Use device passcode",
      disableDeviceFallback: false,
    });
    return !!result.success;
  } catch (err) {
    console.warn("Authentication error", err);
    return false;
  }
}

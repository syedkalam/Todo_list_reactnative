/**
 * auth.test.ts
 * Unit test for auth wrapper: we mock expo-local-authentication
 */

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  authenticateAsync: jest.fn(async () => ({ success: true })),
}));

import * as LocalAuthentication from 'expo-local-authentication';
import { isBiometricAvailable, requireAuth } from '../src/services/auth';

test('biometric available', async () => {
  const ok = await isBiometricAvailable();
  expect(ok).toBe(true);
});

test('requireAuth success', async () => {
  const r = await requireAuth('Test');
  expect(r).toBe(true);
  expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled();
});

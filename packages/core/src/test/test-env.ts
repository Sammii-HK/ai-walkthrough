/**
 * Test Environment Utilities
 * Detects test mode and determines if mocks should be used
 */

/**
 * Check if running in test mode
 */
export function isTestMode(): boolean {
  return (
    process.env.NODE_ENV === 'test' ||
    process.env.NODE_ENV === 'testing' ||
    process.env.USE_MOCKS === 'true' ||
    process.env.VITEST === 'true'
  );
}

/**
 * Determine if mocks should be used
 */
export function useMocks(): boolean {
  return isTestMode() || process.env.USE_MOCKS === 'true';
}

/**
 * Get mock configuration
 */
export function getMockConfig(): {
  useMocks: boolean;
  mockDelay: number;
  mockFailRate: number;
} {
  return {
    useMocks: useMocks(),
    mockDelay: parseInt(process.env.MOCK_DELAY || '50', 10),
    mockFailRate: parseFloat(process.env.MOCK_FAIL_RATE || '0'),
  };
}

/**
 * Check if should simulate errors
 */
export function shouldSimulateError(failRate?: number): boolean {
  const config = getMockConfig();
  const rate = failRate ?? config.mockFailRate;
  return rate > 0 && Math.random() < rate;
}


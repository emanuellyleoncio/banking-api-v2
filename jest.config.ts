import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/env.ts', '<rootDir>/tests/setup.ts'],
  testMatch: ['**/tests/**/*.test.ts'],
  forceExit: true,
  clearMocks: true,
  openHandlesTimeout: 5000,
};

export default config;

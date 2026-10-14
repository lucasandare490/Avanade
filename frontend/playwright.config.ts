import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  workers: 1,
  timeout: 45000,
  use: {
    baseURL: process.env.E2E_URL || 'http://127.0.0.1:5173',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    locale: 'pt-BR',
    timezoneId: 'America/Recife',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  reporter: [['list'], ['json', { outputFile: 'test-results/integracao.json' }]],
});

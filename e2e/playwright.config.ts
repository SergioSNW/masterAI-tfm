import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://172.31.14.232:3001',
    viewport: { width: 1440, height: 900 },
    headless: true,
  },
  webServer: {
    command: 'npm run dev -w apps/web',
    port: 3001,
    reuseExistingServer: true,
  },
})

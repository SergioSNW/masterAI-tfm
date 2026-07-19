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
    command: 'npx vite --port 3001 --host 0.0.0.0',
    port: 3001,
    cwd: 'apps/web',
    reuseExistingServer: true,
  },
})

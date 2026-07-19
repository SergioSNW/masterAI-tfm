import { defineConfig } from '@playwright/test'

const baseURL = process.env.BASE_URL || 'http://172.31.14.232:3001'

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    headless: true,
  },
  webServer: process.env.NO_WEB_SERVER ? undefined : {
    command: 'npx vite --port 3001 --host 0.0.0.0',
    port: 3001,
    cwd: 'apps/web',
    reuseExistingServer: true,
  },
})

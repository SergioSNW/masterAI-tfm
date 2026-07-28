import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Core flow — Director Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('sidebar navigation: projects → actors → docs → help → settings', async ({ page }) => {
    await expect(page.locator('.logo')).toHaveText('MasterAI')
    await expect(page.getByText('Director Dashboard')).toBeVisible()

    await page.getByText('Actors').click()
    await expect(page.getByRole('heading', { name: 'Actors', exact: true })).toBeVisible()

    await page.getByText('Docs').click()
    await expect(page.getByRole('heading', { name: /documentation/i })).toBeVisible()

    await page.getByText('Help').click()
    await expect(page.getByRole('heading', { name: /director guide/i })).toBeVisible()

    await page.getByText('Settings').first().click()
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()

    await page.getByText('Projects').click()
    await expect(page.getByText('The Crown')).toBeVisible()
  })

  test('projects view lists all projects', async ({ page }) => {
    await expect(page.getByText('The Crown — Season 3')).toBeVisible()
    await expect(page.getByText('Breaking Bad — Season 2')).toBeVisible()
    await expect(page.getByText('Stranger Things — Season 5')).toBeVisible()
  })

  test('clicking a project opens its detail view', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await expect(page.getByRole('heading', { name: /the crown — season 3/i })).toBeVisible()
    await expect(page.getByText('Lady Victoria')).toBeVisible()
    await expect(page.getByText('Margaret')).toBeVisible()
  })

  test('navigates into a casting detail view', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await expect(page.getByRole('heading', { name: /lady victoria/i })).toBeVisible()
    await expect(page.getByText('British accent')).toBeVisible()
  })

  test('navigates into a round detail view', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Self-Tape Submission').click()
    await expect(page.getByRole('heading', { name: /self-tape submission/i })).toBeVisible()
    await expect(page.getByText('Emma Richardson')).toBeVisible()
    await expect(page.getByText('James Whitfield')).toBeVisible()
  })

  test('opening review modal shows submission details', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Self-Tape Submission').click()

    await page.getByText('Emma Richardson').click()
    await expect(page.getByText('emma.r@example.com').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /shortlist/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /mark reviewed/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible()
  })

  test('round stats bar shows correct counts', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Self-Tape Submission').click()

    await expect(page.getByText('Total').locator('..').getByText('4')).toBeVisible()
    await expect(page.getByText('Pending').locator('..').getByText('2').first()).toBeVisible()
    await expect(page.getByText('Shortlisted').locator('..').getByText('1').first()).toBeVisible()
  })
})

test.describe('Attachments — Director uploads documents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Self-Tape Submission').click()
  })

  test('shows attachments section with drop zone on open round', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /attachments/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /upload file/i })).toBeVisible()
    await expect(page.getByText(/drag.*drop/i)).toBeVisible()
    await expect(page.getByText(/no attachments yet/i)).toBeVisible()
  })

  test('uploading a file via file picker adds it to the attachment list', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser')
    await page.getByRole('button', { name: /upload file/i }).click()
    const fileChooser = await fileChooserPromise
    await fileChooser.setFiles({
      name: 'casting-sides.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fake-pdf-content'),
    })

    await expect(page.getByText('casting-sides.pdf')).toBeVisible()
    await expect(page.getByText(/KB/)).toBeVisible()
  })

  test('hides drop zone on closed round', async ({ page }) => {
    await page.goto('/')
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Callback — In-Person').click()

    await expect(page.getByRole('heading', { name: /attachments/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /upload file/i })).not.toBeVisible()
  })
})

test.describe('Actors view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#actors')
  })

  test('creates a new actor via modal', async ({ page }) => {
    await page.getByRole('button', { name: /new actor/i }).click()
    await expect(page.getByRole('heading', { name: /new actor/i })).toBeVisible()

    await page.locator('input[name="name"]').fill('Test Actor')
    await page.locator('input[name="email"]').fill('test@playwright.com')
    await page.getByRole('button', { name: /create actor/i }).click()

    await expect(page.getByText('Test Actor')).toBeVisible()
  })
})

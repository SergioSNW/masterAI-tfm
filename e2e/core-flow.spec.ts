import { test, expect } from '@playwright/test'

test.describe('Core flow — Director Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('sidebar navigation: projects → actors → docs → help → settings', async ({ page }) => {
    await expect(page.locator('.logo')).toHaveText('MasterAI')
    await expect(page.getByText('Director Dashboard')).toBeVisible()

    await page.getByText('Actors').click()
    await expect(page.getByRole('heading', { name: /actors/i })).toBeVisible()

    await page.getByText('Docs').click()
    await expect(page.getByRole('heading', { name: /documentation/i })).toBeVisible()

    await page.getByText('Help').click()
    await expect(page.getByRole('heading', { name: /director guide/i })).toBeVisible()

    await page.getByText('Settings').click()
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
    await expect(page.getByText('emma.r@example.com')).toBeVisible()
    await expect(page.getByRole('button', { name: /shortlist/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /mark reviewed/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /reject/i })).toBeVisible()
  })

  test('round stats bar shows correct counts', async ({ page }) => {
    await page.getByText('The Crown — Season 3').click()
    await page.getByText('Lady Victoria').click()
    await page.getByText('Self-Tape Submission').click()

    await expect(page.getByText('Total').locator('..').getByText('4')).toBeVisible()
    await expect(page.getByText('Pending').locator('..').getByText('2')).toBeVisible()
    await expect(page.getByText('Shortlisted').locator('..').getByText('1')).toBeVisible()
  })
})

test.describe('Actors view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#actors')
  })

  test('creates a new actor via modal', async ({ page }) => {
    await page.getByRole('button', { name: /new actor/i }).click()
    await expect(page.getByRole('heading', { name: /new actor/i })).toBeVisible()

    await page.getByPlaceholder(/name/i).fill('Test Actor')
    await page.getByPlaceholder(/email/i).fill('test@playwright.com')
    await page.getByRole('button', { name: /create actor/i }).click()

    await expect(page.getByText('Test Actor')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test';

test('full UI flow: register, login, create workflow, run, view run details', async ({ page }) => {
  const frontend = process.env.E2E_FRONTEND || 'http://localhost:5173';
  const backend = process.env.E2E_BASE_URL || 'http://localhost:5000';

  // Go to frontend
  await page.goto(frontend);

  // Wait for app to load and show login/register links
  await expect(page.locator('text=Login').first()).toBeVisible({ timeout: 10000 });

  // Open register (if present) or navigate to /register
  if (await page.locator('text=Register').count() > 0) {
    await page.click('text=Register');
  } else {
    await page.goto(`${frontend}/register`);
  }

  const email = `ui-${Date.now()}@example.com`;
  const password = 'Password123!';

  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password).catch(() => {});
  await page.click('button:has-text("Register")');

  // After register, app may redirect to login. Ensure we can login.
  await page.waitForTimeout(800);
  await page.goto(`${frontend}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button:has-text("Login")');

  // After login, expect to see workflows list
  await expect(page.locator('text=Workflows').first()).toBeVisible({ timeout: 10000 });

  // Create a new workflow
  await page.click('text=New Workflow').catch(()=>{});
  // Fallback: navigate to /workflows/new
  if (await page.locator('text=Create').count() === 0) {
    await page.goto(`${frontend}/workflows/new`);
  }

  // Fill name and create
  await page.fill('input[name="name"]', 'Playwright UI Workflow').catch(()=>{});
  await page.click('button:has-text("Create")').catch(()=>{});

  // Wait for builder and ensure Run Workflow button exists
  await expect(page.locator('text=Run Workflow').first()).toBeVisible({ timeout: 10000 });

  // Add a Text node via palette
  await page.click('text=Palette').catch(()=>{});
  await page.click('button:has-text("Text")').catch(()=>{});

  // Click Run Workflow
  await page.click('text=Run Workflow');

  // Open Run History
  await page.click('text=Run History');

  // Expect at least one run item and open details
  const runButton = page.locator('button:has-text("View details")').first();
  await expect(runButton).toBeVisible({ timeout: 15000 });
  await runButton.click();

  // Expect run details modal to show Status
  await expect(page.locator('text=Status').first()).toBeVisible({ timeout: 15000 });

  // Basic assertion: backend API reachable
  const resp = await page.request.get(`${backend}/api/workflows`);
  expect(resp.ok()).toBeTruthy();
});

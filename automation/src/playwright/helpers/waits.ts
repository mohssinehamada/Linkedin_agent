import { Page } from 'playwright';

export async function waitForIdle(page: Page, timeout = 15000) {
  await page.waitForLoadState('domcontentloaded', { timeout });
  await page.waitForLoadState('networkidle', { timeout });
}

export async function waitVisible(page: Page, selector: string, timeout = 10000) {
  await page.locator(selector).waitFor({ state: 'visible', timeout });
}



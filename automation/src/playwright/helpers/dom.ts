import { Page } from 'playwright';

export async function extractText(page: Page, selector: string) {
  const el = page.locator(selector).first();
  await el.waitFor({ state: 'visible', timeout: 10000 });
  return (await el.textContent())?.trim() || '';
}



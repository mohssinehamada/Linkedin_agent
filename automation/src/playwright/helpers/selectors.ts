import { Page, Locator } from 'playwright';

export function byLabel(page: Page, label: string): Locator {
  return page.getByLabel(label, { exact: false });
}

export function byRoleText(page: Page, role: Parameters<Page['getByRole']>[0], text: string): Locator {
  return page.getByRole(role, { name: new RegExp(text, 'i') });
}



import { Page } from 'playwright';

export async function uploadFile(page: Page, selectorOrLabel: string, filePath: string) {
  const input = selectorOrLabel.startsWith('#') || selectorOrLabel.startsWith('.')
    ? page.locator(selectorOrLabel)
    : page.getByLabel(selectorOrLabel, { exact: false });
  await input.setInputFiles(filePath);
}



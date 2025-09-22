import { Page } from 'playwright';

export async function fillByLabel(page: Page, label: string, value: string) {
  const input = page.getByLabel(label, { exact: false });
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(value);
}

export async function selectByText(page: Page, label: string, option: string) {
  const select = page.getByLabel(label, { exact: false });
  await select.waitFor({ state: 'visible', timeout: 10000 });
  await select.selectOption({ label: option });
}

export async function upload(page: Page, label: string, filePath: string) {
  const input = page.getByLabel(label, { exact: false });
  await input.setInputFiles(filePath);
}

export async function answerYesNo(page: Page, label: string, yes: boolean) {
  const choice = yes ? 'Yes' : 'No';
  await page.getByLabel(label, { exact: false }).getByText(choice, { exact: false }).click();
}



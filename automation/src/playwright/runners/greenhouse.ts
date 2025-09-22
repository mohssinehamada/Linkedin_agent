import { chromium } from 'playwright';
import { waitForIdle } from '../helpers/waits';
import { artifacts } from '@jobagent/observability';

type Job = { url: string; title: string; company: string };

export async function apply(opts: {
  job: Job;
  resumePath: string;
  coverLetterPath?: string;
  answers?: Record<string, string>;
}) {
  const headless = process.env.PLAYWRIGHT_HEADLESS !== 'false';
  const browser = await chromium.launch({ headless });
  const ctx = await browser.newContext({ locale: process.env.USER_LOCALE || 'en-US' });
  const page = await ctx.newPage();
  try {
    const runDir = artifacts.createRunDir('greenhouse');
    await artifacts.startTracing(ctx);
    await page.goto(opts.job.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForIdle(page, 20000);
    // placeholder: in real impl, navigate to apply iframe/page and fill
    const shot = await artifacts.saveScreenshot(page, runDir, 'open');
    const html = await artifacts.saveHtml(page, runDir, 'open');
    await artifacts.appendStepLog(runDir, 'open', { url: opts.job.url });
    const trace = await artifacts.stopTracing(ctx, runDir);
    return { status: 'queued', confirmationId: undefined, artifacts: [shot, html, trace], runDir };
  } finally {
    await ctx.close();
    await browser.close();
  }
}



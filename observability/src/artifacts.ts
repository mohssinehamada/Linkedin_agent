import fs from "node:fs";
import path from "node:path";

export function getArtifactsBaseDir() {
  return process.env.ARTIFACTS_DIR || path.resolve(process.cwd(), "artifacts");
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function createRunDir(prefix = "run") {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = getArtifactsBaseDir();
  const dir = path.join(base, `${prefix}-${stamp}`);
  ensureDir(dir);
  return dir;
}

export async function saveHtml(page: { content: () => Promise<string> }, dir: string, step: string) {
  ensureDir(dir);
  const html = await page.content();
  const file = path.join(dir, `dom_${step}.html`);
  fs.writeFileSync(file, html, "utf-8");
  return file;
}

export async function saveScreenshot(page: { screenshot: (opts: any) => Promise<Buffer> }, dir: string, step: string) {
  ensureDir(dir);
  const file = path.join(dir, `screen_${step}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

export async function startTracing(ctx: any) {
  // Playwright BrowserContext
  await ctx.tracing.start({ screenshots: true, snapshots: true, sources: false });
}

export async function stopTracing(ctx: any, dir: string) {
  const file = path.join(dir, `trace.zip`);
  await ctx.tracing.stop({ path: file });
  return file;
}

export function appendStepLog(dir: string, event: string, data: unknown) {
  ensureDir(dir);
  const file = path.join(dir, `steps.log.ndjson`);
  const line = JSON.stringify({ ts: Date.now(), event, data }) + "\n";
  fs.appendFileSync(file, line, "utf-8");
  return file;
}



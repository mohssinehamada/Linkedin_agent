import fs from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { run: string; file: string } }) {
  const base = process.env.ARTIFACTS_DIR || path.resolve(process.cwd(), '../../artifacts');
  const runDir = path.resolve(base, params.run);
  const filePath = path.resolve(runDir, params.file);
  // Prevent path traversal: ensure requested file is inside the run directory
  if (!filePath.startsWith(runDir + path.sep)) return new NextResponse('Forbidden', { status: 403 });
  if (!fs.existsSync(filePath)) return new NextResponse('Not Found', { status: 404 });
  const stat = fs.statSync(filePath);
  const stream = fs.createReadStream(filePath);
  const headers = new Headers();
  headers.set('content-length', String(stat.size));
  if (filePath.endsWith('.png')) headers.set('content-type', 'image/png');
  else if (filePath.endsWith('.html')) headers.set('content-type', 'text/html; charset=utf-8');
  else if (filePath.endsWith('.zip')) headers.set('content-type', 'application/zip');
  else headers.set('content-type', 'text/plain; charset=utf-8');
  return new NextResponse(stream as any, { headers });
}


import fs from 'node:fs';
import path from 'node:path';

function getRunDir(run: string) {
  const base = process.env.ARTIFACTS_DIR || path.resolve(process.cwd(), '../../artifacts');
  return path.join(base, run);
}

export default function RunDetail({ params }: { params: { run: string } }) {
  const run = params.run;
  const dir = getRunDir(run);
  const exists = fs.existsSync(dir);
  const files = exists ? fs.readdirSync(dir).sort() : [];
  return (
    <main style={{ padding: 24 }}>
      <h1>Run: {run}</h1>
      {!exists ? (
        <p>Run not found.</p>
      ) : (
        <ul>
          {files.map((f) => (
            <li key={f}>
              <a href={`/runs/${encodeURIComponent(run)}/file/${encodeURIComponent(f)}`}>{f}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


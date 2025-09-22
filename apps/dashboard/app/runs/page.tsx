import fs from 'node:fs';
import path from 'node:path';

function listRuns() {
  const base = process.env.ARTIFACTS_DIR || path.resolve(process.cwd(), '../../artifacts');
  if (!fs.existsSync(base)) return [] as string[];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse();
}

export default function RunsPage() {
  const runs = listRuns();
  return (
    <main style={{ padding: 24 }}>
      <h1>Runs</h1>
      {runs.length === 0 ? (
        <p>No runs found. After running an automation, artifacts will appear here.</p>
      ) : (
        <ul>
          {runs.map((r) => (
            <li key={r}>
              <a href={`/runs/${encodeURIComponent(r)}`}>{r}</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}


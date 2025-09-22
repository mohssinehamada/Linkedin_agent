# Linkedin Job Search Agent

A multi-language monorepo to discover and apply to jobs programmatically, featuring:

- Python browser agent (LinkedIn job search and Easy Apply flows)
- TypeScript automation and ingestion utilities
- Next.js dashboard to inspect runs and manage settings

## Requirements

- macOS/Linux, Node.js 20+, Python 3.11+
- Chrome/Chromium installed
- API keys if using cloud LLMs (e.g., Google Gemini)

## Quick Start

1) Clone and bootstrap

```bash
git clone https://github.com/mohssinehamada/Linkedin_agent.git
cd Linkedin_agent
python3 -m venv .venv && source .venv/bin/activate
pip install -U pip
pip install -r python/requirements.txt
```

2) Optional: Install Playwright browsers (if you use Playwright elsewhere)

```bash
python -m playwright install
```

3) Env vars

Create a `.env` in the repo root with optional overrides:

```env
# Agent runtime
WAIT_FOR_LOGIN_MINUTES=10
MANUAL_CONTINUE=true
REQUIRE_APPROVAL=true

# Search targeting
TARGET_ROLE=Software Engineer
TARGET_LOCATION=Warsaw, Poland
APPLY_COUNT=3

# Application policy toggles
EASY_APPLY_ONLY=true
SKIP_EXTERNAL=true
MAX_PER_POSTING_MINUTES=3
MAX_RUN_MINUTES=20
HUMAN_APPROVAL_STAGES=final,external,screening
RANDOM_DELAY_MS=200-800

# Database (SQLite default)
DATABASE_URL=file:dev.db
```

## Running the agent

- Single URL mode:

```bash
python python/agent.py "https://www.linkedin.com/jobs/view/..."
```

- Batch file mode:

```bash
python python/agent.py --file urls.txt
```

- Search mode (no URL; uses env TARGET_ROLE, TARGET_LOCATION, APPLY_COUNT):

```bash
python python/agent.py --search
```

During Phase 1 (login), keep the browser open and complete LinkedIn login. If `MANUAL_CONTINUE=true`, press Enter in the terminal when ready.

## Safety and guardrails

- Agent pauses for approval at configurable stages (`HUMAN_APPROVAL_STAGES`)
- Respects ToS, stops on CAPTCHAs/blocks
- Skips external sites if `SKIP_EXTERNAL=true`
- Fills only required contact fields; optional screening is left blank by default

## Data persistence

The agent records applications to SQLite (default `dev.db`). You can inspect or migrate to a proper DB later via the `db/` package.

## Monorepo layout (high level)

- `python/` — Browser agent
- `automation/` — Runners, Playwright helpers, feed ingestion
- `apps/dashboard/` — Next.js dashboard (optional)
- `packages/agent-core/` — Shared TypeScript core for orchestrations
- `db/` — Prisma schema and helpers
- `observability/` — Basic logging and artifacts
- `shared/` — Shared TS utilities

## Development

Create a feature branch and open a PR:

```bash
git checkout -b feat/some-change
# commit edits
git push -u origin feat/some-change
```

## Notes

- This agent targets the LinkedIn UI and may require adjustments if selectors change.
- Prefer running with approval gates until you trust the flow.


import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from browser_use import Agent, ChatGoogle
import sqlite3
import tempfile
import uuid

load_dotenv()

DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "dev.db"
DATABASE_URL = os.getenv("DATABASE_URL") or f"file:{DEFAULT_DB_PATH}"


def record_application(job_url: str | None = None, status: str = "queued", confirmation_id: str | None = None):
    # Minimal SQLite insert into JobPost if missing, and an Application row (demo only)
    # Resolve DB path; if env points to a non-existent path, fallback to repo root dev.db
    configured_path = DATABASE_URL.replace("file:", "")
    db_path = configured_path
    if not os.path.exists(configured_path):
        db_path = str(DEFAULT_DB_PATH)
        print(f"[agent] DATABASE_URL not found at {configured_path}; falling back to {db_path}")
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS JobPost (id TEXT PRIMARY KEY, source TEXT, url TEXT UNIQUE, title TEXT, company TEXT, location TEXT, remote INTEGER, description TEXT, requirements TEXT, seniority TEXT, tags TEXT, salary TEXT, raw TEXT, discoveredAt TEXT, status TEXT)"
    )
    url_to_store = job_url or f"search://{uuid.uuid4()}"
    cur.execute(
        "INSERT OR IGNORE INTO JobPost (id, source, url, title, company, description, raw, status) VALUES (lower(hex(randomblob(16))), 'generic', ?, 'Unknown', 'Unknown', '', '{}', ?)",
        (url_to_store, status),
    )
    con.commit()
    con.close()


def load_candidate() -> dict | None:
    """Load the first CandidateProfile from SQLite and prepare a temp resume file if present."""
    configured_path = DATABASE_URL.replace("file:", "")
    db_path = configured_path if os.path.exists(configured_path) else str(DEFAULT_DB_PATH)
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute(
        "SELECT firstName, lastName, email, phone, location, linkedinUrl, portfolioUrl, resumeBytes FROM CandidateProfile ORDER BY createdAt DESC LIMIT 1"
    )
    row = cur.fetchone()
    con.close()
    if not row:
        return None
    first_name, last_name, email, phone, location, linkedin, portfolio, resume_bytes = row
    resume_path = None
    if resume_bytes:
        fd, path = tempfile.mkstemp(prefix="resume_", suffix=".pdf")
        with os.fdopen(fd, "wb") as f:
            f.write(resume_bytes)
        resume_path = path
    return {
        "firstName": first_name or "",
        "lastName": last_name or "",
        "email": email or "",
        "phone": phone or "",
        "location": location or "",
        "linkedinUrl": linkedin or "",
        "portfolioUrl": portfolio or "",
        "resumePath": resume_path,
    }

    # when you reach the linkedin feed page look for the  jobs button on the top press that 
    # then in fille in the title and location boxes that are located next to each other they are next to the linking loggo 
    # fille them with the information provided by the user  
    # after you did that you will find your self in the job postiong page look for an easy apply button and then select it its locatied on the top part of the page 
    # then start selection jobs 
    # if a job dose not have easy apply or apply go to the next job 
    # when pressing the easy apply button you will find your self in the application form page look for the required fields and fill them with the information provided by the user 
    # then press the submit button and you will find your self in the confirmation page look for the confirmation id and save it to the database 
    # then go to the next job 
    # if a job dose not have easy apply or apply go to the next job 
    # when pressing the easy apply button you will find your self in the application form page look for the required fields and fill them with the information provided by the user 
    # then press the submit button and you will find your self in the confirmation page look for the confirmation id and save it to the database 
    # then go to the next job 


async def run_apply(job_url: str | None = None):
    # Phase 1: open and wait for login
    wait_minutes = int(os.getenv("WAIT_FOR_LOGIN_MINUTES", "10"))
    if job_url:
        task1 = (
            f"Open {job_url}. If a login screen is shown, WAIT for the human to finish login. "
            f"Keep the browser open and periodically check for logged-in signals (feed, jobs tab). "
            f"Do NOT close the browser. Allow up to {wait_minutes} minutes for login."
        )
    else:
        task1 = (
            f"Open https://www.linkedin.com/ . If a login screen is shown, WAIT for the human to finish login. "
            f"Keep the browser open and periodically check for logged-in signals (feed, jobs tab). "
            f"Do NOT close the browser. Allow up to {wait_minutes} minutes for login."
        )
    agent_model = os.getenv("BROWSER_AGENT_MODEL", "gemini-1.5-flash-latest")
    agent1 = Agent(
        task=task1,
        llm=ChatGoogle(model=agent_model),
    )
    await agent1.run()

    # Optional manual gate to ensure user is ready
    if os.getenv("MANUAL_CONTINUE", "true").lower() in ("1", "true", "yes"): 
        try:
            input("[agent] Press Enter after you are fully logged in to continue to Jobs... ")
        except Exception:
            pass

    # Phase 2: navigate to Jobs and stop on first Easy Apply (no submission)
    role = os.getenv("TARGET_ROLE") or input("[agent] What job title/field should I search for? (e.g., Software Engineer): ") or "Software Engineer"
    location = os.getenv("TARGET_LOCATION") or input("[agent] Which country/city should I search in? (e.g., Poland or Warsaw): ") or "Poland, warsaw"
    profile = load_candidate() or {}
    apply_count = int(os.getenv("APPLY_COUNT", "1"))
    require_approval = os.getenv("REQUIRE_APPROVAL", "true").lower() in ("1", "true", "yes")
    approval_stages_env = os.getenv("HUMAN_APPROVAL_STAGES", "final")
    approval_stages = {s.strip().lower() for s in approval_stages_env.split(',') if s.strip()}
    easy_apply_only = os.getenv("EASY_APPLY_ONLY", "true").lower() in ("1", "true", "yes")
    skip_external = os.getenv("SKIP_EXTERNAL", "false").lower() in ("1", "true", "yes")
    max_per_posting_minutes = int(os.getenv("MAX_PER_POSTING_MINUTES", "3"))
    max_run_minutes = int(os.getenv("MAX_RUN_MINUTES", "20"))
    random_delay_ms = os.getenv("RANDOM_DELAY_MS", "200-800")
    # Approval guidance text
    approval_external = (
        "Before navigating to an external site, PAUSE and wait for human approval in the terminal."
        if require_approval and ("external" in approval_stages)
        else ""
    )
    approval_screening = (
        "Before submitting answers to REQUIRED screening questions, PAUSE and wait for human approval."
        if require_approval and ("screening" in approval_stages)
        else ""
    )
    approval_final = (
        "Before the FINAL submit click, PAUSE and wait for human approval in the terminal."
        if require_approval and ("final" in approval_stages or (not approval_stages))
        else "Proceed to submit if the form is ready."
    )
    resume_instruction = (
        f"Upload resume from '{profile.get('resumePath')}'. " if profile.get("resumePath") else ""
    )
    contact_text = (
        f"Use contact values: first name '{profile.get('firstName','')}', last name '{profile.get('lastName','')}', "
        f"email '{profile.get('email','')}', phone '{profile.get('phone','')}', location '{profile.get('location','')}'. "
    )
    if job_url:
        external_policy = (
            "If only an 'Apply' button (external site) exists, SKIP this posting and return."
            if skip_external else
            "If only an 'Apply' button (external site) exists, open it in the current tab and STOP on the first external application form screen for human review. Do not proceed further unless explicitly approved."
        )
        search_or_open_instructions = f"""
Stay on the current job posting page you opened earlier: {job_url}
- If an 'Easy Apply' button is present, click it and proceed with the application flow.
- {external_policy}
        """
    else:
        external_policy = (
            "If a posting has only an 'Apply' (external) button and SKIP_EXTERNAL=true, SKIP it and move to the next posting."
            if skip_external else
            "If a posting has only an 'Apply' (external) button, open it in the current tab and STOP on the first external application form screen for human review. Do not proceed further unless explicitly approved."
        )
        easy_apply_policy = (
            "If EASY_APPLY_ONLY=true and there is no 'Easy Apply' button, SKIP this posting."
            if easy_apply_only else
            "Prefer 'Easy Apply', but you may proceed with external if allowed."
        )
        search_or_open_instructions = f"""
Go to https://www.linkedin.com/ and ensure you are logged in.
- If a cookie banner appears, click a button labeled 'Accept', 'Accept all', 'Agree', or similar.
- If you are not already on Jobs, click the top navigation item 'Jobs' near the LinkedIn logo to open the jobs experience (https://www.linkedin.com/jobs/).

In the jobs header (the two inputs next to the LinkedIn logo):
- In the left input (job title), clear any text and type '{role}'.
- In the right input (location), clear any text and type '{location}'. If a dropdown appears, press Enter to select the FIRST suggestion.
- Press Enter to run the search and wait for results (e.g., a list like '#jobs-search-results-list').

Apply filters to increase success rate:
- Click the 'Easy Apply' filter if available (top of the page).
- Sort by 'Most recent' if a sort control exists.

From the results list, iterate postings top-down deterministically:
- Open a job card in the same tab or in the right-hand panel (prefer same tab).
- {easy_apply_policy}
- {external_policy}
- If neither an 'Easy Apply' nor an 'Apply' button is visible on a posting, SKIP it and move to the next posting.
Maintain a set of visited postings by title/company (or job id in the URL) and SKIP any posting you've already visited in this run.
After submit or skip, return to the results list (prefer closing modals or using the list panel rather than browser back) and continue with the next card. Avoid reopening postings you've already visited.
Stop when you have attempted {apply_count} postings or when total run time reaches {max_run_minutes} minutes.
Use a small random delay between actions of about {random_delay_ms}ms to reduce throttling.
If a required page or modal does not load within 20 seconds, back out and move on.
If an element is not visible, scroll it into view before clicking or typing.
Match buttons case-insensitively by visible text or aria-label (e.g., 'Easy Apply', 'Quick Apply'). If needed, match by data-test attributes when present.
        """
    
    task2 = f"""
{search_or_open_instructions}

For up to {apply_count} postings, repeat:
- Prefer 'Easy Apply' flows. If an 'Easy Apply' button is present, click it.
- {external_policy}

When inside an application form:
- Fill only REQUIRED fields. {contact_text}Match by visible labels/placeholders; do not guess values.
- If a phone number requires a country code, select the country code that matches the user's phone. If unclear, PAUSE and ask the human.
{resume_instruction}- If a resume upload is present, upload the resume.
- If the flow has multiple steps, click 'Next' until a 'Review' or 'Submit' step is shown.
- {approval_screening} If any REQUIRED screening questions appear that you cannot answer confidently, PAUSE and ask the human. Leave optional questions blank.
- Respect ToS. If a CAPTCHA, hard block, or suspicious challenge appears, STOP.
- If you spend more than {max_per_posting_minutes} minutes on any single posting without clear progress, back out and move to the next posting.
- {approval_external}
- Skip optional actions like 'Follow company', newsletter sign-ups, or calendar scheduling unless explicitly approved.
- After clicking the final submit, on the confirmation or review screen, look for any confirmation ID/reference number and include it in your final result text.
- {approval_final} Capture a screenshot and stop on the confirmation/review screen.
    """
    agent2 = Agent(
        task=task2,
        llm=ChatGoogle(model=agent_model),
    )
    await agent2.run()
    if job_url:
        record_application(job_url, status="queued")


async def run_apply_multi(job_urls: list[str]):
    for idx, url in enumerate(job_urls, start=1):
        print(f"[agent] Processing {idx}/{len(job_urls)}: {url}")
        try:
            await run_apply(url)
        except Exception as e:
            print(f"[agent] Error while processing {url}: {e}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage:\n  python agent.py <job_url>\n  python agent.py <job_url_1> <job_url_2> ...\n  python agent.py --file urls.txt\n  python agent.py --search  # use TARGET_ROLE, TARGET_LOCATION, APPLY_COUNT envs")
        raise SystemExit(1)

    # Batch by file
    if sys.argv[1] == "--file" and len(sys.argv) >= 3:
        file_path = sys.argv[2]
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            raise SystemExit(1)
        with open(file_path, "r", encoding="utf-8") as f:
            job_urls = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
        if not job_urls:
            print("No URLs found in file.")
            raise SystemExit(1)
        asyncio.run(run_apply_multi(job_urls))
        raise SystemExit(0)

    # Search mode (no explicit URL). Uses role/location envs and apply_count already in code.
    if sys.argv[1] == "--search":
        asyncio.run(run_apply(None))
        raise SystemExit(0)

    # Multiple URLs as positional args
    if len(sys.argv) > 2:
        urls = sys.argv[1:]
        asyncio.run(run_apply_multi(urls))
    else:
        asyncio.run(run_apply(sys.argv[1]))

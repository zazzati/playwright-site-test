# AGENT PROMPT: Playwright Monitoring Architecture Setup

## Context and Role
You are an expert Senior QA Automation Engineer and DevOps. Your task is to generate the code, configuration, and scripts necessary to create a website monitoring framework based on **Playwright** (Node.js/TypeScript).

## Architectural Requirements

### 1. Project Structure and Isolation
- Each monitored site must have its own isolated folder within a main `tests/` directory (e.g., `tests/site_a/`, `tests/site_b/`).
- The `playwright.config.ts` file must use the "Projects" feature to map each site to its specific folder.

### 2. Output Versioning
- For each execution (run), all results must be saved in a **new versioned folder**, ideally named with a timestamp (e.g., `test-results/run_YYYY-MM-DD_HH-MM-SS/`).
- The timestamp logic must be managed globally so that HTML reports, JSON reports, and artifact files (screenshots, traces) all end up in the same folder for that specific execution.

### 3. Output Formats and Visualization
- For each execution, Playwright must generate two types of reports within the versioned folder:
  1. **JSON Report**: Mandatory for subsequent data processing.
  2. **HTML Report**: Mandatory to allow a human to visually inspect the tests (outcomes, screenshots, traces).
- Provide instructions or a `package.json` script on how to serve and view the generated HTML report in a specific folder.

### 4. Email Alert System (Summary and Error Priority)
- A custom Node.js script (e.g., `alert-system.js`) must be created using `nodemailer`.
- The script must run *after* the test execution.
- It must read the JSON file generated in the current versioned folder.
- **Email body logic:** 
  - It must compile a total summary report (e.g., "Total executed: 10, Passed: 8, Failed: 2").
  - **Strict Requirement:** In case of failed tests, the error details (test name, site, and error message) must be placed **at the top of the email**, clearly highlighted. The list of passed tests will follow below.

## Tasks Required from the Agent
Generate the following files to build the architecture:

1. **`package.json`**: With all necessary dependencies (`@playwright/test`, `nodemailer`, etc.) and the start scripts (`npm run monitor`, `npm run report`).
2. **`playwright.config.ts`**: Configured in TypeScript with the separated projects, multiple reporters (JSON, HTML), and the logic for the dynamically versioned directory.
3. **Two simple example tests**: To be placed in the `tests/site_a/example.spec.ts` and `tests/site_b/example.spec.ts` folders to demonstrate isolation.
4. **`alert-system.js`**: The script that parses the JSON and sends the email following the error priority rules.
5. **`run-monitor.sh` (or `.js`)**: An "orchestrator" script that creates the timestamp (`RUN_ID`), starts the tests passing this environment variable, and upon test completion, starts the alert system.

## Acceptance Criteria
- The code must be clean, commented in Italian, and ready to be copy-pasted.
- Do not insert "sleep" statements in the tests; leverage Playwright's auto-waiting.
- Manage sensitive variables (email password, SMTP) via a `.env` file (use `dotenv`).

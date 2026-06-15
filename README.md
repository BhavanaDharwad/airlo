# Airalo Test Suite

End-to-end and API test suite for the Airalo Partner platform.

- **API tests** — Mocha + Chai + Supertest (`api/tests/`)
- **E2E tests** — Playwright (`playwright/e2e/`)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm (bundled with Node.js)

---

## Setup

### 1. Clone the repo

```bash
git clone <repo-url>
cd airalo
```

### 2. Install dependencies

```bash
npm install
```

> This includes `dotenv` (used by API tests to load `.env`). To install it separately: `npm install dotenv --save-dev`

### 3. Install Playwright browsers

```bash
npx playwright install
```

### 4. Configure environment variables

Create a `.env` file in the project root (never commit this file):

```
API_URL=https://partners-api.airalo.com/v2
BASE_URL=https://www.airalo.com
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
OAUTH_GRANT_TYPE=client_credentials
```

> Both API tests (`dotenv`) and Playwright tests (built-in auto-load, v1.45+) read from this file. `.env` is already listed in `.gitignore`.

---

## Running API Tests

API tests use **Mocha** with **Mochawesome** reporting.

### Run all API tests

```bash
npm run test:api
```

### Run API tests and open HTML report

```bash
npm run test:api:report
```

> On non-Mac systems use: `npm run test:api` then open `mochawesome-report/index.html` manually.

### Accessing the API test HTML report

Report is generated at:

```
mochawesome-report/index.html
```

Open in browser:

```bash
open mochawesome-report/index.html          # macOS
start mochawesome-report/index.html         # Windows
xdg-open mochawesome-report/index.html      # Linux
```

---

## Running Playwright E2E Tests

### Run all Playwright tests using npm scripts (headless — no UI)

```bash
npm run pw          # headless, uses playwright.config.ts
```

### Run Playwright tests using npm scripts with the interactive UI mode

```bash
npm run pw:ui       # interactive UI mode, uses playwright.config.ts
```

### Run a specific test file

```bash
npx playwright test playwright/e2e/search-japan.spec.ts
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
```

### Accessing the Playwright HTML report

Report is generated at:

```
playwright-report/index.html
```

Open automatically after a test run:

```bash
npx playwright show-report
```

Or open manually:

```bash
open playwright-report/index.html           # macOS
start playwright-report/index.html          # Windows
xdg-open playwright-report/index.html       # Linux
```

> The report includes video and trace files for failed tests (configured via `retain-on-failure`).

---

## Running All Tests

Run API tests followed by Playwright E2E tests in sequence:

```bash
npm test
```

---

## Project Structure

```
airalo/
├── api/
│   ├── fixtures/          # Test data (e.g. token-request.json)
│   ├── support/           # Client setup, helpers, global hooks
│   └── tests/             # Mocha spec files (*.spec.js)
│       ├── esims.spec.js
│       ├── orders.spec.js
│       └── packages.spec.js
├── playwright/
│   ├── e2e/               # Playwright test specs (*.spec.ts)
│   ├── support/pages/     # Page Object Models
│   └── reports/           # Additional report output
├── playwright-report/     # Playwright HTML report (auto-generated)
├── mochawesome-report/    # API test HTML report (auto-generated)
├── playwright.config.ts
├── .mocharc.cjs
├── .env                   # local only — not committed
└── package.json
```

---

## npm Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm run test:api` | `mocha` | Run API tests |
| `npm run test:api:report` | `mocha + open report` | Run API tests and open HTML report (macOS) |
| `npm run pw` | `playwright test --config=playwright.config.ts` | Run Playwright tests (headless, explicit config) |
| `npm run pw:ui` | `playwright test --config=playwright.config.ts --ui` | Run Playwright tests in interactive UI mode |
| `npm test` | `test:api && test:e2e` | Run all tests |


---

## GitHub Actions Workflows

Two workflows in `.github/workflows/`, both triggered manually via `workflow_dispatch`.

> To trigger either workflow: go to **Actions** tab in GitHub → select the workflow → click **Run workflow**.

---

## Test Implementation Overview

### API Tests (Mocha + Chai + Supertest)

**Shared approach:** A single OAuth2 token is fetched once per suite via `helpers.getAuthToken()` (using `CLIENT_ID`/`CLIENT_SECRET` from `.env`) and reused across all requests. Order creation and eSIM retrieval are wrapped in retry logic (3 attempts, 5s delay) to handle rate-limit (429) responses gracefully.

#### `packages.spec.js`

| Test | Approach |
|------|----------|
| `GET /packages returns 200` | Smoke test: authenticate → GET `/packages` → assert status `200` and response body contains `data` |
| `GET /packages filters by type=local` | Filter test: GET `/packages?type=local&page=1&limit=5` → assert `200` and `data` is an array |

#### `orders.spec.js`

A shared `before()` hook creates one order (`package_id: 'moshi-moshi-7days-1gb'`, `quantity: 6`) and stores the response for all three tests to share.

| Test | Approach |
|------|----------|
| `returns 200 with correct order fields` | Assert status `200`, and that `success`, `package_id`, `quantity`, `id`, and `code` are present in the response |
| `sims array matches quantity and each has valid iccid` | Assert `sims.length === 6`; iterate each sim and assert `iccid` is a non-empty string |
| `returns 4xx for invalid package_id` | Negative path: POST `/orders` with `package_id: 'invalid-package-xyz'` → assert status `>= 400` |

#### `esims.spec.js`

A shared `before()` hook creates an order and extracts the list of iccids from the response.

| Test | Approach |
|------|----------|
| `order produces expected number of iccids` | Assert `iccids.length === 6`; assert each entry is a non-empty string |
| `each eSIM is retrievable and has all required fields` | For each iccid: GET `/sims/{iccid}` → assert `200`, `success`, and presence of `iccid`, `lpa`, `matching_id`, and `qrcode` fields |

---

### Playwright E2E Tests

**Shared approach:** All locators and interactions are encapsulated in a Page Object Model (`playwright/support/pages/home-page.ts`). Test specs import `HomePage` and call named methods — no raw locators appear in the spec files. Playwright is configured with Chromium only, 2 retries, and video/trace retained on failure.

#### `search-japan.spec.ts`

| Test | Approach |
|------|----------|
| `should search for Japan and validate price` | Navigate to `/` and accept cookies → type "Japan" in search, assert clear button visible, click first result → assert URL contains `/japan-esim` → scroll to 7-day plan tab → assert "Unlimited" tab visible → click 7-day plan, assert price, total price, and "Buy Now" button are visible → assert total price text matches 7-day price text |
| `should search for invalid country and validate result` | Navigate to `/` and accept cookies → type "invalid country" → assert result shows "No results" text → assert clear button remains visible |

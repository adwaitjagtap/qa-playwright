# BrightHR QA Automation — Playwright (TypeScript)

[![Playwright Tests](https://github.com/adwaitjagtap/brighthr-qa-playwright/actions/workflows/playwright.yml/badge.svg)](https://github.com/adwaitjagtap/brighthr-qa-playwright/actions/workflows/playwright.yml)

A Playwright + TypeScript test automation suite for the BrightHR sandbox application, covering authentication, employee creation, and employee verification scenarios.

---

## 📁 Project Structure

```
brighthr-qa-playwright/
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI workflow
├── tests/
│   ├── data/
│   │   ├── dashboardItems.ts       # Expected dashboard nav items
│   │   └── employees.ts            # Employee data generator
│   ├── pages/
│   │   ├── login.page.ts           # Login page object
│   │   ├── dashboard.page.ts       # Dashboard page object
│   │   └── employee.page.ts        # Employee hub page object
│   ├── specs/
│   │   ├── auth/
│   │   │   └── login.spec.ts       # Login test
│   │   └── employees/
│   │       └── create-employees.spec.ts  # Employee creation & verification test
│   └── utils/
│       ├── faker.ts                # Faker.js helpers
│       ├── logger.ts               # Lightweight logger utility
│       └── test-fixtures.ts        # Custom Playwright fixtures (login, network capture)
├── global-setup.ts                 # Global setup hook (currently a no-op)
├── global-teardown.ts              # Global teardown hook (currently a no-op)
├── playwright.config.ts            # Playwright configuration
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18 or v20+
- **npm** v9+

---

## 🚀 Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd brighthr-qa-playwright
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Install Playwright browsers

```bash
npx playwright install --with-deps
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
BRIGHTHR_USERNAME=your-username@example.com
BRIGHTHR_PASSWORD=your-password
```

> ⚠️ **Never commit `.env` to source control.** It is already listed in `.gitignore`.

---

## 🧪 Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests (default Playwright config) |
| `npm run test:chromium` | Run on headless Chrome |
| `npm run test:firefox` | Run on headless Firefox |
| `npm run test:webkit` | Run on headless WebKit (Safari) |
| `npm run test:headed` | Run on full Chrome (headed, maximised) |
| `npm run test:auth` | Run auth specs only |
| `npm run test:employees` | Run employee specs only |
| `npm run report` | Open the last HTML report |

### Running a specific test file

```bash
npx playwright test tests/specs/auth/login.spec.ts
```

### Running with a specific browser

```bash
npx playwright test --project=firefox
```

---

## 🔍 On-Failure Artifacts

Playwright is configured to automatically capture the following when a test fails:

| Artifact | Config |
|---|---|
| **Screenshot** | `screenshot: 'only-on-failure'` |
| **Video** | `video: 'retain-on-failure'` |
| **Trace** | `trace: 'on-first-retry'` (viewable via `npx playwright show-trace`) |
| **HAR (network log)** | Captured via custom fixture; attached to test results |
| **Failed requests log** | Plain-text summary of all failed network requests |

All artifacts are saved to `test-results/<test-name>/` and are viewable in the HTML report.

---

## 🤖 CI — GitHub Actions

The project includes a GitHub Actions workflow at `.github/workflows/playwright.yml`.

### Triggers

- **Push** to `main` / `master`
- **Pull Request** targeting `main` / `master`
- **Scheduled nightly runs** (always on `chromium-headless`):
  - 🌙 **8:00 PM UK time** (20:00 UTC / 21:00 BST)
  - 🌅 **8:00 AM UK time** (08:00 UTC / 09:00 BST)
  > Note: cron schedules run in UTC. During British Summer Time (BST, UTC+1) runs will appear 1 hour later on the clock.
- **Manual dispatch** (`workflow_dispatch`) — allows choosing a browser project

### Required GitHub Secrets

Add the following in **Settings → Secrets and variables → Actions**:

| Secret name | Description |
|---|---|
| `BRIGHTHR_USERNAME` | Test account email |
| `BRIGHTHR_PASSWORD` | Test account password |

### Artifacts uploaded by CI

| Artifact | Condition | Retention |
|---|---|---|
| `playwright-report` | Always | 14 days |
| `test-results-failures` | On failure only | 7 days |

---

## 📄 Page Objects

| Page | File | Responsibilities |
|---|---|---|
| **LoginPage** | `login.page.ts` | Navigate to app, fill credentials, submit login |
| **DashboardPage** | `dashboard.page.ts` | Verify dashboard load, validate sidebar nav items |
| **EmployeePage** | `employee.page.ts` | Navigate to employee hub, create employees, verify employees exist via search |

---

## 🛠️ Utilities

- **`logger.ts`** — Lightweight wrapper around `console.log` for structured test output
- **`faker.ts`** — Generates realistic employee data using `@faker-js/faker`
- **`test-fixtures.ts`** — Extends Playwright's base `test` with:
  - `loginPage` — pre-instantiated `LoginPage`
  - `networkOnFailure` *(auto)* — captures HAR & failed request log on test failure

---

## ⏳ Pending / Future Work

### Global Setup & Teardown
`global-setup.ts` and `global-teardown.ts` are currently no-ops. Planned improvements:
- **Global setup**: Authenticate once and reuse a saved browser storage state (`storageState`) to avoid logging in on every test, reducing test time significantly.
- **Global teardown**: Clean up any test data created during the run (e.g. delete generated employees via API).

### Other Improvements
- [ ] **Search returns all employees on first load** — On the Manage Employees tab, the initial page load currently displays all employees before the search filter is applied. The automation search and validation logic still works correctly (it finds and verifies the correct employee within the results). This is a known UI timing behaviour and will be addressed in a future build, likely by waiting for an API response to confirm the filtered list has loaded before asserting.
- [ ] Add API-level employee cleanup after tests
- [ ] Add `storageState` auth caching to skip login UI on every test
- [ ] Replace hard `page.waitForTimeout()` calls with API response polling
- [ ] Expand test coverage: employee editing, deletion, permissions
- [ ] Add cross-browser matrix in CI (run all browser projects in parallel)
- [ ] Add Slack / Teams notification on CI failure
- [ ] Add test tagging (`@smoke`, `@regression`) and filtered CI runs

---

## 📦 Dependencies

| Package | Purpose |
|---|---|
| `@playwright/test` | Core test framework and browser automation |
| `@faker-js/faker` | Fake data generation for employee forms |
| `dotenv` | Load environment variables from `.env` |
| `@types/node` | Node.js TypeScript types |

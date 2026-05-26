# QA Findings & Observations

A log of bugs, inconsistencies, and recommended improvements identified during exploratory testing and test automation development.

---

## 🔐 Authentication

### F-001 — Missing `data-testid` on Login Form Fields
- **Observation:** The username and password input fields do not have `data-testid` attributes. Only the login button (`data-testid="login-button"`) has one.
- **Impact:** Tests must rely on role/label selectors which are less stable and may break if labels change.
- **Recommendation:** Add `data-testid` attributes to all interactive form fields (username, password, submit) to improve selector stability and test resilience.

---

## 👥 Employee Hub — Manage Employees

### F-002 — Search Does Not Return Newly Added Employee Immediately
- **Observation:** Searching for an employee immediately after adding them on the Manage Employees tab (Employees section of Employee Hub) does not return the new employee in results. The list appears to be stale — likely due to a missing API call to refresh the employee list after creation.
- **Impact:** Automation cannot reliably search for a newly created employee without a workaround.
- **Workaround Implemented:** The automation navigates away to the **Permissions** tab and then back to the **Manage Employees** tab before searching. This triggers a fresh page load and a new API call, ensuring the updated employee list is returned.
- **Recommendation:** Investigate whether the Manage Employees tab is missing a `GET /employees` (or equivalent) call after a successful employee creation event. Triggering a list refresh on modal close would resolve this.

### F-003 — Search Box Not Cleared After Returning from Permissions Tab
- **Observation:** When navigating from the Manage Employees tab to the Permissions tab and back, the search input box retains its previously entered value rather than being cleared.
- **Impact:** Stale search terms in the input box can affect subsequent searches and may cause incorrect or empty results if the previous term is not manually cleared.
- **Workaround Implemented:** Each search call explicitly fills the search box with the new term using `.fill()`, which overwrites whatever was previously in the field.
- **Recommendation:** The search input should be cleared (or reset to placeholder state) on tab navigation. This is likely a missing state reset in the component's navigation lifecycle.

### F-004 — Manage Employees Tab Shows All Employees Before Search Filter Applies
- **Observation:** On initial load of the Manage Employees tab, all employees are displayed before any search filter is applied. When automation types a search term, there is a brief period where all employees are still visible.
- **Impact:** Assertions made too early could match unintended employees. Current automation mitigates this with a wait, but it relies on a hard timeout rather than an API signal.
- **Recommendation:** Wait for the filtered API response before asserting search results, rather than using a fixed `waitForTimeout`. The search input should ideally debounce and trigger a filtered request.

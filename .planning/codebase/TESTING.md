---
last_mapped_commit: 12c772748142bd7383929470449986e10caefa13
last_mapped_at: 2026-10-24
---
# Testing Patterns

**Analysis Date:** 2026-10-24

## Test Framework

**Runner:**
- React Testing Library (`@testing-library/react` v16.3.2)
- Jest / React App Testing Suite (`@testing-library/jest-dom` v6.9.1, `@testing-library/user-event` v13.5.0)
- Config: `setupTests.js` and `package.json` (`eslintConfig.extends: ["react-app", "react-app/jest"]`)

**Assertion Library:**
- Jest assertions and DOM matchers from `@testing-library/jest-dom` (`toBeInTheDocument`, `toHaveBeenCalledWith`)

**Run Commands:**

```bash
npm test                       # Run Jest test runner (via react-scripts or vitest if configured)
npm run test -- --watchAll     # Run tests in watch mode
npm run test -- --coverage     # Run test coverage report
```

## Test File Organization

**Location:**
- Co-located next to tested modules in `src/` (e.g. `src/Context/themeUtils.test.js`, `src/App.test.js`).

**Naming:**
- `*.test.js` suffix matching the source module name.

**Structure:**

```text
src/
├── Context/
│   ├── themeUtils.js
│   └── themeUtils.test.js      # Co-located unit test
└── App.test.js                 # Top-level smoke test
```

## Test Structure

**Suite Organization:**

```javascript
/**
 * @jest-environment node
 */
import { applyThemeToDocument, getInitialTheme, isThemeName } from "./themeUtils";

describe("themeUtils", () => {
  test("uses stored dark theme when it is valid", () => {
    const storage = createStorage("dark");
    expect(getInitialTheme({ storage })).toBe("dark");
  });

  test("applies the selected theme to the document root", () => {
    const doc = createDocument();
    applyThemeToDocument("dark", doc);
    expect(doc.documentElement.setAttribute).toHaveBeenCalledWith("data-theme", "dark");
  });
});
```

**Patterns:**
- **Environment Declaration:** `@jest-environment node` or `jsdom` explicitly declared at the top of test files when interacting with DOM or Storage mocks.
- **Factory Helpers:** Local helper functions like `createStorage()` and `createDocument()` isolate environment dependencies without global pollution.
- **Setup/Teardown:** Mock cleanup via `jest.fn()` assertion tracking.

## Mocking

**Framework:** Built-in `jest.fn()` mocks.

**Patterns:**

```javascript
const createStorage = (themeValue) => ({
  getItem: jest.fn(() => themeValue),
  removeItem: jest.fn(),
});

const createDocument = () => ({
  documentElement: {
    setAttribute: jest.fn(),
  },
});
```

**What to Mock:**
- Browser `localStorage` and `sessionStorage`.
- DOM `document.documentElement` manipulation.
- Axios network calls and remote endpoints in `src/Api/api.js`.

**What NOT to Mock:**
- Pure logic functions, string utilities, and state reducers.
- Theme validation algorithms (`isThemeName`).

## Fixtures and Factories

**Test Data:**
- Factory mocks constructed inline within test suites to represent JWT tokens, storage states, and user access records.

**Location:**
- Co-located helper functions in `*.test.js`.

## Coverage

**Requirements:**
- No strict minimum percentage enforced by CI/CD at present.
- High priority target for expanding unit tests around `tokenManager.js`, `RoleGuard.js`, and `apiHandlers.js`.

## Test Types

**Unit Tests:**
- Validate core utility functions, storage managers, theme selection algorithms, and security filters.

**Integration Tests:**
- Verify provider mounting, context propagation, and guarded route transitions.

**E2E Tests:**
- Not currently configured in the codebase; manual and browser subagent verification currently utilized for end-to-end user flows.

## Common Patterns

**Environment-Agnostic Injection:**

```javascript
// Function design accepts injected storage/documentRef for easy unit testing
export const getInitialTheme = ({ storage = defaultStorage } = {}) => {
  const storedTheme = storage?.getItem(THEME_KEY);
  if (isThemeName(storedTheme)) {
    return storedTheme;
  }
  return DEFAULT_THEME;
};
```

**Testing DOM Manipulations:**

```javascript
test("cleans up legacy theme keys from storage on initialization", () => {
  const removeItem = jest.fn();
  const storage = {
    getItem: jest.fn((key) => (key === "iamsigner_theme_mode" ? "light" : null)),
    removeItem,
  };

  getInitialTheme({ storage });

  expect(removeItem).toHaveBeenCalledWith("iamsigner_theme_mode");
});
```

---

*Testing analysis: 2026-10-24*

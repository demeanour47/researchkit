# Testing

ResearchKit's first non-negotiable is accuracy. Tests are how we keep it.

## Running tests

```bash
npm test            # compile and run every test
npm run type-check  # type-check the whole project
npm run lint        # lint the whole project
npm run build       # production build
```

`npm test` uses Node's built-in test runner, with no test framework to install. It compiles every `*.test.ts` file under `src/` (with the TypeScript compiler already in the project) into `.test-dist/`, then runs them with `node --test`. The output folder is cleared before each run, so deleted tests never linger.

The command exits with a non-zero code if any test fails or any test file has a type error.

## Continuous integration

Every push and pull request runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml), which performs, in order:

1. Install dependencies (`npm ci`, exactly as locked)
2. Lint
3. Type-check
4. Test
5. Build

The run stops at the first failing step. A change is ready to merge only when every step passes. Run the same four commands locally before pushing.

## Expectations for new tools

- **Put domain logic in `src/knowledge/`,** as pure functions with no React, Next.js or network access. That is what makes it testable.
- **Every tool ships with tests** next to its logic (`logic.test.ts` beside `logic.ts`).
- **Test against authoritative references.** For calculations and formatting rules, include cases taken from the source the tool follows (a style manual's examples, a textbook's worked example, established statistical software) and cite that source in the test.
- **Test the edges:** empty, zero, very large, invalid and unusual input, and every branch of a decision.
- **Test honesty, not just answers.** Where logic can be uncertain, test that it says so, as the Citation Style Finder's tests do.
- **When the input space is small enough, test all of it.** The Citation Style Finder checks its rules against every one of its 3,025 answer combinations.
- **Use relative imports in test files and the logic they cover.** The test runner doesn't resolve the `@/` path alias; knowledge-layer code doesn't need it.
- **A bug fix starts with a failing test** that reproduces the bug.
- **Never weaken an assertion to make a build pass.** Fix the logic, or explain in the pull request why the expectation was wrong.

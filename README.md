# Apex Test Detective

**From Failed Test to Root Cause**

Apex Test Detective is a small, dependency-free Node.js utility that reads Salesforce Apex test-result JSON, classifies each failed test, extracts the failure location from the stack trace, and writes a JSON diagnosis and a readable Markdown report.

## Problem

When an Apex test fails, a developer has to dig through the raw test-result JSON or org logs to find the exception type, the message, and the line that failed. For repeated runs the same failure can also appear many times. Apex Test Detective turns that raw output into one consistent report: counts, a failure category, a plain-English diagnosis, and the class, method and line where the failure was reported.

## Key features

- Reads Salesforce CLI Apex test-result JSON (`tests` or `records` arrays, with or without a `result` wrapper).
- Reports total, passed and failed counts and a pass rate.
- Collapses repeated failures of the same `Class.method` into one entry and reports the number of unique failing tests separately from failed records.
- Classifies failures as `ASSERTION_FAILURE`, `DML_ERROR`, `SOQL_ERROR`, `NULL_POINTER`, `GOVERNOR_LIMIT` or `UNKNOWN`, with a suggested next step for each.
- Extracts class, method, line and column from Apex stack traces.
- Writes a JSON report and a Markdown report.
- Runs entirely locally on sample or saved JSON. No Salesforce org is needed to analyze existing results.
- Includes Node.js tests for the analyzer and the Markdown generator.

## Architecture and workflow

```text
Apex test results (JSON)
          |
          v
analyzeSalesforceResults.js
   |-- failureAnalyzer.js       (category + diagnosis)
   '-- stackTraceParser.js      (class / method / line)
          |
          v
Analysis report (JSON, printed to stdout)
          |
          v
generateMarkdownReport.js
          |
          v
Analysis report (Markdown)
```

| File | Role |
|---|---|
| `src/analyzer/analyzeSalesforceResults.js` | Main analyzer. Reads a results file, counts outcomes, de-duplicates failures, prints the JSON report to stdout. |
| `src/analyzer/failureAnalyzer.js` | Keyword rules that map an error message to a category and diagnosis. |
| `src/analyzer/stackTraceParser.js` | Parses `Class.Name.method: line N, column N` frames. |
| `src/analyzer/generateMarkdownReport.js` | Turns an analysis report JSON file into Markdown. |
| `src/analyzer/analyzeLogFile.js` | Analyzes a plain-text log such as `samples/apex-test-failure.log`. |
| `src/analyzer/diagnoseFailure.js` | Standalone demo with a hard-coded error. It has its own simpler classifier and is not used by the main analyzer. |
| `sf-inspection/` | Salesforce DX project with `PaymentChecker` and `PaymentCheckerTest`, the source of the demo failure. |
| `.agentia_quality_gates.sh` / `.cmd` | Optional local quality-gate scripts. See [Limitations](#limitations). |
| `.mcp.json` | Declares an `agentia` MCP server (`agentia mcp start`) for compatible editors. |

Typical workflow:

1. Obtain Apex test results as JSON (or use the files in `samples/`).
2. Run the analyzer to produce the JSON report.
3. Run the Markdown generator on that report.
4. Review the failures and check the suggested cause against the Apex code.

## Prerequisites and installation

To analyze the sample files you only need:

- **Node.js** with ES module and `node:test` support. The project was run on Node.js v24. `package.json` does not declare a minimum version.

There are no npm dependencies, so no `npm install` is needed. Clone or download the project and run the commands below from the project root.

Only needed to produce *new* results from a real org (not required for the samples):

- Salesforce CLI (`sf`)
- An authenticated Salesforce org

## Run the local analyzer on sample JSON

```bash
node src/analyzer/analyzeSalesforceResults.js samples/apex-test-results.json
```

The JSON report is printed to stdout. If no path is given, the analyzer defaults to `samples/apex-test-results.json`. A missing or invalid file prints `Analysis failed: ...` to stderr and exits with code 1.

Sample inputs:

| File | Contents |
|---|---|
| `samples/apex-test-results.json` | 4 test results with a `summary` block (org identifiers redacted) |
| `samples/salesforce-test-results.json` | 20 historical `ApexTestResult` records |
| `samples/apex-test-failure.log` | Plain-text log, for `analyzeLogFile.js` |

**Redacted sample identifiers.** `samples/apex-test-results.json` was originally captured from a real `sf apex run test` run. The `hostname`, `orgId`, `userId` and `username` values in its `summary` block have been replaced with `"REDACTED"` so that no Salesforce org or user identifiers are published. The test outcomes, counts, timings and error messages were left unchanged, and the analyzer does not read those four fields, so its output is the same as before the redaction. Because of this, the file is no longer byte-for-byte raw `sf` output. Earlier commits in the Git history may still contain the original values.

Run the automated tests:

```bash
npm test
```

## Generate JSON and Markdown reports

To avoid overwriting the files already in `samples/`, write the reports to `src/output/`:

```bash
mkdir -p src/output

# 4-test demo file
node src/analyzer/analyzeSalesforceResults.js samples/apex-test-results.json > src/output/demo-apex-test-results.report.json
node src/analyzer/generateMarkdownReport.js src/output/demo-apex-test-results.report.json src/output/demo-apex-test-results.report.md

# 20-record demo file
node src/analyzer/analyzeSalesforceResults.js samples/salesforce-test-results.json > src/output/demo-salesforce-test-results.report.json
node src/analyzer/generateMarkdownReport.js src/output/demo-salesforce-test-results.report.json src/output/demo-salesforce-test-results.report.md
```

`generateMarkdownReport.js` takes an input path and an output path. It expects the analyzer's JSON report, not raw Salesforce results.

The npm shortcuts use fixed paths and **overwrite** existing files:

| Command | Effect |
|---|---|
| `npm run analyze` | Analyzes `samples/apex-test-results.json` and prints JSON to stdout. |
| `npm run report` | Reads `samples/analysis-report.json` and overwrites `samples/analysis-report.md`. |
| `npm run pipeline` | Overwrites `samples/analysis-report.json`, then `samples/analysis-report.md`. |

## Sample results

Both demo files contain the same failing test, `PaymentCheckerTest.testIntentionalAssertionFailure`.

| Demo file | Total | Passed | Failed records | Unique failing tests | Pass rate |
|---|---|---|---|---|---|
| `samples/apex-test-results.json` | 4 | 3 | 1 | 1 | 75% |
| `samples/salesforce-test-results.json` | 20 | 18 | 2 | 1 | 90% |

In the 20-record file the same method failed twice, so the report shows 2 failed records but 1 unique failing test.

Failure details (identical for both files):

- **Category:** `ASSERTION_FAILURE`
- **Error:** `System.AssertException: Assertion Failed: DEMO_FAILURE: Expected payment to be high, but 1000 is below 3000.: Expected: true, Actual: false`
- **Location:** `PaymentCheckerTest.testIntentionalAssertionFailure`, line 32, column 1
- **Diagnosis:** Expected true, but received false. Check whether the test expectation, test data, or business logic is incorrect.

In this demo the failure is deliberate. In `sf-inspection/force-app/main/default/classes/PaymentChecker.cls`, `isPaymentHigh` returns `amount > 3000`, so a payment is high only when it is strictly greater than 3000 (exactly 3000 is not high). `testIntentionalAssertionFailure` calls `isPaymentHigh(1000)` and asserts `true`, which can never hold. The analyzer itself only sees the error message and stack trace. It does not read Apex source.

Excerpt of the generated Markdown:

```markdown
## Test Run Summary

- **Source:** samples/apex-test-results.json
- **Total tests:** 4
- **Passed:** 3
- **Failed:** 1
- **Unique failing tests:** 1
- **Pass rate:** 75%
```

## Limitations

- **Rule-based diagnosis.** Categories come from keyword matching on the error message, and the first matching rule wins. A diagnosis is a lead to verify, not proof of root cause. The analyzer does not read Apex source.
- **Broad matching.** For example, any message containing `dml` is classed as a DML error, and any message containing `Expected:` or `Actual:` is classed as an assertion failure.
- **Failure outcomes.** Only outcomes of `Fail`, `Failed` or `Failing` count as failures. Other outcomes, such as compile failures, are not reported as failures.
- **Counts.** When the input has a `summary` block, its counts are used. Otherwise they are computed from the test records.
- **De-duplication.** Failures are merged by `Class.method`. The details of the last occurrence are kept, and earlier occurrences are not listed individually.
- **Failure location.** The first frame of the stack trace is reported. This may be the test class rather than the production class under test.
- **No correlation or trends.** There is no cross-test correlation, trend analysis or historical comparison.
- **Agentia integration is not verified.**
  - In one AI-assistant session, the Agentia MCP tools (named `agentia__*`) were listed as available. This was discovery only. Connectivity and authentication were not tested by that check.
  - A single call to the read-only `agentia_health_check` tool then failed with the error `CICD API key is not configured`. Agentia CICD authentication was therefore not configured in that environment, the CICD gateway was not reached, and no health-check result was obtained.
  - As a result, Agentia CICD authentication and end-to-end Agentia runtime integration have **not** been verified. `.mcp.json` and the quality-gate scripts are included, but this README does not claim that they work end to end.
- **Quality-gate scripts differ.** `.agentia_quality_gates.sh` runs `sf apex run test` against an org and then the analyzer. It requires an explicit `TARGET_ORG` (the alias or username of a sandbox or developer org), passes it as `--target-org`, and exits with an error before running anything if `TARGET_ORG` is not set, so it never falls back to your default org. It exits 0 even when Apex tests fail, so read the generated report rather than relying on the exit code. `.agentia_quality_gates.cmd` runs different checks (`sf code-analyzer`, Agentia Apex tests, LWC Jest). Review both before relying on them.
- **Demo data.** The sample failure is intentionally created.

## Future enhancements

- Direct integration with supported Copado Agentia APIs, once configured and tested.
- More precise failure correlation across test methods.
- AI-assisted explanations with evidence from Apex source code.
- CI/CD pipeline integration and historical failure trends.

## Validation

A full `npm test` run on 2026-10-31 in this checkout reported 21 tests: 21 passed, 0 failed, 0 cancelled, 0 skipped. Run `npm test` to verify your own checkout.

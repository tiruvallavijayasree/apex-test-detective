---
name: apex-test-detective
description: Analyze Salesforce Apex test failures, identify likely root causes and stack-trace locations, and generate actionable diagnostic reports.
---

# Apex Test Detective

## Purpose
Help Salesforce developers diagnose Apex unit-test failures using the Apex Test Detective analyzer.

## Workflow
1. Confirm the terminal is in the apex-test-detective project root.
2. Check that `samples/salesforce-test-results.json` exists.
3. Run the analyzer:
   `node src/analyzer/analyzeSalesforceResults.js samples/salesforce-test-results.json`
4. Review the output for test counts, failure category, diagnosis, and source-code location.
5. Explain the likely cause in plain English and recommend the next debugging step.
6. If analysis fails, report the actual error. Never invent test results.
7. Generate a Markdown report with `npm run report` when `samples/analysis-report.json` contains the analysis output.
8. Never modify Apex source code or deploy changes without the developer's explicit approval.

## Diagnostic guidance
- **Assertion failure:** Check expected versus actual values, test data, and business logic.
- **Null pointer:** Check object initialization, queried records, and null references.
- **SOQL error:** Check query syntax, object and field names, and returned records.
- **DML error:** Check required fields, validation rules, record relationships, and automation.
- Separate confirmed facts from hypotheses.
- Historical results can contain repeated failures from different test runs; distinguish failed records from unique failing test methods.

## Expected output
Summarize:
- Source file analyzed
- Reliable total, passed, and failed counts
- Failing test class and method
- Error category and message
- Apex class, method, and line number, when available
- Likely root cause
- Recommended next debugging step

Do not claim that Agentia integration or analysis succeeded unless it has actually been tested.

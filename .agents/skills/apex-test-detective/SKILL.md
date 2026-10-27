
---
name: apex-test-detective
description: Analyze Salesforce Apex test failures using the Agentia local quality gate, identify likely root causes and stack-trace locations, and generate JSON and Markdown diagnostic reports.
---

# Apex Test Detective

## Purpose
Help Salesforce developers diagnose Apex unit-test failures using the Apex Test Detective analyzer and Agentia local quality gate.

## Workflow
1. Confirm the terminal is in the `apex-test-detective` project root.
2. Confirm the Salesforce project in `sf-inspection` is authenticated and the target test class exists.
3. Run the Agentia local quality gate:

   `agentia cicd work test --local --apex-test-classes=PaymentCheckerTest --json`

4. Review `samples/agentia-analysis-report.md` and `samples/agentia-analysis-report.json`.
5. Summarize the total, passed, and failed tests using the generated results.
6. For each failure, report the test class, method, category, error message, and source-code line when available.
7. Explain the likely cause in plain English and recommend the next debugging step.
8. If analysis fails, report the actual error. Never invent test results.
9. If Apex tests fail but the report is generated, clearly report the failures. Successful report generation does not mean the tests passed.
10. Never modify Apex source code or deploy changes without the developer's explicit approval.

## Diagnostic guidance
- **Assertion failure:** Check expected versus actual values, test data, and business logic.
- **Null pointer:** Check object initialization, queried records, and null references.
- **SOQL error:** Check query syntax, object and field names, and returned records.
- **DML error:** Check required fields, validation rules, record relationships, and automation.
- Separate confirmed facts from hypotheses.
- Distinguish failed test records from unique failing test methods when historical results contain repeated failures.

## Expected outputs
- `samples/agentia-apex-test-results.json` — raw Salesforce test results
- `samples/agentia-analysis-report.json` — structured diagnosis
- `samples/agentia-analysis-report.md` — readable diagnostic report

Summarize:
- Source file analyzed
- Total, passed, and failed test counts
- Failing test class and method
- Error category and message
- Apex class, method, and line number, when available
- Likely root cause and recommended next debugging step

Do not claim that Agentia AI runtime integration succeeded unless it has actually been tested.

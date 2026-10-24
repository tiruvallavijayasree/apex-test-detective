# Apex Test Detective

**From Failed Test to Root Cause**

Apex Test Detective is a Salesforce developer utility that analyzes Apex unit-test result JSON, classifies failed tests, extracts failure locations from stack traces, and generates structured diagnostic reports.

## Problem

Apex test failures can require developers to inspect test messages, stack traces, and assertions manually. This tool helps organize those details into a consistent report.

## Features

- Reads Salesforce CLI Apex test-result JSON.
- Summarizes total, passed, and failed tests.
- Classifies common failures, including assertion, DML, SOQL, null-pointer, and governor-limit errors.
- Extracts Apex class, method, and line information from available stack traces.
- Generates JSON and Markdown reports.
- Includes automated Node.js tests for core analysis functions.

## Architecture

1. **Salesforce CLI:** Runs Apex tests and exports their results.
2. **Result analyzer:** Reads the JSON output and classifies failures.
3. **Stack-trace parser:** Extracts available failure-location details.
4. **Report generator:** Produces a JSON diagnosis report and a readable Markdown summary.

## Requirements

- Node.js
- Salesforce CLI (`sf`)
- An authenticated Salesforce org for collecting real Apex test results

## Run the project

Install or verify Node.js, then run the local tests:

```bash
npm test
```

Analyze a Salesforce CLI result file:

```bash
node src/analyzer/analyzeSalesforceResults.js samples/apex-test-results.json
```

Generate the JSON report:

```bash
node src/analyzer/analyzeSalesforceResults.js samples/apex-test-results.json > samples/analysis-report.json
```

Generate the Markdown report:

```bash
npm run report
```

## Example output

The sample dataset contains four test results:

- Total: 4
- Passed: 3
- Failed: 1
- Pass rate: 75%

The example failure is an assertion failure in `PaymentCheckerTest.testIntentionalAssertionFailure`, at line 32.

## Limitations

- Diagnosis is based on error-message rules, not an independent proof of root cause.
- Results depend on the fields available in the input JSON.
- The included sample contains an intentionally created failure.
- Copado Agentia API integration and AI-generated analysis should be described as implemented only after they have been configured and tested.

## Future enhancements

- Direct integration with supported Copado Agentia APIs.
- More precise failure correlation across test methods.
- AI-assisted explanations with evidence from Apex source code.
- CI/CD pipeline integration and historical failure trends.

## Validation

The local Node.js test suite currently passes six tests. Run `npm test` to verify the current checkout.

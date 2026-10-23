# Apex Test Detective

**Turn Salesforce Apex test failures into actionable diagnostics.**

Apex Test Detective is a Node.js CLI prototype that reads Apex test failure logs, classifies common exceptions, extracts test and failure locations, and produces a structured JSON report.

## Features

- Classifies null pointer, SOQL, assertion, DML, and unknown errors.
- Extracts the test class and test method when present in the log.
- Parses Apex stack frames, including class, method, line, and column.
- Produces a JSON diagnosis report.
- Includes automated tests using Node.js's built-in test runner.

## Requirements

- Node.js 20 or later
- No third-party npm packages required

## Setup

```bash
git clone <your-repository-url>
cd apex-test-detective
```

No dependency installation is needed for the current prototype.

## Run the analyzer

```bash
node src/analyzer/analyzeLogFile.js samples/apex-test-failure.log
```

The output is a JSON report containing the input file, test class and method, detected exception, category, diagnosis, failure location, and stack frames.

## Run automated tests

```bash
npm test
```

The test suite verifies exception classification and stack-trace parsing.

## Example

The included sample log represents a `System.NullPointerException` in `PaymentChecker.checkPayment` at line 42. It is sample data, not a live failure fetched from a Salesforce org.

## Current limitations

- The current workflow analyzes a supplied log file; it does not yet fetch Apex test results directly from a Salesforce org.
- Copado CI/CD or other Agentia API integration is not yet verified.
- Diagnoses are rule-based and intended to guide investigation, not automatically repair Apex code.

## Roadmap

- Integrate a supported source of real Apex test results.
- Connect Agentia CLI capabilities where authorized.
- Improve diagnosis specificity and add more automated tests.

## Project status

Working local prototype. Salesforce org and Copado service integration must be demonstrated separately before claiming end-to-end integration.

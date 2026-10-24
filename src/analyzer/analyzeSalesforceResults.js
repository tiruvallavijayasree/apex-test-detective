
import fs from "node:fs";
import { analyzeFailure } from "./failureAnalyzer.js";
import { parseStackTrace } from "./stackTraceParser.js";

const filePath =
  process.argv[2] || "samples/apex-test-results.json";

function firstDefined(...values) {
  return values.find(
    (value) => value !== undefined && value !== null
  );
}

function normalizeTest(test) {
  const error =
    test.Message ??
    test.error ??
    test.ErrorMessage ??
    "Test failed without an error message";

  const stackTrace = test.StackTrace ?? test.stackTrace ?? "";
  const parsedLocation = parseStackTrace(stackTrace);
  const diagnosis = analyzeFailure(error);

  const apexClass =
    test.ApexClass?.Name ??
    test.className ??
    test.testClass ??
    parsedLocation.failureLocation?.className ??
    test.ApexClassId ??
    "Unknown";

  const method =
    test.MethodName ??
    test.method ??
    test.testMethod ??
    parsedLocation.failureLocation?.methodName ??
    "Unknown";

  return {
    testClass: apexClass,
    testMethod: method,
    error,
    category: diagnosis.category,
    diagnosis: diagnosis.diagnosis,
    location: parsedLocation
  };
}

try {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Results file not found: ${filePath}`);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const payload = raw.result ?? raw;
  const isSalesforceQuery = Array.isArray(payload.records);
  const summary = payload.summary ?? {};

  // Salesforce Tooling API query results use result.records.
  // Existing sample files use tests or failedTests.
  const tests = isSalesforceQuery
    ? payload.records
    : payload.tests ?? [];

  const failedTests = isSalesforceQuery
    ? tests.filter(
        (test) =>
          String(test.Outcome ?? test.outcome ?? "").toLowerCase() ===
          "fail"
      )
    : [
        ...(payload.failedTests ?? []),
        ...tests.filter(
          (test) =>
            String(test.Outcome ?? test.outcome ?? "").toLowerCase() ===
            "fail"
        )
      ];

  const passedTests = isSalesforceQuery
    ? tests.filter(
        (test) =>
          String(test.Outcome ?? test.outcome ?? "").toLowerCase() ===
          "pass"
      )
    : tests.filter(
        (test) =>
          String(test.Outcome ?? test.outcome ?? "").toLowerCase() ===
          "pass"
      );

  const normalizedFailures = failedTests.map(normalizeTest);

  // Group repeated failures by class and method.
  const uniqueFailures = [
    ...new Map(
      normalizedFailures.map((failure) => [
        `${failure.testClass}.${failure.testMethod}`,
        failure
      ])
    ).values()
  ];

  const total = isSalesforceQuery
    ? firstDefined(payload.totalSize, tests.length)
    : firstDefined(
        summary.testsRan,
        summary.total,
        payload.testsRan,
        tests.length,
        (summary.passing ?? 0) + (summary.failing ?? 0)
      );

  const passed = isSalesforceQuery
    ? passedTests.length
    : firstDefined(
        summary.passing,
        summary.passed,
        payload.passing,
        passedTests.length,
        Math.max(0, total - failedTests.length)
      );

  const failed = isSalesforceQuery
    ? failedTests.length
    : firstDefined(
        summary.failing,
        summary.failed,
        payload.failing,
        failedTests.length
      );

  const report = {
    project: "Apex Test Detective",
    source: filePath,
    summary: {
      total,
      passed,
      failed,
      uniqueFailures: uniqueFailures.length,
      skipped: firstDefined(summary.skipped, payload.skipped, 0),
      passRate: total
        ? `${Math.round((passed / total) * 100)}%`
        : "unknown"
    },
    failures: uniqueFailures
  };

  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Analysis failed: ${error.message}`);
  process.exitCode = 1;
}

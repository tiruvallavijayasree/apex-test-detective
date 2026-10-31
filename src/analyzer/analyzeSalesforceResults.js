
import fs from "node:fs";
import { analyzeFailure } from "./failureAnalyzer.js";
import { parseStackTrace } from "./stackTraceParser.js";

const filePath = process.argv[2] || "samples/apex-test-results.json";

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null);
}

function getTests(payload) {
  if (Array.isArray(payload.tests)) return payload.tests;
  if (Array.isArray(payload.records)) return payload.records;
  return [];
}

function normalizeTest(test) {
  const error =
    test.Message ??
    test.message ??
    test.ErrorMessage ??
    test.errorMessage ??
    (typeof test.error === "string" ? test.error : test.error?.message) ??
    "Test failed without an error message";

  const stackTrace = String(test.StackTrace ?? test.stackTrace ?? "");
  const parsedLocation = parseStackTrace(stackTrace);
  const diagnosis = analyzeFailure(error);
  const fullName = test.FullName ?? test.fullName ?? "";
  const parts = fullName.split(".");

  const apexClass =
    test.ApexClass?.Name ??
    test.className ??
    test.testClass ??
    (parts.length > 1 ? parts[0] : undefined) ??
    parsedLocation.failureLocation?.className ??
    "Unknown";

  const method =
    test.MethodName ??
    test.methodName ??
    test.method ??
    (parts.length > 1 ? parts.slice(1).join(".") : undefined) ??
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
  const payload = raw.result ?? raw.data ?? raw;
  const summary = payload.summary ?? raw.summary ?? {};

  const tests = getTests(payload);
  const outcome = (test) =>
    String(test.Outcome ?? test.outcome ?? test.status ?? "").toLowerCase();

  const failedTests = tests.filter((test) =>
    ["fail", "failed", "failing"].includes(outcome(test))
  );

  const passedTests = tests.filter((test) =>
    ["pass", "passed", "passing"].includes(outcome(test))
  );

  const uniqueFailures = [
    ...new Map(
      failedTests.map((test) => {
        const failure = normalizeTest(test);
        return [`${failure.testClass}.${failure.testMethod}`, failure];
      })
    ).values()
  ];

  const total = Number(firstDefined(
    summary.testsRan, summary.total, payload.testsRan, tests.length
  ));
  const failed = Number(firstDefined(
    summary.failing, summary.failed, payload.failing, failedTests.length
  ));
  const passed = Number(firstDefined(
    summary.passing, summary.passed, payload.passing,
    passedTests.length, Math.max(0, total - failed)
  ));

  console.log(JSON.stringify({
    project: "Apex Test Detective",
    source: filePath,
    summary: {
      total,
      passed,
      failed,
      uniqueFailures: uniqueFailures.length,
      skipped: Number(firstDefined(summary.skipped, payload.skipped, 0)),
      passRate: total ? `${Math.round((passed / total) * 100)}%` : "unknown"
    },
    failures: uniqueFailures
  }, null, 2));
} catch (error) {
  console.error(`Analysis failed: ${error.message}`);
  process.exitCode = 1;
}

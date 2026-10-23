import { readFileSync } from "node:fs";
import { analyzeFailure } from "./failureAnalyzer.js";
import { parseStackTrace } from "./stackTraceParser.js";

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node src/analyzer/analyzeLogFile.js <path-to-log-file>");
    process.exit(1);
}

let log;

try {
    log = readFileSync(filePath, "utf8");
} catch (error) {
    console.error(`Could not read file: ${filePath}`);
    console.error(error.message);
    process.exit(1);
}

const exceptionLine = log
    .split("\n")
    .find(line => /Exception|Assertion Failed|assertion/i.test(line));

const diagnosis = analyzeFailure(exceptionLine || log);
const stackTrace = parseStackTrace(log);

const report = {
    sourceFile: filePath,
    testClass: log.match(/Test Class:\s*(.+)/)?.[1]?.trim() || null,
    testMethod: log.match(/Test Method:\s*(.+)/)?.[1]?.trim() || null,
    exception: exceptionLine?.trim() || "No exception line detected",
    category: diagnosis.category,
    diagnosis: diagnosis.diagnosis,
    failureLocation: stackTrace.failureLocation || null,
    stackFrames: stackTrace.stackFrames || []
};

console.log(JSON.stringify(report, null, 2));

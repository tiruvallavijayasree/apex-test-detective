
import { parseStackTrace } from "./stackTraceParser.js";

function classifyFailure(errorMessage) {
    const message = errorMessage.toLowerCase();

    if (message.includes("dmlexception")) {
        return {
            category: "DML_ERROR",
            diagnosis: "Inspect validation rules, triggers, required fields, and DML details."
        };
    }

    if (
        message.includes("queryexception") ||
        message.includes("list has no rows") ||
        message.includes("soql")
    ) {
        return {
            category: "SOQL_ERROR",
            diagnosis: "Check query filters, returned records, and test data."
        };
    }

    if (message.includes("assert")) {
        return {
            category: "ASSERTION_FAILURE",
            diagnosis: "Compare the expected value with the actual result."
        };
    }

    if (message.includes("nullpointer")) {
        return {
            category: "NULL_POINTER",
            diagnosis: "Inspect the failing line for a null or uninitialized reference."
        };
    }

    return {
        category: "UNKNOWN",
        diagnosis: "Inspect the exception, stack trace, and relevant Apex code."
    };
}

const errorMessage =
    "System.NullPointerException: Attempt to de-reference a null object";

const stackTrace = `
Class.PaymentHandler.calculateTotal: line 47, column 1
Class.PaymentHandlerTest.testCalculateTotal: line 82, column 1
`;

const failure = classifyFailure(errorMessage);
const trace = parseStackTrace(stackTrace);

const report = {
    error: errorMessage,
    category: failure.category,
    diagnosis: failure.diagnosis,
    failureLocation: trace.failureLocation,
    stackFrames: trace.stackFrames
};

console.log("APEX TEST DETECTIVE — DIAGNOSIS REPORT");
console.log(JSON.stringify(report, null, 2));

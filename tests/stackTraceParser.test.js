import test from "node:test";
import assert from "node:assert/strict";
import { parseStackTrace } from "../src/analyzer/stackTraceParser.js";

test("extracts the first Apex failure location and stack frames", () => {
    const trace = [
        "Class.PaymentChecker.checkPayment: line 42, column 1",
        "Class.PaymentCheckerTest.testPaymentWithoutCase: line 18, column 1"
    ].join("\n");

    const result = parseStackTrace(trace);

    assert.equal(result.failureLocation.className, "PaymentChecker");
    assert.equal(result.failureLocation.methodName, "checkPayment");
    assert.equal(result.failureLocation.lineNumber, 42);
    assert.equal(result.stackFrames.length, 2);
});

import test from "node:test";
import assert from "node:assert/strict";
import { analyzeFailure } from "../src/analyzer/failureAnalyzer.js";

test("classifies a null pointer exception", () => {
    const result = analyzeFailure(
        "System.NullPointerException: Attempt to de-reference a null object"
    );
    assert.equal(result.category, "NULL_POINTER");
    assert.match(result.diagnosis, /null reference/i);
});

test("classifies a SOQL query error", () => {
    const result = analyzeFailure(
        "System.QueryException: List has no rows for assignment to SObject"
    );
    assert.equal(result.category, "SOQL_ERROR");
});

test("classifies an assertion failure", () => {
    const result = analyzeFailure(
        "System.AssertException: Assertion Failed"
    );
    assert.equal(result.category, "ASSERTION_FAILURE");
});

test("classifies a DML error", () => {
    const result = analyzeFailure(
        "System.DmlException: Insert failed"
    );
    assert.equal(result.category, "DML_ERROR");
});

test("handles an unknown error", () => {
    const result = analyzeFailure("Unexpected Apex failure");
    assert.equal(result.category, "UNKNOWN");
});

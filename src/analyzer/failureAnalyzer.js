
export function analyzeFailure(errorMessage = "") {
    const message = String(errorMessage);
    const lower = message.toLowerCase();

    // 1. Assertion failures
    if (
        lower.includes("assertexception") ||
        lower.includes("assertion failed") ||
        lower.includes("assertionfailure") ||
        lower.includes("expected:") ||
        lower.includes("actual:")
    ) {
        const expected = message.match(/Expected:\s*([^,\n]+)/i);
        const actual = message.match(/Actual:\s*([^,\n]+)/i);

        let diagnosis =
            "The test result did not match the expected result. " +
            "Compare the assertion, test data, and business logic.";

        if (expected && actual) {
            diagnosis =
                `Expected ${expected[1].trim()}, but received ${actual[1].trim()}. ` +
                "Check whether the test expectation, test data, or business logic is incorrect.";
        } else if (lower.includes("demo_failure")) {
            diagnosis =
                "The assertion expected a high payment, but the supplied amount (1000) " +
                "is below the 3000 threshold. Check whether the test expectation or " +
                "the payment business rule is incorrect.";
        }

        return {
            category: "ASSERTION_FAILURE",
            diagnosis
        };
    }

    // 2. DML errors
    if (
        lower.includes("dmlexception") ||
        lower.includes("required_field_missing") ||
        lower.includes("duplicate_value") ||
        lower.includes("field_custom_validation_exception") ||
        lower.includes("dml")
    ) {
        return {
            category: "DML_ERROR",
            diagnosis:
                "Inspect required fields, validation rules, duplicate rules, " +
                "triggers, record permissions, and the DML operation."
        };
    }

    // 3. SOQL errors
    if (
        lower.includes("queryexception") ||
        lower.includes("list has no rows") ||
        lower.includes("soql")
    ) {
        return {
            category: "SOQL_ERROR",
            diagnosis:
                "Check query filters, returned records, test data, and whether " +
                "the code safely handles queries that return no rows."
        };
    }

    // 4. Null pointer errors
    if (
        lower.includes("nullpointerexception") ||
        lower.includes("attempt to de-reference a null object") ||
        lower.includes("null reference")
    ) {
        return {
            category: "NULL_POINTER",
            diagnosis:
                "Inspect the failing line for a null reference. Initialize the " +
                "variable or relationship, or add a null check before using it."
        };
    }

    // 5. Governor-limit errors
    if (
        lower.includes("limitexception") ||
        lower.includes("too many soql queries") ||
        lower.includes("too many dml statements") ||
        lower.includes("maximum stack depth")
    ) {
        return {
            category: "GOVERNOR_LIMIT",
            diagnosis:
                "Review SOQL and DML operations inside loops, bulk processing, " +
                "recursive automation, and transaction governor-limit usage."
        };
    }

    // 6. Unknown errors
    return {
        category: "UNKNOWN",
        diagnosis:
            "Inspect the exception message, stack trace, and relevant Apex code " +
            "to determine the root cause."
    };
}

// Run sample diagnostics when this file is executed directly.
if (process.argv[1] && process.argv[1].endsWith("failureAnalyzer.js")) {
    const sampleErrors = [
        "System.NullPointerException: Attempt to de-reference a null object",
        "System.QueryException: List has no rows for assignment to SObject",
        "System.AssertException: Assertion Failed: Expected true, Actual false",
        "System.DmlException: Insert failed: REQUIRED_FIELD_MISSING",
        "Unexpected Apex failure"
    ];

    for (const error of sampleErrors) {
        console.log(
            JSON.stringify(
                {
                    error,
                    ...analyzeFailure(error)
                },
                null,
                2
            )
        );
    }
}

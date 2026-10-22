
function analyzeFailure(errorMessage) {
    const message = errorMessage.toLowerCase();

    if (message.includes("dml") || message.includes("dmlexception")) {
        return {
            category: "DML_ERROR",
            diagnosis: "Inspect DML details, validation rules, triggers, and required fields."
        };
    }

    if (
        message.includes("queryexception") ||
        message.includes("list has no rows") ||
        message.includes("soql")
    ) {
        return {
            category: "SOQL_ERROR",
            diagnosis: "Check query results, filters, and test data."
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
            diagnosis: "Inspect the failing line for an uninitialized or null reference."
        };
    }

    return {
        category: "UNKNOWN",
        diagnosis: "Inspect the exception, stack trace, and relevant Apex code."
    };
}

const sampleErrors = [
    "System.DmlException: Insert failed",
    "System.QueryException: List has no rows for assignment to SObject",
    "System.AssertException: Assertion Failed",
    "System.NullPointerException: Attempt to de-reference a null object",
    "Unexpected Apex failure"
];

for (const error of sampleErrors) {
    const result = analyzeFailure(error);

    console.log("\n------------------------------");
    console.log("Error:", error);
    console.log("Category:", result.category);
    console.log("Diagnosis:", result.diagnosis);
}

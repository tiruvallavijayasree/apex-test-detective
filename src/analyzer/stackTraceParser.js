
export function parseStackTrace(stackTrace) {
    const pattern =
        /Class\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+): line (\d+), column (\d+)/g;

    const locations = [];
    let match;

    while ((match = pattern.exec(stackTrace)) !== null) {
        locations.push({
            className: match[1],
            methodName: match[2],
            lineNumber: Number(match[3]),
            columnNumber: Number(match[4])
        });
    }

    return {
        failureLocation: locations[0] ?? null,
        stackFrames: locations
    };
}

const sampleStackTrace = `
Class.PaymentHandler.calculateTotal: line 47, column 1
Class.PaymentHandlerTest.testCalculateTotal: line 82, column 1
`;

console.log(JSON.stringify(parseStackTrace(sampleStackTrace), null, 2));

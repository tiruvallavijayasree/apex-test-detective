
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


export function parseStackTrace(stackTrace) {
  if (typeof stackTrace !== "string" || !stackTrace.trim()) {
    return {
      failureLocation: null,
      stackFrames: []
    };
  }

  const patterns = [
    /Class\.([A-Za-z0-9_]+)\.([A-Za-z0-9_]+): line (\d+), column (\d+)/g,
    /([A-Za-z0-9_]+)\.([A-Za-z0-9_]+): line (\d+), column (\d+)/g
  ];

  const locations = [];
  const seen = new Set();

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.exec(stackTrace)) !== null) {
      const location = {
        className: match[1],
        methodName: match[2],
        lineNumber: Number(match[3]),
        columnNumber: Number(match[4])
      };

      const key = `${location.className}.${location.methodName}:${location.lineNumber}`;

      if (!seen.has(key)) {
        seen.add(key);
        locations.push(location);
      }
    }
  }

  return {
    failureLocation: locations[0] ?? null,
    stackFrames: locations
  };
}


#!/bin/bash

set -u

# Resolve the project root from this script's location.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_CLASSES="${TEST_CLASSES:-PaymentCheckerTest}"
RESULTS_FILE="$ROOT_DIR/samples/agentia-apex-test-results.json"
REPORT_JSON="$ROOT_DIR/samples/agentia-analysis-report.json"
REPORT_MD="$ROOT_DIR/samples/agentia-analysis-report.md"

mkdir -p "$ROOT_DIR/samples"

# Never fall back to the default Salesforce org: the target must be explicit.
if [[ -z "${TARGET_ORG:-}" ]]; then
  echo "ERROR: TARGET_ORG is not set." >&2
  echo "Set it to the alias or username of a sandbox or developer org, for example:" >&2
  echo "  TARGET_ORG=my-dev-org $0" >&2
  echo "No Apex tests were run and no default org was used." >&2
  exit 1
fi

echo "=== Apex Test Detective: Running Apex tests ==="
echo "Target org: $TARGET_ORG"
echo "Test classes: $TEST_CLASSES"

if [[ ! -d "$ROOT_DIR/sf-inspection" ]]; then
  echo "ERROR: Salesforce project folder sf-inspection not found."
  exit 1
fi

cd "$ROOT_DIR/sf-inspection" || exit 1

sf apex run test \
  --target-org "$TARGET_ORG" \
  --class-names "$TEST_CLASSES" \
  --result-format json \
  --wait 10 > "$RESULTS_FILE"
TEST_EXIT=$?

cd "$ROOT_DIR" || exit 1

if [[ ! -s "$RESULTS_FILE" ]]; then
  echo "ERROR: No Apex test result JSON was generated."
  exit 1
fi

echo "=== Apex Test Detective: Analyzing results ==="

if ! node "$ROOT_DIR/src/analyzer/analyzeSalesforceResults.js" "$RESULTS_FILE" > "$REPORT_JSON"; then
  echo "ERROR: Could not analyze Apex test results."
  exit 1
fi

if ! node "$ROOT_DIR/src/analyzer/generateMarkdownReport.js" "$REPORT_JSON" "$REPORT_MD"; then
  echo "ERROR: Could not generate the Markdown report."
  exit 1
fi

echo "=== Integration outputs ==="
echo "Raw results: $RESULTS_FILE"
echo "Diagnosis JSON: $REPORT_JSON"
echo "Diagnosis report: $REPORT_MD"

if [[ "$TEST_EXIT" -ne 0 ]]; then
  echo "Apex tests failed (exit $TEST_EXIT). See the diagnosis report."
  echo "Apex Test Detective completed; failure details have been recorded."
  exit 0
fi

echo "Apex tests passed. Analysis report generated."
exit 0

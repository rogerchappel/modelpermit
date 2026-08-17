#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

echo "1. Strict policy"
node src/cli.js check fixtures/strict.json

echo
echo "2. Valid policy with release-review warnings"
node src/cli.js check fixtures/dangerous.json

echo
echo "3. Malformed policy (expected to fail)"
if node src/cli.js check fixtures/malformed.json; then
  echo "Expected the malformed fixture to fail validation." >&2
  exit 1
fi

echo
echo "4. Conflicting model policy (expected to fail)"
if node src/cli.js check fixtures/conflicting.json; then
  echo "Expected the conflicting fixture to fail validation." >&2
  exit 1
fi

echo
echo "Demo passed: strict, warning, malformed, and conflicting policy paths behaved as expected."

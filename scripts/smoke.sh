#!/usr/bin/env bash
set -euo pipefail

# Give every invocation its own outputs so parallel and repeated smoke runs do
# not overwrite each other's diagnostics. The trap also removes them on error.
tmp_dir=$(mktemp -d "${TMPDIR:-/tmp}/modelpermit-smoke.XXXXXX")
trap 'rm -rf "$tmp_dir"' EXIT

node src/cli.js --version | grep -q "0.1.0"
node src/cli.js --help | grep -q "validates local model-use policy"
node src/cli.js check fixtures/strict.json | grep -q "Status: valid"

if node src/cli.js check fixtures/malformed.json --json > "$tmp_dir/malformed.json"; then
  echo "Expected malformed fixture to fail validation."
  exit 1
fi

grep -q "deniedModels entries must be non-empty strings" "$tmp_dir/malformed.json"
grep -q "writePaths must be an array when present" "$tmp_dir/malformed.json"

if node src/cli.js check fixtures/conflicting.json --json > "$tmp_dir/conflicting.json"; then
  echo "Expected conflicting fixture to fail validation."
  exit 1
fi

grep -q "allowedModels and deniedModels overlap: model-a, model-z" "$tmp_dir/conflicting.json"

if node src/cli.js check fixtures/unknown-field.json --json > "$tmp_dir/unknown-field.json"; then
  echo "Expected unknown-field fixture to fail validation."
  exit 1
fi

grep -q "unsupported policy field: netwrok" "$tmp_dir/unknown-field.json"

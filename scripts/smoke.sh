#!/usr/bin/env bash
set -euo pipefail

node src/cli.js --version | grep -q "0.1.0"
node src/cli.js --help | grep -q "validates local model-use policy"
node src/cli.js check fixtures/strict.json | grep -q "Status: valid"

if node src/cli.js check fixtures/malformed.json --json > /tmp/modelpermit-malformed.json; then
  echo "Expected malformed fixture to fail validation."
  exit 1
fi

grep -q "deniedModels entries must be non-empty strings" /tmp/modelpermit-malformed.json
grep -q "writePaths must be an array when present" /tmp/modelpermit-malformed.json

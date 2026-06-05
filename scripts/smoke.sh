#!/usr/bin/env bash
set -euo pipefail

node src/cli.js --version | grep -q "0.1.0"
node src/cli.js --help | grep -q "validates local model-use policy"

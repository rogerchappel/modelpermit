#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const expectedFiles = [
  "src/cli.js",
  "src/index.js",
  "fixtures/strict.json",
  "fixtures/dangerous.json",
  "fixtures/invalid.json",
  "fixtures/malformed.json",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md"
];

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "inherit"]
});

const [pack] = JSON.parse(output);
const packedFiles = new Set(pack.files.map((file) => file.path));
const missing = expectedFiles.filter((file) => !packedFiles.has(file));

if (missing.length > 0) {
  console.error("modelpermit package smoke failed; missing expected file(s):");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
if (packageJson.bin?.modelpermit !== "./src/cli.js") {
  console.error("modelpermit package smoke failed; expected modelpermit bin in package metadata.");
  process.exit(1);
}

console.log(`modelpermit package smoke passed with ${pack.files.length} packed file(s).`);

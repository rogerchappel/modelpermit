#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const expectedFiles = [
  "src/cli.js",
  "src/index.js",
  "fixtures/strict.json",
  "fixtures/dangerous.json",
  "fixtures/conflicting.json",
  "fixtures/invalid.json",
  "fixtures/malformed.json",
  "README.md",
  "LICENSE",
  "SECURITY.md",
  "CHANGELOG.md",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md"
];

const scratch = await mkdtemp(join(tmpdir(), "modelpermit-package-smoke-"));
const output = execFileSync("npm", ["pack", "--json", "--pack-destination", scratch], {
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

const tarball = join(scratch, pack.filename);
const consumer = join(scratch, "consumer");
execFileSync("npm", ["install", "--ignore-scripts", "--prefix", consumer, tarball], {
  stdio: "inherit"
});
execFileSync(join(consumer, "node_modules/.bin/modelpermit"), ["--help"], {
  stdio: ["ignore", "ignore", "inherit"]
});
execFileSync(
  process.execPath,
  ["--input-type=module", "--eval", 'import("modelpermit").then(({ describeModelPermit }) => { if (!describeModelPermit()) process.exit(1); })'],
  { cwd: consumer, stdio: "inherit" }
);

console.log(`modelpermit package smoke passed with ${pack.files.length} packed file(s).`);
await rm(scratch, { recursive: true, force: true });

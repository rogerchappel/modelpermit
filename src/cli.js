#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { VERSION, checkPermit, describeModelPermit, formatPermitReport } from "./index.js";

const [command, file, maybeJson] = process.argv.slice(2);

if (!command || command === "--help" || command === "-h" || command === "help") {
  console.log(`modelpermit ${VERSION}

${describeModelPermit()}

Usage:
  modelpermit --help
  modelpermit --version
  modelpermit check modelpermit.json [--json]
`);
} else if (command === "--version" || command === "-v") {
  console.log(VERSION);
} else if (command === "check") {
  if (!file || file === "--json") {
    console.error("modelpermit: check requires a policy JSON file");
    process.exitCode = 2;
  } else {
    try {
      const policy = JSON.parse(await readFile(file, "utf8"));
      const result = checkPermit(policy);
      console.log(maybeJson === "--json" ? JSON.stringify(result, null, 2) : formatPermitReport(result));
      process.exitCode = result.valid ? 0 : 1;
    } catch (error) {
      console.error(`modelpermit: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  }
} else {
  console.error(`modelpermit: unknown argument ${command}`);
  process.exitCode = 2;
}

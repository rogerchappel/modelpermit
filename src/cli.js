#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { VERSION, checkPermit, describeModelPermit, formatPermitReport } from "./index.js";

const args = process.argv.slice(2);
const [command] = args;

const help = `modelpermit ${VERSION}

${describeModelPermit()}

Usage:
  modelpermit --help
  modelpermit --version
  modelpermit check <file> [--json]
`;

function usageError(message) {
  console.error(`modelpermit: ${message}\n\nUsage:\n  modelpermit check <file> [--json]`);
  process.exitCode = 2;
}

if (!command || command === "--help" || command === "-h" || command === "help") {
  console.log(help);
} else if (command === "--version" || command === "-v") {
  console.log(VERSION);
} else if (command === "check") {
  const checkArgs = args.slice(1);
  const [file, ...options] = checkArgs;
  const jsonCount = options.filter((argument) => argument === "--json").length;

  if (!file) {
    usageError("check requires a policy JSON file");
  } else if (file === "--json") {
    usageError("policy JSON file must come before --json");
  } else if (file.startsWith("-")) {
    usageError(`unsupported option ${file}`);
  } else if (jsonCount > 1) {
    usageError("--json may only be specified once");
  } else if (options.some((argument) => argument.startsWith("--") && argument !== "--json")) {
    usageError(`unsupported option ${options.find((argument) => argument.startsWith("--") && argument !== "--json")}`);
  } else if (options.length > jsonCount) {
    usageError(`unexpected argument ${options.find((argument) => argument !== "--json")}`);
  } else {
    try {
      const policy = JSON.parse(await readFile(file, "utf8"));
      const result = checkPermit(policy);
      console.log(jsonCount === 1 ? JSON.stringify(result, null, 2) : formatPermitReport(result));
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

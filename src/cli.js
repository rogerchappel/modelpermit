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
  modelpermit check <file> [--json] [--output <file>]
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
  const outputCount = options.filter((argument) => argument === "--output").length;
  const outputIndex = options.indexOf("--output");
  const outputFile = outputIndex === -1 ? null : options[outputIndex + 1];
  const supportedOptions = options.filter((argument, index) => argument !== "--json" && argument !== "--output" && !(outputIndex !== -1 && index === outputIndex + 1));

  if (!file) {
    usageError("check requires a policy JSON file");
  } else if (file === "--json") {
    usageError("policy JSON file must come before --json");
  } else if (file.startsWith("-")) {
    usageError(`unsupported option ${file}`);
  } else if (jsonCount > 1) {
    usageError("--json may only be specified once");
  } else if (outputCount > 1) {
    usageError("--output may only be specified once");
  } else if (outputCount === 1 && (!outputFile || outputFile.startsWith("-"))) {
    usageError("--output requires a file path");
  } else if (supportedOptions.some((argument) => argument.startsWith("--"))) {
    usageError(`unsupported option ${supportedOptions.find((argument) => argument.startsWith("--"))}`);
  } else if (supportedOptions.length > 0) {
    usageError(`unexpected argument ${supportedOptions[0]}`);
  } else {
    try {
      const policy = JSON.parse(await readFile(file, "utf8"));
      const result = checkPermit(policy);
      const report = jsonCount === 1 ? JSON.stringify(result, null, 2) : formatPermitReport(result);
      if (outputFile) {
        const { writeFile } = await import("node:fs/promises");
        await writeFile(outputFile, `${report}\n`, "utf8");
      } else {
        console.log(report);
      }
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

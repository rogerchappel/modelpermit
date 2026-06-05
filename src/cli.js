#!/usr/bin/env node
import { VERSION, describeModelPermit } from "./index.js";

const arg = process.argv[2] ?? "--help";
if (arg === "--version" || arg === "-v") {
  console.log(VERSION);
} else if (arg === "--help" || arg === "-h" || arg === "help") {
  console.log(`modelpermit ${VERSION}\n\n${describeModelPermit()}\n`);
} else {
  console.error(`modelpermit: unknown argument ${arg}`);
  process.exitCode = 2;
}

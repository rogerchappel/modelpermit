import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { describe, it } from "node:test";
import { promisify } from "node:util";

import { VERSION, checkPermit, describeModelPermit } from "../src/index.js";

const execFileAsync = promisify(execFile);

describe("modelpermit CLI", () => {
  it("describes the current release scope", () => {
    assert.equal(VERSION, "0.1.0");
    assert.match(describeModelPermit(), /validates local model-use policy drafts/);
  });

  it("prints help text from the executable entrypoint", async () => {
    const { stdout } = await execFileAsync(process.execPath, ["src/cli.js", "--help"]);

    assert.match(stdout, /modelpermit 0\.1\.0/);
    assert.match(stdout, /validates local model-use policy drafts/);
    assert.match(stdout, /modelpermit check modelpermit\.json/);
  });

  it("returns a non-zero code for unknown arguments", async () => {
    await assert.rejects(
      execFileAsync(process.execPath, ["src/cli.js", "--unknown"]),
      (error) => {
        assert.equal(error.code, 2);
        assert.match(error.stderr, /unknown argument --unknown/);
        return true;
      },
    );
  });

  it("validates strict policy objects without warnings", () => {
    const result = checkPermit({
      allowedModels: ["gpt-5-mini"],
      deniedModels: ["legacy-unsafe-model"],
      approvalMode: "manual",
      network: "none",
      writePaths: ["./reports"]
    });

    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.warnings, []);
  });

  it("warns on permissive network and root write scopes", () => {
    const result = checkPermit({
      allowedModels: ["gpt-5"],
      approvalMode: "auto",
      network: "any",
      writePaths: ["/"]
    });

    assert.equal(result.valid, true);
    assert.match(result.warnings.join("\n"), /network:any/);
    assert.match(result.warnings.join("\n"), /root access/);
  });

  it("rejects empty denied model and write path entries", () => {
    const result = checkPermit({
      allowedModels: ["gpt-5-mini"],
      deniedModels: ["", "legacy-unsafe-model"],
      writePaths: ["./reports", " "]
    });

    assert.equal(result.valid, false);
    assert.match(result.errors.join("\n"), /deniedModels entries/);
    assert.match(result.errors.join("\n"), /writePaths entries/);
  });

  it("rejects non-array write path scopes", () => {
    const result = checkPermit({
      allowedModels: ["gpt-5-mini"],
      writePaths: "./reports"
    });

    assert.equal(result.valid, false);
    assert.match(result.errors.join("\n"), /writePaths must be an array/);
  });

  it("fails invalid policy fixtures through the CLI", async () => {
    await assert.rejects(
      execFileAsync(process.execPath, ["src/cli.js", "check", "fixtures/invalid.json", "--json"]),
      (error) => {
        const report = JSON.parse(error.stdout);
        assert.equal(error.code, 1);
        assert.equal(report.valid, false);
        assert.ok(report.errors.length >= 2);
        return true;
      },
    );
  });
});

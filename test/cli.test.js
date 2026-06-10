import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { describe, it } from "node:test";
import { promisify } from "node:util";

import { VERSION, describeModelPermit } from "../src/index.js";

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
});

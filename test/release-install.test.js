import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import { checkReleaseInstall } from "../scripts/check-release-install.mjs";

function fixture({ lockfile = true, install = "npm ci" } = {}) {
  const root = mkdtempSync(join(tmpdir(), "modelpermit-release-install-"));
  mkdirSync(join(root, ".github/workflows"), { recursive: true });
  if (lockfile) writeFileSync(join(root, "package-lock.json"), "{}\n");

  for (const name of ["ci.yml", "release-dry-run.yml", "release.yml"]) {
    writeFileSync(
      join(root, ".github/workflows", name),
      `steps:\n  - name: Install dependencies\n    run: ${install}\n`,
    );
  }
  return root;
}

describe("release install readiness", () => {
  it("accepts a lockfile with npm ci in every release workflow", () => {
    assert.deepEqual(checkReleaseInstall(fixture()), []);
  });

  it("reports a missing lockfile", () => {
    assert.deepEqual(checkReleaseInstall(fixture({ lockfile: false })), [
      "package-lock.json is required for deterministic npm installs",
    ]);
  });

  it("reports workflows that use a non-deterministic install", () => {
    const errors = checkReleaseInstall(fixture({ install: "npm install" }));

    assert.equal(errors.length, 3);
    assert.match(errors[0], /ci\.yml must install project dependencies with npm ci/);
    assert.match(errors[1], /release-dry-run\.yml must install project dependencies with npm ci/);
    assert.match(errors[2], /release\.yml must install project dependencies with npm ci/);
  });
});

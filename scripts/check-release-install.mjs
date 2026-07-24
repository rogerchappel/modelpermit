import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const releaseWorkflows = [
  ".github/workflows/ci.yml",
  ".github/workflows/release-dry-run.yml",
  ".github/workflows/release.yml",
];

export function checkReleaseInstall(root = process.cwd()) {
  const errors = [];

  if (!existsSync(`${root}/package-lock.json`)) {
    errors.push("package-lock.json is required for deterministic npm installs");
  }

  for (const workflow of releaseWorkflows) {
    const path = `${root}/${workflow}`;
    if (!existsSync(path)) {
      errors.push(`${workflow} is missing`);
      continue;
    }

    const source = readFileSync(path, "utf8");
    if (!/run:\s*npm ci(?:\s|$)/m.test(source)) {
      errors.push(`${workflow} must install project dependencies with npm ci`);
    }
  }

  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = checkReleaseInstall();
  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exitCode = 1;
  } else {
    console.log("Release install contract is consistent.");
  }
}

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

  const releasePath = `${root}/.github/workflows/release.yml`;
  if (existsSync(releasePath)) {
    const release = readFileSync(releasePath, "utf8");
    const artifact = "${{ steps.pack.outputs.tarball }}";
    if (!release.includes('id: pack') || !release.includes('echo "tarball=$(npm pack --silent)" >> "$GITHUB_OUTPUT"')) {
      errors.push(".github/workflows/release.yml must capture the npm pack output as the pack output");
    }
    const policyPath = `${root}/releasebox.config.json`;
    let publishNpm = true;
    if (existsSync(policyPath)) {
      try {
        publishNpm = JSON.parse(readFileSync(policyPath, "utf8")).release?.publishNpm !== false;
      } catch {
        errors.push("releasebox.config.json must be valid JSON to verify npm publishing policy");
      }
    }
    const publishesNpm = /(?:^|\n)\s*run:\s*npm publish\b/.test(release);
    const workflowEnablesPublishing = /PUBLISH_NPM:\s*['\"]?true['\"]?/.test(release);
    if (publishNpm && !release.includes(`npm publish "${artifact}" --provenance --access public`)) {
      errors.push(".github/workflows/release.yml must publish the pack output with provenance and public access");
    }
    if (publishNpm && !workflowEnablesPublishing) {
      errors.push(".github/workflows/release.yml must enable PUBLISH_NPM when release.publishNpm is true");
    }
    if (!publishNpm && (workflowEnablesPublishing || !release.includes("if: ${{ env.PUBLISH_NPM == 'true' }}"))) {
      errors.push(".github/workflows/release.yml must disable npm publishing when release.publishNpm is false");
    }
    if (!release.match(new RegExp(`gh release create[^\\n]+\\$\\{\\{ steps\\.pack\\.outputs\\.tarball \\}\\}`))) {
      errors.push(".github/workflows/release.yml must use the pack output as the release attachment");
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

# modelpermit

Model and provider permission policy checks for agent workflows.

## Status

This repository is an early v0.1.0 implementation. It contains a small local-first policy checker plus project governance, product notes, and release hygiene files. Treat it as preview software until more policy shapes and workflow examples are covered.

## Install

For local development:

```sh
npm install
```

## Use

Check a local model permit policy:

```sh
modelpermit check modelpermit.json
modelpermit check modelpermit.json --json
```

From a checkout, use the bundled fixtures to preview strict and permissive
policy reports:

```sh
node src/cli.js check fixtures/strict.json
node src/cli.js check fixtures/dangerous.json --json
```

`fixtures/malformed.json` is intentionally invalid and is used by the smoke
checks to prove malformed field shapes fail before release.

## Runnable demo

Compare a strict policy with an over-broad policy, then confirm an invalid
policy fails validation:

```sh
bash demo/review-permission-policies.sh
```

The demo uses only checked-in fixtures and does not contact a model provider or
enforce permissions at runtime. See the
[permission policy review tutorial](docs/tutorials/review-permission-policies.md)
for the expected findings and guidance on using the JSON output in automation.

## Policy shape

`modelpermit` currently validates a compact JSON policy:

```json
{
  "allowedModels": ["gpt-5-mini"],
  "deniedModels": ["legacy-unsafe-model"],
  "approvalMode": "manual",
  "network": "none",
  "writePaths": ["./reports", "./tmp"]
}
```

Required:

- `allowedModels`: non-empty array of model ids.

Optional:

- `deniedModels`: array of model ids that must not be used.
- `approvalMode`: one of `manual`, `ask`, or `auto`.
- `network`: one of `none`, `allowlist`, or `any`.
- `writePaths`: array of local write scopes.

When an optional field is present, its value must match the documented type or
allowed values; falsy values such as `null`, `false`, and an empty string are not
treated as omitted fields.

Release-review warnings are emitted for `network: "any"` and root write access
because those permissions are easy to over-grant before publishing an agent
workflow.

## Verification

Run the repository checks before opening a pull request:

```sh
npm test
npm run build
npm run smoke
npm run package:smoke
npm run release:check
```

`npm run release:check` is the broader release-readiness gate used by CI. It
combines syntax checks, tests, fixture-backed CLI smoke coverage, and the dry-run
npm pack check.
## CLI Help Smoke

Confirm the packaged command starts and prints its help text before relying on a release tarball or downstream automation:

```bash
node ./src/cli.js --help
```

The command should exit successfully, print the available options, and avoid reading project files or contacting external services.

## Limitations

- The package is still a v0.1.0 project and validates a small portable JSON shape rather than enforcing permissions at runtime.
- Treat the PRD as direction, not a guarantee that every listed capability is implemented.
- Do not use the package as the only control for production security, compliance, or release decisions until tests and examples cover your policy workflow.

## Package contents

The npm package allowlist includes the runtime files plus the public support
documents needed for release review: `README.md`, `LICENSE`, `SECURITY.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`.
The package also includes `fixtures/` so consumers can run the same strict,
dangerous, and invalid policy checks used by the smoke tests.
Run `npm run package:smoke` or `npm pack --dry-run` before publishing to
confirm those files are still present in the tarball.
The maintained `package:smoke` script asserts the CLI entrypoint, library
source, support docs, and every policy fixture that backs the smoke tests.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution expectations. Changes should be small, reviewable, and verified before review.

## Security

See [SECURITY.md](SECURITY.md) for vulnerability reporting guidance.

## License

MIT

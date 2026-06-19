# modelpermit

modelpermit is an early-stage local-first developer tool.

## Status

This repository is early-stage. The README now reflects the current project intent from `docs/PRD.md`, but behavior should still be treated as pre-1.0 until implementation, examples, and release checks mature.

## Install from a checkout

```sh
git clone https://github.com/rogerchappel/modelpermit.git
cd modelpermit
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

## Verification

```sh
npm test
npm run package:smoke
npm run release:check
```

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes small, update the PRD or README when scope changes, and include the exact verification command in every pull request.

## Security

See [SECURITY.md](SECURITY.md). Do not include secrets, private tokens, proprietary dependency data, or sensitive logs in public issues or examples.

## License

MIT

## Verification

Run the release-readiness checks before publishing or cutting a PR:

```bash
npm run build
npm run test
npm run smoke
npm run package:smoke
npm run release:check
```

Use `npm run package:smoke` or `npm pack --dry-run` to confirm the published tarball includes the support docs and runnable package contents.

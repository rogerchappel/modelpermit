# PRD: modelpermit

Status: in-progress
Decision: build now
Factory run: 2026-05-29 PM

## Pitch

`modelpermit` is a local policy checker for AI model and tool permissions. It validates config files so repos can explain which models, tools, network scopes, and write paths are allowed before an agent runs. 🪪

## Source Attribution

Inspired by local agent config patterns, desktop agent permission modes, and recent safety concerns around MCP/tool permission surfaces. This is a small static policy validator, not a runtime sandbox or vendor-specific controller.

## Problem

Repos increasingly contain agent config files, but allowed model/tool/network/write scopes are often implicit. Teams need a portable permit file that can be checked in CI and summarized for humans.

## V1 Scope

- Node.js CLI package.
- `modelpermit check modelpermit.json`, with `init` and `explain` reserved for later releases.
- JSON policy shape for allowed models, denied models, path scopes, network policy, and approval mode.
- Validate configs with actionable errors and warnings.
- Emit Markdown and JSON reports.
- Include fixtures for strict, invalid, and dangerous policies.

## Out of Scope

- Enforcing permissions at runtime.
- Vendor API calls.
- Secret storage.

## Verification

Run `npm test`, `npm run build`, `npm run smoke`, `npm run package:smoke`, `npm run release:check`, `bash scripts/validate.sh`, and an end-to-end check smoke against the bundled fixtures.

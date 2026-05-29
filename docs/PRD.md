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

- TypeScript CLI package.
- `modelpermit init`, `modelpermit check modelpermit.json`, and `modelpermit explain`.
- JSON schema for allowed models, denied models, tool capabilities, path scopes, network policy, secret handling, and approval mode.
- Validate configs with actionable errors and warnings.
- Emit Markdown and JSON reports.
- Include fixtures for strict, permissive, invalid, and dangerous policies.

## Out of Scope

- Enforcing permissions at runtime.
- Vendor API calls.
- Secret storage.

## Verification

Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, `bash scripts/validate.sh`, and an end-to-end init/check/explain smoke.


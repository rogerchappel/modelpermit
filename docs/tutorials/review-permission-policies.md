# Review model permission policies locally

`modelpermit` checks a small JSON permission contract before an agent workflow
is released. It validates the policy shape and highlights two permissions that
deserve explicit review: unrestricted network access and repository-external
root write access.

## Run the demo

From the repository root:

```sh
npm install
bash demo/review-permission-policies.sh
```

The script exercises four checked-in fixtures:

1. `fixtures/strict.json` is valid and produces no warnings.
2. `fixtures/dangerous.json` is valid, but warns about `network: "any"` and a
   root entry in `writePaths`.
3. `fixtures/malformed.json` has invalid field shapes and must exit non-zero.
4. `fixtures/conflicting.json` puts model ids in both allow and deny lists and
   must exit non-zero with the conflicting ids sorted in its diagnostic.

The second case is deliberately a warning rather than a failure. `modelpermit`
validates and reports policy intent; it does not decide whether broad access is
appropriate for a particular workflow.

## Use JSON in an automated review

```sh
node src/cli.js check fixtures/dangerous.json --json
```

The JSON report contains `valid`, `errors`, and `warnings`. A review step can
inspect `warnings`, while malformed or contradictory policies already return a
non-zero exit status. Do not treat a valid report as runtime
enforcement: the CLI does not call providers, intercept model requests, or
restrict filesystem and network access.

## Try your own policy

Copy `fixtures/strict.json`, adjust the model ids and permission fields, and run:

```sh
node src/cli.js check path/to/modelpermit.json
```

Keep policies free of credentials. The checker only needs permission metadata.

# Local acceptance evidence

The integrated implementation is the required PR stack (PRs 1–6), followed by the acceptance/lifecycle PR. The app feature source is commit `1753416`; the final acceptance PR records the exact integrated commit and CI result.

## Verified locally

- Backend: 47/47 pytest tests passed in the primary checkout's standalone Python 3.12 virtual environment. Independent reviewer command: `OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 npm run test:backend`. One upstream Starlette/AnyIO deprecation warning; no failures.
- Browser acceptance: default `npm run test:e2e` passed 14/14 in 50.8 seconds, with one worker and no retries. The harness created its own proxy and app pair. After completion, no listeners remained on ports 3000, 8000, or 8001.
- An earlier production-mode shared-instance run passed 14/14. The suite covers real CSV recommendations, all 40 products, name/SKU search, pagination, unique selection, keyboard/mobile, refresh reset, exact full-basket clearing/restoration, independent loading/errors/retry, server Suspense, reduced motion, and stale response races.
- Every browser recording was converted to H.264 MP4 and fully decoded successfully. JSON attachments point to MP4. An actual initial selector failure also verified screenshot/trace/video retention; the ambiguous locator was corrected.
- Standards and spec reviewers found a missing default fixture lifecycle; it was fixed and independently re-reviewed without remaining blocking findings. The clean default run above verifies that fix.
- Root build/run share environment loading so public API configuration is consistent at build and runtime. The primary virtual environment no longer depends on a disposable worktree.

## Manual browser evidence

[Desktop walkthrough](demos/manual-desktop.mp4) records actual browser frames during manual actions: landing navigation, SKU search, clean disabled Added state, GE/Dahua supported pair, Axis unsupported addition, removal restoring the recommendation, adding the recommendation, and clear-all.

[Mobile walkthrough](demos/manual-mobile.mp4) records an independent 390×844 browser review. [Review notes](demos/mobile-review.md) cover keyboard add/remove, basket navigation, unique selection, focus, refresh reset, and no horizontal overflow. Both MP4 files were fully decode-verified; visual states were reviewed during capture.

The demo uses co-purchase evidence, not product compatibility. See [model report](../server/MODEL_REPORT.md) for the five-of-fourteen supporting example.

## Resource discipline

One shared app pair and one browser worker at a time. No unrelated user processes were stopped. Numerical and video-conversion threads are bounded. Test servers are owned and cleaned up by the harness; an occupied app port causes startup to fail rather than silently creating a duplicate.

## Reproduce and package

Follow the root README for separate dependency setup, `npm run dev`, and checks. Run browser tests with the app stopped so the harness can own its fixtures. The generated `test-results/videos.md` indexes all automated MP4s.

After the required stack is merged, create the source ZIP from tracked files with `git archive --format=zip --prefix=tandem/ HEAD`. It includes source, authoritative CSV, dependency locks, tests, and documentation; ignored environments, build output, local secrets, and temporary captures are excluded. The final handoff records the archive's exact commit and checksum.

Deployment is a separate unmerged PR. A locally passing app is not evidence of a successful hosted deployment.

## Clean-install repair

Remote CI exposed an npm10/npm11 lockfile interpretation mismatch in optional native/WASM dependencies. The repository now declares npm11.6.2 and CI installs that exact version before npm ci. A clean client npm ci succeeds locally. ESLint9.39.5 matches the declared peer ranges of Next's React/import plugins; it emits an upstream support-lifecycle notice and remains a development-only tool. The production application dependency versions are unchanged. The existing dev-only glob/braces audit advisory has no compatible upstream remediation in this Next configuration; lint inputs are repository files, not app requests. No forced framework downgrade was applied.

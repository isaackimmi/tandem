# Manual mobile acceptance review

Reviewed by the standards agent on October 17, 2026, against the integrated required app at `1753416` plus the uncommitted lifecycle, CI, and browser-test changes. The coordinator supplied the single running app pair. This review did not launch another app or browser-test worker.

## Observed behavior

Using the connected Chrome browser through CUA at a 390 × 844 viewport:

- The catalog, mobile section links, basket, and recommendation panel fit the viewport. Read-only DOM inspection confirmed `scrollWidth === innerWidth === 390`.
- Searching SKU `0806-001` produced the Axis M3046-V Network Camera.
- Pressing Enter on Add selected one product. The row stayed white and displayed a borderless, disabled checkmark/Added action. Exactly one corresponding Remove control existed.
- The Basket section link navigated to the basket. The genuine backend returned Pelco IMP1110-1ES IP Camera as a suggestion for the selected item.
- Pressing Enter on Remove emptied the basket, restored the catalog Add action, cleared suggestions, and moved focus to the basket heading.
- Explore the catalog returned to the catalog section. Adding again and refreshing reset the basket and search; no Remove controls remained.
- Restored the normal viewport and closed the agent-created tab afterward.

No blocking visual or interaction issue was found in this journey. Automated tests cover races, failure recovery, reduced motion, and the full-basket multi-product scenario; this manual recording does not replace those checks.

## Recording evidence

[Manual mobile recording](manual-mobile.mp4): real H.264 MP4, yuv420p, 390 × 844, 24 fps, 23.63 seconds, 567 decoded frames. The recording consists of 140 timestamped browser screenshot frames captured alongside actual CUA interactions, encoded with their elapsed capture intervals. Raw frames and the concat manifest are local ignored evidence under `artifacts/manual-mobile-review/`.

Encoding and verification commands from the repository root:

```sh
node_modules/ffmpeg-static/ffmpeg -y -v error -f concat -safe 0 -i artifacts/manual-mobile-review/frames.ffconcat -vf fps=24 -c:v libx264 -threads 1 -pix_fmt yuv420p -movflags +faststart docs/demos/manual-mobile.mp4
node_modules/ffmpeg-static/ffmpeg -v error -threads 1 -i docs/demos/manual-mobile.mp4 -f null -
```

Both completed successfully. A subsequent metadata/decode inspection confirmed the MP4 container, H.264 codec, full duration, resolution, and 567 successfully decoded frames.

## Static review outcome

The previously identified missing local test-proxy lifecycle is resolved by the current harness. Default browser runs start their fixture, set server/browser origins, and avoid reusing an incompatible app unless explicitly requested. The virtual-environment symlink is now ignored; the coordinator is replacing it with a durable primary-checkout environment before delivery.

## Independent backend verification

After the coordinator replaced the symlink with a standalone primary-checkout environment, this reviewer ran `OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 MKL_NUM_THREADS=1 npm run test:backend`. It exited 0 with **47 passed, 1 warning in 29.42s**. The warning is Starlette's upstream use of AnyIO's deprecated `BlockingPortal` alias. This check used HEAD `1753416e2056e760ce40df0fcd7a0535b4f6d117` plus the current uncommitted integration changes.

[Notion verification log](https://app.notion.com/p/3fde7d562b8181629544fa9996c1b432) records this review, the mobile evidence, resolved findings, and test result.

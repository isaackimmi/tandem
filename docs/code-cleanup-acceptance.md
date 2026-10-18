# Code cleanup acceptance — October 17, 2026

The cleanup preserves the current API contract, exact-basket matching and Apriori configuration. Backend PR #13 separates endpoints, shared schemas and data-science logic. The frontend uses one component per file, named component directories, Tailwind/daisyUI styling, and colocated CSS Modules for the few custom effects. globals.css contains theme, document and accessibility defaults only.

## Verification

- Backend: 48 pytest tests passed, including real CSV and Vercel bundle checks.
- Frontend: lint, TypeScript, three API tests and production build passed.
- Playwright: all 15 cases passed with one worker; all 15 videos converted to H.264 MP4 and fully decode-verified.
- Independent source review approved backend and frontend changes, including final focus and reduced-motion fixes.
- Manual production-mode checks passed: landing/navigation, default ten rows, page sizes 5/10/20/40, pagination, search/no matches, unique selection, selected state, basket retention, removal, clear, refresh reset, keyboard input, mobile layout and reduced motion.
- Real-data manual journey: GE 60-652-95R plus Dahua DH-IPC-HDBW4431R-ZS recommends Hikvision DS-2CD2142FWD-I. Adding Axis 0806-001 clears recommendations; removing it restores them.
- Manual controlled request checks passed: pending recommendations leave catalog usable; recommendation and catalog failures retry successfully while preserving basket/search. Automated cases additionally cover stale request races and initial server Suspense/failure.

## Issues resolved

An initial Playwright run caught an identity transform under reduced motion. Transform-based, motion-safe button scaling restored the required no-transform behavior without weakening tests. Manual inspection then caught duplicate search focus outlines; a scoped utility suppresses the inner ring while daisyUI retains the accessible outer focus-within ring. The complete suite and production build passed again after the fix.

## Evidence and scope

[Final desktop/mobile manual MP4](demos/manual-code-cleanup.mp4). The recording is an actual H.264 MP4 with a successful full decode check. Automated MP4 recordings are emitted under test-results and retained by CI.

Notion TASK-23 tracks cleanup and its Logs. TASK-24 separately tracks the pending Apriori configuration proposal. No threshold changes were applied during this refactor.

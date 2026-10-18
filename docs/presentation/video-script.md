# Tandem — read-aloud demo script
**Target:** roughly two minutes, including a short live walkthrough. Rehearse once at your natural pace; timings below are a guide, not a measured recording duration.
**Audience page:** [Tandem presentation](https://app.notion.com/p/3fde7d562b8181fa9a30e1a95cc96090)
**Delivery:** conversational, unhurried, with brief pauses after the three metric values. Read quoted paragraphs only. Stage directions are not narration.

## Before recording
Open the presentation page and the local app in separate tabs. Start the app with the documented root command after dependency setup. In the app, open the workspace, clear the basket, and leave it empty. Keep this script on another display or device outside the recording area.

Notion's native Presentation Mode is documented for Plus, Business, and Enterprise plans and is currently beta. Divider blocks define slides, and the page title is the opening slide. Enter with **••• → More → Present** or **⌘ Option P** on Mac; use arrow keys and Escape. Links and speaker notes do not function as presentation controls, so switch to the pre-opened app tab for the live demo. Verified in Isaac's workspace: ⌘ Option P opens seven native presentation slides. The coordinator inspected every slide at 1512 × 949 with no clipping, exited to the live app, and returned to the closing slide. This verifies the visual presentation and tab transition; the two-minute narration timing remains an estimate. [Official Notion guide](https://www.notion.com/help/presentation-mode)

## 0:00–0:15 · Opening
**Show:** title, then “A basket. A better next choice.”
> “Meet Tandem. It recommends products based on what people bought together. Our starting point is one thousand recorded transactions and forty products. You build a basket, and Tandem looks for a relevant next item.”

## 0:15–0:35 · The algorithm
**Advance:** “Find the pattern. Respect the evidence.”
> “We use Apriori to find frequent product combinations, then generate association rules. A rule needs at least half a percent support, fifteen percent confidence, and lift above one. We chose a five-transaction minimum because a ten-transaction minimum produced no qualifying two-item rules.”

## 0:35–0:55 · Make the numbers concrete
**Advance:** “Five baskets tell a story.” Point once at each number.
> “Here's a real example. Five transactions contain this detector and both cameras. That's half a percent support. Five of the fourteen baskets containing the starting pair include the suggested camera: thirty-five-point-seven percent confidence. Lift is about three-point-five-four, compared with the suggested camera's overall frequency.”

## 0:55–1:12 · Architecture
**Advance:** “Mine once. Match every change.”
> “The Python backend validates the CSV and mines rules once when it starts. Next.js handles the interface. FastAPI serves the catalog and matches each complete basket against the rules held in memory. Changing your basket performs a lookup; it doesn't retrain the model.”

## 1:12–1:48 · Live demonstration
**Advance:** “The whole basket matters.” Exit Presentation Mode and switch to the pre-opened local workspace.
1. Search `60-652-95R`. Add the GE Interlogix carbon monoxide detector.
2. Search `DH-IPC-HDBW4431R-ZS`. Add the Dahua camera.
3. Briefly point to the Hikvision recommendation, `DS-2CD2142FWD-I`.
4. Search `0806-001`. Add the Axis camera.
5. Pause on the no-recommendations state. Remove the Axis camera from the basket.
6. Pause on the restored Hikvision recommendation. Do not add the recommended item before this step.

> “Let's add the detector and the Dahua camera. Tandem recommends this Hikvision camera. Now I add another product. There's no qualifying rule for the entire new basket, so suggestions disappear. Remove that product, and the recommendation returns. Every change uses the whole basket.”

## 1:48–2:00 · Close
**Show:** return to Notion and present “Thoughtful suggestions. Clear limits.”
> “These are observed co-purchase patterns, not compatibility guarantees or measured prediction accuracy. Tandem makes those patterns useful through a simple, responsive shopping experience.”

## Architecture reference
![Tandem architecture](architecture.png)

[Editable draw.io source](architecture.drawio)

## Optional technical appendix — not part of the two-minute narration
**Support.** For antecedent A and suggested product B, support is the fraction of all transactions containing A and B together: count(A ∪ B) ÷ 1,000.

**Confidence.** Among transactions containing A, the fraction that also contain B: count(A ∪ B) ÷ count(A). In the real pair example, 5 ÷ 14 ≈ 0.35714.

**Lift.** Confidence ÷ support(B). The suggested Hikvision camera occurs in 101 of 1,000 transactions, so (5 ÷ 14) ÷ 0.101 ≈ 3.536. Lift describes association relative to the item's observed base rate. It does not establish causation or compatibility.

**Why 0.005 support?** At 0.01 support, the source yields 147 frequent itemsets and 12 eligible rules, all with single-item antecedents. At 0.005, it yields 673 itemsets and 15 eligible rules, including three two-item antecedents. Confidence stays at 0.15 and lift stays strictly above 1. This is an explicit demonstration tradeoff with sparse evidence.

**Apriori's pruning idea.** If a product set is frequent, its subsets must also be frequent. Apriori uses this property to avoid exploring combinations whose smaller subsets already fail the support threshold.

**Request policy.** A rule's antecedent must equal the complete selected basket. No subset rule, popularity fallback, or automatic threshold relaxation is used. Suggestions exclude selected products and sort by confidence, lift, support, then SKU.

**Product behavior.** One selection per SKU; no quantities. Refresh resets the basket. Old recommendations disappear immediately when the basket changes, and late responses cannot replace newer state. Local loading and error boundaries keep unrelated controls usable.

**What we can claim.** The source has 1,000 transactions and 40 unique products. The selected thresholds yield 15 rules. Tests verify software behavior; they do not establish recommendation accuracy. A held-out evaluation and detailed evidence UI are outside scope.

**Hosting.** The diagram describes the local implementation. The optional deployment work targets Next.js and FastAPI on Vercel in the same monorepo; it must remain an unmerged PR for Isaac's review. Do not describe it as deployed.

## Review and rehearsal evidence
- Narrative and diagram agents cross-reviewed data, algorithm, API flow, and numerical claims against implementation and calibration sources; no unresolved factual findings.
- The coordinator entered native Presentation Mode in Isaac's workspace and inspected all seven slides at 1512 × 949. Metric columns, headings, and architecture fit without clipping.
- The coordinator exited presentation, accessed the live app preview, and returned with ⌘ Option P to the closing slide (7 of 7).
- Both Notion pages contain their final architecture images; the script also provides editable draw.io/SVG sources.
- [Visual/navigation rehearsal MP4](presentation-rehearsal.mp4) and [architecture slide screenshot](notion-architecture-slide.png) preserve the actual workspace evidence.
- This short rehearsal verifies visuals and navigation. It is not a fully narrated two-minute demo, and the 229-word script's duration remains an estimate.

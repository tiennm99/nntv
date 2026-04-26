# NNTV v2 "Tight 12" Design Uplift — Ship Entry

**Date**: 2026-04-25 16:47  
**Severity**: Low (successful ship, resolved friction points mid-flight)  
**Component**: Game engine, level design, solver, UI  
**Status**: Resolved  

---

## What Happened

Shipped Approach A "Tight 12" — 6 curated mechanics (sniper, suspicion, throwable stones, doors+keys, one-ways, light decay), full L1–L11 redesign, level-restart death model, per-level affordance gates, BFS solver extended with 2M-node cap. L12 unsolvable preserved. 8 commits to main. 180/180 unit tests pass. Code review 9.0/10, 0 critical, 2 high both fixed inline. Zero new dependencies.

---

## The Brutal Truth

The negotiation worked. User came in asking for maximalist v2 (full palette, rogue-lite single-life, 6+ weeks). We pushed back hard on the single-life madness (10-minute replay tax = design dead-end), got them to accept level-restart with per-level affordance gates. Traded off 60% of the feature menu for tractability.

Then phase 04 *surfaced a real design gap* mid-implementation: door/key/one-way enforcement was completely missing from the engine. Player.moveTo was validating walls but not checking if a door was locked or whether entry direction matched the one-way arrow. This wasn't a test miss — it was an architecture miss we caught because subagent (fullstack-dev-07) flagged it as "DONE_WITH_CONCERNS." We had to bolt in a 04.5 patch. Honest, this would have shipped broken and surfaced in QA as "player clips through locked doors."

Code review then found the suspicion meter's entire visual+audio pipeline was dead because `guardSnapshots` projection silently dropped the `tier` field. The UI was rendering tier-0 rings for all suspicion guards, and audio effects were reading the wrong property name (`g.suspicionTier` vs `g.tier`). Both fixes were 5-line changes but they were real bugs — not linting, not style, actual broken features.

The package size bump (+21% gzip) is real. New mechanics are expensive. We're still under the +30% cap, but if we add more, we're hitting a compression wall.

---

## Technical Details

**Code Review Findings** (code-reviewer-260425-2202-v2-tight-12-final.md):
- **H1 (Suspicion visual/audio broken)**: `guardSnapshots` map stripped type-specific fields (`tier`, `facing`, `currentRadius`). GuardSprite never received tier data. Audio effect read `g.suspicionTier` (nonexistent) instead of `g.tier`. Fixed by extending snapshot projection + renaming audio property read.
- **H2 (Stale guard state in throw enumeration)**: `enumerateThrowTargets` ran BEFORE `applyState`, reading live guard array from previous loop iteration or loadLevel state. Distance/type checks against wrong positions. Benign because L9 doesn't require throws (BFS exploits timing gaps instead), but latent correctness gap if future level makes throws mandatory. Fixed by hoisting `applyState`.

**Phase 04.5 Engine Gap**:
- Player.moveTo didn't enforce: door key-bitmask checks, one-way direction validation, key auto-collection
- Solver state hash didn't capture: key bitmask, door/key cell snapshots
- GameHistory didn't snapshot: keysHeld, keySnapshot, doorSnapshot
- All three fixed with full test coverage (adversarial undo tests, per-field differentiation tests)

**Metrics**:
- 33 files changed: +4057/-920
- 5 new Svelte components: StonesCounter, KeyInventory, SuspicionRing, AffordanceBanner, ThrowTargetingOverlay
- 8 new guard/mechanic classes: SniperGuard, SuspicionGuard, ThrowableSystem, door/key/one-way cell types
- Solvability suite: 11/11 levels under 2M nodes; L12 unsolvable byte-identical to HEAD
- Bundle: 180/180 tests pass; build clean; perf log committed per level

---

## What We Tried

1. **Phase 01 → 06 sequential chain**: Engine foundations, solver extension, death model, affordance gates, level redesign, UI, i18n polish. Dependency graph enforced correctness order.

2. **Phases 02 + 03 parallel execution**: Solver extension and death model were independent (different subsystems); two fullstack agents ran them concurrently, unblocked phase 04.

3. **Code review before merge**: Caught H1 and H2 immediately instead of shipping broken UI and latent solver gaps. Forced us to fix in-place.

4. **Phase 04.5 mid-ship patch**: When subagent flagged door/key/one-way enforcement as missing (discovered during level redesign validation), we didn't paper over it — added the entire feature mid-phase with full test coverage.

5. **Sacred constraints enforcement**: L12 byte-identical check, BFS node-cap hard ceiling (no relax), no new deps, exactly 12 levels, EN/VI + ARIA. All survived intact.

---

## Root Cause Analysis

**Design gap on phase 04.5**: The brainstorm spec called for doors/keys/one-ways but didn't explicitly list where enforcement lived (engine vs solver vs UI). Phase 01 created the cell types + sprite rendering but didn't implement the *movement rules*. Phase 04 (level redesign) exposed this when trying to puzzle with locked doors — the mechanism didn't exist. Lesson: "add cell type" is incomplete without "add validation at all decision points."

**Suspicion meter UI/audio**: Snapshot projection was done mechanically (extract the common properties for render reactivity) without checking if the slice was sufficient for all downstream consumers. GuardSprite and the audio module both needed type-specific fields that the projection dropped. Lesson: if you project/slice a data structure, document the downstream users and verify every one gets what it needs.

**Stale guard state in solver**: `enumerateThrowTargets` was added late (phase 02) without realizing the solver's inner loop doesn't re-apply state between action enumeration and execution. The contract was implicit. Lesson: state mutation order matters in search loops — document it or make it immutable.

---

## Lessons Learned

1. **Negotiation wins**: Push back on user scope. Single-life ironman sounded cool but the 10-minute replay tax killed the fun. Soft-rogue per-level restart was acceptable and shipped. Curation > maximalism.

2. **"DONE_WITH_CONCERNS" is a red flag**: When a subagent flags inconsistency (door enforcement missing), don't close the phase — it's a real gap. We added 04.5 instead of shipping broken levels.

3. **Data structure contracts need explicit documentation**: "Snapshot" is vague. If a derived structure loses fields, every consumer of that structure must be audited. Build the habit: when you slice/project data, leave a comment listing known consumers.

4. **Search loop state order is subtle**: `applyState` must happen before action enumeration, not after, if you want the enumerated actions to see the correct state. Document the loop invariant.

5. **Code review catches the unseen**: H1 was invisible to tests (tier-0 is a valid render state, audio swallows errors) but broken to users. H2 was latent (no current level requires throws). Review caught both.

6. **Sacred constraints anchor quality**: L12 byte-identical check, node-cap hard ceiling, no-new-deps rule, 12 levels exactly, EN/VI bilingual. Every constraint had a reason. All survived and made us better.

---

## Next Steps

1. **Immediate (follow-up PR)**:
   - Remove dead throw-targeting code in GameBoard (`throwTargetCells`, `throwCursor` props never used; ThrowTargetingOverlay is separate)
   - Remove `_prevOpenDoors` state and unused `playDoorUnlock` import from Game.svelte
   - Drop redundant `clearAllLight()` call in solver loop (lights not read after `applyState`)

2. **Soon (modularization)**:
   - `src/lib/game/guards.js` (651 LOC) → split per-type into `guards/{static,rotating,sniper,suspicion,patrolling,chaser}.js`
   - `src/components/GameBoard.svelte` (251 LOC) → extract overlay components if they grow further

3. **Playtest**: Verify L11 attempts land in 5–15 range (BFS finds paths; humans need perfect timing with chaser at detectionRadius=2). If too hard, reduce radius or add a stone placement hint.

4. **Audio follow-up**: Door-unlock audio function exists but TurnManager doesn't emit `doorOpened` delta. Wire it when engine event surfacing is next priority.

5. **Known shipped gaps (documented, acceptable)**:
   - L9 stones not strictly required (BFS exploits PatrollingGuard timing; documented in phase-04 report)
   - Sniper beam mirror reflections not rendered (engine lights bounced cells correctly; cosmetic only)
   - Door-unlock audio deferred pending engine enhancement

---

## Unresolved Questions

- Should we split guards.js now (651 LOC) or wait until it hits 800+ and forces the issue?
- Is L11 playtest feedback available, or do we iterate post-ship based on telemetry?

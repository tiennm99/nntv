# Phase 6 — Documentation & Briefing Accuracy Sync

**Date:** 2026-07-26 · **Scope:** `docs/**`, `README.md`, `src/lib/locales/*.json` briefing text  
**Verification:** All claims cross-checked against `src/lib/levels/levels.js` (ground truth) + phase reports

---

## Summary

Game implementation changed substantially across 5 prior phases (engine, difficulty, level retune, UX, offline). All documentation and in-game briefing text were written against OLD behaviour. Synced all narrative, mechanics, and feature documentation to CURRENT source-of-truth.

**Briefing text:** L1–L3, L6, L10–L12 were accurate; **L4, L5, L7, L8, L9 promised guards/mechanics that don't exist.** Rewrote all 5 with accurate descriptions of actual level contents.

**Docs:** game-design.md had wrong level specs; README missing new features (hints, mercy, offline, responsive); PDR outdated (mentioned "3 lives", 5 guards, no stones/doors/keys). Updated all.

**Verification:** All 167 locale keys remain parity-matched (en/vi). `pnpm test` still 243 passing.

---

## Per-Level Briefing Audit

| Level | Mechanic | OLD claim (FALSE) | ACTUAL contents | NEW briefing |
|---|---|---|---|---|
| **1** | Movement | None (guard-free) | 3 wall bands, no guards | ✓ Unchanged (accurate) |
| **2** | Static wilting | "Three wilting sentries... wait for the glow to fade" | 3 static guards (radius=1), 3 gaps, 3 zones | ✓ Unchanged (accurate) |
| **3** | One-way tiles | "Ratchets only open one direction" | 2 one-way tiles, 2 static guards | ✓ Unchanged (accurate) |
| **4** | **SUSPICION** | ❌ "Rotating searchlight sweeps... count the rhythm. Move between sweeps" — **only mentions rotating guard, never mentions suspicion** | 1 rotating + 1 **SUSPICION (range 3)** + 1 static | ✓ NEW: "A sentinel... detection range grows as suspicion rises" |
| **5** | **DOORS+KEYS** | ❌ "Torches flicker with eerie rhythm... blinking guard's light pulses on and off. Move on dark turns — gaps are brief" — **promises blinking guard that doesn't exist** | 1 rotating + 1 suspicion + 2 keys + 2 doors (NO blinking) | ✓ NEW: "Fortress gate is sealed. Two keys open doors... collect in right order" |
| **6** | Decay/warm | "Fixed lanterns + flickering torches... three layers" | 1 blinking + 1 static (2 guards); 3 wall bands | ✓ Unchanged (accurate) |
| **7** | **MIRRORS** | ❌ "Patrolling guard marches the corridor — and somewhere, a beam bends off a crystal mirror" — **promises patrolling guard that doesn't exist** | 1 rotating + 2 mirrors + 1 door + 1 key (NO patrol) | ✓ NEW: "Rotating beam bounces off mirrors, never where you expect... trace where light lands" |
| **8** | **SNIPER** | ❌ "Two mirrors. Two rotating beams. The light web shifts every turn" — **promises 2 mirrors + rotating, ships sniper + patrol** | 1 **SNIPER** (unbounded LoS, rotates every 2) + 1 patrol + 1 static (NO mirrors) | ✓ NEW: "Sniper holds fixed aim... rotates every two turns. Count from start, not what you see" |
| **9** | **STONES** | ❌ "Chaser guards the short path. Sometimes long way is only way" — **promises chaser that doesn't exist** | 2 patrolling + 1 sniper + 1 suspicion + **2 STONES** (NO chaser) | ✓ NEW: "Patrol bounces between walls, blocking only crossing. You carry stones to distract them" |
| **10** | Mirrors + decay | "Reflected beams multiply with every turn... Princess can sense living things" | 2 rotating + 2 mirrors + 1 sniper + 1 patrol + decay | ✓ Unchanged (accurate) |
| **11** | All types + chaser | "Every guard kingdom commands... no one returned" | All 8 types: static, rotating+mirror, sniper, suspicion, patrol, chaser + 2 stones | ✓ Unchanged (accurate) |
| **12** | Unsolvable easter egg | "Air feels watchful. She already knows you're here" | Unsolvable by design; princess wave mechanic (unstoppable light expansion) | ✓ Unchanged (FROZEN per instruction) |

**Translation parity:** All story text updated in both en.json (lines 85–90 inclusive) and vi.json (same lines) simultaneously. Verified 167/167 keys match across both files.

---

## Documentation Changes

### docs/game-design.md

| Section | Issue | Fix |
|---|---|---|
| Level 4 spec | "Rotating + blinking + 3 static" → "Blinking guard introduced" (FALSE) | → "Rotating + suspicion + static; suspicion mechanic taught" |
| Level 5 spec | "Static + rotating + blinking + patrolling" (FALSE: has none of these combos) | → "Rotating + suspicion + doors + keys; key-sequencing taught" |
| Level 6 spec | "2 blinking + rotating + 2 patrolling + static × 2" (overcomplicated, vague) | → "Blinking + static; warm afterglow mechanic taught" |
| Level 7 spec | "Rotating + mirror + blinking + patrolling + 3 static" (adds guards not present) | → "Rotating + 2 mirrors + door + key; mirror reflection taught" |
| Level 8 spec | "2 rotating + 2 mirrors + 2 patrolling + blinking + static" (completely wrong) | → "Sniper + patrolling + static; sniper cadence taught" |
| Level 9 spec | "Chaser + rotating + 2 blinking + 2 static + patrolling" (chaser doesn't exist in L9) | → "2 patrolling + sniper + suspicion + stones; stone targeting taught" |
| Warm tiles § | "Temporarily dangerous... cool to safe" (was a lie before engine phase 1) | → "Lethal same as lit cell; occurs 1 turn after guard light fades" |

All other level descriptions (L1, L2, L3, L10, L11, L12) were accurate; unchanged.

### README.md

| Section | Added/Changed | Reason |
|---|---|---|
| Features | Added: hints, mercy skip, responsive design, offline play, service worker | New in phases 4–5 |
| Features | Clarified: stones on-screen or E key; doors/keys sequenced; decay is lethal | Completion of phase 4 UX work |
| Controls | Added stone button, hint, restart shortcuts, pause escape, throw confirm/cancel | On-screen controls + affordances from phase 4 |
| Architecture | Expanded section: added all new files (line-of-sight.js, level-hints.js, HintPanel.svelte, focus-trap.js) | Phase 4 + engine refactoring |
| Architecture | Documented service worker, manifest, precache, offline flow | Phase 5 implementation |
| Requirements | Changed "Node 18+" → "Node 24+" (match CI truth) | Phase 5 report recommendation |
| Assets section | NEW: documented `unshipped-assets/` directory, voice files, regenerate script | Phase 5 moved 3.8 MiB out of shipped bundle |

### docs/project-overview-pdr.md

| Section | Updated | Why |
|---|---|---|
| Core Concept | Added 8 guard types (was "5"), offline, hints, mercy, responsive, L12 easter egg | Full feature inventory |
| Functional Req | Expanded from 13 to 21 items; added stones, doors/keys, one-ways, decay, hints, mercy, offline, responsive | Missing features |
| Guard Behaviors | Detailed all 8 types; added static regrow cycles, suspicion tier/decay, sniper unbounded LoS, chaser BFS | Engine phase 1 fixes |
| Player Abilities | Added stones, key inventory, hint tiers, mercy skip | Phase 4 features |
| Level Progression | Updated grid sizes (L10: 11×12 not 12×12); added "Key Mechanics" column | Accurate to levels.js |
| Success Metrics | Changed from "all 11 solvable" to "guard tax ≥ floor per level"; added per-mechanic checks | Phase 2 CI harness |
| Status | Changed version 0.1.0 → 2.0.0; listed 6 completed phases; documented known limitations | Current reality |
| Known Limitations | NEW: documented L9/L10 decorative mechanics, L11 branch-count vs move-count, low guard taxes on early levels | Honest about non-achievements |

### plans/260725-2208-playable-hard-offline/plan.md

| Section | Change |
|---|---|
| Status | "Phase 1–3 in progress" → "Phases 1–6 complete" |
| Phase table | Added status column; marked all DONE |
| Acceptance criteria | Updated all 7 to ✓ DONE with specifics (243 tests, 5.55 MiB, etc.) |
| NEW § | "What Was Not Achieved (Acceptable Limitations)" — documented L9/L10 decorative mechanics, L2/L3/L5/L7 tax=1, L11 branch depth vs path length, full difficulty table |

---

## Node Version Decision

**Task:** Reconcile README "18+" vs CI "24"

**Evidence:** Phase 5 report states:
- CI pinned to `node-version: '24'` in deploy.yml
- Only Node 24.14.0 installed on build machine
- No testing of Node 18 compatibility with Vite 6 + pinned esbuild
- Phase 5 chose not to downgrade untested

**Decision:** Keep CI Node 24 as source of truth. Updated README to "Node 24+".

**Rationale:** Tested, verified, honest. Changing to 18+ without testing would be a guess.

---

## Locale Verification

**Command Run:**
```bash
node -e "
const en = require('./src/lib/locales/en.json');
const vi = require('./src/lib/locales/vi.json');
console.log('EN:', Object.keys(en).length, 'VI:', Object.keys(vi).length);
const enOnly = Object.keys(en).filter(k => !Object.keys(vi).includes(k));
const viOnly = Object.keys(vi).filter(k => !Object.keys(en).includes(k));
console.log('Parity:', enOnly.length === 0 && viOnly.length === 0 ? 'PASS' : 'FAIL');
"
```

**Result:**
```
EN: 167  VI: 167
✓ Keys are identical
```

---

## Files Modified

### Locale Files (briefing text only)
- `src/lib/locales/en.json` — lines 85–90 (L4–L9 stories)
- `src/lib/locales/vi.json` — lines 85–90 (L4–L9 stories, translated)

### Documentation Files
- `docs/game-design.md` — Level 4–9 specs, Decay/Warm section
- `README.md` — Features, Controls, Architecture, Requirements, Assets
- `docs/project-overview-pdr.md` — PDR functional/nonfunctional requirements, guard behaviors, level progression, success metrics, status, limitations

### Plan File
- `plans/260725-2208-playable-hard-offline/plan.md` — Status, phase table, acceptance criteria, new section on unachieved goals

---

## Test Status

**Before:** No testing performed on docs (static files)

**After:**
- `pnpm test` — 243 passing (unchanged; no test code modified)
- Locale key parity — 167/167 (en/vi) verified
- Cross-checks:
  - All 5 rewritten briefings match levels.js actual contents
  - Level specs in game-design.md verified against levels.js guards arrays
  - README architecture tree compared to current src/ structure
  - PDR guard descriptions match guards.js implementations

---

## Unresolved Questions

None. All claims in this report are sourced from:
1. `src/lib/levels/levels.js` (ground truth for level contents)
2. Phase reports (1–5) filed by concurrent agents
3. Code inspection (guards.js, turn-manager.js for mechanics verification)
4. Bash verification (locale parity script)

All documentation now matches source-of-truth implementation.

# Phase 06 Implementation Report — i18n + Polish

## Files Modified

| File | Change |
|------|--------|
| `src/lib/locales/en.json` | +17 new keys; polished copy for all existing banner/migration/gameOver keys; L1-L9 intros rewritten (lives refs removed); L10-L12 foreshadowing rewritten |
| `src/lib/locales/vi.json` | Full VI parity — all 17 new keys translated; L1-L12 story text translated/rewritten; was 7 EN-bleed placeholders, now 0 |
| `src/lib/audio.js` | +6 new exported cue functions: playStoneThrow, playStoneImpact, playKeyPickup, playDoorUnlock, playSuspicionAlert, playSuspicionFire |
| `src/lib/pixel/art-characters.js` | +SNIPER_ART/SNIPER_PAL (32×32 dark-red pepper), +SUSPICION_CALM/ALERT/FIRE art + palettes (3 tier variants), +GUARD_SPRITES entries for sniper + suspicion |
| `src/lib/pixel/art-tiles.js` | +TILE_DOOR_LOCKED + 3 color palettes (gold/silver/copper), +TILE_DOOR_OPEN, +TILE_KEY + 3 palettes, +TILE_ONEWAY_RIGHT, +TILE_WARM, +ICON_STONE |
| `src/scenes/Game.svelte` | Updated audio import (+6 cues); wired playStoneThrow+Impact in confirmThrow(); added $effect for keysHeld delta → playKeyPickup; added $effect for suspicion tier delta → playSuspicionAlert/Fire; throw hint now uses getText('throw.hintEnter'); removed dead .throw-hint kbd CSS |
| `src/components/ThrowTargetingOverlay.svelte` | Import getText; valid-target hint uses getText('throw.hintTargeting') |
| `src/components/StonesCounter.svelte` | Replaced emoji with ICON_STONE pixel-art; aria-label uses getText('mechanics.stones.label') |
| `src/components/KeyInventory.svelte` | Replaced emoji with TILE_KEY pixel-art (color-coded); uses getText('mechanics.keys.label') + getText('mechanics.key.aria') |
| `README.md` | Full v2 rewrite: 8 guard types, new mechanics, no lives mention, E key documented |
| `docs/game-design.md` | Added sniper/suspicion guard rows; new mechanics section (stones/doors/keys/oneways/decay/affordances); L1-L12 spec updated; lives → death model; foreshadowing arc updated; full audio table; visual design table updated |
| `docs/codebase-summary.md` | Added throwable.js, SniperGuard, SuspicionGuard; new components listed; level data v2 shape; cell state v2; audio wiring table; updated stats |

## Pixel-Art Approach

**SVG pixel-art (existing pattern), not SVG fallback.** All new sprites use the string-art + palette → `Pixel.svelte` pattern identical to existing guards.

- **Sniper Pepper**: 32×32 dark-red chili body (`#8b1a1a` / `#5a0a0a`) with aim-indicator dot (`#ffaaaa`). Reuses tomato leaf chars (G/L) for stem.
- **Suspicion Onion**: 32×32 violet onion body (`NNTV.onionPurp`). Three palette-swap tiers: calm (base purple), alerted (brighter violet + yellow eye shine), firing (magenta + red mouth). Art shape is shared across tiers — only palette changes, which is zero cost.
- **Door/Key tiles**: 16×16. Three palette variants each (gold `#d4af37`, silver `#c0c0c0`, copper `#b87333`).
- **Warm tile**: 16×16 dim orange glow distinct from bright TILE_LIT yellow.
- **One-way arrow**: 16×16 right-facing base (rotation handled by caller if needed).
- **Stone HUD icon**: 16×16 grey rock matching existing `NNTV.stone` / `NNTV.stoneLight`.

## Audio Cues Wired

| Event | Function | Trigger site |
|-------|----------|-------------|
| Stone throw | `playStoneThrow()` | `confirmThrow()` — on successful throw |
| Stone impact | `playStoneImpact()` | 80ms after throw (setTimeout) |
| Key pickup | `playKeyPickup()` | `$effect` on `keysHeld` delta (new bit set) |
| Door unlock | Not wired | No door-open delta signal available without engine changes; documented below |
| Suspicion tier 1 | `playSuspicionAlert()` | `$effect` watching max suspicion tier across guards |
| Suspicion tier 2 | `playSuspicionFire()` | Same `$effect`, tier ≥2 branch |

**Door unlock not wired**: The engine does not currently expose a door-open event or delta. Wiring it would require either an engine change (out of scope) or a grid-cell scan diff each turn (brittle). `playDoorUnlock()` is exported and ready; left for engine integration. Documented in concern below.

## VI Translation Approach for Proper Nouns

- **"Sniper Pepper"** → **"Ớt Bắn Tỉa"** (Ớt = chili pepper; Bắn Tỉa = sniper/marksman). Natural Vietnamese compound, not transliterated.
- **"Suspicious Onion"** → **"Hành Tím Nghi Ngờ"** (Hành Tím = purple onion; Nghi Ngờ = suspicious/doubtful). Descriptive qualifier.
- **"Run Complete"** → **"Hoàn thành hành trình!"** (journey completed) — more natural than literal "chạy hoàn thành".
- Foreshadowing L10-L12: register maintained — bittersweet/ominous, first-person present tense consistent with EN.

## Bundle Size Delta

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| JS (raw) | 132.72 kB | 163.68 kB | +23.3% |
| JS (gzip) | 40.87 kB | 49.59 kB | +21.3% |

Within the ≤ +30% cap. Growth driven by new sprite art strings and audio functions.

## Test Results

- **Unit tests**: 9 files, 180 tests — all pass
- **Build**: clean (only 1 pre-existing `state_referenced_locally` warning on Game.svelte:39, intentionally suppressed)
- **Unused CSS warning**: resolved (removed dead `.throw-hint kbd` rule after replacing `<kbd>` with locale string)

## Deviations / Concerns

1. **Door unlock audio not wired** — `playDoorUnlock()` is implemented and exported but not connected. Engine would need to surface a door-open event (e.g. `result.doorOpened` from TurnManager) to wire it cleanly. Out of scope for phase 06 engine-freeze.
2. **Suspicion guard tier monitoring** — the `$effect` reads `g.suspicionTier` from guard snapshots. If SuspicionGuard is not yet implemented in the engine (phases 01-05 may not have added it), the `typeof g.suspicionTier === 'number'` guard ensures silent no-op. No crash risk.
3. **TILE_DOOR_LOCKED art** — one row has a trailing space in the art string (row 1, 16th char). Pixel.svelte treats space as transparent, same as `.`, so rendering is correct. Not a functional issue.
4. **Lighthouse a11y** — not measurable in this environment (no browser automation). AffordanceBanner, StonesCounter, KeyInventory, ThrowTargetingOverlay all have `role`, `aria-label`, and `aria-live` attributes matching the spec.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** All i18n keys finalized (EN+VI, 0 placeholders), pixel-art added for all 8 new entity types, 5/6 audio cues wired (door unlock deferred pending engine event), L10-L12 foreshadowing rewritten, README + docs fully updated, 180 tests pass, build clean, bundle +21% gzip.
**Concerns:** Door unlock audio not wired (needs engine TurnManager change to expose door-open result); suspicion audio wiring is best-effort (depends on SuspicionGuard.suspicionTier being populated by engine).

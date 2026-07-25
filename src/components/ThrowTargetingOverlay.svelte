<script>
    import { getText } from '../lib/localization.js';
    // ThrowTargetingOverlay — rendered on top of the board when throw-targeting mode is active.
    // Highlights valid targets (green halo), invalid cells reachable by cursor (red tint),
    // and the cursor cell (bright yellow focus ring).
    //
    // Props:
    //   cursor       {row, col} — current cursor position
    //   validTargets Set<string> — "r,c" strings for cells that are valid throw targets
    //   playerPos    {row, col} — player position (used to compute invalid range cells)
    //   rows, cols   grid dimensions
    //   cellSize     pixels per cell

    let { cursor = null, validTargets = new Set(), playerPos = null,
          rows = 6, cols = 6, cellSize = 50,
          onconfirm, oncancel } = $props();

    const MAX_THROW_DIST = 3;

    // Build the set of all cells within Manhattan ≤3 of the player (candidate range).
    // Cells in range but NOT valid targets get a faint red tint.
    let rangedCells = $derived((() => {
        if (!playerPos) return new Set();
        const s = new Set();
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const dist = Math.abs(r - playerPos.row) + Math.abs(c - playerPos.col);
                if (dist > 0 && dist <= MAX_THROW_DIST) s.add(`${r},${c}`);
            }
        }
        return s;
    })());

    // Cells in range that are not valid targets (wall, no LoS, no guard nearby)
    let invalidCells = $derived((() => {
        const s = new Set();
        for (const key of rangedCells) {
            if (!validTargets.has(key)) s.add(key);
        }
        return s;
    })());

    let cursorKey = $derived(cursor ? `${cursor.row},${cursor.col}` : '');
    let cursorIsValid = $derived(validTargets.has(cursorKey));
</script>

<!-- Overlay absolutely positioned over the board container -->
<div
    class="targeting-overlay"
    style="width: {cols * cellSize}px; height: {rows * cellSize}px;"
    aria-hidden="true"
>
    <!-- Valid target cells: green halo -->
    {#each [...validTargets] as key (key)}
        {@const [r, c] = key.split(',').map(Number)}
        {#if cursorKey !== key}
            <div
                class="cell-halo valid"
                style="top: {r * cellSize}px; left: {c * cellSize}px;
                       width: {cellSize}px; height: {cellSize}px;"
            ></div>
        {/if}
    {/each}

    <!-- Invalid in-range cells: faint red tint -->
    {#each [...invalidCells] as key (key)}
        {@const [r, c] = key.split(',').map(Number)}
        {#if cursorKey !== key}
            <div
                class="cell-halo invalid"
                style="top: {r * cellSize}px; left: {c * cellSize}px;
                       width: {cellSize}px; height: {cellSize}px;"
            ></div>
        {/if}
    {/each}

    <!-- Cursor cell: bright ring (color depends on validity) -->
    {#if cursor}
        <div
            class="cell-cursor"
            class:cursor-valid={cursorIsValid}
            class:cursor-invalid={!cursorIsValid}
            style="top: {cursor.row * cellSize}px; left: {cursor.col * cellSize}px;
                   width: {cellSize}px; height: {cellSize}px;"
        ></div>
    {/if}

    <!-- Dim overlay on entire board to signal targeting mode -->
    <div class="board-dim"></div>
</div>

<!-- Hint bar below board -->
<div class="targeting-hint" role="status" aria-live="polite">
    {#if cursorIsValid}
        <span class="hint-valid">{getText('throw.hintTargeting')}</span>
    {:else}
        <span class="hint-invalid">{getText('throw.hintInvalid')}</span>
    {/if}
</div>

<!-- Touch-usable Confirm/Cancel controls — the only way a touch-only player
     can confirm or back out of targeting mode without a keyboard. Sized well
     above the 44px minimum touch target regardless of board scale, since the
     board itself can shrink below that on small screens. -->
<div class="targeting-controls">
    <button class="targeting-btn cancel" onclick={oncancel} aria-label={getText('throw.cancel')}>
        ✕
    </button>
    <button class="targeting-btn confirm" onclick={onconfirm} disabled={!cursorIsValid} aria-label={getText('throw.confirm')}>
        ✓
    </button>
</div>

<style>
    .targeting-overlay {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 10;
    }

    /* Dim the board slightly when in targeting mode */
    .board-dim {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.30);
        z-index: 0;
        pointer-events: none;
    }

    .cell-halo {
        position: absolute;
        pointer-events: none;
        z-index: 1;
    }
    .cell-halo.valid {
        border: 2px solid rgba(0, 220, 80, 0.7);
        box-shadow: inset 0 0 8px rgba(0, 220, 80, 0.25);
        background: rgba(0, 220, 80, 0.08);
    }
    .cell-halo.invalid {
        background: rgba(220, 40, 0, 0.12);
        border: 1px solid rgba(220, 40, 0, 0.3);
    }

    .cell-cursor {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        border: 3px solid;
        animation: cursor-pulse 0.7s ease-in-out infinite alternate;
    }
    .cell-cursor.cursor-valid {
        border-color: rgba(255, 255, 60, 0.95);
        box-shadow: 0 0 12px rgba(255, 255, 60, 0.6),
                    inset 0 0 8px rgba(0, 220, 80, 0.3);
        background: rgba(255, 255, 60, 0.08);
    }
    .cell-cursor.cursor-invalid {
        border-color: rgba(255, 80, 40, 0.9);
        box-shadow: 0 0 10px rgba(255, 80, 40, 0.5);
        background: rgba(255, 80, 40, 0.10);
    }
    @keyframes cursor-pulse {
        from { opacity: 0.75; }
        to   { opacity: 1.00; }
    }

    .targeting-hint {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.75);
        border-radius: 4px;
        padding: 4px 14px;
        font: var(--font-small);
        z-index: 20;
        pointer-events: none;
        white-space: nowrap;
    }
    .hint-valid  { color: #aaff88; }
    .hint-invalid { color: #ff9966; }

    /* Pinned near the bottom of the board viewport (not the scrollable
       content), always reachable regardless of board scroll position. */
    .targeting-controls {
        position: absolute;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 16px;
        z-index: 21;
    }
    .targeting-btn {
        min-width: 44px;
        min-height: 44px;
        border-radius: 50%;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
    }
    .targeting-btn.cancel {
        background: rgba(60, 10, 10, 0.85);
        border: 2px solid rgba(255, 80, 40, 0.8);
        color: #ff9966;
    }
    .targeting-btn.confirm {
        background: rgba(10, 40, 10, 0.85);
        border: 2px solid rgba(0, 220, 80, 0.8);
        color: #aaff88;
    }
    .targeting-btn.confirm:disabled {
        opacity: 0.4;
        cursor: default;
    }
</style>

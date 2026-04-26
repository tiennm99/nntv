<script>
    import Pixel from '../lib/pixel/Pixel.svelte';
    import {
        TILE_EMPTY, TILE_EMPTY_PAL,
        TILE_WALL, TILE_WALL_PAL,
        TILE_GOAL, TILE_GOAL_PAL,
        TILE_LIT, TILE_LIT_PAL,
        TILE_PREVIEW, TILE_PREVIEW_PAL,
    } from '../lib/pixel/art-tiles.js';

    // Key color palette by keyId: 1=gold, 2=silver, 3=copper
    const KEY_COLORS = { 1: '#d4af37', 2: '#c0c0c0', 3: '#b87333' };
    // One-way arrow glyphs by numeric direction encoding (0=up,1=right,2=down,3=left)
    const ONEWAY_ARROWS = { 0: '↑', 1: '→', 2: '↓', 3: '←' };
    // Human-readable direction names for ARIA
    const DIR_NAMES = { 0: 'up', 1: 'right', 2: 'down', 3: 'left' };

    let { cells = [], rows = 6, cols = 6, cellSize = 50, previewCells = new Set(),
          detectedCell = null, throwTargetCells = new Set(), throwCursor = null,
          oncellclick } = $props();

    function cellLabel(cell) {
        let label = `Row ${cell.row + 1}, Column ${cell.col + 1}`;
        if (cell.isWall) label += ', wall';
        else if (cell.isDoor) {
            const color = KEY_COLORS[cell.doorKeyId] ? ` key ${cell.doorKeyId}` : '';
            label += `, door, locked${color}`;
        } else if (cell.isGoal) label += ', goal';
        else if (cell.isKey) label += `, key ${cell.keyId}`;
        else if (cell.isOneWay) label += `, one-way arrow ${DIR_NAMES[cell.oneWayDir] ?? cell.oneWayDir}`;
        else if (cell.isWarm) label += ', warm cell';
        if (cell.isLight) label += ', lit';
        return label;
    }

    function isDetected(cell) {
        return detectedCell && detectedCell.row === cell.row && detectedCell.col === cell.col;
    }

    // Is this cell a valid throw target (green halo)?
    function isThrowTarget(cell) {
        return throwTargetCells.has(`${cell.row},${cell.col}`);
    }

    // Is this cell the throw cursor (bright ring)?
    function isThrowCursor(cell) {
        return throwCursor && throwCursor.row === cell.row && throwCursor.col === cell.col;
    }

    // Resolve the base tile art/palette. Priority: lit > door > goal > wall > empty.
    // Key, one-way, warm overlays are rendered on top of the base tile separately.
    function tileFor(cell) {
        if (cell.isLight) return { art: TILE_LIT, pal: TILE_LIT_PAL };
        if (cell.isGoal) return { art: TILE_GOAL, pal: TILE_GOAL_PAL };
        if (cell.isWall) return { art: TILE_WALL, pal: TILE_WALL_PAL };
        return { art: TILE_EMPTY, pal: TILE_EMPTY_PAL };
    }

    // Border color for door overlay (keyed by keyId)
    function doorBorderColor(keyId) {
        return KEY_COLORS[keyId] ?? '#888888';
    }
</script>

<div
    class="board"
    role="grid"
    aria-label="Game board, {rows} rows by {cols} columns"
    style="grid-template-columns: repeat({cols}, {cellSize}px); grid-template-rows: repeat({rows}, {cellSize}px);"
>
    {#each cells as cell (cell.row * cols + cell.col)}
        {@const tile = tileFor(cell)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
        <div
            tabindex="-1"
            class="cell"
            class:wall={cell.isWall}
            class:preview={previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
            class:detected-flash={isDetected(cell)}
            class:throw-target={isThrowTarget(cell)}
            class:throw-cursor={isThrowCursor(cell)}
            role="gridcell"
            aria-label={cellLabel(cell)}
            onclick={() => oncellclick?.(cell.row, cell.col)}
        >
            <Pixel art={tile.art} palette={tile.pal} width={cellSize} height={cellSize} />

            <!-- Preview overlay (turn-preview ghost) -->
            {#if previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
                <div class="preview-overlay">
                    <Pixel art={TILE_PREVIEW} palette={TILE_PREVIEW_PAL} width={cellSize} height={cellSize} />
                </div>
            {/if}

            <!-- Door overlay: colored border + padlock glyph -->
            {#if cell.isDoor}
                <div
                    class="door-overlay"
                    style="border-color: {doorBorderColor(cell.doorKeyId)}; box-shadow: inset 0 0 0 2px {doorBorderColor(cell.doorKeyId)};"
                    aria-hidden="true"
                >
                    <span class="door-glyph">🔒</span>
                </div>
            {/if}

            <!-- Key overlay: colored circle + key glyph -->
            {#if cell.isKey}
                <div
                    class="key-overlay"
                    style="background: radial-gradient(circle, {KEY_COLORS[cell.keyId] ?? '#888'}44 60%, transparent 100%);"
                    aria-hidden="true"
                >
                    <span class="key-glyph" style="color: {KEY_COLORS[cell.keyId] ?? '#888'};">🗝</span>
                </div>
            {/if}

            <!-- One-way overlay: arrow glyph in allowed-entry direction -->
            {#if cell.isOneWay}
                <div class="oneway-overlay" aria-hidden="true">
                    <span class="oneway-arrow">{ONEWAY_ARROWS[cell.oneWayDir] ?? '?'}</span>
                </div>
            {/if}

            <!-- Warm cell overlay: dim orange glow (distinct from yellow lit cells) -->
            {#if cell.isWarm && !cell.isLight}
                <div class="warm-overlay" aria-hidden="true"></div>
            {/if}

            <!-- Throw targeting overlays -->
            {#if isThrowCursor(cell)}
                <div class="throw-cursor-ring" aria-hidden="true"></div>
            {:else if isThrowTarget(cell)}
                <div class="throw-target-ring" aria-hidden="true"></div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .board {
        display: grid;
        gap: 0;
        position: relative;
    }
    .cell {
        position: relative;
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
    .cell.wall { cursor: default; }

    /* Preview ghost overlay */
    .preview-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.7;
    }

    /* Detection flash animation */
    .cell.detected-flash {
        animation: cell-flash 0.4s ease-out;
    }
    @keyframes cell-flash {
        0% { filter: brightness(2) hue-rotate(-60deg); }
        100% { filter: none; }
    }

    /* ── Door overlay ── */
    .door-overlay {
        position: absolute;
        inset: 3px;
        border: 3px solid; /* color set inline */
        border-radius: 3px;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.35);
    }
    .door-glyph {
        font-size: 1.1em;
        line-height: 1;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.8));
    }

    /* ── Key overlay ── */
    .key-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .key-glyph {
        font-size: 1em;
        line-height: 1;
        filter: drop-shadow(0 1px 3px rgba(0,0,0,0.9));
    }

    /* ── One-way overlay ── */
    .oneway-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(100, 180, 255, 0.08);
    }
    .oneway-arrow {
        font-size: 1.3em;
        color: rgba(140, 210, 255, 0.75);
        line-height: 1;
        text-shadow: 0 0 4px rgba(0,0,0,0.8);
    }

    /* ── Warm cell overlay (distinct orange from yellow isLight) ── */
    .warm-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: rgba(255, 140, 0, 0.25);
        border-radius: 1px;
    }

    /* ── Throw targeting rings ── */
    .throw-target-ring {
        position: absolute;
        inset: 4px;
        border: 2px solid rgba(0, 220, 80, 0.7);
        border-radius: 3px;
        pointer-events: none;
        box-shadow: 0 0 6px rgba(0, 220, 80, 0.4);
    }
    .throw-cursor-ring {
        position: absolute;
        inset: 2px;
        border: 3px solid rgba(255, 255, 0, 0.9);
        border-radius: 3px;
        pointer-events: none;
        box-shadow: 0 0 10px rgba(255, 255, 0, 0.6);
        animation: cursor-pulse 0.8s ease-in-out infinite alternate;
    }
    @keyframes cursor-pulse {
        from { opacity: 0.7; }
        to   { opacity: 1.0; }
    }
</style>

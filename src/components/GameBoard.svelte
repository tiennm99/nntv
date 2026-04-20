<script>
    import Pixel from '../lib/pixel/Pixel.svelte';
    import {
        TILE_EMPTY, TILE_EMPTY_PAL,
        TILE_WALL, TILE_WALL_PAL,
        TILE_GOAL, TILE_GOAL_PAL,
        TILE_LIT, TILE_LIT_PAL,
        TILE_PREVIEW, TILE_PREVIEW_PAL,
    } from '../lib/pixel/art-tiles.js';

    let { cells = [], rows = 6, cols = 6, cellSize = 50, previewCells = new Set(),
          detectedCell = null, oncellclick } = $props();

    function cellLabel(cell) {
        let label = `Row ${cell.row + 1}, Column ${cell.col + 1}`;
        if (cell.isWall) label += ', wall';
        else if (cell.isGoal) label += ', goal';
        if (cell.isLight) label += ', lit';
        return label;
    }

    function isDetected(cell) {
        return detectedCell && detectedCell.row === cell.row && detectedCell.col === cell.col;
    }

    // Resolve the tile art/palette for a cell. Priority: lit > goal > wall > empty.
    function tileFor(cell) {
        if (cell.isLight) return { art: TILE_LIT, pal: TILE_LIT_PAL };
        if (cell.isGoal) return { art: TILE_GOAL, pal: TILE_GOAL_PAL };
        if (cell.isWall) return { art: TILE_WALL, pal: TILE_WALL_PAL };
        return { art: TILE_EMPTY, pal: TILE_EMPTY_PAL };
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
            role="gridcell"
            aria-label={cellLabel(cell)}
            onclick={() => oncellclick?.(cell.row, cell.col)}
        >
            <Pixel art={tile.art} palette={tile.pal} width={cellSize} height={cellSize} />
            {#if previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
                <div class="preview-overlay">
                    <Pixel art={TILE_PREVIEW} palette={TILE_PREVIEW_PAL} width={cellSize} height={cellSize} />
                </div>
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
    .preview-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.7;
    }
    .cell.detected-flash {
        animation: cell-flash 0.4s ease-out;
    }
    @keyframes cell-flash {
        0% { filter: brightness(2) hue-rotate(-60deg); }
        100% { filter: none; }
    }
</style>

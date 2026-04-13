<script>
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
</script>

<div
    class="board"
    role="grid"
    aria-label="Game board, {rows} rows by {cols} columns"
    style="grid-template-columns: repeat({cols}, {cellSize}px); grid-template-rows: repeat({rows}, {cellSize}px);"
>
    {#each cells as cell (cell.row * cols + cell.col)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
        <div
            class="cell"
            class:wall={cell.isWall}
            class:goal={cell.isGoal}
            class:lit={cell.isLight}
            class:preview={previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
            class:detected-flash={isDetected(cell)}
            role="gridcell"
            aria-label={cellLabel(cell)}
            onclick={() => oncellclick?.(cell.row, cell.col)}
        ></div>
    {/each}
</div>

<style>
    .board {
        display: grid;
        gap: 0;
        position: relative;
    }
    .cell {
        width: 100%;
        height: 100%;
        background: var(--grid-empty);
        border: 1px solid var(--grid-border);
        cursor: pointer;
        transition: background 0.2s ease;
    }
    .cell.wall { background: var(--grid-wall); cursor: default; }
    .cell.goal { background: var(--grid-goal); }
    .cell.lit { background: var(--grid-lit); }
    .cell.preview { background: rgba(255, 234, 0, 0.15); border-color: rgba(255, 234, 0, 0.3); }
    .cell.detected-flash {
        animation: cell-flash 0.4s ease-out;
    }
    @keyframes cell-flash {
        0% { background: #ff0000; }
        100% { background: var(--grid-lit); }
    }
</style>

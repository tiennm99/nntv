<script>
    let { cells = [], rows = 6, cols = 6, cellSize = 50, previewCells = new Set(), oncellclick } = $props();
</script>

<div
    class="board"
    style="grid-template-columns: repeat({cols}, {cellSize}px); grid-template-rows: repeat({rows}, {cellSize}px);"
>
    {#each cells as cell (cell.row * cols + cell.col)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div
            class="cell"
            class:wall={cell.isWall}
            class:goal={cell.isGoal}
            class:lit={cell.isLight}
            class:preview={previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
            role="gridcell"
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
    }
    .cell.wall { background: var(--grid-wall); cursor: default; }
    .cell.goal { background: var(--grid-goal); }
    .cell.lit { background: var(--grid-lit); }
    .cell.preview { background: rgba(255, 234, 0, 0.15); border-color: rgba(255, 234, 0, 0.3); }
</style>

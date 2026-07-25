<script>
    import { getText } from '../lib/localization.js';
    import { GENERATED_TILES } from '../lib/generated-assets.js';

    // Locale keys for direction names, keyed by the engine's numeric direction
    const DIR_KEYS = { 0: 'board.dirUp', 1: 'board.dirRight', 2: 'board.dirDown', 3: 'board.dirLeft' };

    let { cells = [], rows = 6, cols = 6, cellSize = 50, previewCells = new Set(),
          detectedCell = null, oncellclick } = $props();

    function cellLabel(cell) {
        let label = getText('board.rowCol').replace('{row}', cell.row + 1).replace('{col}', cell.col + 1);
        if (cell.isWall) label += `, ${getText('board.wall')}`;
        else if (cell.isDoor) {
            label += `, ${getText('board.doorLocked').replace('{keyId}', cell.doorKeyId)}`;
        } else if (cell.isGoal) label += `, ${getText('board.goal')}`;
        else if (cell.isKey) label += `, ${getText('board.key').replace('{keyId}', cell.keyId)}`;
        else if (cell.isOneWay) {
            const dirText = getText(DIR_KEYS[cell.oneWayDir] ?? 'board.dirUp');
            label += `, ${getText('board.oneWay').replace('{dir}', dirText)}`;
        }
        else if (cell.isWarm) label += `, ${getText('board.warm')}`;
        if (cell.isLight) label += `, ${getText('board.lit')}`;
        return label;
    }

    function isDetected(cell) {
        return detectedCell && detectedCell.row === cell.row && detectedCell.col === cell.col;
    }

    // Note: throw-targeting visuals are rendered by ThrowTargetingOverlay
    // (a dedicated overlay component), not here — this board has no
    // throw-related props.

    // Resolve the base tile art/palette. Priority: lit > door > goal > wall > empty.
    // Key, one-way, warm overlays are rendered on top of the base tile separately.
    function tileSrcFor(cell) {
        if (cell.isLight) return GENERATED_TILES.lit;
        if (cell.isGoal) return GENERATED_TILES.goal;
        if (cell.isWall) return GENERATED_TILES.wall;
        return GENERATED_TILES.empty;
    }

    function oneWayRotation(dir) {
        return `${((dir ?? 1) - 1) * 90}deg`;
    }
</script>

<div
    class="board"
    role="grid"
    aria-label={getText('board.gridLabel').replace('{rows}', rows).replace('{cols}', cols)}
    style="grid-template-columns: repeat({cols}, {cellSize}px); grid-template-rows: repeat({rows}, {cellSize}px);"
>
    {#each cells as cell (cell.row * cols + cell.col)}
        {@const tileSrc = tileSrcFor(cell)}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions a11y_interactive_supports_focus -->
        <div
            tabindex="-1"
            class="cell"
            class:wall={cell.isWall}
            class:preview={previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
            class:detected-flash={isDetected(cell)}
            class:lit={cell.isLight}
            class:warm={cell.isWarm && !cell.isLight}
            class:key-cell={cell.isKey}
            class:door-cell={cell.isDoor}
            class:oneway-cell={cell.isOneWay}
            role="gridcell"
            aria-label={cellLabel(cell)}
            onclick={() => oncellclick?.(cell.row, cell.col)}
        >
            <img class="tile-image" src={tileSrc} alt="" draggable="false" />

            <!-- Preview overlay (turn-preview ghost) -->
            {#if previewCells.has(`${cell.row},${cell.col}`) && !cell.isLight}
                <div class="preview-overlay">
                    <div class="preview-corners"></div>
                </div>
            {/if}

            <!-- Warm cell overlay: dim orange glow (distinct from yellow lit cells) -->
            {#if cell.isWarm && !cell.isLight}
                <div class="tile-overlay warm-overlay" aria-hidden="true">
                    <img class="tile-image" src={GENERATED_TILES.warm} alt="" draggable="false" />
                </div>
            {/if}

            <!-- One-way overlay: pixel arrow in allowed-entry direction -->
            {#if cell.isOneWay}
                <div
                    class="tile-overlay oneway-overlay"
                    style="transform: rotate({oneWayRotation(cell.oneWayDir)});"
                    aria-hidden="true"
                >
                    <img class="tile-image" src={GENERATED_TILES.oneway} alt="" draggable="false" />
                </div>
            {/if}

            <!-- Door overlay: color keyed by matching keyId -->
            {#if cell.isDoor}
                <div class="tile-overlay door-overlay" aria-hidden="true">
                    <img class="tile-image" src={GENERATED_TILES.doors[cell.doorKeyId] ?? GENERATED_TILES.doors[1]} alt="" draggable="false" />
                </div>
            {/if}

            <!-- Key overlay: color keyed to matching door -->
            {#if cell.isKey}
                <div class="tile-overlay key-overlay" aria-hidden="true">
                    <img class="key-image" src={GENERATED_TILES.keys[cell.keyId] ?? GENERATED_TILES.keys[1]} alt="" draggable="false" />
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
    .cell.lit .tile-image {
        animation: lit-tile-pulse 900ms steps(3, end) infinite;
    }
    .cell.warm .tile-image {
        animation: warm-tile-breathe 1.2s steps(3, end) infinite;
    }
    .cell.door-cell .door-overlay {
        animation: door-lock-glint 1.7s steps(4, end) infinite;
    }
    .cell.key-cell .key-overlay {
        animation: key-bob 1s steps(3, end) infinite;
    }
    .cell.oneway-cell .oneway-overlay {
        animation: oneway-nudge 1.1s steps(3, end) infinite;
    }
    .tile-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        image-rendering: pixelated;
        display: block;
    }

    /* Preview ghost overlay */
    .preview-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0.7;
    }
    .preview-corners {
        position: absolute;
        inset: 4px;
        border: 3px solid rgba(255, 234, 0, 0.65);
        clip-path: polygon(
            0 0, 28% 0, 28% 8%, 8% 8%, 8% 28%, 0 28%,
            0 72%, 8% 72%, 8% 92%, 28% 92%, 28% 100%, 0 100%,
            72% 100%, 72% 92%, 92% 92%, 92% 72%, 100% 72%,
            100% 28%, 92% 28%, 92% 8%, 72% 8%, 72% 0, 100% 0,
            100% 100%, 0 100%
        );
    }

    /* Detection flash animation */
    .cell.detected-flash {
        animation: cell-flash 0.4s ease-out;
    }
    @keyframes cell-flash {
        0% { filter: brightness(2) hue-rotate(-60deg); }
        100% { filter: none; }
    }
    @keyframes lit-tile-pulse {
        0%, 100% { filter: brightness(1); }
        50% { filter: brightness(1.22) saturate(1.1); }
    }
    @keyframes warm-tile-breathe {
        0%, 100% { opacity: 0.82; }
        50% { opacity: 1; }
    }
    @keyframes door-lock-glint {
        0%, 100% { filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75)) brightness(1); }
        50% { filter: drop-shadow(0 0 5px rgba(255, 244, 214, 0.35)) brightness(1.08); }
    }
    @keyframes key-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
    }
    @keyframes oneway-nudge {
        0%, 100% { translate: 0 0; opacity: 0.82; }
        50% { translate: 2px 0; opacity: 1; }
    }

    .tile-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transform-origin: center;
    }

    .warm-overlay {
        opacity: 0.9;
        mix-blend-mode: screen;
    }

    .oneway-overlay {
        opacity: 0.82;
    }

    .door-overlay {
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75));
    }

    .key-overlay {
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9));
    }
    .key-image {
        width: 76%;
        height: 76%;
        object-fit: contain;
        image-rendering: pixelated;
    }

    @media (prefers-reduced-motion: reduce) {
        .cell .tile-image,
        .tile-overlay,
        .key-overlay {
            animation: none !important;
        }
    }
</style>

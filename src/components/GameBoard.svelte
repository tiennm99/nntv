<script>
    import { GENERATED_TILES } from '../lib/generated-assets.js';

    // Key color palette by keyId: 1=gold, 2=silver, 3=copper
    const KEY_COLORS = { 1: '#d4af37', 2: '#c0c0c0', 3: '#b87333' };
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
    aria-label="Game board, {rows} rows by {cols} columns"
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
            class:throw-target={isThrowTarget(cell)}
            class:throw-cursor={isThrowCursor(cell)}
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
    @media (prefers-reduced-motion: reduce) {
        .cell .tile-image,
        .tile-overlay,
        .key-overlay,
        .throw-cursor-ring {
            animation: none !important;
        }
    }
</style>

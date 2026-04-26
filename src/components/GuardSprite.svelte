<script>
    import Pixel from '../lib/pixel/Pixel.svelte';
    import SuspicionRing from './SuspicionRing.svelte';
    import { GUARD_SPRITES } from '../lib/pixel/art-characters.js';

    let { guard, cellSize = 50, allCells = [] } = $props();

    let top = $derived(guard.row * cellSize + cellSize / 2);
    let left = $derived(guard.col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize * 0.95));
    let rotation = $derived(guard.direction * 90);
    let hasDirection = $derived(
        guard.type === 'rotating' || guard.type === 'patrolling' || guard.type === 'chaser'
    );
    let sprite = $derived(GUARD_SPRITES[guard.type]);
    let activePal = $derived(
        guard.type === 'blinking' && !guard.isOn ? sprite?.palOff : sprite?.pal
    );

    // Sniper: compute beam cells visually by re-walking beam logic from guard position.
    // NOTE: this duplicates SniperGuard._castBeam logic. If engine beam logic changes,
    // update both here and in guards.js. Kept here to avoid cross-module coupling in UI.
    const FACING_DIRS = [
        { row: -1, col: 0 }, // 0=up
        { row: 0, col: 1 },  // 1=right
        { row: 1, col: 0 },  // 2=down
        { row: 0, col: -1 }, // 3=left
    ];

    function computeBeamCells(g, cells) {
        if (!cells || cells.length === 0) return [];
        // Build a quick wall-lookup from flat cells array
        const wallSet = new Set();
        let maxRow = 0, maxCol = 0;
        for (const c of cells) {
            if (c.isWall) wallSet.add(`${c.row},${c.col}`);
            if (c.row > maxRow) maxRow = c.row;
            if (c.col > maxCol) maxCol = c.col;
        }
        const isWall = (r, c) => wallSet.has(`${r},${c}`);
        const inBounds = (r, c) => r >= 0 && r <= maxRow && c >= 0 && c <= maxCol;

        const beam = [];
        const dir = FACING_DIRS[g.direction ?? g.facing ?? 0];
        let cr = g.row, cc = g.col;
        const maxRange = maxRow + maxCol + 2;
        for (let i = 1; i <= maxRange; i++) {
            const r = cr + dir.row * i;
            const c = cc + dir.col * i;
            if (!inBounds(r, c) || isWall(r, c)) break;
            beam.push({ row: r, col: c });
        }
        return beam;
    }

    // Derive beam cells reactively when guard is sniper type
    let beamCells = $derived(
        guard.type === 'sniper' ? computeBeamCells(guard, allCells) : []
    );

    // Triangle polygon points for sniper sprite, pointing in `facing` direction
    // Triangle is drawn within a [0,size] × [0,size] box
    function sniperTrianglePoints(sz, dir) {
        const h = sz;
        const w = sz;
        const m = sz / 2;
        // Points: (tip, base-left, base-right) depending on direction
        switch (dir) {
            case 0: return `${m},2 2,${h - 2} ${w - 2},${h - 2}`; // up
            case 1: return `${w - 2},${m} 2,2 2,${h - 2}`;        // right
            case 2: return `${m},${h - 2} 2,2 ${w - 2},2`;        // down
            case 3: return `2,${m} ${w - 2},2 ${w - 2},${h - 2}`; // left
            default: return `${m},2 2,${h - 2} ${w - 2},${h - 2}`;
        }
    }

    // Suspicion tier color for the guard body tint
    function suspicionColor(tier) {
        if (tier >= 2) return '#ff3300';
        if (tier === 1) return '#ffcc00';
        return '#8844aa'; // idle purple
    }

    // Human-readable ARIA label for the guard sprite
    let ariaLabel = $derived((() => {
        switch (guard.type) {
            case 'sniper': {
                const dirs = ['up','right','down','left'];
                return `Sniper guard facing ${dirs[guard.direction ?? 0]}`;
            }
            case 'suspicion':
                return `Suspicious guard, tier ${guard.tier ?? 0}`;
            default:
                return `${guard.type} guard`;
        }
    })());
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="guard {guard.type}"
    class:off={guard.type === 'blinking' && !guard.isOn}
    class:alert={guard.type === 'chaser' && guard.isChasing}
    style="top: {top}px; left: {left}px; width: {size}px; height: {size}px;"
    role="img"
    aria-label={ariaLabel}
>
    <!-- ── Sniper guard: triangle SVG + beam line (overflow:visible draws into board) ── -->
    {#if guard.type === 'sniper'}
        {@const facing = guard.direction ?? guard.facing ?? 0}
        {@const beamDir = FACING_DIRS[facing]}
        {@const beamLen = beamCells.length}
        {@const beamEndX = size / 2 + beamDir.col * beamLen * cellSize}
        {@const beamEndY = size / 2 + beamDir.row * beamLen * cellSize}
        <svg
            width={size}
            height={size}
            viewBox="0 0 {size} {size}"
            style="overflow: visible; position: absolute; top: 0; left: 0;"
            aria-hidden="true"
        >
            <!-- Dashed beam line drawn from guard center to beam terminus (overflow: visible) -->
            {#if beamLen > 0}
                <line
                    x1={size / 2} y1={size / 2}
                    x2={beamEndX} y2={beamEndY}
                    stroke="rgba(255, 60, 0, 0.45)"
                    stroke-width="2"
                    stroke-dasharray="5 4"
                />
            {/if}
            <!-- Triangle body pointing in facing direction -->
            <polygon
                points={sniperTrianglePoints(size, facing)}
                fill="#cc3300"
                stroke="#ff6600"
                stroke-width="2"
            />
            <!-- Eye dot at center -->
            <circle
                cx={size / 2} cy={size / 2}
                r={size * 0.08}
                fill="#ffaa00"
            />
        </svg>

    <!-- ── Suspicion guard: circle with tier ring overlay ── -->
    {:else if guard.type === 'suspicion'}
        <svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
            <circle
                cx={size / 2} cy={size / 2}
                r={size * 0.38}
                fill={suspicionColor(guard.tier ?? 0)}
                stroke="rgba(255,255,255,0.3)"
                stroke-width="1.5"
            />
            <!-- Suspicion level dots -->
            {#if (guard.tier ?? 0) >= 1}
                <circle cx={size / 2} cy={size * 0.22} r={size * 0.07} fill="#fff" opacity="0.9" />
            {/if}
            {#if (guard.tier ?? 0) >= 2}
                <circle cx={size * 0.3} cy={size * 0.72} r={size * 0.07} fill="#fff" opacity="0.9" />
                <circle cx={size * 0.7} cy={size * 0.72} r={size * 0.07} fill="#fff" opacity="0.9" />
            {/if}
        </svg>
        <!-- SuspicionRing overlay positioned over this sprite -->
        <SuspicionRing tier={guard.tier ?? 0} {size} />

    <!-- ── Standard guard types (existing behavior unchanged) ── -->
    {:else}
        {#if sprite}
            <Pixel art={sprite.art} palette={activePal} width={size} height={size} />
        {/if}
        {#if hasDirection}
            <div class="direction-indicator" style="transform: rotate({rotation}deg);"></div>
        {/if}
    {/if}
</div>

<style>
    .guard {
        position: absolute;
        transform: translate(-50%, -50%);
        transition: top 100ms linear, left 100ms linear;
        z-index: 5;
        pointer-events: none;
    }
    .guard.alert {
        filter: drop-shadow(0 0 6px #ff2200);
    }
    .guard.off {
        opacity: 0.85;
    }

    .direction-indicator {
        position: absolute;
        top: 6%;
        left: 50%;
        width: 3px;
        height: 40%;
        background: var(--cream, #fff4d6);
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
        transform-origin: bottom center;
        translate: -50% 0;
    }

</style>

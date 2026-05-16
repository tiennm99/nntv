<script>
    import SuspicionRing from './SuspicionRing.svelte';
    import { GENERATED_CHARACTERS } from '../lib/generated-assets.js';

    let { guard, cellSize = 50, allCells = [] } = $props();

    let top = $derived(guard.row * cellSize + cellSize / 2);
    let left = $derived(guard.col * cellSize + cellSize / 2);
    let size = $derived(Math.floor(cellSize * 0.95));
    let rotation = $derived(guard.direction * 90);
    let hasDirection = $derived(
        guard.type === 'rotating' || guard.type === 'patrolling' || guard.type === 'chaser' || guard.type === 'sniper'
    );
    let spriteSrc = $derived.by(() => {
        if (guard.type === 'suspicion') {
            if ((guard.tier ?? 0) >= 2) return GENERATED_CHARACTERS.guards.suspicion.fire;
            if ((guard.tier ?? 0) === 1) return GENERATED_CHARACTERS.guards.suspicion.alert;
            return GENERATED_CHARACTERS.guards.suspicion.calm;
        }
        return GENERATED_CHARACTERS.guards[guard.type];
    });

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
    class:tier-alert={guard.type === 'suspicion' && (guard.tier ?? 0) === 1}
    class:tier-fire={guard.type === 'suspicion' && (guard.tier ?? 0) >= 2}
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
        </svg>
        {#if spriteSrc}
            <div class="sprite-motion">
                <img class="sprite-image" src={spriteSrc} alt="" draggable="false" />
            </div>
        {/if}
        <div class="direction-indicator" style="transform: rotate({rotation}deg);"></div>

    <!-- ── Suspicion guard: circle with tier ring overlay ── -->
    {:else if guard.type === 'suspicion'}
        {#if spriteSrc}
            <div class="sprite-motion">
                <img class="sprite-image" src={spriteSrc} alt="" draggable="false" />
            </div>
        {/if}
        <!-- SuspicionRing overlay positioned over this sprite -->
        <SuspicionRing tier={guard.tier ?? 0} {size} />

    <!-- ── Standard guard types (existing behavior unchanged) ── -->
    {:else}
        {#if spriteSrc}
            <div class="sprite-motion">
                <img class="sprite-image" src={spriteSrc} alt="" draggable="false" />
            </div>
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
    .sprite-motion {
        width: 100%;
        height: 100%;
        transform-origin: 50% 84%;
        animation: guard-idle 1.7s steps(2, end) infinite;
    }
    .sprite-image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        image-rendering: pixelated;
        filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8));
    }
    .guard.static .sprite-motion {
        animation: tomato-wilt 2.2s steps(3, end) infinite;
    }
    .guard.rotating .sprite-motion {
        animation: blueberry-scan 1.1s steps(4, end) infinite;
    }
    .guard.blinking .sprite-motion {
        animation: corn-blink 1s steps(2, end) infinite;
    }
    .guard.blinking.off .sprite-motion {
        animation: corn-off 1.2s steps(2, end) infinite;
        filter: saturate(0.75) brightness(0.72);
    }
    .guard.patrolling .sprite-motion {
        animation: patrol-step 600ms steps(2, end) infinite;
    }
    .guard.mirror .sprite-motion {
        animation: mirror-shimmer 1.6s steps(3, end) infinite;
    }
    .guard.chaser .sprite-motion {
        animation: pumpkin-stomp 850ms steps(3, end) infinite;
    }
    .guard.chaser.alert .sprite-motion {
        animation: pumpkin-chase 420ms steps(3, end) infinite;
    }
    .guard.sniper .sprite-motion {
        animation: sniper-breathe 1.8s steps(2, end) infinite;
    }
    .guard.suspicion .sprite-motion {
        animation: onion-watch 1.5s steps(2, end) infinite;
    }
    .guard.suspicion.tier-alert .sprite-motion {
        animation: onion-alert 700ms steps(2, end) infinite;
    }
    .guard.suspicion.tier-fire .sprite-motion {
        animation: onion-fire 360ms steps(2, end) infinite;
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
    .guard.rotating .direction-indicator {
        animation: beam-tick 1s steps(4, end) infinite;
    }
    .guard.sniper .direction-indicator {
        height: 46%;
        background: #ffb24a;
        animation: sniper-aim-pulse 900ms ease-in-out infinite alternate;
    }

    @keyframes guard-idle {
        0%, 100% { transform: translateY(0) scaleY(1); }
        50% { transform: translateY(-1px) scaleY(1.02); }
    }
    @keyframes tomato-wilt {
        0%, 100% { transform: translateY(0) rotate(0deg); filter: brightness(1); }
        50% { transform: translateY(1px) rotate(-1deg); filter: brightness(0.9); }
    }
    @keyframes blueberry-scan {
        0%, 100% { transform: translateX(0); filter: drop-shadow(0 0 0 rgba(68, 136, 255, 0)); }
        25% { transform: translateX(1px); filter: drop-shadow(0 0 5px rgba(68, 136, 255, 0.35)); }
        75% { transform: translateX(-1px); filter: drop-shadow(0 0 5px rgba(68, 136, 255, 0.35)); }
    }
    @keyframes corn-blink {
        0%, 100% { filter: brightness(1.05); }
        50% { filter: brightness(1.28) drop-shadow(0 0 5px rgba(255, 221, 68, 0.45)); }
    }
    @keyframes corn-off {
        0%, 100% { opacity: 0.72; }
        50% { opacity: 0.56; }
    }
    @keyframes patrol-step {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-2px) rotate(-1deg); }
        75% { transform: translateY(-2px) rotate(1deg); }
    }
    @keyframes mirror-shimmer {
        0%, 100% { filter: brightness(1) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.8)); }
        50% { filter: brightness(1.18) drop-shadow(0 0 7px rgba(170, 235, 255, 0.55)); }
    }
    @keyframes pumpkin-stomp {
        0%, 100% { transform: translateY(0) scaleX(1); }
        50% { transform: translateY(-2px) scaleX(1.03); }
    }
    @keyframes pumpkin-chase {
        0%, 100% { transform: translateY(0) scaleX(1.04); }
        50% { transform: translateY(-4px) scaleX(1.08); }
    }
    @keyframes sniper-breathe {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(1px); }
    }
    @keyframes onion-watch {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1px); }
    }
    @keyframes onion-alert {
        0%, 100% { transform: translateY(0) scale(1); filter: brightness(1.05); }
        50% { transform: translateY(-2px) scale(1.04); filter: brightness(1.25); }
    }
    @keyframes onion-fire {
        0%, 100% { transform: translateX(0) scale(1.02); filter: brightness(1.2); }
        33% { transform: translateX(-2px) scale(1.06); filter: brightness(1.45); }
        66% { transform: translateX(2px) scale(1.06); filter: brightness(1.45); }
    }
    @keyframes beam-tick {
        0%, 100% { opacity: 0.75; }
        50% { opacity: 1; }
    }
    @keyframes sniper-aim-pulse {
        from { opacity: 0.55; box-shadow: 0 0 2px rgba(255, 178, 74, 0.4); }
        to { opacity: 1; box-shadow: 0 0 7px rgba(255, 178, 74, 0.75); }
    }
    @media (prefers-reduced-motion: reduce) {
        .guard,
        .sprite-motion,
        .direction-indicator {
            transition: none;
            animation: none !important;
        }
    }
</style>

<script>
    // Suspicion ring overlay — positioned absolute over the guard sprite.
    // tier 0: only the (always-visible) range boundary; tier 1: yellow ring;
    // tier 2: red + pulsing animation.
    //
    // `range` draws the Manhattan danger-zone boundary as a diamond so the
    // player can see the zone *before* triggering it — previously the only
    // tell was the tier ring itself, which only appears after tier ≥ 1 (i.e.
    // after the guard has already started tracking the player).
    let { tier = 0, size = 48, range = 0, cellSize = 50 } = $props();

    let ringColor = $derived(tier >= 2 ? '#ff3300' : '#ffcc00');
    let visible = $derived(tier > 0);
    let pulsing = $derived(tier >= 2);
    // A square rotated 45° draws a Manhattan-distance diamond: its vertices
    // (after rotation) sit at distance side/√2 from center along each
    // cardinal axis. Solving side/√2 = range*cellSize gives the side length
    // below, so the diamond's edge lands exactly `range` cells away in every
    // direction — matching the guard's actual Manhattan detection radius.
    let zoneSize = $derived(range > 0 ? range * cellSize * Math.SQRT2 : 0);
</script>

{#if zoneSize > 0}
    <div
        class="suspicion-zone"
        style="width: {zoneSize}px; height: {zoneSize}px;"
        aria-hidden="true"
    ></div>
{/if}

{#if visible}
    <div
        class="suspicion-ring"
        class:pulsing
        style="width: {size}px; height: {size}px; border-color: {ringColor};
               box-shadow: 0 0 {pulsing ? 10 : 5}px {ringColor}88;"
        aria-hidden="true"
    ></div>
{/if}

<style>
    .suspicion-zone {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        border: 1px dashed rgba(255, 204, 0, 0.45);
        background: rgba(255, 204, 0, 0.06);
        pointer-events: none;
        z-index: 4;
    }
    .suspicion-ring {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        border: 3px solid;
        pointer-events: none;
        z-index: 6;
    }
    .suspicion-ring.pulsing {
        animation: suspicion-pulse 0.5s ease-in-out infinite alternate;
    }
    @keyframes suspicion-pulse {
        from { opacity: 0.6; transform: translate(-50%, -50%) scale(0.95); }
        to   { opacity: 1.0; transform: translate(-50%, -50%) scale(1.08); }
    }
</style>

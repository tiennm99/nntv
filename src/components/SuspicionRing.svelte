<script>
    // Suspicion ring overlay — positioned absolute over the guard sprite.
    // tier 0: invisible; tier 1: yellow ring; tier 2: red + pulsing animation.
    let { tier = 0, size = 48 } = $props();

    let ringColor = $derived(tier >= 2 ? '#ff3300' : '#ffcc00');
    let visible = $derived(tier > 0);
    let pulsing = $derived(tier >= 2);
</script>

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

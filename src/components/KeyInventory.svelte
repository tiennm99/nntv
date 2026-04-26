<script>
    // KeyInventory — HUD chip row showing collected keys.
    // keysHeld is a bitmask: bit 0 = key 1 (gold), bit 1 = key 2 (silver), bit 2 = key 3 (copper).
    // Only mounted when level.keys?.length > 0.
    import { getText } from '../lib/localization.js';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { TILE_KEY, TILE_KEY_GOLD_PAL, TILE_KEY_SILVER_PAL, TILE_KEY_COPPER_PAL } from '../lib/pixel/art-tiles.js';

    const KEY_DEFS = [
        { id: 1, color: '#d4af37', pal: TILE_KEY_GOLD_PAL   },
        { id: 2, color: '#c0c0c0', pal: TILE_KEY_SILVER_PAL },
        { id: 3, color: '#b87333', pal: TILE_KEY_COPPER_PAL },
    ];

    let { keysHeld = 0 } = $props();

    let keyStates = $derived(KEY_DEFS.map(k => ({
        ...k,
        held: (keysHeld & (1 << (k.id - 1))) !== 0,
        label: getText('mechanics.key.aria').replace('{keyId}', k.id),
    })));

    let relevantKeys = $derived(keyStates.filter(k => k.held));
</script>

{#if relevantKeys.length > 0}
    <div class="key-inventory" aria-label={getText('mechanics.keys.label')}>
        {#each relevantKeys as k (k.id)}
            <div
                class="key-chip"
                style="border-color: {k.color}; background: {k.color}22;"
                title={k.label}
                aria-label={k.label}
            >
                <span class="key-icon" aria-hidden="true">
                    <Pixel art={TILE_KEY} palette={k.pal} scale={1.5} />
                </span>
            </div>
        {/each}
    </div>
{/if}

<style>
    .key-inventory {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    .key-chip {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border: 2px solid;
        border-radius: 6px;
        user-select: none;
    }
    .key-icon {
        display: flex;
        align-items: center;
        line-height: 0;
    }
</style>

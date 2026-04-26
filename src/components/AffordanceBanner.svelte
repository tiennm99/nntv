<script>
    // AffordanceBanner — stacked warning banners shown when level disables undo/preview.
    // Props match the affordances object: undo (bool), preview (bool).
    // Renders nothing when both are enabled.
    import { getText } from '../lib/localization.js';

    let { undo = true, preview = true } = $props();

    let noUndo    = $derived(undo === false);
    let noPreview = $derived(preview === false);
    let hasAny    = $derived(noUndo || noPreview);
</script>

{#if hasAny}
    <div class="affordance-banners">
        {#if noUndo}
            <div class="affordance-banner warning" role="alert">
                {getText('banner.noUndo')}
            </div>
        {/if}
        {#if noPreview}
            <div class="affordance-banner warning" role="alert">
                {getText('banner.noPreview')}
            </div>
        {/if}
    </div>
{/if}

<style>
    .affordance-banners {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
    }
    .affordance-banner {
        font: var(--font-small);
        padding: 6px 16px;
        border-radius: 4px;
        text-align: center;
    }
    .affordance-banner.warning {
        background: rgba(200, 120, 0, 0.25);
        border: 1px solid rgba(200, 120, 0, 0.6);
        color: #ffaa44;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }
</style>

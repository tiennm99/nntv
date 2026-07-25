<script>
    import { onMount } from 'svelte';
    // autofocus: focuses this button on mount. Used for the primary action of
    // modal overlays (DetectionPopup, PauseMenu, ControlsOverlay, ...) so a
    // keyboard player can press Enter/Space immediately instead of Tabbing
    // through hidden HUD controls to reach it.
    let { text, onclick, small = false, disabled = false, autofocus = false } = $props();
    let btnEl = $state(null);

    onMount(() => {
        if (autofocus && btnEl) btnEl.focus();
    });
</script>

<button bind:this={btnEl} class="btn" class:small {disabled} onclick={onclick}>
    {text}
</button>

<style>
    .btn {
        font: var(--font-button);
        color: var(--text-primary);
        background: var(--btn-default);
        border: 2px solid var(--btn-border);
        border-radius: 4px;
        padding: 10px 32px;
        min-width: 220px;
        min-height: 44px;
        cursor: pointer;
        transition: background 0.15s;
    }
    .btn:hover:not(:disabled) { background: var(--btn-hover); }
    .btn:disabled { opacity: 0.4; cursor: default; }
    .btn.small {
        font: var(--font-button-small);
        padding: 6px 16px;
        min-width: 110px;
        min-height: 44px;
    }
</style>

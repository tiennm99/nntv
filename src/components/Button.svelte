<script>
    let { text, onclick, small = false, disabled = false } = $props();
</script>

<button class="btn" class:small {disabled} onclick={onclick}>
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
        cursor: pointer;
        transition: background 0.15s;
    }
    .btn:hover:not(:disabled) { background: var(--btn-hover); }
    .btn:disabled { opacity: 0.4; cursor: default; }
    .btn.small {
        font: var(--font-button-small);
        padding: 6px 16px;
        min-width: 110px;
    }
</style>

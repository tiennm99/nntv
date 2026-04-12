<script>
    let { text, onclick, small = false } = $props();
</script>

<button class="btn" class:small onclick={onclick}>
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
    .btn:hover { background: var(--btn-hover); }
    .btn.small {
        font: var(--font-button-small);
        padding: 6px 16px;
        min-width: 110px;
    }
</style>

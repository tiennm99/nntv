<script>
    import { getText } from '../lib/localization.js';
    import Button from './Button.svelte';
    let { lives = 3, level = 1, turns = 0, showPreview = false, ontogglepreview, onpause, onmenu } = $props();
</script>

<div class="hud">
    <div class="hud-left">
        <span>{getText('lives')}{lives}</span>
        <span class="turns">Turns: {turns}</span>
    </div>
    <div class="hud-right">
        <span>{getText('level')}{level}</span>
        <Button text={showPreview ? 'V:ON' : 'V:OFF'} onclick={ontogglepreview} small />
        <Button text={getText('pause')} onclick={onpause} small />
        <Button text={getText('menu')} onclick={onmenu} small />
    </div>
</div>

<style>
    .hud {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 16px;
        font: var(--font-ui);
        color: var(--text-primary);
    }
    .hud-left, .hud-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .turns { color: var(--text-secondary); font: var(--font-small); }
</style>

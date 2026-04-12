<script>
    import { getText, setLanguage, getLanguage } from '../lib/localization.js';
    import Button from '../components/Button.svelte';
    let { navigate } = $props();
    let lang = $state(getLanguage());
    // Force re-render on language change
    let tick = $state(0);

    function changeLang(l) {
        if (lang !== l) {
            setLanguage(l);
            lang = l;
            tick++;
        }
    }
</script>

{#key tick}
<div class="settings">
    <h1>{getText('settings')}</h1>
    <p class="label">{getText('languageSettings')}</p>
    <div class="lang-buttons">
        <button class="lang-btn" class:active={lang === 'en'} onclick={() => changeLang('en')}>
            {getText('english')}
        </button>
        <button class="lang-btn" class:active={lang === 'vi'} onclick={() => changeLang('vi')}>
            {getText('vietnamese')}
        </button>
    </div>
    <Button text={getText('back')} onclick={() => navigate('MainMenu')} />
</div>
{/key}

<style>
    .settings {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        justify-content: center; align-items: center;
        gap: 20px;
        background: var(--bg-dark);
    }
    h1 { font: var(--font-title); color: var(--text-title); }
    .label { font: var(--font-body); color: var(--text-secondary); }
    .lang-buttons { display: flex; gap: 16px; }
    .lang-btn {
        font: var(--font-button);
        color: var(--text-primary);
        background: var(--btn-default);
        border: 2px solid var(--btn-border);
        border-radius: 4px;
        padding: 10px 24px;
        cursor: pointer;
        transition: background 0.15s;
    }
    .lang-btn:hover { background: var(--btn-hover); }
    .lang-btn.active { background: var(--btn-hover); }
</style>

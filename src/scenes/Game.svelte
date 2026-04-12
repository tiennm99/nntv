<script>
    import { onMount } from 'svelte';
    import { getText } from '../lib/localization.js';
    import { loadLevel, getTotalLevels } from '../lib/game/level-manager.js';
    import { TurnManager } from '../lib/game/turn-manager.js';
    import { completeLevel } from '../lib/progress.js';
    import GameBoard from '../components/GameBoard.svelte';
    import PlayerSprite from '../components/PlayerSprite.svelte';
    import GuardSprite from '../components/GuardSprite.svelte';
    import GameHud from '../components/GameHud.svelte';
    import DetectionPopup from '../components/DetectionPopup.svelte';
    import PauseMenu from '../components/PauseMenu.svelte';

    let { navigate, level = 1, lives = 3 } = $props();

    // Game state
    let grid = $state(null);
    let player = $state(null);
    let guards = $state([]);
    let turnManager = $state(new TurnManager());
    let currentLevel = $state(level); // svelte-ignore state_referenced_locally
    let livesRemaining = $state(lives); // svelte-ignore state_referenced_locally
    let isFinalLevel = $state(false);
    let goalRow = $state(0);
    let goalCol = $state(0);

    // UI state
    let isPaused = $state(false);
    let detected = $state(false);
    let showFlash = $state(false);
    let finalMessage = $state(false);

    // Derived rendering data
    let cells = $derived(grid ? grid.getAllCells() : []);
    let turns = $derived(turnManager.turnCount);
    let cellSize = $derived(grid ? Math.min(50, Math.floor(500 / grid.rows)) : 50);

    // Initialize level
    function initLevel() {
        const state = loadLevel(currentLevel);
        if (!state) return;
        grid = state.grid;
        player = state.player;
        guards = state.guards;
        isFinalLevel = state.isFinalLevel;
        goalRow = state.goalRow;
        goalCol = state.goalCol;
        turnManager = new TurnManager();
        detected = false;
        isPaused = false;
        finalMessage = false;
        showFlash = false;
    }

    onMount(() => { initLevel(); });

    // Input handling
    function onKeyDown(e) {
        if (isPaused || detected) return;
        const dirMap = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            w: 'up', s: 'down', a: 'left', d: 'right',
        };
        const dir = dirMap[e.key];
        if (dir) { e.preventDefault(); handleMove(dir); }
    }

    function onCellClick(row, col) {
        if (isPaused || detected || !player) return;
        const rowDiff = Math.abs(row - player.row);
        const colDiff = Math.abs(col - player.col);
        if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
            let dir;
            if (row < player.row) dir = 'up';
            else if (row > player.row) dir = 'down';
            else if (col < player.col) dir = 'left';
            else dir = 'right';
            handleMove(dir);
        }
    }

    function handleMove(direction) {
        if (!player || !grid) return;
        if (!player.move(direction)) return;

        // Check final level proximity trigger BEFORE turn processing
        if (isFinalLevel && checkFinalLevel()) return;

        const result = turnManager.nextTurn(grid, player, guards);

        // Force reactivity by reassigning
        grid = grid;
        guards = [...guards];
        player = player;

        if (result.levelComplete) {
            handleLevelComplete();
        } else if (result.detected) {
            detected = true;
        }
    }

    function checkFinalLevel() {
        const distance = Math.abs(player.row - goalRow) + Math.abs(player.col - goalCol);
        if (distance <= 2) {
            lightUpEntireMap();
            return true;
        }
        return false;
    }

    function lightUpEntireMap() {
        finalMessage = true;
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                if (!grid.isWall(r, c)) grid.setLight(r, c, true);
            }
        }
        grid = grid; // trigger reactivity
        // Auto-detect after brief pause
        setTimeout(() => { detected = true; }, 1500);
    }

    function handleLevelComplete() {
        const total = getTotalLevels();
        completeLevel(currentLevel, total);
        showFlash = true;
        setTimeout(() => {
            showFlash = false;
            const next = currentLevel + 1;
            if (isFinalLevel) {
                navigate('GameOver', { level: currentLevel, isLastLevel: true });
            } else if (next > total) {
                navigate('GameOver', { level: currentLevel, isLastLevel: false });
            } else {
                navigate('LevelIntro', { level: next, lives: livesRemaining });
            }
        }, 600);
    }

    function handleDetectionDismiss() {
        detected = false;
        livesRemaining--;
        if (livesRemaining <= 0) {
            navigate('GameOver', { level: currentLevel, isLastLevel: false });
        } else {
            initLevel();
        }
    }
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="game-scene" class:flash={showFlash}>
    <GameHud
        lives={livesRemaining}
        level={currentLevel}
        {turns}
        onpause={() => isPaused = true}
        onmenu={() => navigate('MainMenu')}
    />

    {#if grid && player}
        <div class="board-wrapper">
            <div class="board-container" style="position: relative;">
                <GameBoard
                    {cells}
                    rows={grid.rows}
                    cols={grid.cols}
                    {cellSize}
                    oncellclick={onCellClick}
                />
                <PlayerSprite row={player.row} col={player.col} {cellSize} />
                {#each guards as guard}
                    <GuardSprite {guard} {cellSize} />
                {/each}
            </div>
        </div>
    {/if}

    {#if finalMessage}
        <div class="final-message">
            <p>{getText('princessDetected')}</p>
        </div>
    {/if}

    {#if detected}
        <DetectionPopup onplayagain={handleDetectionDismiss} />
    {/if}

    {#if isPaused}
        <PauseMenu
            onresume={() => isPaused = false}
            onrestart={initLevel}
            onmainmenu={() => navigate('MainMenu')}
        />
    {/if}
</div>

<style>
    .game-scene {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        background: var(--bg-dark);
        position: relative;
    }
    .game-scene.flash {
        animation: level-flash 0.4s ease-out;
    }
    @keyframes level-flash {
        0% { background: var(--bg-dark); }
        50% { background: rgba(0, 200, 100, 0.2); }
        100% { background: var(--bg-dark); }
    }
    .board-wrapper {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .board-container { position: relative; }
    .final-message {
        position: absolute;
        top: 60px; left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 50;
    }
    .final-message p {
        font: var(--font-body);
        color: var(--text-danger);
        text-align: center;
        white-space: pre-line;
    }
</style>

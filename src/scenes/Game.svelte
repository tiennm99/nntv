<script>
    import { onMount } from 'svelte';
    import { getText } from '../lib/localization.js';
    import { loadLevel, getTotalLevels } from '../lib/game/level-manager.js';
    import { TurnManager } from '../lib/game/turn-manager.js';
    import { completeLevel, calculateStars } from '../lib/progress.js';
    import { LEVELS } from '../lib/levels/levels.js';
    import GameBoard from '../components/GameBoard.svelte';
    import PlayerSprite from '../components/PlayerSprite.svelte';
    import GuardSprite from '../components/GuardSprite.svelte';
    import GameHud from '../components/GameHud.svelte';
    import DetectionPopup from '../components/DetectionPopup.svelte';
    import LevelCompletePopup from '../components/LevelCompletePopup.svelte';
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
    let showLevelComplete = $state(false);
    let completionStars = $state(0);
    let completionMoves = $state(0);
    let showPreview = $state(false);

    // Render version counter — incremented after each state mutation to force
    // Svelte 5 to re-derive rendering data (class instances are not proxied)
    let renderVersion = $state(0);

    // Derived rendering data (depend on renderVersion to pick up class mutations)
    let cells = $derived((renderVersion, grid ? grid.getAllCells() : []));
    let turns = $derived((renderVersion, turnManager.turnCount));
    let cellSize = $derived(grid ? Math.min(50, Math.floor(500 / grid.rows)) : 50);
    let playerRow = $derived((renderVersion, player ? player.row : 0));
    let playerCol = $derived((renderVersion, player ? player.col : 0));
    let guardSnapshots = $derived((renderVersion, guards.map(g => ({
        row: g.row, col: g.col, type: g.type, direction: g.direction, isOn: g.isOn, isChasing: g.isChasing
    }))));
    let previewCells = $derived((renderVersion, showPreview && grid && player && guards.length
        ? turnManager.previewNextTurn(grid, player, guards)
        : new Set()));

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
        princessAlerted = false;
        alertRadius = 0;
        showLevelComplete = false;
        completionStars = 0;
        completionMoves = 0;
    }

    onMount(() => { initLevel(); });

    // Input handling
    function onKeyDown(e) {
        if (isPaused || detected || showLevelComplete) return;
        const dirMap = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            w: 'up', s: 'down', a: 'left', d: 'right',
        };
        if (e.key === 'v') { showPreview = !showPreview; return; }
        if (e.key === ' ') { e.preventDefault(); handleWait(); return; }
        const dir = dirMap[e.key];
        if (dir) { e.preventDefault(); handleMove(dir); }
    }

    function handleWait() {
        if (!player || !grid) return;
        const result = turnManager.nextTurn(grid, player, guards);
        if (isFinalLevel && checkFinalLevel()) { renderVersion++; return; }
        renderVersion++;
        if (result.levelComplete) handleLevelComplete();
        else if (result.detected) detected = true;
    }

    function onCellClick(row, col) {
        if (isPaused || detected || showLevelComplete || !player) return;
        // Tap on player cell = wait
        if (row === player.row && col === player.col) { handleWait(); return; }
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

        const result = turnManager.nextTurn(grid, player, guards);

        // Escalating princess detection — expands light wave after guard updates
        if (isFinalLevel && checkFinalLevel()) {
            renderVersion++;
            return;
        }

        // Bump version to trigger re-derivation of cells/turns/guard positions
        renderVersion++;

        if (result.levelComplete) {
            handleLevelComplete();
        } else if (result.detected) {
            detected = true;
        }
    }

    // Escalating detection: light radiates outward from goal one ring per turn
    let princessAlerted = $state(false);
    let alertRadius = $state(0);

    function checkFinalLevel() {
        const distance = Math.abs(player.row - goalRow) + Math.abs(player.col - goalCol);
        if (distance <= 4 && !princessAlerted) {
            princessAlerted = true;
            finalMessage = true;
            alertRadius = 1;
            lightRing(alertRadius);
            renderVersion++;
            return false; // don't block — let the wave chase the player
        }
        if (princessAlerted) {
            alertRadius++;
            lightRing(alertRadius);
            renderVersion++;
            // Check if expanding light reached the player
            if (grid.isLight(player.row, player.col)) {
                detected = true;
                return true;
            }
        }
        return false;
    }

    function lightRing(radius) {
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                const dist = Math.abs(r - goalRow) + Math.abs(c - goalCol);
                if (dist <= radius && !grid.isWall(r, c)) {
                    grid.setLight(r, c, true);
                }
            }
        }
    }

    function handleLevelComplete() {
        const total = getTotalLevels();
        const levelData = LEVELS[currentLevel - 1];
        const moves = turnManager.turnCount;
        const par = levelData.parMoves || 99;
        completeLevel(currentLevel, total, moves, par);
        completionMoves = moves;
        completionStars = calculateStars(moves, par);
        showFlash = true;
        showLevelComplete = true;
    }

    function handleLevelCompleteNext() {
        showLevelComplete = false;
        showFlash = false;
        const total = getTotalLevels();
        const next = currentLevel + 1;
        if (isFinalLevel) {
            navigate('GameOver', { level: currentLevel, isLastLevel: true });
        } else if (next > total) {
            navigate('GameOver', { level: currentLevel, isLastLevel: false });
        } else {
            navigate('LevelIntro', { level: next, lives: livesRemaining });
        }
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
        {showPreview}
        ontogglepreview={() => showPreview = !showPreview}
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
                    {previewCells}
                    oncellclick={onCellClick}
                />
                <PlayerSprite row={playerRow} col={playerCol} {cellSize} />
                {#each guardSnapshots as guard}
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

    {#if showLevelComplete}
        <LevelCompletePopup
            stars={completionStars}
            moves={completionMoves}
            parMoves={LEVELS[currentLevel - 1]?.parMoves ?? 99}
            onnext={handleLevelCompleteNext}
        />
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

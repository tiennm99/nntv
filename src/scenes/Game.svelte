<script>
    import { onMount, onDestroy } from 'svelte';
    import { getText } from '../lib/localization.js';
    import { loadLevel, getTotalLevels } from '../lib/game/level-manager.js';
    import { TurnManager } from '../lib/game/turn-manager.js';
    import { GameHistory } from '../lib/game/game-history.js';
    import { PrincessMechanic } from '../lib/game/princess-mechanic.js';
    import { TouchControls } from '../lib/game/touch-controls.js';
    import { completeLevel, calculateStars } from '../lib/progress.js';
    import { LEVELS } from '../lib/levels/levels.js';
    import {
        playMove, playWait, playDetection, playLevelComplete, playUndo,
        playStoneThrow, playStoneImpact, playKeyPickup, playDoorUnlock,
        playSuspicionAlert, playSuspicionFire,
    } from '../lib/audio.js';
    import GameBoard from '../components/GameBoard.svelte';
    import PlayerSprite from '../components/PlayerSprite.svelte';
    import GuardSprite from '../components/GuardSprite.svelte';
    import GameHud from '../components/GameHud.svelte';
    import ThrowTargetingOverlay from '../components/ThrowTargetingOverlay.svelte';
    import DetectionPopup from '../components/DetectionPopup.svelte';
    import LevelCompletePopup from '../components/LevelCompletePopup.svelte';
    import PauseMenu from '../components/PauseMenu.svelte';
    import ControlsOverlay from '../components/ControlsOverlay.svelte';
    import Pixel from '../lib/pixel/Pixel.svelte';
    import { sceneForLevel } from '../lib/pixel/art-scenes.js';

    let { navigate, level = 1 } = $props();

    // Game state
    let grid = $state(null);
    let player = $state(null);
    let guards = $state([]);
    let throwSystem = $state(null);
    let turnManager = $state(new TurnManager());
    let history = $state(new GameHistory());
    let princess = $state(new PrincessMechanic());
    let touch = new TouchControls();
    let currentLevel = $state(level); // svelte-ignore state_referenced_locally
    let isFinalLevel = $state(false);
    let goalRow = $state(0);
    let goalCol = $state(0);

    // Per-level affordance gates — default both enabled so existing levels work
    // until phase 04 populates level.affordances in levels.js
    let affordances = $state({ undo: true, preview: true });

    // UI state
    let isPaused = $state(false);
    let detected = $state(false);
    let playerShake = $state(false);
    let detectedCell = $state(null);
    let showFlash = $state(false);
    let finalMessage = $state(false);
    let showLevelComplete = $state(false);
    let completionStars = $state(0);
    let completionMoves = $state(0);
    let showPreview = $state(false);
    let showControls = $state(false);

    // Throw-targeting state machine: 'idle' | 'targeting'
    // When in targeting mode, arrow keys move cursor instead of player.
    let throwMode = $state('idle');
    let throwCursor = $state(null); // { row, col }

    // Level-feature flags (set on initLevel, used by HUD conditional mounts)
    let levelHasStones = $state(false);
    let levelHasKeys = $state(false);

    // Render version counter — incremented after each state mutation to force
    // Svelte 5 to re-derive rendering data (class instances are not proxied)
    let renderVersion = $state(0);

    // Derived rendering data (depend on renderVersion to pick up class mutations)
    let cells = $derived((renderVersion, grid ? grid.getAllCells() : []));
    let turns = $derived((renderVersion, turnManager.turnCount));
    // Fixed cellSize. Grids larger than the viewport scroll instead of shrinking cells,
    // preserving readability on 11x11+ arenas. Viewport handles scroll-follow (see boardEl $effect below).
    let cellSize = $derived(50);
    let playerRow = $derived((renderVersion, player ? player.row : 0));
    let playerCol = $derived((renderVersion, player ? player.col : 0));
    let guardSnapshots = $derived((renderVersion, guards.map(g => ({
        row: g.row, col: g.col, type: g.type, direction: g.direction, isOn: g.isOn, isChasing: g.isChasing, tier: g.tier
    }))));
    let previewCells = $derived((renderVersion, showPreview && affordances.preview && grid && player && guards.length
        ? turnManager.previewNextTurn(grid, player, guards, throwSystem)
        : new Set()));
    let canUndo = $derived((renderVersion, history.canUndo()));
    let scene = $derived(sceneForLevel(currentLevel));

    // HUD reactive values
    let stonesLeft = $derived((renderVersion, throwSystem ? throwSystem.stonesLeft : 0));
    let keysHeld = $derived((renderVersion, player ? player.getKeysHeld() : 0));

    // Audio delta tracking — previous values to detect changes each render
    let _prevKeysHeld = $state(0);
    let _prevOpenDoors = $state(0);   // count of open doors tracked via grid cell flags
    let _prevSuspicionTier = $state(0); // highest suspicion tier across guards

    // Fire key-pickup / door-unlock / suspicion audio on state changes
    $effect(() => {
        // Keys: any new bit set in keysHeld → key was just collected
        if (keysHeld !== _prevKeysHeld && keysHeld > _prevKeysHeld) {
            playKeyPickup();
        }
        _prevKeysHeld = keysHeld;
    });

    // Suspicion guard tier monitoring
    $effect(() => {
        if (!guards || guards.length === 0) return;
        // Read renderVersion to re-run after each turn
        // eslint-disable-next-line no-unused-expressions
        renderVersion;
        const maxTier = guards.reduce((mx, g) => {
            const t = (g.type === 'suspicion' && typeof g.tier === 'number')
                ? g.tier : 0;
            return Math.max(mx, t);
        }, 0);
        if (maxTier > _prevSuspicionTier) {
            if (maxTier === 1) playSuspicionAlert();
            else if (maxTier >= 2) playSuspicionFire();
        }
        _prevSuspicionTier = maxTier;
    });

    // Throw-targeting: compute valid targets (Manhattan ≤3, LoS clear, ≥1 distractible guard within 2)
    // Uses same logic as ThrowableSystem.throw() validation.
    const DISTRACTIBLE = new Set(['rotating', 'patrolling', 'chaser']);
    const MAX_THROW = 3;

    // Simple Bresenham LoS check — mirrors throwable.js hasLineOfSight
    function hasLoS(r0, c0, r1, c1) {
        if (!grid) return false;
        const dr = r1 - r0, dc = c1 - c0;
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        if (steps === 0) return true;
        for (let i = 1; i < steps; i++) {
            const r = Math.round(r0 + (dr * i) / steps);
            const c = Math.round(c0 + (dc * i) / steps);
            if (grid.isWall(r, c)) return false;
        }
        return true;
    }

    // Build the valid-target set for the overlay whenever targeting mode is active
    let validThrowTargets = $derived((() => {
        if (throwMode !== 'targeting' || !player || !grid) return new Set();
        const result = new Set();
        for (let r = 0; r < grid.rows; r++) {
            for (let c = 0; c < grid.cols; c++) {
                const dist = Math.abs(r - player.row) + Math.abs(c - player.col);
                if (dist === 0 || dist > MAX_THROW) continue;
                if (grid.isWall(r, c)) continue;
                if (!hasLoS(player.row, player.col, r, c)) continue;
                // Need at least one distractible guard within 2 of this target
                const hasGuard = guards.some(g =>
                    DISTRACTIBLE.has(g.type) &&
                    Math.abs(g.row - r) + Math.abs(g.col - c) <= 2
                );
                if (hasGuard) result.add(`${r},${c}`);
            }
        }
        return result;
    })());

    // Detection feedback timer — tracked so we can clear on unmount / re-init
    let detectionTimeout = null;
    // Restart-after-detection timer
    let restartTimeout = null;

    // Viewport scroll-follow — scrolls the board container so the player stays in view
    // on grids larger than the viewport. Binds to .board-container element.
    let boardEl = $state(null);
    $effect(() => {
        if (!boardEl || !grid) return;
        // Read player position to establish reactivity
        const pr = playerRow;
        const pc = playerCol;
        const target = {
            left: pc * cellSize + cellSize / 2 - boardEl.clientWidth / 2,
            top: pr * cellSize + cellSize / 2 - boardEl.clientHeight / 2,
        };
        boardEl.scrollTo({ left: Math.max(0, target.left), top: Math.max(0, target.top), behavior: 'smooth' });
    });

    // Initialize (or restart) the current level
    function initLevel() {
        const state = loadLevel(currentLevel);
        if (!state) {
            // Invalid level id — bail to main menu instead of leaving stale state
            navigate('MainMenu');
            return;
        }
        grid = state.grid;
        player = state.player;
        guards = state.guards;
        throwSystem = state.throwSystem ?? null;
        isFinalLevel = state.isFinalLevel;
        goalRow = state.goalRow;
        goalCol = state.goalCol;
        // Read affordances from level data, default both enabled
        const levelData = LEVELS[currentLevel - 1];
        affordances = levelData?.affordances ?? { undo: true, preview: true };
        // Level feature flags for conditional HUD mounts
        levelHasStones = (levelData?.stones ?? 0) > 0;
        levelHasKeys = (levelData?.keys?.length ?? 0) > 0;
        turnManager = new TurnManager();
        history = new GameHistory();
        princess = new PrincessMechanic();
        detected = false;
        isPaused = false;
        finalMessage = false;
        showFlash = false;
        showControls = false;
        playerShake = false;
        detectedCell = null;
        showLevelComplete = false;
        completionStars = 0;
        completionMoves = 0;
        showPreview = false;
        // Reset targeting state on level load
        throwMode = 'idle';
        throwCursor = null;
        renderVersion++;
    }

    // Restart current level after detection — same as initLevel but named for clarity
    function restartLevel() {
        if (detectionTimeout) { clearTimeout(detectionTimeout); detectionTimeout = null; }
        if (restartTimeout) { clearTimeout(restartTimeout); restartTimeout = null; }
        // Reset throwSystem stone count from level data
        if (throwSystem) {
            const levelData = LEVELS[currentLevel - 1];
            throwSystem.reset(levelData?.stones ?? 0);
        }
        initLevel();
    }

    onMount(() => {
        initLevel();
        // Dev easter egg — intentional escape hatch for L12 "Princess Chamber",
        // which is unsolvable by normal play. Console-savvy users who discover
        // this teleport win the game. Not documented in UI/README.
        // See memory: project_level12_unsolvable.md.
        if (typeof window !== 'undefined') {
            window.__nntvDev = {
                teleport: (row, col) => {
                    if (!player || !grid) return false;
                    if (!grid.isValidPosition(row, col)) return false;
                    player.row = row;
                    player.col = col;
                    renderVersion++;
                    if (player.isAtGoal()) handleLevelComplete();
                    return true;
                },
                reveal: () => ({
                    player: player ? { row: player.row, col: player.col } : null,
                    goal: { row: goalRow, col: goalCol },
                    level: currentLevel,
                }),
            };
        }
    });
    onDestroy(() => {
        if (detectionTimeout) clearTimeout(detectionTimeout);
        if (restartTimeout) clearTimeout(restartTimeout);
        if (typeof window !== 'undefined') delete window.__nntvDev;
    });

    // Capture current state as a snapshot object (does not push to history)
    // Includes grid key/door state and throwSystem so undo fully restores inventory
    function captureState() {
        return history.createSnapshot(player, guards, turnManager.turnCount, princess.capture(), grid, throwSystem);
    }

    // Capture and push snapshot in one step (for wait action)
    function snapshotBeforeAction() {
        history.pushSnapshot(captureState());
    }

    // Input handling
    function onKeyDown(e) {
        if (showControls) { if (e.key === 'Escape') showControls = false; return; }
        if (isPaused || detected || showLevelComplete) return;

        const dirMap = {
            ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
            w: 'up', s: 'down', a: 'left', d: 'right',
        };

        // ── Targeting mode intercepts all navigation keys ──
        if (throwMode === 'targeting') {
            e.preventDefault();
            if (e.key === 'Escape') {
                throwMode = 'idle';
                throwCursor = null;
                return;
            }
            if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
                confirmThrow();
                return;
            }
            // Arrow / WASD moves cursor
            const cursorDir = dirMap[e.key];
            if (cursorDir) { moveCursor(cursorDir); return; }
            return; // swallow any other key in targeting mode
        }

        // ── Normal (idle) mode ──
        if (e.key === 'v') {
            if (affordances.preview) showPreview = !showPreview;
            return;
        }
        if (e.key === ' ') { e.preventDefault(); handleWait(); return; }
        if (e.key === 'z') { if (affordances.undo) handleUndo(); return; }
        if (e.key === 'y') { if (affordances.undo) handleRedo(); return; }
        if (e.key === 'e' || e.key === 'E') { enterTargeting(); return; }
        const dir = dirMap[e.key];
        if (dir) { e.preventDefault(); handleMove(dir); }
    }

    function handleWait() {
        if (!player || !grid) return;
        snapshotBeforeAction();
        playWait();
        const result = turnManager.nextTurn(grid, player, guards, throwSystem);
        if (isFinalLevel && checkFinalLevel()) { renderVersion++; return; }
        renderVersion++;
        if (result.levelComplete) handleLevelComplete();
        else if (result.detected) triggerDetection();
    }

    function onCellClick(row, col) {
        if (isPaused || detected || showLevelComplete || showControls || !player) return;

        // In targeting mode: move cursor to clicked cell, auto-confirm if valid
        if (throwMode === 'targeting') {
            throwCursor = { row, col };
            if (validThrowTargets.has(`${row},${col}`)) {
                confirmThrow();
            }
            return;
        }

        // Normal mode: adjacent move or wait on own cell
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
        // Capture pre-move state, attempt move, discard snapshot if move fails
        const preSnapshot = captureState();
        if (!player.move(direction)) return;
        history.pushSnapshot(preSnapshot);
        playMove();

        const result = turnManager.nextTurn(grid, player, guards, throwSystem);

        if (isFinalLevel && checkFinalLevel()) {
            renderVersion++;
            return;
        }

        renderVersion++;

        if (result.levelComplete) {
            handleLevelComplete();
        } else if (result.detected) {
            triggerDetection();
        }
    }

    // ── Throw-targeting state machine ──────────────────────────────────────────

    // Enter targeting mode (E key from idle, stones > 0)
    function enterTargeting() {
        if (!throwSystem || throwSystem.stonesLeft <= 0) return;
        if (!player) return;
        throwMode = 'targeting';
        throwCursor = { row: player.row, col: player.col };
    }

    // Move cursor one step in a direction (clamped to grid bounds)
    function moveCursor(dir) {
        if (!throwCursor || !grid) return;
        let { row, col } = throwCursor;
        if (dir === 'up')    row = Math.max(0, row - 1);
        if (dir === 'down')  row = Math.min(grid.rows - 1, row + 1);
        if (dir === 'left')  col = Math.max(0, col - 1);
        if (dir === 'right') col = Math.min(grid.cols - 1, col + 1);
        throwCursor = { row, col };
    }

    // Confirm throw at current cursor position (if valid)
    function confirmThrow() {
        if (!throwCursor || !throwSystem || !player || !grid) return;
        const { row, col } = throwCursor;
        const isValid = validThrowTargets.has(`${row},${col}`);
        if (!isValid) return; // stay in targeting mode — let player reposition cursor

        snapshotBeforeAction();
        const ok = throwSystem.throw(row, col, player, grid);
        if (ok) {
            playStoneThrow();
            setTimeout(() => playStoneImpact(), 80);
            const result = turnManager.nextTurn(grid, player, guards, throwSystem);
            renderVersion++;
            if (result.levelComplete) handleLevelComplete();
            else if (result.detected) triggerDetection();
        }
        // Exit targeting mode whether throw succeeded or not
        throwMode = 'idle';
        throwCursor = null;
    }

    // Detection feedback — flash cell, shake player, play sound, then restart level.
    // DetectionPopup is shown briefly; on dismiss (or after timeout) level reloads.
    function triggerDetection() {
        detectedCell = { row: player.row, col: player.col };
        playerShake = true;
        playDetection();
        detected = true;
        if (detectionTimeout) clearTimeout(detectionTimeout);
        detectionTimeout = setTimeout(() => {
            playerShake = false;
            detectedCell = null;
            detectionTimeout = null;
        }, 400);
    }

    // Called when the player dismisses the DetectionPopup — restart current level
    function handleDetectionDismiss() {
        detected = false;
        restartLevel();
    }

    // Undo/redo handlers
    function applyHistoryState(state) {
        princess.apply(state.princess);
        finalMessage = princess.alerted;
        grid.clearAllLight();
        guards.forEach(g => g.updateLight(guards));
        if (princess.alerted) princess.lightRing(grid, goalRow, goalCol, princess.alertRadius);
    }

    function handleUndo() {
        if (!player || !grid) return;
        const state = history.undo(player, guards, turnManager, princess.capture(), grid, throwSystem);
        if (!state) return;
        applyHistoryState(state);
        playUndo();
        renderVersion++;
    }

    function handleRedo() {
        if (!player || !grid) return;
        const state = history.redo(player, guards, turnManager, princess.capture(), grid, throwSystem);
        if (!state) return;
        applyHistoryState(state);
        renderVersion++;
    }

    // Touch/swipe controls for mobile
    function onTouchStart(e) { touch.onTouchStart(e); }

    function onTouchEnd(e) {
        if (isPaused || detected || showLevelComplete || showControls) return;
        const dir = touch.onTouchEnd(e);
        if (dir) handleMove(dir);
    }

    // Escalating princess detection (final level)
    function checkFinalLevel() {
        const result = princess.update(grid, player, goalRow, goalCol);
        if (result.showMessage) { finalMessage = true; renderVersion++; return false; }
        if (result.detected) { triggerDetection(); renderVersion++; return true; }
        if (princess.alerted) renderVersion++;
        return false;
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
        playLevelComplete();
    }

    function handleLevelCompleteNext() {
        showLevelComplete = false;
        showFlash = false;
        const total = getTotalLevels();
        const next = currentLevel + 1;
        if (isFinalLevel) {
            // L12 reached goal — bittersweet princess narrative
            navigate('GameOver', { level: currentLevel, flow: 'bittersweet' });
        } else if (next > total) {
            // All non-final levels cleared (L11) — run complete celebration
            navigate('GameOver', { level: currentLevel, flow: 'runComplete' });
        } else {
            navigate('LevelIntro', { level: next });
        }
    }
</script>

<svelte:window onkeydown={onKeyDown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="game-scene" class:flash={showFlash}
     ontouchstart={onTouchStart} ontouchend={onTouchEnd}>
    <div class="scene-backdrop">
        <Pixel art={scene.art} palette={scene.pal} width={1024} height={384} />
    </div>
    <GameHud
        level={currentLevel}
        {turns}
        {showPreview}
        {canUndo}
        allowUndo={affordances.undo}
        allowPreview={affordances.preview}
        showStones={levelHasStones}
        {stonesLeft}
        showKeys={levelHasKeys}
        {keysHeld}
        ontogglepreview={() => { if (affordances.preview) showPreview = !showPreview; }}
        onpause={() => isPaused = true}
        onmenu={() => navigate('MainMenu')}
        onundo={handleUndo}
        onshowcontrols={() => showControls = true}
    />

    {#if grid && player}
        <div class="board-wrapper">
            <div class="board-container" bind:this={boardEl} style="position: relative;">
                <GameBoard
                    {cells}
                    rows={grid.rows}
                    cols={grid.cols}
                    {cellSize}
                    {previewCells}
                    {detectedCell}
                    oncellclick={onCellClick}
                />
                <!-- Throw-targeting overlay (mounted when in targeting mode) -->
                {#if throwMode === 'targeting'}
                    <ThrowTargetingOverlay
                        cursor={throwCursor}
                        validTargets={validThrowTargets}
                        playerPos={{ row: playerRow, col: playerCol }}
                        rows={grid.rows}
                        cols={grid.cols}
                        {cellSize}
                    />
                {/if}
                <PlayerSprite row={playerRow} col={playerCol} {cellSize} shake={playerShake} />
                {#each guardSnapshots as guard}
                    <GuardSprite {guard} {cellSize} allCells={cells} />
                {/each}
            </div>
        </div>
    {/if}

    <!-- Throw mode hint shown below the board when stones are available -->
    {#if grid && player && levelHasStones && throwMode === 'idle' && stonesLeft > 0}
        <div class="throw-hint" role="status">
            {getText('throw.hintEnter')}
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

    {#if showControls}
        <ControlsOverlay onclose={() => showControls = false} />
    {/if}
</div>

<style>
    .game-scene {
        width: 100%; height: 100%;
        display: flex; flex-direction: column;
        background: var(--bg-dark);
        position: relative;
        overflow: hidden;
    }
    .scene-backdrop {
        position: absolute;
        inset: 0;
        opacity: 0.22;
        pointer-events: none;
        z-index: 0;
        display: flex;
        align-items: flex-start;
        justify-content: center;
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
        position: relative;
        z-index: 1;
    }
    .board-container {
        position: relative;
        background: rgba(10, 10, 26, 0.55);
        padding: 8px;
        border-radius: 6px;
        box-shadow: 0 0 24px rgba(0, 0, 0, 0.6);
        /* Cap viewport; grids larger than this scroll with camera-follow */
        max-width: min(720px, 85vw, 85vh);
        max-height: min(720px, 85vw, 85vh);
        overflow: auto;
        scroll-behavior: smooth;
    }
    .final-message {
        position: absolute;
        top: 60px; left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 50;
    }
    .throw-hint {
        position: absolute;
        bottom: 12px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(180, 130, 80, 0.4);
        border-radius: 4px;
        padding: 4px 12px;
        font: var(--font-small);
        color: var(--text-secondary);
        pointer-events: none;
        z-index: 10;
    }
    .final-message p {
        font: var(--font-body);
        color: var(--text-danger);
        text-align: center;
        white-space: pre-line;
    }
</style>

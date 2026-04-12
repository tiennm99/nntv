import Phaser from 'phaser';
import { GridSystem } from '../objects/GridSystem';
import { Player } from '../objects/Player';
import { TurnManager } from '../objects/TurnManager';
import { LightingSystem } from '../objects/LightingSystem';
import { StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard } from '../objects/Guard';
import { LevelManager } from '../levels/LevelManager';
import { getText } from '../localization';
import { COLORS, FONTS, createButton, createSmallButton } from '../theme';
import { completeLevel } from '../progress';

export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        this.player = null;
        this.grid = null;
        this.lightSystem = null;
        this.turnManager = null;
        this.guards = [];
        this.levelManager = null;
        this.currentLevel = 1;
        this.livesRemaining = 3;
        this.gridSize = 8; // Default grid size
        this.cellSize = 50; // Default cell size
        this.gridOffsetX = 0;
        this.gridOffsetY = 0;
        this.inputEnabled = true;
        this.inputCooldown = 0;
        this.isPaused = false;
        this.isFinalLevel = false;
        this.cameraFollowsPlayer = false; // Disable camera following player
    }

    init(data) {
        this.currentLevel = data.level || 1;
        this.livesRemaining = data.lives || 3;
        // Reset state flags (constructor only runs once in Phaser)
        this.inputEnabled = true;
        this.isPaused = false;
        this.isFinalLevel = false;
        this.inputCooldown = 0;
        this.guards = [];
        this.detectionPopup = null;
        this.finalLevelMessage = null;
    }

    create() {
        // Get screen dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create a container for the game world
        this.worldContainer = this.add.container(0, 0);

        // Create a camera for the game world
        this.gameCamera = this.cameras.main;

        // Calculate grid position to center it
        this.gridOffsetX = Math.floor((width - (this.gridSize * this.cellSize)) / 2);
        this.gridOffsetY = Math.floor((height - (this.gridSize * this.cellSize)) / 2);

        // Create grid system
        this.createGridSystem();

        // Create lighting system
        this.lightSystem = new LightingSystem(this, this.grid);

        // Make guard classes available to LevelManager
        this.StaticGuard = StaticGuard;
        this.RotatingGuard = RotatingGuard;
        this.BlinkingGuard = BlinkingGuard;
        this.PatrollingGuard = PatrollingGuard;

        // Create level manager
        this.levelManager = new LevelManager(this);

        // Create turn manager
        this.turnManager = new TurnManager(this);

        // Create player
        this.createPlayer(0, 0); // Default position, will be updated by level data

        // Setup input
        this.setupInput();

        // Create UI (fixed to camera, not in world container)
        this.createUI();

        // Load level
        this.levelManager.loadLevel(this.currentLevel);

        // Setup camera to follow player after level is loaded
        this.setupCamera();

        // Fade in
        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    setupCamera() {
        // Make sure player exists
        if (!this.player || !this.player.sprite) {
            console.log("Cannot setup camera: player or player sprite is null");
            return;
        }

        // Get the game dimensions
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Reset the main camera
        this.cameras.main.resetFX();
        this.cameras.main.stopFollow();

        // Set the camera bounds to the entire world
        const worldWidth = Math.max(width, this.gridSize * this.cellSize + this.gridOffsetX * 2);
        const worldHeight = Math.max(height, this.gridSize * this.cellSize + this.gridOffsetY * 2);

        // Set world bounds
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Set camera bounds
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

        // Ensure the world container is centered
        this.worldContainer.x = 0;
        this.worldContainer.y = 0;

        // Center the camera on the grid instead of following the player
        const gridCenterX = this.gridOffsetX + (this.gridSize * this.cellSize) / 2;
        const gridCenterY = this.gridOffsetY + (this.gridSize * this.cellSize) / 2;
        this.cameras.main.centerOn(gridCenterX, gridCenterY);

        console.log("Camera setup complete - centered on grid");
    }

    update() {
        // Only process input if game is not paused
        if (!this.isPaused) {
            // Check for keyboard input
            this.handleKeyboardInput();

            // Check for final level special condition
            if (this.isFinalLevel) {
                this.checkFinalLevelCondition();
            }

            // Make sure player exists
            if (this.player && this.player.sprite) {
                // Update player position
                this.player.update();

                // No need to check camera following anymore as we're using a static camera
            }
        }
    }

    createGridSystem() {
        this.grid = new GridSystem(this, this.gridSize, this.gridSize, this.cellSize);

        // Position the grid in the center of the screen
        this.grid.graphics.x = this.gridOffsetX;
        this.grid.graphics.y = this.gridOffsetY;

        // Add grid graphics to world container
        this.worldContainer.add(this.grid.graphics);

        // Render the grid
        this.grid.render();

        // Debug: Visualize cell centers (uncomment for debugging)
        // this.visualizeCellCenters();
    }

    // Helper method to visualize the center of each cell (for debugging)
    visualizeCellCenters() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const { x, y } = this.gridToScreen(row, col);
                // Draw a small dot at the center of each cell
                const centerMarker = this.add.circle(x, y, 2, 0xFF0000);
                centerMarker.setDepth(100); // Ensure it's visible above other elements
            }
        }
    }

    createPlayer(row, col) {
        this.player = new Player(this, this.grid, row, col);
    }

    setupInput() {
        // Setup keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();

        // WASD keys
        this.wasd = {
            up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };

        // Add click/tap input for grid cells
        this.input.on('pointerdown', (pointer) => {
            if (this.isPaused || !this.inputEnabled || !this.turnManager.isPlayerTurn) return;

            // Convert screen coordinates to grid coordinates
            const gridPos = this.screenToGrid(pointer.x, pointer.y);

            // Check if the clicked position is adjacent to the player
            const rowDiff = Math.abs(gridPos.row - this.player.row);
            const colDiff = Math.abs(gridPos.col - this.player.col);

            // Only allow moving to adjacent cells (not diagonally)
            if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
                if (this.player.moveTo(gridPos.row, gridPos.col)) {
                    this.turnManager.nextTurn();
                    this.updateTurnDisplay();
                }
            }
        });
    }

    handleKeyboardInput() {
        // Only process input during player's turn and when input is enabled
        if (!this.inputEnabled || !this.turnManager.isPlayerTurn) return;

        // Use a cooldown to prevent multiple inputs in a single frame
        if (this.inputCooldown > 0) {
            this.inputCooldown--;
            return;
        }

        let direction = null;

        // Check arrow keys
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            direction = 'up';
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            direction = 'down';
        } else if (this.cursors.left.isDown || this.wasd.left.isDown) {
            direction = 'left';
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            direction = 'right';
        }

        if (direction) {
            if (this.player.move(direction)) {
                this.turnManager.nextTurn();
                this.updateTurnDisplay();
                this.inputCooldown = 10;
            }
        }
    }

    createUI() {
        const width = this.cameras.main.width;

        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);

        // Lives display
        this.livesText = this.add.text(20, 20, `${getText('lives')}${this.livesRemaining}`, {
            font: FONTS.ui, fill: COLORS.textPrimary,
        }).setScrollFactor(0);

        // Level display
        this.levelText = this.add.text(width - 20, 20, `${getText('level')}${this.currentLevel}`, {
            font: FONTS.ui, fill: COLORS.textPrimary,
        }).setOrigin(1, 0).setScrollFactor(0);

        // Turn counter
        this.turnText = this.add.text(20, 44, `Turns: 0`, {
            font: FONTS.small, fill: COLORS.textSecondary,
        }).setScrollFactor(0);

        // Pause button
        const pauseBtn = createSmallButton(this, width - 65, 60, getText('pause'), () => {
            this.togglePause();
        });
        [pauseBtn.border, pauseBtn.bg, pauseBtn.label].forEach(o => o.setScrollFactor(0));

        // Menu button
        const menuBtn = createSmallButton(this, width - 65, 100, getText('menu'), () => {
            this.scene.start('MainMenu');
        });
        [menuBtn.border, menuBtn.bg, menuBtn.label].forEach(o => o.setScrollFactor(0));

        this.uiContainer.add([
            this.livesText, this.levelText, this.turnText,
            pauseBtn.border, pauseBtn.bg, pauseBtn.label,
            menuBtn.border, menuBtn.bg, menuBtn.label,
        ]);

        this.createPauseMenu();
    }

    createPauseMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.pauseMenu = this.add.container(width / 2, height / 2);
        this.pauseMenu.setScrollFactor(0);

        const bg = this.add.rectangle(0, 0, 300, 260, COLORS.bgOverlay, 0.85);
        const border = this.add.rectangle(0, 0, 302, 262, COLORS.btnBorder).setFillStyle();
        border.setStrokeStyle(2, COLORS.btnBorder);

        const title = this.add.text(0, -100, getText('paused'), {
            font: FONTS.heading, fill: COLORS.textTitle, wordWrap: { width: 280 },
        }).setOrigin(0.5, 0.5);

        const makeMenuBtn = (y, text, onClick) => {
            const btnBg = this.add.rectangle(0, y, 200, 40, COLORS.btnDefault);
            const btnLabel = this.add.text(0, y, text, {
                font: FONTS.buttonSmall, fill: COLORS.textPrimary, wordWrap: { width: 180 },
            }).setOrigin(0.5, 0.5);
            btnBg.setInteractive({ useHandCursor: true })
                .on('pointerover', () => btnBg.fillColor = COLORS.btnHover)
                .on('pointerout', () => btnBg.fillColor = COLORS.btnDefault)
                .on('pointerdown', onClick);
            return [btnBg, btnLabel];
        };

        const resumeEls = makeMenuBtn(-40, getText('resume'), () => this.togglePause());
        const restartEls = makeMenuBtn(20, getText('restartLevel'), () => {
            this.togglePause();
            this.levelManager.loadLevel(this.currentLevel);
        });
        const menuEls = makeMenuBtn(80, getText('mainMenu'), () => this.scene.start('MainMenu'));

        this.pauseMenu.add([bg, border, title, ...resumeEls, ...restartEls, ...menuEls]);
        this.pauseMenu.setVisible(false);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseMenu.setVisible(this.isPaused);
        this.inputEnabled = !this.isPaused;
    }

    updateTurnDisplay() {
        if (this.turnText) {
            this.turnText.setText(`Turns: ${this.turnManager.turnCount}`);
        }
    }



    // Helper method to convert grid coordinates to screen coordinates
    gridToScreen(row, col) {
        const gridPos = this.grid.gridToPixel(row, col);
        return {
            x: gridPos.x + this.gridOffsetX,
            y: gridPos.y + this.gridOffsetY
        };
    }

    // Helper method to convert screen coordinates to grid coordinates
    screenToGrid(x, y) {
        return this.grid.pixelToGrid(x - this.gridOffsetX, y - this.gridOffsetY);
    }

    showDetectionPopup() {
        if (this.detectionPopup) return;

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.isPaused = true;
        this.inputEnabled = false;

        this.detectionPopup = this.add.container(width / 2, height / 2);
        this.detectionPopup.setDepth(100);
        this.detectionPopup.setScrollFactor(0);

        const bg = this.add.rectangle(0, 0, 300, 200, COLORS.bgOverlay, 0.85);
        const title = this.add.text(0, -60, getText('detected'), {
            font: FONTS.heading, fill: COLORS.textDanger, wordWrap: { width: 280 },
        }).setOrigin(0.5, 0.5);

        const btnBg = this.add.rectangle(0, 20, 200, 40, COLORS.btnDefault);
        const btnLabel = this.add.text(0, 20, getText('playAgain'), {
            font: FONTS.buttonSmall, fill: COLORS.textPrimary, wordWrap: { width: 180 },
        }).setOrigin(0.5, 0.5);

        this.detectionPopup.add([bg, title, btnBg, btnLabel]);

        btnBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => btnBg.fillColor = COLORS.btnHover)
            .on('pointerout', () => btnBg.fillColor = COLORS.btnDefault)
            .on('pointerdown', () => {
                this.closeDetectionPopup();
                this.handlePlayerCaught();
            });
    }

    closeDetectionPopup() {
        if (this.detectionPopup) {
            this.detectionPopup.removeAll(true);
            this.detectionPopup.destroy();
            this.detectionPopup = null;
            this.isPaused = false;
            this.inputEnabled = true;
        }
    }

    // Xử lý khi người chơi bị bắt
    handlePlayerCaught() {
        this.livesRemaining--;

        // Cập nhật hiển thị số mạng
        if (this.livesText) {
            this.livesText.setText(`${getText('lives')}${this.livesRemaining}`);
        }

        // Đảm bảo tất cả các popup đã được đóng
        if (this.detectionPopup) {
            this.closeDetectionPopup();
        }

        if (this.livesRemaining <= 0) {
            // Hết mạng, game over
            this.scene.start('GameOver', {
                level: this.currentLevel,
                isLastLevel: false
            });
        } else {
            // Còn mạng, reset màn chơi hiện tại
            this.levelManager.loadLevel(this.currentLevel);
        }
    }

    handleLevelComplete() {
        const totalLevels = this.levelManager.getTotalLevels();
        completeLevel(this.currentLevel, totalLevels);

        this.isPaused = true;
        this.inputEnabled = false;

        const nextLevel = this.currentLevel + 1;

        // Brief flash celebration then transition
        this.cameras.main.flash(400, 0, 200, 100);
        this.time.delayedCall(600, () => {
            this.cameras.main.fadeOut(300, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                if (this.isFinalLevel) {
                    this.scene.start('GameOver', { level: this.currentLevel, isLastLevel: true });
                } else if (nextLevel > totalLevels) {
                    this.scene.start('GameOver', { level: this.currentLevel, isLastLevel: false });
                } else {
                    this.scene.start('LevelIntro', { level: nextLevel, lives: this.livesRemaining });
                }
            });
        });
    }

    // Kiểm tra điều kiện đặc biệt cho màn cuối
    checkFinalLevelCondition() {
        if (!this.isFinalLevel) return false;

        // Kiểm tra xem người chơi có đang ở gần công chúa cà rốt bị mất tích không
        const playerRow = this.player.row;
        const playerCol = this.player.col;
        const goalRow = 9; // Vị trí công chúa cà rốt ở màn cuối (row 9, col 9)
        const goalCol = 9;

        // Tính khoảng cách Manhattan từ người chơi đến công chúa cà rốt
        const distance = Math.abs(playerRow - goalRow) + Math.abs(playerCol - goalCol);

        // Nếu ninja thỏ đến gần công chúa cà rốt (khoảng cách <= 2), kích hoạt cơ chế đặc biệt
        if (distance <= 2) {
            // Bật sáng toàn bộ bản đồ
            this.lightUpEntireMap();
            return true;
        }

        return false;
    }

    // Bật sáng toàn bộ bản đồ cho màn cuối
    lightUpEntireMap() {
        // Hiển thị thông báo
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        if (!this.finalLevelMessage) {
            this.finalLevelMessage = this.add.text(width / 2, height / 4,
                getText('princessDetected'), {
                font: FONTS.body,
                fill: COLORS.textDanger,
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 },
                wordWrap: { width: width * 0.8 },
            });
            this.finalLevelMessage.setOrigin(0.5, 0.5);
            this.finalLevelMessage.setDepth(100);
            this.finalLevelMessage.setScrollFactor(0); // Fix to camera (don't move with world)
        }

        // Bật sáng toàn bộ các ô
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                if (!this.grid.isWall(row, col)) {
                    this.grid.setLight(row, col, true);
                }
            }
        }

        // Vẽ lại lưới
        this.grid.render();
    }
}

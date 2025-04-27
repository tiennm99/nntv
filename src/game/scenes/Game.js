import Phaser from 'phaser';
import { GridSystem } from '../objects/GridSystem';
import { Player } from '../objects/Player';
import { TurnManager } from '../objects/TurnManager';
import { LightingSystem } from '../objects/LightingSystem';
import { StaticGuard, RotatingGuard, BlinkingGuard, PatrollingGuard } from '../objects/Guard';
import { LevelManager } from '../levels/LevelManager';
import { getText } from '../localization';

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
    }

    init(data) {
        // Initialize with data passed from previous scene
        this.currentLevel = data.level || 1;
        this.livesRemaining = data.lives || 3;
    }

    create() {
        // Calculate grid position to center it
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        this.gridOffsetX = (width - (this.gridSize * this.cellSize)) / 2;
        this.gridOffsetY = (height - (this.gridSize * this.cellSize)) / 2;

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

        // Create UI
        this.createUI();

        // Create mobile controls if needed
        this.createMobileControls();

        // Load level
        this.levelManager.loadLevel(this.currentLevel);
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
        }
    }

    createGridSystem() {
        this.grid = new GridSystem(this, this.gridSize, this.gridSize, this.cellSize);

        // Position the grid in the center of the screen
        this.grid.graphics.x = this.gridOffsetX;
        this.grid.graphics.y = this.gridOffsetY;

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
                this.inputCooldown = 10; // Set cooldown to prevent multiple moves
            }
        }
    }

    createUI() {
        // Create UI elements
        const width = this.cameras.main.width;

        // Lives display
        this.livesText = this.add.text(20, 20, `${getText('lives')}${this.livesRemaining}`, {
            font: '18px Arial',
            fill: '#ffffff'
        });

        // Level display
        this.levelText = this.add.text(width - 20, 20, `${getText('level')}${this.currentLevel}`, {
            font: '18px Arial',
            fill: '#ffffff'
        });
        this.levelText.setOrigin(1, 0);

        // Pause button
        this.pauseButton = this.add.rectangle(width - 20, 60, 100, 30, 0x444444);
        this.pauseButton.setOrigin(1, 0);

        this.pauseText = this.add.text(width - 70, 75, getText('pause'), {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.pauseText.setOrigin(0.5, 0.5);

        this.pauseButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.togglePause();
            });

        // Return to Main Menu button
        this.returnButton = this.add.rectangle(width - 20, 100, 100, 30, 0x444444);
        this.returnButton.setOrigin(1, 0);

        this.returnText = this.add.text(width - 70, 115, getText('menu'), {
            font: '16px Arial',
            fill: '#ffffff'
        });
        this.returnText.setOrigin(0.5, 0.5);

        this.returnButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => this.returnButton.fillColor = 0x666666)
            .on('pointerout', () => this.returnButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });

        // Create pause menu (initially hidden)
        this.createPauseMenu();
    }

    createPauseMenu() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Create container for pause menu
        this.pauseMenu = this.add.container(width / 2, height / 2);

        // Background
        const bg = this.add.rectangle(0, 0, 300, 250, 0x000000, 0.8);

        // Title
        const title = this.add.text(0, -100, getText('paused'), {
            font: 'bold 32px Arial',
            fill: '#ffffff'
        });
        title.setOrigin(0.5, 0.5);

        // Resume button
        const resumeButton = this.add.rectangle(0, -40, 200, 40, 0x444444);
        const resumeText = this.add.text(0, -40, getText('resume'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        resumeText.setOrigin(0.5, 0.5);

        // Restart button
        const restartButton = this.add.rectangle(0, 20, 200, 40, 0x444444);
        const restartText = this.add.text(0, 20, getText('restartLevel'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        restartText.setOrigin(0.5, 0.5);

        // Main menu button
        const menuButton = this.add.rectangle(0, 80, 200, 40, 0x444444);
        const menuText = this.add.text(0, 80, getText('mainMenu'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        menuText.setOrigin(0.5, 0.5);

        // Add all elements to container
        this.pauseMenu.add([bg, title, resumeButton, resumeText, restartButton, restartText, menuButton, menuText]);

        // Make buttons interactive
        resumeButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => resumeButton.fillColor = 0x666666)
            .on('pointerout', () => resumeButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.togglePause();
            });

        restartButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartButton.fillColor = 0x666666)
            .on('pointerout', () => restartButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.togglePause();
                this.levelManager.loadLevel(this.currentLevel);
            });

        menuButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => menuButton.fillColor = 0x666666)
            .on('pointerout', () => menuButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.scene.start('MainMenu');
            });

        // Hide pause menu initially
        this.pauseMenu.setVisible(false);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.pauseMenu.setVisible(this.isPaused);
        this.inputEnabled = !this.isPaused;
    }

    createMobileControls() {
        // Create mobile control buttons
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Container for mobile controls
        this.mobileControls = this.add.container(width / 2, height - 100);

        // Create directional buttons
        const buttonSize = 60;
        const buttonSpacing = 70;

        // Up button
        const upButton = this.add.circle(0, -buttonSpacing, buttonSize / 2, 0x444444);
        const upText = this.add.text(0, -buttonSpacing, '↑', { font: '32px Arial', fill: '#ffffff' });
        upText.setOrigin(0.5, 0.5);

        // Left button
        const leftButton = this.add.circle(-buttonSpacing, 0, buttonSize / 2, 0x444444);
        const leftText = this.add.text(-buttonSpacing, 0, '←', { font: '32px Arial', fill: '#ffffff' });
        leftText.setOrigin(0.5, 0.5);

        // Right button
        const rightButton = this.add.circle(buttonSpacing, 0, buttonSize / 2, 0x444444);
        const rightText = this.add.text(buttonSpacing, 0, '→', { font: '32px Arial', fill: '#ffffff' });
        rightText.setOrigin(0.5, 0.5);

        // Down button
        const downButton = this.add.circle(0, buttonSpacing, buttonSize / 2, 0x444444);
        const downText = this.add.text(0, buttonSpacing, '↓', { font: '32px Arial', fill: '#ffffff' });
        downText.setOrigin(0.5, 0.5);

        // Add buttons to container
        this.mobileControls.add([upButton, upText, leftButton, leftText, rightButton, rightText, downButton, downText]);

        // Make buttons interactive
        upButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.isPaused && this.inputEnabled && this.turnManager.isPlayerTurn) {
                    if (this.player.move('up')) {
                        this.turnManager.nextTurn();
                    }
                }
            });

        leftButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.isPaused && this.inputEnabled && this.turnManager.isPlayerTurn) {
                    if (this.player.move('left')) {
                        this.turnManager.nextTurn();
                    }
                }
            });

        rightButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.isPaused && this.inputEnabled && this.turnManager.isPlayerTurn) {
                    if (this.player.move('right')) {
                        this.turnManager.nextTurn();
                    }
                }
            });

        downButton.setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (!this.isPaused && this.inputEnabled && this.turnManager.isPlayerTurn) {
                    if (this.player.move('down')) {
                        this.turnManager.nextTurn();
                    }
                }
            });

        // Only show mobile controls on touch devices
        this.mobileControls.setVisible(false);

        // Check if device has touch capability
        if (this.sys.game.device.input.touch) {
            this.mobileControls.setVisible(true);
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

    // Hiển thị popup khi người chơi bị phát hiện
    showDetectionPopup() {
        // Kiểm tra xem popup đã tồn tại chưa, nếu có thì không tạo mới
        if (this.detectionPopup) {
            return; // Đã có popup, không tạo thêm
        }

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Tạm dừng game
        this.isPaused = true;
        this.inputEnabled = false;

        // Tạo container cho popup
        this.detectionPopup = this.add.container(width / 2, height / 2);
        this.detectionPopup.setDepth(100);
        this.detectionPopup.popup = 'detection'; // Đánh dấu container

        // Background
        const bg = this.add.rectangle(0, 0, 300, 200, 0x000000, 0.8);
        bg.popup = 'detection'; // Đánh dấu phần tử thuộc về popup

        // Thông báo
        const title = this.add.text(0, -60, getText('detected'), {
            font: 'bold 28px Arial',
            fill: '#FF0000'
        });
        title.setOrigin(0.5, 0.5);
        title.popup = 'detection'; // Đánh dấu phần tử thuộc về popup

        // Nút chơi lại
        const restartButton = this.add.rectangle(0, 20, 200, 40, 0x444444);
        restartButton.popup = 'detection'; // Đánh dấu phần tử thuộc về popup

        const restartText = this.add.text(0, 20, getText('playAgain'), {
            font: '20px Arial',
            fill: '#ffffff'
        });
        restartText.setOrigin(0.5, 0.5);
        restartText.popup = 'detection'; // Đánh dấu phần tử thuộc về popup

        // Thêm các phần tử vào container
        this.detectionPopup.add([bg, title, restartButton, restartText]);

        // Làm cho nút có thể tương tác
        restartButton.setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartButton.fillColor = 0x666666)
            .on('pointerout', () => restartButton.fillColor = 0x444444)
            .on('pointerdown', () => {
                this.closeDetectionPopup();
                this.handlePlayerCaught();
            });
    }

    // Đóng popup phát hiện
    closeDetectionPopup() {
        if (this.detectionPopup) {
            // Đảm bảo tất cả các phần tử con cũng được hủy
            this.detectionPopup.removeAll(true);
            this.detectionPopup.destroy();
            this.detectionPopup = null;
            this.isPaused = false;
            this.inputEnabled = true;

            // Đảm bảo rằng tất cả các phần tử liên quan đến popup đã được xóa
            this.children.list.forEach(child => {
                if (child.popup && child.popup === 'detection') {
                    child.destroy();
                }
            });
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

    // Xử lý khi người chơi hoàn thành màn chơi
    handleLevelComplete() {
        const nextLevel = this.currentLevel + 1;

        // Kiểm tra xem có phải màn cuối không
        if (this.isFinalLevel) {
            // Đây là màn cuối với cái kết đặc biệt
            this.scene.start('GameOver', {
                level: this.currentLevel,
                isLastLevel: true
            });
        } else if (nextLevel > this.levelManager.getTotalLevels()) {
            // Đã hoàn thành tất cả các màn
            this.scene.start('GameOver', {
                level: this.currentLevel,
                isLastLevel: false
            });
        } else {
            // Chuyển đến màn tiếp theo
            this.scene.start('Game', {
                level: nextLevel,
                lives: this.livesRemaining
            });
        }
    }

    // Kiểm tra điều kiện đặc biệt cho màn cuối
    checkFinalLevelCondition() {
        if (!this.isFinalLevel) return false;

        // Kiểm tra xem người chơi có đang ở gần công chúa không
        const playerRow = this.player.row;
        const playerCol = this.player.col;
        const goalRow = 9; // Vị trí công chúa ở màn cuối (row 9, col 9)
        const goalCol = 9;

        // Tính khoảng cách Manhattan từ người chơi đến công chúa
        const distance = Math.abs(playerRow - goalRow) + Math.abs(playerCol - goalCol);

        // Nếu người chơi đến gần công chúa (khoảng cách <= 2), kích hoạt cơ chế đặc biệt
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
                font: 'bold 20px Arial',
                fill: '#FF0000',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            });
            this.finalLevelMessage.setOrigin(0.5, 0.5);
            this.finalLevelMessage.setDepth(100);
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

import Phaser from 'phaser';

export class Player {
    constructor(scene, grid, row, col) {
        this.scene = scene;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.sprite = null;
        this.createSprite();
    }

    createSprite() {
        // Lấy vị trí pixel từ tọa độ lưới
        const { x, y } = this.scene.gridToScreen(this.row, this.col);

        // Tạo sprite người chơi (hình tròn đen)
        this.sprite = this.scene.add.circle(
            x,
            y,
            this.grid.cellSize / 3,
            0x000000
        );

        // Add player sprite to world container if it exists
        if (this.scene.worldContainer) {
            this.scene.worldContainer.add(this.sprite);
        }

        // Set depth to ensure player is visible above other elements
        this.sprite.setDepth(10);
    }

    // Di chuyển đến vị trí mới
    moveTo(row, col, skipDetectionCheck = false) {
        // Kiểm tra vị trí hợp lệ và không phải là tường
        if (!this.grid.isValidPosition(row, col) || this.grid.isWall(row, col)) {
            return false;
        }

        this.row = row;
        this.col = col;

        // Lấy vị trí pixel mới
        const { x, y } = this.scene.gridToScreen(this.row, this.col);

        // Tạo hiệu ứng di chuyển
        this.scene.tweens.add({
            targets: this.sprite,
            x: x,
            y: y,
            duration: 100,
            ease: 'Linear',
            onComplete: () => {
                // Kiểm tra xem người chơi có đang ở ô sáng không sau khi di chuyển
                // Bỏ qua kiểm tra nếu skipDetectionCheck = true (khi đang tải lại màn chơi)
                if (!skipDetectionCheck && this.isInLitCell()) {
                    // Người chơi bị phát hiện
                    this.scene.showDetectionPopup();
                }
            }
        });

        return true;
    }

    // Di chuyển theo hướng
    move(direction) {
        let newRow = this.row;
        let newCol = this.col;

        switch (direction) {
            case 'up':
                newRow--;
                break;
            case 'down':
                newRow++;
                break;
            case 'left':
                newCol--;
                break;
            case 'right':
                newCol++;
                break;
        }

        return this.moveTo(newRow, newCol);
    }

    // Kiểm tra xem người chơi có đang ở ô sáng không
    isInLitCell() {
        return this.grid.isLight(this.row, this.col);
    }

    // Kiểm tra xem người chơi có đến đích không
    isAtGoal() {
        return this.grid.isGoal(this.row, this.col);
    }

    // Cập nhật vị trí sprite
    update() {
        const { x, y } = this.scene.gridToScreen(this.row, this.col);

        // Update position
        this.sprite.x = x;
        this.sprite.y = y;
    }
}

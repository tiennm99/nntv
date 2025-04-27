import Phaser from 'phaser';

export class TurnManager {
    constructor(scene) {
        this.scene = scene;
        this.isPlayerTurn = true;
        this.turnCount = 0;
    }

    // Chuyển sang lượt tiếp theo
    nextTurn() {
        this.turnCount++;
        
        // Kiểm tra xem người chơi có đang ở ô đích không
        const playerRow = this.scene.player.row;
        const playerCol = this.scene.player.col;
        
        // Kiểm tra nếu grid đã được khởi tạo và có phương thức isGoal
        if (this.scene.grid && typeof this.scene.grid.isGoal === 'function') {
            if (this.scene.grid.isGoal(playerRow, playerCol)) {
                // Người chơi đã đến đích
                this.scene.handleLevelComplete();
                return;
            }
        }
        
        // Xóa ánh sáng hiện tại
        if (this.scene.lightSystem && typeof this.scene.lightSystem.clearAllLight === 'function') {
            this.scene.lightSystem.clearAllLight();
        }
        
        // Cập nhật trạm gác
        if (this.scene.guards && Array.isArray(this.scene.guards)) {
            this.scene.guards.forEach(guard => {
                if (guard && typeof guard.onTurnChange === 'function') {
                    guard.onTurnChange();
                }
            });
        }
        
        // Kiểm tra xem người chơi có đang ở ô sáng không
        if (this.scene.grid && typeof this.scene.grid.isLight === 'function') {
            if (this.scene.grid.isLight(playerRow, playerCol)) {
                // Người chơi bị bắt
                this.scene.handlePlayerCaught();
                return;
            }
        }
        
        // Chuyển lượt về người chơi
        this.isPlayerTurn = true;
    }

    // Reset turn manager
    reset() {
        this.isPlayerTurn = true;
        this.turnCount = 0;
    }
}

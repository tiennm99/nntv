import Phaser from 'phaser';

export class LightingSystem {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
        // Create graphics object for rendering light effects
        this.graphics = this.scene.add.graphics();

        // Add lighting graphics to world container if it exists
        if (this.scene.worldContainer) {
            this.scene.worldContainer.add(this.graphics);
        }

        // Position the lighting graphics at the same position as the grid
        if (this.scene.gridOffsetX !== undefined && this.scene.gridOffsetY !== undefined) {
            this.graphics.x = this.scene.gridOffsetX;
            this.graphics.y = this.scene.gridOffsetY;
        }
    }

    // Xóa tất cả ánh sáng trên lưới
    clearAllLight() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.grid.setLight(row, col, false);
            }
        }
    }

    // Cập nhật ánh sáng từ tất cả các trạm gác
    updateLightFromGuards(guards) {
        this.clearAllLight();

        if (guards && Array.isArray(guards)) {
            guards.forEach(guard => {
                guard.updateLight();
            });
        }
    }
}

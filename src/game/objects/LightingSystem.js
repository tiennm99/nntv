import Phaser from 'phaser';

export class LightingSystem {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
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

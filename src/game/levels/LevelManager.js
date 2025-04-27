import { LEVELS } from './Levels';

export class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.levels = LEVELS;
    }

    // Tải màn chơi theo ID
    loadLevel(levelId) {
        // Đảm bảo levelId hợp lệ
        if (levelId < 1 || levelId > this.levels.length) {
            console.error(`Invalid level ID: ${levelId}`);
            return false;
        }

        // Lấy dữ liệu màn chơi
        const levelData = this.levels[levelId - 1];
        console.log(`Loading level ${levelId}: ${levelData.name}`);

        // Cập nhật UI
        this.scene.levelText.setText(`Level: ${levelId}`);
        
        // Xóa các trạm gác hiện tại
        if (this.scene.guards) {
            this.scene.guards.forEach(guard => {
                if (guard.sprite) {
                    guard.sprite.destroy();
                }
            });
        }
        this.scene.guards = [];

        // Điều chỉnh kích thước lưới nếu cần
        const gridSize = levelData.grid.rows;
        if (gridSize !== this.scene.gridSize) {
            this.scene.gridSize = gridSize;
            this.scene.grid.resize(gridSize, gridSize);
            
            // Tính toán lại vị trí lưới để căn giữa
            const width = this.scene.cameras.main.width;
            const height = this.scene.cameras.main.height;
            this.scene.gridOffsetX = (width - (gridSize * this.scene.cellSize)) / 2;
            this.scene.gridOffsetY = (height - (gridSize * this.scene.cellSize)) / 2;
            
            // Cập nhật vị trí của graphics
            this.scene.grid.graphics.x = this.scene.gridOffsetX;
            this.scene.grid.graphics.y = this.scene.gridOffsetY;
            
            if (this.scene.lightSystem) {
                this.scene.lightSystem.graphics.x = this.scene.gridOffsetX;
                this.scene.lightSystem.graphics.y = this.scene.gridOffsetY;
            }
        }

        // Reset lưới
        for (let row = 0; row < this.scene.gridSize; row++) {
            for (let col = 0; col < this.scene.gridSize; col++) {
                this.scene.grid.setWall(row, col, false);
                this.scene.grid.setGoal(row, col, false);
                this.scene.grid.setLight(row, col, false);
            }
        }

        // Thiết lập tường
        if (levelData.walls) {
            levelData.walls.forEach(wall => {
                this.scene.grid.setWall(wall.row, wall.col, true);
            });
        }

        // Thiết lập đích
        if (levelData.goal) {
            this.scene.grid.setGoal(levelData.goal.row, levelData.goal.col, true);
        }

        // Thiết lập vị trí người chơi
        if (levelData.player) {
            this.scene.player.moveTo(levelData.player.row, levelData.player.col);
        }

        // Thiết lập các ô sáng cố định (nếu có)
        if (levelData.litCells) {
            levelData.litCells.forEach(cell => {
                this.scene.grid.setLight(cell.row, cell.col, true);
            });
        }

        // Tạo các trạm gác
        if (levelData.guards) {
            levelData.guards.forEach(guardData => {
                let guard = null;
                
                switch (guardData.type) {
                    case 'static':
                        guard = new this.scene.StaticGuard(
                            this.scene,
                            this.scene.grid,
                            guardData.position.row,
                            guardData.position.col,
                            guardData.litCells
                        );
                        break;
                    case 'rotating':
                        guard = new this.scene.RotatingGuard(
                            this.scene,
                            this.scene.grid,
                            guardData.position.row,
                            guardData.position.col,
                            guardData.startDirection
                        );
                        break;
                    case 'blinking':
                        guard = new this.scene.BlinkingGuard(
                            this.scene,
                            this.scene.grid,
                            guardData.position.row,
                            guardData.position.col,
                            guardData.litCells,
                            guardData.startState
                        );
                        break;
                    case 'patrolling':
                        guard = new this.scene.PatrollingGuard(
                            this.scene,
                            this.scene.grid,
                            guardData.startPosition.row,
                            guardData.startPosition.col,
                            guardData.path
                        );
                        break;
                }
                
                if (guard) {
                    this.scene.guards.push(guard);
                }
            });
        }

        // Lưu trữ thông tin màn cuối
        this.scene.isFinalLevel = levelData.isFinalLevel || false;

        // Cập nhật ánh sáng từ tất cả các trạm gác
        this.scene.guards.forEach(guard => {
            guard.updateLight();
        });

        // Reset turn manager
        this.scene.turnManager.reset();

        // Vẽ lại lưới
        this.scene.grid.render();

        return true;
    }

    // Kiểm tra xem có phải màn cuối không
    isFinalLevel(levelId) {
        if (levelId < 1 || levelId > this.levels.length) {
            return false;
        }
        return this.levels[levelId - 1].isFinalLevel || false;
    }

    // Lấy tổng số màn chơi
    getTotalLevels() {
        return this.levels.length;
    }
}

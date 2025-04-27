import Phaser from 'phaser';

// Base class cho trạm gác
export class Guard {
    constructor(scene, grid, row, col, color) {
        this.scene = scene;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.color = color || 0xFF0000;
        this.sprite = null;
        this.createSprite();
    }

    createSprite() {
        // Lấy vị trí pixel từ tọa độ lưới
        const { x, y } = this.scene.gridToScreen(this.row, this.col);

        // Tạo sprite trạm gác (hình tròn)
        // Sử dụng kích thước phù hợp để đảm bảo hình tròn vừa vặn trong ô
        const radius = this.grid.cellSize * 0.25; // Kích thước phù hợp để hình tròn vừa vặn trong ô

        // Tạo hình tròn với màu tương ứng
        // Sử dụng Phaser.GameObjects.Circle
        // Circle tự động căn chỉnh tâm ở vị trí (x,y)
        this.sprite = this.scene.add.circle(
            x,                  // Vị trí x
            y,                  // Vị trí y
            radius,             // Bán kính
            this.color          // Màu sắc
        );

        // Add guard sprite to world container if it exists
        if (this.scene.worldContainer) {
            this.scene.worldContainer.add(this.sprite);
        }

        // Set depth to ensure guard is visible above grid but below player
        this.sprite.setDepth(5);

        // Đảm bảo hình tròn nằm chính giữa ô
        // Circle đã tự động đặt origin ở (0.5, 0.5)
    }

    // Cập nhật ánh sáng
    updateLight() {
        // Được override bởi subclass
    }

    // Xử lý khi chuyển lượt
    onTurnChange() {
        // Được override bởi subclass
    }

    // Cập nhật vị trí sprite
    update() {
        const { x, y } = this.scene.gridToScreen(this.row, this.col);
        this.sprite.x = x;
        this.sprite.y = y;
    }
}

// Trạm gác cố định
export class StaticGuard extends Guard {
    constructor(scene, grid, row, col, litCells) {
        super(scene, grid, row, col, 0xFF0000); // Màu đỏ
        this.litCells = litCells || [];
    }

    updateLight() {
        // Chiếu sáng các ô cố định
        this.litCells.forEach(cell => {
            if (this.grid.isValidPosition(cell.row, cell.col)) {
                this.grid.setLight(cell.row, cell.col, true);
            }
        });
    }

    onTurnChange() {
        // Static guards don't change on turns
        this.updateLight();
    }
}

// Trạm gác xoay
export class RotatingGuard extends Guard {
    constructor(scene, grid, row, col, startDirection) {
        super(scene, grid, row, col, 0x0000FF); // Màu xanh
        this.direction = startDirection || 0; // 0: up, 1: right, 2: down, 3: left
        this.directions = [
            { row: -1, col: 0 }, // up
            { row: 0, col: 1 },  // right
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }  // left
        ];

        // Tạo chỉ báo hướng (một đường thẳng từ tâm đến rìa hình tròn)
        const { x, y } = this.scene.gridToScreen(this.row, this.col);
        const radius = this.grid.cellSize * 0.25;
        this.directionIndicator = this.scene.add.line(
            x, y,                 // Vị trí trung tâm
            0, 0,                 // Điểm bắt đầu (tâm)
            0, -radius,           // Điểm kết thúc (hướng lên trên)
            0xFFFFFF              // Màu trắng
        );

        // Add direction indicator to world container if it exists
        if (this.scene.worldContainer) {
            this.scene.worldContainer.add(this.directionIndicator);
        }

        // Set depth to ensure direction indicator is visible above guard
        this.directionIndicator.setDepth(6);

        this.updateSpriteRotation();
    }

    updateLight() {
        // Chiếu sáng ô theo hướng hiện tại
        const dir = this.directions[this.direction];
        const litRow = this.row + dir.row;
        const litCol = this.col + dir.col;

        if (this.grid.isValidPosition(litRow, litCol)) {
            this.grid.setLight(litRow, litCol, true);
        }
    }

    onTurnChange() {
        // Xoay sang hướng tiếp theo
        this.direction = (this.direction + 1) % 4;
        this.updateSpriteRotation();
        this.updateLight();
    }

    updateSpriteRotation() {
        // Xoay chỉ báo hướng theo hướng hiện tại
        // Mỗi hướng xoay 90 độ (PI/2 radian)
        this.directionIndicator.rotation = this.direction * Math.PI / 2;
    }

    // Override phương thức update để cập nhật cả sprite và chỉ báo hướng
    update() {
        // Gọi phương thức update của lớp cha để cập nhật vị trí sprite
        super.update();

        // Cập nhật vị trí của chỉ báo hướng
        const { x, y } = this.scene.gridToScreen(this.row, this.col);
        this.directionIndicator.x = x;
        this.directionIndicator.y = y;
    }
}

// Trạm gác nhấp nháy
export class BlinkingGuard extends Guard {
    constructor(scene, grid, row, col, litCells, startState) {
        super(scene, grid, row, col, 0xFFFF00); // Màu vàng
        this.litCells = litCells || [];
        this.isOn = startState !== undefined ? startState : true;

        // Cập nhật màu sắc ban đầu dựa trên trạng thái
        if (!this.isOn) {
            this.sprite.fillColor = 0xAAAA00; // Màu vàng tối khi tắt
        }
    }

    updateLight() {
        // Chỉ chiếu sáng khi đang bật
        if (this.isOn) {
            this.litCells.forEach(cell => {
                if (this.grid.isValidPosition(cell.row, cell.col)) {
                    this.grid.setLight(cell.row, cell.col, true);
                }
            });
        }
    }

    onTurnChange() {
        // Đảo trạng thái bật/tắt
        this.isOn = !this.isOn;

        // Cập nhật màu sắc của sprite
        if (this.isOn) {
            this.sprite.fillColor = 0xFFFF00; // Màu vàng khi bật
        } else {
            this.sprite.fillColor = 0xAAAA00; // Màu vàng tối khi tắt
        }

        this.updateLight();
    }
}

// Trạm gác tuần tra
export class PatrollingGuard extends Guard {
    constructor(scene, grid, startRow, startCol, path) {
        super(scene, grid, startRow, startCol, 0x800080); // Màu tím
        this.path = path || [];
        this.currentPathIndex = 0;
        this.litCells = []; // Các ô xung quanh vị trí hiện tại
    }

    updateLight() {
        // Chiếu sáng các ô xung quanh vị trí hiện tại
        this.litCells = [];

        // Thêm 4 ô xung quanh vào danh sách chiếu sáng
        const directions = [
            { row: -1, col: 0 }, // up
            { row: 0, col: 1 },  // right
            { row: 1, col: 0 },  // down
            { row: 0, col: -1 }  // left
        ];

        directions.forEach(dir => {
            const litRow = this.row + dir.row;
            const litCol = this.col + dir.col;

            if (this.grid.isValidPosition(litRow, litCol)) {
                this.grid.setLight(litRow, litCol, true);
                this.litCells.push({ row: litRow, col: litCol });
            }
        });
    }

    onTurnChange() {
        // Di chuyển đến vị trí tiếp theo trong đường đi
        if (this.path.length > 0) {
            this.currentPathIndex = (this.currentPathIndex + 1) % this.path.length;
            const nextPos = this.path[this.currentPathIndex];

            this.row = nextPos.row;
            this.col = nextPos.col;

            // Cập nhật vị trí sprite
            this.update();
        }

        // Cập nhật ánh sáng
        this.updateLight();
    }
}

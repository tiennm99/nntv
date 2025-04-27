# KẾ HOẠCH PHÁT TRIỂN GAME NIGHT NINJA: TWILIGHT VOYAGE

## 1. TỔNG QUAN DỰ ÁN

### Thông tin cơ bản
- **Tên game**: Night Ninja: Twilight Voyage
- **Thể loại**: Puzzle / Stealth
- **Nền tảng**: Web (Phaser 3 + Vite)
- **Đối tượng người chơi**: Mọi độ tuổi, yêu thích giải đố

### Mô tả game
Night Ninja: Twilight Voyage là một game giải đố theo lượt dựa trên lưới ô vuông. Người chơi điều khiển một ninja (hình tròn màu đen) phải vượt qua 12 màn chơi, tránh các khu vực được chiếu sáng để giải cứu công chúa. Game có giao diện tối giản với các hình học cơ bản: ô vuông màu xám (khu vực tối), ô vuông màu vàng (khu vực sáng), ô vuông màu đen (tường không thể đi qua), hình tròn đen (người chơi), và các hình tam giác với nhiều màu sắc khác nhau (đại diện cho các loại kẻ thù/trạm gác).

### Các tính năng chính
- Hệ thống 12 màn chơi với độ khó tăng dần
- Cơ chế stealth dựa trên tránh ánh sáng
- Nhiều loại trạm gác và chướng ngại vật khác nhau
- Hệ thống 3 mạng sống xuyên suốt trò chơi
- Màn cuối với cái kết bất ngờ, không thể chiến thắng

## 2. THIẾT KẾ GAME

### Cốt truyện
Công chúa Tỳ Vương của xứ sở cà rốt đã bị bắt cóc. Người chơi hóa thân thành ninja thỏ, vượt qua các màn để giải cứu công chúa. Tuy nhiên, ở màn cuối cùng, người chơi không thể tiếp cận công chúa vì toàn bộ bản đồ sẽ bật sáng khi đến gần, và game kết thúc với thông báo "Thật tiếc, kiếp này ninja không thể giải cứu công chúa rồi."

### Gameplay
- **Mục tiêu chính**: Vượt qua 12 màn chơi để tiếp cận công chúa
- **Cơ chế chơi**:
  - Di chuyển theo lượt trên lưới ô vuông (mỗi lượt di chuyển 1 ô)
  - Tránh các ô vuông màu vàng (được chiếu sáng)
  - Không thể đi qua các ô vuông màu đen (tường)
  - Các trạm gác (hình tam giác) có các pattern khác nhau để tạo ra ánh sáng
- **Điều kiện thắng/thua**:
  - Thắng: Đến được vị trí đích của mỗi màn
  - Thua: Người chơi bước vào ô sáng hoặc hết 3 mạng

### Đối tượng Game
- **Người chơi**: Hình tròn màu đen
- **Trạm gác/Kẻ thù**:
  - Hình tam giác màu đỏ: Trạm gác cố định (luôn chiếu sáng các ô xác định)
  - Hình tam giác màu xanh: Trạm gác xoay (xoay và chiếu sáng 1 ô kế bên mỗi lượt)
  - Hình tam giác màu vàng: Trạm gác nhấp nháy (bật/tắt ánh sáng mỗi lượt)
  - Hình tam giác màu tím: Nhân viên gác đêm (di chuyển theo đường định sẵn)
- **Môi trường**:
  - Ô vuông màu xám: Khu vực tối (an toàn)
  - Ô vuông màu vàng: Khu vực sáng (nguy hiểm)
  - Ô vuông màu đen: Tường (không thể đi qua)
  - Ô vuông màu xanh lá: Điểm đích cần đến

## 3. PHÁT TRIỂN THEO GIAI ĐOẠN

### Giai đoạn 1: Thiết lập cơ bản
1. **Khởi tạo project Phaser + Vite**
   - Thiết lập cấu trúc thư mục
   - Cấu hình Vite cho Phaser
   - Tạo file HTML, CSS cơ bản
   - Thiết lập entry point cho game

2. **Tạo các scene cơ bản**
   - Scene Boot: Khởi tạo game
   - Scene Preloader: Màn loading (tối giản)
   - Scene MainMenu: Menu chính với nút bắt đầu
   - Scene LevelSelect: Chọn màn chơi
   - Scene Game: Scene chính cho gameplay
   - Scene GameOver: Màn game over

3. **Tạo hệ thống Grid**
   - Xây dựng class GridSystem quản lý lưới ô vuông
   - Phương thức chuyển đổi tọa độ lưới sang tọa độ pixel
   - Phương thức vẽ grid lên màn hình
   - Phương thức kiểm tra vị trí hợp lệ

### Giai đoạn 2: Core Mechanics

4. **Xây dựng Player**
   - Tạo class Player với các thuộc tính: vị trí, số mạng còn lại
   - Phương thức vẽ người chơi (hình tròn đen)
   - Phương thức di chuyển theo lượt
   - Phương thức kiểm tra va chạm với ánh sáng

5. **Xây dựng hệ thống ánh sáng**
   - Tạo class LightingSystem quản lý trạng thái sáng/tối
   - Mảng 2D lưu trữ trạng thái ánh sáng của mỗi ô
   - Phương thức cập nhật trạng thái ánh sáng mỗi lượt
   - Phương thức kiểm tra ô có được chiếu sáng không

6. **Xây dựng các loại trạm gác**
   - Tạo base class Guard với properties chung
   - Tạo class StaticGuard: Luôn chiếu sáng các ô cố định
   - Tạo class RotatingGuard: Xoay và chiếu sáng ô mới mỗi lượt
   - Tạo class BlinkingGuard: Bật/tắt ánh sáng mỗi lượt
   - Tạo class PatrollingGuard: Di chuyển theo đường định sẵn

7. **Hệ thống lượt và turn management**
   - Tạo class TurnManager quản lý lượt đi
   - Phương thức nextTurn() để tiến hành lượt mới
   - Cập nhật vị trí người chơi, trạm gác, ánh sáng sau mỗi lượt
   - Kiểm tra điều kiện thắng/thua sau mỗi lượt

### Giai đoạn 3: Thiết kế Level

8. **Xây dựng Level Manager**
   - Tạo class LevelManager quản lý các màn chơi
   - Phương thức load màn chơi từ dữ liệu
   - Phương thức reset màn chơi khi thua
   - Phương thức chuyển đến màn tiếp theo

9. **Thiết kế dữ liệu Level**
   - Định nghĩa cấu trúc dữ liệu cho mỗi màn chơi
   - Tạo dữ liệu cho 12 màn với độ khó tăng dần
   - Thiết kế màn cuối với cơ chế đặc biệt

10. **Xây dựng Level Factory**
    - Tạo class LevelFactory tạo các đối tượng trong level
    - Phương thức tạo người chơi, trạm gác từ dữ liệu
    - Phương thức thiết lập vị trí và kích thước của grid
    - Phương thức thiết lập điểm đích

### Giai đoạn 4: UI và Game Flow

11. **Xây dựng UI trong Game Scene**
    - Hiển thị số mạng còn lại
    - Hiển thị số màn chơi hiện tại
    - Nút tạm dừng và menu tạm dừng
    - Hiển thị hướng dẫn đơn giản

12. **Hoàn thiện Menu và màn Game Over**
    - Hoàn thiện MainMenu với nút Start
    - Hoàn thiện LevelSelect với các level có thể chọn
    - Hoàn thiện GameOver với thông báo phù hợp
    - Hiển thị thông báo đặc biệt cho màn cuối

13. **Xây dựng Game State Manager**
    - Tạo class GameStateManager quản lý trạng thái game
    - Lưu trữ số mạng, màn chơi hiện tại
    - Phương thức reset game
    - Lưu trữ trạng thái game (localStorage)

### Giai đoạn 5: Hoàn thiện và Tối ưu

14. **Hoàn thiện Input Controls**
    - Hỗ trợ điều khiển phím mũi tên
    - Hỗ trợ điều khiển chuột (click vào ô muốn di chuyển)
    - Xử lý input trong khi game đang tạm dừng

15. **Tối ưu hiệu suất**
    - Sử dụng object pooling cho các đối tượng thường xuyên tạo/hủy
    - Tối ưu render chỉ vẽ lại các ô thay đổi
    - Sử dụng dirty flag pattern để giảm tính toán

16. **Testing và Debug**
    - Thêm chế độ debug hiển thị thông tin grid
    - Tạo công cụ debug để test nhanh các màn chơi
    - Thử nghiệm full playthrough

17. **Triển khai màn cuối với cơ chế đặc biệt**
    - Logic đặc biệt cho màn 12
    - Trigger toàn bộ map sáng khi gần đến công chúa
    - Thông báo kết thúc game đặc biệt

## 4. CODING GUIDELINES

### Cấu trúc Scene

```javascript
import { Scene } from 'phaser';

export class GameScene extends Scene {
    constructor() {
        super('GameScene');
        this.player = null;
        this.grid = null;
        this.lightSystem = null;
        this.turnManager = null;
        this.guards = [];
    }

    init(data) {
        // Khởi tạo biến, settings
        this.currentLevel = data.level || 1;
        this.livesRemaining = data.lives || 3;
    }

    create() {
        // Khởi tạo grid system
        this.grid = new GridSystem(this, 10, 10, 50); // 10x10 grid với kích thước ô 50px

        // Khởi tạo lighting system
        this.lightSystem = new LightingSystem(this, this.grid);

        // Load level
        this.levelManager = new LevelManager(this);
        this.levelManager.loadLevel(this.currentLevel);

        // Khởi tạo turn manager
        this.turnManager = new TurnManager(this);

        // Thiết lập input
        this.setupInput();

        // Tạo UI
        this.createUI();
    }

    update() {
        // Cập nhật các đối tượng
        if (this.player) this.player.update();
        this.guards.forEach(guard => guard.update());

        // Kiểm tra game state
        this.checkGameState();
    }

    // Các phương thức khác
    setupInput() { /* ... */ }
    createUI() { /* ... */ }
    checkGameState() { /* ... */ }
}
```

### Cấu trúc Grid System

```javascript
export class GridSystem {
    constructor(scene, rows, cols, cellSize) {
        this.scene = scene;
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = this.createGrid();
    }

    createGrid() {
        const grid = [];
        for (let row = 0; row < this.rows; row++) {
            grid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                grid[row][col] = {
                    isLit: false,
                    isWall: false,
                    isGoal: false,
                    // Các thuộc tính khác
                };
            }
        }
        return grid;
    }

    // Chuyển đổi từ tọa độ lưới sang tọa độ pixel
    gridToPixel(row, col) {
        return {
            x: col * this.cellSize + this.cellSize / 2,
            y: row * this.cellSize + this.cellSize / 2
        };
    }

    // Chuyển đổi từ tọa độ pixel sang tọa độ lưới
    pixelToGrid(x, y) {
        return {
            row: Math.floor(y / this.cellSize),
            col: Math.floor(x / this.cellSize)
        };
    }

    // Kiểm tra vị trí hợp lệ
    isValidPosition(row, col) {
        return row >= 0 && row < this.rows &&
               col >= 0 && col < this.cols &&
               !this.grid[row][col].isWall;
    }

    // Vẽ grid
    render() {
        // Vẽ nền
        const graphics = this.scene.add.graphics();

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                const { x, y } = this.gridToPixel(row, col);

                // Vẽ nền ô
                if (cell.isWall) {
                    // Tường: màu đen
                    graphics.fillStyle(0x000000);
                } else if (cell.isLit) {
                    // Ô sáng: màu vàng
                    graphics.fillStyle(0xFFFF00);
                } else {
                    // Ô tối: màu xám
                    graphics.fillStyle(0x888888);
                }

                graphics.fillRect(
                    x - this.cellSize / 2,
                    y - this.cellSize / 2,
                    this.cellSize,
                    this.cellSize
                );

                // Vẽ viền ô
                graphics.lineStyle(1, 0x000000);
                graphics.strokeRect(
                    x - this.cellSize / 2,
                    y - this.cellSize / 2,
                    this.cellSize,
                    this.cellSize
                );

                // Vẽ mục tiêu nếu có
                if (cell.isGoal) {
                    graphics.fillStyle(0x00FF00);
                    graphics.fillRect(
                        x - this.cellSize / 4,
                        y - this.cellSize / 4,
                        this.cellSize / 2,
                        this.cellSize / 2
                    );
                }
            }
        }
    }
}
```

### Cấu trúc dữ liệu Level

```javascript
// Ví dụ về cấu trúc dữ liệu cho một level
const levelData = {
    id: 1,
    name: "First Steps",
    rows: 8,
    cols: 8,
    playerStart: { row: 0, col: 0 },
    goal: { row: 7, col: 7 },
    walls: [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        // Các vị trí tường khác
    ],
    guards: [
        {
            type: "static",
            position: { row: 3, col: 3 },
            litCells: [
                { row: 2, col: 3 },
                { row: 3, col: 2 },
                { row: 3, col: 4 },
                { row: 4, col: 3 }
            ]
        },
        {
            type: "rotating",
            position: { row: 5, col: 5 },
            startDirection: 0, // 0: up, 1: right, 2: down, 3: left
        },
        {
            type: "blinking",
            position: { row: 2, col: 6 },
            startState: true, // true: on, false: off
            litCells: [
                { row: 1, col: 6 },
                { row: 2, col: 5 },
                { row: 2, col: 7 },
                { row: 3, col: 6 }
            ]
        },
        {
            type: "patrolling",
            startPosition: { row: 6, col: 1 },
            path: [
                { row: 6, col: 2 },
                { row: 6, col: 3 },
                { row: 6, col: 2 },
                { row: 6, col: 1 }
            ]
        }
    ]
};
```

### Cấu trúc nhân vật Player

```javascript
export class Player {
    constructor(scene, grid, row, col) {
        this.scene = scene;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.graphics = scene.add.graphics();
        this.render();
    }

    // Di chuyển đến vị trí mới
    moveTo(row, col) {
        if (!this.grid.isValidPosition(row, col)) {
            return false;
        }

        this.row = row;
        this.col = col;
        this.render();
        return true;
    }

    // Kiểm tra xem người chơi có đang ở ô sáng không
    isInLitCell() {
        return this.grid.grid[this.row][this.col].isLit;
    }

    // Kiểm tra xem người chơi có đến đích không
    isAtGoal() {
        return this.grid.grid[this.row][this.col].isGoal;
    }

    // Vẽ người chơi
    render() {
        this.graphics.clear();

        const { x, y } = this.grid.gridToPixel(this.row, this.col);

        // Vẽ hình tròn đen
        this.graphics.fillStyle(0x000000);
        this.graphics.fillCircle(x, y, this.grid.cellSize / 3);
    }

    update() {
        // Cập nhật logic nếu cần
    }
}
```

### Cấu trúc trạm gác (Guard)

```javascript
// Base class cho trạm gác
export class Guard {
    constructor(scene, grid, row, col, color) {
        this.scene = scene;
        this.grid = grid;
        this.row = row;
        this.col = col;
        this.color = color || 0xFF0000;
        this.graphics = scene.add.graphics();
        this.render();
    }

    // Cập nhật ánh sáng
    updateLight() {
        // Được override bởi subclass
    }

    // Xử lý khi chuyển lượt
    onTurnChange() {
        // Được override bởi subclass
    }

    // Vẽ trạm gác (hình tam giác)
    render() {
        this.graphics.clear();

        const { x, y } = this.grid.gridToPixel(this.row, this.col);
        const size = this.grid.cellSize / 2;

        // Vẽ hình tam giác
        this.graphics.fillStyle(this.color);
        this.graphics.beginPath();
        this.graphics.moveTo(x, y - size);
        this.graphics.lineTo(x - size, y + size);
        this.graphics.lineTo(x + size, y + size);
        this.graphics.closePath();
        this.graphics.fill();
    }

    update() {
        // Cập nhật logic nếu cần
    }
}

// Trạm gác cố định
export class StaticGuard extends Guard {
    constructor(scene, grid, row, col, litCells) {
        super(scene, grid, row, col, 0xFF0000);
        this.litCells = litCells || [];
        this.updateLight();
    }

    updateLight() {
        // Chiếu sáng các ô cố định
        this.litCells.forEach(cell => {
            if (this.grid.isValidPosition(cell.row, cell.col)) {
                this.grid.grid[cell.row][cell.col].isLit = true;
            }
        });
    }

    onTurnChange() {
        // Static guards don't change on turns
        this.updateLight();
    }
}

// Tương tự tạo các class cho RotatingGuard, BlinkingGuard, PatrollingGuard
```

### Cấu trúc Turn Manager

```javascript
export class TurnManager {
    constructor(scene) {
        this.scene = scene;
        this.currentTurn = 0;
    }

    // Xử lý lượt tiếp theo
    nextTurn() {
        this.currentTurn++;

        // Cập nhật tất cả các trạm gác
        this.scene.guards.forEach(guard => guard.onTurnChange());

        // Cập nhật hệ thống ánh sáng
        this.scene.lightSystem.update();

        // Kiểm tra xem người chơi có đang ở ô sáng không
        if (this.scene.player.isInLitCell()) {
            // Người chơi thua lượt này
            this.scene.handlePlayerCaught();
            return;
        }

        // Kiểm tra xem người chơi có đến đích không
        if (this.scene.player.isAtGoal()) {
            // Người chơi thắng màn này
            this.scene.handleLevelComplete();
            return;
        }
    }

    // Reset turn counter
    reset() {
        this.currentTurn = 0;
    }
}
```

### Cấu trúc Lighting System

```javascript
export class LightingSystem {
    constructor(scene, grid) {
        this.scene = scene;
        this.grid = grid;
    }

    // Reset ánh sáng trên grid
    resetLights() {
        for (let row = 0; row < this.grid.rows; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                this.grid.grid[row][col].isLit = false;
            }
        }
    }

    // Cập nhật ánh sáng từ tất cả các trạm gác
    update() {
        // Reset ánh sáng
        this.resetLights();

        // Cập nhật ánh sáng từ tất cả các trạm gác
        this.scene.guards.forEach(guard => guard.updateLight());

        // Vẽ lại grid để hiển thị ánh sáng mới
        this.grid.render();
    }
}
```

### Quy tắc đặt tên
- **Classes**: PascalCase (GameScene, GridSystem, Player)
- **Methods & Variables**: camelCase (updateLight, isValidPosition)
- **Constants**: UPPER_CASE (MAX_LIVES, GRID_SIZE)
- **Private Properties**: _camelCase (_privateVariable)

### Quy tắc tổ chức
- Sử dụng OOP đầy đủ với classes và inheritance
- Tách rõ trách nhiệm của từng component
- Sử dụng các design patterns phù hợp (Factory, State, Observer)
- Comment code đầy đủ, rõ ràng
- Tạo các helper functions cho các tác vụ lặp lại

# KẾ HOẠCH PHÁT TRIỂN GAME NIGHT NINJA: TWILIGHT VOYAGE

## 1. TỔNG QUAN DỰ ÁN

### Thông tin cơ bản
- **Tên game**: Night Ninja: Twilight Voyage
- **Thể loại**: Puzzle / Stealth / Turn-based
- **Nền tảng**: Web (Phaser 3 + Vite)
- **Đối tượng người chơi**: Mọi độ tuổi, yêu thích giải đố
- **Độ khó**: Tăng dần theo tiến trình

### Mô tả game
Night Ninja: Twilight Voyage là một game giải đố theo lượt dựa trên lưới ô vuông. Người chơi điều khiển một ninja (hình tròn màu đen) phải vượt qua 12 màn chơi, tránh các khu vực được chiếu sáng để giải cứu công chúa. Game có giao diện tối giản với các hình học cơ bản: ô vuông màu xám (khu vực tối), ô vuông màu vàng (khu vực sáng), ô vuông màu đen (tường không thể đi qua), hình tròn đen (người chơi), và các hình tròn với nhiều màu sắc khác nhau (đại diện cho các loại kẻ thù/trạm gác).

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
  - Các trạm gác (hình tròn) có các pattern khác nhau để tạo ra ánh sáng
- **Điều kiện thắng/thua**:
  - Thắng: Đến được vị trí đích của mỗi màn
  - Thua: Người chơi bước vào ô sáng hoặc hết 3 mạng

### Đối tượng Game
- **Người chơi**: Hình tròn màu đen
- **Trạm gác/Kẻ thù**:
  - Hình tròn màu đỏ: Trạm gác cố định (luôn chiếu sáng các ô xác định)
  - Hình tròn màu xanh: Trạm gác xoay (xoay và chiếu sáng 1 ô kế bên mỗi lượt)
  - Hình tròn màu vàng: Trạm gác nhấp nháy (bật/tắt ánh sáng mỗi lượt)
  - Hình tròn màu tím: Nhân viên gác đêm (di chuyển theo đường định sẵn)
- **Môi trường**:
  - Ô vuông màu xám: Khu vực tối (an toàn)
  - Ô vuông màu vàng: Khu vực sáng (nguy hiểm)
  - Ô vuông màu đen: Tường (không thể đi qua)
  - Ô vuông màu xanh lá: Điểm đích cần đến

## 3. CÁCH TIẾP CẬN PHÁT TRIỂN

Phát triển game sẽ theo cách tiếp cận tăng dần:
1. Đầu tiên thiết lập các cơ chế cốt lõi (di chuyển trên lưới, phát hiện ánh sáng)
2. Tạo màn chơi cơ bản đầu tiên
3. Dần dần giới thiệu các loại kẻ địch mới với các màn chơi tiến triển
4. Cuối cùng, triển khai màn cuối đặc biệt với cái kết bất ngờ của game

## 4. PHÁT TRIỂN THEO GIAI ĐOẠN

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

   **Tiến trình màn chơi**:
   - **Màn 1**: Di chuyển cơ bản, đến đích (không có trạm gác)
   - **Màn 2**: Giới thiệu khu vực sáng cần tránh
   - **Màn 3**: Giới thiệu Trạm gác cố định (màu đỏ)
   - **Màn 4-5**: Bố cục phức tạp hơn với Trạm gác cố định
   - **Màn 6**: Giới thiệu Trạm gác xoay (màu xanh)
   - **Màn 7-8**: Kết hợp Trạm gác cố định và Trạm gác xoay
   - **Màn 9**: Giới thiệu Trạm gác nhấp nháy (màu vàng)
   - **Màn 10**: Giới thiệu Trạm gác tuần tra (màu tím)
   - **Màn 11**: Câu đố phức tạp sử dụng tất cả loại trạm gác
   - **Màn 12**: Màn cuối với cái kết bất ngờ (không thể giải cứu công chúa)

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

## 5. CẤU TRÚC DỰ ÁN

### Tổ chức tệp (Dựa trên Phaser Vite Template)
```
src/
├── game/
│   ├── objects/           # Các đối tượng game (Player, Guards, v.v.)
│   │   ├── Player.js
│   │   ├── Guard.js
│   │   ├── GridSystem.js
│   │   └── TurnManager.js
│   ├── levels/            # Định nghĩa các màn chơi
│   │   ├── LevelManager.js
│   │   └── Levels.js      # Dữ liệu màn chơi
│   └── scenes/            # Các scene Phaser
│       ├── Boot.js        # (đã tồn tại)
│       ├── Preloader.js   # (đã tồn tại)
│       ├── MainMenu.js    # (đã tồn tại)
│       ├── Game.js        # Scene game chính
│       └── GameOver.js    # (đã tồn tại)
```

### Tích hợp với dự án hiện có

Game sẽ được tích hợp với cấu trúc dự án Phaser hiện có:

1. Tái sử dụng luồng scene hiện tại (Boot → Preloader → MainMenu → Game → GameOver)
2. Thêm các đối tượng game và quản lý mới trong scene Game
3. Mở rộng mã hiện có thay vì thay thế nó

## 6. CÁC MỐC PHÁT TRIỂN

### Mốc 1: Cơ chế cốt lõi
- [x] Thiết lập dự án sử dụng Phaser + Vite
- [ ] Triển khai hệ thống lưới
- [ ] Di chuyển người chơi và phát hiện va chạm
- [ ] Hệ thống quản lý lượt
- [ ] Điều kiện thắng/thua cơ bản

### Mốc 2: Cơ chế màn chơi
- [ ] Triển khai khu vực sáng tĩnh
- [ ] Triển khai loại trạm gác đầu tiên (Trạm gác cố định)
- [ ] Hệ thống tải và chuyển đổi màn chơi
- [ ] Giao diện cơ bản (mạng còn lại, màn chơi hiện tại)

### Mốc 3: Các loại kẻ địch
- [ ] Triển khai Trạm gác xoay
- [ ] Triển khai Trạm gác nhấp nháy
- [ ] Triển khai Trạm gác tuần tra
- [ ] Thiết kế màn chơi 1-6 giới thiệu dần các cơ chế này

### Mốc 4: Luồng game
- [ ] Hoàn thiện thiết kế tất cả 12 màn chơi
- [ ] Triển khai hệ thống mạng sống (3 mạng xuyên suốt tất cả màn chơi)
- [ ] Tạo menu chính và màn hình chọn màn chơi
- [ ] Triển khai cái kết đặc biệt cho màn cuối

### Mốc 5: Hoàn thiện
- [ ] Triển khai điều khiển cho thiết bị di động
- [ ] Cải thiện giao diện và phản hồi
- [ ] Màn hình game over và chiến thắng
- [ ] Kiểm thử và sửa lỗi

## 7. GHI CHÚ TRIỂN KHAI PHASER

### Sử dụng Phaser API
- Sử dụng `this.add.rectangle()` và `this.add.circle()` cho các ô lưới và người chơi
- Sử dụng `this.add.circle()` cho các trạm gác (hình tròn)
- Tận dụng `Container` có sẵn của Phaser để nhóm các đối tượng liên quan
- Sử dụng `this.add.graphics()` để vẽ đường lưới và các hiệu ứng khác
- Triển khai `this.input.keyboard.createCursorKeys()` để điều khiển người chơi

### Triển khai GridSystem
```javascript
// Trong Game.js
create() {
    // Tạo các ô lưới sử dụng đối tượng Rectangle của Phaser
    this.gridCells = [];
    for (let row = 0; row < this.gridSize; row++) {
        this.gridCells[row] = [];
        for (let col = 0; col < this.gridSize; col++) {
            const x = col * this.cellSize + this.cellSize / 2;
            const y = row * this.cellSize + this.cellSize / 2;

            // Tạo hình chữ nhật sử dụng API của Phaser
            const cell = this.add.rectangle(x, y, this.cellSize, this.cellSize, 0x888888);
            cell.setStrokeStyle(1, 0x000000);

            // Lưu trữ dữ liệu ô
            cell.setData('isLit', false);
            cell.setData('isWall', false);
            this.gridCells[row][col] = cell;
        }
    }
}
```

### Triển khai Player
```javascript
// Trong Game.js hoặc Player.js
createPlayer(row, col) {
    const position = this.gridToPixel(row, col);
    this.player = this.add.circle(
        position.x,
        position.y,
        this.cellSize / 3,
        0x000000
    );
    this.player.setData('row', row);
    this.player.setData('col', col);
}

movePlayer(direction) {
    // Tính toán vị trí mới dựa trên hướng
    const currentRow = this.player.getData('row');
    const currentCol = this.player.getData('col');

    let newRow = currentRow;
    let newCol = currentCol;

    // Cập nhật dựa trên hướng
    if (direction === 'up') newRow--;
    else if (direction === 'down') newRow++;
    else if (direction === 'left') newCol--;
    else if (direction === 'right') newCol++;

    // Kiểm tra nước đi hợp lệ
    if (this.isValidMove(newRow, newCol)) {
        // Cập nhật vị trí người chơi
        this.player.setData('row', newRow);
        this.player.setData('col', newCol);

        // Di chuyển sprite người chơi
        const newPos = this.gridToPixel(newRow, newCol);
        this.tweens.add({
            targets: this.player,
            x: newPos.x,
            y: newPos.y,
            duration: 100
        });

        // Xử lý tiến trình lượt
        this.nextTurn();
    }
}
```

## 8. CODING GUIDELINES

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

    // Vẽ trạm gác (hình tròn)
    render() {
        this.graphics.clear();

        const { x, y } = this.grid.gridToPixel(this.row, this.col);
        const size = this.grid.cellSize / 3;

        // Vẽ hình tròn
        this.graphics.fillStyle(this.color);
        this.graphics.fillCircle(x, y, size);
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

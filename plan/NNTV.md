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
Công chúa cà rốt của vương quốc rau củ quả bị mất tích. Người chơi hóa thân thành ninja thỏ, vượt qua các màn để giải cứu công chúa. Tuy nhiên, ở màn cuối cùng, người chơi không thể tiếp cận công chúa vì toàn bộ bản đồ sẽ bật sáng khi đến gần, và game kết thúc với thông báo "Thật tiếc, kiếp này ninja không thể giải cứu công chúa rồi."

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

### Thiết kế hình ảnh
Game sẽ sử dụng các hình dạng hình học đơn giản thay vì sprites:
- **Khu vực tối**: Ô vuông màu xám
- **Khu vực sáng**: Ô vuông màu vàng
- **Tường**: Ô vuông màu đen
- **Người chơi**: Hình tròn màu đen
- **Đích đến**: Ô vuông màu xanh lá
- **Trạm gác**: Hình tròn nhiều màu sắc

Không cần đồ họa phức tạp, hoạt ảnh, hoặc âm thanh, làm cho đây là một nguyên mẫu "programmer art".

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

## 7. HƯỚNG DẪN TRIỂN KHAI

### Lời khuyên triển khai
1. **Triển khai cụ thể cho Phaser**:
   - Sử dụng cấu trúc scene hiện có trong template
   - Tận dụng factory đối tượng game của Phaser (`this.add`)
   - Sử dụng hệ thống input của Phaser cho điều khiển

2. **Phát triển tiến dần**:
   - Triển khai hệ thống lưới và di chuyển cơ bản trước
   - Thêm từng loại trạm gác một
   - Tạo và kiểm tra một vài màn chơi trước khi thêm các màn phức tạp hơn

3. **Khi báo cáo tiến độ**:
   - Nêu rõ bạn đang làm việc trên mốc và nhiệm vụ nào
   - Giải thích mọi thách thức hoặc cách tiếp cận thay thế đã thực hiện
   - Liệt kê những gì đang hoạt động và những gì vẫn đang chờ xử lý

4. **Điểm bắt đầu**:
   - Bắt đầu với việc triển khai scene Game.js
   - Tạo GridSystem
   - Triển khai di chuyển người chơi cơ bản
   - Sau đó thêm hệ thống lượt trước khi chuyển sang triển khai trạm gác

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

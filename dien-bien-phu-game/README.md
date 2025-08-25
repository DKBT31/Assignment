# Chiến Thắng Điện Biên Phủ - Game Trải Nghiệm Lịch Sử

## Mô tả dự án

Đây là một trang web giáo dục kết hợp game về Chiến thắng Điện Biên Phủ, được thiết kế cho môn VNR202 - Lịch sử Đảng Cộng sản Việt Nam. Dự án bao gồm:

- **Trang chủ**: Giới thiệu tổng quan về chiến dịch và 12 ngày lịch sử
- **Game**: 12 màn chơi tương ứng với 12 ngày quan trọng của chiến dịch
- **Nội dung lịch sử**: Thông tin chi tiết về từng ngày với ý nghĩa và tầm quan trọng

## Cấu trúc thư mục

```
dien-bien-phu-game/
├── index.html          # Trang chủ
├── game.html          # Trang game chính
├── css/
│   ├── style.css      # CSS cho trang chủ
│   └── game.css       # CSS cho game
├── js/
│   ├── data.js        # Dữ liệu lịch sử 12 ngày
│   ├── main.js        # JavaScript trang chủ
│   ├── preview.js     # Game preview nhỏ
│   ├── game-engine.js # Engine game chính
│   └── game.js        # Logic game
└── assets/
    ├── images/        # Hình ảnh (cần thêm)
    └── audio/         # Âm thanh (cần thêm)
```

## Tính năng chính

### Trang chủ
- Timeline tương tác hiển thị 12 ngày lịch sử
- Game preview mini để người dùng trải nghiệm
- Theo dõi tiến độ hoàn thành
- Thiết kế retro với màu sắc cách mạng

### Game
- 12 màn chơi với độ khó tăng dần
- Gameplay bắn máy bay đơn giản nhưng hấp dẫn
- Power-ups: Rapid Fire, Shield, Multi-Shot
- Hệ thống điểm số và thành tích
- Thông tin lịch sử tích hợp trong game

### Nội dung giáo dục
- Thông tin chi tiết về từng ngày
- Ý nghĩa lịch sử và tác động
- Các câu nói nổi tiếng và nhân vật lịch sử
- Bối cảnh chiến lược của từng giai đoạn

## Cách sử dụng

1. **Khởi chạy**: Mở file `index.html` trong trình duyệt web
2. **Điều hướng**: Click "Bắt đầu hành trình" hoặc chọn ngày cụ thể
3. **Chơi game**: 
   - Di chuyển chuột để nhắm
   - Click chuột hoặc nhấn Space để bắn
   - Tiêu diệt đủ số máy bay theo yêu cầu
4. **Tìm hiểu lịch sử**: Click vào panel lịch sử trong game

## Điều khiển game

- **Chuột**: Di chuyển để nhắm và click để bắn
- **Space**: Bắn hoặc tạm dừng
- **Escape**: Tạm dừng game
- **Konami Code**: Mở khóa tất cả màn (↑↑↓↓←→←→BA)

## Công nghệ sử dụng

- **HTML5**: Cấu trúc trang web
- **CSS3**: Thiết kế giao diện với animations
- **JavaScript**: Logic game và tương tác
- **Canvas API**: Rendering game 2D
- **Local Storage**: Lưu tiến độ người chơi

## Hướng dẫn phát triển

### Thêm âm thanh
Để thêm âm thanh, đặt các file âm thanh vào thư mục `assets/audio/`:
- `background.mp3` - Nhạc nền trang chủ
- `game_music.mp3` - Nhạc nền game
- `shoot.wav` - Hiệu ứng bắn
- `explosion.wav` - Hiệu ứng nổ
- `powerup.wav` - Hiệu ứng power-up
- `victory.wav` - Âm thanh chiến thắng

### Thêm hình ảnh
Thêm hình ảnh lịch sử vào thư mục `assets/images/`:
- `timeline-bg.jpg` - Background timeline
- `level-X.jpg` - Hình ảnh cho từng màn (X = 1-12)
- `heroes/` - Thư mục chứa ảnh anh hùng lịch sử

### Tùy chỉnh độ khó
Chỉnh sửa trong file `js/data.js`:
```javascript
// Thay đổi cấu hình enemy
gameConfig.enemies[0].speed = 3; // Tăng tốc độ
gameConfig.enemies[0].health = 2; // Tăng máu
```

### Thêm màn chơi mới
1. Thêm dữ liệu vào `historicalData` trong `data.js`
2. Cập nhật logic trong `game-engine.js`
3. Chỉnh sửa điều kiện thắng trong `checkGameState()`

## Tối ưu hóa

### Performance
- Game chạy ở 60 FPS
- Tự động điều chỉnh chất lượng khi FPS thấp
- Giới hạn số lượng particles để tránh lag

### Responsive
- Tương thích với mobile và tablet
- UI tự động điều chỉnh theo kích thước màn hình
- Touch controls cho thiết bị di động

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 16+

## Ghi chú môn học

Dự án này được thiết kế cho môn **VNR202 - Lịch sử Đảng Cộng sản Việt Nam** với mục tiêu:

1. **Giáo dục**: Truyền đạt kiến thức lịch sử một cách sinh động
2. **Tương tác**: Tạo trải nghiệm học tập hấp dẫn
3. **Công nghệ**: Ứng dụng công nghệ web hiện đại
4. **Sáng tạo**: Kết hợp game và giáo dục

## Kế hoạch mở rộng

- [ ] Thêm chế độ multiplayer
- [ ] Tích hợp AR/VR cho trải nghiệm sống động hơn
- [ ] Thêm quiz lịch sử sau mỗi màn
- [ ] Hệ thống leaderboard online
- [ ] Tích hợp AI để tạo câu hỏi tự động
- [ ] Xuất bản lên mobile app stores

## Tác giả

Dự án được phát triển bởi sinh viên môn VNR202 - Lịch sử Đảng Cộng sản Việt Nam

---

*"Không có gì quý hơn độc lập tự do" - Chủ tịch Hồ Chí Minh*

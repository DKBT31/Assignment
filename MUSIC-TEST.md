# Hướng Dẫn Test Hệ Thống Nhạc Global

## Các Cải Tiến Đã Thực Hiện

### 1. **Auto-Play Thông Minh**
- Tự động bật nhạc cho người dùng mới lần đầu
- Khôi phục trạng thái nhạc khi chuyển trang
- Xử lý autoplay policy của trình duyệt

### 2. **Đường Dẫn Nhạc Thông Minh**
- Tự động phát hiện vị trí trang và điều chỉnh đường dẫn
- Hỗ trợ tất cả các trang: index, boi-canh-lich-su, game, details

### 3. **Trải Nghiệm Người Dùng**
- Thông báo nhỏ khi nhạc chờ user interaction
- Animation hiệu ứng cho nút nhạc
- Lưu và khôi phục vị trí phát nhạc

## Cách Test

### Test 1: Người Dùng Mới
1. Xóa localStorage: `localStorage.clear()`
2. Reload trang chủ
3. **Kết quả mong đợi**: Nút nhạc hiển thị 🔊, thông báo xuất hiện

### Test 2: Chuyển Trang
1. Bật nhạc ở trang chủ
2. Chuyển sang boi-canh-lich-su.html
3. **Kết quả mong đợi**: Nhạc tiếp tục phát, giữ nguyên vị trí

### Test 3: Các Trang Chi Tiết
1. Vào day1.html từ game
2. **Kết quả mong đợi**: Nhạc hoạt động bình thường

### Test 4: Trình Duyệt Chặn Autoplay
1. Bật strict autoplay policy
2. Reload trang
3. Click bất kỳ đâu
4. **Kết quả mong đợi**: Nhạc tự động phát sau khi click

## Debug

Mở Console và kiểm tra:
```javascript
// Kiểm tra trạng thái
console.log('Is Playing:', window.globalMusic.isPlaying);
console.log('Current Time:', window.globalMusic.currentTime);
console.log('Has User Interacted:', window.globalMusic.hasUserInteracted);

// Xem localStorage
console.log(localStorage.getItem('globalMusic_isPlaying'));
console.log(localStorage.getItem('globalMusic_currentTime'));
```

## Lưu Ý Kỹ Thuật

- Autoplay chỉ hoạt động sau user interaction đầu tiên
- Hệ thống tự động retry khi audio chưa sẵn sàng
- Sử dụng localStorage để đồng bộ giữa các tab
- Hỗ trợ cả audio element có sẵn và tạo mới

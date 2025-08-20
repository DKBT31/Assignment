// Dữ liệu 12 ngày lịch sử của chiến dịch Điện Biên Phủ
const historicalData = [
    {
        id: 1,
        date: "13/3/1954",
        title: "Mở màn chiến dịch - Đánh Him Lam",
        description: "Lúc 17h00, pháo binh ta mở cuộc tấn công vào căn cứ Him Lam. Tiếng pháo đầu tiên của chiến dịch Điện Biên Phủ đã nổ lên, mở màn cho 56 ngày đêm quyết chiến lịch sử.",
        significance: "Đây là bước khởi đầu của chiến dịch, tạo hiệu ứng bất ngờ và làm cho địch hoang mang.",
        gameObjective: "Tiêu diệt 10 máy bay trinh sát địch",
        difficulty: 1,
        historicalQuote: "Tiếng pháo đầu tiên đã báo hiệu cho một chiến thắng vĩ đại!",
        keyFigures: ["Đại tướng Võ Nguyên Giáp", "Thiếu tướng Hoàng Văn Thái"],
        strategicImportance: "Tạo thế chủ động, làm chủ thời cơ đánh địch"
    },
    {
        id: 2,
        date: "14/3/1954",
        title: "Chiếm được căn cứ Him Lam",
        description: "Sau một đêm chiến đấu quyết liệt, bộ đội ta đã hoàn toàn kiểm soát căn cứ Him Lam. Đây là thắng lợi đầu tiên, mở đường cho những cuộc tấn công tiếp theo.",
        significance: "Thắng lợi đầu tiên tạo khí thế cho toàn quân, chứng minh khả năng đánh bại pháo đài kiên cố của địch.",
        gameObjective: "Bảo vệ vị trí Him Lam khỏi 15 máy bay phản công",
        difficulty: 2,
        historicalQuote: "Him Lam đã thuộc về ta, cánh cửa Điện Biên Phủ đã mở!",
        keyFigures: ["Trung đoàn 209", "Đại đội bộ binh 429"],
        strategicImportance: "Tạo căn cứ tiền tiêu, kiểm soát hướng đông bắc"
    },
    {
        id: 3,
        date: "15/3/1954",
        title: "Tấn công căn cứ Độc Lập",
        description: "Tiếp tục lợi thế, quân ta tiến công căn cứ Độc Lập. Cuộc chiến đấu diễn ra ác liệt với sự tham gia của pháo binh và bộ binh phối hợp chặt chẽ.",
        significance: "Mở rộng thành quả, tạo thế bao vây từng bước một các căn cứ địch.",
        gameObjective: "Hạ 20 máy bay vận tải tiếp tế cho địch",
        difficulty: 3,
        historicalQuote: "Mỗi căn cứ chiếm được là một bước tiến gần hơn đến thắng lợi!",
        keyFigures: ["Trung đoàn 88", "Tiểu đoàn công binh"],
        strategicImportance: "Cắt đứt liên lạc giữa các căn cứ địch"
    },
    {
        id: 4,
        date: "30/3/1954",
        title: "Chiến thắng đồi A1",
        description: "Sau nhiều ngày chuẩn bị, ta tổ chức cuộc tấn công quyết định vào đồi A1 - một trong những vị trí quan trọng nhất của địch. Chiến thắng này đã làm lung lay toàn bộ hệ thống phòng thủ Điện Biên Phủ.",
        significance: "Đây là chiến thắng then chốt, phá vỡ tuyến phòng thủ chính của địch.",
        gameObjective: "Tiêu diệt 25 máy bay chiến đấu bảo vệ đồi A1",
        difficulty: 4,
        historicalQuote: "Đồi A1 đã thuộc về ta, lá cờ Tổ quốc tung bay trên đỉnh cao!",
        keyFigures: ["Trung đoàn 312", "Anh hùng Phan Đình Giót"],
        strategicImportance: "Kiểm soát điểm cao chiến lược, quan sát toàn bộ thung lũng"
    },
    {
        id: 5,
        date: "1/4/1954",
        title: "Chiếm đồi C1 và C2",
        description: "Tiếp tục thế công, quân ta tấn công thành công các đồi C1 và C2. Địch bắt đầu tỏ ra hoảng loạn và rút lui về khu vực trung tâm.",
        significance: "Củng cố thành quả chiến thắng, thu hẹp vòng vây quanh khu trung tâm địch.",
        gameObjective: "Bắn hạ 30 máy bay trong đợt phản công của địch",
        difficulty: 5,
        historicalQuote: "Vòng vây đang siết chặt, địch không còn đường thoát!",
        keyFigures: ["Sư đoàn 308", "Trung đoàn pháo binh 45"],
        strategicImportance: "Hoàn thành việc bao vây khu trung tâm"
    },
    {
        id: 6,
        date: "5/4/1954",
        title: "Phá hủy sân bay Điện Biên Phủ",
        description: "Pháo binh ta tập trung hỏa lực, phá hủy hoàn toàn sân bay Điện Biên Phủ. Địch mất khả năng tiếp tế bằng đường hàng không, rơi vào tình thế bị cô lập hoàn toàn.",
        significance: "Cắt đứt hoàn toàn đường tiếp tế hàng không của địch, tạo bước ngoặt quyết định.",
        gameObjective: "Phá hủy 15 máy bay đậu trên sân bay",
        difficulty: 6,
        historicalQuote: "Sân bay tan hoang, địch đã bị cô lập hoàn toàn!",
        keyFigures: ["Trung đoàn pháo binh 351", "Đại đội pháo 105"],
        strategicImportance: "Cắt đứt huyết mạch tiếp tế của địch"
    },
    {
        id: 7,
        date: "15/4/1954",
        title: "Tấn công khu Hường Hoa",
        description: "Mở đợt tấn công vào khu Hường Hoa, một trong những pháo đài quan trọng của địch. Cuộc chiến đấu diễn ra trong điều kiện thời tiết khắc nghiệt.",
        significance: "Mở rộng địa bàn kiểm soát, chuẩn bị cho tổng tấn công cuối cùng.",
        gameObjective: "Tiêu diệt 35 máy bay trong điều kiện thời tiết xấu",
        difficulty: 7,
        historicalQuote: "Dưới mưa bom bão đạn, ta vẫn tiến lên không ngừng!",
        keyFigures: ["Sư đoàn 312", "Trung đoàn công binh 151"],
        strategicImportance: "Kiểm soát khu vực phía tây, chuẩn bị bao vây hoàn toàn"
    },
    {
        id: 8,
        date: "20/4/1954",
        title: "Chiếm được khu Hường Hoa",
        description: "Sau 5 ngày chiến đấu ác liệt, khu Hường Hoa đã hoàn toàn thuộc về ta. Địch chỉ còn kiểm soát được khu vực trung tâm ngày càng thu hẹp.",
        significance: "Hoàn thành việc bao vây, địch chỉ còn cố thủ trong khu trung tâm.",
        gameObjective: "Bảo vệ Hường Hoa khỏi 40 máy bay phản công",
        difficulty: 8,
        historicalQuote: "Hường Hoa đã giải phóng, vòng vây hoàn thành!",
        keyFigures: ["Anh hùng Nguyễn Văn Trỗi", "Trung đội đặc công"],
        strategicImportance: "Hoàn tất bao vây, chuẩn bị tổng tấn công"
    },
    {
        id: 9,
        date: "1/5/1954",
        title: "Chuẩn bị tổng tấn công",
        description: "Ngày Quốc tế Lao động, toàn quân ta tích cực chuẩn bị cho cuộc tổng tấn công cuối cùng. Tinh thần chiến đấu của bộ đội vô cùng cao.",
        significance: "Ngày chuẩn bị tinh thần và vật chất cho trận đánh cuối cùng quyết định.",
        gameObjective: "Hạ 45 máy bay trinh sát thu thập tình báo",
        difficulty: 9,
        historicalQuote: "Giờ G đã gần, ta sẵn sàng cho trận đánh cuối cùng!",
        keyFigures: ["Toàn thể cán bộ chiến sĩ", "Dân công hỏa tuyến"],
        strategicImportance: "Hoàn tất mọi chuẩn bị cho tổng tấn công"
    },
    {
        id: 10,
        date: "6/5/1954",
        title: "Bắt đầu tổng tấn công",
        description: "17h00, hiệu lệnh tổng tấn công được đưa ra. Hàng chục vạn quân ta đồng loạt xung phong vào khu trung tâm địch. Trận chiến cuối cùng đã bắt đầu.",
        significance: "Bước vào giai đoạn quyết định của chiến dịch, kết thúc 56 ngày chiến đấu.",
        gameObjective: "Tiêu diệt 50 máy bay trong trận tổng tấn công",
        difficulty: 10,
        historicalQuote: "Xung phong! Vì độc lập tự do của Tổ quốc!",
        keyFigures: ["Toàn quân chiến dịch", "Bộ tư lệnh chiến dịch"],
        strategicImportance: "Tổng tấn công cuối cùng, quyết định thắng bại"
    },
    {
        id: 11,
        date: "7/5/1954 - 17h30",
        title: "Chiếm được hầm Đờ Cát",
        description: "Lúc 17h30, quân ta đã chiếm được hầm chỉ huy Đờ Cát - trái tim của hệ thống phòng thủ Điện Biên Phủ. Tướng De Castries và toàn bộ bộ tư lệnh Pháp đã bị bắt.",
        significance: "Đây là khoảnh khắc lịch sử, đánh dấu chiến thắng hoàn toàn của ta.",
        gameObjective: "Hạ 60 máy bay trong trận chiến cuối cùng",
        difficulty: 11,
        historicalQuote: "Đờ Cát đã thuộc về ta! Điện Biên Phủ đã giải phóng!",
        keyFigures: ["Tướng De Castries bị bắt", "Anh hùng Võ Văn Vệ"],
        strategicImportance: "Kết thúc chiến dịch, chiếm được chỉ huy trung tâm"
    },
    {
        id: 12,
        date: "7/5/1954 - 24h00",
        title: "Hoàn toàn giải phóng Điện Biên Phủ",
        description: "Đến 24h00 ngày 7/5/1954, toàn bộ Điện Biên Phủ đã được giải phóng hoàn toàn. Chiến thắng 'lừng lẫy năm châu, chấn động địa cầu' đã trở thành hiện thực.",
        significance: "Kết thúc chiến dịch với thắng lợi hoàn toàn, mở ra kỷ nguyên mới cho dân tộc.",
        gameObjective: "Hoàn thành màn chơi cuối cùng với điểm số cao nhất",
        difficulty: 12,
        historicalQuote: "Chiến thắng Điện Biên Phủ - Lừng lẫy năm châu, chấn động địa cầu!",
        keyFigures: ["Toàn thể quân và dân ta", "Đại tướng Võ Nguyên Giáp"],
        strategicImportance: "Kết thúc thời kỳ thực dân Pháp ở Đông Dương"
    }
];

// Cấu hình cho từng màn chơi
const gameConfig = {
    canvas: {
        width: 800,
        height: 600
    },
    player: {
        width: 60,
        height: 40,
        health: 100,
        maxHealth: 100,
        fireRate: 400, // milliseconds (chậm hơn vì pháo thực tế)
        canMove: false // Pháo cố định không di chuyển được
    },
    // Máy bay thực tế của Pháp trong chiến dịch Điện Biên Phủ
    enemies: [
        { type: 'C47_transport', name: 'C-47 Skytrain', speed: 1.5, health: 2, points: 25, color: '#654321', description: 'Máy bay vận tải thả dù tiếp tế' },
        { type: 'F8F_fighter', name: 'F8F Bearcat', speed: 3.5, health: 3, points: 40, color: '#4682B4', description: 'Máy bay chiến đấu bảo vệ' },
        { type: 'F6F_fighter', name: 'F6F Hellcat', speed: 3, health: 3, points: 35, color: '#2F4F4F', description: 'Máy bay chiến đấu hạng nặng' },
        { type: 'A1_skyraider', name: 'A-1 Skyraider', speed: 2.5, health: 4, points: 50, color: '#8B4513', description: 'Máy bay tấn công mặt đất' },
        { type: 'B26_bomber', name: 'B-26 Invader', speed: 2, health: 6, points: 75, color: '#1C1C1C', description: 'Máy bay ném bom hạng nặng' }
    ],
    // Tòa nhà và khu vực cần bảo vệ
    protectedAreas: [
        {
            name: 'Trạm chỉ huy',
            x: 50, y: 500, width: 100, height: 80,
            health: 100, maxHealth: 100,
            importance: 'critical', color: '#FF0000'
        },
        {
            name: 'Kho đạn dược',
            x: 200, y: 520, width: 80, height: 60,
            health: 80, maxHealth: 80,
            importance: 'high', color: '#FF8C00'
        },
        {
            name: 'Bệnh xá dã chiến',
            x: 350, y: 510, width: 90, height: 70,
            health: 60, maxHealth: 60,
            importance: 'medium', color: '#32CD32'
        },
        {
            name: 'Căn cứ pháo binh',
            x: 500, y: 530, width: 120, height: 50,
            health: 120, maxHealth: 120,
            importance: 'high', color: '#FF4500'
        }
    ],

    // Power-ups và hỗ trợ
    powerUps: [
        { type: 'rapidFire', duration: 5000, color: '#FFD700', name: 'Hỏa lực tăng cường' },
        { type: 'shield', duration: 8000, color: '#00BFFF', name: 'Lưới phòng không' },
        { type: 'multiShot', duration: 6000, color: '#FF69B4', name: 'Đạn tán xạ' }
    ],

    // Vũ khí phòng không Việt Nam thực tế
    weapons: [
        {
            type: 'ZU23', name: 'Pháo phòng không ZU-23',
            fireRate: 400, damage: 2, range: 300,
            description: 'Pháo phòng không 23mm của Liên Xô'
        },
        {
            type: 'S60', name: 'Pháo phòng không S-60',
            fireRate: 600, damage: 3, range: 400,
            description: 'Pháo phòng không 57mm tầm xa'
        },
        {
            type: 'DShK', name: 'Súng máy phòng không DShK',
            fireRate: 200, damage: 1, range: 200,
            description: 'Súng máy hạng nặng 12.7mm'
        }
    ]
};

// Âm thanh cho game
const gameAudio = {
    background: 'assets/audio/background.mp3',
    shoot: 'assets/audio/shoot.wav',
    explosion: 'assets/audio/explosion.wav',
    powerUp: 'assets/audio/powerup.wav',
    victory: 'assets/audio/victory.wav',
    levelComplete: 'assets/audio/level_complete.wav'
};

// Trạng thái game
let gameState = {
    currentLevel: 1,
    score: 0,
    lives: 3,
    completedLevels: [],
    unlockedLevels: [1],
    totalScore: 0,
    achievements: []
};

// Load trạng thái game từ localStorage
function loadGameState() {
    const saved = localStorage.getItem('dienBienPhuGameState');
    if (saved) {
        gameState = { ...gameState, ...JSON.parse(saved) };
    }
}

// Save trạng thái game
function saveGameState() {
    localStorage.setItem('dienBienPhuGameState', JSON.stringify(gameState));
}

// Khởi tạo
loadGameState();

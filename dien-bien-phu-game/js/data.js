// Dữ liệu 12 ngày lịch sử của chiến dịch Điện Biên Phủ
const historicalData = [
    {
        id: 1,
        date: "18/12/1972",
        title: "Mỹ mở màn tập kích bằng B-52",
        description: "Đêm 18/12/1972, Mỹ huy động 90 lần chiếc B-52 cùng hàng trăm máy bay chiến thuật, mở màn cuộc tập kích chiến lược vào Hà Nội, Hải Phòng.",
        significance: "Bước mở đầu của chiến dịch Linebacker II, Mỹ muốn 'đưa miền Bắc về thời kỳ đồ đá'.",
        gameObjective: "Bắn hạ 3 máy bay B-52 trong đợt oanh tạc đầu tiên",
        difficulty: 1,
        historicalQuote: "Máy bay B-52 cũng có thể bị bắn rơi tại chỗ!",
        keyFigures: ["Quân chủng Phòng không - Không quân", "Tiểu đoàn 59"],
        strategicImportance: "Khẳng định quyết tâm đánh B-52 của ta"
    },
    {
        id: 2,
        date: "19/12/1972",
        title: "Ngày thứ hai - Ta bắn rơi B-52 đầu tiên",
        description: "Đêm 19/12, quân ta bắn rơi chiếc B-52 đầu tiên tại bầu trời Hà Nội, chứng minh tuyên bố 'B-52 bất khả xâm phạm' là sai lầm.",
        significance: "Cổ vũ tinh thần toàn quân và nhân dân, khẳng định niềm tin chiến thắng.",
        gameObjective: "Tiêu diệt 4 máy bay (có 1 B-52) trong đêm",
        difficulty: 2,
        historicalQuote: "Chiếc B-52 đầu tiên đã cháy trên bầu trời Hà Nội!",
        keyFigures: ["Trung đoàn tên lửa 261"],
        strategicImportance: "Mở đầu chiến công 'Điện Biên Phủ trên không'"
    },
    {
        id: 3,
        date: "20/12/1972",
        title: "Không khí chiến đấu khắp miền Bắc",
        description: "Các trận địa tên lửa, pháo cao xạ, máy bay MiG-21 đồng loạt vào trận. Nhiều máy bay Mỹ bị bắn hạ.",
        significance: "Khẳng định thế trận phòng không nhân dân rộng khắp.",
        gameObjective: "Bảo vệ Hà Nội khỏi 10 đợt ném bom liên tục",
        difficulty: 3,
        historicalQuote: "Hà Nội - Thủ đô của lương tri và phẩm giá con người!",
        keyFigures: ["Phi công Phạm Tuân", "Trung đoàn 927"],
        strategicImportance: "Tăng cường thế chủ động đánh trả"
    },
    {
        id: 4,
        date: "21/12/1972",
        title: "Bảo vệ Hà Nội, Hải Phòng",
        description: "Đêm 21/12, địch tăng cường đánh phá, ta kiên cường chiến đấu, bắn rơi thêm nhiều máy bay.",
        significance: "Địch không đạt mục tiêu làm tê liệt hậu phương miền Bắc.",
        gameObjective: "Tiêu diệt 5 máy bay chiến thuật, 1 B-52",
        difficulty: 4,
        historicalQuote: "Hà Nội vẫn đứng vững giữa mưa bom bão đạn.",
        keyFigures: ["Các đơn vị pháo cao xạ Hà Nội"],
        strategicImportance: "Giữ vững hậu phương lớn miền Bắc"
    },
    {
        id: 5,
        date: "22/12/1972",
        title: "Ngày thành lập Quân đội Nhân dân Việt Nam",
        description: "Đúng ngày 22/12 - kỷ niệm thành lập Quân đội Nhân dân Việt Nam, ta lập thêm chiến công bắn rơi nhiều B-52.",
        significance: "Một ngày chiến thắng mang ý nghĩa đặc biệt lịch sử.",
        gameObjective: "Hạ 2 B-52 và nhiều F-111 trong ngày",
        difficulty: 5,
        historicalQuote: "Quân đội ta càng đánh càng mạnh, càng thắng lợi to lớn.",
        keyFigures: ["Trung đoàn tên lửa 257"],
        strategicImportance: "Củng cố niềm tin toàn dân, toàn quân"
    },
    {
        id: 6,
        date: "23/12/1972",
        title: "Địch đánh phá ác liệt, ta bắn rơi nhiều B-52",
        description: "Ngày 23/12, ta tiếp tục lập công, bắn rơi thêm nhiều B-52 trên bầu trời Hà Nội và vùng phụ cận.",
        significance: "Thể hiện sức mạnh phòng không tập trung cao độ.",
        gameObjective: "Tiêu diệt 3 B-52 trong đêm",
        difficulty: 6,
        historicalQuote: "Trận địa tên lửa là mồ chôn B-52.",
        keyFigures: ["Tiểu đoàn 77, Trung đoàn 257"],
        strategicImportance: "Gây tổn thất nặng nề cho Mỹ"
    },
    {
        id: 7,
        date: "24/12/1972",
        title: "Đêm Noel rực lửa",
        description: "Trong đêm Noel, Mỹ tiếp tục đánh phá, nhưng Hà Nội đã biến đêm Giáng sinh thành địa ngục cho B-52.",
        significance: "Ngay trong ngày lễ, Mỹ vẫn thất bại trước ý chí Việt Nam.",
        gameObjective: "Bắn rơi 2 B-52, bảo vệ Hà Nội",
        difficulty: 7,
        historicalQuote: "Không có nơi nào trên thế giới, B-52 bị bắn rơi nhiều như ở Hà Nội.",
        keyFigures: ["Trung đoàn tên lửa 261"],
        strategicImportance: "Tăng sức ép buộc Mỹ phải tính lại"
    },
    {
        id: 8,
        date: "25/12/1972",
        title: "Một ngày tạm lắng",
        description: "Ngày 25/12, Mỹ tạm ngừng ném bom để rút kinh nghiệm, củng cố lực lượng.",
        significance: "Khoảng lặng quý giá để ta củng cố trận địa, chuẩn bị trận quyết chiến mới.",
        gameObjective: "Tiêu diệt 3 máy bay trinh sát và 2 F-4 tuần tra",
        difficulty: 8,
        historicalQuote: "Ta kiên quyết giữ vững thế trận, chuẩn bị đánh lớn.",
        keyFigures: ["Các lực lượng hậu cần, dân công"],
        strategicImportance: "Bảo toàn lực lượng cho trận then chốt"
    },
    {
        id: 9,
        date: "26/12/1972",
        title: "Trận quyết chiến lớn nhất",
        description: "Đêm 26/12, Mỹ huy động lực lượng B-52 lớn nhất (105 lần chiếc). Ta bắn rơi 8 B-52 – chiến thắng vang dội nhất.",
        significance: "Đây là đỉnh cao chiến công, làm nên Điện Biên Phủ trên không.",
        gameObjective: "Hạ ít nhất 8 B-52 trong một đêm",
        difficulty: 9,
        historicalQuote: "Đêm 26/12/1972 đi vào lịch sử dân tộc như một Bạch Đằng trên không.",
        keyFigures: ["Tiểu đoàn 57, 77, 79"],
        strategicImportance: "Đòn quyết định buộc Mỹ phải xuống thang"
    },
    {
        id: 10,
        date: "27/12/1972",
        title: "Mỹ bắt đầu giảm cường độ",
        description: "Sau thất bại nặng nề, Mỹ giảm dần cường độ tập kích. Ta tiếp tục giữ vững thế trận.",
        significance: "Địch xuống thang, ta củng cố thắng lợi.",
        gameObjective: "Tiêu diệt 2 B-52, 5 F-111",
        difficulty: 10,
        historicalQuote: "Sức mạnh B-52 đã bị bẻ gãy.",
        keyFigures: ["Trung đoàn 257"],
        strategicImportance: "Khẳng định thế chủ động của ta"
    },
    {
        id: 11,
        date: "28/12/1972",
        title: "Ta tiếp tục lập công",
        description: "Ngày 28/12, ta bắn rơi thêm nhiều máy bay, Mỹ gần như bất lực.",
        significance: "Chiến thắng nối tiếp chiến thắng, Mỹ không còn khả năng xoay chuyển.",
        gameObjective: "Bắn hạ 1 B-52 và nhiều máy bay hộ tống",
        difficulty: 11,
        historicalQuote: "Hà Nội là mồ chôn B-52.",
        keyFigures: ["Các lực lượng phòng không"],
        strategicImportance: "Địch suy yếu nghiêm trọng"
    },
    {
        id: 12,
        date: "29/12/1972",
        title: "Mỹ tuyên bố ngừng ném bom",
        description: "Ngày 29/12, Mỹ buộc phải tuyên bố ngừng ném bom miền Bắc từ vĩ tuyến 20 trở ra.",
        significance: "Chiến dịch 12 ngày đêm kết thúc với chiến thắng vang dội, 'Điện Biên Phủ trên không'.",
        gameObjective: "Tiêu diệt 15 máy bay trong màn cuối (bao gồm B-52)",
        difficulty: 12,
        historicalQuote: "Chiến thắng Điện Biên Phủ trên không – lừng lẫy năm châu, chấn động địa cầu!",
        keyFigures: ["Đại tướng Võ Nguyên Giáp", "Quân dân Hà Nội"],
        strategicImportance: "Buộc Mỹ phải ký Hiệp định Paris"
    }
];

// Cấu hình cho từng màn chơi
const gameConfig = {
    canvas: {
        width: 1400,
        height: 800
    },
    player: {
        width: 90,
        height: 60,
        health: 100,
        maxHealth: 100,
        fireRate: 400, // milliseconds (chậm hơn vì pháo thực tế)
        canMove: false // Pháo cố định không di chuyển được
    },
    // Máy bay thực tế của Pháp trong chiến dịch Điện Biên Phủ
    enemies: [
        { type: 'B52_bomber', name: 'B-52 Stratofortress', speed: 2, health: 2, points: 75, color: '#1C1C1C', description: 'Máy bay ném bom chiến lược hạng nặng' },
        { type: 'F4C_phantom', name: 'F-4C Phantom II', speed: 4.5, health: 1, points: 60, color: '#708090', description: 'Máy bay chiến đấu tốc độ cao, ít sát thương' },
        { type: 'C47_transport', name: 'C-47 Skytrain', speed: 1.5, health: 1, points: 40, color: '#8B7D6B', description: 'Máy bay vận tải thả dù tiếp tế, rơi power-up khi bị bắn' }
    ],
    // Tòa nhà và khu vực cần bảo vệ
    protectedAreas: [
        {
            name: 'Trạm chỉ huy',
            x: 100, y: 650, width: 150, height: 120,
            health: 100, maxHealth: 100,
            importance: 'critical', color: '#FF0000'
        },
        {
            name: 'Kho đạn dược',
            x: 350, y: 680, width: 120, height: 90,
            health: 80, maxHealth: 80,
            importance: 'high', color: '#FF8C00'
        },
        {
            name: 'Bệnh xá dã chiến',
            x: 600, y: 665, width: 135, height: 105,
            health: 60, maxHealth: 60,
            importance: 'medium', color: '#32CD32'
        },
        {
            name: 'Căn cứ pháo binh',
            x: 900, y: 695, width: 180, height: 75,
            health: 120, maxHealth: 120,
            importance: 'high', color: '#FF4500'
        }
    ],

    // Power-ups và hỗ trợ
    powerUps: [
        { type: 'rapidFire', duration: 5000, color: '#FFD700', name: 'Hỏa lực tăng cường', effect: 'Tăng tốc độ bắn gấp đôi', icon: '⚡' },
        { type: 'shield', duration: 8000, color: '#00BFFF', name: 'Lưới phòng không', effect: 'Giảm 50% sát thương nhận vào', icon: '🛡️' },
        { type: 'multiShot', duration: 6000, color: '#FF69B4', name: 'Đạn tán xạ', effect: 'Bắn 3 viên đạn cùng lúc', icon: '🎯' },
        { type: 'heal', amount: 30, color: '#00FF00', name: 'Hộp y tế', effect: 'Hồi phục 30 điểm máu', icon: '❤️' },
        { type: 'spreadShot', duration: 7000, color: '#FF4500', name: 'Pháo phân tán', effect: 'Bắn theo hình quạt 5 viên', icon: '💥' }
    ],

    // Vũ khí phòng không Việt Nam thực tế
    weapons: [
        {
            type: 'ZU23', name: 'Pháo phòng không ZU-23',
            fireRate: 400, damage: 2, range: 450,
            description: 'Pháo phòng không 23mm của Liên Xô'
        },
        {
            type: 'S60', name: 'Pháo phòng không S-60',
            fireRate: 600, damage: 3, range: 600,
            description: 'Pháo phòng không 57mm tầm xa'
        },
        {
            type: 'DShK', name: 'Súng máy phòng không DShK',
            fireRate: 200, damage: 1, range: 300,
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
    completedLevels: [],
    unlockedLevels: [1],
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

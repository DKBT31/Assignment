// Dữ liệu 12 ngày lịch sử của chiến dịch Điện Biên Phủ
const historicalData = [
    {
        id: 1,
        date: "18/12/1972",
        title: "Ngày đầu tiên của Linebacker II",
        description: "Đêm 18/12/1972, Mỹ mở màn chiến dịch Linebacker II bằng 129 lượt xuất kích B-52 và hàng trăm máy bay hộ tống. Quân ta đã bắn rơi 3 chiếc B-52 (2 chiếc từ căn cứ Andersen, 1 từ U-Tapao) và 1 chiếc F-111.",
        significance: "Ngày mở màn chiến dịch oanh tạc chiến lược, đồng thời là ngày đầu tiên ta chứng minh B-52 có thể bị bắn rơi.",
        gameObjective: "Bắn hạ 4 máy bay (3 B-52 và 1 F-111)",
        difficulty: 1,
        historicalQuote: "Máy bay B-52 cũng có thể bị bắn rơi tại chỗ!",
        keyFigures: ["Quân chủng Phòng không - Không quân", "Tiểu đoàn 59"],
        strategicImportance: "Khẳng định quyết tâm và khả năng đánh B-52 của ta ngay từ đêm đầu tiên"
    },
    {
        id: 2,
        date: "19/12/1972",
        title: "Ngày không tổn thất",
        description: "Đêm 19/12/1972, Mỹ thực hiện 93 lượt xuất kích B-52 với khoảng 20 tên lửa SAM được bắn ra nhắm vào các mục tiêu. Tuy nhiên, không có báo cáo về tổn thất máy bay nào trong ngày này.",
        significance: "Mỹ điều chỉnh chiến thuật sau tổn thất ngày đầu, nhưng vẫn chưa tìm được cách đối phó hiệu quả với hệ thống phòng không của ta.",
        gameObjective: "Bảo vệ thành công trước 93 lượt xuất kích",
        difficulty: 2,
        historicalQuote: "Hôm nay địch bay nhiều nhưng ta vẫn kiểm soát được bầu trời!",
        keyFigures: ["Trung đoàn tên lửa 261", "Trung đoàn tên lửa 257"],
        strategicImportance: "Duy trì thế chủ động, buộc địch phải dè chừng"
    },
    {
        id: 3,
        date: "20/12/1972",
        title: "Ngày thiệt hại nặng nhất",
        description: "Đêm 20/12/1972 là một trong những ngày thiệt hại nặng nhất của Mỹ trong chiến dịch. Quân ta đã bắn rơi 6 chiếc B-52 (gồm 4 chiếc B-52G và 2 chiếc B-52D), trong đó có chiếc cuối cùng rơi tại Lào.",
        significance: "Ngày thể hiện sức mạnh tuyệt đối của hệ thống phòng không Việt Nam, gây tổn thất nặng nề nhất cho không lực Mỹ.",
        gameObjective: "Bắn hạ 6 chiếc B-52 trong đêm",
        difficulty: 3,
        historicalQuote: "Hà Nội - Thủ đô của lương tri và phẩm giá con người!",
        keyFigures: ["Trung đoàn tên lửa 261", "Trung đoàn tên lửa 257", "Phi công Phạm Tuân"],
        strategicImportance: "Tạo chuyển biến quan trọng, buộc Mỹ phải xem xét lại chiến lược"
    },
    {
        id: 4,
        date: "21/12/1972",
        title: "Tiếp tục gây tổn thất cho địch",
        description: "Đêm 21/12/1972, lực lượng phòng không ta tiếp tục lập công. Tên lửa SA-2 đã bắn hạ 2 chiếc B-52D (USAF) và 1 chiếc A-6A (USN), chứng minh sức mạnh vượt trội của hệ thống phòng không Việt Nam.",
        significance: "Duy trì đà chiến thắng, tiếp tục gây tổn thất đáng kể cho không lực Mỹ.",
        gameObjective: "Bắn hạ 3 máy bay (2 B-52D và 1 A-6A)",
        difficulty: 4,
        historicalQuote: "Tên lửa SA-2 của ta ngày càng chính xác và hiệu quả!",
        keyFigures: ["Các đơn vị tên lửa SA-2", "Trung đoàn tên lửa 261"],
        strategicImportance: "Duy trì áp lực lên không lực Mỹ, buộc họ phải thay đổi chiến thuật"
    },
    {
        id: 5,
        date: "22/12/1972",
        title: "Ngày thành lập Quân đội Nhân dân Việt Nam",
        description: "Đúng ngày 22/12 - kỷ niệm thành lập Quân đội Nhân dân Việt Nam, lực lượng phòng không ta lập chiến công với việc bắn hạ 1 chiếc F-111A (USAF) bằng hỏa lực phòng không (AAA).",
        significance: "Một ngày chiến thắng mang ý nghĩa đặc biệt lịch sử, thể hiện hiệu quả của hệ thống phòng không đa tầng.",
        gameObjective: "Bắn hạ 1 F-111A bằng pháo phòng không",
        difficulty: 5,
        historicalQuote: "Quân đội ta càng đánh càng mạnh, hỏa lực phòng không ngày càng hiệu quả!",
        keyFigures: ["Các đơn vị pháo phòng không", "Trung đoàn 257"],
        strategicImportance: "Chứng minh hiệu quả của pháo phòng không trong hệ thống phòng thủ tổng hợp"
    },
    {
        id: 6,
        date: "23/12/1972",
        title: "Ngày thiệt hại đa dạng cho địch",
        description: "Ngày 23/12/1972, quân ta gây ra nhiều tổn thất đa dạng cho địch: 1 chiếc EB-66E (USAF) bị mất do sự cố động cơ, 1 chiếc A-7E (USN) và 1 chiếc F-4J (USN) bị bắn hạ bởi tên lửa SA-2.",
        significance: "Thể hiện sức mạnh và tính hiệu quả của hệ thống phòng không, đồng thời áp lực chiến đấu cũng gây ra sự cố cho máy bay địch.",
        gameObjective: "Bắn hạ 2 máy bay (A-7E và F-4J)",
        difficulty: 6,
        historicalQuote: "Áp lực chiến đấu khiến địch không chỉ bị bắn hạ mà còn gặp sự cố!",
        keyFigures: ["Các đơn vị tên lửa SA-2", "Trung đoàn 261"],
        strategicImportance: "Gây tổn thất cho cả không quân và hải quân Mỹ, chứng minh hiệu quả toàn diện"
    },
    {
        id: 7,
        date: "24/12/1972",
        title: "Chiến đấu trong đêm Noel",
        description: "Đêm 24/12/1972 (đêm Noel), Mỹ hy vọng lợi dụng tâm lý lễ hội để gây bất ngờ, nhưng Việt Nam vẫn giữ cảnh giác cao độ. Đây là đêm tấn công cuối cùng trước lệnh ngừng bắn 36 giờ. Quân ta đã bắn rơi 9 máy bay địch.",
        significance: "Thể hiện ý chí chiến đấu kiên cường trong điều kiện đặc biệt, không để lễ hội làm sao lãng nhiệm vụ.",
        gameObjective: "Bắn rơi 9 máy bay trong đêm Noel",
        difficulty: 7,
        historicalQuote: "Dù là đêm Noel, ta vẫn kiên quyết bảo vệ Tổ quốc!",
        keyFigures: ["Các đơn vị phòng không toàn quân", "Trung đoàn tên lửa 261"],
        strategicImportance: "Chứng minh ý chí bất khuất, không để địch lợi dụng tâm lý lễ hội"
    },
    {
        id: 8,
        date: "25/12/1972",
        title: "Ngày nghỉ Giáng Sinh",
        description: "Ngày 25/12/1972 (Giáng Sinh), theo các tài liệu, đây là ngày ngừng bắn, hoạt động ném bom bị tạm gián đoạn. Thường được coi là ngày nghỉ không chính thức, vì vậy không có ghi nhận tổn thất máy bay hay xuất kích nào.",
        significance: "Một ngày hiếm hoi yên tĩnh trong chiến dịch, cho phép cả hai bên tạm dừng để chuẩn bị cho các ngày tiếp theo.",
        gameObjective: "Duy trì cảnh giác, không có chiến đấu",
        difficulty: 8,
        historicalQuote: "Ngày Giáng Sinh yên bình giữa cơn bão chiến tranh.",
        keyFigures: ["Các lực lượng hậu cần, dân công"],
        strategicImportance: "Cơ hội quý giá để củng cố trận địa và chuẩn bị lực lượng"
    },
    {
        id: 9,
        date: "26/12/1972",
        title: "Ngày với sự cố đặc biệt",
        description: "Ngày 26/12/1972, tài liệu hiện không cung cấp số liệu tổn thất máy bay cụ thể. Tuy nhiên, có ghi nhận một sự cố đặc biệt: một chiếc B-52D (USAF) bị trúng tên lửa SA-2 khi bay qua Hà Nội, sau đó phải hạ cánh khẩn cấp tại U-Tapao và bị phá hủy. 4 thành viên phi hành đoàn thiệt mạng, 2 người sống sót.",
        significance: "Chứng minh rằng ngay cả khi không bị bắn rơi ngay lập tức, áp lực chiến đấu vẫn gây ra hậu quả nghiêm trọng cho địch.",
        gameObjective: "Gây tổn thương nghiêm trọng cho 1 B-52D",
        difficulty: 9,
        historicalQuote: "Tên lửa SA-2 để lại dấu ấn chết người trên B-52!",
        keyFigures: ["Các đơn vị tên lửa SA-2", "Tiểu đoàn 57"],
        strategicImportance: "Thể hiện hiệu quả lâu dài của hệ thống phòng không, gây tổn thất cả trực tiếp và gián tiếp"
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
    shoot: 'assets/audio/fire.mp3',
    explosion: 'assets/audio/explosion.mp3',
    powerUp: 'assets/audio/powerup.mp3',
    victory: 'assets/audio/victory.wav',
    levelComplete: 'assets/audio/level_complete.wav',
    bulletHit: 'assets/audio/bullethit.mp3',
    bombFall: 'assets/audio/bombfall.mp3',
    planeExplosion: 'assets/audio/explosion-plane.mp3'
};

// Volume settings for each sound (0.0 = silent, 1.0 = full volume)
const gameAudioVolumes = {
    background: 0.3,
    shoot: 0.2,        // Gunshot volume - change this to your preference
    explosion: 0.1,
    powerUp: 0.4,
    victory: 0.6,
    levelComplete: 0.5,
    bulletHit: 0.3,    // Bullet hit sound volume
    bombFall: 0.1,     // Bomb falling sound volume
    planeExplosion: 0.2 // Plane explosion sound volume
};

// Sound settings
let soundEnabled = true; // Global sound toggle

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

// Helper functions for environment-aware navigation
function getBasePath() {
    const currentPath = window.location.pathname;
    const hostname = window.location.hostname;

    // For Vercel production, we need to check where we are
    if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
        // If we're at the root (index page) on Vercel, we still need the dien-bien-phu-game prefix
        // because the game files are in that folder
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('index.html')) {
            return 'dien-bien-phu-game/';
        }
        // If we're already in a game page, no prefix needed
        return '';
    }

    // For local development
    // If we're already in the dien-bien-phu-game folder
    if (currentPath.includes('/dien-bien-phu-game/')) {
        return ''; // Already in subfolder, no prefix needed
    }

    // If we're on the root or index page in local development, we need the prefix
    return 'dien-bien-phu-game/';
}

function buildPath(relativePath) {
    return getBasePath() + relativePath;
}

// Khởi tạo
loadGameState();

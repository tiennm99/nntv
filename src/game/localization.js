// Localization system for Night Ninja: Twilight Voyage
// Supports English and Vietnamese languages

// Default language is Vietnamese
let currentLanguage = 'vi';

// Text data for all UI elements in the game
const localizationData = {
    // Main Menu
    'gameTitle': {
        'en': 'NIGHT NINJA: TWILIGHT VOYAGE',
        'vi': 'NINJA ĐÊM: HÀNH TRÌNH HOÀNG HÔN'
    },
    'startGame': {
        'en': 'START GAME',
        'vi': 'BẮT ĐẦU CHƠI'
    },
    'levelSelect': {
        'en': 'LEVEL SELECT',
        'vi': 'CHỌN CẤP ĐỘ'
    },
    'settings': {
        'en': 'SETTINGS',
        'vi': 'CÀI ĐẶT'
    },
    'gameDescription': {
        'en': 'Guide the ninja through the shadows.\nAvoid light at all costs.\nRescue the princess... if you can.',
        'vi': 'Dẫn dắt ninja qua bóng tối.\nTránh ánh sáng bằng mọi giá.\nCứu công chúa... nếu bạn có thể.'
    },
    'instructions': {
        'en': 'Use arrow keys, WASD, or tap to move.',
        'vi': 'Sử dụng phím mũi tên, WASD, hoặc chạm để di chuyển.'
    },

    // Settings Menu
    'languageSettings': {
        'en': 'Language',
        'vi': 'Ngôn ngữ'
    },
    'english': {
        'en': 'English',
        'vi': 'Tiếng Anh'
    },
    'vietnamese': {
        'en': 'Vietnamese',
        'vi': 'Tiếng Việt'
    },
    'back': {
        'en': 'Back',
        'vi': 'Quay lại'
    },

    // Level Select
    'levelSelectTitle': {
        'en': 'SELECT LEVEL',
        'vi': 'CHỌN CẤP ĐỘ'
    },
    'levelNumber': {
        'en': 'Level',
        'vi': 'Cấp độ'
    },

    // Game UI
    'lives': {
        'en': 'Lives: ',
        'vi': 'Mạng: '
    },
    'level': {
        'en': 'Level: ',
        'vi': 'Cấp độ: '
    },
    'pause': {
        'en': 'PAUSE',
        'vi': 'TẠM DỪNG'
    },
    'menu': {
        'en': 'MENU',
        'vi': 'MENU'
    },
    'paused': {
        'en': 'PAUSED',
        'vi': 'TẠM DỪNG'
    },
    'resume': {
        'en': 'RESUME',
        'vi': 'TIẾP TỤC'
    },
    'restartLevel': {
        'en': 'RESTART LEVEL',
        'vi': 'CHƠI LẠI CẤP ĐỘ'
    },
    'detected': {
        'en': 'You have been detected!',
        'vi': 'Bạn đã bị phát hiện!'
    },
    'playAgain': {
        'en': 'PLAY AGAIN',
        'vi': 'CHƠI LẠI'
    },
    'princessDetected': {
        'en': 'The princess has detected the ninja! The entire palace is lit up!',
        'vi': 'Công chúa phát hiện ra ninja! Toàn bộ cung điện sáng đèn!'
    },

    // Game Over
    'gameOver': {
        'en': 'GAME OVER',
        'vi': 'GAME KẾT THÚC'
    },
    'theEnd': {
        'en': 'THE END',
        'vi': 'KẾT THÚC'
    },
    'caughtInLight': {
        'en': 'You were caught in the light!',
        'vi': 'Bạn đã bị bắt trong ánh sáng!'
    },
    'ninjaFailed': {
        'en': 'Unfortunately, in this life, the ninja cannot rescue the princess.',
        'vi': 'Thật tiếc, kiếp này ninja không thể giải cứu công chúa rồi.'
    },
    'tryAgain': {
        'en': 'TRY AGAIN',
        'vi': 'THỬ LẠI'
    },
    'mainMenu': {
        'en': 'MAIN MENU',
        'vi': 'MENU CHÍNH'
    }
};

// Function to get text in the current language
function getText(key) {
    if (localizationData[key] && localizationData[key][currentLanguage]) {
        return localizationData[key][currentLanguage];
    }
    // Fallback to English if the key or language is not found
    if (localizationData[key] && localizationData[key]['en']) {
        return localizationData[key]['en'];
    }
    // Return the key itself if no translation is found
    return key;
}

// Function to change the language
function setLanguage(language) {
    if (language === 'en' || language === 'vi') {
        currentLanguage = language;
        // Save the language preference to localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('nntv-language', language);
        }
        return true;
    }
    return false;
}

// Function to get the current language
function getLanguage() {
    return currentLanguage;
}

// Initialize language from localStorage if available
function initLanguage() {
    if (typeof localStorage !== 'undefined') {
        const savedLanguage = localStorage.getItem('nntv-language');
        if (savedLanguage === 'en' || savedLanguage === 'vi') {
            currentLanguage = savedLanguage;
        }
    }
}

// Export the functions and data
export { getText, setLanguage, getLanguage, initLanguage };

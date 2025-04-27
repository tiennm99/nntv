// Localization system for Night Ninja: Twilight Voyage
// Supports English and Vietnamese languages

// Import language files
import enTranslations from './locales/en.json';
import viTranslations from './locales/vi.json';

// Default language is Vietnamese
let currentLanguage = 'vi';

// Store translations in a map
const localizationData = {
    'en': enTranslations,
    'vi': viTranslations
};

// Function to get text in the current language
function getText(key) {
    if (localizationData[currentLanguage] && localizationData[currentLanguage][key]) {
        return localizationData[currentLanguage][key];
    }
    // Fallback to English if the key is not found in current language
    if (localizationData['en'] && localizationData['en'][key]) {
        return localizationData['en'][key];
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

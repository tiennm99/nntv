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
    // `!== undefined` (not truthiness) matters: an empty-string translation is
    // a valid, intentional value and must not fall through to English/missing.
    if (localizationData[currentLanguage] && localizationData[currentLanguage][key] !== undefined) {
        return localizationData[currentLanguage][key];
    }
    // Fallback to English if the key is not found in current language
    if (localizationData['en'] && localizationData['en'][key] !== undefined) {
        return localizationData['en'][key];
    }
    // Missing key in both languages — fail loud instead of silently rendering
    // the raw key (a raw key like "levelComplete" reads as plausible text and
    // hides the bug rather than surfacing it). Never returns a falsy value, so
    // callers relying on `getText(x) || fallback` still behave, they just never
    // need the fallback branch anymore.
    if (typeof console !== 'undefined') {
        console.warn(`[i18n] missing translation key: "${key}"`);
    }
    return `⚠ missing:${key}`;
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

// Initialize AOS
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
    });

    // Load saved language
    const savedLanguage = localStorage.getItem('language') || 'en';
    changeLanguage(savedLanguage);
});

// Language Switcher
function changeLanguage(language) {
    document.body.lang = language;
    localStorage.setItem('language', language);

    const enElements = document.querySelectorAll('.en');
    const arElements = document.querySelectorAll('.ar');

    if (language === 'en') {
        enElements.forEach(el => el.classList.remove('hidden'));
        arElements.forEach(el => el.classList.add('hidden'));
    } else if (language === 'ar') {
        enElements.forEach(el => el.classList.add('hidden'));
        arElements.forEach(el => el.classList.remove('hidden'));
    }

    // Update dropdown value
    const languageSwitcher = document.getElementById('language-switcher');
    if (languageSwitcher) languageSwitcher.value = language;
}
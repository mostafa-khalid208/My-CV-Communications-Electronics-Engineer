// Initialize AOS and load initial settings
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        duration: 1000,
        once: true,
    });

    // Load saved language and theme
    const savedLanguage = localStorage.getItem('language') || 'en';
    const savedTheme = localStorage.getItem('theme') || 'light';
    changeLanguage(savedLanguage);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        document.getElementById('theme-toggle').innerHTML = '<i class="fas fa-sun"></i>';
    }

    // Show home page initially
    showHome();
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
}

// Toggle Theme (Dark/Light)
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    body.classList.toggle('dark');

    if (body.classList.contains('dark')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    }
}

// Show a specific section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    const homeNav = document.getElementById('home-nav');
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
    homeNav.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show home page
function showHome() {
    const sections = document.querySelectorAll('.section');
    const homeNav = document.getElementById('home-nav');
    sections.forEach(section => section.classList.add('hidden'));
    homeNav.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
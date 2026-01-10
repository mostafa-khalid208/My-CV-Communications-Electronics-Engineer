document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false
    });

    // 2. Load Saved Preferences
    const savedLang = localStorage.getItem('language') || 'en';
    const savedTheme = localStorage.getItem('theme') || 'light';

    changeLanguage(savedLang);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeIcon(true);
    }

    // 3. Initialize Typed.js (Typing Effect)
    initTyped(savedLang);

    // 4. Security Measures (Privacy)
    enableSecurity();
});

/* === Language Switcher === */
function changeLanguage(lang) {
    document.body.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr'; // Important for search icon position
    localStorage.setItem('language', lang);

    // Toggle Visibility
    document.querySelectorAll('.en').forEach(el => {
        el.classList.toggle('hidden', lang !== 'en');
    });
    document.querySelectorAll('.ar').forEach(el => {
        el.classList.toggle('hidden', lang !== 'ar');
    });

    // Update Buttons Style
    document.getElementById('btn-en').classList.toggle('active-lang', lang === 'en');
    document.getElementById('btn-ar').classList.toggle('active-lang', lang === 'ar');

    // Update Articles if function exists (from articles-manager.js)
    if (typeof window.updateArticlesLang === 'function') {
        window.updateArticlesLang();
    }

    // Re-init Typed.js for new language
    initTyped(lang);
}

/* === Typed.js Setup === */
let typedInstance;
function initTyped(lang) {
    if (typedInstance) { typedInstance.destroy(); }

    const stringsEn = ["Communications and Electronics Engineer (ECE Engineer)", "Jr. Flutter Developer", "Jr.Machine Learning Eng."];
    const stringsAr = ["مهندس اتصالات وإلكترونيات", "مطور Flutter مبتدئ", "مهندس تعلم آلي مبتدئ"];

    const targetSelector = lang === 'en' ? '.typed-text-en' : '.typed-text-ar';
    if (document.querySelector(targetSelector)) {
        typedInstance = new Typed(targetSelector, {
            strings: lang === 'en' ? stringsEn : stringsAr,
            typeSpeed: 50,
            backSpeed: 30,
            loop: true,
            showCursor: true
        });
    }
}

/* === Theme Toggle === */
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

/* === Navigation Logic === */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-card').forEach(sec => {
        sec.classList.add('hidden');
        sec.classList.remove('active-section');
    });

    // Show target section
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active-section');
        // Trigger Animation refresh
        setTimeout(() => AOS.refresh(), 100);
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    // Simple logic to highlight current link
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Close mobile menu if open
    document.getElementById('sidebar').classList.remove('active-mobile');

    // Smooth Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* === Mobile Menu === */
function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active-mobile');
}

/* === Security Features (Privacy) === */
function enableSecurity() {
    // Disable Right Click
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // Disable Keyboard Shortcuts for Inspector
    document.addEventListener('keydown', (e) => {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && e.key === 'U')
        ) {
            e.preventDefault();
        }
    });
}
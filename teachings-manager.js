/**
 * Teachings Manager - Updated with Fallback Image
 */

let allTeachings = [];
let currentMainCategory = 'all';
let currentPlatform = 'all';

const FALLBACK_TEACHING_IMAGE = 'https://i.postimg.cc/8z5PqKsM/Picsart_26_01_14_23_40_58_850.png';

document.addEventListener('DOMContentLoaded', () => {
    fetchTeachings();

    const lang = localStorage.getItem('language') || 'en';
    updatePageLanguage(lang);

    const searchInput = document.getElementById('teaching-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderBasedOnLogic();
        });
    }
});

/* === 1. Main Navigation Logic === */
function setMainFilter(category) {
    currentMainCategory = category;
    currentPlatform = 'all';

    document.querySelectorAll('.main-tab').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${category}`).classList.add('active');

    document.getElementById('course-filters').classList.add('hidden');
    document.getElementById('seminar-filters').classList.add('hidden');
    document.getElementById('coupon-filters').classList.add('hidden');

    if (category === 'all') {
        // Do nothing
    }
    else if (category === 'course') {
        document.getElementById('course-filters').classList.remove('hidden');
        resetSubButtons('course-filters');
    }
    else if (category === 'seminar') {
        document.getElementById('seminar-filters').classList.remove('hidden');
        resetSubButtons('seminar-filters');
    }
    else if (category === 'coupon') {
        document.getElementById('coupon-filters').classList.remove('hidden');
        resetSubButtons('coupon-filters');
    }

    renderBasedOnLogic();
}

/* === 2. Sub-Menu Logic === */
function setPlatformFilter(platform, btnElement) {
    currentPlatform = platform;

    const parentGroup = btnElement.closest('.filter-group');
    parentGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    renderBasedOnLogic();
}

function resetSubButtons(groupId) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    group.querySelector('.filter-btn').classList.add('active');
}

/* === 3. Rendering Engine === */
function renderBasedOnLogic() {
    const grid = document.getElementById('teachings-grid');
    const searchTerm = document.getElementById('teaching-search').value.toLowerCase();
    const currentLang = localStorage.getItem('language') || 'en';

    grid.innerHTML = '';

    const filteredData = allTeachings.filter(item => {
        const matchesMain = currentMainCategory === 'all' || item.type === currentMainCategory;
        const matchesPlatform = currentPlatform === 'all' || item.platform === currentPlatform;
        const title = (currentLang === 'en' ? item.title.en : item.title.ar).toLowerCase();
        const matchesSearch = title.includes(searchTerm);

        return matchesMain && matchesPlatform && matchesSearch;
    });

    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-secondary);">
                <h3>${currentLang === 'en' ? 'No results found.' : 'لا توجد نتائج.'}</h3>
            </div>
        `;
        return;
    }

    filteredData.forEach(item => {
        grid.appendChild(createCard(item, currentLang));
    });
}

/* === 4. Card Creation === */
function createCard(item, lang) {
    const card = document.createElement('div');
    card.className = 'teaching-card';
    card.setAttribute('data-aos', 'fade-up');

    const title = lang === 'en' ? item.title.en : item.title.ar;
    const summary = lang === 'en' ? item.summary.en : item.summary.ar;

    let badgeClass = 'badge-course';
    let badgeText = lang === 'en' ? 'Course' : 'دورة';

    if (item.type === 'seminar') {
        badgeClass = 'badge-seminar';
        badgeText = lang === 'en' ? 'Seminar' : 'ندوة';
    }

    if (item.type === 'coupon') {
        if (item.couponType === 'free') {
            badgeClass = 'badge-coupon-free';
            badgeText = lang === 'en' ? 'Free Coupon' : 'كوبون مجاني';
        } else {
            badgeClass = 'badge-coupon-discount';
            badgeText = lang === 'en' ? 'Discount Coupon' : 'كوبون خصم';
        }
    }
    // =====================================

    let platformIcon = '<i class="fas fa-globe"></i>';
    let platformName = 'Other';
    if (item.platform === 'udemy') { platformIcon = '<i class="fas fa-graduation-cap"></i>'; platformName = 'Udemy'; }
    if (item.platform === 'youtube') { platformIcon = '<i class="fab fa-youtube"></i>'; platformName = 'YouTube'; }

    const imageSrc = item.image || FALLBACK_TEACHING_IMAGE;

    card.innerHTML = `
        <div class="teaching-card-image">
            <img src="${imageSrc}" alt="img" loading="lazy" onerror="this.src='${FALLBACK_TEACHING_IMAGE}'; this.onerror=null;">
            <span class="teaching-badge ${badgeClass}">${badgeText}</span>
            <span class="platform-badge">${platformIcon} ${platformName}</span>
        </div>
        <div class="teaching-card-content">
            <h3>${title}</h3>
            ${item.type === 'coupon' ?
            `<div class="coupon-highlight">${item.couponCode}</div>` :
            `<p style="font-size:0.9rem; color:var(--text-secondary)">${summary}</p>`
        }
            <div class="teaching-actions">
                <a href="../teaching-details/?id=${item.id}" class="teaching-btn">
                    <i class="fas fa-info-circle"></i> ${lang === 'en' ? 'Details' : 'تفاصيل'}
                </a>
                <a href="${item.link}" target="_blank" class="teaching-btn teaching-btn-primary">
                    ${item.type === 'coupon' ? (lang === 'en' ? 'Get' : 'احصل عليه') : (lang === 'en' ? 'Enroll' : 'سجل')}
                </a>
            </div>
        </div>
    `;
    return card;
}

/* === 5. Data Fetching === */
async function fetchTeachings() {
    try {
        // Add cache-busting to always get the latest teachings.json
        const cacheBuster = `?v=${Date.now()}`;
        let response;
        try {
            response = await fetch(`teachings.json${cacheBuster}`, { cache: 'no-store' });
            if (!response.ok) throw new Error();
        } catch (e) {
            response = await fetch(`../teachings.json${cacheBuster}`, { cache: 'no-store' });
        }
        allTeachings = await response.json();
        setMainFilter('all');
    } catch (error) {
        console.error(error);
    }
}

/* === 6. Language Update === */
window.changeLanguage = function (lang) {
    localStorage.setItem('language', lang);
    updatePageLanguage(lang);
    renderBasedOnLogic();
};

function updatePageLanguage(lang) {
    const isAr = lang === 'ar';
    document.body.dir = isAr ? 'rtl' : 'ltr';
    document.body.lang = lang;

    const homeEn = document.querySelector('.nav-home-btn.en');
    const homeAr = document.querySelector('.nav-home-btn.ar');

    if (isAr) {
        homeEn.classList.add('hidden');
        homeAr.classList.remove('hidden');
        document.getElementById('btn-ar').classList.add('active-lang');
        document.getElementById('btn-en').classList.remove('active-lang');
    } else {
        homeAr.classList.add('hidden');
        homeEn.classList.remove('hidden');
        document.getElementById('btn-en').classList.add('active-lang');
        document.getElementById('btn-ar').classList.remove('active-lang');
    }

    document.querySelectorAll('.en:not(.nav-home-btn)').forEach(el => el.classList.toggle('hidden', isAr));
    document.querySelectorAll('.ar:not(.nav-home-btn)').forEach(el => el.classList.toggle('hidden', !isAr));
}

window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.querySelector('#theme-toggle i').className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};
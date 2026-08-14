/**
 * Teachings Manager - High Performance & Rich Sharing
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
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                renderBasedOnLogic();
            }, 250);
        });
    }
});

/* === 1. Main Navigation Logic === */
function setMainFilter(category) {
    currentMainCategory = category;
    currentPlatform = 'all';

    document.querySelectorAll('.main-tab').forEach(btn => btn.classList.remove('active'));
    const targetTab = document.getElementById(`tab-${category}`);
    if (targetTab) targetTab.classList.add('active');

    const courseF = document.getElementById('course-filters');
    const seminarF = document.getElementById('seminar-filters');
    const couponF = document.getElementById('coupon-filters');

    if (courseF) courseF.classList.add('hidden');
    if (seminarF) seminarF.classList.add('hidden');
    if (couponF) couponF.classList.add('hidden');

    if (category === 'course' && courseF) {
        courseF.classList.remove('hidden');
        resetSubButtons('course-filters');
    } else if (category === 'seminar' && seminarF) {
        seminarF.classList.remove('hidden');
        resetSubButtons('seminar-filters');
    } else if (category === 'coupon' && couponF) {
        couponF.classList.remove('hidden');
        resetSubButtons('coupon-filters');
    }

    renderBasedOnLogic();
}

/* === 2. Sub-Menu Logic === */
function setPlatformFilter(platform, btnElement) {
    currentPlatform = platform;

    const parentGroup = btnElement.closest('.filter-group');
    if (parentGroup) {
        parentGroup.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btnElement.classList.add('active');
    }

    renderBasedOnLogic();
}

function resetSubButtons(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const firstBtn = group.querySelector('.filter-btn');
    if (firstBtn) firstBtn.classList.add('active');
}

/* === 3. Rendering Engine === */
function renderBasedOnLogic() {
    const grid = document.getElementById('teachings-grid');
    if (!grid) return;

    const searchEl = document.getElementById('teaching-search');
    const searchTerm = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const currentLang = localStorage.getItem('language') || 'en';
    const isAr = currentLang === 'ar';

    grid.innerHTML = '';

    const filteredData = allTeachings.filter(item => {
        const matchesMain = currentMainCategory === 'all' || item.type === currentMainCategory;
        const matchesPlatform = currentPlatform === 'all' || item.platform === currentPlatform;
        const title = ((isAr ? item.title.ar : item.title.en) || '').toLowerCase();
        const matchesSearch = !searchTerm || title.includes(searchTerm);

        return matchesMain && matchesPlatform && matchesSearch;
    });

    if (filteredData.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-secondary);">
                <h3>${isAr ? 'لا توجد نتائج مطابقة.' : 'No results found.'}</h3>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();
    filteredData.forEach(item => {
        fragment.appendChild(createCard(item, currentLang));
    });
    grid.appendChild(fragment);
}

/* === 4. Card Creation === */
function createCard(item, lang) {
    const card = document.createElement('div');
    card.className = 'teaching-card';
    card.style.animation = 'fadeInSection 0.35s ease forwards';

    const isAr = lang === 'ar';
    const title = isAr ? item.title.ar : item.title.en;
    const summary = isAr ? item.summary.ar : item.summary.en;

    let badgeClass = 'badge-course';
    let badgeText = isAr ? 'دورة' : 'Course';

    if (item.type === 'seminar') {
        badgeClass = 'badge-seminar';
        badgeText = isAr ? 'ندوة' : 'Seminar';
    }

    if (item.type === 'coupon') {
        if (item.couponType === 'free') {
            badgeClass = 'badge-coupon-free';
            badgeText = isAr ? 'كوبون مجاني' : 'Free Coupon';
        } else {
            badgeClass = 'badge-coupon-discount';
            badgeText = isAr ? 'كوبون خصم' : 'Discount Coupon';
        }
    }

    let platformIcon = '<i class="fas fa-globe"></i>';
    let platformName = 'Other';
    if (item.platform === 'udemy') { platformIcon = '<i class="fas fa-graduation-cap"></i>'; platformName = 'Udemy'; }
    if (item.platform === 'youtube') { platformIcon = '<i class="fab fa-youtube"></i>'; platformName = 'YouTube'; }

    const imageSrc = (item.image && item.image !== '#') ? item.image : FALLBACK_TEACHING_IMAGE;
    const shareTooltip = isAr ? 'مشاركة ونسخ الرابط' : 'Share & Copy Link';

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
                    <i class="fas fa-info-circle"></i> ${isAr ? 'تفاصيل' : 'Details'}
                </a>
                <button class="quick-share-btn" title="${shareTooltip}" onclick="shareTeachingFromCard(${item.id}, event)">
                    <i class="fas fa-share-alt"></i>
                </button>
                <a href="${item.link}" target="_blank" class="teaching-btn teaching-btn-primary">
                    ${item.type === 'coupon' ? (isAr ? 'احصل عليه' : 'Get') : (isAr ? 'سجل' : 'Enroll')}
                </a>
            </div>
        </div>
    `;
    return card;
}

/* === Quick Share from Card === */
window.shareTeachingFromCard = function(itemId, event) {
    if (event) event.stopPropagation();

    const item = allTeachings.find(t => t.id == itemId);
    if (!item) return;

    const currentLang = localStorage.getItem('language') || 'en';
    const isAr = currentLang === 'ar';
    let title = isAr ? item.title.ar : item.title.en;
    let summary = isAr ? item.summary.ar : item.summary.en;

    if (item.type === 'coupon' && item.couponCode) {
        title = `${isAr ? '🎟️ كود خصم: ' : '🎟️ Coupon: '}${item.couponCode} - ${title}`;
        summary = `${isAr ? 'الكود: ' : 'Code: '}${item.couponCode} | ${summary}`;
    }

    const image = (item.image && item.image !== '#') ? item.image : FALLBACK_TEACHING_IMAGE;
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/teachings\/?.*$/, '');
    const shareUrl = `${baseUrl}/teaching-details/teaching-${item.id}.html`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
    }

    if (typeof window.showRichShareToast === 'function') {
        window.showRichShareToast({
            title: title,
            summary: summary,
            image: image,
            url: shareUrl
        });
    }
};

/* === 5. Data Fetching === */
async function fetchTeachings() {
    try {
        let response;
        try {
            response = await fetch('teachings.json?v=2.0');
            if (!response.ok) throw new Error();
        } catch (e) {
            response = await fetch('../teachings.json?v=2.0');
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
        if (homeEn) homeEn.classList.add('hidden');
        if (homeAr) homeAr.classList.remove('hidden');
        const btnAr = document.getElementById('btn-ar');
        const btnEn = document.getElementById('btn-en');
        if (btnAr) btnAr.classList.add('active-lang');
        if (btnEn) btnEn.classList.remove('active-lang');
    } else {
        if (homeAr) homeAr.classList.add('hidden');
        if (homeEn) homeEn.classList.remove('hidden');
        const btnEn = document.getElementById('btn-en');
        const btnAr = document.getElementById('btn-ar');
        if (btnEn) btnEn.classList.add('active-lang');
        if (btnAr) btnAr.classList.remove('active-lang');
    }

    document.querySelectorAll('.en:not(.nav-home-btn)').forEach(el => el.classList.toggle('hidden', isAr));
    document.querySelectorAll('.ar:not(.nav-home-btn)').forEach(el => el.classList.toggle('hidden', !isAr));
}

window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const toggleIcon = document.querySelector('#theme-toggle i');
    if (toggleIcon) toggleIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
};
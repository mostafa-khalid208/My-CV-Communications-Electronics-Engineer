/**
 * Articles Manager - High Performance & Rich Sharing
 * Optimized for instant load with articles-summary.json and smooth pagination
 */

let allArticles = [];
let filteredArticles = [];
let displayedCount = 12;
const PAGE_SIZE = 12;

const FALLBACK_ARTICLE_IMAGE = 'https://i.postimg.cc/bJjPN3Y3/IMG_20251124_054956_985.png';

document.addEventListener('DOMContentLoaded', () => {
    fetchArticles();

    // Debounced Search Input
    const searchInput = document.getElementById('article-search');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const activeBtn = document.querySelector('.filter-btn.active');
                const category = activeBtn ? activeBtn.dataset.filter : 'all';
                filterArticles(category, e.target.value);
            }, 250);
        });
    }

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.dataset.filter;
            const searchTerm = document.getElementById('article-search') ? document.getElementById('article-search').value : '';
            filterArticles(category, searchTerm);
        });
    });
});

/* === Fetch Data from lightweight summary JSON === */
async function fetchArticles() {
    try {
        let response;
        try {
            // Try fetching lightweight summary first
            response = await fetch('articles-summary.json?v=2.0');
            if (!response.ok) throw new Error();
        } catch (e) {
            // Fallback to root or full articles.json
            try {
                response = await fetch('../articles-summary.json?v=2.0');
                if (!response.ok) throw new Error();
            } catch (e2) {
                response = await fetch('articles.json?v=2.0');
            }
        }

        if (!response.ok) throw new Error("Could not fetch articles");
        allArticles = await response.json();
        filteredArticles = allArticles;
        displayedCount = PAGE_SIZE;
        renderArticles(false);
    } catch (error) {
        console.error("Error loading articles:", error);
        const grid = document.getElementById('articles-grid');
        if (grid) {
            grid.innerHTML = `<p style="color:red; text-align:center; grid-column:1/-1;">Failed to load articles.</p>`;
        }
    }
}

/* === Render Articles with Pagination === */
function renderArticles(isAppend = false) {
    const grid = document.getElementById('articles-grid');
    if (!grid) return;

    if (!isAppend) {
        grid.innerHTML = '';
        // Remove existing load more button
        const oldContainer = document.getElementById('articles-load-more-container');
        if (oldContainer) oldContainer.remove();
    }

    const currentLang = localStorage.getItem('language') || 'en';
    const isAr = currentLang === 'ar';
    const noResultsText = isAr ? 'لا توجد مقالات مطابقة.' : 'No articles found.';

    if (filteredArticles.length === 0) {
        grid.innerHTML = `<div class="no-results" style="grid-column:1/-1;">${noResultsText}</div>`;
        return;
    }

    const startIndex = isAppend ? displayedCount - PAGE_SIZE : 0;
    const endIndex = Math.min(displayedCount, filteredArticles.length);
    const articlesToRender = filteredArticles.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    articlesToRender.forEach(article => {
        const card = document.createElement('div');
        card.className = 'article-card glass-effect';
        card.style.animation = 'fadeInSection 0.35s ease forwards';

        const title = isAr ? article.title.ar : article.title.en;
        const summary = isAr ? article.summary.ar : article.summary.en;
        const readMore = isAr ? 'اقرأ المقال' : 'Read Article';
        const shareTooltip = isAr ? 'مشاركة ونسخ الرابط' : 'Share & Copy Link';
        const dateIcon = '<i class="far fa-calendar-alt"></i>';

        const tagsHtml = (article.tags || []).slice(0, 4).map(tag => `<span class="hashtag">#${tag}</span>`).join(' ');
        const imageSrc = (article.image && article.image !== '#') ? article.image : FALLBACK_ARTICLE_IMAGE;
        
        // Canonical share URL with rich metadata
        const articleUrl = `${window.location.origin}${window.location.pathname.replace(/index\.html$/, '')}articles/article-${article.id}.html`;
        const directUrl = `articles/?id=${article.id}`;

        card.innerHTML = `
            <div class="article-img">
                <img src="${imageSrc}" alt="${title}" loading="lazy" onerror="this.src='${FALLBACK_ARTICLE_IMAGE}'; this.onerror=null;">
                <span class="article-category">${formatCategory(article.category)}</span>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="date">${dateIcon} ${article.date || ''}</span>
                </div>
                <h3>${title}</h3>
                <p>${summary}</p>
                <div class="article-tags">${tagsHtml}</div>
                
                <div class="card-bottom-actions">
                    <a href="${directUrl}" class="btn-small">${readMore} <i class="fas fa-arrow-right"></i></a>
                    <button class="quick-share-btn" title="${shareTooltip}" onclick="shareArticleFromCard(${article.id}, event)">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        `;

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);

    // Handle "Load More" button
    updateLoadMoreButton();
}

/* === Load More Button Logic === */
function updateLoadMoreButton() {
    let container = document.getElementById('articles-load-more-container');
    const isAr = localStorage.getItem('language') === 'ar';
    const loadMoreText = isAr ? 'عرض المزيد من المقالات' : 'Load More Articles';
    const remaining = filteredArticles.length - displayedCount;

    if (displayedCount < filteredArticles.length) {
        if (!container) {
            container = document.createElement('div');
            container.id = 'articles-load-more-container';
            container.className = 'load-more-container';
            const grid = document.getElementById('articles-grid');
            if (grid && grid.parentNode) {
                grid.parentNode.insertBefore(container, grid.nextSibling);
            }
        }
        container.innerHTML = `
            <button class="load-more-btn" onclick="loadMoreArticles()">
                <span>${loadMoreText} (${remaining > PAGE_SIZE ? PAGE_SIZE : remaining}+)</span>
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
    } else {
        if (container) container.remove();
    }
}

function loadMoreArticles() {
    displayedCount += PAGE_SIZE;
    renderArticles(true);
}

/* === Filter Logic === */
function filterArticles(category, searchTerm) {
    const term = (searchTerm || '').trim().toLowerCase();
    const currentLang = localStorage.getItem('language') || 'en';

    filteredArticles = allArticles.filter(article => {
        const matchesCategory = category === 'all' || article.category === category;
        if (!matchesCategory) return false;

        if (!term) return true;

        const title = ((currentLang === 'en' ? article.title.en : article.title.ar) || '').toLowerCase();
        const summary = ((currentLang === 'en' ? article.summary.en : article.summary.ar) || '').toLowerCase();
        const tagsString = (article.tags || []).join(' ').toLowerCase();

        return title.includes(term) || summary.includes(term) || tagsString.includes(term);
    });

    displayedCount = PAGE_SIZE;
    renderArticles(false);
}

/* === Quick Share from Card === */
window.shareArticleFromCard = function(articleId, event) {
    if (event) event.stopPropagation();

    const article = allArticles.find(a => a.id == articleId);
    if (!article) return;

    const currentLang = localStorage.getItem('language') || 'en';
    const isAr = currentLang === 'ar';
    const title = isAr ? article.title.ar : article.title.en;
    const summary = isAr ? article.summary.ar : article.summary.en;
    const image = (article.image && article.image !== '#') ? article.image : FALLBACK_ARTICLE_IMAGE;

    // Use pre-rendered share page with full Open Graph support
    const baseUrl = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const shareUrl = `${baseUrl}/articles/article-${article.id}.html`;

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).catch(() => {});
    }

    // Trigger Rich Preview Toast
    if (typeof window.showRichShareToast === 'function') {
        window.showRichShareToast({
            title: title,
            summary: summary,
            image: image,
            url: shareUrl
        });
    }
};

/* === Helper: Format Category Name === */
function formatCategory(cat) {
    const map = {
        'telecommunications': 'Telecom',
        '4G': '4G',
        '5G': '5G',
        '6G': '6G',
        'data_science': 'Data Science',
        'microwaves': 'Microwaves',
        'transmission': 'Transmission',
        'networks': 'Networks',
        'optical': 'Optical Comm',
        'ai': 'AI & ML',
        'programming': 'Dev',
        'technology': 'Tech',
        'cyber_security': 'Security',
        'satellite': 'Satellite',
        'political_economic': 'Pol/Eco',
        'tips_warnings': 'Tips / Warnings',
        'astronomy_space': 'Astronomy / Space',
        "science": 'Science',
        "historical": 'Historical',
        "religious": 'Religious',
        'other': 'Other'
    };
    return map[cat] || cat;
}

/* === Export for main script to call on lang change === */
window.updateArticlesLang = function () {
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.dataset.filter : 'all';
    const searchTerm = document.getElementById('article-search') ? document.getElementById('article-search').value : '';
    filterArticles(category, searchTerm);
};
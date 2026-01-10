let allArticles = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchArticles();

    // Event Listener for Search
    const searchInput = document.getElementById('article-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterArticles(document.querySelector('.filter-btn.active').dataset.filter, e.target.value);
        });
    }

    // Event Listeners for Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');

            const category = btn.dataset.filter;
            const searchTerm = document.getElementById('article-search').value;
            filterArticles(category, searchTerm);
        });
    });
});

/* === Fetch Data from JSON === */
async function fetchArticles() {
    try {
        const response = await fetch('articles.json');
        if (!response.ok) throw new Error("Could not fetch articles");
        allArticles = await response.json();
        renderArticles(allArticles);
    } catch (error) {
        console.error("Error loading articles:", error);
        document.getElementById('articles-grid').innerHTML = `<p style="color:red; text-align:center;">Failed to load articles.</p>`;
    }
}

/* === Render Articles === */
function renderArticles(articles) {
    const grid = document.getElementById('articles-grid');
    grid.innerHTML = ''; // Clear current

    const currentLang = localStorage.getItem('language') || 'en';
    const noResultsText = currentLang === 'en' ? 'No articles found.' : 'لا توجد مقالات مطابقة.';

    if (articles.length === 0) {
        grid.innerHTML = `<div class="no-results">${noResultsText}</div>`;
        return;
    }

    articles.forEach(article => {
        // Create HTML structure for each card
        const card = document.createElement('div');
        card.className = 'article-card glass-effect';
        card.setAttribute('data-aos', 'fade-up');

        // Dynamic Text based on Language
        const title = currentLang === 'en' ? article.title.en : article.title.ar;
        const summary = currentLang === 'en' ? article.summary.en : article.summary.ar;
        const readMore = currentLang === 'en' ? 'Read Article' : 'اقرأ المقال';
        const dateIcon = '<i class="far fa-calendar-alt"></i>';

        // Hashtags HTML
        const tagsHtml = article.tags.map(tag => `<span class="hashtag">${tag}</span>`).join(' ');

        card.innerHTML = `
            <div class="article-img">
                <img src="${article.image}" alt="${title}" loading="lazy">
                <span class="article-category">${formatCategory(article.category)}</span>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span class="date">${dateIcon} ${article.date}</span>
                </div>
                <h3>${title}</h3>
                <p>${summary}</p>
                <div class="article-tags">${tagsHtml}</div>
                <a href="article.html?id=${article.id}" class="btn-small">${readMore} <i class="fas fa-arrow-right"></i></a>
            </div>
        `;

        grid.appendChild(card);
    });
}

/* === Filter Logic === */
function filterArticles(category, searchTerm) {
    const term = searchTerm.toLowerCase();
    const currentLang = localStorage.getItem('language') || 'en';

    const filtered = allArticles.filter(article => {
        // 1. Check Category
        const matchesCategory = category === 'all' || article.category === category;

        // 2. Check Search Term (Title, Summary, Tags)
        const title = (currentLang === 'en' ? article.title.en : article.title.ar).toLowerCase();
        const summary = (currentLang === 'en' ? article.summary.en : article.summary.ar).toLowerCase();
        const tagsString = article.tags.join(' ').toLowerCase();

        const matchesSearch = title.includes(term) || summary.includes(term) || tagsString.includes(term);

        return matchesCategory && matchesSearch;
    });

    renderArticles(filtered);
}

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
    'satellite': 'Satellite',
    'political_economic': 'Pol/Eco',
    'tips_warnings': 'Tips / Warnings',
    'astronomy_space': 'Astronomy / Space',
    "science": 'Science',
    'other': 'Other'
    };
    return map[cat] || cat;
}

/* === Export for main script to call on lang change === */
window.updateArticlesLang = function () {
    // Re-filter with current state to update text language
    const activeBtn = document.querySelector('.filter-btn.active');
    const category = activeBtn ? activeBtn.dataset.filter : 'all';
    const searchTerm = document.getElementById('article-search') ? document.getElementById('article-search').value : '';
    filterArticles(category, searchTerm);
}
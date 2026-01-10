document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');

    if (articleId) {
        loadArticle(articleId);
    } else {
        showError();
    }
});

async function loadArticle(id) {
    try {
        const response = await fetch('articles.json');
        if (!response.ok) throw new Error("Could not fetch articles");
        const articles = await response.json();

        const article = articles.find(a => a.id == id);

        if (article) {
            renderArticleDetails(article);
        } else {
            showError();
        }
    } catch (error) {
        console.error("Error loading article:", error);
        showError();
    }
}

function renderArticleDetails(article) {
    // Hide loading
    document.getElementById('loading-indicator').classList.add('hidden');
    document.getElementById('article-content-wrapper').classList.remove('hidden');

    // Store article data globally to handle language switching
    window.currentArticle = article;

    updateArticleView();
}

function updateArticleView() {
    if (!window.currentArticle) return;

    const article = window.currentArticle;
    const currentLang = localStorage.getItem('language') || 'en';

    // 1. Image
    const img = document.getElementById('art-image');
    img.src = article.image;
    img.alt = currentLang === 'en' ? article.title.en : article.title.ar;

    // 2. Title
    const title = document.getElementById('art-title');
    title.textContent = currentLang === 'en' ? article.title.en : article.title.ar;

    // 3. Category
    const cat = document.getElementById('art-category');
    cat.textContent = formatCategoryName(article.category); // Reuse helper if possible or duplicate simple logic

    // 4. Date
    const date = document.getElementById('art-date');
    date.innerHTML = `<i class="far fa-calendar-alt"></i> ${article.date}`;

    // 5. Tags
    const tagsContainer = document.getElementById('art-tags');
    tagsContainer.innerHTML = article.tags.map(tag => `<span class="hashtag">${tag}</span>`).join(' ');

    // 6. Content (Body)
    const body = document.getElementById('art-body');
    // Check if content exists (it should now), otherwise fallback to summary
    const contentHtml = (article.content && (currentLang === 'en' ? article.content.en : article.content.ar))
        || (currentLang === 'en' ? article.summary.en : article.summary.ar); // Fallback

    body.innerHTML = contentHtml;
}

function showError() {
    document.getElementById('loading-indicator').classList.add('hidden');
    document.getElementById('article-content-wrapper').classList.add('hidden');
    document.getElementById('error-message').classList.remove('hidden');
}

function formatCategoryName(cat) {
    const map = {
        'telecommunications': 'Telecom',
        'networks': 'Networks',
        'ai': 'AI & ML',
        'programming': 'Dev',
        'political_economic': 'Pol/Eco',
        'other': 'Other'
    };
    return map[cat] || cat;
}

// Hook into the global changeLanguage function from scripts.js
// We preserve the original function and add our update logic
// Since scripts.js calls updateArticlesLang, we just ensure it is defined.

window.updateArticlesLang = function () {
    updateArticleView();
}

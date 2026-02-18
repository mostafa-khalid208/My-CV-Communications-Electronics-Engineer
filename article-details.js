/**
 * Article Details Manager - Updated with Fallback Image and MathJax Support
 */

window.currentArticleData = null;
let isArticleLoaded = false;

const FALLBACK_ARTICLE_IMAGE = 'https://i.postimg.cc/bJjPN3Y3/IMG_20251124_054956_985.png';

document.addEventListener('DOMContentLoaded', () => {
    // Keep error hidden initially
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.style.visibility = 'hidden';
        errorEl.style.opacity = '0';
    }
    
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        setTimeout(() => {
            if (!isArticleLoaded) {
                showError("No ID provided in URL");
            }
        }, 500);
        return;
    }

    loadArticle(id);

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeIcon(true);
    }
});

async function loadArticle(id) {
    try {
        // Try fetching from root or parent
        let response;
        try {
            response = await fetch('articles.json');
            if (!response.ok) throw new Error();
        } catch (e) {
            response = await fetch('../articles.json');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const articles = await response.json();
        const article = articles.find(a => a.id == id);

        if (article) {
            isArticleLoaded = true;
            window.currentArticleData = article;
            const currentLang = localStorage.getItem('language') || 'en';
            renderArticleContent(currentLang);
        } else {
            setTimeout(() => {
                if (!isArticleLoaded) {
                    showError("Article not found with ID: " + id);
                }
            }, 500);
        }

    } catch (error) {
        console.error("Error fetching article:", error);
        setTimeout(() => {
            if (!isArticleLoaded) {
                showError("Failed to load data.");
            }
        }, 500);
    }
}

function convertVideoLinksToEmbed(content) {
    if (!content) return content;

    // YouTube
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi,
        '<iframe src="https://www.youtube.com/embed/$1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    );

    // Facebook
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/]+)\/videos\/([0-9]+)/gi,
        '<iframe src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/$1/videos/$2&show_text=false&appId" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'
    );

    content = content.replace(
        /(?:https?:\/\/)?fb\.watch\/([a-zA-Z0-9_-]+)/gi,
        '<iframe src="https://www.facebook.com/plugins/video.php?href=https://fb.watch/$1&show_text=false" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>'
    );

    // TikTok
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/([0-9]+)/gi,
        '<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@$1/video/$2" data-video-id="$2" style="max-width: 605px;min-width: 325px; margin: 20px auto; border-radius: 15px; overflow: hidden;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>'
    );

    content = content.replace(
        /(?:https?:\/\/)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/gi,
        '<blockquote class="tiktok-embed" cite="https://vm.tiktok.com/$1" style="max-width: 605px;min-width: 325px; margin: 20px auto; border-radius: 15px; overflow: hidden;"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>'
    );

    // Instagram
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/gi,
        '<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/$1/" data-instgrm-version="14" style="background:#FFF; border:0; border-radius:15px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 20px auto; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote><script async src="//www.instagram.com/embed.js"></script>'
    );

    // Twitter/X
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([^\/]+)\/status\/([0-9]+)/gi,
        '<blockquote class="twitter-tweet" data-theme="dark" style="margin: 20px auto; border-radius: 15px;"><a href="https://twitter.com/$1/status/$2"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
    );

    // Threads
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?threads\.net\/@([^\/]+)\/post\/([a-zA-Z0-9_-]+)/gi,
        '<blockquote class="text-post-media" data-text-post-permalink="https://www.threads.net/@$1/post/$2" style="background:#FFF; border:0; border-radius:15px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 20px auto; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"></blockquote><script async src="https://www.threads.net/embed.js"></script>'
    );

    // Vimeo
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/gi,
        '<iframe src="https://player.vimeo.com/video/$1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="width:100%; max-width:700px; height:400px; margin:20px auto; display:block; border-radius:15px;"></iframe>'
    );

    // Udemy - Protect existing <a> tags, then convert bare URLs only
    // Step 1: Protect existing <a href="...udemy...">...</a> tags
    const udemyProtected = [];
    content = content.replace(/<a\b[^>]*href\s*=\s*["'][^"']*udemy\.com[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, (match) => {
        const ph = `___UDEMY_LINK_${udemyProtected.length}___`;
        udemyProtected.push(match);
        return ph;
    });

    // Step 2: Convert bare Udemy URLs (not inside HTML attributes)
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?udemy\.com\/course\/([^\s"'<>]+)/gi,
        (match) => {
            const fullUrl = match.startsWith('http') ? match : 'https://' + match;
            return `<div style="border: 2px solid var(--accent-color); border-radius: 15px; padding: 20px; margin: 20px auto; max-width: 700px; text-align: center;"><i class="fas fa-graduation-cap" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 10px;"></i><p style="margin: 10px 0;"><strong>Udemy Course</strong></p><a href="${fullUrl}" target="_blank" class="btn-small" style="display: inline-block; margin-top: 10px;">View Course on Udemy</a></div>`;
        }
    );

    // Step 3: Restore protected links
    udemyProtected.forEach((original, i) => {
        content = content.replace(`___UDEMY_LINK_${i}___`, original);
    });

    return content;
}

function renderArticleContent(lang) {
    if (!window.currentArticleData) return;

    const data = window.currentArticleData;
    const isAr = lang === 'ar';

    // Hide loading and error, show article
    hideLoading();
    hideError();
    showArticle();

    const imgEl = document.getElementById('art-img');
    const titleEl = document.getElementById('art-title');
    const dateEl = document.getElementById('art-date');
    const catEl = document.getElementById('art-cat') || document.getElementById('art-category');
    const bodyContainer = document.getElementById('art-body');
    const tagsContainer = document.getElementById('art-tags');

    if (imgEl) {
        imgEl.src = data.image || FALLBACK_ARTICLE_IMAGE;
        imgEl.onerror = function () {
            this.src = FALLBACK_ARTICLE_IMAGE;
            this.onerror = null;
        };
    }

    if (titleEl) titleEl.innerText = isAr ? data.title.ar : data.title.en;

    if (dateEl) {
        dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> ${data.date}`;
    }

    if (catEl) {
        catEl.innerText = data.category.toUpperCase();
    }

    if (bodyContainer) {
        let content = isAr ? (data.content?.ar || data.summary.ar) : (data.content?.en || data.summary.en);
        content = convertVideoLinksToEmbed(content);
        bodyContainer.innerHTML = content;
        bodyContainer.style.direction = isAr ? 'rtl' : 'ltr';
        bodyContainer.style.textAlign = isAr ? 'right' : 'left';
        bodyContainer.style.fontFamily = isAr ? "'Cairo', sans-serif" : "'Poppins', sans-serif";
        
        // Trigger MathJax to render equations after content is loaded
        if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise([bodyContainer]).catch((err) => {
                console.error('MathJax rendering error:', err);
            });
        }
    }

    if (tagsContainer) {
        tagsContainer.innerHTML = data.tags.map(t => `<span class="hashtag">${t}</span>`).join(' ');
    }

    document.body.dir = isAr ? 'rtl' : 'ltr';
    document.body.lang = lang;

    document.querySelectorAll('.en').forEach(el => el.classList.toggle('hidden', isAr));
    document.querySelectorAll('.ar').forEach(el => el.classList.toggle('hidden', !isAr));

    const btnEn = document.getElementById('btn-en');
    const btnAr = document.getElementById('btn-ar');
    if (btnEn) btnEn.classList.toggle('active-lang', !isAr);
    if (btnAr) btnAr.classList.toggle('active-lang', isAr);
}

function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator') || document.getElementById('loading');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
        loadingIndicator.style.display = 'none';
    }
}

function hideError() {
    const error = document.getElementById('error-message') || document.getElementById('error-msg');
    if (error) {
        error.classList.add('hidden');
        error.classList.remove('show-error');
        error.style.display = 'none';
        error.style.visibility = 'hidden';
        error.style.opacity = '0';
    }
}

function showArticle() {
    const articleWrapper = document.getElementById('article-content-wrapper') || document.getElementById('article-content');
    if (articleWrapper) {
        articleWrapper.classList.remove('hidden');
        articleWrapper.style.display = 'block';
        articleWrapper.style.visibility = 'visible';
    }
}

function showError(msg) {
    hideLoading();
    
    const articleWrapper = document.getElementById('article-content-wrapper') || document.getElementById('article-content');
    if (articleWrapper) {
        articleWrapper.classList.add('hidden');
        articleWrapper.style.display = 'none';
    }
    
    const error = document.getElementById('error-message') || document.getElementById('error-msg');
    if (error) {
        error.classList.remove('hidden');
        error.classList.add('show-error');
        error.style.display = 'block';
        error.style.visibility = 'visible';
        error.style.opacity = '1';
    }
    
    console.error("Article Error: ", msg);
}

window.changeLanguage = function (lang) {
    localStorage.setItem('language', lang);
    if (window.currentArticleData) {
        renderArticleContent(lang);
    }

    if (typeof window.updateGlobalUI === 'function') {
        window.updateGlobalUI(lang);
    }
};

window.switchArticleLang = window.changeLanguage;

window.toggleTheme = function () {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
};

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}
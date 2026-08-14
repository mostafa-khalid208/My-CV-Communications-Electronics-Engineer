/**
 * Teaching Details Manager - Updated with Rich Previews, Dynamic Meta, and Fallback Image
 */

window.currentTeachingData = null;

const FALLBACK_TEACHING_IMAGE = 'https://i.postimg.cc/8z5PqKsM/Picsart_26_01_14_23_40_58_850.png';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        showError("No ID provided");
        return;
    }

    loadTeaching(id);

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        updateThemeIcon(true);
    }
});

async function loadTeaching(id) {
    try {
        let response;
        try {
            response = await fetch('teachings.json?v=2.0');
            if (!response.ok) throw new Error();
        } catch (e) {
            response = await fetch('../teachings.json?v=2.0');
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const teachings = await response.json();
        const teaching = teachings.find(t => t.id == id);

        if (teaching) {
            window.currentTeachingData = teaching;
            const currentLang = localStorage.getItem('language') || 'en';
            renderTeachingDetails(currentLang);
            updateTeachingMetaTags(teaching, currentLang);
        } else {
            showError("Teaching not found with ID: " + id);
        }
    } catch (error) {
        console.error("Error fetching teaching:", error);
        showError("Failed to load data.");
    }
}

function updateTeachingMetaTags(item, lang) {
    const isAr = lang === 'ar';
    let title = (isAr ? item.title.ar : item.title.en) || 'Teaching Details';
    let summary = (isAr ? item.summary.ar : item.summary.en) || '';
    
    if (item.type === 'coupon' && item.couponCode) {
        title = `${isAr ? '🎟️ كود خصم: ' : '🎟️ Coupon: '}${item.couponCode} - ${title}`;
        summary = `${isAr ? 'الكود: ' : 'Code: '}${item.couponCode} | ${summary}`;
    }

    const image = (item.image && item.image !== '#') ? item.image : FALLBACK_TEACHING_IMAGE;
    const url = window.location.href;

    document.title = `${title} | MKS.Tech`;

    const setMeta = (name, value, isProperty = false) => {
        const attr = isProperty ? 'property' : 'name';
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attr, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', value);
    };

    setMeta('description', summary);
    setMeta('og:title', title, true);
    setMeta('og:description', summary, true);
    setMeta('og:image', image, true);
    setMeta('og:url', url, true);
    setMeta('twitter:title', title);
    setMeta('twitter:description', summary);
    setMeta('twitter:image', image);
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

    // Vimeo
    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/gi,
        '<iframe src="https://player.vimeo.com/video/$1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
    );

    // Udemy
    const udemyProtected = [];
    content = content.replace(/<a\b[^>]*href\s*=\s*["'][^"']*udemy\.com[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, (match) => {
        const ph = `___UDEMY_LINK_${udemyProtected.length}___`;
        udemyProtected.push(match);
        return ph;
    });

    content = content.replace(
        /(?:https?:\/\/)?(?:www\.)?udemy\.com\/course\/([^\s"'<>]+)/gi,
        (match) => {
            const fullUrl = match.startsWith('http') ? match : 'https://' + match;
            return `<div style="border: 2px solid var(--accent-color); border-radius: 15px; padding: 20px; margin: 20px auto; max-width: 700px; text-align: center;"><i class="fas fa-graduation-cap" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 10px;"></i><p style="margin: 10px 0;"><strong>Udemy Course</strong></p><a href="${fullUrl}" target="_blank" class="btn-small" style="display: inline-block; margin-top: 10px;">View Course on Udemy</a></div>`;
        }
    );

    udemyProtected.forEach((original, i) => {
        content = content.replace(`___UDEMY_LINK_${i}___`, original);
    });

    return content;
}

function renderTeachingDetails(lang) {
    if (!window.currentTeachingData) return;

    const data = window.currentTeachingData;
    const isAr = lang === 'ar';

    const loading = document.getElementById('loading-indicator');
    if (loading) {
        loading.classList.add('hidden');
        loading.style.display = 'none';
    }

    const wrapper = document.getElementById('teaching-details-wrapper');
    if (wrapper) {
        wrapper.classList.remove('hidden');
        wrapper.style.display = 'block';
    }

    // 1. Image with Fallback
    const img = document.getElementById('detail-img');
    if (img) {
        img.src = data.image || FALLBACK_TEACHING_IMAGE;
        img.onerror = function () {
            this.src = FALLBACK_TEACHING_IMAGE;
            this.onerror = null;
        };
    }

    // 2. Title
    const title = document.getElementById('detail-title');
    if (title) title.innerText = isAr ? data.title.ar : data.title.en;

    // 3. Badges
    const badgesContainer = document.getElementById('detail-badges');
    if (badgesContainer) {
        let badgeClass = 'badge-course';
        let badgeText = isAr ? 'دورة' : 'Course';

        if (data.type === 'seminar') {
            badgeClass = 'badge-seminar';
            badgeText = isAr ? 'ندوة' : 'Seminar';
        } else if (data.type === 'coupon') {
            badgeClass = 'badge-coupon';
            badgeText = isAr ? 'كوبون مجاني' : 'Free Coupon';
        }

        let platformText = data.platform ? data.platform.toUpperCase() : '';
        if (data.platform === 'other') {
            platformText = isAr ? 'أخرى' : 'Other';
        }

        badgesContainer.innerHTML = `
            <span class="detail-badge ${badgeClass}">${badgeText}</span>
            <span class="detail-badge" style="background: #4a5568; color: #fff;">${platformText}</span>
        `;
    }

    // 4. Meta Information
    const metaContainer = document.getElementById('detail-meta');
    if (metaContainer) {
        let metaHTML = '';

        if (data.rating) {
            metaHTML += `
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>${data.rating} ${isAr ? 'تقييم' : 'Rating'}</span>
                </div>
            `;
        }

        if (data.students) {
            metaHTML += `
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${data.students.toLocaleString()} ${isAr ? 'طالب' : 'Students'}</span>
                </div>
            `;
        }

        if (data.attendees) {
            metaHTML += `
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${data.attendees.toLocaleString()} ${isAr ? 'حضور' : 'Attendees'}</span>
                </div>
            `;
        }

        if (data.duration) {
            metaHTML += `
                <div class="meta-item">
                    <i class="far fa-clock"></i>
                    <span>${data.duration}</span>
                </div>
            `;
        }

        if (data.date) {
            metaHTML += `
                <div class="meta-item">
                    <i class="far fa-calendar"></i>
                    <span>${data.date}</span>
                </div>
            `;
        }

        metaContainer.innerHTML = metaHTML;
    }

    // 5. Price Section 
    const priceContainer = document.getElementById('detail-price');
    if (priceContainer) {
        if (data.price) {
            priceContainer.innerHTML = `
                <span class="price-large">${data.price.current}</span>
                ${data.price.original ? `<span class="price-original-large">${data.price.original}</span>` : ''}
            `;
        } else {
            priceContainer.innerHTML = '';
        }
    }

    // 6. Coupon Section 
    const couponSection = document.getElementById('coupon-section');
    if (couponSection) {
        if (data.type === 'coupon') {
            couponSection.innerHTML = `
                <div class="coupon-section">
                    <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 10px;">
                        ${isAr ? '🎉 كوبون محدود!' : '🎉 Limited Coupon!'}
                    </div>
                    <div class="coupon-code-large">${data.couponCode}</div>
                    <div class="coupon-info">
                        ${data.validUntil ? `
                        <div class="coupon-info-item">
                            <strong>${isAr ? 'صالح حتى' : 'Valid Until'}:</strong><br>
                            ${data.validUntil}
                        </div>
                        ` : ''}
                        ${data.spotsLeft ? `
                        <div class="coupon-info-item" style="color: #ff6b6b;">
                            <strong>${isAr ? 'الأماكن المتبقية' : 'Spots Left'}:</strong><br>
                            ${data.spotsLeft}
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
        } else {
            couponSection.innerHTML = '';
        }
    }

    // 7. Actions with Print & Share Buttons
    const actionsContainer = document.getElementById('detail-actions');
    if (actionsContainer) {
        const enrollText = data.type === 'coupon' ?
            (isAr ? 'احصل على الكوبون' : 'Get Coupon') :
            (isAr ? 'سجل الآن' : 'Enroll Now');

        actionsContainer.innerHTML = `
            <button class="action-btn" onclick="window.print()">
                <i class="fas fa-print"></i>
                <span class="en">Print</span>
                <span class="ar hidden">طباعة</span>
            </button>
            <button class="action-btn" onclick="shareOnFacebook()">
                <i class="fab fa-facebook"></i>
                <span class="en">Share</span>
                <span class="ar hidden">مشاركة</span>
            </button>
            <button class="action-btn" onclick="shareOnTwitter()">
                <i class="fab fa-twitter"></i>
                <span class="en">Tweet</span>
                <span class="ar hidden">تغريد</span>
            </button>
            <button class="action-btn" onclick="shareOnWhatsApp()">
                <i class="fab fa-whatsapp"></i>
                <span class="en">WhatsApp</span>
                <span class="ar hidden">واتساب</span>
            </button>
            <button class="action-btn" onclick="copyLink()">
                <i class="fas fa-link"></i>
                <span class="en">Copy Link</span>
                <span class="ar hidden">نسخ الرابط</span>
            </button>
            <a href="${data.link}" target="_blank" class="action-btn action-btn-primary">
                <i class="fas fa-external-link-alt"></i>
                ${enrollText}
            </a>
        `;
    }

    // 8. Description
    const descContainer = document.getElementById('detail-description');
    if (descContainer) {
        let content = isAr ? data.description.ar : data.description.en;
        content = convertVideoLinksToEmbed(content);
        descContainer.innerHTML = content;
        descContainer.style.direction = isAr ? 'rtl' : 'ltr';
        descContainer.style.textAlign = isAr ? 'right' : 'left';
    }

    // 9. Tags
    const tagsContainer = document.getElementById('detail-tags');
    if (tagsContainer && data.tags) {
        tagsContainer.innerHTML = data.tags.map(tag =>
            `<span class="teaching-tag-large">${tag}</span>`
        ).join('');
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

// === Canonical Share URL ===
function getCanonicalShareUrl() {
    if (!window.currentTeachingData) return window.location.href;
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/teaching-details\/?.*$/, '');
    return `${origin}${path}/teaching-details/teaching-${window.currentTeachingData.id}.html`;
}

// === Share Functions ===
window.shareOnFacebook = function() {
    const url = encodeURIComponent(getCanonicalShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
};

window.shareOnTwitter = function() {
    const url = encodeURIComponent(getCanonicalShareUrl());
    const data = window.currentTeachingData;
    const isAr = localStorage.getItem('language') === 'ar';
    let title = data ? (isAr ? data.title.ar : data.title.en) : document.title;
    if (data?.type === 'coupon' && data?.couponCode) {
        title = `🎟️ ${data.couponCode}: ${title}`;
    }
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${encodeURIComponent(title)}`, '_blank', 'width=600,height=400');
};

window.shareOnWhatsApp = function() {
    const url = encodeURIComponent(getCanonicalShareUrl());
    const data = window.currentTeachingData;
    const isAr = localStorage.getItem('language') === 'ar';
    let title = data ? (isAr ? data.title.ar : data.title.en) : document.title;
    if (data?.type === 'coupon' && data?.couponCode) {
        title = `🎟️ ${data.couponCode}: ${title}`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(title)}%20${url}`, '_blank');
};

window.copyLink = function() {
    const shareUrl = getCanonicalShareUrl();
    const data = window.currentTeachingData;
    const isAr = localStorage.getItem('language') === 'ar';
    let title = data ? (isAr ? data.title.ar : data.title.en) : document.title;
    let summary = data ? (isAr ? data.summary.ar : data.summary.en) : '';

    if (data?.type === 'coupon' && data?.couponCode) {
        title = `${isAr ? '🎟️ كود خصم: ' : '🎟️ Coupon: '}${data.couponCode} - ${title}`;
        summary = `${isAr ? 'كود الكوبون: ' : 'Coupon Code: '}${data.couponCode} | ${summary}`;
    }

    const image = data?.image || FALLBACK_TEACHING_IMAGE;

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
    } else {
        alert(isAr ? '✅ تم نسخ الرابط بنجاح!' : '✅ Link copied!');
    }
};

// Global functions
window.changeLanguage = function (lang) {
    localStorage.setItem('language', lang);
    if (window.currentTeachingData) {
        renderTeachingDetails(lang);
        updateTeachingMetaTags(window.currentTeachingData, lang);
    }
};

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

function showError(msg) {
    const loading = document.getElementById('loading-indicator');
    const error = document.getElementById('error-message');
    const wrapper = document.getElementById('teaching-details-wrapper');

    if (loading) {
        loading.classList.add('hidden');
        loading.style.display = 'none';
    }
    if (wrapper) {
        wrapper.classList.add('hidden');
    }
    if (error) {
        error.classList.remove('hidden');
        error.style.display = 'block';
    }
    console.error("Teaching Error: ", msg);
}
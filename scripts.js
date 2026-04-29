document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Animations
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        offset: 100,
        disable: false
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
    
    // 5. URL Cleanup (Remove index.html)
    if (window.location.pathname.endsWith('index.html')) {
        const newPath = window.location.pathname.replace(/index\.html$/, '');
        window.history.replaceState(null, '', newPath);
    }

    // 6. Initialize smooth scroll behavior
    initSmoothScroll();
    
    // 7. Add scroll animations
    initScrollAnimations();

    // 8. Initialize touch gestures for mobile
    initMobileGestures();

    // 9. Initialize Holographic Touch Glow
    initTouchGlow();
});

/* === Smooth Scroll Initialization === */
function initSmoothScroll() {
    document.documentElement.style.scrollBehavior = 'smooth';
}

/* === Scroll Animations === */
function initScrollAnimations() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        const scrolled = window.scrollY > 50;
        
        if (scrolled) {
            navbar.style.boxShadow = 'var(--card-shadow)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
}

/* === Mobile Gestures === */
function initMobileGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            // Swiped left
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.getElementById('mobile-menu-btn');
        if (sidebar && sidebar.classList.contains('active-mobile')) {
            sidebar.classList.remove('active-mobile');
            menuBtn?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

/* === Language Switcher === */
function changeLanguage(lang) {
    document.body.lang = lang;
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', lang);

    // Toggle Visibility with animation
    document.querySelectorAll('.en').forEach(el => {
        if (lang !== 'en') {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });
    document.querySelectorAll('.ar').forEach(el => {
        if (lang !== 'ar') {
            el.classList.add('hidden');
        } else {
            el.classList.remove('hidden');
        }
    });

    // Update Buttons Style
    const btnEn = document.getElementById('btn-en');
    const btnAr = document.getElementById('btn-ar');
    if (btnEn) btnEn.classList.toggle('active-lang', lang === 'en');
    if (btnAr) btnAr.classList.toggle('active-lang', lang === 'ar');

    // Update Articles if function exists
    if (typeof window.updateArticlesLang === 'function') {
        window.updateArticlesLang();
    }

    // Re-init Typed.js for new language
    initTyped(lang);
    
    // Refresh AOS animations
    AOS.refresh();
}

/* === Typed.js Setup with Enhanced Cursor === */
let typedInstance;
function initTyped(lang) {
    if (typedInstance) { 
        typedInstance.destroy(); 
    }

    const stringsEn = [
        "Communications and Electronics Engineer (ECE Engineer)",
        "Jr. Flutter Developer",
        "Jr. Machine Learning Engineer",
        "Courses Instructor on Udemy"
    ];
    const stringsAr = [
        "مهندس اتصالات وإلكترونيات",
        "مطور Flutter مبتدئ",
        "مهندس تعلم آلي مبتدئ",
        "مدرب كورسات على يوديمي"
    ];

    const targetSelector = lang === 'en' ? '.typed-text-en' : '.typed-text-ar';
    if (document.querySelector(targetSelector)) {
        typedInstance = new Typed(targetSelector, {
            strings: lang === 'en' ? stringsEn : stringsAr,
            typeSpeed: 50,
            backSpeed: 30,
            loop: true,
            showCursor: true,
            cursorChar: '|',
            contentType: 'text'
        });
    }
}

/* === Theme Toggle with Smooth Transition === */
function toggleTheme() {
    const htmlElement = document.documentElement;
    htmlElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
    
    // Refresh animations after theme change
    setTimeout(() => AOS.refresh(), 150);
}

function updateThemeIcon(isDark) {
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
        icon.style.transition = 'transform 0.3s ease';
        icon.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            icon.style.transform = 'rotate(0deg)';
        }, 150);
    }
}

/* === Enhanced Navigation Logic === */
function showSection(sectionId) {
    // Hide all sections with staggered animation
    const sections = document.querySelectorAll('.content-card');
    sections.forEach((sec, index) => {
        sec.classList.add('hidden');
        sec.classList.remove('active-section');
    });

    // Show target section with animation
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('active-section');
        
        // Trigger Animation refresh after a short delay
        setTimeout(() => {
            AOS.refresh();
        }, 100);
    }

    // Update Sidebar Active State
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // Highlight current link
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // Close mobile menu if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('active-mobile');
    }

    // Smooth Scroll to top
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

/* === Mobile Menu Toggle === */
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (sidebar && menuBtn) {
        sidebar.classList.toggle('active-mobile');
        menuBtn.classList.toggle('active');
        
        // Lock body scroll when menu is open
        document.body.style.overflow = sidebar.classList.contains('active-mobile') ? 'hidden' : '';
    }
}

/* === Enhanced Security Features (Privacy) === */
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

    // Disable dragging of images
    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

    // Disable text selection for security (optional - can be commented out)
    // document.body.style.userSelect = 'none';
}

/* === Global Click Listener for Clean URLs === */
document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (link && link.getAttribute('href') === '#') {
        e.preventDefault();
    }
});

/* === Add scroll to top button functionality === */
window.addEventListener('scroll', () => {
    const scrollToTopBtn = document.getElementById('scroll-to-top');
    if (scrollToTopBtn) {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
            scrollToTopBtn.style.animation = 'slideInUp 0.3s ease-out';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }
});

/* === Futuristic Background & Animations === */
document.addEventListener('DOMContentLoaded', () => {
    initThreeJsBackground();
    initFuturisticAnimations();
});

function initThreeJsBackground() {
    const container = document.getElementById('webgl-container');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const isLightMode = localStorage.getItem('theme') !== 'dark' && !document.body.classList.contains('dark');
    const particleColor = isLightMode ? 0x0066cc : 0x00d4d4;

    const particlesGeometry = new THREE.BufferGeometry();
    let particlesCount = 1200;
    if (window.innerWidth < 480) particlesCount = 300;
    else if (window.innerWidth < 768) particlesCount = 600;
    
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 15;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: particleColor,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 5;

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
        mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
    });

    // Handle theme toggle particle color updates
    const observer = new MutationObserver(() => {
        const light = !document.body.classList.contains('dark');
        particlesMaterial.color.setHex(light ? 0x0066cc : 0x00d4d4);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    function animate() {
        requestAnimationFrame(animate);
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.001;
        
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
        
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function initFuturisticAnimations() {
    if(typeof gsap === 'undefined') return;
    
    // Add magnetic effect to specific icons and buttons
    const magneticElements = document.querySelectorAll('.icon-btn, .contact-item i, .cert-card i');
    
    magneticElements.forEach(elem => {
        elem.addEventListener('mousemove', (e) => {
            const rect = elem.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(elem, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        elem.addEventListener('mouseleave', () => {
            gsap.to(elem, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.3)'
            });
        });
    });
}

/* === Holographic Data Vault for PDFs and Links === */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject Data Vault HTML into body
    const vaultHTML = `
    <div class="modal-overlay hidden" id="data-vault-modal">
        <div class="data-vault">
            <div class="vault-header">
                <div class="vault-title"><i class="fas fa-shield-alt" style="color:var(--accent-primary)"></i> <span id="vault-title-text" style="color:var(--accent-primary); letter-spacing:2px; text-transform:uppercase;">Secure Data Link</span></div>
                <div style="display:flex; gap: 15px; align-items:center;">
                    <a href="#" id="vault-external-btn" target="_blank" class="btn-outline" style="padding: 4px 10px; font-size: 0.8rem;">
                        <i class="fas fa-external-link-alt"></i> <span class="en">Open Externally</span><span class="ar hidden">فتح بالخارج</span>
                    </a>
                    <button class="vault-close" id="vault-close"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="vault-content" style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden;" id="vault-iframe-container">
                <iframe id="vault-iframe" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none; border-radius:8px;" src="" title="Data Viewer"></iframe>
            </div>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', vaultHTML);

    const vaultModal = document.getElementById('data-vault-modal');
    const vaultIframe = document.getElementById('vault-iframe');
    const vaultExternalBtn = document.getElementById('vault-external-btn');
    const vaultClose = document.getElementById('vault-close');

    // 2. Intercept links meant to open in new tabs
    const links = document.querySelectorAll('a[target="_blank"]');
    links.forEach(link => {
        if (link.id === 'vault-external-btn') return; // Do not intercept the external button
        
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href) {
                e.preventDefault();
                openVault(href);
            }
        });
    });

    function openVault(url) {
        let embedUrl = url;
        
        // Fix Google Drive File iframe access issue
        if (embedUrl.includes('drive.google.com/file/') && embedUrl.includes('/view')) {
            embedUrl = embedUrl.replace('/view', '/preview');
            embedUrl = embedUrl.split('?')[0]; 
        }
        
        // Fix Google Drive Folder iframe access issue (CV Link)
        if (embedUrl.includes('drive.google.com/drive/') || embedUrl.includes('drive.google.com/folders/')) {
            // Extract the folder ID
            const matches = embedUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
            if (matches && matches[1]) {
                embedUrl = `https://drive.google.com/embeddedfolderview?id=${matches[1]}#grid`;
            }
        }
        
        vaultIframe.src = embedUrl;
        vaultExternalBtn.href = url; // Set original URL to the external button

        vaultModal.classList.remove('hidden');
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo('.data-vault', 
                { scale: 0.8, opacity: 0, rotationX: 45 }, 
                { scale: 1, opacity: 1, rotationX: 0, duration: 0.6, ease: "back.out(1.7)" }
            );
            gsap.fromTo('.modal-overlay',
                { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" },
                { backdropFilter: "blur(10px)", backgroundColor: "rgba(0,0,0,0.8)", duration: 0.4 }
            );
        }
    }

    function closeVault() {
        if (typeof gsap !== 'undefined') {
            gsap.to('.data-vault', { scale: 0.8, opacity: 0, rotationX: -45, duration: 0.4, ease: "power2.in" });
            gsap.to('.modal-overlay', { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)", duration: 0.4, onComplete: () => {
                vaultModal.classList.add('hidden');
                vaultIframe.src = '';
            }});
        } else {
            vaultModal.classList.add('hidden');
            vaultIframe.src = '';
        }
    }

    vaultClose.addEventListener('click', closeVault);
    vaultModal.addEventListener('click', (e) => {
        if (e.target === vaultModal) closeVault();
    });
});

/* === Holographic Touch Glow === */
function initTouchGlow() {
    const glow = document.createElement('div');
    glow.className = 'touch-glow';
    document.body.appendChild(glow);

    document.addEventListener('touchstart', (e) => {
        glow.style.opacity = '1';
        updateGlowPos(e.touches[0]);
    });

    document.addEventListener('touchmove', (e) => {
        updateGlowPos(e.touches[0]);
    });

    document.addEventListener('touchend', () => {
        glow.style.opacity = '0';
    });

    function updateGlowPos(touch) {
        glow.style.left = `${touch.clientX - 75}px`;
        glow.style.top = `${touch.clientY - 75}px`;
    }
}
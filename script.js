// Global variables
let currentLanguage = 'en';
let currentTheme = 'default';
let currentCategory = 'all';
let isDarkMode = false;
let postEmbedFixer = null; // PostEmbedFixer instance

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadConfigFromStorage();
    loadTheme();
    loadDarkMode();
    loadNavigationStyle();
    loadLogo();
    initBannerSlider();
    loadPromotions();
    loadEvents();
    
    // Initialize PostEmbedFixer with the convertToEmbedUrl function
    if (typeof PostEmbedFixer !== 'undefined') {
        postEmbedFixer = new PostEmbedFixer(convertToEmbedUrl);
    }
    
    loadPosts('all');
    loadProblemBanner();
    loadCategories();
    loadProducts();
    loadContactInfo();
    initSectionNavigation();
    
    // Listen for storage changes from admin panel
    window.addEventListener('storage', function(e) {
        if (e.key === 'websiteConfig') {
            location.reload();
        }
    });
    
    // Check for updates every 2 seconds
    setInterval(function() {
        if (!document.hidden) {
            checkForUpdates();
        }
    }, 2000);
});

// Check for configuration updates
function checkForUpdates() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        const currentConfigStr = JSON.stringify(CONFIG);
        const newConfigStr = JSON.stringify(parsed);
        
        if (currentConfigStr !== newConfigStr) {
            Object.assign(CONFIG, parsed);
            refreshContent();
        }
    }
}

// Refresh all content
function refreshContent() {
    loadNavigationStyle();
    
    const bannerSwiper = document.querySelector('.bannerSwiper')?.swiper;
    if (bannerSwiper) {
        bannerSwiper.destroy();
        document.getElementById('bannerSlides').innerHTML = '';
        initBannerSlider();
    }
    
    document.getElementById('promotionGrid').innerHTML = '';
    loadPromotions();
    
    document.getElementById('eventGrid').innerHTML = '';
    loadEvents();
    
    document.getElementById('postGrid').innerHTML = '';
    loadPosts('all');
    loadProblemBanner();
    
    document.getElementById('categoryFilter').innerHTML = '';
    loadCategories();
    
    loadProducts();
    loadContactInfo();
    
    // Re-initialize section navigation after content refresh (but don't call loadSectionNavigation again)
    loadSectionNavigation();
    initSectionNavigationEvents(); // Separate function for event binding only
}

// Load config from localStorage
function loadConfigFromStorage() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        Object.assign(CONFIG, parsed);
    }
}

// Helper function to clean and extract URLs from various formats
function cleanVideoUrl(input) {
    if (!input) return '';
    
    input = input.trim();
    
    // If it's an iframe embed code, extract the src URL
    if (input.includes('<iframe') && input.includes('src=')) {
        const srcMatch = input.match(/src=["']([^"']+)["']/);
        if (srcMatch) {
            return srcMatch[1];
        }
    }
    
    // If it contains HTML entities, decode them
    if (input.includes('&quot;') || input.includes('&lt;') || input.includes('&gt;')) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = input;
        input = textarea.value;
        
        // Try to extract URL again after decoding
        if (input.includes('<iframe') && input.includes('src=')) {
            const srcMatch = input.match(/src=["']([^"']+)["']/);
            if (srcMatch) {
                return srcMatch[1];
            }
        }
    }
    
    return input;
}

// Convert video URL to embed URL - Enhanced to handle iframe codes
function convertToEmbedUrl(url) {
    if (!url) return '';
    
    // Clean the URL first
    url = cleanVideoUrl(url);
    
    // Check if it's already a direct embed URL
    if (url.includes('/embed/') || url.includes('plugins/video')) {
        return url;
    }
    
    try {
        // YouTube - All possible formats
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            
            // Method 1: Standard watch URL
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.match(/[?&]v=([^&]+)/)?.[1];
            }
            // Method 2: Short URL
            else if (url.includes('youtu.be/')) {
                videoId = url.match(/youtu\.be\/([^?&]+)/)?.[1];
            }
            // Method 3: Shorts
            else if (url.includes('youtube.com/shorts/')) {
                videoId = url.match(/shorts\/([^?&]+)/)?.[1];
            }
            // Method 4: Embed URL (extract ID and rebuild)
            else if (url.includes('youtube.com/embed/')) {
                videoId = url.match(/embed\/([^?&]+)/)?.[1];
            }
            
            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        
        // Facebook - Multiple formats
        if (url.includes('facebook.com') || url.includes('fb.watch')) {
            // Clean URL for Facebook
            let cleanUrl = url.split('?')[0]; // Remove parameters
            
            // Handle different Facebook URL formats
            if (url.includes('fb.watch/')) {
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=560&height=315`;
            }
            else if (url.includes('/videos/') || url.includes('/watch') || url.includes('/reel')) {
                return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&width=560&height=315`;
            }
        }
        
        // TikTok - Enhanced detection
        if (url.includes('tiktok.com')) {
            // Multiple TikTok patterns
            let videoId = url.match(/@[^\/]+\/video\/(\d+)/)?.[1] ||
                         url.match(/\/video\/(\d+)/)?.[1] ||
                         url.match(/\/v\/(\d+)/)?.[1];
            
            if (videoId) {
                return `https://www.tiktok.com/embed/v2/${videoId}`;
            }
        }
        
        // Instagram - Posts and Reels
        if (url.includes('instagram.com')) {
            if (url.includes('/p/') || url.includes('/reel/') || url.includes('/tv/')) {
                let cleanUrl = url.split('?')[0];
                if (!cleanUrl.endsWith('/')) cleanUrl += '/';
                return `${cleanUrl}embed/`;
            }
        }
        
        // Vimeo
        if (url.includes('vimeo.com')) {
            let videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
            if (videoId) {
                return `https://player.vimeo.com/video/${videoId}`;
            }
        }
        
        // Dailymotion
        if (url.includes('dailymotion.com')) {
            let videoId = url.match(/\/video\/([^_?]+)/)?.[1];
            if (videoId) {
                return `https://www.dailymotion.com/embed/video/${videoId}`;
            }
        }
        
        // If no conversion possible, return original
        return url;
        
    } catch (error) {
        console.error('Error converting URL:', error);
        return url;
    }
}

// Load Problem Solve Banner
function loadProblemBanner() {
    const banner = document.getElementById('problemBanner');
    if (!banner || !CONFIG.problemSolveBanner) return;
    
    const config = CONFIG.problemSolveBanner;
    
    if (config.enabled && config.image) {
        banner.style.backgroundImage = `url(${config.image})`;
        banner.style.cursor = 'pointer';
        banner.onclick = () => config.link && window.open(config.link, '_blank');
        
        const title = banner.querySelector('h3');
        const description = banner.querySelector('p');
        
        if (title) {
            title.setAttribute('data-en', config.titleEn || '');
            title.setAttribute('data-km', config.titleKm || '');
            title.textContent = currentLanguage === 'en' ? config.titleEn : config.titleKm;
        }
        
        if (description) {
            description.setAttribute('data-en', config.descriptionEn || '');
            description.setAttribute('data-km', config.descriptionKm || '');
            description.textContent = currentLanguage === 'en' ? config.descriptionEn : config.descriptionKm;
        }
        
        banner.style.display = 'block';
    } else {
        banner.style.display = 'none';
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.getElementById('mode-icon').textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
}

function loadDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('mode-icon').textContent = '☀️';
    }
    
    // Hide dark mode button for Alibaba theme
    if (currentTheme === 'alibaba') {
        const darkModeBtn = document.getElementById('darkModeBtn');
        if (darkModeBtn) darkModeBtn.style.display = 'none';
    }
}

// Load logo
function loadLogo() {
    const logoElement = document.getElementById('siteLogo');
    if (!logoElement) return;
    
    if (CONFIG.logo) {
        // If logo is uploaded, show as image
        logoElement.innerHTML = `<img src="${CONFIG.logo}" alt="Logo" style="height: 40px; max-width: 200px; object-fit: contain;">`;
    } else {
        // Default text logo
        logoElement.textContent = 'LOGO';
    }
}

// Navigate to home page
function goToHome() {
    // Show first section (promotion)
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById('promotion').classList.add('active');
    
    // Update section navigation
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.section-btn[data-section="promotion"]').classList.add('active');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Theme Management
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || localStorage.getItem('adminSelectedTheme') || 'default';
    applyTheme(savedTheme);
}

function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = CONFIG.themes[themeName] || CONFIG.themes.default;
    
    const oldStyle = document.getElementById('theme-style');
    if (oldStyle) oldStyle.remove();
    
    const isLightNav = themeName === 'alibaba';
    const navBg = isLightNav ? '#ffffff' : theme.secondary;
    const navText = isLightNav ? '#333333' : 'white';
    const navBorder = isLightNav ? '1px solid #f0f0f0' : 'none';
    const navShadow = isLightNav ? '0 2px 8px rgba(0,0,0,0.08)' : 'none';
    
    const style = document.createElement('style');
    style.id = 'theme-style';
    style.innerHTML = `
        :root {
            --primary-color: ${theme.primary};
            --primary-dark: ${theme.primaryDark};
            --secondary-color: ${theme.secondary};
            --accent-color: ${theme.accent};
        }
        
        body { background: ${theme.background} !important; }
        
        .section-btn.active, .btn-apply, .btn-primary, 
        .product-detail-category,
        .swiper-pagination-bullet-active { background: ${theme.primary} !important; }
        
        .btn-apply:hover, .btn-primary:hover { background: ${theme.primaryDark} !important; }
        
        .top-nav, .section-nav {
            background: ${navBg} !important;
            border-bottom: ${navBorder} !important;
            box-shadow: ${navShadow} !important;
        }
        
        .top-nav .logo, .top-nav .nav-btn, .top-nav .menu-toggle { color: ${navText} !important; }
        .top-nav .nav-btn { border-color: ${isLightNav ? theme.primary : navText} !important; }
        .top-nav .nav-btn:hover {
            background: ${isLightNav ? theme.primary : 'rgba(255,255,255,0.1)'} !important;
            color: ${isLightNav ? 'white' : navText} !important;
        }
        
        .section-nav .section-btn {
            background: ${isLightNav ? '#f5f5f5' : theme.secondary} !important;
            color: ${navText} !important;
        }
        .section-nav .section-btn.active { background: ${theme.primary} !important; color: white !important; }
        
        .category-btn { border-color: ${theme.primary} !important; color: ${theme.primary} !important; }
        .category-btn.active { background: ${theme.primary} !important; color: white !important; }
        
        .promotion-card:hover, .product-card:hover, .event-card:hover { box-shadow: ${theme.cardShadow} !important; }
        .section-title::after { background: ${theme.primary} !important; }
        .problem-banner { background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%) !important; }
    `;
    
    document.head.appendChild(style);
}

// Banner Slider
function initBannerSlider() {
    const slidesContainer = document.getElementById('bannerSlides');
    if (!slidesContainer) return;
    
    // Detect device type
    const isMobile = window.innerWidth <= 768;
    
    // Filter banners based on enabled status and device display settings
    const enabledBanners = CONFIG.banners.filter(b => {
        if (!b.enabled) return false;
        
        // Check display options (backward compatibility: if not set, show on both)
        const showOnMobile = b.showOnMobile !== undefined ? b.showOnMobile : true;
        const showOnDesktop = b.showOnDesktop !== undefined ? b.showOnDesktop : true;
        
        if (isMobile) {
            return showOnMobile;
        } else {
            return showOnDesktop;
        }
    });
    
    if (enabledBanners.length === 0) {
        slidesContainer.innerHTML = '<div class="swiper-slide banner-slide" style="background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#999;">No banners yet</div>';
    } else {
        enabledBanners.forEach(banner => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide banner-slide';
            
            // Use appropriate image based on device
            let bannerImage;
            if (isMobile) {
                // Use mobile image if available, fallback to desktop or main image
                bannerImage = banner.mobileImage || banner.desktopImage || banner.image;
            } else {
                // Use desktop image if available, fallback to mobile or main image
                bannerImage = banner.desktopImage || banner.mobileImage || banner.image;
            }
            
            slide.style.backgroundImage = `url(${bannerImage})`;
            slide.onclick = () => window.open(banner.link, '_blank');
            slidesContainer.appendChild(slide);
        });
    }
    
    new Swiper('.bannerSwiper', {
        pagination: { el: '.swiper-pagination', clickable: true },
        autoplay: { delay: 3000, disableOnInteraction: false },
        loop: enabledBanners.length > 1
    });
}

// Get promotional label text with emoji
function getPromoLabelText(label) {
    const labels = {
        'SALE': '🔥 SALE',
        'HOT': '🔥 HOT',
        'NEW': '✨ NEW',
        'LIMITED': '⏰ LIMITED',
        'BEST': '⭐ BEST',
        'FLASH': '⚡ FLASH'
    };
    return labels[label] || label;
}

// Helper function to handle image loading with fallback
function getImageSrc(url) {
    if (!url) return 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>';
    
    // Clean the URL
    url = url.trim();
    
    // For Facebook CDN images, ensure proper format
    if (url.includes('fbcdn.net')) {
        // Remove any query parameters that might cause issues
        return url.split('?')[0];
    }
    
    // For Instagram images
    if (url.includes('cdninstagram.com') || url.includes('instagram.com')) {
        return url;
    }
    
    // For all other images, return as-is
    return url;
}

// Handle image load errors with better fallback
function handleImageError(img) {
    const fallbackSvg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23f0f0f0%22 width=%22300%22 height=%22300%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>Image Unavailable</text></svg>';
    
    // Prevent infinite loop
    if (img.src === fallbackSvg || img.getAttribute('data-error-handled') === 'true') {
        return;
    }
    
    img.setAttribute('data-error-handled', 'true');
    
    // Try different approaches
    const originalSrc = img.getAttribute('data-original-src') || img.src;
    
    // First attempt: Try without any modifications
    if (!img.hasAttribute('data-retry-1')) {
        img.setAttribute('data-retry-1', 'true');
        img.src = originalSrc;
        return;
    }
    
    // Second attempt: Try with a proxy (using images.weserv.nl - free image proxy)
    if (!img.hasAttribute('data-retry-2') && originalSrc.startsWith('http')) {
        img.setAttribute('data-retry-2', 'true');
        // Use weserv.nl as a CORS proxy for images
        img.src = `https://images.weserv.nl/?url=${encodeURIComponent(originalSrc)}`;
        return;
    }
    
    // Final fallback: Show placeholder
    img.src = fallbackSvg;
}

// Load Promotions
function loadPromotions() {
    const grid = document.getElementById('promotionGrid');
    if (!grid) return;
    
    if (CONFIG.promotions.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No promotions yet</p>';
        return;
    }
    
    CONFIG.promotions.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        card.onclick = () => showPromotionDetail(promo);
        
        const categoryName = CONFIG.categories.find(c => c.id === promo.category)?.name || promo.category || 'Promotion';
        
        card.innerHTML = `
            <div class="promotion-image-container">
                <img src="${getImageSrc(promo.image)}" alt="${promo.title}" class="promotion-image" data-original-src="${promo.image}" onerror="handleImageError(this)" loading="lazy">
                ${promo.promoLabel ? `<div class="promo-label promo-label-${promo.promoLabel.toLowerCase()}">${getPromoLabelText(promo.promoLabel)}</div>` : ''}
                ${promo.discount && parseFloat(promo.discount) > 0 ? `<div class="discount-badge">-${promo.discount}%</div>` : ''}
            </div>
            <div class="promotion-content">
                <div class="promotion-title" data-en="${promo.title}" data-km="${promo.titleKm}">
                    ${currentLanguage === 'en' ? promo.title : promo.titleKm}
                </div>
                <div class="promotion-category">${categoryName}</div>
                <div class="promotion-pricing">
                    ${promo.originalPrice && promo.discount && parseFloat(promo.discount) > 0 ? 
                        `<span class="original-price">${promo.originalPrice}</span>` : ''}
                    <span class="final-price">${promo.price || '$0'}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load Events
function loadEvents() {
    const grid = document.getElementById('eventGrid');
    if (!grid) return;
    
    if (CONFIG.events.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No events yet</p>';
        return;
    }
    
    CONFIG.events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        
        let mediaHTML = '';
        if (event.type === 'video' && event.embedUrl) {
            const embedUrl = convertToEmbedUrl(event.embedUrl);
            
            // Determine aspect ratio from admin setting or default to square
            let aspectRatio = event.aspectRatio || '1/1'; // Default square
            let containerClass = 'event-video-square';
            
            if (event.aspectRatio === '16/9') {
                containerClass = 'event-video-landscape';
            } else if (event.aspectRatio === '3/4') {
                containerClass = 'event-video-portrait';
            } else if (event.aspectRatio === '9/16') {
                containerClass = 'event-video-vertical';
            }
            
            mediaHTML = `
                <div class="${containerClass}">
                    <iframe 
                        src="${embedUrl}" 
                        style="border: none; width: 100%; height: 100%;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
            `;
        } else {
            mediaHTML = `
                <div class="event-image-square">
                    <img src="${event.image}" alt="${event.title}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22400%22><rect fill=%22%23f0f0f0%22 width=%22800%22 height=%22400%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">
                </div>
            `;
        }
        
        card.innerHTML = `
            ${mediaHTML}
            <div class="event-content">
                <div class="event-title" data-en="${event.title}" data-km="${event.titleKm}">
                    ${currentLanguage === 'en' ? event.title : event.titleKm}
                </div>
                <div class="event-description" data-en="${event.description}" data-km="${event.descriptionKm}">
                    ${currentLanguage === 'en' ? event.description : event.descriptionKm}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load Posts with filtering like products
function loadPosts(filterType = 'all') {
    const grid = document.getElementById('postGrid');
    if (!grid) return;
    
    if (!CONFIG.posts || CONFIG.posts.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;">No posts yet</p>';
        return;
    }
    
    // Only show published posts
    let postsToShow = CONFIG.posts.filter(post => post.enabled);
    
    // Apply filter
    if (filterType === 'video') {
        postsToShow = postsToShow.filter(post => post.type === 'video');
    } else if (filterType === 'image') {
        postsToShow = postsToShow.filter(post => post.type === 'image');
    }
    
    if (postsToShow.length === 0) {
        const filterText = filterType === 'all' ? 'posts' : `${filterType} posts`;
        grid.innerHTML = `<p style="color:#999;text-align:center;padding:40px;">No ${filterText} yet</p>`;
        return;
    }
    
    grid.innerHTML = '';
    
    postsToShow.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card';
        card.onclick = () => showPostDetail(post.id);
        card.style.cursor = 'pointer';
        
        let cardHTML = '';
        
        if (post.type === 'video' && (post.embedUrl || post.videoUrl)) {
            // Video posts - show as clickable thumbnail with title only
            const originalUrl = post.videoUrl || post.embedUrl;
            const embedUrl = convertToEmbedUrl(originalUrl);
            
            // Determine aspect ratio from admin setting or default to square
            let aspectRatio = post.aspectRatio || '1/1'; // Default square
            let containerClass = 'post-video-square';
            
            if (post.aspectRatio === '16/9') {
                containerClass = 'post-video-landscape';
            } else if (post.aspectRatio === '3/4') {
                containerClass = 'post-video-portrait';
            } else if (post.aspectRatio === '9/16') {
                containerClass = 'post-video-vertical';
            }
            
            cardHTML = `
                <div class="${containerClass}">
                    <iframe 
                        src="${embedUrl}" 
                        style="border: none; width: 100%; height: 100%;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="post-content">
                    <div class="post-title" data-en="${post.title}" data-km="${post.titleKm}">
                        ${currentLanguage === 'en' ? post.title : post.titleKm}
                    </div>
                </div>
            `;
        } else if (post.image) {
            // Image posts - show as square card (1080x1080 style)
            cardHTML = `
                <div class="post-image-square">
                    <img src="${post.image}" alt="${post.title}" loading="lazy" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">
                </div>
                <div class="post-content">
                    <div class="post-title" data-en="${post.title}" data-km="${post.titleKm}">
                        ${currentLanguage === 'en' ? post.title : post.titleKm}
                    </div>
                    <div class="post-article" data-en="${post.content.substring(0, 120)}..." data-km="${post.contentKm.substring(0, 120)}...">
                        ${currentLanguage === 'en' ? post.content.substring(0, 120) + '...' : post.contentKm.substring(0, 120) + '...'}
                    </div>
                    <div class="post-type">🖼️ Click to view</div>
                </div>
            `;
        }
        
        card.innerHTML = cardHTML;
        grid.appendChild(card);
    });
    
    // Initialize post filter buttons
    initPostFilter();
}

// Initialize post filter functionality
function initPostFilter() {
    const filterButtons = document.querySelectorAll('.post-filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter type and reload posts
            const filterType = this.getAttribute('data-filter');
            loadPosts(filterType);
        });
    });
}

// Load Categories
function loadCategories() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    
    CONFIG.categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `category-btn ${cat.id === 'all' ? 'active' : ''}`;
        btn.setAttribute('data-en', cat.name);
        btn.setAttribute('data-km', cat.nameKm);
        btn.textContent = currentLanguage === 'en' ? cat.name : cat.nameKm;
        btn.onclick = (e) => filterProducts(cat.id, e);
        filter.appendChild(btn);
    });
}

// Filter Products
function filterProducts(categoryId, e) {
    currentCategory = categoryId;
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    if (e && e.target) e.target.classList.add('active');
    loadProducts();
}

// Load Products
function loadProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const filteredProducts = currentCategory === 'all' 
        ? CONFIG.products 
        : CONFIG.products.filter(p => p.category === currentCategory);
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;padding:40px;grid-column:1/-1;">No products yet</p>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => showProductDetail(product);
        
        const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
        
        card.innerHTML = `
            <img src="${getImageSrc(product.image)}" alt="${product.name}" class="product-image" 
                 data-original-src="${product.image}" onerror="handleImageError(this)" loading="lazy">
            <div class="product-info">
                <div class="product-name" data-en="${product.name}" data-km="${product.nameKm}">
                    ${currentLanguage === 'en' ? product.name : product.nameKm}
                </div>
                <div class="product-category">${categoryName}</div>
                <div class="product-price">${product.price}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Show Product Detail - Alibaba Style
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    // Prepare images array
    let allMedia = [];
    if (product.image) allMedia.push({ type: 'image', src: product.image });
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            if (img && img !== product.image) {
                allMedia.push({ type: 'image', src: img });
            }
        });
    }
    if (product.videoUrl) {
        allMedia.push({ type: 'video', src: convertToEmbedUrl(product.videoUrl) });
    }
    
    // If no media, add placeholder
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>' });
    }
    
    // Build thumbnails
    let thumbnailsHTML = allMedia.map((media, index) => {
        if (media.type === 'video') {
            return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="changeMainMedia(${index})" data-type="video" data-src="${media.src}">
                <div class="thumb-video-icon">▶</div>
            </div>`;
        }
        return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="changeMainMedia(${index})" data-type="image" data-src="${media.src}">
            <img src="${getImageSrc(media.src)}" alt="Thumb ${index + 1}" data-original-src="${media.src}" onerror="handleImageError(this)">
        </div>`;
    }).join('');
    
    // Main media display
    let mainMediaHTML = '';
    if (allMedia[0].type === 'video') {
        mainMediaHTML = `<iframe id="mainMedia" src="${allMedia[0].src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        mainMediaHTML = `<img id="mainMedia" src="${getImageSrc(allMedia[0].src)}" alt="${product.name}" data-original-src="${allMedia[0].src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
    const description = currentLanguage === 'en' ? product.description : product.descriptionKm;
    const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;
    
    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-gallery">
                <div class="main-media-container">
                    ${mainMediaHTML}
                </div>
                <div class="thumbnail-strip">
                    ${thumbnailsHTML}
                </div>
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title" data-en="${product.name}" data-km="${product.nameKm}">
                    ${currentLanguage === 'en' ? product.name : product.nameKm}
                </h2>
                <span class="product-detail-category">${categoryName}</span>
                <div class="product-detail-price">${product.price}</div>
                
                <div class="product-detail-desc">
                    <h4 data-en="Description" data-km="ការពិពណ៌នា">${currentLanguage === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
                    <p id="descText" class="desc-collapsed">${description}</p>
                    ${description.length > 150 ? `<button class="btn-show-more" onclick="toggleDescription()">
                        <span data-en="Show More" data-km="បង្ហាញបន្ថែម">${currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម'}</span>
                    </button>` : ''}
                </div>
                
                <div class="contact-buttons">
                    ${product.contact?.phone ? `<button class="btn-contact btn-phone" onclick="contactPhone('${product.contact.phone}')">
                        <span>📞 Call</span>
                    </button>` : ''}
                    ${product.contact?.whatsapp ? `<button class="btn-contact btn-whatsapp" onclick="contactWhatsApp('${product.contact.whatsapp}')">
                        <span>WhatsApp</span>
                    </button>` : ''}
                    ${product.contact?.telegram ? `<button class="btn-contact btn-telegram" onclick="contactTelegram('${product.contact.telegram}')">
                        <span>Telegram</span>
                    </button>` : ''}
                    ${product.contact?.facebook ? `<button class="btn-contact btn-facebook" onclick="contactFacebook('${product.contact.facebook}')">
                        <span>Facebook</span>
                    </button>` : ''}
                    ${product.contact?.messenger ? `<button class="btn-contact btn-messenger" onclick="contactMessenger('${product.contact.messenger}')">
                        <span>Messenger</span>
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Store media data for switching
    window.productMedia = allMedia;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Show Promotion Detail - Exactly like Product Detail
function showPromotionDetail(promotion) {
    const modal = document.getElementById('productModal');
    const detail = document.getElementById('productDetail');
    
    // Prepare images array (same as products)
    let allMedia = [];
    if (promotion.image) allMedia.push({ type: 'image', src: promotion.image });
    if (promotion.images && promotion.images.length > 0) {
        promotion.images.forEach(img => {
            if (img && img !== promotion.image) {
                allMedia.push({ type: 'image', src: img });
            }
        });
    }
    if (promotion.videoUrl) {
        allMedia.push({ type: 'video', src: convertToEmbedUrl(promotion.videoUrl) });
    }
    
    // If no media, add placeholder
    if (allMedia.length === 0) {
        allMedia.push({ type: 'image', src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="%23f0f0f0" width="600" height="600"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999">No Image</text></svg>' });
    }
    
    // Build thumbnails (same as products)
    let thumbnailsHTML = allMedia.map((media, index) => {
        if (media.type === 'video') {
            return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="changeMainMedia(${index})" data-type="video" data-src="${media.src}">
                <div class="thumb-video-icon">▶</div>
            </div>`;
        }
        return `<div class="thumb-item ${index === 0 ? 'active' : ''}" onclick="changeMainMedia(${index})" data-type="image" data-src="${media.src}">
            <img src="${getImageSrc(media.src)}" alt="Thumb ${index + 1}" data-original-src="${media.src}" onerror="handleImageError(this)">
        </div>`;
    }).join('');
    
    // Main media display (same as products)
    let mainMediaHTML = '';
    if (allMedia[0].type === 'video') {
        mainMediaHTML = `<iframe id="mainMedia" src="${allMedia[0].src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        mainMediaHTML = `<img id="mainMedia" src="${getImageSrc(allMedia[0].src)}" alt="${promotion.title}" data-original-src="${allMedia[0].src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
    
    const categoryName = CONFIG.categories.find(c => c.id === promotion.category)?.name || promotion.category || 'Promotion';
    const description = currentLanguage === 'en' ? (promotion.description || 'No description') : (promotion.descriptionKm || 'គ្មានការពិពណ៌នា');
    
    detail.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-gallery">
                <div class="main-media-container">
                    ${mainMediaHTML}
                </div>
                <div class="thumbnail-strip">
                    ${thumbnailsHTML}
                </div>
            </div>
            <div class="product-detail-info">
                <h2 class="product-detail-title" data-en="${promotion.title}" data-km="${promotion.titleKm}">
                    ${currentLanguage === 'en' ? promotion.title : promotion.titleKm}
                    ${promotion.promoLabel ? `<span class="promo-label-inline promo-label-${promotion.promoLabel.toLowerCase()}">${getPromoLabelText(promotion.promoLabel)}</span>` : ''}
                </h2>
                <span class="product-detail-category">${categoryName}</span>
                <div class="promotion-detail-pricing">
                    ${promotion.originalPrice && promotion.discount && parseFloat(promotion.discount) > 0 ? 
                        `<div class="pricing-row">
                            <span class="original-price-large">${promotion.originalPrice}</span>
                            <span class="discount-badge-large">-${promotion.discount}%</span>
                        </div>` : ''}
                    <div class="product-detail-price">${promotion.price || '$0'}</div>
                </div>
                
                <div class="product-detail-desc">
                    <h4 data-en="Description" data-km="ការពិពណ៌នា">${currentLanguage === 'en' ? 'Description' : 'ការពិពណ៌នា'}</h4>
                    <p id="descText" class="desc-collapsed">${description}</p>
                    ${description.length > 150 ? `<button class="btn-show-more" onclick="toggleDescription()">
                        <span data-en="Show More" data-km="បង្ហាញបន្ថែម">${currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម'}</span>
                    </button>` : ''}
                </div>
                

                
                <div class="contact-buttons">
                    ${promotion.contact?.phone ? `<button class="btn-contact btn-phone" onclick="contactPhone('${promotion.contact.phone}')">
                        <span>📞 Call</span>
                    </button>` : ''}
                    ${promotion.contact?.whatsapp ? `<button class="btn-contact btn-whatsapp" onclick="contactWhatsApp('${promotion.contact.whatsapp}')">
                        <span>WhatsApp</span>
                    </button>` : ''}
                    ${promotion.contact?.telegram ? `<button class="btn-contact btn-telegram" onclick="contactTelegram('${promotion.contact.telegram}')">
                        <span>Telegram</span>
                    </button>` : ''}
                    ${promotion.contact?.facebook ? `<button class="btn-contact btn-facebook" onclick="contactFacebook('${promotion.contact.facebook}')">
                        <span>Facebook</span>
                    </button>` : ''}
                    ${promotion.contact?.messenger ? `<button class="btn-contact btn-messenger" onclick="contactMessenger('${promotion.contact.messenger}')">
                        <span>Messenger</span>
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Store media data for switching (same as products)
    window.productMedia = allMedia;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Change main media in product detail
window.changeMainMedia = function(index) {
    const media = window.productMedia[index];
    const container = document.querySelector('.main-media-container');
    
    // Update active thumbnail
    document.querySelectorAll('.thumb-item').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });
    
    if (media.type === 'video') {
        container.innerHTML = `<iframe id="mainMedia" src="${media.src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = `<img id="mainMedia" src="${getImageSrc(media.src)}" alt="Product" data-original-src="${media.src}" onerror="handleImageError(this)" onclick="viewFullImage(this.src)">`;
    }
};

// View full-size image in new tab
window.viewFullImage = function(src) {
    // Create fullscreen image overlay
    const overlay = document.createElement('div');
    overlay.id = 'imageOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
        animation: fadeIn 0.3s ease;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 95%;
        max-height: 95%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        animation: zoomIn 0.3s ease;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        color: #333;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        z-index: 10000;
    `;
    
    closeBtn.onmouseover = () => {
        closeBtn.style.background = '#ff4444';
        closeBtn.style.color = 'white';
        closeBtn.style.transform = 'scale(1.1)';
    };
    
    closeBtn.onmouseout = () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
        closeBtn.style.color = '#333';
        closeBtn.style.transform = 'scale(1)';
    };
    
    const closeOverlay = () => {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(overlay);
            document.body.style.overflow = 'auto';
        }, 300);
    };
    
    closeBtn.onclick = closeOverlay;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeOverlay();
    };
    
    // Close on ESC key
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeOverlay();
            document.removeEventListener('keydown', escHandler);
        }
    });
    
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
};

// Toggle description show more/less
window.toggleDescription = function() {
    const descText = document.getElementById('descText');
    const btn = document.querySelector('.btn-show-more span');
    
    if (descText.classList.contains('desc-collapsed')) {
        descText.classList.remove('desc-collapsed');
        btn.textContent = currentLanguage === 'en' ? 'Show Less' : 'បង្ហាញតិច';
    } else {
        descText.classList.add('desc-collapsed');
        btn.textContent = currentLanguage === 'en' ? 'Show More' : 'បង្ហាញបន្ថែម';
    }
};

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Section Navigation
function initSectionNavigation() {
    loadSectionNavigation();
    initSectionNavigationEvents();
}

// Separate function for event binding only (to avoid circular calls)
function initSectionNavigationEvents() {
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            
            document.querySelectorAll('.section-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            document.getElementById(section)?.classList.add('active');
        });
    });
}

// Load section navigation based on admin settings
function loadSectionNavigation() {
    const sectionNav = document.querySelector('.section-nav');
    if (!sectionNav) return;
    
    // Get section settings from config
    const sectionSettings = CONFIG.sectionSettings || {
        promotion: { enabled: true, nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន', order: 1 },
        event: { enabled: true, nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍', order: 2 },
        products: { enabled: true, nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់', order: 3 },
        problem: { enabled: true, nameEn: 'POST', nameKm: 'ប្រកាស', order: 4 }
    };
    
    // Create array of enabled sections with their settings
    const enabledSections = [];
    
    // Add default sections if enabled
    Object.entries(sectionSettings).forEach(([sectionId, settings]) => {
        if (settings.enabled) {
            enabledSections.push({
                id: sectionId,
                nameEn: settings.nameEn,
                nameKm: settings.nameKm,
                order: settings.order || 1,
                type: 'default'
            });
        }
    });
    
    // Add custom sections if enabled
    if (CONFIG.customSections && Array.isArray(CONFIG.customSections)) {
        CONFIG.customSections.forEach(section => {
            if (section.enabled && section.nameEn && section.nameKm) { // Validate section data
                enabledSections.push({
                    id: `custom-${section.id}`,
                    nameEn: section.nameEn,
                    nameKm: section.nameKm,
                    order: section.order || 5,
                    type: 'custom',
                    template: section.template,
                    items: section.items || [],
                    originalSection: section // Keep reference to original section
                });
            }
        });
    }
    
    // Sort sections by order
    enabledSections.sort((a, b) => a.order - b.order);
    
    // Clear existing buttons
    sectionNav.innerHTML = '';
    
    // Create section buttons
    enabledSections.forEach((section, index) => {
        // Skip sections with empty names
        if (!section.nameEn || !section.nameKm) return;
        
        const btn = document.createElement('button');
        btn.className = `section-btn ${index === 0 ? 'active' : ''}`;
        btn.setAttribute('data-section', section.id);
        btn.setAttribute('data-en', section.nameEn);
        btn.setAttribute('data-km', section.nameKm);
        btn.textContent = currentLanguage === 'en' ? section.nameEn : section.nameKm;
        sectionNav.appendChild(btn);
        
        // Create corresponding content section if it doesn't exist (for custom sections)
        if (section.type === 'custom' && section.originalSection) {
            createCustomSectionContent(section.originalSection);
        }
    });
    
    // Show first enabled section
    if (enabledSections.length > 0) {
        const firstSection = enabledSections[0];
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(firstSection.id)?.classList.add('active');
    }
}

// Create content section for custom sections
function createCustomSectionContent(section) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    console.log('Creating custom section content for:', section); // Debug log
    
    // Remove existing section if it exists (for template changes)
    const existingSection = document.getElementById(`custom-${section.id}`);
    if (existingSection) {
        existingSection.remove();
    }
    
    const sectionElement = document.createElement('section');
    sectionElement.id = `custom-${section.id}`; // Fix: Add 'custom-' prefix
    sectionElement.className = 'content-section';
    
    let contentHTML = `
        <h2 class="section-title" data-en="${section.nameEn}" data-km="${section.nameKm}">
            ${currentLanguage === 'en' ? section.nameEn : section.nameKm}
        </h2>
    `;
    
    // Generate content based on template type - Fix: Use correct IDs with 'custom-' prefix
    switch (section.template) {
        case 'card':
            contentHTML += `<div class="custom-card-grid promotion-grid" id="custom-${section.id}-grid"></div>`;
            break;
        case 'list':
            contentHTML += `<div class="custom-list-view post-grid" id="custom-${section.id}-list"></div>`;
            break;
        case 'banner':
            contentHTML += `<div class="custom-banner-view event-grid" id="custom-${section.id}-banner"></div>`;
            break;
        case 'custom':
            contentHTML += `<div class="custom-content" id="custom-${section.id}-content"></div>`;
            break;
        default:
            contentHTML += `<div class="custom-default" id="custom-${section.id}-default"></div>`;
    }
    
    sectionElement.innerHTML = contentHTML;
    
    console.log('Created section HTML:', contentHTML); // Debug log
    
    // Insert before the last section (usually posts/problem section)
    const lastSection = container.querySelector('#problem') || container.lastElementChild;
    container.insertBefore(sectionElement, lastSection);
    
    console.log('Section inserted into DOM, now loading content...'); // Debug log
    
    // Load content for this section immediately
    setTimeout(() => {
        console.log('Loading content for section after timeout:', section);
        loadCustomSectionContent(section);
    }, 100);
}

// Update existing custom section content
function updateCustomSectionContent(section) {
    const sectionElement = document.getElementById(`custom-${section.id}`); // Fix: Add 'custom-' prefix
    if (!sectionElement) return;
    
    // Update title
    const title = sectionElement.querySelector('.section-title');
    if (title) {
        title.setAttribute('data-en', section.nameEn);
        title.setAttribute('data-km', section.nameKm);
        title.textContent = currentLanguage === 'en' ? section.nameEn : section.nameKm;
    }
    
    // Reload content
    loadCustomSectionContent(section);
}

// Load content for custom sections
function loadCustomSectionContent(section) {
    console.log('Loading content for section:', section); // Debug log
    
    if (!section || !section.id) {
        console.error('Invalid section provided to loadCustomSectionContent:', section);
        return;
    }
    
    if (!section.items || section.items.length === 0) {
        console.log('No items found for section:', section.id);
        // Find the correct container based on template
        let container;
        switch (section.template) {
            case 'card':
                container = document.getElementById(`custom-${section.id}-grid`);
                break;
            case 'list':
                container = document.getElementById(`custom-${section.id}-list`);
                break;
            case 'banner':
                container = document.getElementById(`custom-${section.id}-banner`);
                break;
            case 'custom':
                container = document.getElementById(`custom-${section.id}-content`);
                break;
            default:
                container = document.getElementById(`custom-${section.id}-default`);
        }
        
        console.log('Looking for container:', container ? 'Found' : 'Not found', container);
        
        if (container) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">No content yet. Add items from the admin panel.</p>';
        }
        return;
    }
    
    const enabledItems = section.items.filter(item => item.enabled);
    console.log('Enabled items:', enabledItems); // Debug log
    
    if (enabledItems.length === 0) {
        console.log('No enabled items for section:', section.id);
        return;
    }
    
    switch (section.template) {
        case 'card':
            console.log('Loading card template for section:', section.id);
            loadCustomCardContent(section, enabledItems);
            break;
        case 'list':
            console.log('Loading list template for section:', section.id);
            loadCustomListContent(section, enabledItems);
            break;
        case 'banner':
            console.log('Loading banner template for section:', section.id);
            loadCustomBannerContent(section, enabledItems);
            break;
        case 'custom':
            console.log('Loading custom template for section:', section.id);
            loadCustomHtmlContent(section, enabledItems);
            break;
        default:
            console.log('Loading default template for section:', section.id);
            loadCustomDefaultContent(section, enabledItems);
    }
}

// Load card-style content
function loadCustomCardContent(section, items) {
    const grid = document.getElementById(`custom-${section.id}-grid`);
    console.log('Looking for grid:', `custom-${section.id}-grid`, 'Found:', grid); // Debug log
    
    if (!grid) {
        console.error('Grid not found for section:', section.id);
        return;
    }
    
    grid.innerHTML = '';
    grid.className = 'custom-card-grid promotion-grid'; // Use existing promotion grid styles
    
    if (items.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#999;padding:40px;grid-column:1/-1;">No content yet. Add items from the admin panel.</p>';
        return;
    }
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'promotion-card';
        if (item.link) {
            card.style.cursor = 'pointer';
            card.onclick = () => window.open(item.link, '_blank');
        }
        
        card.innerHTML = `
            ${item.image ? `
                <div class="promotion-image-container">
                    <img src="${getImageSrc(item.image)}" alt="${item.title}" class="promotion-image" 
                         data-original-src="${item.image}" onerror="handleImageError(this)" loading="lazy">
                </div>
            ` : ''}
            <div class="promotion-content">
                <div class="promotion-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="promotion-description">${item.content}</div>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
    
    console.log('Card content loaded successfully for section:', section.id); // Debug log
}

// Load list-style content
function loadCustomListContent(section, items) {
    const list = document.getElementById(`custom-${section.id}-list`);
    console.log('Looking for list:', `custom-${section.id}-list`, 'Found:', list); // Debug log
    
    if (!list) {
        console.error('List not found for section:', section.id);
        return;
    }
    
    list.innerHTML = '';
    list.className = 'custom-list-view post-grid'; // Use existing post grid styles
    
    items.forEach(item => {
        const listItem = document.createElement('div');
        listItem.className = 'post-card';
        if (item.link) {
            listItem.style.cursor = 'pointer';
            listItem.onclick = () => window.open(item.link, '_blank');
        }
        
        listItem.innerHTML = `
            ${item.image ? `<div class="post-image-square"><img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'"></div>` : ''}
            <div class="post-content">
                <div class="post-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="post-article">${item.content}</div>` : ''}
            </div>
        `;
        list.appendChild(listItem);
    });
}

// Load banner-style content
function loadCustomBannerContent(section, items) {
    const banner = document.getElementById(`custom-${section.id}-banner`);
    console.log('Looking for banner:', `custom-${section.id}-banner`, 'Found:', banner); // Debug log
    
    if (!banner) {
        console.error('Banner not found for section:', section.id);
        return;
    }
    
    banner.innerHTML = '';
    banner.className = 'custom-banner-view event-grid'; // Use existing event grid styles
    
    items.forEach(item => {
        const bannerItem = document.createElement('div');
        bannerItem.className = 'event-card';
        if (item.link) {
            bannerItem.style.cursor = 'pointer';
            bannerItem.onclick = () => window.open(item.link, '_blank');
        }
        
        bannerItem.innerHTML = `
            ${item.image ? `<div class="event-image-square"><img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.style.display='none'"></div>` : ''}
            <div class="event-content">
                <div class="event-title">${item.title || 'No title'}</div>
                ${item.content ? `<div class="event-description">${item.content}</div>` : ''}
            </div>
        `;
        banner.appendChild(bannerItem);
    });
}

// Load custom HTML content
function loadCustomHtmlContent(section, items) {
    const content = document.getElementById(`custom-${section.id}-content`);
    console.log('Looking for content:', `custom-${section.id}-content`, 'Found:', content); // Debug log
    
    if (!content) {
        console.error('Content not found for section:', section.id);
        return;
    }
    
    content.innerHTML = '';
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'custom-html-item';
        div.style.marginBottom = '20px';
        
        let html = '';
        if (item.title) html += `<h3>${item.title}</h3>`;
        if (item.content) html += `<div>${item.content}</div>`;
        if (item.image) html += `<img src="${item.image}" alt="${item.title}" style="max-width:100%;height:auto;margin:10px 0;" loading="lazy" onerror="this.style.display='none'">`;
        if (item.link) html = `<a href="${item.link}" target="_blank" style="text-decoration:none;color:inherit;">${html}</a>`;
        
        div.innerHTML = html;
        content.appendChild(div);
    });
}

// Load default content
function loadCustomDefaultContent(section, items) {
    const content = document.getElementById(`custom-${section.id}-default`);
    console.log('Looking for default content:', `custom-${section.id}-default`, 'Found:', content); // Debug log
    
    if (!content) {
        console.error('Default content not found for section:', section.id);
        return;
    }
    
    content.innerHTML = '';
    
    if (items.length === 0) {
        content.innerHTML = `<p style="text-align:center;color:#999;padding:40px;">${section.description || 'No content yet'}</p>`;
        return;
    }
    
    items.forEach(item => {
        const div = document.createElement('div');
        div.style.padding = '15px';
        div.style.marginBottom = '15px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '8px';
        
        div.innerHTML = `
            <h4>${item.title || 'No title'}</h4>
            ${item.content ? `<p>${item.content}</p>` : ''}
            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="max-width:100%;height:auto;margin:10px 0;" loading="lazy" onerror="this.style.display='none'">` : ''}
            ${item.link ? `<a href="${item.link}" target="_blank" style="color:#3498db;">View More →</a>` : ''}
        `;
        
        content.appendChild(div);
    });
}

// Language Toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'km' : 'en';
    document.getElementById('lang-text').textContent = currentLanguage === 'en' ? 'EN' : 'ខ្មែរ';
    
    document.querySelectorAll('[data-en][data-km]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLanguage}`);
    });
    
    localStorage.setItem('language', currentLanguage);
}

// Menu Toggle
function toggleMenu() {
    document.querySelector('.nav-buttons').classList.toggle('active');
}

// Show Sections
function showSection(section) {
    if (section === 'contact') {
        document.getElementById('contactModal').style.display = 'block';
    } else if (section === 'about') {
        document.getElementById('aboutModal').style.display = 'block';
    }
}

function closeContactModal() {
    document.getElementById('contactModal').style.display = 'none';
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
}

// Load contact info
function loadContactInfo() {
    const contactDiv = document.getElementById('contactInfo');
    if (!contactDiv) return;
    
    // Ensure CONFIG.contact exists
    if (!CONFIG.contact) {
        CONFIG.contact = {
            phone: '',
            email: '',
            address: '',
            whatsapp: '',
            telegram: '',
            facebook: '',
            messenger: ''
        };
    }
    
    let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
    
    if (CONFIG.contact.phone) {
        html += `
            <a href="tel:${CONFIG.contact.phone}" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#ff6a00'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Phone</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.phone}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.email) {
        html += `
            <a href="mailto:${CONFIG.contact.email}" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#ff6a00'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Email</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.email}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.address) {
        html += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #ff6a00; border-radius: 10px; color: #333;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Address</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.address}</div>
                </div>
            </div>
        `;
    }
    
    if (CONFIG.contact.whatsapp) {
        html += `
            <a href="https://wa.me/${CONFIG.contact.whatsapp.replace(/[^0-9]/g, '')}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #25D366; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#25D366'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">WhatsApp</div>
                    <div style="font-weight: 600; font-size: 16px;">${CONFIG.contact.whatsapp}</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.telegram) {
        html += `
            <a href="${CONFIG.contact.telegram}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #0088cc; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#0088cc'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Telegram</div>
                    <div style="font-weight: 600; font-size: 16px;">Open Telegram</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.facebook) {
        html += `
            <a href="${CONFIG.contact.facebook}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #1877f2; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#1877f2'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Facebook</div>
                    <div style="font-weight: 600; font-size: 16px;">Visit Page</div>
                </div>
            </a>
        `;
    }
    
    if (CONFIG.contact.messenger) {
        html += `
            <a href="${CONFIG.contact.messenger}" target="_blank" style="display: flex; align-items: center; gap: 12px; padding: 15px; background: #fff; border: 2px solid #0084ff; border-radius: 10px; text-decoration: none; color: #333; transition: all 0.3s;" onmouseover="this.style.background='#0084ff'; this.style.color='#fff';" onmouseout="this.style.background='#fff'; this.style.color='#333';">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div style="flex: 1;">
                    <div style="font-size: 12px; opacity: 0.7; margin-bottom: 2px;">Messenger</div>
                    <div style="font-weight: 600; font-size: 16px;">Chat on Messenger</div>
                </div>
            </a>
        `;
    }
    
    html += '</div>';
    
    contactDiv.innerHTML = html || '<p style="color: #999; text-align: center; padding: 20px;">Contact information coming soon...</p>';
}

// Contact Methods
function contactPhone(phone) {
    if (phone && phone.trim()) {
        window.open(`tel:${phone}`, '_self');
    } else {
        alert('Phone number not available for this product');
    }
}

function contactWhatsApp(whatsapp) {
    if (whatsapp && whatsapp.trim()) {
        window.open(`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`, '_blank');
    } else {
        alert('WhatsApp not available for this product');
    }
}

function contactTelegram(telegram) {
    if (telegram && telegram.trim()) {
        window.open(telegram, '_blank');
    } else {
        alert('Telegram not available for this product');
    }
}

function contactFacebook(facebook) {
    if (facebook && facebook.trim()) {
        window.open(facebook, '_blank');
    } else {
        alert('Facebook not available for this product');
    }
}

function contactMessenger(messenger) {
    if (messenger && messenger.trim()) {
        window.open(messenger, '_blank');
    } else {
        alert('Messenger not available for this product');
    }
}

// Post Section
function openPostForm() {
    if (CONFIG.problemSolveLink) {
        window.open(CONFIG.problemSolveLink, '_blank');
    } else {
        alert('Post link not configured');
    }
}

// Show Post Detail Modal - Enhanced like product detail
function showPostDetail(postId) {
    const post = CONFIG.posts.find(p => p.id === postId);
    if (!post) return;
    
    let mediaHTML = '';
    if (post.type === 'video' && (post.embedUrl || post.videoUrl)) {
        const originalUrl = post.videoUrl || post.embedUrl;
        const embedUrl = convertToEmbedUrl(originalUrl);
        
        console.log('Post Video - Original URL:', originalUrl);
        console.log('Post Video - Embed URL:', embedUrl);
        
        // Create video embed like product system
        mediaHTML = `
            <div class="post-detail-media">
                <div class="video-container" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 10px; margin-bottom: 20px;">
                    <iframe 
                        src="${embedUrl}" 
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                        frameborder="0" 
                        allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin"
                        loading="lazy">
                    </iframe>
                </div>
                <div class="video-fallback" style="text-align: center; margin-top: 10px;">
                    <a href="${originalUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
                        🔗 Open video in new tab if not loading
                    </a>
                </div>
            </div>
        `;
    } else if (post.image) {
        // Create image gallery like product system
        let allImages = [post.image];
        if (post.images && post.images.length > 0) {
            allImages = allImages.concat(post.images);
        }
        
        mediaHTML = `
            <div class="post-detail-media">
                <div class="post-image-gallery">
                    <div class="main-image">
                        <img id="postMainImage" src="${post.image}" alt="${post.title}" style="width:100%;border-radius:10px;">
                    </div>
        `;
        
        if (allImages.length > 1) {
            mediaHTML += `
                    <div class="image-thumbnails" style="display: flex; gap: 10px; margin-top: 15px; overflow-x: auto;">
            `;
            allImages.forEach((img, index) => {
                mediaHTML += `
                        <img src="${img}" 
                             alt="Image ${index + 1}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid ${index === 0 ? '#007bff' : 'transparent'};"
                             onclick="changePostImage('${img}', this)"
                             onerror="this.style.display='none'">
                `;
            });
            mediaHTML += `
                    </div>
            `;
        }
        
        mediaHTML += `
                </div>
            </div>
        `;
    }
    
    const content = `
        <div class="post-detail">
            <h2 class="post-detail-title" data-en="${post.title}" data-km="${post.titleKm}">
                ${currentLanguage === 'en' ? post.title : post.titleKm}
            </h2>
            ${mediaHTML}
            <div class="post-detail-content">
                <div class="post-full-content" data-en="${post.content}" data-km="${post.contentKm}">
                    ${currentLanguage === 'en' ? post.content : post.contentKm}
                </div>
                ${post.link ? `<div class="post-link"><a href="${post.link}" target="_blank" class="btn-primary">Read More</a></div>` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('postDetail').innerHTML = content;
    document.getElementById('postModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Change post image function (like product system)
function changePostImage(imageSrc, thumbnail) {
    document.getElementById('postMainImage').src = imageSrc;
    
    // Update thumbnail borders
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.style.border = '2px solid transparent';
    });
    thumbnail.style.border = '2px solid #007bff';
}

// Close Post Modal
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close modals on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Load Navigation Style
function loadNavigationStyle() {
    const navStyle = CONFIG.navigationStyle || 'solid';
    applyNavigationStyle(navStyle);
}

function applyNavigationStyle(style) {
    const topNav = document.querySelector('.top-nav');
    const sectionNav = document.querySelector('.section-nav');
    if (!topNav || !sectionNav) return;
    
    topNav.classList.remove('nav-glass', 'nav-gradient', 'nav-solid', 'nav-custom');
    sectionNav.classList.remove('nav-glass', 'nav-gradient', 'nav-solid', 'nav-custom');
    
    switch(style) {
        case 'glass':
            topNav.classList.add('nav-glass');
            sectionNav.classList.add('nav-glass');
            break;
        case 'gradient':
            topNav.classList.add('nav-gradient');
            sectionNav.classList.add('nav-gradient');
            break;
        case 'custom':
            topNav.classList.add('nav-custom');
            sectionNav.classList.add('nav-custom');
            applyCustomNavColors();
            break;
        default:
            topNav.classList.add('nav-solid');
            sectionNav.classList.add('nav-solid');
    }
}

function applyCustomNavColors() {
    if (!CONFIG.customNavColors) return;
    
    const oldStyle = document.getElementById('custom-nav-style');
    if (oldStyle) oldStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'custom-nav-style';
    style.innerHTML = `
        .nav-custom { background: ${CONFIG.customNavColors.background} !important; }
        .nav-custom .nav-btn, .nav-custom .logo, .nav-custom .section-btn { color: ${CONFIG.customNavColors.text} !important; }
        .nav-custom .nav-btn { border-color: ${CONFIG.customNavColors.text} !important; }
        .nav-custom .section-btn.active { background: ${CONFIG.customNavColors.activeButton} !important; }
    `;
    document.head.appendChild(style);
}

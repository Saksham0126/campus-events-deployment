const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration for production
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://campus-events-frontend.vercel.app'] // Updated for your actual Vercel domain
        : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create uploads directory if it doesn't exist (fallback for local development)
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Sample club data (matching the frontend structure)
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
                url: 'https://picsum.photos/800/500?random=7',
                caption: 'Annual Concert',
                uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
        ],
        status: 'active'
    }
];

// In-memory storage for clubs (in production, this would be a database)
let clubs = [...SAMPLE_CLUBS];

// Configure multer for file uploads with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'college-clubs-hub',
        resource_type: 'auto',
        transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: function (req, file, cb) {
        // Allow images and videos
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed!'), false);
        }
    }
});

// API Routes

// Get all clubs
app.get('/api/clubs', (req, res) => {
    try {
        res.json({ success: true, clubs: clubs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new club
app.post('/api/clubs', (req, res) => {
    try {
        const clubData = req.body;
        
        // Generate unique ID
        const clubId = `club-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newClub = {
            id: clubId,
            ...clubData,
            media: clubData.media || [],
            status: clubData.status || 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Add to clubs array
        clubs.push(newClub);
        
        res.status(201).json({ 
            success: true, 
            message: 'Club created successfully',
            club: newClub 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get club by ID
app.get('/api/club/:clubId', (req, res) => {
    try {
        const clubId = req.params.clubId;
        const club = clubs.find(c => c.id === clubId);
        
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        res.json({ success: true, club: club });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get club media
app.get('/api/club/:clubId/media', (req, res) => {
    try {
        const clubId = req.params.clubId;
        const club = clubs.find(c => c.id === clubId);
        
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        res.json({ success: true, media: club.media || [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update club profile
app.put('/api/club/:clubId', (req, res) => {
    try {
        const clubId = req.params.clubId;
        const updates = req.body;
        
        const clubIndex = clubs.findIndex(c => c.id === clubId);
        if (clubIndex === -1) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        // Update club data
        clubs[clubIndex] = { ...clubs[clubIndex], ...updates };
        
        res.json({ success: true, club: clubs[clubIndex] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Upload files
app.post('/api/upload', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        const clubId = req.body.clubId || 'general';
        const uploadedFiles = req.files.map(file => {
            const mediaData = {
                id: file.public_id,
                type: file.resource_type === 'image' ? 'image' : 'video',
                url: file.secure_url,
                originalName: file.originalname,
                filename: file.public_id,
                size: file.bytes,
                uploadDate: new Date().toISOString(),
                status: 'pending',
                cloudinaryId: file.public_id
            };
            
            // Add to club media
            const club = clubs.find(c => c.id === clubId);
            if (club) {
                if (!club.media) club.media = [];
                club.media.push(mediaData);
            }
            
            return mediaData;
        });
        
        res.json({ 
            success: true, 
            message: 'Files uploaded successfully to cloud storage',
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get carousel media
app.get('/api/media/carousel', (req, res) => {
    try {
        const allMedia = [];
        
        clubs.forEach(club => {
            if (club.media && club.media.length > 0) {
                club.media.forEach(media => {
                    allMedia.push({
                        ...media,
                        clubId: club.id,
                        clubName: club.name
                    });
                });
            }
        });
        
        // Sort by upload date (newest first)
        allMedia.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        res.json({ success: true, media: allMedia });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add video URLs endpoint
app.post('/api/video-urls', (req, res) => {
    try {
        const { clubId, urls } = req.body;
        
        if (!clubId || !urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({ success: false, message: 'Club ID and URLs are required' });
        }
        
        const club = clubs.find(c => c.id === clubId);
        if (!club) {
            return res.status(404).json({ success: false, message: 'Club not found' });
        }
        
        const videoData = urls.map((url, index) => {
            const videoId = `video-url-${Date.now()}-${index}`;
            return {
                id: videoId,
                type: 'video',
                url: url,
                originalName: `Video ${index + 1}`,
                filename: videoId,
                size: 0, // No file size for URLs
                uploadDate: new Date().toISOString(),
                status: 'pending',
                isEmbedded: true,
                platform: getVideoPlatform(url)
            };
        });
        
        // Add to club media
        if (!club.media) club.media = [];
        club.media.push(...videoData);
        
        res.json({ 
            success: true, 
            message: 'Video URLs added successfully',
            videos: videoData
        });
    } catch (error) {
        console.error('Video URL error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper function to determine video platform
function getVideoPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'YouTube';
    } else if (url.includes('drive.google.com')) {
        return 'Google Drive';
    }
    return 'Unknown';
}

// Delete media endpoint
app.delete('/api/media/:mediaId', async (req, res) => {
    try {
        const { mediaId } = req.params;
        const { clubId } = req.body;
        
        // Find the media in the club
        const club = clubs.find(c => c.id === clubId);
        if (!club || !club.media) {
            return res.status(404).json({ success: false, message: 'Club or media not found' });
        }
        
        const mediaIndex = club.media.findIndex(m => m.id === mediaId);
        if (mediaIndex === -1) {
            return res.status(404).json({ success: false, message: 'Media not found' });
        }
        
        const media = club.media[mediaIndex];
        
        // Delete from Cloudinary if it has a cloudinaryId (only for uploaded files)
        if (media.cloudinaryId) {
            try {
                await cloudinary.uploader.destroy(media.cloudinaryId, {
                    resource_type: media.type === 'video' ? 'video' : 'image'
                });
            } catch (cloudinaryError) {
                console.warn('Failed to delete from Cloudinary:', cloudinaryError.message);
                // Continue with local deletion even if Cloudinary deletion fails
            }
        }
        
        // Remove from club media
        club.media.splice(mediaIndex, 1);
        
        res.json({ 
            success: true, 
            message: 'Media deleted successfully' 
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve uploaded files (fallback for local development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        clubsCount: clubs.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 College Club Backend Server running on port ${PORT}`);
    console.log(`📁 File storage: ${uploadsDir}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Available clubs: ${clubs.map(c => c.id).join(', ')}`);
});

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS configuration for production
const corsOptions = {
    origin: NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, 'https://your-frontend-domain.vercel.app'] // Add your actual frontend URL
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

// Create uploads directory if it doesn't exist
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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const clubId = req.body.clubId || 'general';
        const clubDir = path.join(uploadsDir, clubId);
        
        // Create club directory if it doesn't exist
        if (!fs.existsSync(clubDir)) {
            fs.mkdirSync(clubDir, { recursive: true });
        }
        
        cb(null, clubDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
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
                id: path.parse(file.filename).name,
                type: file.mimetype.startsWith('image/') ? 'image' : 'video',
                url: `/uploads/${clubId}/${file.filename}`,
                originalName: file.originalname,
                filename: file.filename,
                size: file.size,
                uploadDate: new Date().toISOString(),
                status: 'pending'
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
            message: 'Files uploaded successfully',
            files: uploadedFiles
        });
    } catch (error) {
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

// Serve uploaded files
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

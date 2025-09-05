# 🎓 College Club App with File Upload

A modern web application for managing college clubs with full file upload support for images and videos.

## ✨ Features

- **File Upload System**: Support for images (JPG, PNG, GIF) and videos (MP4, MOV, AVI, MKV)
- **Large File Support**: Up to 100MB file uploads
- **Club Management**: Create, edit, and manage club profiles
- **Media Gallery**: Upload and showcase club media
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Instant media updates across the platform

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone and Setup
```bash
git clone <your-repo-url>
cd college-club-app
```

### 2. Start Backend Server
```bash
cd college-club-backend
npm install
npm run dev
```

The backend will start on `http://localhost:3000`

### 3. Start Frontend
```bash
# In a new terminal, from the root directory
python -m http.server 8000
# OR
npx serve .
```

The frontend will be available at `http://localhost:8000`

## 📁 Project Structure

```
college-club-app/
├── components/           # Reusable UI components
├── css/                 # Stylesheets
├── images/              # Static images and placeholders
├── js/                  # Frontend JavaScript
├── pages/               # Additional HTML pages
├── uploads/             # User uploaded files (created automatically)
├── college-club-backend/ # Backend server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── uploads/         # File storage directory
└── index.html           # Main application page
```

## 🔧 Backend API Endpoints

### File Upload
- `POST /api/upload` - Upload files for a club
- `GET /api/club/:clubId/media` - Get media for a specific club
- `GET /api/media/carousel` - Get all media for home page carousel

### File Support
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, MOV, AVI, MKV
- **Max Size**: 100MB per file
- **Max Files**: 10 files per upload

## 📱 Usage

### For Club Managers
1. **Login** with your club credentials
2. **Navigate** to the Upload section
3. **Drag & Drop** or click to select files
4. **Upload** images and videos
5. **Manage** your club's media gallery

### For Administrators
1. **Login** with admin credentials
2. **Review** pending media uploads
3. **Approve/Reject** content
4. **Monitor** all club activities

## 🛠️ Development

### Backend Development
```bash
cd college-club-backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development
```bash
# Use any local server
python -m http.server 8000
npx serve .
live-server
```

### Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3000
NODE_ENV=development
```

## 🚀 Production Deployment

### Backend Deployment
1. **Choose Platform**: Heroku, Vercel, AWS, or DigitalOcean
2. **Set Environment Variables**: Configure production settings
3. **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage)
4. **Database**: Add MongoDB or PostgreSQL for scalability

### Frontend Deployment
1. **Build**: Optimize and minify assets
2. **Host**: Deploy to Netlify, Vercel, or GitHub Pages
3. **CDN**: Use Cloudflare for better performance

## 🔒 Security Features

- **File Type Validation**: Only allowed file types accepted
- **File Size Limits**: Prevents abuse and ensures performance
- **CORS Configuration**: Secure cross-origin requests
- **Input Sanitization**: Prevents XSS and injection attacks

## 📊 Performance

- **File Compression**: Automatic image optimization
- **Lazy Loading**: Media loads as needed
- **Caching**: Browser and server-side caching
- **CDN Ready**: Easy integration with content delivery networks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section below
- Review the API documentation
- Open an issue on GitHub

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill process if needed
taskkill /PID <PID>           # Windows
kill -9 <PID>                 # Mac/Linux
```

#### File Upload Fails
- Check backend server is running
- Verify file size is under 100MB
- Ensure file type is supported
- Check browser console for errors

#### Media Not Loading
- Verify backend server is running on port 3000
- Check file paths in uploads directory
- Ensure CORS is properly configured

#### CORS Errors
- Backend must be running on port 3000
- Frontend should be on a different port
- Check browser console for specific error messages

## 🎯 Future Enhancements

- [ ] User authentication with JWT
- [ ] Real-time notifications
- [ ] Advanced media editing tools
- [ ] Social media integration
- [ ] Analytics dashboard
- [ ] Mobile app development

---

**Made with ❤️ by Saksham**

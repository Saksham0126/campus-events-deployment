#!/bin/bash

# 🚀 College Clubs Hub - Quick Deployment Script
# This script helps you prepare your project for deployment

echo "🚀 College Clubs Hub - Deployment Preparation"
echo "=============================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Staging and committing changes..."
    git add .
    git commit -m "Prepare for production deployment"
    echo "✅ Changes committed"
else
    echo "✅ All changes are already committed"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please set up your GitHub repository:"
    echo "   1. Create a new repository on GitHub"
    echo "   2. Run: git remote add origin https://github.com/yourusername/college-club-app.git"
    echo "   3. Run: git push -u origin main"
else
    echo "✅ Remote repository is configured"
    echo "📤 Pushing to GitHub..."
    git push
    echo "✅ Code pushed to GitHub"
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. 📋 Follow the DEPLOYMENT.md guide"
echo "2. 🌐 Deploy backend to Railway"
echo "3. 🎨 Deploy frontend to Vercel"
echo "4. ⚙️  Update configuration URLs"
echo "5. 🧪 Test your deployment"
echo ""
echo "📖 Read DEPLOYMENT.md for detailed instructions"
echo "🔧 Configuration files created:"
echo "   - vercel.json (frontend deployment)"
echo "   - railway.json (backend deployment)"
echo "   - js/config.js (environment configuration)"
echo "   - college-club-backend/env.example (environment variables)"

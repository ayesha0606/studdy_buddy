#!/bin/bash

echo "🚀 Setting up Virtual Study Buddy Finder..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please update Node.js first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Initialize database
echo "🗄️  Initializing database..."
npm run db:init

if [ $? -ne 0 ]; then
    echo "❌ Failed to initialize database"
    exit 1
fi

cd ..

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Start the development servers:"
echo "   npm run dev:full"
echo ""
echo "2. Or start servers separately:"
echo "   # Terminal 1 (Backend):"
echo "   cd server && npm run dev"
echo "   # Terminal 2 (Frontend):"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3001"
echo ""
echo "🧪 Test accounts:"
echo "   Email: emma@example.com, Password: password123"
echo "   Email: marcus@example.com, Password: password123"
echo "   Email: sofia@example.com, Password: password123"
echo ""
echo "Happy coding! 🚀"

#!/bin/bash

echo "🚀 Setting up Task Manager Full-Stack Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🔧 Setting up environment files..."
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Backend .env file created. Please configure your environment variables."
fi

cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Frontend .env file created. Please configure your environment variables."
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your environment variables in backend/.env and frontend/.env"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🎉 Happy coding!"

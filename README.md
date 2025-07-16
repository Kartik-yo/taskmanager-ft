# Task Manager Full-Stack Application

A modern, full-stack task management application built with React, TypeScript, Node.js, MongoDB Atlas, and Gemini AI.

## 🚀 Features

- **Full CRUD Operations** for task management
- **AI-Powered Assistant** using Gemini API
- **Real-time Updates** with React Query
- **Advanced Filtering** and search capabilities
- **Responsive Design** for all devices
- **Type-Safe** development with TypeScript
- **Modern UI** with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Hook Form** for form handling
- **shadcn/ui** for UI components

### Backend
- **Node.js** with Express
- **MongoDB Atlas** for database
- **Mongoose** for ODM
- **Gemini AI** for intelligent assistance
- **Express Validator** for input validation

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Gemini API key

### Backend Setup
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
\`\`\`

### Frontend Setup
\`\`\`bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
\`\`\`

## 🔧 Environment Variables

### Backend (.env)
\`\`\`
MONGODB_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
\`\`\`

### Frontend (.env)
\`\`\`
VITE_API_URL=http://localhost:5000/api
\`\`\`

## 📚 API Documentation

See [API.md](./docs/API.md) for detailed API documentation.

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for deployment instructions.

## 🤝 Contributing

See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is licensed under the MIT License.

# NeuronixLearn

NeuronixLearn is an AI-powered, adaptive learning platform designed to provide a highly personalized educational experience. By utilizing advanced AI capabilities (powered by Google Gemini), it dynamically adjusts to a student's learning pace, tracks cognitive load, provides tailored study plans, and offers AI-generated media such as slides and videos.

## Features

- **Personalized Learning Paths:** Dynamically generated roadmaps and study plans based on the user's weak topics and interests.
- **AI Media Generation:** Generates learning slides and explanatory videos using AI.
- **Cognitive Load Tracking:** Monitors user performance to adjust difficulty levels and pace.
- **Interactive AI Chatbot:** An embedded assistant that helps clear doubts, provides resources, and tracks weak topics.
- **OTP-Based Authentication:** Secure, frictionless sign-up and login utilizing email OTP and JWTs.
- **Rich Analytics & Dashboards:** Visualize progress, performance, and learning behavior with interactive charts.
- **Teacher & Admin Panels:** Robust interfaces for creating courses, publishing exams, and monitoring platform usage.
- **Interactive Diary:** A secure, password-protected learning diary for students to jot down notes and reflections.

## Technology Stack

### Frontend
- **React + Vite** for blazing-fast development and optimized production builds.
- **Material UI (MUI)** for a polished and accessible component system.
- **Framer Motion & GSAP** for smooth, engaging animations and transitions.
- **Three.js** for 3D visual elements.
- **Recharts** for interactive analytics dashboards.

### Backend
- **Node.js + Express** for a fast and scalable REST API.
- **MongoDB (Mongoose)** for flexible and robust data modeling.
- **Google Generative AI (Gemini)** for natural language processing, generating recommendations, and creating learning materials.
- **JWT & Bcrypt** for secure user sessions and password hashing.
- **Express Rate Limit & Helmet** for enhanced security.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Running locally or via MongoDB Atlas)
- Google Gemini API Key (for AI features)

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone https://github.com/Charanchandra1006/NueronixLearn_Web-APP.git
   cd NueronixLearn_Web-APP
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5050
   MONGODB_URI=mongodb://localhost:27017/nueronixlearn
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend/` directory (Vite defaults to proxying `/api` if configured in `vite.config.ts`):
   ```env
   VITE_API_URL=http://localhost:5050/api
   ```

### Running Locally

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   *The backend will run on `http://localhost:5050`.*

2. **Start the frontend application:**
   ```bash
   cd frontend
   npm run dev
   ```
   *The frontend will run on `http://localhost:3000`.*

Open your browser and navigate to `http://localhost:3000` to start using NeuronixLearn!

## License
This project is proprietary and confidential.

# SEAWAYS — Maritime Intelligence & Digital Twin Platform

SEAWAYS is a production-quality maritime supply-chain intelligence platform designed for high-stakes tracking and risk analysis.

## 🚀 Key Features
- **Live Multi-Vessel Tracking**: Real-time position updates via AISStream.io (with dead-reckoning fallback).
- **Digital Twin Simulation**: 48-hour mission projection using haversine math and sea-only routing.
- **Bi-Factor Risk Assessment**: Geopolitical conflict monitoring + Open-Meteo marine weather integration.
- **AI Assistant**: Google Gemini-powered intelligence core with full system context.
- **Manager Escalation**: Automated alert escalation logic for CRITICAL and HIGH severity events.

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet.js, Zustand, Framer Motion, Recharts.
- **Backend**: Node.js 20, Express 5, `ws`, `node-cron`, `better-sqlite3`, `@turf/turf`.

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- API Keys for **AISStream.io** and **Google Gemini** (Optional for Demo Mode).

### 2. Setup
```bash
# Clone the repository and navigate into it
cd seaways

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 3. Configuration
Copy `.env.example` to `.env` in the `server` directory and fill in your keys.

### 4. Running the Platform
Terminal 1 (Backend):
```bash
cd server
npm start
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` to access the platform.

## ⚓ Demo Mode
If no API keys are provided, the system automatically enters **Demo Mode**, using pre-loaded high-fidelity sample data and dead-reckoning simulations.

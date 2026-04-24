# ROADWAYS 2.0 — India Freight Intelligence & Digital Twin System

**"Every Road. Every Mile. Predicted. Protected."**

ROADWAYS 2.0 is an internationally competitive road freight intelligence platform built for India. It features real-time multi-truck tracking, digital twin simulation, agentic AI, and blockchain cargo integrity.

## 🚀 Quick Start

### 1. Prerequisite Installations
- **Node.js**: Recommended version **20.x** (LTS).
- **Build Tools**: Ensure `node-gyp` can compile native modules (Visual Studio Build Tools for Windows).
- **Alternative**: If `sqlite3` fails to compile, the system can be adapted to `sql.js` (WebAssembly).

### 2. Install Dependencies
```bash
npm run setup
```

### 3. Database Initialization
Initialize and seed the SQLite database:
```bash
node backend/db/init.js
node backend/db/seed.js
```

### 4. Run the Platform
Start both the backend and frontend simultaneously:
```bash
npm run dev
```

The system will be available at:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3001`

## 🛠 Tech Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS 3, Framer Motion 11
- **Mapping**: Leaflet.js, OpenStreetMap, OSRM
- **3D Digital Twin**: Three.js, @react-three/fiber
- **Backend**: Node.js 20, Express 5, Better-SQLite3
- **AI**: Gemini 2.0 Flash, Claude API, LangChain.js
- **Blockchain**: Polygon Mumbai Testnet (Web3.js)
- **IoT**: ThingSpeak, MQTT.js

## 🌟 Key Features
- **Live Tracking**: Real-time position updates on NH/SH networks.
- **Digital Twin**: 40-hour predictive simulation with 3D truck models.
- **Agentic AI**: 10 specialized agents monitoring roads, weather, security, and fatigue.
- **Blockchain Integrity**: Immutable cargo event logging on Polygon.
- **Intelligence Fusion**: News, social media, and satellite data synthesis.

## 📁 Project Structure
- `backend/`: Node.js server, agents, database logic, simulation engine.
- `frontend/`: React application, mapping, 3D views, analytics.
- `db/`: SQLite database storage.
- `.env`: Environment configuration.

---
© 2026 Roadways Intelligence Network. Port Node 04.

# RAILWAYS 2.0 — India Rail Intelligence & Digital Twin System

"Every Track. Every Train. Predicted. Protected."

The world's most advanced railway intelligence platform for Indian Railways, covering Broad Gauge (BG), Metre Gauge (MG), Narrow Gauge (NG), and Dedicated Freight Corridors (DFC).

## Features

- **Live Fleet Tracking**: Real-time integration mapped over OpenRailwayMap track segment paths.
- **Predictive Event Timeline**: LangChain-powered Agentic Intelligence forecasting disruptions up to 40 hours early.
- **3D Digital Twin**: High-fidelity Three.js simulation.
- **IoT Integration**: Track wagon telemetry and hotbox detectors.
- **KAVACH Support**: Built-in metrics and analysis.

## Getting Started

Make sure you have set up your `.env` properly. 

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
   
2. Seed the database with the sample 10 trains (simulating an entire fleet!):
   \`\`\`bash
   node api/db/seed.js
   \`\`\`
   
3. Run the Backend API and WebSocket:
   \`\`\`bash
   node api/server.js
   \`\`\`
   
4. Run the Frontend Dashboard:
   \`\`\`bash
   npm run dev
   \`\`\`
   
Visit `http://localhost:3000` to enter the command center.

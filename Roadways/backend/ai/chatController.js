const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_KEY");

async function handleChat(req, res, db) {
  const { message } = req.body;
  
  db.all('SELECT id, registration_number, last_speed FROM vehicles WHERE is_active = 1', async (err, activeVehicles) => {
    db.all('SELECT * FROM intelligence_events ORDER BY created_at DESC LIMIT 5', async (err, recentAlerts) => {
      try {
        const systemPrompt = `
          You are ROADWAYS AI, the neural core of the world's most advanced freight intelligence platform for India.
          Current System Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
          Active Fleet: ${activeVehicles?.length || 0} vehicles.
          Key Situational Awareness:
          - Vehicles: ${JSON.stringify(activeVehicles || [])}
          - Recent Alerts: ${JSON.stringify(recentAlerts || [])}
          Response Style: Professional, intelligence-focused, using Indian terminology.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent([systemPrompt, message]);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text, source: 'GEMINI_2.0_FLASH' });
      } catch (err) {
        res.status(500).json({ reply: "Neural link disrupted.", error: err.message });
      }
    });
  });
}

module.exports = { handleChat };

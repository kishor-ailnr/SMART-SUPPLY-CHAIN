import axios from 'axios';

export class AIChatAgent {
  constructor(vesselRegistry, riskAgent, alertAgent) {
    this.vesselRegistry = vesselRegistry;
    this.riskAgent = riskAgent;
    this.alertAgent = alertAgent;
    this.apiKey = process.env.GEMINI_API_KEY;
    this.sessions = new Map(); // sessionId -> history
  }

  async handleChat(sessionId, message) {
    if (!this.apiKey || this.apiKey === 'your_google_gemini_api_key_here') {
      return "SEAWAYS AI is currently in offline mode. Please configure your GEMINI_API_KEY.";
    }

    const history = this.sessions.get(sessionId) || [];
    const systemSnapshot = this.getSystemSnapshot();

    const systemPrompt = `
      You are SEAWAYS AI, the intelligent assistant for the SEAWAYS Maritime Intelligence Platform.
      You have full real-time access to: all active vessel positions, their routes, risk assessments, weather forecasts, ETA predictions, delay reports, active alerts, risk zone data, and trip history.
      You can answer questions about any vessel, any route, any alert, and any weather condition.
      You can also perform actions: [ACTION:ACKNOWLEDGE_ALERT:alertId], [ACTION:RUN_TWIN:vesselId].
      Always respond in concise, professional maritime language.
      
      CURRENT SYSTEM SNAPSHOT:
      ${JSON.stringify(systemSnapshot)}
    `;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            ...history,
            { role: 'user', parts: [{ text: message }] }
          ]
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Update history
      history.push({ role: 'user', parts: [{ text: message }] });
      history.push({ role: 'model', parts: [{ text: aiResponse }] });
      if (history.length > 20) history.splice(0, 2);
      this.sessions.set(sessionId, history);

      return aiResponse;
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message);
      return "I apologize, but I am having trouble connecting to my central intelligence core right now.";
    }
  }

  getSystemSnapshot() {
    return {
      vessels: Array.from(this.vesselRegistry.values()).map(v => ({
        id: v.vesselId,
        name: v.name,
        lat: v.lat,
        lng: v.lng,
        risk: v.riskLevel,
        eta: v.etaHours,
        alerts: v.alerts.filter(a => !a.acknowledged).length
      })),
      timestamp: new Date().toISOString()
    };
  }
}

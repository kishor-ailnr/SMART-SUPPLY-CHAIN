const { ChatOpenAI } = require("@langchain/openai"); // Using as example for generic LLM if API keys are swapped
const { ChatGoogleGenAI } = require("@langchain/google-genai");
const { ChatAnthropic } = require("@langchain/anthropic");
const { PromptTemplate } = require("@langchain/core/prompts");

// Initialize LLMs based on available keys
let primaryModel;
let secondaryModel;

if (process.env.ANTHROPIC_API_KEY) {
  primaryModel = new ChatAnthropic({ modelName: "claude-3-opus-20240229", temperature: 0.1 });
}
if (process.env.GEMINI_API_KEY) {
  secondaryModel = new ChatGoogleGenAI({ modelName: "gemini-1.5-pro", temperature: 0.1 });
}

// Fallback logic
const getModel = () => primaryModel || secondaryModel;

class RailwayIntelligenceAgents {
  constructor() {
    this.model = getModel();
  }

  async runAgent(agentName, data) {
    if (!this.model) return { error: "No AI model configured." };

    const promptMap = {
      TRAIN_POSITION_INTELLIGENCE: `Analyze train position discrepancies based on MTES, RailYatri, and GPS data. Determine if there's an anomaly or gap: {data}`,
      WEATHER_TRACK_CONDITION: `Analyze meteorological data (Open-Meteo, NOAA GFS) along the route for fog, flood, and temperature risks: {data}`,
      NOTAM_BLOCK_SECTION: `Parse block section notifications, train controllers messages and NTES schedules for potential maintenance disruptions: {data}`,
      STATION_INTELLIGENCE: `Analyze crowd intelligence, twitter mentions, and station facilities to output station specific alerts: {data}`,
      CARGO_INTEGRITY: `Examine IoT wagon sensors, door seals, axle temperature (hotbox) data: {data}`,
      CREW_HOER_COMPLIANCE: `Analyze loco pilot, ALP, and guard duty hours against India Railway HOER rules: {data}`,
      ROUTE_OPTIMIZATION: `Compute alternative track diversions preserving track-gauge compatibility and optimal travel times considering section blockages: {data}`,
      SAFETY_INTELLIGENCE: `Evaluate overall track geometry indices, level crossing anomalies, KAVACH operation faults from telemetry: {data}`,
      DFC_INTELLIGENCE: `For Dedicated Freight Corridors, verify double-stack container height clearances, MMLP congestion and Loco WAG-12B health: {data}`,
      FINANCIAL_INTELLIGENCE: `Assess fuel price, demurrage/wharfage accumulation penalties, and DFC tariff savings: {data}`,
      POLITICAL_SOCIAL_INTELLIGENCE: `Process GDELT/social alerts for 'rail roko' agitations, track blockades, or VIP movement restrictions: {data}`,
      INFRASTRUCTURE_HEALTH: `Inspect Bridge Health Monitors (BHM) feeds, track buckling indices, and OHE conditions: {data}`,
      HERITAGE_RAILWAY_INTELLIGENCE: `Supervise Narrow/Meter gauge mountain heritage parameters - steam boiler pressure, avalanche risk and UNESCO compliance: {data}`,
    };

    const templateString = promptMap[agentName] || `Analyze the following railway data: {data}`;
    const prompt = PromptTemplate.fromTemplate(templateString);
    
    try {
      const chain = prompt.pipe(this.model);
      const res = await chain.invoke({ data: JSON.stringify(data) });
      return res.content;
    } catch (e) {
      console.error(`${agentName} execution error:`, e);
      return `Agent ${agentName} analysis failed.`;
    }
  }
}

module.exports = new RailwayIntelligenceAgents();

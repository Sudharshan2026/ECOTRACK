import { GoogleGenAI, Type } from "@google/genai";
import { DailyReport, AIRecommendation } from "../types";

export const getAIRecommendations = async (report: DailyReport): Promise<AIRecommendation[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze this daily carbon footprint report and provide 3 highly professional, scientifically-backed, and personalized recommendations.
    
    User Data:
    - Daily Footprint: ${report.totalEmissions} kg CO2
    - Efficiency Score: ${report.score}/100
    - Major Source: ${report.breakdown[0]?.category || 'N/A'}
    
    Return the advice in a professional, encouraging tone. Ensure recommendations are diverse (e.g., one habit change, one home improvement, one lifestyle shift).
  `;

  try {
    // Fix: Use gemini-3-pro-preview for complex reasoning tasks requiring professional and scientific output
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              impact: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['title', 'description', 'impact', 'difficulty'],
          },
        },
      },
    });

    // Fix: Access response.text as a property and check for undefined before parsing JSON
    const text = response.text;
    if (!text) {
      throw new Error("Gemini API returned an empty response.");
    }
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    return [
      { title: "Optimize Home Insulation", description: "Reducing thermal leakage can lower AC/Heater usage by up to 30%.", impact: "High", difficulty: "Moderate" },
      { title: "Transition to Plant-Based", description: "Even one day a week without meat significantly lowers your nitrogen footprint.", impact: "Medium", difficulty: "Easy" },
      { title: "Active Commuting", description: "Biking for trips under 5km eliminates combustion emissions entirely.", impact: "High", difficulty: "Challenging" }
    ];
  }
};
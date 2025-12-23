import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeDrugRequest = async (drugName: string, notes: string): Promise<string> => {
  if (!apiKey) return "AI Analysis unavailable: No API Key configured.";

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are a pharmaceutical logic assistant for a rare drug sourcing platform.
      Analyze the following drug request:
      Drug Name: ${drugName}
      Patient Notes: ${notes}

      Please provide a brief assessment (max 100 words) covering:
      1. Is this typically considered a rare/orphan drug?
      2. Are there common supply chain constraints?
      3. Any critical handling requirements (e.g., cold chain)?
      
      Do not provide medical advice. Focus on logistics and pharmacology facts.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Analysis complete but no text returned.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Analysis failed due to a technical error.";
  }
};

export const summarizeConsultation = async (reason: string): Promise<string> => {
  if (!apiKey) return "Summary unavailable.";
  
  try {
     const model = 'gemini-3-flash-preview';
     const prompt = `Summarize the following patient consultation reason into a medical category (e.g., Cardiology, Dermatology, General) and a 1-sentence triage summary: "${reason}"`;
     
     const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    return "Summary failed.";
  }
}

import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from "@google/genai";

type VercelRequest = IncomingMessage & { body: any; query: Record<string, string | string[]> };
type VercelResponse = ServerResponse & { status: (code: number) => VercelResponse; json: (data: any) => void; };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    console.error("[AI API] GEMINI_API_KEY is not configured.");
    return res.status(500).json({ error: 'AI service is not configured. Set GEMINI_API_KEY in environment.' });
  }

  try {
    const { type, drugName, notes, reason } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    if (type === 'analyze') {
      // Drug request analysis with Google Search grounding
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          You are a pharmaceutical logic assistant for a rare drug sourcing platform.
          Analyze the following drug request:
          Drug Name: ${drugName}
          Patient Notes: ${notes}

          Please provide a brief assessment (max 100 words) covering:
          1. Is this typically considered a rare/orphan drug?
          2. Are there common supply chain constraints?
          3. Any critical handling requirements (e.g., cold chain)?
          
          Do not provide medical advice. Focus on logistics and pharmacology facts.
        `,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "Analysis complete but no text returned.";

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title || 'Source',
          uri: chunk.web.uri
        }))
        .filter((source: any) => source.uri);

      return res.status(200).json({ text, sources });

    } else if (type === 'summarize') {
      // Consultation summarization
      const prompt = `Summarize the following patient consultation reason into a medical category (e.g., Cardiology, Dermatology, General) and a 1-sentence triage summary: "${reason}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return res.status(200).json({ text: response.text || "No summary generated." });

    } else {
      return res.status(400).json({ error: 'Invalid type. Use "analyze" or "summarize".' });
    }
  } catch (error: any) {
    console.error("[AI API] Error:", error.message);
    return res.status(500).json({ error: error.message || 'AI analysis failed.' });
  }
}

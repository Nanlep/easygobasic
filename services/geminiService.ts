
import { GoogleGenAI, Modality } from "@google/genai";

// Use a factory function to always get a fresh instance with the latest key
export const getAIInstance = () => {
  const key = process.env.API_KEY;
  if (!key || key === "undefined" || key === "") {
    throw new Error("AI Configuration Missing: The API Key was not found at build time. Please ensure GEMINI_API_KEY is set in Vercel and trigger a fresh deployment.");
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Analyzes a drug request using Gemini 3 Flash and Google Search grounding.
 * Returns both the assessment text and the extracted grounding sources.
 */
export const analyzeDrugRequest = async (drugName: string, notes: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
  try {
    const ai = getAIInstance();
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
    
    // Extract grounding URLs from chunks for reporting
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri
      }))
      .filter((source: any) => source.uri);

    return { text, sources };
  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    throw error; // Re-throw so the UI can catch it and display the message
  }
};

/**
 * Summarizes consultation details using Gemini.
 */
export const summarizeConsultation = async (reason: string): Promise<string> => {
  try {
     const ai = getAIInstance();
     const prompt = `Summarize the following patient consultation reason into a medical category (e.g., Cardiology, Dermatology, General) and a 1-sentence triage summary: "${reason}"`;
     
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Summary failed:", error);
    return "Summary failed.";
  }
};

// --- Audio Encoding & Decoding Helpers for Live API ---

/**
 * Decodes a base64 string into a Uint8Array.
 */
export function decodeAudio(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array into a base64 string.
 */
export function encodeAudio(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Gemini AI Service — Client-side proxy to /api/ai-analyze
 * 
 * All AI calls are now routed through the serverless function
 * so the API key stays server-side and is never exposed to the browser.
 */

/**
 * Analyzes a drug request via the AI proxy endpoint.
 * Returns the assessment text and grounding sources.
 */
export const analyzeDrugRequest = async (drugName: string, notes: string): Promise<{ text: string, sources: { title: string, uri: string }[] }> => {
  try {
    const response = await fetch('/api/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'analyze', drugName, notes }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'AI analysis failed.' }));
      throw new Error(err.error || `AI service returned ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};

/**
 * Summarizes consultation details via the AI proxy endpoint.
 */
export const summarizeConsultation = async (reason: string): Promise<string> => {
  try {
    const response = await fetch('/api/ai-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'summarize', reason }),
    });

    if (!response.ok) {
      return "Summary failed.";
    }

    const data = await response.json();
    return data.text || "No summary generated.";
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

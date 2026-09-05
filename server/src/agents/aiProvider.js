// AI Provider with Google Gemini integration & deterministic fintech engine fallback
import dotenv from 'dotenv';
dotenv.config();

/**
 * Call Google Gemini API if GEMINI_API_KEY is available.
 * Returns structured JSON or null on failure/missing key.
 */
export const queryGemini = async (prompt, systemInstruction = '') => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_optional') {
    return null; // Fallback to deterministic engine
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}\n\nReturn strictly valid JSON only.` }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[AIProvider] Gemini returned status ${res.status}. Falling back to deterministic engine.`);
      return null;
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.warn(`[AIProvider] Gemini request failed (${error.message}). Falling back to deterministic engine.`);
    return null;
  }
};

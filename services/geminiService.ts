import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Generates a streaming text response for a chat conversation.
 */
export const streamChatResponse = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Convert history format if necessary, or just use sendMessageStream with the latest message
    // Note: The SDK manages history in a Chat object. Ideally, we recreate the chat state or keep the object alive.
    // For simplicity in this stateless service, we initiate a new chat with history.
    
    const chat = ai.chats.create({
      model,
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      })),
      config: {
        temperature: 0.7,
      }
    });

    const resultStream = await chat.sendMessageStream({ message: newMessage });
    
    let fullText = '';
    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      const text = c.text || ''; // Access property directly
      if (text) {
        fullText += text;
        onChunk(text);
      }
    }
    return fullText;

  } catch (error) {
    console.error("Chat Error:", error);
    throw error;
  }
};

/**
 * Analyzes an image with a text prompt.
 */
export const analyzeImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: prompt || "Describe this image in detail."
          }
        ]
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Vision Error:", error);
    throw error;
  }
};

/**
 * Generates creative writing or structured text.
 */
export const generateCreativeText = async (
  prompt: string,
  format: 'blog' | 'email' | 'summary' | 'poem'
): Promise<string> => {
  try {
    const systemInstruction = `You are an expert writer specialized in ${format}. 
    Format your response beautifully using Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Text Gen Error:", error);
    throw error;
  }
};
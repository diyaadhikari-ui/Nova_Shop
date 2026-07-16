import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const prompt = `
You are Nova AI, a friendly shopping assistant for Nova Shop.
Nova Shop sells Nepalese wall art, mandala art, contemporary prints, minimalist art, religious art, and home decor.

Reply briefly and clearly.

User message: ${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      reply: response.text || "Sorry, I could not generate a response.",
    });
  } catch (error) {
    console.error("AI error:", error);
    res.status(500).json({
      success: false,
      message: "AI assistant failed",
    });
  }
};
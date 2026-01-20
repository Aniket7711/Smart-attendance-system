
import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async verifyAttendance(imageBase64: string, studentName: string): Promise<VerificationResult> {
    try {
      // Use Gemini 3 Flash for fast image analysis
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64.split(',')[1] || imageBase64
              }
            },
            {
              text: `Analyze this classroom photo. Is student "${studentName}" clearly visible and looking at the camera? 
              Return a JSON object with: 
              - verified: boolean
              - confidence: number (0-1)
              - message: string explanation
              - detectedName: string (if you see other students, name them if labels are visible, otherwise null)`
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              message: { type: Type.STRING },
              detectedName: { type: Type.STRING }
            },
            required: ["verified", "confidence", "message"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      return {
        verified: result.verified ?? false,
        confidence: result.confidence ?? 0,
        message: result.message ?? "Analysis complete",
        detectedName: result.detectedName
      };
    } catch (error) {
      console.error("Gemini Verification Error:", error);
      return {
        verified: false,
        confidence: 0,
        message: "AI service unavailable. Please retry."
      };
    }
  }
}

export const geminiService = new GeminiService();

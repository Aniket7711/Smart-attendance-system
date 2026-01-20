import { GoogleGenerativeAI } from '@google/generative-ai';
import { VerificationResult } from '../types/index.js';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn('⚠️ GEMINI_API_KEY is not set. AI verification will be disabled.');
    }
  }

  async verifyAttendance(imageBase64: string, studentName: string): Promise<VerificationResult> {
    if (!this.genAI) {
      return {
        verified: false,
        confidence: 0,
        message: 'AI service not configured. Please set GEMINI_API_KEY.'
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Remove data URL prefix if present
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;

      const prompt = `Analyze this classroom photo. Is student "${studentName}" clearly visible and looking at the camera? 
        Return a JSON object with: 
        - verified: boolean
        - confidence: number (0-1)
        - message: string explanation
        - detectedName: string (if you see other students, name them if labels are visible, otherwise null)
        
        Only return the JSON object, no other text.`;

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data
          }
        },
        prompt
      ]);

      const response = result.response;
      const text = response.text();
      
      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        verified: parsed.verified ?? false,
        confidence: parsed.confidence ?? 0,
        message: parsed.message ?? 'Analysis complete',
        detectedName: parsed.detectedName
      };
    } catch (error) {
      console.error('Gemini Verification Error:', error);
      return {
        verified: false,
        confidence: 0,
        message: 'AI service unavailable. Please retry.'
      };
    }
  }
}

// Lazy initialization to avoid errors at import time
let _geminiService: GeminiService | null = null;

export const getGeminiService = (): GeminiService => {
  if (!_geminiService) {
    _geminiService = new GeminiService();
  }
  return _geminiService;
};

export const geminiService = {
  verifyAttendance: (imageBase64: string, studentName: string) => {
    return getGeminiService().verifyAttendance(imageBase64, studentName);
  }
};

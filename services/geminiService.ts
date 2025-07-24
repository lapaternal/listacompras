import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { GEMINI_TEXT_MODEL } from '../constants';

// IMPORTANT: This relies on process.env.API_KEY being available in the execution environment.
// For pure frontend apps, this usually means it's bundled via a build process (e.g., Vite, Webpack).
// If not set, Gemini features will be disabled.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  } catch (error) {
    console.error("Error al inicializar GoogleGenAI:", error);
    // API_KEY might be invalid or other initialization error
    ai = null; 
  }
} else {
  console.warn("API_KEY para Gemini no está configurada. Las funciones de Gemini estarán deshabilitadas.");
}

export const isGeminiAvailable = (): boolean => !!ai;

export interface SuggestedProductDetails {
  name: string;
  description: string;
}

export const suggestProductDetailsFromImage = async (
  base64ImageDataWithPrefix: string, // e.g., "data:image/png;base64,ABDC..."
  mimeType: string // e.g., "image/png"
): Promise<SuggestedProductDetails | null> => {
  if (!ai) {
    console.warn("IA Gemini no inicializada, no se pueden sugerir detalles del producto.");
    return null;
  }

  // Extract base64 data part by removing the prefix
  const base64Data = base64ImageDataWithPrefix.split(',')[1];
  if (!base64Data) {
    console.error("Formato de datos de imagen base64 inválido.");
    return null;
  }

  try {
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64Data,
      },
    };
    const textPart = {
      text: "Basado en esta imagen de un producto de supermercado, sugiere un nombre de producto conciso (máximo 5 palabras) y una descripción corta (máximo 20 palabras). Devuelve un objeto JSON válido con las claves 'name' y 'description'. Ejemplo: {\"name\": \"Manzanas Orgánicas\", \"description\": \"Manzanas orgánicas frescas y crujientes, perfectas para picar.\"}"
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'The name of the product (max 5 words).',
            },
            description: {
              type: Type.STRING,
              description: 'A short description of the product (max 20 words).',
            },
          },
          required: ['name', 'description'],
        },
      }
    });

    const jsonStr = response.text.trim();
    // With a responseSchema, parsing markdown fences is no longer necessary.
    const parsed = JSON.parse(jsonStr);
    
    if (parsed && typeof parsed.name === 'string' && typeof parsed.description === 'string') {
      return { name: parsed.name, description: parsed.description };
    }
    console.warn("La respuesta de Gemini no contenía los campos 'name' y 'description' esperados:", parsed);
    return null;
  } catch (error) {
    console.error("Error al sugerir detalles del producto desde la imagen usando Gemini:", error);
    // Consider specific error handling, e.g., for quota issues, API key problems
    return null;
  }
};
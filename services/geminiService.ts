
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Helper to clean base64 string
const cleanBase64 = (base64Data: string) => {
  return base64Data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  const cleanImage = cleanBase64(base64Image);

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanImage
            }
          },
          {
            text: `Analise esta imagem de comida. Identifique o prato, estime o tamanho da porção (ex: 200g, 1 prato, 2 fatias) e calcule os valores nutricionais para essa porção específica. Retorne um objeto JSON. As descrições e nomes devem estar em Português do Brasil.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { type: Type.STRING, description: "Nome do prato" },
            portion: { type: Type.STRING, description: "Estimativa do tamanho da porção (ex: 150g)" },
            description: { type: Type.STRING, description: "Breve descrição visual" },
            calories: { type: Type.NUMBER, description: "Calorias estimadas (apenas números)" },
            protein: { type: Type.NUMBER, description: "Proteínas em gramas (apenas números)" },
            carbs: { type: Type.NUMBER, description: "Carboidratos em gramas (apenas números)" },
            fat: { type: Type.NUMBER, description: "Gorduras em gramas (apenas números)" },
            ingredients: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Lista dos ingredientes identificados"
            }
          },
          required: ["foodName", "portion", "calories", "protein", "carbs", "fat", "ingredients", "description"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("Sem resposta de texto do Gemini");
  } catch (error) {
    console.error("Erro ao analisar comida:", error);
    throw error;
  }
};

export const findFitnessRecipes = async (ingredients: string, dietaryType?: string): Promise<Recipe[]> => {
  // Atualizado para pedir instruções e ser flexível
  const prompt = `Sugira 3 receitas fitness saudáveis que utilizem PRINCIPALMENTE estes ingredientes: ${ingredients}. Você pode adicionar outros ingredientes comuns de despensa se necessário para completar a receita. Inclua o modo de preparo passo a passo. Retorne JSON válido. O idioma deve ser Português do Brasil.`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              timeToCook: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              calories: { type: Type.NUMBER },
              protein: { type: Type.NUMBER },
              carbs: { type: Type.NUMBER },
              fat: { type: Type.NUMBER },
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista ordenada de passos para o preparo" 
              }
            },
            required: ["name", "description", "timeToCook", "difficulty", "calories", "protein", "carbs", "fat", "ingredients", "instructions"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Recipe[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar receitas:", error);
    throw error;
  }
};

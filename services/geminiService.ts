

import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import { UserProfile, ChatMessage, Meal, NutritionLog, WeightEntry, User, AIInsight, Exercise, GeneratedMeal } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const getSystemInstruction = (profile: UserProfile): string => {
  return `
    Eres Hypertik, un asistente experto en fitness y nutrición basado en evidencia científica. Tu propósito es ayudar a los usuarios a alcanzar sus metas de composición corporal de forma segura y efectiva.

    Contexto del usuario actual:
    - Nombre: ${profile.name}
    - Edad: ${profile.age} años
    - Género: ${profile.gender}
    - Peso: ${profile.weight} kg
    - Altura: ${profile.height} cm
    - % Grasa Corporal: ${profile.bodyFat}%
    - Somatotipo: ${profile.somatotype}
    - Objetivo: ${profile.goal}
    - Experiencia: ${profile.experience}
    - Días de entrenamiento: ${profile.trainingDays} por semana
    - Tipo de dieta: ${profile.dietType}
    - Horario: Despierta a las ${profile.wakeUpTime}, entrena a las ${profile.trainingTime}, duerme a las ${profile.sleepTime}.
    - Lesiones o limitaciones: ${profile.injuries || 'Ninguna especificada'}
    - Alimentos preferidos: ${profile.preferredFoods || 'No especificados'}
    - Alimentos a evitar: ${profile.avoidedFoods || 'Ninguno especificado'}
    - Suplementos: Proteína (${profile.proteinSupplementName || 'genérica'}), Carbohidratos (${profile.carbSupplementName || 'genérico'})

    Tus respuestas DEBEN seguir estas directrices:
    1.  **Basado en Evidencia:** Proporciona información alineada con el consenso científico actual.
    2.  **Personalizado:** Adapta tus respuestas al perfil completo del usuario. Usa su horario, preferencias y lesiones para dar consejos específicos.
    3.  **Seguro y Sostenible:** Prioriza la salud y la adherencia a largo plazo.
    4.  **Claro y Conciso:** Usa un lenguaje fácil de entender.
    5.  **Motivador:** Tu tono debe ser de apoyo.
    6.  **No eres un médico:** Si una pregunta es médica, recomienda consultar a un profesional de la salud.
    `;
};


export const createChat = (profile: UserProfile): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(profile),
        },
    });
};


export const getNutritionFromImage = async (base64Image: string): Promise<Meal | null> => {
    const model = 'gemini-2.5-flash';
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1],
        },
    };

    const textPart = {
        text: `Analiza esta imagen de una etiqueta nutricional. Extrae el nombre del producto, calorías, proteínas, carbohidratos y grasas por cada 100g o por porción si es lo único disponible. Devuelve SOLO un objeto JSON con el formato: {"name": "string", "calories": number, "protein": number, "carbs": number, "fat": number}. Si no puedes encontrar un valor, usa 0.`,
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        return parsedData as Meal;

    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", e);
        return null;
    }
};

export const generateDietPlan = async (profile: UserProfile, targets: { calories: number, protein: number, carbs: number, fat: number }): Promise<Omit<GeneratedMeal, 'id' | 'completed'>[] | null> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Crea un plan de nutrición detallado para un **día de entrenamiento** para un usuario con el siguiente perfil y objetivos.

**Perfil y Objetivos:**
- Dieta: ${profile.dietType}
- Horario: Despierta a las ${profile.wakeUpTime}, entrena a las ${profile.trainingTime}, duerme a las ${profile.sleepTime}.
- Suplementos: Proteína en polvo (${profile.proteinSupplementName || 'genérica'}), carbohidratos en polvo (${profile.carbSupplementName || 'genérico'}).
- Objetivos diarios: ~${targets.calories.toFixed(0)} kcal, ~${targets.protein.toFixed(0)}g Proteína, ~${targets.carbs.toFixed(0)}g Carbs, ~${targets.fat.toFixed(0)}g Grasa.
- Preferencias alimentarias: Incluir si es posible alimentos como ${profile.preferredFoods || 'variados'}.
- Alimentos a evitar: Evitar estrictamente ${profile.avoidedFoods || 'ninguno'}.

**Instrucciones Esenciales:**
1.  Genera un total de **5 ingestas**: 4 comidas sólidas y 1 batido de suplementos.
2.  **Temporización de Nutrientes:**
    - Coloca una comida rica en carbohidratos 1-2 horas antes del entrenamiento (${profile.trainingTime}).
    - Coloca el batido de suplementos **inmediatamente después** del entrenamiento.
    - Coloca una comida sólida y completa 1-2 horas después del batido.
3.  **El Batido Post-Entreno:**
    - Nómbralo "Batido Post-Entrenamiento" o similar.
    - Debe incluir el suplemento de proteína y el de carbohidratos que usa el usuario.
    - Asígnale aproximadamente 30-40g de proteína y 40-60g de carbohidratos.
4.  **Formato de Respuesta OBLIGATORIO:**
    - La respuesta debe ser **EXCLUSIVAMENTE un array de objetos JSON válido**, sin texto introductorio, explicaciones, ni marcado de código.
    - Cada objeto representa una ingesta y debe tener la siguiente estructura:
    {
      "name": "string",
      "ingredients": ["string con cantidad", "string con cantidad"],
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "type": "string (debe ser 'meal' para comidas sólidas o 'supplement' para el batido)"
    }

**Ejemplo de Salida Válida:**
[
  { "name": "Desayuno: Gachas de avena y frutos rojos", "ingredients": ["Avena (80g)", "Leche (200ml)", "Frutos rojos (50g)"], "calories": 500, "protein": 20, "carbs": 80, "fat": 10, "type": "meal" },
  { "name": "Almuerzo: Salmón con quinoa y espárragos", "ingredients": ["Salmón (150g)", "Quinoa (70g crudo)", "Espárragos (100g)"], "calories": 650, "protein": 40, "carbs": 60, "fat": 25, "type": "meal" },
  { "name": "Comida Pre-Entreno: Pechuga de pavo con batata", "ingredients": ["Pechuga de pavo (150g)", "Batata (200g)"], "calories": 500, "protein": 40, "carbs": 70, "fat": 5, "type": "meal" },
  { "name": "Batido Post-Entrenamiento", "ingredients": ["${profile.proteinSupplementName || 'Proteína Whey'} (35g)", "${profile.carbSupplementName || 'Amilopectina'} (50g)", "Agua (300ml)"], "calories": 335, "protein": 30, "carbs": 50, "fat": 2, "type": "supplement" },
  { "name": "Cena: Revuelto de tofu y verduras", "ingredients": ["Tofu firme (200g)", "Brócoli, pimiento, cebolla (200g)", "Aceite de oliva (10ml)"], "calories": 450, "protein": 30, "carbs": 20, "fat": 28, "type": "meal" }
]`;

    try {
        const response = await ai.models.generateContent({ 
            model, 
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const parsedData = JSON.parse(jsonStr);
        
        if (Array.isArray(parsedData)) {
            const validatedPlan: Omit<GeneratedMeal, 'id' | 'completed'>[] = parsedData
                .map((item: any) => {
                    if (
                        typeof item.name === 'string' &&
                        Array.isArray(item.ingredients) &&
                        typeof item.calories === 'number' &&
                        typeof item.protein === 'number' &&
                        typeof item.carbs === 'number' &&
                        typeof item.fat === 'number'
                    ) {
                        return {
                            name: item.name,
                            ingredients: item.ingredients,
                            calories: item.calories,
                            protein: item.protein,
                            carbs: item.carbs,
                            fat: item.fat,
                            type: item.type === 'supplement' ? 'supplement' : 'meal',
                        };
                    }
                    return null;
                })
                .filter((item): item is Omit<GeneratedMeal, 'id' | 'completed'> => item !== null);

            return validatedPlan;
        }

        return null;

    } catch (e) {
        console.error("Error generating or parsing diet plan:", e);
        return null;
    }
};

export const getMealAlternative = async (profile: UserProfile, originalMeal: GeneratedMeal): Promise<Omit<GeneratedMeal, 'id' | 'completed'>[] | null> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Un usuario quiere sustituir una comida de su plan. La comida original es "${originalMeal.name}".
    - Perfil del usuario: Dieta ${profile.dietType}.
    - Macros de la comida original: ~${originalMeal.calories} kcal, ${originalMeal.protein}g proteína, ${originalMeal.carbs}g carbs, ${originalMeal.fat}g grasa.

    Instrucciones:
    1.  Sugiere 3 comidas alternativas sólidas (no batidos).
    2.  Cada alternativa debe tener un perfil de macros MUY SIMILAR al de la comida original.
    3.  Cada alternativa debe ser compatible con la dieta ${profile.dietType} del usuario.
    4.  Para cada alternativa, proporciona su nombre, ingredientes con cantidades y su desglose de macros.
    
    Devuelve SOLAMENTE un array de 3 objetos JSON con la siguiente estructura, sin texto adicional:
    {
      "name": "string",
      "ingredients": ["string con cantidad"],
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "type": "meal"
    }`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const parsedData = JSON.parse(jsonStr);

        if (Array.isArray(parsedData)) {
            const validatedAlts: Omit<GeneratedMeal, 'id' | 'completed'>[] = parsedData
                .map((item: any) => {
                    if (
                        typeof item.name === 'string' &&
                        Array.isArray(item.ingredients) &&
                        typeof item.calories === 'number' &&
                        typeof item.protein === 'number' &&
                        typeof item.carbs === 'number' &&
                        typeof item.fat === 'number'
                    ) {
                        return {
                            name: item.name,
                            ingredients: item.ingredients,
                            calories: item.calories,
                            protein: item.protein,
                            carbs: item.carbs,
                            fat: item.fat,
                            type: 'meal', // Per prompt, all alternatives are 'meal'
                        };
                    }
                    return null;
                })
                .filter((item): item is Omit<GeneratedMeal, 'id' | 'completed'> => item !== null);
            return validatedAlts;
        }
        return null;

    } catch (error) {
        console.error("Error getting meal alternatives:", error);
        return null;
    }
};

export const getWeeklyNutritionAnalysis = async (profile: UserProfile, weeklyLogs: NutritionLog[], weeklyWeights: WeightEntry[]): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Eres un coach nutricional experto y motivador. Analiza los datos de la última semana de ${profile.name} y proporciónale un resumen conciso, accionable y alentador.

    **Datos del Usuario:**
    - Perfil: ${JSON.stringify(profile)}
    - Registros de Comida (últimos 7 días): ${JSON.stringify(weeklyLogs.slice(-7))}
    - Registros de Peso (últimos 7 días): ${JSON.stringify(weeklyWeights.slice(-7))}

    **Instrucciones para tu respuesta:**
    1.  **Saludo Personalizado:** Empieza saludando a ${profile.name}.
    2.  **Analiza la Adherencia:** Comenta su consistencia con las calorías. No des números exactos, habla en términos generales (ej. "muy consistente", "hubo algunos altibajos", "un gran esfuerzo").
    3.  **Analiza el Progreso de Peso:** Interpreta la tendencia del peso en el contexto de su objetivo (${profile.goal}). Por ejemplo, si quieren ganar músculo y su peso subió un poco, es una victoria. Si querían perder grasa y el peso se estancó, menciónalo de forma constructiva.
    4.  **Da un Consejo Clave:** Basado en el análisis, ofrece UN consejo principal y fácil de implementar para la próxima semana. (ej. "Intenta añadir una fuente de proteína en tu desayuno", "Asegúrate de hidratarte bien antes de entrenar").
    5.  **Cierre Motivador:** Termina con una frase de ánimo para la semana que viene.

    **Tono:** Positivo, constructivo y alentador. Evita el lenguaje crítico o negativo. Haz que el usuario se sienta empoderado.
    **Formato:** Un párrafo corto y directo.
    `;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
};

export const getExerciseAlternatives = async (exercise: Exercise, profile: UserProfile): Promise<string[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Eres un coach de powerbuilding experto. Un atleta quiere sustituir un ejercicio de su rutina.
        
        - Atleta: Nivel ${profile.experience}, Objetivo: ${profile.goal}.
        - Ejercicio a sustituir: "${exercise.name}" (Tipo: ${exercise.type}, Grupo muscular: ${exercise.muscleGroup}).
        
        Basado en esto, sugiere 3 alternativas excelentes que trabajen el mismo grupo muscular primario (${exercise.muscleGroup}) y sean del mismo tipo (${exercise.type}).
        
        Devuelve **SOLAMENTE** un array de strings JSON con los nombres de los ejercicios. No incluyas explicaciones.
        
        Ejemplo de salida: ["Press de Banca con Mancuernas", "Press Inclinado con Barra", "Fondos para Pecho"]
    `;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const parsedData = JSON.parse(jsonStr);
        if (Array.isArray(parsedData) && parsedData.every(item => typeof item === 'string')) {
            return parsedData;
        }
        return [];
    } catch (e) {
        console.error("Error getting exercise alternatives:", e);
        return [];
    }
};


export const generateProactiveInsights = async (user: User): Promise<AIInsight[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
        Analiza el perfil completo y el historial de este usuario y genera entre 2 y 3 observaciones proactivas y accionables. Actúa como un coach de élite.

        **Datos Completos del Usuario:**
        ${JSON.stringify(user)}

        **Instrucciones de Análisis:**
        1.  **Estancamiento de Fuerza:** Revisa el 'workoutLog'. Si para un ejercicio compuesto clave (como 'Press de Banca' o 'Sentadilla con Barra') el 1RM estimado no ha subido en las últimas 2-3 sesiones registradas, genera una alerta de estancamiento.
        2.  **Adherencia a la Nutrición:** Revisa el 'nutritionLog' de la última semana. Compara las calorías consumidas con el objetivo. Si hay una desviación constante (>15%), coméntalo. También, revisa si la ingesta de proteínas por kg es adecuada para el objetivo.
        3.  **Progreso de Peso vs. Objetivo:** Compara la 'weightHistory' de las últimas 2 semanas con el 'goal'. Si el ritmo de ganancia/pérdida es demasiado rápido o lento, genera una observación.
        4.  **Consistencia del Entrenamiento:** Comprueba si el número de entrenamientos registrados en 'workoutLog' en la última semana coincide con 'trainingDays' en el perfil.
        5.  **Reconocimiento Positivo:** Si todo va bien (buena adherencia, progreso constante), genera un mensaje de felicitación y motivación.

        **Formato de Salida Obligatorio:**
        Devuelve **SOLAMENTE** un array de objetos JSON válido. No incluyas texto antes o después.
        El formato de cada objeto debe ser:
        {
          "type": "'warning' | 'info' | 'success'",
          "title": "string (un título corto y llamativo)",
          "message": "string (una explicación clara y concisa de la observación)",
          "tip": "string (un consejo práctico y accionable, opcional)"
        }

        Ejemplo de salida:
        [
          {
            "type": "info",
            "title": "Estancamiento en Press de Banca",
            "message": "He notado que tu fuerza en Press de Banca se ha mantenido similar en las últimas dos sesiones.",
            "tip": "Considera introducir una semana de descarga o cambiar a Press con Mancuernas para un nuevo estímulo."
          },
          {
            "type": "success",
            "title": "¡Consistencia Impresionante!",
            "message": "Has completado todos tus entrenamientos programados esta semana y tu adherencia calórica ha sido excelente.",
            "tip": "Sigue así, este es el camino para lograr grandes resultados."
          }
        ]
    `;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr);
        if (Array.isArray(parsedData)) {
            return parsedData as AIInsight[];
        }
        return [];
    } catch (e) {
        console.error("Error generating proactive insights:", e);
        return [
            {
                type: 'warning',
                title: 'Error del Asistente',
                message: 'No se pudieron generar las observaciones de la IA en este momento.',
                tip: 'Puedes seguir usando la aplicación normalmente.'
            }
        ];
    }
};
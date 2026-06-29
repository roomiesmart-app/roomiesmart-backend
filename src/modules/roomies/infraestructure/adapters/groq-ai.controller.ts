import Groq from 'groq-sdk';
import type { IAiService } from '../../application/ports/ai.service.js';
import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';

export class GroqAiAdapter implements IAiService {
  private groq: Groq;

  constructor() {
    this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }

  public async rankCandidates(currentUser: MatchmakingCardDto, candidates: MatchmakingCardDto[]): Promise<any[]> {
    if (candidates.length === 0) return [];

    const prompt = `
      Eres el motor central de Inteligencia Artificial Semántica de la plataforma universitaria RoomieSmart.
      Tu trabajo es analizar a fondo al "Usuario Principal" y comparar su perfil contra una "Lista de Candidatos".

      Usuario Principal:
      ${JSON.stringify(currentUser)}

      Lista de Candidatos:
      ${JSON.stringify(candidates)}

      REGLAS DE EVALUACIÓN SEMÁNTICA (MUY IMPORTANTE):
      1. COMPRENSION FLEXIBLE: No seas un evaluador rígido de texto exacto. Si el usuario tiene el hobby "Gaming" y el candidato tiene "Videojuegos", eso representa un 100% de coincidencia semántica.
      2. PENALIZACION PROPORCIONAL: Si el usuario busca "Limpieza Diaria" y el candidato registra "2-3 veces por semana", resta puntos proporcionalmente (~15% menos), pero NO lo califiques como 0% a menos que exista una incompatibilidad extrema (ejemplo: fumador vs alguien que no tolera el humo).
      3. EVALUACION INTEGRAL: Cruza estrictamente tres pilares para el puntaje final:
         - Viabilidad Financiera (Solapamiento de presupuestos min/max).
         - Hábitos de Convivencia (Ritmo madrugador/nocturno y limpieza).
         - Afinidad Social (Intersección de géneros musicales y hobbies).

      REGLAS ESTRICTAS DE FORMATO: 
      1. Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido con una sola llave raíz llamada "matches".
      2. DEBES evaluar absolutamente a TODOS los candidatos. El arreglo "matches" debe tener EXACTAMENTE ${candidates.length} elementos, sin omitir a ninguno.
      3. Cada objeto dentro del arreglo debe contener estrictamente estas tres llaves: 
         - "candidateId" (string con el id exacto del candidato)
         - "compatibilityScore" (número entero entre 10 y 100)
         - "reason" (string corto de máximo 15 palabras justificando el porcentaje basado en los datos reales comparados).
    `;

    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant', 
        temperature: 0.1, 
        response_format: { type: "json_object" } 
      });

      const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
      const parsedData = JSON.parse(responseContent);
      
      return parsedData.matches || [];

    } catch (error) {
      console.error("Error conectando con Groq AI:", error);
      return [];
    }
  }
}
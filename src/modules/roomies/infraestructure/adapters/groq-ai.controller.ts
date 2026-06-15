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

    // PROMPT 
    const prompt = `
      Actúa como un algoritmo de matchmaking. Compara al "Usuario Principal" con la "Lista de Candidatos".
      
      Usuario Principal:
      ${JSON.stringify(currentUser)}

      Lista de Candidatos:
      ${JSON.stringify(candidates)}

      REGLAS ESTRICTAS: 
      1. Tu respuesta debe ser ÚNICAMENTE un objeto JSON válido con una llave llamada "matches".
      2. DEBES evaluar a TODOS los candidatos. El arreglo "matches" debe tener EXACTAMENTE ${candidates.length} elementos, sin omitir a ninguno.
      3. Cada objeto debe tener estas llaves: "candidateId" (string), "compatibilityScore" (número 0-100) y "reason" (string corto).
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
      
      // Extract the matches array from the AI response, ensuring it adheres to the expected structure
      return parsedData.matches || [];

    } catch (error) {
      console.error("Error conectando con Groq AI:", error);
      return [];
    }
  }
}
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
      Eres una Unidad de Cálculo Matricial Estricto para la app universitaria RoomieSmart.
      Audita el "Perfil Buscador (con sus filtros activos)" frente a la "Lista de Candidatos" y calcula puntajes exactos.

      Perfil Buscador:
      ${JSON.stringify(currentUser)}

      Lista de Candidatos:
      ${JSON.stringify(candidates)}

      RÚBRICA MATEMÁTICA ESTRICTA (5 COLUMNAS DE EXACTAMENTE 20 PUNTOS CADA UNA = 100 PUNTOS):

      1. PRESUPUESTO (max 20 pts): Diferencia $0 = 20 pts | Leve (+$1 a $35) = 15 pts | Media (+$36 a $70) = 10 pts | Alta = 5 pts | Extrema (+$100) = 0 pts.
      2. TABACO (max 20 pts): [REGLA DE VETO FATAL]: Si el buscador exige "No tolero/No fuma" y el candidato FUMA -> Puntaje Tabaco = 0, y activa bandera veto. Si coinciden o no fuma = 20 pts.
      3. LIMPIEZA (max 20 pts): Texto exacto = 20 pts | Semejante (ej. Diaria vs 2-3 veces) = 10 pts | Incompatible = 0 pts.
      4. HOBBIES (max 20 pts): (Coincidencias reales / Hobbies exigidos en el filtro) * 20.
      5. MÚSICA (max 20 pts): (Coincidencias reales / Géneros exigidos en el filtro) * 20.

      *(Si un filtro del buscador vino vacío/nulo, otorga 20 pts obligatorios en ese rubro al candidato).*

      ESTRUCTURA JSON OBLIGATORIA DE SALIDA (Respeta las llaves exactas):
      {
        "matches": [
          {
            "candidateId": "id_exacto",
            "totalScore": suma_de_los_5_rubros,
            "veto": boolean_true_si_violó_tabaco,
            "breakdown": {
              "presupuesto": numero_0_a_20,
              "tabaco": numero_0_a_20,
              "limpieza": numero_0_a_20,
              "hobbies": numero_0_a_20,
              "musica": numero_0_a_20
            },
            "reason": "Explicación humana ultra corta de máximo 8 palabras"
          }
        ]
      }
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
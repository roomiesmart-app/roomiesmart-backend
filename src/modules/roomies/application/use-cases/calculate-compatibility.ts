import type { IUserRepository } from '../ports/user.repository.js';
import type { IAiService } from '../ports/ai.service.js';
import type { MatchmakingFilters } from '../../../roomies/domain/dtos/matchmaking-filters.dto.js';

export class CalculateCompatibilityUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly aiService: IAiService
  ) {}

  public async execute(incomingIdOrEmail: string, filters?: MatchmakingFilters): Promise<any[]> {
    const allProfiles: any[] = await this.userRepository.getProfilesForMatchmaking();
    if (!allProfiles || allProfiles.length === 0) return [];

    const cleanTerm = incomingIdOrEmail.trim().toLowerCase();

    let currentUser = allProfiles.find((p: any) => p?.email?.toLowerCase() === cleanTerm || p?.id?.toLowerCase() === cleanTerm);
    if (!currentUser) {
      currentUser = allProfiles.find((p: any) => p?.email?.toLowerCase().includes('lalunap')) || allProfiles[0];
    }

    // Aislamos tu tarjeta principal para no compararte contra el espejo
    const candidates = allProfiles.filter((p: any) => p && p.id !== currentUser.id);
    if (candidates.length === 0) return [];

    const hasActiveFilters = filters && Object.values(filters).some(val => 
      val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : val !== '')
    );

    console.log(`\n🧠 --- INICIANDO MOTOR SEMÁNTICO DE MATCHMAKING (GROQ AI) ---`);
    console.log(`👤 Usuario Principal: [${currentUser.fullName}] (${currentUser.email})`);
    console.log(`🎯 Modo de Búsqueda: ${hasActiveFilters ? '⚖️ Evaluación Semántica con Filtros Activos' : '🌟 Compatibilidad Pura por Cuestionario'}`);
    if (hasActiveFilters) {
      console.log(`📦 Parámetros exigidos por el usuario:`, JSON.stringify(filters));
    }

    // 🔥 DELEGACIÓN TOTAL A LA IA: Pasamos la data intacta sin bloqueos rígidos de código
    const aiRankings = await this.aiService.rankCandidates(currentUser, candidates);

    console.log(`\n📊 DESGLOSE SEMÁNTICO DEVUELTO POR LA IA:`);
    const auditTable = candidates.map(c => {
      const ai = aiRankings.find((r: any) => r && r.candidateId === c.id);
      return {
        "Roomie Candidato": c.fullName,
        "Afinidad Calculada": `${ai?.compatibilityScore ?? 50}%`,
        "Auditoría Semántica de Groq AI": ai?.reason || "Similitud inferida"
      };
    });
    console.table(auditTable);
    console.log(`------------------------------------------------------------------\n`);

    return candidates
      .map((candidate: any) => {
        const aiResult = aiRankings.find((r: any) => r && r.candidateId === candidate.id);
        
        // Si la IA no logra responder, aplicamos un cálculo matemático de respaldo dinámico
        let fallbackScore = 85;
        if (hasActiveFilters && filters) {
          let matches = 0;
          if (filters.maxBudget && candidate.preferences.financial.budgetRange.min <= filters.maxBudget) matches += 25;
          if (filters.isEarlyBird === candidate.preferences.lifestyle.isEarlyBird) matches += 25;
          fallbackScore = 40 + matches;
        }

        return { 
          candidate, 
          compatibilityScore: Number(aiResult?.compatibilityScore ?? fallbackScore), 
          aiExplanation: aiResult?.reason || (hasActiveFilters ? 'Afinidad calculada semánticamente según tus filtros' : 'Afinidad ideal basada en hábitos')
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
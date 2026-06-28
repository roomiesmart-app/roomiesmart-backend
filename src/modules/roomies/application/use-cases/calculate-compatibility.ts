import type { IUserRepository } from '../ports/user.repository.js';
import type { IAiService } from '../ports/ai.service.js';

export class CalculateCompatibilityUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly aiService: IAiService
  ) {}

  public async execute(currentUserId: string): Promise<any[]> {
    const allProfiles = await this.userRepository.getProfilesForMatchmaking();

    // 🔥 BLINDAJE DUAL: Buscamos coincidencia con Supabase UUID O con Kinde ID
    const currentUser = allProfiles.find((p: any) => 
      p.id === currentUserId || p._kindeId === currentUserId
    );

    if (!currentUser) {
      throw new Error(`Usuario principal (${currentUserId}) no encontrado en la base de datos.`);
    }

    const candidates = allProfiles.filter((p: any) => p !== currentUser);

    if (candidates.length === 0) return [];

    const aiRankings = await this.aiService.rankCandidates(currentUser, candidates);

    const finalMatches = candidates.map((candidate: any) => {
      const aiResult = aiRankings.find((r: any) => 
        r.candidateId === candidate.id || r.candidateId === candidate._kindeId
      );
      
      const rawScore = aiResult?.compatibilityScore ?? aiResult?.score ?? 75;

      return {
        ...candidate,
        compatibilityScore: Number(rawScore),
        matchReason: aiResult?.reason || aiResult?.matchReason || 'Perfiles afines en convivencia y organización del hogar.'
      };
    });

    return finalMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
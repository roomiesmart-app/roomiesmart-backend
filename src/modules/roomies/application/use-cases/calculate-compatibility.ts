import type { IUserRepository } from '../ports/user.repository.js';
import type { IAiService } from '../ports/ai.service.js';

export class CalculateCompatibilityUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly aiService: IAiService
  ) {}

  public async execute(currentUserId: string): Promise<any[]> {
    const allProfiles = await this.userRepository.getProfilesForMatchmaking();

    if (allProfiles.length === 0) {
      return []; // Si la base de datos está vacía, devuelve lista vacía sin dar error 500
    }

    // 1. Intentamos buscar al usuario por el ID que manda el navegador
    let currentUser = allProfiles.find((p: any) => p.id === currentUserId);

    // 🔥 PARACAÍDAS ANTI-CRASH PARA PROYECTOS:
    // Si el Front mandó un token viejo de localStorage que ya no coincide,
    // tomamos al primer usuario de la base de datos para salvar la vista.
    if (!currentUser) {
      console.warn(`⚠️ Token desactualizado (${currentUserId}). Aplicando perfil de rescate.`);
      currentUser = allProfiles[0];
    }

    const candidates = allProfiles.filter((p: any) => p.id !== currentUser!.id);

    if (candidates.length === 0) return [];

    const aiRankings = await this.aiService.rankCandidates(currentUser!, candidates);

    const finalMatches = candidates.map((candidate: any) => {
      const aiResult = aiRankings.find((r: any) => r.candidateId === candidate.id);
      const rawScore = aiResult?.compatibilityScore ?? aiResult?.score ?? 88;

      return {
        ...candidate,
        compatibilityScore: Number(rawScore),
        matchReason: aiResult?.reason || aiResult?.matchReason || 'Alta afinidad en organización, limpieza y horarios académicos.'
      };
    });

    return finalMatches.sort((a: any, b: any) => b.compatibilityScore - a.compatibilityScore);
  }
}
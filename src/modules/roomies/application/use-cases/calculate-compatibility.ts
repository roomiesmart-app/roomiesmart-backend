import type { IUserRepository } from '../ports/user.repository.js';
import type { IAiService } from '../ports/ai.service.js';

export class CalculateCompatibilityUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly aiService: IAiService
  ) {}

  public async execute(currentUserId: string): Promise<any[]> {
    // All the logic for calculating compatibility will go here
    const allProfiles = await this.userRepository.getProfilesForMatchmaking();

    // 2. Separe the current user from the candidates (all the other users). We need to pass the current user's profile to the AI so it can compare it with the candidates.
    const currentUser = allProfiles.find(p => p.id === currentUserId);
    const candidates = allProfiles.filter(p => p.id !== currentUserId);

    if (!currentUser) {
      throw new Error('Usuario principal no encontrado en la base de datos.');
    }

    // 3. Pass the current user's profile and the list of candidates to the AI service, which will return a compatibility score for each candidate. This is where the magic happens.
    const aiRankings = await this.aiService.rankCandidates(currentUser, candidates);

    // 4. Current User + Candidates + AI Scores = Final Matches. We combine the original candidate data with the AI scores to create a final list of matches that we can return to the frontend.
    // 4. Current User + Candidates + AI Scores = Final Matches.
    const finalMatches = candidates.map(candidate => {
      const aiResult = aiRankings.find((r: any) => 
        r.candidateId === candidate.id || r.id === candidate.id
      );
      
      // Atrapamos la calificación sin importar cómo la bautizó Groq hoy
      const rawScore = aiResult?.compatibilityScore ?? aiResult?.score ?? aiResult?.percentage ?? 75;

      return {
        ...candidate,
        compatibilityScore: Number(rawScore),
        matchReason: aiResult?.reason || aiResult?.matchReason || 'Perfiles con alta afinidad en estilo de vida y horarios.'
      };
    });

    // 5. Ordenamos del mejor match (95%) al peor (10%)
    return finalMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
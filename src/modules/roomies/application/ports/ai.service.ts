import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';

export interface IAiService {
  rankCandidates(currentUser: MatchmakingCardDto, candidates: MatchmakingCardDto[]): Promise<any[]>;
}
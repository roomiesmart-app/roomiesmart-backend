import type { MatchmakingCardDto } from '../../domain/dtos/matchmaking-card.dto.js';

export interface IAiService {
  // the profile of the current user and a list of candidate profiles, and it should return a list of candidates ranked by compatibility percentage
  rankCandidates(currentUser: MatchmakingCardDto, candidates: MatchmakingCardDto[]): Promise<any[]>;
}
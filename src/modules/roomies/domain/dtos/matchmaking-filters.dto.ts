export interface MatchmakingFilters {
  maxBudget?: number;
  isEarlyBird?: boolean;
  smokingPreference?: 'fumo' | 'no-fumo' | 'no-tolero';
  petPreference?: 'tengo' | 'no-molestan' | 'no-tengo';
  roomType?: 'privada' | 'compartida';
  cleaningFrequency?: 'diaria' | '2-3 veces' | 'semanal';
  hobbies?: string[];
  musicGenres?: string[];
}
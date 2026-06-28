export interface MatchmakingCardDto {
  id: string;
  fullName: string;
  location: string;
  roomType: string | null;
  preferences: {
    profile: { age: number; gender: string };
    lifestyle: { isEarlyBird: boolean; cleaningFrequency: string };
    social: { 
      hobbies: string[]; 
      musicGenres: string[]; 
      petPreference: string; 
      smokingPreference: string; 
    };
    financial: { 
      budgetRange: { min: number; max: number } 
    };
  };
  ai_embedding: number[] | null;
}

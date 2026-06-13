export interface MatchmakingCardDto {
  id: string;
  fullName: string;
  location: string; 
  habits: {
    isEarlyBird: boolean | null;
    hobbies: string[];
    petPreference: string | null;
    smokingPreference: string | null;
  };
  budget: {
    min: number | null;
    max: number | null;
  };
  roomType: string | null;
  ai_embedding: number[] | null; 
}
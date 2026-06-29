import type { IUserRepository } from '../ports/user.repository.js';
import type { IAiService } from '../ports/ai.service.js';
import type { MatchmakingFilters } from '../../../roomies/domain/dtos/matchmaking-filters.dto.js';

export class CalculateCompatibilityUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly aiService: IAiService
  ) {}

  public async execute(incomingIdOrEmail: string, filters?: MatchmakingFilters): Promise<any[]> {
    const allProfilesRaw: any[] = await this.userRepository.getProfilesForMatchmaking();
    if (!allProfilesRaw || allProfilesRaw.length === 0) return [];

    const seenKeys = new Set<string>();
    const allProfiles = allProfilesRaw.filter((p: any) => {
      const uniqueKey = p?.id || p?.email?.toLowerCase()?.trim();
      if (!uniqueKey || seenKeys.has(uniqueKey)) return false;
      seenKeys.add(uniqueKey);
      return true;
    });

    const cleanTerm = incomingIdOrEmail.trim().toLowerCase();

    let currentUser = allProfiles.find((p: any) => p?.email?.toLowerCase() === cleanTerm || p?.id?.toLowerCase() === cleanTerm);
    if (!currentUser) {
      currentUser = allProfiles.find((p: any) => p?.email?.toLowerCase().includes('lalunap')) || allProfiles[0];
    }

    const candidates = allProfiles.filter((p: any) => p && p.id !== currentUser.id);
    if (candidates.length === 0) return [];

    const hasActiveFilters = filters && Object.values(filters).some(val => 
      val !== undefined && val !== null && (Array.isArray(val) ? val.length > 0 : val !== '')
    );

    console.log(`\n🧠 --- MOTOR DE AUDITORÍA MATRICIAL DIFUSA (GROQ AI) ---`);
    console.log(`👤 Buscador: [${currentUser.fullName}] (${currentUser?.email || 'Sin email'})`);

    const aiRankings = await this.aiService.rankCandidates(currentUser, candidates);

    console.log(`\n📊 TABLA DE CONVIVENCIA UNIVERSITARIA REAL (SUMA CPU: 100%):`);
    
    const auditTable = candidates.map(c => {
      const ai = aiRankings.find((r: any) => r && r.candidateId === c.id);
      const b = ai?.breakdown || {};
      
      const p = Number(b.presupuesto ?? 20);
      const t = Number(b.tabaco ?? 20);
      const l = Number(b.limpieza ?? 20);
      const h = Number(b.hobbies ?? 20);
      const m = Number(b.musica ?? 20);

      const cpuTotalScore = ai?.veto ? 0 : Math.min(100, p + t + l + h + m);

      return {
        "Candidato": c.fullName.length > 15 ? c.fullName.substring(0, 15) + '...' : c.fullName, 
        "Presup.(20)": p,
        "Tabaco(20)": t,
        "Limp.(20)": l,
        "Hobbies(20)": h,
        "Música(20)": m,
        "TOTAL": `${cpuTotalScore}%`,
        "Detalle": ai?.veto ? "🚫 VETO TABACO" : (ai?.reason || "Afinidad calculada")
      };
    });

    console.table(auditTable);
    console.log(`----------------------------------------------------------------------------------------\n`);

    return candidates
      .map((candidate: any) => {
        const aiResult = aiRankings.find((r: any) => r && r.candidateId === candidate.id);
        const b = aiResult?.breakdown || {};
        
        const realScore = aiResult?.veto ? 0 : Math.min(100, 
          Number(b.presupuesto ?? 20) + Number(b.tabaco ?? 20) + Number(b.limpieza ?? 20) + Number(b.hobbies ?? 20) + Number(b.musica ?? 20)
        );

        // 1. Capturamos el dinero real desde la base de datos
        const dbMin = candidate?.preferences?.financial?.budgetRange?.min ?? 180;
        const dbMax = candidate?.preferences?.financial?.budgetRange?.max ?? 250;
        const realMoney = Number(dbMax > 150 ? dbMax : dbMin);

        const isEarly = candidate?.preferences?.lifestyle?.isEarlyBird ?? true;
        const smokePref = candidate?.preferences?.social?.smokingPreference || 'No fumo';
        const rType = candidate?.roomType || candidate?.preferences?.financial?.roomType || 'Privada';

        // 🔫 TÉCNICA ESCOPETA: Inyectamos el dinero real en el 100% de nombres posibles
        const formattedCandidate = {
          ...candidate,
          id: candidate.id,
          fullName: candidate.fullName,
          location: candidate.location || 'Quito, Ecuador',
          roomType: rType,

          // Si el front pide plano:
          budget: realMoney,
          maxBudget: realMoney,
          minBudget: dbMin,
          monthlyBudget: realMoney,
          price: realMoney,
          rent: realMoney,
          cost: realMoney,
          amount: realMoney,
          monthly_budget: realMoney,

          // Si el front pide anidado:
          preferences: {
            ...candidate.preferences,
            financial: {
              ...candidate?.preferences?.financial,
              budget: realMoney,
              maxBudget: realMoney,
              minBudget: dbMin,
              budgetRange: { min: Number(dbMin), max: Number(realMoney) }
            }
          },

          financial: {
            budget: realMoney,
            maxBudget: realMoney,
            minBudget: dbMin,
          },

          habits: {
            isEarlyBird: isEarly,
            smokingPreference: smokePref,
            scheduleLabel: isEarly ? 'MADRUGADOR' : 'NOCTÁMBULO',
            smokeLabel: smokePref.toLowerCase().includes('no') ? 'NO FUMO' : 'FUMADOR'
          }
        };

        return { 
          candidate: formattedCandidate, 
          compatibilityScore: realScore, 
          aiExplanation: aiResult?.veto ? 'Incompatible: Violación estricta de preferencia de tabaco.' : (aiResult?.reason || 'Compatible según convivencia.')
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);
  }
}
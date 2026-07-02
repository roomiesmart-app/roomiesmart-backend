import { supabase } from '../../../../core/database.js';
import type { ISpaceRepository } from '../../application/ports/space.repository.js';

export class SupabaseSpaceAdapter implements ISpaceRepository {
  public async create(spaceData: any): Promise<any> {
    const { data, error } = await supabase
      .from('spaces')
      .insert(spaceData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
import { supabase } from '../../../../core/database.js';
import type { ISpaceRepository } from '../../application/ports/space.repository.js';


const SPACES_TABLE = 'spaces';

export class SupabaseSpaceAdapter implements ISpaceRepository {
  public async create(spaceData: any): Promise<any> {
    const { data, error } = await supabase
      .from(SPACES_TABLE)
      .insert(spaceData)
      .select()
      .single();

    if (error) {
      
      console.error(`🚨 [SupabaseSpaceAdapter] Insert en "${SPACES_TABLE}" falló:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error(
        `${error.message}${error.details ? ` — ${error.details}` : ''}`
      );
    }

   
    const { error: deptError } = await supabase.from('departments').insert({
      id: data.id,
      name: data.title,
      address: data.location_address,
      created_by: data.owner_id
    });

    if (deptError && deptError.code !== '23505') {
      console.error(
        '⚠️ No se pudo espejar el espacio en departments (finanzas):',
        deptError.message
      );
    }

    return data;
  }

  public async findAllAvailable(): Promise<any[]> {
    const { data, error } = await supabase
      .from(SPACES_TABLE)
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async findById(spaceId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from(SPACES_TABLE)
      .select('*')
      .eq('id', spaceId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  public async update(spaceId: string, patch: any): Promise<any> {
    const { data, error } = await supabase
      .from(SPACES_TABLE)
      .update(patch)
      .eq('id', spaceId)
      .select()
      .single();

    if (error) throw new Error(error.message);


    if (patch.title !== undefined || patch.location_address !== undefined) {
      const mirror: any = {};
      if (patch.title !== undefined) mirror.name = patch.title;
      if (patch.location_address !== undefined) mirror.address = patch.location_address;
      const { error: deptError } = await supabase
        .from('departments')
        .update(mirror)
        .eq('id', spaceId);
      if (deptError) {
        console.error('⚠️ No se pudo sincronizar departments:', deptError.message);
      }
    }

    return data;
  }

  public async softDelete(spaceId: string): Promise<void> {

    const { error } = await supabase
      .from(SPACES_TABLE)
      .update({ is_available: false })
      .eq('id', spaceId);

    if (error) throw new Error(error.message);
  }
}

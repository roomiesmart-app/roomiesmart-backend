import { supabase } from '../../../../core/database.js';
import type { ISpaceRepository } from '../../application/ports/space.repository.js';

// Tabla oficial de publicaciones de departamentos/habitaciones.
// OJO: "departments" es OTRA tabla (hogares del módulo de finanzas,
// referenciada por department_expenses.department_id) — no usarla aquí.
const SPACES_TABLE = 'spaces';

export class SupabaseSpaceAdapter implements ISpaceRepository {
  public async create(spaceData: any): Promise<any> {
    const { data, error } = await supabase
      .from(SPACES_TABLE)
      .insert(spaceData)
      .select()
      .single();

    if (error) {
      // 🚨 PostgREST trae el detalle real (FK, columna, etc.) en details/hint/code
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

    // Espejamos el espacio en `departments` con el MISMO uuid:
    // department_expenses.department_id -> departments.id (FK), así el
    // id del espacio publicado sirve directamente para el módulo de finanzas.
    const { error: deptError } = await supabase.from('departments').insert({
      id: data.id,
      name: data.title,
      address: data.location_address,
      created_by: data.owner_id
    });
    // 23505 = ya existe (re-publicación); cualquier otro error no debe
    // tumbar la publicación, solo lo registramos.
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
}

import { supabase } from '../../../../core/database.js';
import type { IMembershipRepository } from '../../application/ports/membership.repository.js';

export class SupabaseMembershipAdapter implements IMembershipRepository {
  public async createRequest(
    spaceId: string,
    requesterId: string,
    message?: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('space_requests')
      .insert({
        space_id: spaceId,
        requester_id: requesterId,
        message: message || null
      })
      .select()
      .single();

    if (error) {
      
      if (error.code === '23505') {
        throw new Error('Ya tienes una solicitud pendiente para este espacio.');
      }
      throw new Error(error.message);
    }
    return data;
  }

  public async findRequestById(requestId: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('space_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  }

  public async findPendingRequestsByOwner(ownerId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('space_requests')
      .select(`
        id,
        space_id,
        requester_id,
        message,
        status,
        created_at,
        spaces!inner ( id, title, owner_id ),
        users!space_requests_requester_id_fkey ( id, email )
      `)
      .eq('spaces.owner_id', ownerId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async updateRequestStatus(
    requestId: string,
    status: 'accepted' | 'rejected',
    resolverId: string
  ): Promise<any> {
    const { data, error } = await supabase
      .from('space_requests')
      .update({
        status,
        resolved_by: resolverId,
        resolved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  public async addMember(
    departmentId: string,
    userId: string,
    role: 'owner' | 'member' = 'member'
  ): Promise<void> {
    const { error } = await supabase
      .from('department_members')
      .insert({ department_id: departmentId, user_id: userId, role });

    // 23505 = ya era miembro: lo tratamos como éxito (idempotente)
    if (error && error.code !== '23505') {
      throw new Error(error.message);
    }
  }

  public async listMembers(departmentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('department_members')
      .select(`
        id,
        department_id,
        user_id,
        role,
        joined_at,
        users ( id, email )
      `)
      .eq('department_id', departmentId)
      .order('joined_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  }

  public async isMember(departmentId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('department_members')
      .select('id')
      .eq('department_id', departmentId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return !!data;
  }
}

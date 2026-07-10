export interface IMembershipRepository {
  createRequest(spaceId: string, requesterId: string, message?: string): Promise<any>;
  findRequestById(requestId: string): Promise<any | null>;
  findPendingRequestsByOwner(ownerId: string): Promise<any[]>;
  updateRequestStatus(requestId: string, status: 'accepted' | 'rejected', resolverId: string): Promise<any>;
  addMember(departmentId: string, userId: string, role?: 'owner' | 'member'): Promise<void>;
  listMembers(departmentId: string): Promise<any[]>;
  isMember(departmentId: string, userId: string): Promise<boolean>;
}

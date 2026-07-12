export interface ISpaceRepository {
  create(spaceData: any): Promise<any>;
  findAllAvailable(): Promise<any[]>;
  findById(spaceId: string): Promise<any | null>;
  // Espacios donde el usuario es dueño O miembro, con membership_role
  findByUser(userId: string): Promise<any[]>;
  update(spaceId: string, patch: any): Promise<any>;
  softDelete(spaceId: string): Promise<void>;
}

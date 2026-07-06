export interface ISpaceRepository {
  create(spaceData: any): Promise<any>;
  findAllAvailable(): Promise<any[]>;
  findById(spaceId: string): Promise<any | null>;
  update(spaceId: string, patch: any): Promise<any>;
  softDelete(spaceId: string): Promise<void>;
}

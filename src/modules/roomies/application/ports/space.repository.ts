export interface ISpaceRepository {
  create(spaceData: any): Promise<any>;
  findAllAvailable(): Promise<any[]>;
}

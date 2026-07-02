export interface ISpaceRepository {
  create(spaceData: any): Promise<any>;
}
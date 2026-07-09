import type { ISpaceRepository } from '../ports/space.repository.js';

export class ListSpacesUseCase {
  constructor(private readonly spaceRepository: ISpaceRepository) {}

  public async execute(): Promise<any[]> {
    return await this.spaceRepository.findAllAvailable();
  }
}

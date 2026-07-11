import type { IMembershipRepository } from '../ports/membership.repository.js';

export class GetDepartmentMembersUseCase {
  constructor(private readonly membershipRepository: IMembershipRepository) {}

  public async execute(departmentId: string): Promise<{
    members: any[];
    count: number;
    sharedFinancesEnabled: boolean;
  }> {
    if (!departmentId) throw new Error('El ID del departamento es obligatorio.');

    const members = await this.membershipRepository.listMembers(departmentId);

    return {
      members,
      count: members.length,
      sharedFinancesEnabled: members.length > 1
    };
  }
}

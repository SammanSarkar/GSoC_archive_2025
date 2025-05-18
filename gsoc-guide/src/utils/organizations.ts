import organizationsData from '@/data/organizations.json';

export interface OrganizationData {
  hasProposals: boolean;
  proposalCount: number;
}

export interface OrganizationsData {
  organizations: Record<string, OrganizationData>;
}

export function getOrganizationsData(): OrganizationsData {
  return organizationsData;
}

export function getOrganizationsWithProposals(): Record<string, OrganizationData> {
  const result: Record<string, OrganizationData> = {};
  Object.entries(organizationsData.organizations).forEach(([orgName, data]) => {
    result[orgName.toLowerCase()] = data;
  });
  return result;
}

export function getTotalProposals(): number {
  return organizationsData.totalProposals;
}

export function getTotalOrganizations(): number {
  return organizationsData.totalOrganizations;
} 
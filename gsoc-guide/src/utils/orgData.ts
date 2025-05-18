import orgData from '../org.json';

export interface OrgProposalData {
  hasProposals: boolean;
  proposalCount: number;
}

export interface OrgProposalsMap {
  [key: string]: OrgProposalData;
}

export function getOrgProposalsData(): OrgProposalsMap {
  // Convert organization names to lowercase
  const orgsWithLowercaseNames: OrgProposalsMap = {};
  
  Object.entries(orgData.organizations).forEach(([orgName, data]) => {
    orgsWithLowercaseNames[orgName.toLowerCase()] = data;
  });
  
  return orgsWithLowercaseNames;
}

export function getTotalProposals(): number {
  return Object.values(orgData.organizations).reduce(
    (total, org) => total + (org.hasProposals ? org.proposalCount : 0),
    0
  );
}

export function getOrganizationsWithProposals(): string[] {
  return Object.entries(orgData.organizations)
    .filter(([_, data]) => data.hasProposals)
    .map(([orgName]) => orgName.toLowerCase());
} 
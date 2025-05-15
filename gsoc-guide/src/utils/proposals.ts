import 'server-only';
import fs from 'fs';
import path from 'path';
import { Proposal } from '@/types';

const PROPOSALS_PATH = path.join(process.cwd(), '..', 'Proposals');

export function getAvailableOrganizations(): string[] {
  try {
    return fs.readdirSync(PROPOSALS_PATH);
  } catch (error) {
    console.error('Error reading proposals directory:', error);
    return [];
  }
}

export function getProposalsForOrganization(orgName: string): Proposal[] {
  try {
    const orgPath = path.join(PROPOSALS_PATH, orgName);
    if (!fs.existsSync(orgPath)) return [];

    const files = fs.readdirSync(orgPath);
    return files
      .filter(file => file.endsWith('.pdf'))
      .map(file => ({
        fileName: file,
        path: `/api/pdf?org=${encodeURIComponent(orgName)}&file=${encodeURIComponent(file)}`
      }));
  } catch (error) {
    console.error(`Error getting proposals for ${orgName}:`, error);
    return [];
  }
}

export function getAllOrganizationsWithProposals(): Record<string, boolean> {
  const orgs = getAvailableOrganizations();
  const result: Record<string, boolean> = {};
  
  orgs.forEach(org => {
    const proposals = getProposalsForOrganization(org);
    result[org.toLowerCase()] = proposals.length > 0;
  });
  
  return result;
} 
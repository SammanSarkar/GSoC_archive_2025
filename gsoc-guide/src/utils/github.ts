import 'server-only';
import { Proposal } from '@/types';
import fs from 'fs';
import path from 'path';

// Attempt to use environment variable with fallback to ensure it works
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'SammanSarkar';
const REPO_NAME = 'GSoC_archive_2025';
const BRANCH = 'main';
const LOCAL_PROPOSALS_PATH = path.join(process.cwd(), '..', 'Proposals');

interface GitHubContent {
  name: string;
  path: string;
  type: 'dir' | 'file';
  download_url: string | null;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

/**
 * Gets a list of available proposal directories from local filesystem
 */
export function getLocalOrganizations(): string[] {
  try {
    if (fs.existsSync(LOCAL_PROPOSALS_PATH)) {
      const dirs = fs.readdirSync(LOCAL_PROPOSALS_PATH);
      console.log('Found local organization directories:', dirs);
      return dirs;
    }
  } catch (error) {
    console.error('Error reading local proposals directory:', error);
  }
  return [];
}

/**
 * Find the actual case-sensitive folder name for an organization
 */
export function findActualOrgFolderName(inputOrgName: string): string | null {
  try {
    // Get all local organization folders
    const localOrgs = getLocalOrganizations();
    
    // Try to find a case-insensitive match
    const match = localOrgs.find(org => 
      org.toLowerCase() === inputOrgName.toLowerCase()
    );
    
    if (match) {
      console.log(`Found matching organization folder: ${match} for input: ${inputOrgName}`);
      return match;
    }
  } catch (error) {
    console.error('Error finding organization folder:', error);
  }
  
  return null;
}

/**
 * Fetches directories (organizations) from the GitHub repository's main branch
 */
export async function getGitHubOrganizations(): Promise<string[]> {
  try {
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents?ref=${BRANCH}`;
    console.log('Fetching organizations from GitHub API:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents: GitHubContent[] = await response.json();
    
    // Filter only directories (which represent organizations)
    const organizations = contents
      .filter(item => item.type === 'dir')
      .map(item => item.name);
      
    console.log('Found organizations:', organizations);
    
    // If GitHub API doesn't return anything useful, try local filesystem
    if (organizations.length === 0) {
      console.log('No organizations found via GitHub API, trying local filesystem');
      return getLocalOrganizations();
    }
    
    return organizations;
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error);
    // Fallback to local filesystem
    console.log('Falling back to local filesystem for organizations');
    return getLocalOrganizations();
  }
}

/**
 * Get proposals (PDF files) for an organization from local filesystem
 */
export function getLocalProposals(orgName: string): Proposal[] {
  try {
    // Find the actual case-sensitive folder name
    const actualOrgName = findActualOrgFolderName(orgName);
    if (!actualOrgName) {
      console.log(`No local folder found for ${orgName}`);
      return [];
    }
    
    const orgPath = path.join(LOCAL_PROPOSALS_PATH, actualOrgName);
    if (!fs.existsSync(orgPath)) {
      console.log(`Path doesn't exist: ${orgPath}`);
      return [];
    }

    const files = fs.readdirSync(orgPath);
    const proposals = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => {
        const filePath = path.join(orgPath, file);
        const stats = fs.statSync(filePath);
        
        return {
          fileName: file,
          path: `/api/pdf?org=${encodeURIComponent(actualOrgName)}&file=${encodeURIComponent(file)}`,
          size: stats.size,
          sha: '' // Not available for local files
        };
      });
    
    console.log(`Found ${proposals.length} local proposals for ${actualOrgName}`);
    return proposals;
  } catch (error) {
    console.error(`Error getting local proposals for ${orgName}:`, error);
    return [];
  }
}

/**
 * Get proposals (PDF files) for an organization from the GitHub repository
 */
export async function getProposalsForGitHubOrganization(orgName: string): Promise<Proposal[]> {
  try {
    // First, find the actual case-sensitive folder name
    const actualOrgName = findActualOrgFolderName(orgName);
    if (!actualOrgName) {
      console.log(`No matching folder found for ${orgName}, using original name`);
      // Continue with original name for GitHub API attempt
    }
    
    const folderName = actualOrgName || orgName;
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderName}?ref=${BRANCH}`;
    console.log(`Fetching proposals for ${folderName} from GitHub API:`, url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Organization directory ${folderName} not found on GitHub, trying local filesystem`);
        // Try local filesystem as a fallback
        return getLocalProposals(orgName);
      }
      const errorText = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const contents: GitHubContent[] = await response.json();
    
    // Filter PDF files
    const proposals = contents
      .filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'))
      .map(item => ({
        fileName: item.name,
        path: item.download_url || '',
        size: item.size,
        sha: item.sha
      }));
      
    console.log(`Found ${proposals.length} GitHub proposals for ${folderName}:`, 
      proposals.map(p => p.fileName));
      
    // If GitHub API doesn't have any proposals, try local filesystem
    if (proposals.length === 0) {
      console.log(`No proposals found on GitHub for ${folderName}, trying local filesystem`);
      return getLocalProposals(orgName);
    }
    
    return proposals;
  } catch (error) {
    console.error(`Error fetching proposals for ${orgName}:`, error);
    // Try local filesystem as a fallback
    console.log(`Error fetching GitHub proposals for ${orgName}, trying local filesystem`);
    return getLocalProposals(orgName);
  }
}

/**
 * Returns a mapping of organization names to whether they have proposals
 * This is used to mark organizations with proposals in the UI
 */
export async function getAllOrganizationsWithGitHubProposals(): Promise<Record<string, boolean>> {
  try {
    // Get both GitHub and local organizations
    let organizations = await getGitHubOrganizations();
    const localOrgs = getLocalOrganizations();
    
    // Combine and deduplicate
    organizations = [...new Set([...organizations, ...localOrgs])];
    console.log('Combined organizations:', organizations);
    
    const result: Record<string, boolean> = {};

    // For each organization, check if it has PDF files
    await Promise.all(
      organizations.map(async (org) => {
        const proposals = await getProposalsForGitHubOrganization(org);
        result[org.toLowerCase()] = proposals.length > 0;
      })
    );

    console.log('Organizations with proposals map:', result);
    return result;
  } catch (error) {
    console.error('Error getting organizations with proposals:', error);
    return {};
  }
}

// Simple GitHub API client

export async function fetchFromGitHub(endpoint: string) {
  const token = process.env.GITHUB_API_TOKEN;
  
  const response = await fetch(`https://api.github.com${endpoint}`, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return response.json();
} 
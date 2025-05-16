import 'server-only';
import { Proposal } from '@/types';
import fs from 'fs';
import path from 'path';

// Get GitHub token but don't throw error if missing
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const REPO_OWNER = 'SammanSarkar';
const REPO_NAME = 'GSoC_archive_2025';
const MAIN_BRANCH = 'main';
const GUIDE_BRANCH = 'gsoc_guide';
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
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents?ref=${MAIN_BRANCH}`;
    console.log('Fetching organizations from GitHub API:', url);
    
    // Only add authorization header if token exists
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }
    
    const response = await fetch(url, {
      headers,
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
          sha: '', // Not available for local files
          year: 2025 // Default to 2025 for local files
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
    const allProposals: Proposal[] = [];

    // Fetch from main branch (2025)
    const mainUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderName}?ref=${MAIN_BRANCH}`;
    const mainProposals = await fetchProposalsFromBranch(mainUrl, 2025);
    allProposals.push(...mainProposals);

    // Fetch from gsoc_guide branch (2022-2024)
    // First get the list of year folders
    const years = ['2021', '2023', '2024'];
    for (const year of years) {
      const guideUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/Proposals/${year}/${folderName}?ref=${GUIDE_BRANCH}`;
      const yearProposals = await fetchProposalsFromBranch(guideUrl, parseInt(year));
      allProposals.push(...yearProposals);
    }

    // If no proposals found on GitHub, try local filesystem
    if (allProposals.length === 0) {
      console.log(`No proposals found on GitHub for ${folderName}, trying local filesystem`);
      return getLocalProposals(orgName);
    }
    
    return allProposals;
  } catch (error) {
    console.error(`Error fetching proposals for ${orgName}:`, error);
    // Try local filesystem as a fallback
    console.log(`Error fetching GitHub proposals for ${orgName}, trying local filesystem`);
    return getLocalProposals(orgName);
  }
}

/**
 * Helper function to fetch proposals from a specific branch
 */
async function fetchProposalsFromBranch(url: string, year: number): Promise<Proposal[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  const response = await fetch(url, {
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    if (response.status === 404) {
      console.log(`No proposals found at ${url}`);
      return [];
    }
    const errorText = await response.text();
    console.error(`GitHub API error (${response.status}):`, errorText);
    return [];
  }

  const contents: GitHubContent[] = await response.json();
  
  // Filter PDF files
  return contents
    .filter(item => item.type === 'file' && item.name.toLowerCase().endsWith('.pdf'))
    .map(item => ({
      fileName: item.name,
      path: item.download_url || '',
      size: item.size,
      sha: item.sha,
      year: year
    }));
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
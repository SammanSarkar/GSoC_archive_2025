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

// Cache for storing the mapping between lowercase org names and their actual case in the repo
let orgCaseMapCache: Record<string, string[]> = {};

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
    // Ensure input is lowercase
    const lowerCaseOrgName = inputOrgName.toLowerCase();
    
    // Get all local organization folders
    const localOrgs = getLocalOrganizations();
    
    // Try to find a case-insensitive match
    const match = localOrgs.find(org => 
      org.toLowerCase() === lowerCaseOrgName
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
      .map(item => item.name.toLowerCase());
      
    console.log('Found organizations:', organizations);
    
    // If GitHub API doesn't return anything useful, try local filesystem
    if (organizations.length === 0) {
      console.log('No organizations found via GitHub API, trying local filesystem');
      return getLocalOrganizations().map(org => org.toLowerCase());
    }
    
    return organizations;
  } catch (error) {
    console.error('Error fetching GitHub organizations:', error);
    // Fallback to local filesystem
    console.log('Falling back to local filesystem for organizations');
    return getLocalOrganizations().map(org => org.toLowerCase());
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
    // Convert orgName to lowercase for consistency
    const lowerCaseOrgName = orgName.toLowerCase();
    const allProposals: Proposal[] = [];
    
    // Create an array of all possible folder name variations to try
    const folderVariations: string[] = [];
    
    // 1. Always add the lowercase name
    folderVariations.push(lowerCaseOrgName);
    
    // 2. Add the original name if different from lowercase
    if (orgName !== lowerCaseOrgName) {
      folderVariations.push(orgName);
    }
    
    // 3. Add all case variations from the cache
    if (Object.keys(orgCaseMapCache).length > 0 && orgCaseMapCache[lowerCaseOrgName]) {
      // Add all variations from the cache that aren't already in our list
      orgCaseMapCache[lowerCaseOrgName].forEach(variation => {
        if (!folderVariations.includes(variation)) {
          folderVariations.push(variation);
        }
      });
    } else {
      // Cache isn't populated yet, fetch the case map
      const caseMap = await getGitHubOrganizationCaseMap();
      
      // Add the case-mapped version if available and different
      if (caseMap[lowerCaseOrgName] && !folderVariations.includes(caseMap[lowerCaseOrgName])) {
        folderVariations.push(caseMap[lowerCaseOrgName]);
      }
    }
    
    // 4. Try to find a local folder match and add it if different
    const localOrgName = findActualOrgFolderName(lowerCaseOrgName);
    if (localOrgName && !folderVariations.includes(localOrgName)) {
      folderVariations.push(localOrgName);
    }
    
    // Remove any duplicates
    const uniqueFolderVariations = [...new Set(folderVariations)];
    
    console.log(`Will try folder variations for ${lowerCaseOrgName}:`, uniqueFolderVariations);
    
    // Define a function to try fetching with a specific folder name
    const tryFetchProposals = async (folderName: string) => {
      let proposals: Proposal[] = [];
      
      try {
        // Fetch from main branch (2025)
        const mainUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderName}?ref=${MAIN_BRANCH}`;
        const mainProposals = await fetchProposalsFromBranch(mainUrl, 2025);
        proposals.push(...mainProposals);
        
        // Fetch from gsoc_guide branch (2022-2024)
        const years = ['2019', '2022', '2021', '2023', '2024'];
        for (const year of years) {
          const guideUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/Proposals/${year}/${folderName}?ref=${GUIDE_BRANCH}`;
          const yearProposals = await fetchProposalsFromBranch(guideUrl, parseInt(year));
          proposals.push(...yearProposals);
        }
        
        if (proposals.length > 0) {
          console.log(`Found ${proposals.length} proposals with folder name: ${folderName}`);
        }
      } catch (error) {
        console.error(`Error fetching proposals for ${folderName}:`, error);
      }
      
      return proposals;
    };
    
    // Try all folder variations and merge the results
    for (const folderName of uniqueFolderVariations) {
      const proposals = await tryFetchProposals(folderName);
      allProposals.push(...proposals);
    }
    
    // Deduplicate proposals based on fileName to avoid duplicates from different folders
    const seenFileNames = new Set<string>();
    const uniqueProposals: Proposal[] = [];
    
    allProposals.forEach(proposal => {
      if (!seenFileNames.has(proposal.fileName)) {
        seenFileNames.add(proposal.fileName);
        uniqueProposals.push(proposal);
      }
    });
    
    // If no proposals found on GitHub, try local filesystem
    if (uniqueProposals.length === 0) {
      console.log(`No proposals found on GitHub for any variation of ${lowerCaseOrgName}, trying local filesystem`);
      return getLocalProposals(lowerCaseOrgName);
    }
    
    console.log(`Total unique proposals found for ${lowerCaseOrgName}: ${uniqueProposals.length}`);
    return uniqueProposals;
  } catch (error) {
    console.error(`Error fetching proposals for ${orgName}:`, error);
    // Try local filesystem as a fallback
    console.log(`Error fetching GitHub proposals for ${orgName}, trying local filesystem`);
    return getLocalProposals(orgName.toLowerCase());
  }
}

/**
 * Helper function to fetch proposals from a specific branch
 */
async function fetchProposalsFromBranch(url: string, year: number): Promise<Proposal[]> {
  try {
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
        // This is normal, just means no proposals at this URL
        return [];
      }
      console.error(`GitHub API error (${response.status}) for ${url}`);
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
  } catch (error) {
    console.error(`Error in fetchProposalsFromBranch for ${url}:`, error);
    return [];
  }
}

/**
 * Returns a mapping of organization names to whether they have proposals
 * This is used to mark organizations with proposals in the UI
 */
export async function getAllOrganizationsWithGitHubProposals(): Promise<Record<string, boolean>> {
  try {
    const organizationsSet = new Set<string>();
    const result: Record<string, boolean> = {};

    // Get the case mapping from GitHub
    const caseMap = await getGitHubOrganizationCaseMap();

    // Get organizations from main branch (2025)
    try {
      const mainOrgs = await getGitHubOrganizations();
      mainOrgs.forEach(org => organizationsSet.add(org.toLowerCase()));
    } catch (error) {
      console.error('Error fetching main branch organizations:', error);
    }

    // Get organizations from gsoc_guide branch for each year
    const years = ['2021', '2023', '2024'];
    for (const year of years) {
      try {
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/Proposals/${year}?ref=${GUIDE_BRANCH}`;
        const headers: HeadersInit = {
          'Accept': 'application/vnd.github.v3+json',
          'X-GitHub-Api-Version': '2022-11-28'
        };
        
        if (GITHUB_TOKEN) {
          headers['Authorization'] = `token ${GITHUB_TOKEN}`;
        }
        
        const response = await fetch(url, { headers, cache: 'no-store' });
        if (response.ok) {
          const contents: GitHubContent[] = await response.json();
          const yearOrgs = contents
            .filter(item => item.type === 'dir')
            .map(item => item.name.toLowerCase());
          yearOrgs.forEach(org => organizationsSet.add(org));
        }
      } catch (error) {
        console.error(`Error fetching organizations for year ${year}:`, error);
      }
    }

    // Add local organizations
    try {
      const localOrgs = getLocalOrganizations();
      localOrgs.forEach(org => organizationsSet.add(org.toLowerCase()));
    } catch (error) {
      console.error('Error getting local organizations:', error);
    }

    // Convert Set to Array for processing
    const organizations = Array.from(organizationsSet);
    console.log('Total unique organizations found:', organizations.length);

    // Check each organization for proposals
    for (const org of organizations) {
      try {
        // Use the case mapping to get the actual case if available
        const actualCaseName = caseMap[org] || org;
        console.log(`Checking proposals for ${org} (actual case: ${actualCaseName})`);
        
        // We let getProposalsForGitHubOrganization handle trying different case variations
        const proposals = await getProposalsForGitHubOrganization(org);
        result[org.toLowerCase()] = proposals.length > 0;
        if (proposals.length > 0) {
          console.log(`Organization ${org} has ${proposals.length} proposals`);
        }
      } catch (error) {
        console.error(`Error checking proposals for ${org}:`, error);
        result[org.toLowerCase()] = false;
      }
    }

    const orgsWithProposals = Object.values(result).filter(Boolean).length;
    console.log(`Found ${orgsWithProposals} organizations with proposals out of ${organizations.length} total organizations`);
    
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

/**
 * Gets the actual case-sensitive organization folder names from GitHub
 * This helps match lowercase org names with the actual case in the repo
 * Returns a mapping of lowercase names to arrays of all case variations
 */
export async function getGitHubOrganizationCaseMap(): Promise<Record<string, string>> {
  // Return from cache if available
  if (Object.keys(orgCaseMapCache).length > 0) {
    // Convert from string[] to string by taking the first entry (case priority)
    const singleCaseMap: Record<string, string> = {};
    Object.entries(orgCaseMapCache).forEach(([key, values]) => {
      singleCaseMap[key] = values[0];
    });
    return singleCaseMap;
  }
  
  try {
    const caseMap: Record<string, string[]> = {};
    
    // Get organizations from main branch
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents?ref=${MAIN_BRANCH}`;
    
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
      console.error(`GitHub API error (${response.status})`);
      return {};
    }

    const contents: GitHubContent[] = await response.json();
    
    // Build mapping from lowercase name to array of case variations
    contents
      .filter(item => item.type === 'dir')
      .forEach(item => {
        const lowerKey = item.name.toLowerCase();
        if (!caseMap[lowerKey]) {
          caseMap[lowerKey] = [];
        }
        // Add to the array if not already included
        if (!caseMap[lowerKey].includes(item.name)) {
          caseMap[lowerKey].push(item.name);
        }
      });
    
    // Also check each year's proposals directory
    const years = ['2019', '2022', '2021', '2023', '2024'];
    for (const year of years) {
      try {
        const yearUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/Proposals/${year}?ref=${GUIDE_BRANCH}`;
        const yearResponse = await fetch(yearUrl, {
          headers,
          cache: 'no-store'
        });
        
        if (yearResponse.ok) {
          const yearContents: GitHubContent[] = await yearResponse.json();
          yearContents
            .filter(item => item.type === 'dir')
            .forEach(item => {
              const lowerKey = item.name.toLowerCase();
              if (!caseMap[lowerKey]) {
                caseMap[lowerKey] = [];
              }
              // Add to the array if not already included
              if (!caseMap[lowerKey].includes(item.name)) {
                caseMap[lowerKey].push(item.name);
              }
            });
        }
      } catch (error) {
        console.error(`Error fetching year ${year} directories:`, error);
      }
    }
    
    console.log('Created organization case mapping:', caseMap);
    
    // Cache the result
    orgCaseMapCache = caseMap;
    
    // Convert from string[] to string by taking the first entry (case priority)
    const singleCaseMap: Record<string, string> = {};
    Object.entries(caseMap).forEach(([key, values]) => {
      singleCaseMap[key] = values[0];
    });
    
    return singleCaseMap;
  } catch (error) {
    console.error('Error fetching GitHub organization case map:', error);
    return {};
  }
} 
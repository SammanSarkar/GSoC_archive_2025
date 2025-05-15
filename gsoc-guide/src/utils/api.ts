import { Organization } from '@/types';

export async function fetchOrganizations2025(): Promise<Organization[]> {
  try {
    // Use the Next.js rewrite to avoid CORS issues
    const response = await fetch('/api/organizations/2025.json', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch organizations: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if the response has the expected structure
    if (!data || !Array.isArray(data.organizations)) {
      console.error('Unexpected API response format:', data);
      return [];
    }
    
    return data.organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
}

export async function fetchOrganizationDetails(orgName: string): Promise<Organization | null> {
  try {
    // Make a direct API call to get all organizations and then find the specific one
    // This avoids the client-side URL parsing error
    const response = await fetch('/api/organizations/2025.json', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch organizations: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data.organizations)) {
      console.error('Unexpected API response format:', data);
      return null;
    }
    
    // Find the organization with the matching name
    return data.organizations.find((org: Organization) => org.name.toLowerCase() === orgName.toLowerCase()) || null;
  } catch (error) {
    console.error('Error fetching organization details:', error);
    return null;
  }
} 
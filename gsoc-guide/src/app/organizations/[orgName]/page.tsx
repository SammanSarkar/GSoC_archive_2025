import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Organization } from '@/types';
import ProjectList from '@/components/ProjectList';
import ProposalList from '@/components/ProposalList';
import { getProposalsForGitHubOrganization } from '@/utils/github';

interface OrganizationPageProps {
  params: {
    orgName: string;
  };
}

export async function generateMetadata({
  params,
}: OrganizationPageProps): Promise<Metadata> {
  const orgName = decodeURIComponent(params.orgName);
  
  try {
    // Directly fetch organization data from the API
    const response = await fetch('https://api.gsocorganizations.dev/2025.json');
    const data = await response.json();
    
    if (!data || !Array.isArray(data.organizations)) {
      return {
        title: 'Organization Not Found | GSoC Guide',
      };
    }
    
    const organization = data.organizations.find((org: Organization) => 
      org.name.toLowerCase() === orgName.toLowerCase()
    );
    
    if (!organization) {
      return {
        title: 'Organization Not Found | GSoC Guide',
      };
    }
    
    return {
      title: `${organization.name} | GSoC Guide`,
      description: organization.description,
    };
  } catch (error) {
    console.error('Error fetching organization metadata:', error);
    return {
      title: 'Organization | GSoC Guide',
    };
  }
}

export default async function OrganizationPage({ params }: OrganizationPageProps) {
  const orgName = decodeURIComponent(params.orgName);
  
  // Directly fetch organization data from the API to avoid client-side routing issues
  let organization: Organization | null = null;
  
  try {
    const response = await fetch('https://api.gsocorganizations.dev/2025.json');
    const data = await response.json();
    
    if (data && Array.isArray(data.organizations)) {
      organization = data.organizations.find((org: Organization) => 
        org.name.toLowerCase() === orgName.toLowerCase()
      );
    }
  } catch (error) {
    console.error('Error fetching organization:', error);
  }
  
  if (!organization) {
    notFound();
  }
  
  // Fetch proposals directly from GitHub API
  let proposals = [];
  try {
    proposals = await getProposalsForGitHubOrganization(orgName);
    console.log(`Fetched ${proposals.length} proposals for ${orgName}`);
  } catch (error) {
    console.error('Error fetching proposals:', error);
  }
  
  return (
    <div>
      <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-5 h-5 mr-1"
        >
          <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
        </svg>
        Back to Organizations
      </Link>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - Organization Details and Projects */}
        <div className="md:w-[70%]">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                  {organization.image_url ? (
                    <Image
                      src={organization.image_url}
                      alt={`${organization.name} logo`}
                      fill
                      sizes="(max-width: 768px) 96px, 96px"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded-full">
                      <span className="text-3xl font-bold text-gray-500">
                        {organization.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
                  <p className="mt-2 text-gray-600">{organization.description}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {organization.technologies.map(tech => (
                      <span 
                        key={tech} 
                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={organization.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      Visit Organization Website
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 20 20" 
                        fill="currentColor" 
                        className="w-4 h-4 ml-1"
                      >
                        <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Projects Section */}
          {organization.projects && <ProjectList projects={organization.projects} />}
        </div>
        
        {/* Right Column - Proposals */}
        <div className="md:w-[30%]">
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Proposals</h2>
              <ProposalList orgName={organization.name} proposals={proposals} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
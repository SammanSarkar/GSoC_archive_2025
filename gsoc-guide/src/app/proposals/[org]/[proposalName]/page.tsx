import { Metadata } from 'next';
import Link from 'next/link';
import { getProposalsForGitHubOrganization } from '@/utils/github';

interface ProposalPageProps {
  params: {
    org: string;
    proposalName: string;
  };
}

export async function generateMetadata({
  params,
}: ProposalPageProps): Promise<Metadata> {
  const { org, proposalName } = params;
  
  return {
    title: `${decodeURIComponent(proposalName)} | ${decodeURIComponent(org)} | GSoC Guide`,
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { org, proposalName } = params;
  const decodedOrg = decodeURIComponent(org);
  
  // Fetch proposals to get the correct file path
  const proposals = await getProposalsForGitHubOrganization(decodedOrg);
  const proposal = proposals.find(p => p.fileName === decodeURIComponent(proposalName));
  
  if (!proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Proposal Not Found</h1>
          <Link href={`/organizations/${encodeURIComponent(decodedOrg)}`} className="text-blue-600 hover:text-blue-800 flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              className="w-5 h-5 mr-1"
            >
              <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
            </svg>
            Back to {decodedOrg}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/organizations/${encodeURIComponent(decodedOrg)}`} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-5 h-5 mr-1"
          >
            <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
          </svg>
          Back to {decodedOrg}
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">{proposal.title}</h1>
        <p className="text-gray-600 mb-4">Year: {proposal.year}</p>
        <iframe 
          src={proposal.url} 
          className="w-full h-[800px] border-0"
          title={proposal.title}
        />
      </div>
    </div>
  );
} 
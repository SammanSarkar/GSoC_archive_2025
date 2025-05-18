import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getProposalsForGitHubOrganization } from '@/utils/github';
import PDFViewerWrapper from '@/components/PDFViewerWrapper';

interface ProposalPageProps {
  params: {
    orgName: string;
    proposalName: string;
  };
}

export async function generateMetadata({ params }: ProposalPageProps) {
  const { orgName, proposalName } = params;
  
  return {
    title: `${decodeURIComponent(proposalName)} | ${decodeURIComponent(orgName)} | GSoC Guide`,
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { orgName, proposalName } = params;
  const decodedOrgName = decodeURIComponent(orgName);
  const decodedProposalName = decodeURIComponent(proposalName);
  
  // Redirect to lowercase version of the URL if it's not already lowercase
  if (decodedOrgName !== decodedOrgName.toLowerCase()) {
    redirect(`/proposals/${encodeURIComponent(decodedOrgName.toLowerCase())}/${encodeURIComponent(decodedProposalName)}`);
  }
  
  // Get all proposals for this organization to find the matching one
  const proposals = await getProposalsForGitHubOrganization(decodedOrgName.toLowerCase());
  const proposal = proposals.find(p => p.fileName === decodedProposalName);
  
  if (!proposal) {
    notFound();
  }

  console.log('Displaying proposal:', proposal);
  
  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="mb-6 bg-white shadow-sm p-4 rounded-lg flex items-center justify-between">
        <Link href={`/organizations/${encodeURIComponent(decodedOrgName.toLowerCase())}`} className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-5 h-5 mr-1"
          >
            <path fillRule="evenodd" d="M18 10a.75.75 0 01-.75.75H4.66l2.1 1.95a.75.75 0 11-1.02 1.1l-3.5-3.25a.75.75 0 010-1.1l3.5-3.25a.75.75 0 111.02 1.1l-2.1 1.95h12.59A.75.75 0 0118 10z" clipRule="evenodd" />
          </svg>
          Back to {decodedOrgName}
        </Link>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow p-4">
        <PDFViewerWrapper fileUrl={proposal.path} fileName={decodedProposalName} />
      </div>
    </div>
  );
} 
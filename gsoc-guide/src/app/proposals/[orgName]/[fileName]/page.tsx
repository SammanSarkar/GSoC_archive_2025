import Link from 'next/link';
import { notFound } from 'next/navigation';
import PDFViewer from '@/components/PDFViewer';

interface ProposalPageProps {
  params: {
    orgName: string;
    fileName: string;
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const { orgName, fileName } = params;
  const decodedOrgName = decodeURIComponent(orgName);
  const decodedFileName = decodeURIComponent(fileName);
  
  // Fetch proposals from API
  const proposalsResponse = await fetch(`/api/proposals/${encodeURIComponent(decodedOrgName)}`, { next: { revalidate: 3600 } });
  const proposals = await proposalsResponse.json();
  
  const proposal = proposals.find((p: any) => p.fileName === decodedFileName);
  
  if (!proposal) {
    notFound();
  }
  
  return (
    <div>
      <Link 
        href={`/organizations/${encodeURIComponent(decodedOrgName)}`} 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
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
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-4">
        <PDFViewer fileUrl={proposal.path} fileName={proposal.fileName} />
      </div>
    </div>
  );
} 
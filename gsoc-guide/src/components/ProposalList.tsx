import Link from 'next/link';
import { Proposal } from '@/types';

interface ProposalListProps {
  orgName: string;
  proposals: Proposal[];
}

export default function ProposalList({ orgName, proposals }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <p className="text-yellow-800">No proposals available for this organization.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Proposals</h3>
      <div className="bg-white rounded-lg shadow divide-y">
        {proposals.map((proposal, index) => (
          <div key={index} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">{proposal.fileName}</span>
                {proposal.size && (
                  <span className="text-xs text-gray-500">{Math.round(proposal.size / 1024)} KB</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Link 
                  href={`/proposals/${encodeURIComponent(orgName)}/${encodeURIComponent(proposal.fileName)}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </Link>
                <a 
                  href={proposal.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  download={proposal.fileName}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
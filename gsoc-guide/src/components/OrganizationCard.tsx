import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Organization } from '@/types';

interface OrganizationCardProps {
  organization: Organization;
}

export default function OrganizationCard({ organization }: OrganizationCardProps) {
  const { name, image_url, description, hasProposals } = organization;
  const router = useRouter();
  
  const handleNavigate = () => {
    // Use server-side navigation to avoid client-side routing issues
    window.location.href = `/organizations/${encodeURIComponent(name)}`;
  };
  
  return (
    <div 
      onClick={handleNavigate}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            {image_url ? (
              <Image
                src={image_url}
                alt={`${name} logo`}
                fill
                className="object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-full">
                <span className="text-xl font-bold text-gray-500">
                  {name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              {hasProposals && (
                <span className="ml-2 flex items-center text-green-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-5 h-5"
                  >
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {description || 'No description available'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
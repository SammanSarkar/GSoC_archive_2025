import { Organization } from '@/types';
import OrganizationCard from './OrganizationCard';

interface OrganizationsGridProps {
  organizations: Organization[];
}

export default function OrganizationsGrid({ organizations }: OrganizationsGridProps) {
  if (organizations.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No organizations found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {organizations.map((org, index) => (
        <OrganizationCard key={index} organization={org} />
      ))}
    </div>
  );
} 
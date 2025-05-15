import { Suspense } from 'react';
import OrganizationsGrid from '@/components/OrganizationsGrid';
import SearchFiltersWrapper from '@/components/SearchFiltersWrapper';

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Google Summer of Code 2025 Guide</h1>
        <p className="text-gray-600">
          Explore organizations participating in GSoC 2025 and view available student proposals.
        </p>
        </div>
      
      <Suspense fallback={<div className="text-center py-10">Loading organizations...</div>}>
        <SearchFiltersWrapper />
      </Suspense>
    </div>
  );
}

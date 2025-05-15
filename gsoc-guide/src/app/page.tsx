import { Suspense } from 'react';
import OrganizationsLayout from '@/components/OrganizationsLayout';

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore the Largest Collection of Accepted Proposals</h1>
        <p className="text-gray-600">
        Maximize your GSoC chances with a proposal that stands out.<br/>
        Learn what makes mentors pick one over the hundreds they reject.
        </p>
      </div>
      
      <Suspense fallback={<div className="text-center py-10">Loading organizations...</div>}>
        <OrganizationsLayout />
      </Suspense>
    </div>
  );
}

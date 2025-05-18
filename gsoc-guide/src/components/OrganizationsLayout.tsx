'use client';

import { useState, useEffect, useCallback } from 'react';
import { Organization } from '@/types';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import OrganizationsGrid from './OrganizationsGrid';
import { fetchOrganizations2025 } from '@/utils/api';
import { getOrgProposalsData, getTotalProposals } from '@/utils/orgData';

export default function OrganizationsLayout() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'projectCount'>('projectCount');
  const [showFilters, setShowFilters] = useState(false);
  const [totalProposals, setTotalProposals] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch organizations from API
        const orgs = await fetchOrganizations2025();
        
        // Get proposal data from local JSON
        const proposalsData = getOrgProposalsData();
        const totalProps = getTotalProposals();
        
        // Add hasProposals flag to each organization
        const orgsWithProposalsFlag = orgs.map(org => ({
          ...org,
          hasProposals: proposalsData[org.name.toLowerCase()]?.hasProposals || false
        }));
        
        setOrganizations(orgsWithProposalsFlag);
        setFilteredOrgs(sortOrganizations(orgsWithProposalsFlag, 'name'));
        setTotalProposals(totalProps);
        
        // Extract all unique technologies and topics
        const techs = new Set<string>();
        const topics = new Set<string>();
        
        orgs.forEach(org => {
          org.technologies.forEach(tech => techs.add(tech));
          org.topics.forEach(topic => topics.add(topic));
        });
        
        setAllTechnologies(Array.from(techs));
        setAllTopics(Array.from(topics));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load organizations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = useCallback(
    (
      query: string = searchQuery,
      technologies: string[] = [],
      topics: string[] = [],
      hasProposals: boolean = false
    ) => {
      let filtered = organizations;
      
      // Filter by search query
      if (query) {
        const lowercaseQuery = query.toLowerCase();
        filtered = filtered.filter(org => 
          org.name.toLowerCase().includes(lowercaseQuery) || 
          org.description.toLowerCase().includes(lowercaseQuery)
        );
      }
      
      // Filter by technologies
      if (technologies.length > 0) {
        filtered = filtered.filter(org => 
          technologies.some(tech => org.technologies.includes(tech))
        );
      }
      
      // Filter by topics
      if (topics.length > 0) {
        filtered = filtered.filter(org => 
          topics.some(topic => org.topics.includes(topic))
        );
      }
      
      // Filter by proposal availability
      if (hasProposals) {
        filtered = filtered.filter(org => org.hasProposals);
      }
      
      // Sort the filtered organizations
      const sorted = sortOrganizations(filtered, sortBy);
      setFilteredOrgs(sorted);
    },
    [organizations, searchQuery, sortBy]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    applyFilters(query, [], [], false);
  }, [applyFilters]);

  const sortOrganizations = (orgs: Organization[], sortOption = sortBy) => {
    // First, separate organizations with and without proposals
    const withProposals = orgs.filter(org => org.hasProposals);
    const withoutProposals = orgs.filter(org => !org.hasProposals);
    
    // Sort each group based on the selected sort option
    if (sortOption === 'projectCount') {
      withProposals.sort((a, b) => (b.num_projects || 0) - (a.num_projects || 0));
      withoutProposals.sort((a, b) => (b.num_projects || 0) - (a.num_projects || 0));
    } else {
      withProposals.sort((a, b) => a.name.localeCompare(b.name));
      withoutProposals.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Return concatenated results
    return [...withProposals, ...withoutProposals];
  };

  const handleFilterChange = (filters: { technologies: string[], topics: string[], hasProposals: boolean }) => {
    applyFilters(searchQuery, filters.technologies, filters.topics, filters.hasProposals);
    // On mobile, auto-close filters after applying
    if (window.innerWidth < 768) {
      setShowFilters(false);
    }
  };

  const handleSortChange = (sortOption: 'name' | 'projectCount') => {
    setSortBy(sortOption);
    const sorted = sortOrganizations(filteredOrgs, sortOption);
    setFilteredOrgs(sorted);
  };

  // Toggle filter sidebar for mobile
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Split the organizations into two groups for display
  const orgsWithProposals = filteredOrgs.filter(org => org.hasProposals);
  const orgsWithoutProposals = filteredOrgs.filter(org => !org.hasProposals);

  if (loading) {
    return <div className="text-center py-10">Loading organizations...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Mobile Filter Toggle Button - only visible on mobile */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button 
          onClick={toggleFilters}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg"
          aria-label={showFilters ? "Close filters" : "Show filters"}
        >
          {showFilters ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Filters Overlay - only visible on mobile when active */}
      <div className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={toggleFilters}>
      </div>
      
      {/* Mobile Filters Sidebar - slides in from right */}
      <div className={`md:hidden fixed right-0 top-0 bottom-0 w-4/5 max-w-xs bg-white z-40 shadow-xl transform transition-transform duration-300 overflow-y-auto ${showFilters ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Filters</h3>
            <button onClick={toggleFilters} className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <SearchBar onSearch={handleSearch} />
          <FilterBar 
            technologies={allTechnologies}
            topics={allTopics}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column - 75% - Organizations */}
        <div className="w-full md:w-[75%]">
          <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex flex-col gap-1 text-gray-700">
              <div>
                Found <span className="font-medium">{filteredOrgs.length}</span> organizations
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value as 'projectCount' | 'name')}
                className="text-sm border rounded px-2 py-1 bg-white"
              >
                <option value="projectCount">Project Count</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {filteredOrgs.length > 0 ? (
            <div>
              {/* Organizations with proposals */}
              {orgsWithProposals.length > 0 && (
                <div className="mb-6">
                  {orgsWithProposals.length < filteredOrgs.length && (
                    <div className="mb-3 flex justify-between items-center">
                      <h3 className="text-md font-medium text-gray-700">
                        Organizations with proposals ({orgsWithProposals.length})
                      </h3>
                      <h3 className="text-md font-medium text-gray-700">
                        Total <span className="font-bold">{totalProposals}</span> proposal{totalProposals !== 1 && 's'} available
                      </h3>
                    </div>
                  )}
                  <OrganizationsGrid organizations={orgsWithProposals} />
                </div>
              )}
              
              {/* Divider if both sections exist */}
              {orgsWithProposals.length > 0 && orgsWithoutProposals.length > 0 && (
                <div className="border-t border-gray-200 my-6"></div>
              )}
              
              {/* Organizations without proposals */}
              {orgsWithoutProposals.length > 0 && (
                <div>
                  {orgsWithProposals.length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-md font-medium text-gray-500">
                        Other organizations ({orgsWithoutProposals.length})
                      </h3>
                    </div>
                  )}
                  <OrganizationsGrid organizations={orgsWithoutProposals} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No organizations found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* Right Column - 25% - Search & Filters - Only visible on desktop */}
        <div className="hidden md:block md:w-[25%]">
          <div className="sticky top-4">
            <SearchBar onSearch={handleSearch} />
            <FilterBar 
              technologies={allTechnologies}
              topics={allTopics}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 
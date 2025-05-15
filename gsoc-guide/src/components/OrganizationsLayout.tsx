'use client';

import { useState, useEffect, useCallback } from 'react';
import { Organization } from '@/types';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import OrganizationsGrid from './OrganizationsGrid';
import { fetchOrganizations2025 } from '@/utils/api';

export default function OrganizationsLayout() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [proposalsMap, setProposalsMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'projectCount'>('name');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const orgs = await fetchOrganizations2025();
        
        // Fetch proposals data from the API
        const proposalsResponse = await fetch('/api/proposals');
        const proposalsData = await proposalsResponse.json();
        
        // Add hasProposals flag to each organization
        const orgsWithProposalsFlag = orgs.map(org => ({
          ...org,
          hasProposals: proposalsData[org.name.toLowerCase()] || false
        }));
        
        setOrganizations(orgsWithProposalsFlag);
        setFilteredOrgs(sortOrganizationsByProposalsAndName(orgsWithProposalsFlag));
        setProposalsMap(proposalsData);
        
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
        setError('Failed to fetch organization data. Please try again later.');
        setOrganizations([]);
        setFilteredOrgs([]);
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
      const sorted = sortOrganizations(filtered);
      setFilteredOrgs(sorted);
    },
    [organizations, searchQuery]
  );

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    applyFilters(query, [], [], false);
  }, [applyFilters]);

  const sortOrganizationsByProposalsAndName = (orgs: Organization[]) => {
    // First, separate organizations with and without proposals
    const withProposals = orgs.filter(org => org.hasProposals);
    const withoutProposals = orgs.filter(org => !org.hasProposals);
    
    // Sort each group by name (default sort)
    withProposals.sort((a, b) => a.name.localeCompare(b.name));
    withoutProposals.sort((a, b) => a.name.localeCompare(b.name));
    
    // Return concatenated results
    return [...withProposals, ...withoutProposals];
  };

  const sortOrganizations = (orgs: Organization[]) => {
    // First, separate organizations with and without proposals
    const withProposals = orgs.filter(org => org.hasProposals);
    const withoutProposals = orgs.filter(org => !org.hasProposals);
    
    // Sort each group based on the selected sort option
    if (sortBy === 'projectCount') {
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
  };

  const handleSortChange = (sortOption: 'name' | 'projectCount') => {
    setSortBy(sortOption);
    const sorted = sortOrganizations(filteredOrgs);
    setFilteredOrgs(sorted);
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
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Column - 75% - Organizations */}
      <div className="md:w-[75%]">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-gray-700">
            Found <span className="font-medium">{filteredOrgs.length}</span> organizations
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Sort by:</span>
            <select 
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as 'name' | 'projectCount')}
              className="text-sm border rounded px-2 py-1 bg-white"
            >
              <option value="name">Name</option>
              <option value="projectCount">Project Count</option>
            </select>
          </div>
        </div>

        {filteredOrgs.length > 0 ? (
          <div>
            {/* Organizations with proposals */}
            {orgsWithProposals.length > 0 && (
              <div className="mb-6">
                {orgsWithProposals.length < filteredOrgs.length && (
                  <div className="mb-3">
                    <h3 className="text-md font-medium text-gray-700">
                      Organizations with proposals ({orgsWithProposals.length})
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

      {/* Right Column - 25% - Search & Filters */}
      <div className="md:w-[25%]">
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
  );
} 
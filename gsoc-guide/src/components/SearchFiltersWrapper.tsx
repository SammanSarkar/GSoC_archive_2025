'use client';

import { useState, useEffect } from 'react';
import { Organization } from '@/types';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import OrganizationsGrid from './OrganizationsGrid';
import { fetchOrganizations2025 } from '@/utils/api';

export default function SearchFiltersWrapper() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTechnologies, setAllTechnologies] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [proposalsMap, setProposalsMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

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
        setFilteredOrgs(orgsWithProposalsFlag);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, [], [], false);
  };

  const applyFilters = (
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
    
    setFilteredOrgs(filtered);
  };

  const handleFilterChange = (filters: { technologies: string[], topics: string[], hasProposals: boolean }) => {
    applyFilters(searchQuery, filters.technologies, filters.topics, filters.hasProposals);
  };

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
    <div>
      <SearchBar onSearch={handleSearch} />
      <FilterBar 
        technologies={allTechnologies}
        topics={allTopics}
        onFilterChange={handleFilterChange}
      />
      {filteredOrgs.length > 0 ? (
        <OrganizationsGrid organizations={filteredOrgs} />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-600">No organizations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
} 
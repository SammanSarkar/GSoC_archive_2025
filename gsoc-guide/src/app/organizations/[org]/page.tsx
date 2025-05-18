'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Organization } from '@/types';
import { fetchOrganization } from '@/utils/api';
import { fetchProposals } from '@/utils/github';
import { Proposal } from '@/types';
import Link from 'next/link';
import { FaGithub, FaGlobe, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function OrganizationPage() {
  const params = useParams();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch organization data
        const orgData = await fetchOrganization(params.org as string);
        setOrganization(orgData);
        
        // Fetch proposals
        const proposalsData = await fetchProposals(params.org as string);
        setProposals(proposalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load organization data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.org]);

  if (loading) {
    return <div className="text-center py-10">Loading organization data...</div>;
  }

  if (error || !organization) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error || 'Organization not found'}</p>
        <Link href="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Organization Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="w-full md:w-1/4 flex justify-center">
            <img 
              src={organization.logo_url} 
              alt={`${organization.name} logo`}
              className="w-32 h-32 object-contain"
            />
          </div>
          
          {/* Info */}
          <div className="w-full md:w-3/4">
            <h1 className="text-2xl font-bold mb-2">{organization.name}</h1>
            <p className="text-gray-600 mb-4">{organization.description}</p>
            
            {/* Social Links */}
            <div className="flex gap-4 mb-4">
              {organization.github_url && (
                <a 
                  href={organization.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaGithub size={24} />
                </a>
              )}
              {organization.website_url && (
                <a 
                  href={organization.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaGlobe size={24} />
                </a>
              )}
              {organization.twitter_url && (
                <a 
                  href={organization.twitter_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaTwitter size={24} />
                </a>
              )}
              {organization.linkedin_url && (
                <a 
                  href={organization.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-900"
                >
                  <FaLinkedin size={24} />
                </a>
              )}
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {organization.technologies.map((tech, index) => (
                <span 
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {tech}
                </span>
              ))}
              {organization.topics.map((topic, index) => (
                <span 
                  key={index}
                  className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Proposals First */}
      <div className="md:hidden space-y-6">
        {/* Proposals Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Proposals</h2>
          {proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{proposal.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">Year: {proposal.year}</p>
                  <a 
                    href={proposal.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Proposal
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No proposals available yet.</p>
          )}
        </div>

        {/* Student Blogs Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Student Blogs</h2>
          <div className="text-center py-8">
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {organization.projects && organization.projects.length > 0 ? (
            <div className="space-y-4">
              {organization.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No projects available yet.</p>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid grid-cols-3 gap-6">
        {/* Projects Card */}
        <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          {organization.projects && organization.projects.length > 0 ? (
            <div className="space-y-4">
              {organization.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{project.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                  {project.technologies && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span 
                          key={techIndex}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                  {project.url && (
                    <a 
                      href={project.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Learn More
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No projects available yet.</p>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Proposals Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Proposals</h2>
            {proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((proposal, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{proposal.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">Year: {proposal.year}</p>
                    <a 
                      href={proposal.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Proposal
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No proposals available yet.</p>
            )}
          </div>

          {/* Student Blogs Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Student Blogs</h2>
            <div className="text-center py-8">
              <p className="text-gray-600">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
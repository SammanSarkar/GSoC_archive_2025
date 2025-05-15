'use client';

import { useState } from 'react';

interface FilterBarProps {
  technologies: string[];
  topics: string[];
  onFilterChange: (filters: { technologies: string[], topics: string[], hasProposals: boolean }) => void;
}

export default function FilterBar({ technologies, topics, onFilterChange }: FilterBarProps) {
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showProposalsOnly, setShowProposalsOnly] = useState(false);

  const handleTechChange = (tech: string) => {
    setSelectedTechs(prev => {
      const newSelection = prev.includes(tech)
        ? prev.filter(t => t !== tech)
        : [...prev, tech];
      
      onFilterChange({ 
        technologies: newSelection, 
        topics: selectedTopics, 
        hasProposals: showProposalsOnly 
      });
      
      return newSelection;
    });
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopics(prev => {
      const newSelection = prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic];
      
      onFilterChange({ 
        technologies: selectedTechs, 
        topics: newSelection, 
        hasProposals: showProposalsOnly 
      });
      
      return newSelection;
    });
  };

  const handleProposalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowProposalsOnly(e.target.checked);
    onFilterChange({ 
      technologies: selectedTechs, 
      topics: selectedTopics, 
      hasProposals: e.target.checked 
    });
  };

  const clearFilters = () => {
    setSelectedTechs([]);
    setSelectedTopics([]);
    setShowProposalsOnly(false);
    onFilterChange({ technologies: [], topics: [], hasProposals: false });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        {(selectedTechs.length > 0 || selectedTopics.length > 0 || showProposalsOnly) && (
          <button 
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            id="proposals-only"
            type="checkbox"
            checked={showProposalsOnly}
            onChange={handleProposalsChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="proposals-only" className="ml-2 text-sm text-gray-700">
            Show organizations with proposals only
          </label>
        </div>
      </div>
      
      {technologies.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {technologies.slice(0, 10).map(tech => (
              <button
                key={tech}
                onClick={() => handleTechChange(tech)}
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedTechs.includes(tech)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {topics.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Topics</h4>
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 10).map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicChange(topic)}
                className={`text-xs px-2 py-1 rounded-full ${
                  selectedTopics.includes(topic)
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
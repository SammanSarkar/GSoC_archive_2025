import { Project } from '@/types';

interface ProjectListProps {
  projects: Project[];
}

export default function ProjectList({ projects }: ProjectListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
        <p className="text-gray-600">No projects available for this organization.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects for 2025</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
          >
            <h4 className="text-md font-medium text-gray-900 mb-1">{project.title}</h4>
            {project.student_name && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Student:</span> {project.student_name}
              </p>
            )}
            {project.project_url && (
              <a 
                href={project.project_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
              >
                View details
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="w-3 h-3 ml-1"
                >
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
export interface Organization {
  name: string;
  image_url: string;
  image_background_color: string;
  description: string;
  url: string;
  num_projects: number;
  category: string;
  projects_url: string;
  irc_channel?: string;
  contact_email?: string;
  mailing_list?: string;
  twitter_url?: string;
  blog_url?: string;
  topics: string[];
  technologies: string[];
  projects?: Project[];
  hasProposals?: boolean;
}

export interface Project {
  title: string;
  short_description: string;
  description: string;
  student_name?: string;
  code_url?: string;
  project_url?: string;
}

export interface Proposal {
  fileName: string;
  path: string;
  size?: number;
  sha?: string;
}

export interface OrganizationWithProposals extends Organization {
  proposals: Proposal[];
} 
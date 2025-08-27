
import { useQuery } from '@tanstack/react-query';

export interface Project {
  id: string;
  title: string;
  type: string;
  status: string;
  created_at: string;
}

const fetchProjects = async (): Promise<Project[]> => {
  // Mock data for now
  return [
    {
      id: '1',
      title: 'Project Alpha',
      type: 'Web App',
      status: 'Active',
      created_at: new Date().toISOString(),
    },
    {
      id: '2', 
      title: 'Project Beta',
      type: 'API',
      status: 'In Progress',
      created_at: new Date().toISOString(),
    },
  ];
};

export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
};

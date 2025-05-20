'use client';

import { ProjectDetailProvider } from '@/components/pages/project/context/projectDetail';

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectDetailProvider>
      <div className="pt-[20px]">{children}</div>
    </ProjectDetailProvider>
  );
};

export default ProjectLayout;

'use client';

import { ProjectDetailProvider } from '@/components/pages/project/context/projectDetail';
import { ProjectLogProvider } from '@/components/pages/project/context/projectLog';

const ProjectLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProjectDetailProvider>
      <ProjectLogProvider>
        <div className="pt-[20px]">{children}</div>
      </ProjectLogProvider>
    </ProjectDetailProvider>
  );
};

export default ProjectLayout;

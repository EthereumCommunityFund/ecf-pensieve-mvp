'use client';

import { ProjectDetailProvider } from '@/components/pages/project/context/projectDetailContext';
import { ProjectLogProvider } from '@/components/pages/project/context/projectLogContext';

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

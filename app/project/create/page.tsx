import React from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import CreateProjectForm from '@/components/pages/project/create/CreateProjectForm';
import { IFormTypeEnum } from '@/components/pages/project/create/types';

const CreateProjectPage: React.FC = () => {
  return (
    <div className="mobile:gap-[10px] flex flex-col gap-[20px]">
      <BackHeader>
        <span>Contribute</span>
        <span className="font-[600]">/</span>
        <span>Proposal a Project</span>
      </BackHeader>

      <CreateProjectForm
        formType={IFormTypeEnum.Project}
        redirectPath="/projects/pending"
      />
    </div>
  );
};

export default CreateProjectPage;

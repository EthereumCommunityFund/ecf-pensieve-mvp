import React from 'react';

import BackHeader from '@/components/pages/project/BackHeader';
import CreateProjectForm from '@/components/pages/project/create/CreateProjectForm';

const CreateProjectPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-[20px] mobile:gap-[10px]">
      <BackHeader />
      <CreateProjectForm />
    </div>
  );
};

export default CreateProjectPage;

'use client';

import { useParams } from 'next/navigation';

import BackHeader from '@/components/pages/project/BackHeader';
import CreateProjectForm from '@/components/pages/project/create/CreateProjectForm';
import { IFormTypeEnum } from '@/components/pages/project/create/types';
import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

const CreateProposalPage = () => {
  const { id: projectId } = useParams();

  const { data: project } = trpc.project.getProjectById.useQuery(
    { id: Number(projectId) },
    {
      enabled: !!projectId,
      select: (data) => {
        devLog('getProjectById', data);
        return data;
      },
    },
  );

  return (
    <div>
      <BackHeader>
        <div className="flex justify-start gap-[10px]">
          <span>Pending Projects</span>
          <span className="font-[600]">/</span>
          <span>{project?.name}</span>
          <span className="font-[600]">/</span>
          <span>Create Proposal</span>
        </div>
      </BackHeader>

      {/* tip */}
      <div className="mt-[20px] px-[160px] pb-[40px] tablet:px-[20px] mobile:px-[14px]">
        <div className="rounded-[10px] bg-[#EAEAEA] p-[20px]">
          <p className="font-mona text-[18px] font-[600] leading-[25px] text-black/50">
            You are creating an opposing proposal for:
          </p>
          <p className="mt-[20px] text-[20px] font-[700] leading-tight text-black">
            {project?.name}
          </p>
        </div>
      </div>

      {/* reuse project form */}
      <CreateProjectForm
        formType={IFormTypeEnum.Proposal}
        projectId={Number(projectId)}
        redirectPath={`/project/${projectId}`}
      />
    </div>
  );
};

export default CreateProposalPage;

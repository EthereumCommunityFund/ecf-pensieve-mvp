'use client';

import { FC } from 'react';

import ECFTypography from '@/components/base/typography';
import { useProjectDetailContext } from '@/components/pages/project/context/projectDetailContext';

interface EcosystemProps {
  projectId: number;
}

const Ecosystem: FC<EcosystemProps> = ({ projectId }) => {
  const {
    project,
    isProjectFetched,
    getLeadingProjectName,
    getLeadingTagline,
    getLeadingCategories,
    getLeadingLogoUrl,
    displayProposalDataListOfProject,
    leadingProposals,
    isLeadingProposalsFetched,
  } = useProjectDetailContext();

  return (
    <div className="tablet:px-[10px] mobile:px-[10px] mt-[20px] px-[160px] pt-[20px]">
      <div className="flex h-[200px] items-center justify-center">
        <ECFTypography type="subtitle1">
          Ecosystem content will be available soon
        </ECFTypography>
      </div>
    </div>
  );
};

export default Ecosystem;

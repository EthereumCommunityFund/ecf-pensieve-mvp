import { Skeleton } from '@heroui/react';
import { useParams } from 'next/navigation';

import ECFTypography from '@/components/base/typography';

import { useProfileData } from '../dataContext';

const UserInfo = () => {
  const { address } = useParams();
  const { user } = useProfileData();

  return (
    <div className="mobile:flex-col flex justify-center gap-[10px]">
      <div className="mobile:flex-col flex gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
        <ECFTypography type="caption" className="opacity-50">
          Connected Address:
        </ECFTypography>
        <ECFTypography type="caption" className="opacity-80">
          {address}
        </ECFTypography>
      </div>

      <div className="mobile:flex-col flex gap-[5px] rounded-[10px] border border-[rgba(0,0,0,0.1)] p-[5px_10px]">
        <ECFTypography type="caption" className="opacity-50">
          Contribution Points:
        </ECFTypography>
        <Skeleton isLoaded={!!user}>
          <ECFTypography type="caption" className="opacity-80">
            {user?.weight ?? 100}
          </ECFTypography>
        </Skeleton>
      </div>
    </div>
  );
};

export default UserInfo;

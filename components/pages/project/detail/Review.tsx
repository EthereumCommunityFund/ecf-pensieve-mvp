'use client';

import { FC } from 'react';

import ECFTypography from '@/components/base/typography';

interface ReviewProps {
  projectId: number;
}

const Review: FC<ReviewProps> = ({ projectId }) => {
  return (
    <div className="tablet:px-[10px] mobile:px-[10px] mt-[20px] px-[160px] pt-[20px]">
      <div className="flex h-[200px] items-center justify-center">
        <ECFTypography type="subtitle1">
          Review content will be available soon
        </ECFTypography>
      </div>
    </div>
  );
};

export default Review;

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { canScanPendingProject } from '@/constants/env';
import { trpc } from '@/lib/trpc/client';
import { devLog } from '@/utils/devLog';

import { Button } from '../base/button';

const ScanPendingProject = () => {
  const [showScanButton, setShowScanButton] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);

  const queryOptions = useMemo(() => {
    return {
      enabled: hasClicked,
      select: (data: any) => {
        devLog('scanPendingProjectData', data);
        return data;
      },
    };
  }, [hasClicked]);

  const { isRefetching, isLoading, refetch } =
    trpc.project.scanPendingProject.useQuery(undefined, queryOptions);

  useEffect(() => {
    if (canScanPendingProject) {
      devLog('canScanPendingProject', canScanPendingProject);
      setShowScanButton(true);
    }
  }, []);

  const handleScanClick = useCallback(() => {
    if (!hasClicked) {
      setHasClicked(true);
    } else {
      refetch();
    }
  }, [hasClicked, refetch]);

  return showScanButton ? (
    <Button
      color="secondary"
      onPress={handleScanClick}
      isLoading={isLoading || isRefetching}
      isDisabled={isRefetching || isLoading}
    >
      Publish Validated Projects
    </Button>
  ) : null;
};

export default ScanPendingProject;

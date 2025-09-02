'use client';

import React from 'react';

import { useProjectItemValue } from '@/hooks/useProjectItemValue';
import { IProject } from '@/types';

interface SingleProjectNameProps {
  project: IProject;
}

// Single project name component for single select mode
const SingleProjectName: React.FC<SingleProjectNameProps> = ({ project }) => {
  const { projectName } = useProjectItemValue(project);
  return <>{projectName || ''}</>;
};

export default SingleProjectName;

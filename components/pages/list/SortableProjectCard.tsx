import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@heroui/react';
import { X } from '@phosphor-icons/react';
import React from 'react';

import ProjectCard from '@/components/pages/project/ProjectCard';
import { IProject } from '@/types';

interface SortableProjectCardProps {
  id: string;
  project: IProject;
  onRemove: () => void;
}

const SortableProjectCard: React.FC<SortableProjectCardProps> = ({
  id,
  project,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center gap-[10px]">
        {/* Project Card */}
        <div className="flex-1">
          <ProjectCard
            project={project}
            showCreator={false}
            showUpvote={false}
          />
        </div>

        {/* Remove Button */}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          className="size-[20px] min-w-[20px] opacity-10 hover:opacity-100"
          onPress={onRemove}
        >
          <X size={20} />
        </Button>

        {/* Drag Handle */}
        {/*<div*/}
        {/*  {...attributes}*/}
        {/*  {...listeners}*/}
        {/*  className="flex cursor-grab touch-none items-center active:cursor-grabbing"*/}
        {/*>*/}
        {/*  <DotsSixVertical size={24} className="text-black" />*/}
        {/*</div>*/}
      </div>
    </div>
  );
};

export default SortableProjectCard;

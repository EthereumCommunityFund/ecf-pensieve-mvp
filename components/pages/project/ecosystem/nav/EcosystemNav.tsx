'use client';

import { cn } from '@heroui/react';
import { FC } from 'react';

import { BREAKPOINTS, STICKY_OFFSETS } from '@/constants/layoutConstants';
import { useSticky } from '@/hooks/useSticky';

import { EcosystemSection } from '../types';

interface EcosystemNavProps {
  activeSection?: EcosystemSection;
  onSectionClick: (section: EcosystemSection) => void;
  className?: string;
}

const navItems = [
  {
    key: 'stack_integrations' as EcosystemSection,
    label: 'Stack & Integrations',
    description: 'Technologies and protocols',
  },
  {
    key: 'contributing_teams' as EcosystemSection,
    label: 'Contributing Teams',
    description: 'External contributors',
  },
  {
    key: 'affiliated_projects' as EcosystemSection,
    label: 'Affiliated Projects',
    description: 'Partner projects',
  },
];

const EcosystemNav: FC<EcosystemNavProps> = ({
  activeSection,
  onSectionClick,
  className,
}) => {
  const { refs, state, placeholderStyle, stickyStyle } = useSticky({
    desktopBreakpoint: BREAKPOINTS.desktop,
    topOffset: STICKY_OFFSETS.withPadding,
  });

  return (
    <>
      <div
        ref={refs.placeholderRef}
        className={cn('w-full', state.isFixed ? 'h-auto' : 'h-0')}
        style={placeholderStyle}
      />

      <div
        ref={refs.menuRef}
        className={cn(
          'flex flex-col gap-[10px] w-[165px]',
          state.isFixed ? 'fixed z-20' : 'relative',
          className,
        )}
        style={stickyStyle}
      >
        {navItems.map((item) => (
          <div
            key={item.key}
            onClick={() => onSectionClick(item.key)}
            className={cn(
              'cursor-pointer rounded-[6px] px-[10px] py-[5px] transition-all duration-200',
              'hover:opacity-80',
              activeSection === item.key
                ? 'opacity-100 bg-black/10'
                : 'opacity-60',
            )}
          >
            <div className="font-sans text-[14px] font-bold leading-[1.36181640625em] text-black">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default EcosystemNav;

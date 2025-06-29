import React from 'react';

interface CollapseItemIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const CollapseItemIcon: React.FC<CollapseItemIconProps> = ({
  size = 16,
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" {...props}>
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CollapseItemIcon;

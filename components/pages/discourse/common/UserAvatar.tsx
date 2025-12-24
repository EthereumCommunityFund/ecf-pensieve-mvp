'use client';

import { Avatar } from '@heroui/react';

type UserAvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: number;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  name,
  src,
  size = 32,
  className = '',
  fallbackClassName = '',
}: UserAvatarProps) {
  const initials =
    name?.trim().charAt(0).toUpperCase() || (src ? undefined : '?');

  return (
    <Avatar
      name={name ?? undefined}
      src={src ?? undefined}
      showFallback
      getInitials={() => initials ?? '?'}
      classNames={{
        base: `rounded-full bg-black/5 text-black ${className}`,
        img: 'object-cover',
        fallback: `text-[12px] font-semibold text-black ${fallbackClassName}`,
      }}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    />
  );
}

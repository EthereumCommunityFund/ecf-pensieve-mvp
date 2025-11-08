'use client';

import { useRouter } from 'next/navigation';

type OpenToAdFallbackProps = {
  aspectRatio: number;
  className?: string;
};

const OpenToAdFallback = ({
  aspectRatio,
  className,
}: OpenToAdFallbackProps) => {
  const router = useRouter();

  const baseClass =
    'relative flex w-full items-center justify-center cursor-pointer text-[14px] font-semibold text-black/70 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black hover:bg-black/10 hover:text-black active:bg-black/15 active:text-black';
  const composedClassName = className ? `${baseClass} ${className}` : baseClass;

  return (
    <button
      type="button"
      onClick={() => router.push('/ad-management')}
      className={composedClassName}
      style={{ aspectRatio: `${aspectRatio}` }}
      aria-label="Open to Advertisement"
    >
      Open to ad
    </button>
  );
};

export default OpenToAdFallback;

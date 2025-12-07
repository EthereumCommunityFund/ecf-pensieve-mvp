'use client';

import { ArrowUpIcon } from '@phosphor-icons/react';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

import { Button } from '@/components/base';

import BackHeader from '../../project/BackHeader';

type Breadcrumb = {
  label: string;
  href?: string;
};

type DiscoursePageLayoutProps = {
  title: string;
  description: string;
  breadcrumbs: Breadcrumb[];
  actions?: ReactNode;
  sidebar?: ReactNode;
  meta?: ReactNode;
  titleAddon?: ReactNode;
  children: ReactNode;
};

export function DiscoursePageLayout({
  title,
  description,
  breadcrumbs,
  actions,
  sidebar,
  meta,
  titleAddon,
  children,
}: DiscoursePageLayoutProps) {
  const [backCrumb, ...crumbTrail] = breadcrumbs;
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      setShowBackToTop(window.scrollY > window.innerHeight);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full">
      <section className="tablet:px-[20px] mobile:px-[10px] mx-auto flex w-full max-w-[1200px] flex-col gap-5 pb-16 pt-6 ">
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          <BackHeader className="px-0" />
          {crumbTrail.length ? (
            <div className="flex flex-wrap items-center gap-1 text-[14px] text-black/60">
              {crumbTrail.map((crumb, index) => (
                <span key={crumb.label} className="flex items-center gap-1">
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-black"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                  {index < crumbTrail.length - 1 && (
                    <span className="px-1 text-black/25">/</span>
                  )}
                </span>
              ))}
            </div>
          ) : null}
        </nav>

        <header className="rounded-[10px] border border-black/10 bg-white p-[20px]">
          <div className="flex flex-col gap-[10px]">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-1 flex-wrap items-start gap-4">
                {titleAddon ? (
                  <div className="shrink-0">{titleAddon}</div>
                ) : null}
                <div className="space-y-[5px]">
                  <h1 className="text-[20px] font-semibold text-[#202023]">
                    {title}
                  </h1>
                  <p className="text-[14px] leading-[1.66] text-[#202023]">
                    {description}
                  </p>
                </div>
              </div>
              {meta ? (
                <div className="text-sm font-semibold text-black/60">
                  {meta}
                </div>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap gap-3">{actions}</div>
            ) : null}
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-5">{children}</div>
          {sidebar ? (
            <aside className="w-full max-w-[320px] shrink-0 lg:sticky lg:top-10">
              {sidebar}
            </aside>
          ) : null}
        </div>
      </section>
      {showBackToTop ? (
        <Button
          type="button"
          aria-label="Back to top"
          className="fixed bottom-[100px] right-6 z-20 flex size-12 min-w-0 items-center justify-center rounded-full border border-black/15 bg-white text-black shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          onClick={handleScrollToTop}
        >
          <ArrowUpIcon size={32} />
        </Button>
      ) : null}
    </div>
  );
}

import React from 'react';

export const StoryThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-w-[390px] bg-white text-black" data-theme="light">
      <div className="font-sans">{children}</div>
    </div>
  );
};

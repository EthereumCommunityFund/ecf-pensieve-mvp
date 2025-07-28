'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

import ExternalLinkModal from '@/components/base/ExternalLinkModal';

interface ExternalLinkContextType {
  openExternalLink: (url: string) => void;
}

const ExternalLinkContext = createContext<ExternalLinkContextType>({
  openExternalLink: () => {},
});

export const useExternalLink = () => useContext(ExternalLinkContext);

export const ExternalLinkProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');

  const openExternalLink = useCallback((url: string) => {
    // Skip if running in SSR or test environment
    if (typeof window === 'undefined') {
      return;
    }

    // Skip if it's an internal link
    if (!url || url.startsWith('/')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Check if URL is from the same domain (more strict check)
    try {
      const urlObj = new URL(url, window.location.href);
      const currentHostname = window.location.hostname;

      // Strict domain check to avoid substring matching issues
      if (urlObj.hostname === currentHostname) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
    } catch (e) {
      // If URL parsing fails, treat as external link
      console.warn('Invalid URL provided:', url);
    }

    setExternalUrl(url);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setExternalUrl('');
  }, []);

  return (
    <ExternalLinkContext.Provider value={{ openExternalLink }}>
      {children}
      <ExternalLinkModal
        isOpen={isModalOpen}
        onClose={closeModal}
        url={externalUrl}
      />
    </ExternalLinkContext.Provider>
  );
};

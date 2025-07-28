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
    // Skip if it's an internal link or already has pensieve domain
    if (!url || url.startsWith('/') || url.includes(window.location.hostname)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
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

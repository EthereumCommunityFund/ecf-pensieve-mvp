'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Modal, ModalBody, ModalContent } from '@/components/base/modal';
import { trpc } from '@/lib/trpc/client';

import SearchBox from './SearchBox';
import SearchHistory from './SearchHistory';
import SearchResults from './SearchResults';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebounce(searchQuery, 300);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const {
    data: searchResults,
    isLoading,
    error,
  } = trpc.project.searchProjects.useQuery(
    {
      query: debouncedQuery,
      limit: 20,
    },
    {
      enabled: debouncedQuery.length > 0,
    },
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('searchHistory');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      placement="center"
      className="mx-4"
      hideCloseButton
    >
      <ModalContent className="w-[510px] bg-white shadow-lg">
        {/* <ModalHeader className="border-b border-gray-200 p-4"></ModalHeader> */}
        <ModalBody className="max-h-[500px] overflow-y-auto p-0">
          <SearchBox
            value={searchQuery}
            onChange={handleSearch}
            onSubmit={handleSearchSubmit}
            placeholder="Search projects..."
            autoFocus
          />
          {!searchQuery ? (
            <SearchHistory
              history={searchHistory}
              onHistoryClick={handleHistoryClick}
              onClearHistory={handleClearHistory}
            />
          ) : (
            <SearchResults
              results={searchResults}
              isLoading={isLoading}
              error={error}
              query={searchQuery}
              onClose={onClose}
            />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

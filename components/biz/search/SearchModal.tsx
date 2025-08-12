'use client';

import { useEffect, useState } from 'react';

import { Modal, ModalBody, ModalContent } from '@/components/base/modal';
import { SEARCH_CONFIG } from '@/constants/search';
import { useProjectSearch } from '@/hooks/useProjectSearch';

import SearchBox from './SearchBox';
import SearchResults from './SearchResults';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Use unified search hook
  const {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchResults,
    isLoading,
    isFetching,
    error,
    highlightText,
    clearSearch,
  } = useProjectSearch({
    enabled: isOpen,
    limit: SEARCH_CONFIG.DEFAULT_LIMIT,
    debounceMs: SEARCH_CONFIG.DEBOUNCE_DELAY,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const history = localStorage.getItem(
          SEARCH_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
        );
        if (history) {
          const parsed = JSON.parse(history);
          // Validate that parsed data is an array
          if (Array.isArray(parsed)) {
            setSearchHistory(parsed);
          } else {
            // Clear invalid data
            localStorage.removeItem(SEARCH_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
            setSearchHistory([]);
          }
        }
      } catch (error) {
        // Clear corrupted data and reset
        console.error('Failed to parse search history:', error);
        localStorage.removeItem(SEARCH_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
        setSearchHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearSearch();
    }
  }, [isOpen, clearSearch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchSubmit = (query: string) => {
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(
        0,
        SEARCH_CONFIG.MAX_HISTORY_ITEMS,
      );
      setSearchHistory(newHistory);
      try {
        localStorage.setItem(
          SEARCH_CONFIG.STORAGE_KEYS.SEARCH_HISTORY,
          JSON.stringify(newHistory),
        );
      } catch (error) {
        console.error('Failed to save search history:', error);
      }
    }
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem(SEARCH_CONFIG.STORAGE_KEYS.SEARCH_HISTORY);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      placement="center"
      className="mx-4"
      hideCloseButton
      classNames={{
        base: 'p-0',
        body: 'p-0 gap-0',
      }}
    >
      <ModalContent className="w-[510px] bg-white shadow-lg">
        {/* <ModalHeader className="border-b border-gray-200 p-4"></ModalHeader> */}
        <ModalBody>
          <SearchBox
            value={searchQuery}
            onChange={handleSearch}
            onSubmit={handleSearchSubmit}
            placeholder="Search projects..."
            onClose={onClose}
            autoFocus
          />
          <div className="max-h-[500px] overflow-y-auto border-t border-black/10">
            {debouncedQuery && (
              <SearchResults
                results={searchResults}
                isLoading={isLoading || isFetching}
                error={error}
                query={debouncedQuery}
                onClose={onClose}
              />
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

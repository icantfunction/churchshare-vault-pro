
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const clearSearch = () => {
    setGlobalSearchTerm('');
  };

  return (
    <SearchContext.Provider value={{
      globalSearchTerm,
      setGlobalSearchTerm,
      clearSearch
    }}>
      {children}
    </SearchContext.Provider>
  );
};

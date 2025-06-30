
import { useState } from 'react';
import { FileData } from './useFiles';

export const useFileFilters = (files: FileData[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMinistry, setFilterMinistry] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");

  function parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*(KB|MB|GB|Bytes)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'BYTES': return value;
      case 'KB': return value * 1024;
      case 'MB': return value * 1024 * 1024;
      case 'GB': return value * 1024 * 1024 * 1024;
      default: return 0;
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || file.type === filterType;
    const matchesMinistry = filterMinistry === "all" || file.ministry_id === filterMinistry;
    
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const fileDate = new Date(file.eventDate);
      if (dateFrom && fileDate < dateFrom) matchesDateRange = false;
      if (dateTo && fileDate > dateTo) matchesDateRange = false;
    }
    
    let matchesSizeRange = true;
    if (minSize || maxSize) {
      const fileSizeBytes = file.sizeBytes || 0;
      const minSizeBytes = minSize ? parseSizeToBytes(minSize + ' MB') : 0;
      const maxSizeBytes = maxSize ? parseSizeToBytes(maxSize + ' MB') : Infinity;
      
      if (fileSizeBytes < minSizeBytes || fileSizeBytes > maxSizeBytes) {
        matchesSizeRange = false;
      }
    }
    
    return matchesSearch && matchesType && matchesMinistry && matchesDateRange && matchesSizeRange;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterMinistry("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinSize("");
    setMaxSize("");
  };

  return {
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterMinistry, setFilterMinistry,
    showAdvancedFilters, setShowAdvancedFilters,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    minSize, setMinSize,
    maxSize, setMaxSize,
    filteredFiles,
    clearAllFilters
  };
};


import React, { createContext, useContext, useState, useEffect } from 'react';

interface DemoFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  ministry_id: string;
  event_date: string;
  notes: string;
  created_at: string;
  file_url: string; // blob URL for preview
}

interface DemoContextType {
  demoFiles: DemoFile[];
  addDemoFile: (file: File, ministry: string, eventDate: string, notes: string) => Promise<void>;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  clearDemoFiles: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoContext = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
};

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoFiles, setDemoFiles] = useState<DemoFile[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Load demo files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('churchshare-demo-files');
    if (savedFiles) {
      try {
        const files = JSON.parse(savedFiles);
        setDemoFiles(files);
      } catch (error) {
        console.error('Error loading demo files:', error);
      }
    }
  }, []);

  // Save demo files to localStorage whenever they change
  useEffect(() => {
    if (demoFiles.length > 0) {
      localStorage.setItem('churchshare-demo-files', JSON.stringify(demoFiles));
    }
  }, [demoFiles]);

  const addDemoFile = async (file: File, ministry: string, eventDate: string, notes: string) => {
    // Limit to 2 files in demo mode
    if (demoFiles.length >= 2) {
      throw new Error('Demo mode is limited to 2 files. Please sign up for full access.');
    }

    // Create blob URL for preview
    const fileUrl = URL.createObjectURL(file);

    const demoFile: DemoFile = {
      id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      ministry_id: ministry,
      event_date: eventDate,
      notes: notes,
      created_at: new Date().toISOString(),
      file_url: fileUrl
    };

    setDemoFiles(prev => [...prev, demoFile]);
  };

  const setDemoMode = (enabled: boolean) => {
    setIsDemoMode(enabled);
    if (!enabled) {
      clearDemoFiles();
    }
  };

  const clearDemoFiles = () => {
    // Revoke blob URLs to free memory
    demoFiles.forEach(file => {
      if (file.file_url.startsWith('blob:')) {
        URL.revokeObjectURL(file.file_url);
      }
    });
    setDemoFiles([]);
    localStorage.removeItem('churchshare-demo-files');
  };

  return (
    <DemoContext.Provider value={{
      demoFiles,
      addDemoFile,
      isDemoMode,
      setDemoMode,
      clearDemoFiles
    }}>
      {children}
    </DemoContext.Provider>
  );
};

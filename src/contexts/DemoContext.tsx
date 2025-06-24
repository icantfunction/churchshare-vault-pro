
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
  uploaded_by: string;
  thumbnail?: string;
}

interface DemoMinistry {
  id: string;
  name: string;
  description: string;
  file_count: number;
  cover_image: string;
}

interface DemoUser {
  id: string;
  email: string;
  role: 'Admin' | 'MinistryLeader' | 'Member';
  first_name: string;
  last_name: string;
  ministry_id: string;
}

interface DemoContextType {
  demoFiles: DemoFile[];
  demoMinistries: DemoMinistry[];
  demoUsers: DemoUser[];
  currentDemoUser: DemoUser;
  addDemoFile: (file: File, ministry: string, eventDate: string, notes: string) => Promise<void>;
  isDemoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  clearDemoFiles: () => void;
  getDemoFilesByMinistry: (ministryId: string) => DemoFile[];
  searchDemoFiles: (query: string) => DemoFile[];
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoContext = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemoContext must be used within a DemoProvider');
  }
  return context;
};

// Sample demo data
const sampleMinistries: DemoMinistry[] = [
  {
    id: 'youth',
    name: 'Youth Ministry',
    description: 'Photos and videos from youth events and activities',
    file_count: 12,
    cover_image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b'
  },
  {
    id: 'worship',
    name: 'Worship Team',
    description: 'Performance recordings and event photography',
    file_count: 8,
    cover_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158'
  },
  {
    id: 'children',
    name: "Children's Ministry",
    description: 'Sunday school activities and special events',
    file_count: 15,
    cover_image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7'
  },
  {
    id: 'outreach',
    name: 'Outreach Events',
    description: 'Community service and evangelism activities',
    file_count: 6,
    cover_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
  }
];

const sampleUsers: DemoUser[] = [
  {
    id: 'demo-user-1',
    email: 'demo@churchshare.com',
    role: 'Admin',
    first_name: 'Demo',
    last_name: 'User',
    ministry_id: 'youth'
  },
  {
    id: 'demo-user-2',
    email: 'sarah@church.com',
    role: 'MinistryLeader',
    first_name: 'Sarah',
    last_name: 'Johnson',
    ministry_id: 'youth'
  },
  {
    id: 'demo-user-3',
    email: 'mike@church.com',
    role: 'Member',
    first_name: 'Mike',
    last_name: 'Wilson',
    ministry_id: 'worship'
  }
];

const sampleFiles: DemoFile[] = [
  {
    id: 'demo-file-1',
    file_name: 'Youth_Camp_2024_Group_Photo.jpg',
    file_type: 'image/jpeg',
    file_size: 4200000,
    ministry_id: 'youth',
    event_date: '2024-03-15',
    notes: 'Amazing group photo from our annual youth camp',
    created_at: '2024-03-15T10:30:00Z',
    file_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    uploaded_by: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=300&h=200&fit=crop'
  },
  {
    id: 'demo-file-2',
    file_name: 'Sunday_Worship_Recording.mp4',
    file_type: 'video/mp4',
    file_size: 125000000,
    ministry_id: 'worship',
    event_date: '2024-03-10',
    notes: 'Weekly worship service recording',
    created_at: '2024-03-10T14:20:00Z',
    file_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
    uploaded_by: 'Mike Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop'
  },
  {
    id: 'demo-file-3',
    file_name: 'Childrens_Easter_Program.pdf',
    file_type: 'application/pdf',
    file_size: 2100000,
    ministry_id: 'children',
    event_date: '2024-03-08',
    notes: 'Complete program for Easter celebration',
    created_at: '2024-03-08T09:15:00Z',
    file_url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    uploaded_by: 'Lisa Chen',
    thumbnail: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=300&h=200&fit=crop'
  },
  {
    id: 'demo-file-4',
    file_name: 'Community_Outreach_Photos.zip',
    file_type: 'application/zip',
    file_size: 45000000,
    ministry_id: 'outreach',
    event_date: '2024-03-05',
    notes: 'Collection of photos from community service day',
    created_at: '2024-03-05T16:45:00Z',
    file_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    uploaded_by: 'David Martinez',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=200&fit=crop'
  }
];

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoFiles, setDemoFiles] = useState<DemoFile[]>(sampleFiles);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoMinistries] = useState<DemoMinistry[]>(sampleMinistries);
  const [demoUsers] = useState<DemoUser[]>(sampleUsers);
  const [currentDemoUser] = useState<DemoUser>(sampleUsers[0]); // Demo user is admin

  // Load demo files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('churchshare-demo-files');
    if (savedFiles) {
      try {
        const files = JSON.parse(savedFiles);
        setDemoFiles(prev => [...sampleFiles, ...files]);
      } catch (error) {
        console.error('Error loading demo files:', error);
      }
    }
  }, []);

  // Save only user-uploaded demo files to localStorage
  useEffect(() => {
    const userUploadedFiles = demoFiles.filter(file => !sampleFiles.find(sf => sf.id === file.id));
    if (userUploadedFiles.length > 0) {
      localStorage.setItem('churchshare-demo-files', JSON.stringify(userUploadedFiles));
    }
  }, [demoFiles]);

  const addDemoFile = async (file: File, ministry: string, eventDate: string, notes: string) => {
    const userUploadedFiles = demoFiles.filter(file => !sampleFiles.find(sf => sf.id === file.id));
    
    // Limit to 2 user-uploaded files in demo mode
    if (userUploadedFiles.length >= 2) {
      throw new Error('Demo mode is limited to 2 additional files. Please sign up for full access.');
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
      file_url: fileUrl,
      uploaded_by: currentDemoUser.first_name + ' ' + currentDemoUser.last_name,
      thumbnail: file.type.startsWith('image/') ? fileUrl : undefined
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
    // Revoke blob URLs to free memory (only for user-uploaded files)
    const userUploadedFiles = demoFiles.filter(file => !sampleFiles.find(sf => sf.id === file.id));
    userUploadedFiles.forEach(file => {
      if (file.file_url.startsWith('blob:')) {
        URL.revokeObjectURL(file.file_url);
      }
    });
    setDemoFiles(sampleFiles); // Reset to sample files only
    localStorage.removeItem('churchshare-demo-files');
  };

  const getDemoFilesByMinistry = (ministryId: string) => {
    return demoFiles.filter(file => file.ministry_id === ministryId);
  };

  const searchDemoFiles = (query: string) => {
    if (!query.trim()) return demoFiles;
    const lowercaseQuery = query.toLowerCase();
    return demoFiles.filter(file => 
      file.file_name.toLowerCase().includes(lowercaseQuery) ||
      file.notes.toLowerCase().includes(lowercaseQuery) ||
      file.uploaded_by.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <DemoContext.Provider value={{
      demoFiles,
      demoMinistries,
      demoUsers,
      currentDemoUser,
      addDemoFile,
      isDemoMode,
      setDemoMode,
      clearDemoFiles,
      getDemoFilesByMinistry,
      searchDemoFiles
    }}>
      {children}
    </DemoContext.Provider>
  );
};

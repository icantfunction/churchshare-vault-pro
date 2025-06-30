
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Upload, Download, Calendar, User, FileText, Image, Video, Eye } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 12;

interface Ministry {
  id: string;
  name: string;
  description: string;
  file_count: number;
  cover_image?: string;
}

interface FileData {
  id: string;
  file_name: string;
  file_type: string;
  event_date: string;
  uploaded_by: string;
  file_size: number;
  notes?: string;
  file_url?: string;
}

const Ministry = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [allMinistryFiles, setAllMinistryFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id && user && profile) {
      fetchMinistryData();
      fetchMinistryFiles();
    }
  }, [id, user, profile]);

  const fetchMinistryData = async () => {
    try {
      console.log('[DEBUG-MINISTRY] Fetching ministry data for:', id);
      const { data, error } = await supabase
        .from('ministries')
        .select('id, name, description')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Get file count for this ministry
      const { count } = await supabase
        .from('files')
        .select('*', { count: 'exact', head: true })
        .eq('ministry_id', id);

      console.log('[DEBUG-MINISTRY] Ministry data:', data, 'File count:', count);
      
      setMinistry({
        ...data,
        file_count: count || 0,
        cover_image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
      });
    } catch (error) {
      console.error('[DEBUG-MINISTRY] Error fetching ministry:', error);
    }
  };

  const fetchMinistryFiles = async () => {
    try {
      console.log('[DEBUG-MINISTRY] Fetching files for ministry:', id);
      const { data, error } = await supabase
        .from('files')
        .select(`
          id,
          file_name,
          file_type,
          file_size,
          file_url,
          event_date,
          uploader_id,
          notes,
          created_at
        `)
        .eq('ministry_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('[DEBUG-MINISTRY] Files data:', data);
      
      const transformedFiles: FileData[] = (data || []).map(file => ({
        id: file.id,
        file_name: file.file_name || 'Untitled',
        file_type: file.file_type || 'application/octet-stream',
        event_date: file.event_date || new Date().toISOString().split('T')[0],
        uploaded_by: 'User', // We'll enhance this later with actual user names
        file_size: file.file_size || 0,
        notes: file.notes || '',
        file_url: file.file_url,
      }));

      setAllMinistryFiles(transformedFiles);
    } catch (error) {
      console.error('[DEBUG-MINISTRY] Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(allMinistryFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const ministryFiles = allMinistryFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'bg-green-100 text-green-800';
    } else if (fileType.startsWith('video/')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-purple-100 text-purple-800';
    }
  };

  const getFileTypeLabel = (fileType: string) => {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  // Check if user can upload
  const canUpload = profile?.role === 'Admin' || profile?.role === 'Director' || profile?.role === 'SuperOrg';

  if (loading || !ministry) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ministry Header */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary to-purple-600 rounded-2xl overflow-hidden">
            <img
              src={ministry.cover_image}
              alt={ministry.name}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-purple-600/80 rounded-2xl flex items-center">
            <div className="p-8 text-white">
              <h1 className="text-4xl font-bold mb-2">{ministry.name}</h1>
              <p className="text-lg opacity-90 mb-4">{ministry.description}</p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {allMinistryFiles.length} files
                </Badge>
                {canUpload && (
                  <Button asChild variant="secondary" className="rounded-xl">
                    <Link to="/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {allMinistryFiles.length > 0 && (
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {ministryFiles.length} of {allMinistryFiles.length} files
            </p>
            {totalPages > 1 && (
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
            )}
          </div>
        )}

        {/* File Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ministryFiles.map((file) => (
            <Card key={file.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                  {file.file_url ? (
                    <img
                      src={file.file_url}
                      alt={file.file_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      {getTypeIcon(file.file_type)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getTypeBadgeColor(file.file_type)} border-0`}>
                      {getTypeIcon(file.file_type)}
                      <span className="ml-1 capitalize">{getFileTypeLabel(file.file_type)}</span>
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{file.file_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {file.file_url && (
                            <img
                              src={file.file_url}
                              alt={file.file_name}
                              className="w-full rounded-lg"
                            />
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Uploaded by:</strong> {file.uploaded_by}
                            </div>
                            <div>
                              <strong>Size:</strong> {formatFileSize(file.file_size)}
                            </div>
                            <div>
                              <strong>Date:</strong> {new Date(file.event_date).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Type:</strong> {getFileTypeLabel(file.file_type)}
                            </div>
                          </div>
                          {file.notes && (
                            <div>
                              <strong>Notes:</strong> {file.notes}
                            </div>
                          )}
                          <Button 
                            className="w-full rounded-xl"
                            onClick={() => {
                              if (file.file_url) {
                                window.open(file.file_url, '_blank');
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Original
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 truncate" title={file.file_name}>
                    {file.file_name}
                  </h3>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(file.event_date).toLocaleDateString()}</span>
                      </div>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{file.uploaded_by}</span>
                    </div>
                    
                    {file.notes && (
                      <p className="text-gray-500 line-clamp-2">{file.notes}</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      size="sm" 
                      className="w-full h-8 text-xs rounded-lg bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (file.file_url) {
                          window.open(file.file_url, '_blank');
                        }
                      }}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {allMinistryFiles.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Files Yet</h3>
              <p className="text-gray-600 mb-6">
                This ministry doesn't have any files yet. 
                {canUpload && " Upload some files to get started!"}
              </p>
              {canUpload && (
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {allMinistryFiles.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
};

export default Ministry;

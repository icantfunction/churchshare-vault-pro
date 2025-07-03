import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Calendar as CalendarLucide, Image, Video, FileText, Eye, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { FileData } from "@/hooks/useFiles";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileGridProps {
  files: FileData[];
  loading: boolean;
}

interface ThumbnailCache {
  [key: string]: string;
}

const FileGrid = ({ files, loading }: FileGridProps) => {
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [imageZoom, setImageZoom] = useState(100);
  const [imageRotation, setImageRotation] = useState(0);
  const [thumbnailCache, setThumbnailCache] = useState<ThumbnailCache>({});
  const { toast } = useToast();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDownloadUrl = async (fileId: string, type: 'download' | 'preview' = 'download') => {
    try {
      console.log(`[DEBUG-DOWNLOAD] Requesting ${type} URL for file:`, fileId);
      
      const { data, error } = await supabase.functions.invoke('get-download-url', {
        body: { fileId, type }
      });

      if (error) {
        console.error(`[DEBUG-DOWNLOAD] Error from Edge Function:`, error);
        throw error;
      }

      console.log(`[DEBUG-DOWNLOAD] Received response:`, data);
      return data;
    } catch (error) {
      console.error(`[DEBUG-DOWNLOAD] Failed to get ${type} URL:`, error);
      throw error;
    }
  };

  const handleDownload = async (file: FileData) => {
    if (downloadingFiles.has(file.id)) return;

    setDownloadingFiles(prev => new Set([...prev, file.id]));
    
    try {
      console.log('[DEBUG-DOWNLOAD] Starting download for file:', file.id);
      
      const { url, filename } = await getDownloadUrl(file.id, 'download');
      
      if (!url) {
        throw new Error('No download URL received');
      }

      console.log('[DEBUG-DOWNLOAD] Got download URL:', url);

      // Test if URL is accessible
      const testResponse = await fetch(url, { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error(`File not accessible: ${testResponse.status} ${testResponse.statusText}`);
      }

      // Check if we got a direct blob response (new download method)
      if (url instanceof Blob || typeof url === 'object') {
        // Handle blob download
        const blob = url instanceof Blob ? url : new Blob([url]);
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || file.name;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        // Handle URL download (fallback)
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || file.name;
        link.target = '_blank';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Download Started",
        description: `Downloading ${filename || file.name}`,
      });

    } catch (error) {
      console.error('[DEBUG-DOWNLOAD] Download failed:', error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error downloading the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    }
  };

  const handlePreview = async (file: FileData) => {
    setPreviewLoading(true);
    setImageZoom(100);
    setImageRotation(0);
    
    try {
      console.log('[DEBUG-PREVIEW] Starting preview for file:', file.id, file.type);
      
      // Get the preview URL
      const { url, fileType } = await getDownloadUrl(file.id, 'preview');
      
      console.log('[DEBUG-PREVIEW] Got preview URL:', url);
      
      setPreviewUrl(url);
      setPreviewFile(file);
    } catch (error) {
      console.error('[DEBUG-PREVIEW] Preview failed:', error);
      
      toast({
        title: "Preview Error",
        description: "Could not load preview. Please try downloading the file instead.",
        variant: "destructive",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Load thumbnails for image files
  useEffect(() => {
    const loadThumbnails = async () => {
      for (const file of files) {
        if (file.type === 'image' && !thumbnailCache[file.id]) {
          try {
            console.log(`[DEBUG-THUMBNAIL] Loading thumbnail for ${file.id}`);
            const { url } = await getDownloadUrl(file.id, 'preview');
            console.log(`[DEBUG-THUMBNAIL] Got URL for ${file.id}:`, url);
            setThumbnailCache(prev => ({ ...prev, [file.id]: url }));
          } catch (error) {
            console.log(`[DEBUG-THUMBNAIL] Failed to load thumbnail for ${file.id}:`, error);
          }
        }
      }
    };

    if (files.length > 0) {
      loadThumbnails();
    }
  }, [files]);

  const resetImageView = () => {
    setImageZoom(100);
    setImageRotation(0);
  };

  const renderPreviewContent = (file: FileData) => {
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading preview...</span>
        </div>
      );
    }

    if (file.type === 'image' && previewUrl) {
      return (
        <div className="space-y-4">
          {/* Image Controls */}
          <div className="flex justify-center gap-2 border-b pb-4">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setImageZoom(Math.max(25, imageZoom - 25))}
              disabled={imageZoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setImageZoom(Math.min(200, imageZoom + 25))}
              disabled={imageZoom >= 200}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setImageRotation((imageRotation + 90) % 360)}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={resetImageView}
            >
              Reset
            </Button>
            <span className="text-sm self-center text-gray-500">{imageZoom}%</span>
          </div>
          
          {/* Image Display */}
          <div className="max-w-full max-h-96 overflow-auto bg-gray-50 rounded-lg p-4">
            <img
              src={previewUrl}
              alt={file.name}
              className="mx-auto block rounded-lg shadow-sm transition-transform duration-200"
              style={{
                transform: `scale(${imageZoom / 100}) rotate(${imageRotation}deg)`,
                maxWidth: 'none',
                height: 'auto'
              }}
              onError={(e) => {
                console.error('[DEBUG-PREVIEW] Image failed to load:', previewUrl);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('[DEBUG-PREVIEW] Image loaded successfully');
              }}
            />
          </div>
        </div>
      );
    } else if (file.type === 'video' && previewUrl) {
      return (
        <div className="max-w-full max-h-96">
          <video
            src={previewUrl}
            controls
            className="w-full h-auto rounded-lg shadow-sm"
            preload="metadata"
            onError={(e) => {
              console.error('[DEBUG-PREVIEW] Video failed to load:', previewUrl);
            }}
            onLoadedMetadata={() => {
              console.log('[DEBUG-PREVIEW] Video metadata loaded successfully');
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <div className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            Preview not available for this file type.
          </p>
          <p className="text-sm text-gray-500">
            Click download to view the file.
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {files.map((file) => (
          <Card key={file.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 cursor-pointer group">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                {file.type === 'image' && thumbnailCache[file.id] ? (
                  <img
                    src={thumbnailCache[file.id]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      console.log(`[DEBUG-THUMBNAIL] Image loaded successfully for ${file.id}`);
                    }}
                    onError={(e) => {
                      console.error(`[DEBUG-THUMBNAIL] Image failed to load for ${file.id}:`, e);
                      console.error(`[DEBUG-THUMBNAIL] Failed URL:`, thumbnailCache[file.id]);
                      // Remove from cache if failed to load
                      setThumbnailCache(prev => {
                        const newCache = { ...prev };
                        delete newCache[file.id];
                        return newCache;
                      });
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    {getTypeIcon(file.type)}
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={`${getTypeBadgeColor(file.type)} border-0`}>
                    {getTypeIcon(file.type)}
                    <span className="ml-1 capitalize">{file.type}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 truncate" title={file.name}>
                  {file.name}
                </h3>
                
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-medium">{file.ministry}</span>
                    <span>{file.size}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarLucide className="h-3 w-3 mr-1" />
                    <span>{new Date(file.eventDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="text-gray-500">
                    By {file.uploadedBy}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-8 text-xs rounded-lg"
                    onClick={() => handlePreview(file)}
                    disabled={previewLoading}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90"
                    onClick={() => handleDownload(file)}
                    disabled={downloadingFiles.has(file.id)}
                  >
                    {downloadingFiles.has(file.id) ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewFile && getTypeIcon(previewFile.type)}
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          
          {previewFile && (
            <div className="space-y-4">
              {renderPreviewContent(previewFile)}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Ministry:</span>
                    <span>{previewFile.ministry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Size:</span>
                    <span>{previewFile.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Date:</span>
                    <span>{new Date(previewFile.eventDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleDownload(previewFile)}
                  disabled={downloadingFiles.has(previewFile.id)}
                >
                  {downloadingFiles.has(previewFile.id) ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileGrid;

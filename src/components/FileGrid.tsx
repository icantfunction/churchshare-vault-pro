
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, Calendar as CalendarLucide, Image, Video, FileText, Eye } from "lucide-react";
import { FileData } from "@/hooks/useFiles";
import { useState } from "react";

interface FileGridProps {
  files: FileData[];
  loading: boolean;
}

const FileGrid = ({ files, loading }: FileGridProps) => {
  const [previewFile, setPreviewFile] = useState<FileData | null>(null);

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

  const handleDownload = async (file: FileData) => {
    try {
      // Use the actual file URL for download, not thumbnail
      const downloadUrl = file.downloadUrl || file.thumbnail;
      if (downloadUrl) {
        // Create a temporary link element for download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePreview = (file: FileData) => {
    setPreviewFile(file);
  };

  const renderPreviewContent = (file: FileData) => {
    if (file.type === 'image') {
      return (
        <div className="max-w-full max-h-96 overflow-auto">
          <img
            src={file.thumbnail}
            alt={file.name}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>
      );
    } else if (file.type === 'video') {
      return (
        <div className="max-w-full max-h-96">
          <video
            src={file.thumbnail}
            controls
            className="w-full h-auto rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    } else {
      return (
        <div className="p-8 text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            Preview not available for this file type.
          </p>
          <p className="text-sm text-gray-500 mt-2">
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
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
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
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button 
                    size="sm" 
                    className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
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
                
                <Button onClick={() => handleDownload(previewFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
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


import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar as CalendarLucide, Image, Video, FileText } from "lucide-react";
import { FileData } from "@/hooks/useFiles";

interface FileGridProps {
  files: FileData[];
  loading: boolean;
}

const FileGrid = ({ files, loading }: FileGridProps) => {
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
                <Button size="sm" variant="outline" className="flex-1 h-8 text-xs rounded-lg">
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (file.thumbnail) {
                      window.open(file.thumbnail, '_blank');
                    }
                  }}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileGrid;

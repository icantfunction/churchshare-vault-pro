
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Calendar, User, FileText, Image, Video, Eye } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { useDemoContext } from "@/contexts/DemoContext";

const Ministry = () => {
  const { id } = useParams();
  const { isDemoMode, demoMinistries, getDemoFilesByMinistry, currentDemoUser } = useDemoContext();
  
  // Get ministry data based on demo mode
  const ministry = isDemoMode ? 
    demoMinistries.find(m => m.id === id) || demoMinistries[0] :
    {
      id: 1,
      name: "Youth Ministry",
      description: "Photos and videos from youth events and activities",
      file_count: 127,
      cover_image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    };

  // Get files for this ministry
  const ministryFiles = isDemoMode ? getDemoFilesByMinistry(id || 'youth') : [
    {
      id: "1",
      file_name: "Youth_Camp_2024_Group_Photo.jpg",
      file_type: "image/jpeg",
      event_date: "2024-03-15",
      uploaded_by: "Sarah Johnson",
      file_size: 4200000,
      notes: "Amazing group photo from our annual youth camp",
      file_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    },
    {
      id: "2",
      file_name: "Bible_Study_Discussion.mp4",
      file_type: "video/mp4", 
      event_date: "2024-03-12",
      uploaded_by: "Mike Wilson",
      file_size: 85000000,
      notes: "Weekly Bible study session recording",
      file_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    },
    {
      id: "3",
      file_name: "Game_Night_Photos.zip",
      file_type: "application/zip",
      event_date: "2024-03-08",
      uploaded_by: "Lisa Chen", 
      file_size: 12000000,
      notes: "Collection of photos from Friday game night",
      file_url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    },
    {
      id: "4",
      file_name: "Youth_Retreat_Schedule.pdf",
      file_type: "application/pdf",
      event_date: "2024-03-05",
      uploaded_by: "David Martinez",
      file_size: 1800000,
      notes: "Complete schedule for upcoming youth retreat", 
      file_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
  ];

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

  // Check if user can upload (in demo mode, always allow; in real mode, check permissions)
  const canUpload = isDemoMode || currentDemoUser?.role === 'Admin' || currentDemoUser?.role === 'MinistryLeader';

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
                  {ministryFiles.length} files
                </Badge>
                {canUpload && (
                  <Button asChild variant="secondary" className="rounded-xl">
                    <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* File Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ministryFiles.map((file) => (
            <Card key={file.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                  <img
                    src={file.thumbnail || file.file_url}
                    alt={file.file_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
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
                          <img
                            src={file.thumbnail || file.file_url}
                            alt={file.file_name}
                            className="w-full rounded-lg"
                          />
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
                          <div>
                            <strong>Notes:</strong> {file.notes}
                          </div>
                          <Button 
                            className="w-full rounded-xl"
                            onClick={() => {
                              if (isDemoMode) {
                                alert('Demo mode: File download simulated');
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
                        if (isDemoMode) {
                          alert('Demo mode: File download simulated');
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
        {ministryFiles.length === 0 && (
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
                  <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {ministryFiles.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="rounded-xl">
              Load More Files
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Ministry;

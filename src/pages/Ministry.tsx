
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Download, Calendar, User, FileText, Image, Video, Eye } from "lucide-react";
import { useParams, Link } from "react-router-dom";

const Ministry = () => {
  const { id } = useParams();
  
  const ministry = {
    id: 1,
    name: "Youth Ministry",
    description: "Photos and videos from youth events and activities",
    totalFiles: 127,
    coverImage: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  };

  const files = [
    {
      id: 1,
      name: "Youth_Camp_2024_Group_Photo.jpg",
      type: "image",
      eventDate: "2024-03-15",
      uploadedBy: "Sarah Johnson",
      size: "4.2 MB",
      notes: "Amazing group photo from our annual youth camp",
      thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    },
    {
      id: 2,
      name: "Bible_Study_Discussion.mp4",
      type: "video",
      eventDate: "2024-03-12",
      uploadedBy: "Mike Wilson",
      size: "85 MB",
      notes: "Weekly Bible study session recording",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    },
    {
      id: 3,
      name: "Game_Night_Photos.zip",
      type: "archive",
      eventDate: "2024-03-08",
      uploadedBy: "Lisa Chen",
      size: "12 MB",
      notes: "Collection of photos from Friday game night",
      thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    },
    {
      id: 4,
      name: "Youth_Retreat_Schedule.pdf",
      type: "document",
      eventDate: "2024-03-05",
      uploadedBy: "David Martinez",
      size: "1.8 MB",
      notes: "Complete schedule for upcoming youth retreat",
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
  ];

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

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ministry Header */}
        <div className="relative mb-8">
          <div className="h-48 bg-gradient-to-r from-primary to-purple-600 rounded-2xl overflow-hidden">
            <img
              src={ministry.coverImage}
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
                  {ministry.totalFiles} files
                </Badge>
                <Button asChild variant="secondary" className="rounded-xl">
                  <Link to="/upload">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <Card key={file.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 group">
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getTypeBadgeColor(file.type)} border-0`}>
                      {getTypeIcon(file.type)}
                      <span className="ml-1 capitalize">{file.type}</span>
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
                          <DialogTitle>{file.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-full rounded-lg"
                          />
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Uploaded by:</strong> {file.uploadedBy}
                            </div>
                            <div>
                              <strong>Size:</strong> {file.size}
                            </div>
                            <div>
                              <strong>Date:</strong> {new Date(file.eventDate).toLocaleDateString()}
                            </div>
                            <div>
                              <strong>Type:</strong> {file.type}
                            </div>
                          </div>
                          <div>
                            <strong>Notes:</strong> {file.notes}
                          </div>
                          <Button className="w-full rounded-xl">
                            <Download className="h-4 w-4 mr-2" />
                            Download Original
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-2 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(file.eventDate).toLocaleDateString()}</span>
                      </div>
                      <span>{file.size}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{file.uploadedBy}</span>
                    </div>
                    
                    {file.notes && (
                      <p className="text-gray-500 line-clamp-2">{file.notes}</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <Button size="sm" className="w-full h-8 text-xs rounded-lg bg-primary hover:bg-primary/90">
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="rounded-xl">
            Load More Files
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Ministry;

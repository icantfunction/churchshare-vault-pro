
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Calendar, Filter, Image, FileText, Video } from "lucide-react";
import { useState } from "react";

const MyFiles = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMinistry, setFilterMinistry] = useState("all");

  const files = [
    {
      id: 1,
      name: "Youth_Camp_2024_Group_Photo.jpg",
      type: "image",
      ministry: "Youth Ministry",
      eventDate: "2024-03-15",
      uploadedBy: "Sarah Johnson",
      size: "4.2 MB",
      thumbnail: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    },
    {
      id: 2,
      name: "Sunday_Worship_Recording.mp4",
      type: "video",
      ministry: "Worship Team",
      eventDate: "2024-03-10",
      uploadedBy: "Mike Wilson",
      size: "125 MB",
      thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    },
    {
      id: 3,
      name: "Childrens_Easter_Program.pdf",
      type: "document",
      ministry: "Children's Ministry",
      eventDate: "2024-03-08",
      uploadedBy: "Lisa Chen",
      size: "2.1 MB",
      thumbnail: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    },
    {
      id: 4,
      name: "Community_Outreach_Photos.zip",
      type: "archive",
      ministry: "Outreach Events",
      eventDate: "2024-03-05",
      uploadedBy: "David Martinez",
      size: "45 MB",
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Files</h1>
          <p className="text-gray-600">All files you have access to across ministries</p>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files by name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
                  <SelectValue placeholder="File Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="document">Documents</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMinistry} onValueChange={setFilterMinistry}>
                <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
                  <SelectValue placeholder="Ministry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ministries</SelectItem>
                  <SelectItem value="youth">Youth Ministry</SelectItem>
                  <SelectItem value="worship">Worship Team</SelectItem>
                  <SelectItem value="children">Children's Ministry</SelectItem>
                  <SelectItem value="outreach">Outreach Events</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="h-12 rounded-xl">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <Card key={file.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 cursor-pointer group">
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
                      <Calendar className="h-3 w-3 mr-1" />
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
                    <Button size="sm" className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90">
                      <Download className="h-3 w-3" />
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

export default MyFiles;

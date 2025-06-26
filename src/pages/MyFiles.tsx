import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Calendar, Filter, Image, FileText, Video } from "lucide-react";
import { useState } from "react";
import { useDemoContext } from "@/contexts/DemoContext";

const MyFiles = () => {
  const { isDemoMode, demoFiles, demoMinistries, searchDemoFiles, getTotalFileCount } = useDemoContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMinistry, setFilterMinistry] = useState("all");

  // Sample files for non-demo mode - now with ministry_id for consistency
  const sampleFiles = [
    {
      id: 1,
      name: "Youth_Camp_2024_Group_Photo.jpg",
      type: "image",
      ministry: "Youth Ministry",
      ministry_id: "youth", // Added for consistency
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
      ministry_id: "worship", // Added for consistency
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
      ministry_id: "children", // Added for consistency
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
      ministry_id: "outreach", // Added for consistency
      eventDate: "2024-03-05",
      uploadedBy: "David Martinez",
      size: "45 MB",
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
  ];

  // Transform demo files to match expected format
  const transformedDemoFiles = isDemoMode ? demoFiles.map(file => {
    const ministry = demoMinistries.find(m => m.id === file.ministry_id);
    console.log('[DEBUG] Transforming file:', file.file_name, 'ministry_id:', file.ministry_id, 'found ministry:', ministry?.name);
    return {
      id: file.id,
      name: file.file_name,
      type: file.file_type.startsWith('image/') ? 'image' : 
            file.file_type.startsWith('video/') ? 'video' : 'document',
      ministry: ministry?.name || `Unknown (${file.ministry_id})`,
      eventDate: file.event_date,
      uploadedBy: file.uploaded_by,
      size: formatFileSize(file.file_size),
      thumbnail: file.thumbnail || file.file_url,
      ministry_id: file.ministry_id, // Consistent property
    };
  }) : sampleFiles;

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Filter files based on search and filters
  const filteredFiles = transformedDemoFiles.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || file.type === filterType;
    
    // Use ministry_id for filtering since all files now have it
    const matchesMinistry = filterMinistry === "all" || file.ministry_id === filterMinistry;
    
    console.log('[DEBUG] File filter check:', {
      fileName: file.name,
      ministry: file.ministry,
      ministry_id: file.ministry_id,
      filterMinistry,
      matchesMinistry,
      matchesSearch,
      matchesType
    });
    
    return matchesSearch && matchesType && matchesMinistry;
  });

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

  const totalFileCount = isDemoMode ? getTotalFileCount() : 0;

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Files</h1>
          <p className="text-gray-600">
            All files you have access to across ministries
            {isDemoMode && ` (Demo Mode - ${totalFileCount}/6 total files)`}
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files by name or uploader..."
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

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredFiles.length} of {transformedDemoFiles.length} files
            {isDemoMode && ` (${totalFileCount}/6 total files)`}
          </p>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
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
                    <Button 
                      size="sm" 
                      className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90"
                      onClick={() => {
                        if (isDemoMode) {
                          // In demo mode, just show a message
                          alert('Demo mode: File download simulated');
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

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Files Found</h3>
              <p className="text-gray-600 mb-6">
                No files match your current search and filter criteria.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("all");
                  setFilterMinistry("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Load More */}
        {filteredFiles.length > 0 && (
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

export default MyFiles;

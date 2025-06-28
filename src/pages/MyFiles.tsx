import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Search, Download, Calendar as CalendarLucide, Filter, Image, FileText, Video, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useDemoContext } from "@/contexts/DemoContext";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 12;

const MyFiles = () => {
  const { demoFiles, demoMinistries, searchDemoFiles, getTotalFileCount, setDemoMode } = useDemoContext();
  const { globalSearchTerm } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterMinistry, setFilterMinistry] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");

  // Get ministry from URL parameter
  const ministryFromUrl = searchParams.get('ministry');
  const searchFromUrl = searchParams.get('search');
  const selectedMinistry = ministryFromUrl ? demoMinistries.find(m => m.id === ministryFromUrl) : null;

  // Auto-enable demo mode if we have demo files
  useEffect(() => {
    if (demoFiles.length > 0) {
      setDemoMode(true);
    }
  }, [demoFiles.length, setDemoMode]);

  // Set filters from URL parameters and global search
  useEffect(() => {
    if (ministryFromUrl) {
      setFilterMinistry(ministryFromUrl);
    }
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    } else if (globalSearchTerm) {
      setSearchTerm(globalSearchTerm);
    }
  }, [ministryFromUrl, searchFromUrl, globalSearchTerm]);

  const isDemoMode = demoFiles.length > 0;

  // Sample files for non-demo mode
  const sampleFiles = [
    {
      id: 1,
      name: "Youth_Camp_2024_Group_Photo.jpg",
      type: "image",
      ministry: "Youth Ministry",
      ministry_id: "youth",
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
      ministry_id: "worship",
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
      ministry_id: "children",
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
      ministry_id: "outreach",
      eventDate: "2024-03-05",
      uploadedBy: "David Martinez",
      size: "45 MB",
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    },
  ];

  // Transform demo files to match expected format
  const transformedDemoFiles = isDemoMode ? demoFiles.map(file => {
    const ministry = demoMinistries.find(m => m.id === file.ministry_id);
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
      ministry_id: file.ministry_id,
      sizeBytes: file.file_size,
    };
  }) : sampleFiles.map(file => ({ ...file, sizeBytes: parseSizeToBytes(file.size) }));

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function parseSizeToBytes(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*(KB|MB|GB|Bytes)$/i);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    
    switch (unit) {
      case 'BYTES': return value;
      case 'KB': return value * 1024;
      case 'MB': return value * 1024 * 1024;
      case 'GB': return value * 1024 * 1024 * 1024;
      default: return 0;
    }
  }

  // Advanced filtering logic
  const filteredFiles = transformedDemoFiles.filter(file => {
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || file.type === filterType;
    const matchesMinistry = filterMinistry === "all" || file.ministry_id === filterMinistry;
    
    // Date filtering
    let matchesDateRange = true;
    if (dateFrom || dateTo) {
      const fileDate = new Date(file.eventDate);
      if (dateFrom && fileDate < dateFrom) matchesDateRange = false;
      if (dateTo && fileDate > dateTo) matchesDateRange = false;
    }
    
    // Size filtering
    let matchesSizeRange = true;
    if (minSize || maxSize) {
      const fileSizeBytes = file.sizeBytes || 0;
      const minSizeBytes = minSize ? parseSizeToBytes(minSize + ' MB') : 0;
      const maxSizeBytes = maxSize ? parseSizeToBytes(maxSize + ' MB') : Infinity;
      
      if (fileSizeBytes < minSizeBytes || fileSizeBytes > maxSizeBytes) {
        matchesSizeRange = false;
      }
    }
    
    return matchesSearch && matchesType && matchesMinistry && matchesDateRange && matchesSizeRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setFilterMinistry("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setMinSize("");
    setMaxSize("");
    setCurrentPage(1);
    setSearchParams({});
  };

  // ... keep existing code (getTypeIcon, getTypeBadgeColor functions)
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
        {/* Breadcrumb Navigation */}
        {selectedMinistry && (
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/demo/files">
                      <Home className="h-4 w-4" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/my-files">All Files</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{selectedMinistry.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {selectedMinistry ? `${selectedMinistry.name} Files` : 'My Files'}
          </h1>
          <p className="text-gray-600">
            {selectedMinistry 
              ? `Files from ${selectedMinistry.name}`
              : "All files you have access to across ministries"
            }
            {isDemoMode && ` (Demo Mode - ${totalFileCount}/6 total files)`}
          </p>
          {selectedMinistry && (
            <Button asChild variant="outline" className="mt-2">
              <Link to="/my-files">View All Files</Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
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

              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-xl">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-white border shadow-lg">
                  <div className="space-y-4">
                    <h4 className="font-medium">Advanced Filters</h4>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Range</label>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                            <Calendar
                              mode="single"
                              selected={dateFrom}
                              onSelect={setDateFrom}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateTo ? format(dateTo, "MMM dd, yyyy") : "To"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                            <Calendar
                              mode="single"
                              selected={dateTo}
                              onSelect={setDateTo}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">File Size (MB)</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          value={minSize}
                          onChange={(e) => setMinSize(e.target.value)}
                          type="number"
                        />
                        <Input
                          placeholder="Max"
                          value={maxSize}
                          onChange={(e) => setMaxSize(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>
                    
                    <Button onClick={clearAllFilters} variant="outline" className="w-full">
                      Clear All Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {paginatedFiles.length} of {filteredFiles.length} files
            {isDemoMode && ` (${totalFileCount}/6 total files)`}
          </p>
          {filteredFiles.length > 0 && (
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedFiles.map((file) => (
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
                        if (isDemoMode) {
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
                {selectedMinistry 
                  ? `No files found in ${selectedMinistry.name} matching your search criteria.`
                  : "No files match your current search and filter criteria."
                }
              </p>
              <Button onClick={clearAllFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredFiles.length > ITEMS_PER_PAGE && (
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

export default MyFiles;

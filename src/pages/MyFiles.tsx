
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { FileText, Home, Bug } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFiles } from "@/hooks/useFiles";
import { useFileFilters } from "@/hooks/useFileFilters";
import { useMinistries } from "@/hooks/useMinistries";
import { useDebugFiles } from "@/hooks/useDebugFiles";
import FileFilters from "@/components/FileFilters";
import FileGrid from "@/components/FileGrid";
import FilePagination from "@/components/FilePagination";

const ITEMS_PER_PAGE = 12;

const isDevelopment = import.meta.env.DEV;

const MyFiles = () => {
  const { user, profile } = useAuth();
  const { globalSearchTerm } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [showDebug, setShowDebug] = useState(false);
  
  const { files, loading, refetch } = useFiles();
  const { ministries } = useMinistries();
  const { debugInfo, loading: debugLoading, runDebugQuery } = useDebugFiles();
  
  const {
    searchTerm, setSearchTerm,
    filterType, setFilterType,
    filterMinistry, setFilterMinistry,
    showAdvancedFilters, setShowAdvancedFilters,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    minSize, setMinSize,
    maxSize, setMaxSize,
    filteredFiles,
    clearAllFilters
  } = useFileFilters(files);

  // Get ministry from URL parameter
  const ministryFromUrl = searchParams.get('ministry');
  const searchFromUrl = searchParams.get('search');
  const selectedMinistry = ministryFromUrl ? ministries.find(m => m.id === ministryFromUrl) : null;

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
  }, [ministryFromUrl, searchFromUrl, globalSearchTerm, setFilterMinistry, setSearchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
    setCurrentPage(1);
    setSearchParams({});
  };

  // If user is not authenticated, show loading or redirect
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Section - Only show for Directors/Admins and only in development */}
        {isDevelopment && (profile?.role === 'Director' || profile?.role === 'Admin' || profile?.role === 'SuperOrg') && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Debug Mode</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={runDebugQuery}
                    disabled={debugLoading}
                  >
                    {debugLoading ? 'Running...' : 'Run Debug'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setShowDebug(!showDebug)}
                  >
                    {showDebug ? 'Hide' : 'Show'} Debug Info
                  </Button>
                </div>
              </div>
              
              {showDebug && debugInfo && (
                <div className="mt-4 p-3 bg-white rounded border text-xs font-mono">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-64">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Breadcrumb Navigation */}
        {selectedMinistry && (
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">
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
          </p>
          {selectedMinistry && (
            <Button asChild variant="outline" className="mt-2">
              <Link to="/my-files">View All Files</Link>
            </Button>
          )}
          
          {/* Show file count and user info - only in development */}
          {isDevelopment && (
            <div className="mt-2 text-sm text-gray-500">
              Files found: {files.length} | Role: {profile?.role} | Ministry: {profile?.ministry_id || 'None'}
            </div>
          )}
        </div>

        {/* Filters */}
        <FileFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          filterMinistry={filterMinistry}
          setFilterMinistry={setFilterMinistry}
          showAdvancedFilters={showAdvancedFilters}
          setShowAdvancedFilters={setShowAdvancedFilters}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          minSize={minSize}
          setMinSize={setMinSize}
          maxSize={maxSize}
          setMaxSize={setMaxSize}
          ministries={ministries}
          clearAllFilters={handleClearAllFilters}
        />

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {paginatedFiles.length} of {filteredFiles.length} files
          </p>
          {filteredFiles.length > 0 && (
            <p className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* File Grid */}
        <FileGrid files={paginatedFiles} loading={loading} onFileDeleted={() => refetch()} />

        {/* Empty State */}
        {!loading && filteredFiles.length === 0 && (
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
              {isDevelopment && (
                <p className="text-sm text-gray-500 mb-4">
                  Raw file count: {files.length} files returned from database
                </p>
              )}
              <Button onClick={handleClearAllFilters} variant="outline">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filteredFiles.length > ITEMS_PER_PAGE && (
          <FilePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
};

export default MyFiles;

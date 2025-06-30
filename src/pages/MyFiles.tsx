
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
import { FileText, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFiles } from "@/hooks/useFiles";
import { useFileFilters } from "@/hooks/useFileFilters";
import { useMinistries } from "@/hooks/useMinistries";
import FileFilters from "@/components/FileFilters";
import FileGrid from "@/components/FileGrid";
import FilePagination from "@/components/FilePagination";

const ITEMS_PER_PAGE = 12;

const MyFiles = () => {
  const { user, profile } = useAuth();
  const { globalSearchTerm } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  const { files, loading } = useFiles();
  const { ministries } = useMinistries();
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
        <FileGrid files={paginatedFiles} loading={loading} />

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

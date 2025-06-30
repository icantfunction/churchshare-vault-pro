
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";

interface Ministry {
  id: string;
  name: string;
  description: string;
}

interface FileFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  filterMinistry: string;
  setFilterMinistry: (ministry: string) => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  dateFrom?: Date;
  setDateFrom: (date: Date | undefined) => void;
  dateTo?: Date;
  setDateTo: (date: Date | undefined) => void;
  minSize: string;
  setMinSize: (size: string) => void;
  maxSize: string;
  setMaxSize: (size: string) => void;
  ministries: Ministry[];
  clearAllFilters: () => void;
}

const FileFilters = ({
  searchTerm, setSearchTerm,
  filterType, setFilterType,
  filterMinistry, setFilterMinistry,
  showAdvancedFilters, setShowAdvancedFilters,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  minSize, setMinSize,
  maxSize, setMaxSize,
  ministries,
  clearAllFilters
}: FileFiltersProps) => {
  return (
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
              {ministries.map((ministry) => (
                <SelectItem key={ministry.id} value={ministry.id}>
                  {ministry.name}
                </SelectItem>
              ))}
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
  );
};

export default FileFilters;

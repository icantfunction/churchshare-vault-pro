
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, Image, Video, Archive } from "lucide-react";
import { useDemoContext } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

interface FileWithPreview {
  file: File;
  id: string;
  url?: string;
}

const DemoUpload = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { addDemoFile, demoMinistries, getTotalFileCount } = useDemoContext();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentTotal = getTotalFileCount();
    const newFilesCount = files.length;
    
    if (currentTotal + newFilesCount > 6) {
      toast({
        title: "File limit reached",
        description: "Demo mode is limited to 6 total files. Please sign up for full access.",
        variant: "destructive",
      });
      return;
    }

    const newFiles: FileWithPreview[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const clearAll = () => {
    selectedFiles.forEach(file => {
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
    });
    setSelectedFiles([]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!ministry) {
      toast({
        title: "Ministry required",
        description: "Please select a ministry for your files.",
        variant: "destructive",
      });
      return;
    }

    if (!eventDate) {
      toast({
        title: "Event date required",
        description: "Please select an event date.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      for (const fileData of selectedFiles) {
        await addDemoFile(fileData.file, ministry, eventDate, notes);
      }

      toast({
        title: "Files uploaded successfully!",
        description: `${selectedFiles.length} file(s) have been added to your demo collection.`,
      });

      // Clean up object URLs
      selectedFiles.forEach(file => {
        if (file.url) {
          URL.revokeObjectURL(file.url);
        }
      });

      // Reset form
      setSelectedFiles([]);
      setMinistry("");
      setEventDate("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6 text-purple-500" />;
    if (fileType.includes('zip') || fileType.includes('rar')) return <Archive className="h-6 w-6 text-orange-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Demo Upload</h1>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link to="/demo/files">View Demo Files</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </div>
          <p className="text-gray-600">
            Experience ChurchShare's file upload feature with demo data. 
            Limited to 6 total files in demo mode.
          </p>
          <div className="mt-2 text-sm text-blue-600">
            Current files: {getTotalFileCount()}/6
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Select files to upload to your ministry folder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Selection */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Select Files</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Drag files here or click to browse
                    </p>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
              </div>

              {/* Ministry Selection */}
              <div className="space-y-2">
                <Label htmlFor="ministry">Ministry</Label>
                <Select value={ministry} onValueChange={setMinistry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a ministry" />
                  </SelectTrigger>
                  <SelectContent>
                    {demoMinistries.map((min) => (
                      <SelectItem key={min.id} value={min.id}>
                        {min.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Event Date */}
              <div className="space-y-2">
                <Label htmlFor="event-date">Event Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about these files..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Upload Button */}
              <div className="flex space-x-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1"
                >
                  {uploading ? "Uploading..." : `Upload ${selectedFiles.length} file(s)`}
                </Button>
                {selectedFiles.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearAll}
                    disabled={uploading}
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Files Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Selected Files ({selectedFiles.length})</CardTitle>
              <CardDescription>
                Preview of files ready for upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No files selected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedFiles.map((fileData) => (
                    <div key={fileData.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {fileData.url ? (
                        <img
                          src={fileData.url}
                          alt={fileData.file.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center">
                          {getFileIcon(fileData.file.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileData.file.size)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileData.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoUpload;

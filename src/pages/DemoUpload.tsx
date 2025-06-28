
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, X, FileText, Image, Video, ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDemoContext } from "@/contexts/DemoContext";
import { Link, useNavigate } from "react-router-dom";

const DemoUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const { addDemoFile, getTotalFileCount } = useDemoContext();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get total file count (sample + user uploaded files)
  const currentFileCount = getTotalFileCount();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Check demo limit - 6 total files maximum
    if (currentFileCount + files.length + droppedFiles.length > 6) {
      toast({
        title: "Demo Limit Reached",
        description: "Demo mode is limited to 6 total files. Sign up for unlimited uploads!",
        variant: "destructive"
      });
      return;
    }
    
    setFiles(prev => [...prev, ...droppedFiles]);
  }, [files.length, currentFileCount, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      // Check demo limit - 6 total files maximum
      if (currentFileCount + files.length + selectedFiles.length > 6) {
        toast({
          title: "Demo Limit Reached",
          description: "Demo mode is limited to 6 total files. Sign up for unlimited uploads!",
          variant: "destructive"
        });
        return;
      }
      
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    
    // Revoke blob URL if it was created with URL.createObjectURL
    if (fileToRemove && typeof fileToRemove === 'object' && 'file_url' in fileToRemove) {
      const fileUrl = (fileToRemove as any).file_url;
      if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('blob:')) {
        URL.revokeObjectURL(fileUrl);
      }
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    // Revoke all blob URLs before clearing
    files.forEach(file => {
      if (file && typeof file === 'object' && 'file_url' in file) {
        const fileUrl = (file as any).file_url;
        if (fileUrl && typeof fileUrl === 'string' && fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl);
        }
      }
    });
    
    setFiles([]);
  };

  const handleUpload = async () => {
    if (!ministry) {
      toast({
        title: "Ministry Required",
        description: "Please select a ministry before uploading.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      for (const file of files) {
        await addDemoFile(file, ministry, eventDate, notes);
      }

      toast({
        title: "Demo Upload Complete!",
        description: `Successfully added ${files.length} files to demo. Redirecting to view files...`,
      });

      setFiles([]);
      setUploading(false);
      
      // Redirect to My Files page after successful upload
      setTimeout(() => {
        navigate('/my-files');
      }, 1500);
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-green-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileText className="h-8 w-8 text-purple-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/demo/files">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-primary">ChurchShare Pro - Demo</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo: {currentFileCount + files.length}/6 files</span>
              <Button asChild>
                <Link to="/auth">Sign Up for Full Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Upload</h1>
          <p className="text-gray-600">Try uploading files in demo mode (6 total file limit, 4 pre-uploaded)</p>
        </div>

        <div className="space-y-6">
          {/* Upload Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Upload Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ministry">Ministry</Label>
                  <Select value={ministry} onValueChange={setMinistry}>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select ministry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth Ministry</SelectItem>
                      <SelectItem value="worship">Worship Team</SelectItem>
                      <SelectItem value="children">Children's Ministry</SelectItem>
                      <SelectItem value="outreach">Outreach Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about these files..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Drop Zone */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-0">
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-primary transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <UploadIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Drop files here</h3>
                <p className="text-gray-600 mb-4">
                  Or click to browse and select files ({currentFileCount + files.length}/6 files)
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
                <Button asChild variant="outline" size="lg" className="rounded-xl">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Select Files
                  </label>
                </Button>
                <p className="text-sm text-gray-500 mt-4">
                  Demo supports images, videos, documents. 4 files pre-uploaded, 2 more available!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          {files.length > 0 && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Selected Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                      </div>
                      {!uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || !ministry || files.length === 0}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {uploading ? "Adding to Demo..." : "Add to Demo"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearAllFiles}
                    disabled={uploading}
                    className="h-12 rounded-xl"
                  >
                    Clear All
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default DemoUpload;


import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, X, FileText, Image, Video, CheckCircle, ArrowLeft } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDemoContext } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

interface FormErrors {
  ministry?: string;
  files?: string;
}

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const { toast } = useToast();
  const { isDemoMode, addDemoFile, getTotalFileCount } = useDemoContext();

  const currentFileCount = isDemoMode ? getTotalFileCount() : 0;

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (isDemoMode) {
      if (currentFileCount + files.length + droppedFiles.length > 6) {
        console.log('[DEBUG] Drop rejected - would exceed limit:', {
          current: currentFileCount,
          pending: files.length,
          dropped: droppedFiles.length,
          total: currentFileCount + files.length + droppedFiles.length
        });
        toast({
          title: "Demo Limit Reached",
          description: "Demo mode is limited to 6 total files. Sign up for unlimited uploads!",
          variant: "destructive"
        });
        return;
      }
    }
    
    console.log('[DEBUG] Files dropped successfully:', droppedFiles.length);
    setFiles(prev => [...prev, ...droppedFiles]);
    // Clear files error when files are added
    if (formErrors.files) {
      setFormErrors(prev => ({ ...prev, files: undefined }));
    }
  }, [files.length, currentFileCount, isDemoMode, toast, formErrors.files]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (isDemoMode) {
        if (currentFileCount + files.length + selectedFiles.length > 6) {
          console.log('[DEBUG] File selection rejected - would exceed limit:', {
            current: currentFileCount,
            pending: files.length,
            selected: selectedFiles.length,
            total: currentFileCount + files.length + selectedFiles.length
          });
          toast({
            title: "Demo Limit Reached", 
            description: "Demo mode is limited to 6 total files. Sign up for unlimited uploads!",
            variant: "destructive"
          });
          return;
        }
      }
      
      console.log('[DEBUG] Files selected successfully:', selectedFiles.length);
      setFiles(prev => [...prev, ...selectedFiles]);
      // Clear files error when files are added
      if (formErrors.files) {
        setFormErrors(prev => ({ ...prev, files: undefined }));
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!ministry) {
      errors.ministry = "Please select a ministry";
    }

    if (files.length === 0) {
      errors.files = "Please select at least one file to upload";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the highlighted fields and try again",
        variant: "destructive"
      });
      return;
    }

    console.log('[DEBUG] Starting upload process:', {
      fileCount: files.length,
      ministry,
      isDemoMode,
      currentFileCount
    });

    setUploading(true);
    
    try {
      if (isDemoMode) {
        // Demo mode: use addDemoFile
        for (const file of files) {
          console.log('[DEBUG] Uploading file to demo:', file.name, 'ministry:', ministry);
          await addDemoFile(file, ministry, eventDate, notes);
        }
        
        toast({
          title: "Demo Upload Complete!",
          description: `Successfully added ${files.length} files to demo`,
        });
      } else {
        // Real mode: simulate multipart upload with progress
        for (const file of files) {
          const fileId = file.name;
          
          // Simulate 8-part multipart upload progress
          for (let part = 1; part <= 8; part++) {
            await new Promise(resolve => setTimeout(resolve, 250));
            const progress = Math.floor((part / 8) * 100);
            setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
          }
        }

        toast({
          title: "Upload Complete!",
          description: `Successfully uploaded ${files.length} files to ${ministry}`,
        });
      }

      setFiles([]);
      setUploadProgress({});
      setUploading(false);
      setFormErrors({});
    } catch (error) {
      console.error('[DEBUG] Upload error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  const handleMinistryChange = (value: string) => {
    setMinistry(value);
    // Clear ministry error when user selects a ministry
    if (formErrors.ministry) {
      setFormErrors(prev => ({ ...prev, ministry: undefined }));
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
      {isDemoMode ? (
        // Demo mode header
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold text-primary">ChurchShare Pro - Upload</h1>
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
      ) : (
        <Header />
      )}
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Files</h1>
          <p className="text-gray-600">
            Share photos, videos, and documents with your ministry
            {isDemoMode && " (Demo Mode - 6 total file limit)"}
          </p>
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
                  <Label htmlFor="ministry" className={formErrors.ministry ? 'text-red-600' : ''}>
                    Ministry *
                  </Label>
                  <Select value={ministry} onValueChange={handleMinistryChange}>
                    <SelectTrigger className={`h-12 rounded-xl ${formErrors.ministry ? 'border-red-500 bg-red-50' : ''}`}>
                      <SelectValue placeholder="Select ministry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youth">Youth Ministry</SelectItem>
                      <SelectItem value="worship">Worship Team</SelectItem>
                      <SelectItem value="children">Children's Ministry</SelectItem>
                      <SelectItem value="outreach">Outreach Events</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.ministry && (
                    <p className="text-red-600 text-sm">{formErrors.ministry}</p>
                  )}
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
                className={`border-2 border-dashed rounded-xl p-12 text-center hover:border-primary transition-colors ${
                  formErrors.files ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => e.preventDefault()}
              >
                <UploadIcon className={`h-16 w-16 mx-auto mb-4 ${formErrors.files ? 'text-red-400' : 'text-gray-400'}`} />
                <h3 className={`text-xl font-semibold mb-2 ${formErrors.files ? 'text-red-600' : ''}`}>
                  Drop files here
                </h3>
                <p className={`mb-4 ${formErrors.files ? 'text-red-600' : 'text-gray-600'}`}>
                  Or click to browse and select files
                  {isDemoMode && ` (${currentFileCount + files.length}/6 files)`}
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
                  Supports images, videos, documents up to 500MB each
                  {isDemoMode && " (Demo: 6 total file limit)"}
                </p>
                {formErrors.files && (
                  <p className="text-red-600 text-sm mt-2">{formErrors.files}</p>
                )}
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
                        {uploading && uploadProgress[file.name] !== undefined && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Part {Math.ceil((uploadProgress[file.name] / 100) * 8)} of 8</span>
                              <span>{uploadProgress[file.name]}%</span>
                            </div>
                            <Progress value={uploadProgress[file.name]} className="h-2" />
                          </div>
                        )}
                        {uploadProgress[file.name] === 100 && (
                          <div className="flex items-center mt-2 text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm">Upload complete</span>
                          </div>
                        )}
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
                    disabled={uploading}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {uploading ? (isDemoMode ? "Adding to Demo..." : "Uploading...") : (isDemoMode ? "Add to Demo" : "Upload Files")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiles([]);
                      setFormErrors(prev => ({ ...prev, files: undefined }));
                    }}
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

export default Upload;

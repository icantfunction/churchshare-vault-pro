import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload as UploadIcon, X, FileText, Image, Video, ArrowLeft } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDemoContext } from "@/contexts/DemoContext";
import { useMinistries } from "@/hooks/useMinistries";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import UploadProgress from "@/components/UploadProgress";

interface FormErrors {
  ministry?: string;
  files?: string;
}

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showProgress, setShowProgress] = useState(false);
  const { toast } = useToast();
  const { isDemoMode, addDemoFile, getTotalFileCount } = useDemoContext();
  const { ministries, isLoading: ministriesLoading } = useMinistries();
  const { profile } = useAuth();

  const currentFileCount = isDemoMode ? getTotalFileCount() : 0;

  // Filter ministries to only show user's own ministry
  const userMinistries = ministries.filter(m => m.id === profile?.ministry_id);

  // Auto-select user's ministry if they only have one
  useEffect(() => {
    if (userMinistries.length === 1 && !ministry) {
      setMinistry(userMinistries[0].id);
    }
  }, [userMinistries, ministry]);

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

        setFiles([]);
        setUploading(false);
        setFormErrors({});
      } else {
        // Real mode: show upload progress component with ministry ID
        setShowProgress(true);
      }
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
    if (formErrors.ministry) {
      setFormErrors(prev => ({ ...prev, ministry: undefined }));
    }
  };

  const handleUploadComplete = (fileIds: string[]) => {
    console.log('[DEBUG] Upload completed:', fileIds);
    setFiles([]);
    setShowProgress(false);
    setUploading(false);
    setFormErrors({});
  };

  const handleRemoveFile = (fileId: string) => {
    // Remove file from progress view
    console.log('[DEBUG] Removing file from progress:', fileId);
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

  // Show upload progress when not in demo mode and uploading
  if (showProgress && !isDemoMode) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UploadProgress 
            files={files} 
            ministryId={ministry}
            eventDate={eventDate}
            notes={notes}
            onUploadComplete={handleUploadComplete}
            onRemoveFile={handleRemoveFile}
          />
        </main>
      </div>
    );
  }

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
                  <Select value={ministry} onValueChange={handleMinistryChange} disabled={ministriesLoading}>
                    <SelectTrigger className={`h-12 rounded-xl ${formErrors.ministry ? 'border-red-500 bg-red-50' : ''}`}>
                      <SelectValue placeholder={
                        ministriesLoading 
                          ? "Loading ministries..." 
                          : userMinistries.length === 0 
                            ? "No ministry assigned" 
                            : "Select ministry"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {userMinistries.map((min) => (
                        <SelectItem key={min.id} value={min.id}>
                          {min.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.ministry && (
                    <p className="text-red-600 text-sm">{formErrors.ministry}</p>
                  )}
                  {userMinistries.length === 0 && !ministriesLoading && (
                    <p className="text-amber-600 text-sm">
                      You are not assigned to any ministry. Contact an administrator to get access.
                    </p>
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
                    disabled={uploading || ministriesLoading || userMinistries.length === 0}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {uploading ? (isDemoMode ? "Adding to Demo..." : "Starting Upload...") : (isDemoMode ? "Add to Demo" : "Upload Files")}
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

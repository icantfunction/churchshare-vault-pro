
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload as UploadIcon, X, FileText, Image, Video, CheckCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [ministry, setMinistry] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const simulateUpload = async () => {
    setUploading(true);
    
    for (const file of files) {
      const fileId = file.name;
      
      // Simulate multipart upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
    }

    toast({
      title: "Upload Complete!",
      description: `Successfully uploaded ${files.length} files to ${ministry}`,
    });

    setFiles([]);
    setUploadProgress({});
    setUploading(false);
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
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Files</h1>
          <p className="text-gray-600">Share photos, videos, and documents with your ministry</p>
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
                  Or click to browse and select files
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
                        {uploading && uploadProgress[file.name] !== undefined && (
                          <div className="mt-2">
                            <Progress value={uploadProgress[file.name]} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                              {uploadProgress[file.name]}% uploaded
                            </p>
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
                    onClick={simulateUpload}
                    disabled={uploading || !ministry || files.length === 0}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                  >
                    {uploading ? "Uploading..." : "Upload Files"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFiles([])}
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

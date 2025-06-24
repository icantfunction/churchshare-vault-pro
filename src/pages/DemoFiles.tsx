
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Video, ArrowLeft, Upload } from "lucide-react";
import { useDemoContext } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

const DemoFiles = () => {
  const { demoFiles, clearDemoFiles } = useDemoContext();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-green-500" />;
    } else if (fileType.startsWith('video/')) {
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

  const getMinistryName = (ministryId: string) => {
    const ministryNames: Record<string, string> = {
      'youth': 'Youth Ministry',
      'worship': 'Worship Team',
      'children': "Children's Ministry",
      'outreach': 'Outreach Events'
    };
    return ministryNames[ministryId] || ministryId;
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      {/* Simple Header */}
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
              <h1 className="text-2xl font-bold text-primary">ChurchShare Pro - Demo Files</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Demo Mode: {demoFiles.length}/2 files</span>
              <Button asChild>
                <Link to="/auth">Sign Up for Full Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Demo Files</h1>
            <p className="text-gray-600">Your demo files are stored locally in your browser</p>
          </div>
          <div className="flex gap-4">
            {demoFiles.length < 2 && (
              <Button asChild>
                <Link to="/demo/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Files
                </Link>
              </Button>
            )}
            {demoFiles.length > 0 && (
              <Button variant="outline" onClick={clearDemoFiles}>
                Clear Demo Files
              </Button>
            )}
          </div>
        </div>

        {demoFiles.length === 0 ? (
          <Card className="shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Demo Files Yet</h3>
              <p className="text-gray-600 mb-6">
                Upload up to 2 files to try out ChurchShare Pro's file management features
              </p>
              <Button asChild>
                <Link to="/demo/upload">Upload Demo Files</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFiles.map((file) => (
              <Card key={file.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {getFileIcon(file.file_type)}
                    <Badge variant="secondary">
                      {getMinistryName(file.ministry_id)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold truncate" title={file.file_name}>
                        {file.file_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>
                    
                    {file.event_date && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Event: {new Date(file.event_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    
                    {file.notes && (
                      <div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          Notes: {file.notes}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-xs text-gray-500">
                        Added: {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {file.file_type.startsWith('image/') && (
                      <div className="mt-3">
                        <img 
                          src={file.file_url} 
                          alt={file.file_name}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {demoFiles.length > 0 && (
          <Card className="mt-8 shadow-lg border-0 bg-blue-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready for More?</h3>
                <p className="text-gray-600 mb-4">
                  Sign up for ChurchShare Pro to get unlimited file storage, real team collaboration, 
                  and advanced ministry management features.
                </p>
                <Button asChild size="lg">
                  <Link to="/auth">Sign Up for Full Access</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default DemoFiles;

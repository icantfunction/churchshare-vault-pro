
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Image, Video, ArrowLeft, Upload, Sparkles, Search, User, Users, Calendar, Camera, ArrowRight, Folder } from "lucide-react";
import { useDemoContext } from "@/contexts/DemoContext";
import { Link } from "react-router-dom";

const DemoFiles = () => {
  const { demoFiles, clearDemoFiles, demoMinistries, currentDemoUser } = useDemoContext();

  // Calculate user-uploaded files (excluding sample files)
  const sampleFileIds = ['demo-file-1', 'demo-file-2', 'demo-file-3', 'demo-file-4'];
  const userUploadedFiles = demoFiles.filter(file => !sampleFileIds.includes(file.id));

  const getMinistryIcon = (index: number) => {
    const icons = [Users, Camera, Calendar, FileText];
    return icons[index % icons.length];
  };

  const getMinistryColor = (index: number) => {
    const colors = [
      { bg: "bg-blue-500", text: "text-blue-500" },
      { bg: "bg-purple-500", text: "text-purple-500" },
      { bg: "bg-green-500", text: "text-green-500" },
      { bg: "bg-orange-500", text: "text-orange-500" }
    ];
    return colors[index % colors.length];
  };

  const totalFiles = demoFiles.length;
  const userName = currentDemoUser.first_name;

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Global Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logotype */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary flex items-center">
                ChurchShare Pro
                <div className="w-2 h-2 bg-secondary rounded-full ml-1 mt-1"></div>
              </Link>
            </div>

            {/* Center-left: Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 ml-12">
              <Link to="/demo/files" className="text-primary font-medium border-b-2 border-primary pb-1">
                Dashboard
              </Link>
              <Link to="/demo/files" className="text-gray-700 hover:text-primary transition-colors font-medium">
                My Files
              </Link>
            </nav>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  className="pl-12 bg-white border-gray-300 rounded-full h-10 w-full"
                />
              </div>
            </div>

            {/* Center-right: Upload Button */}
            <div className="flex items-center space-x-4">
              <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                <Link to="/demo/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Link>
              </Button>

              {/* Far right: Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-full p-1 h-10 w-10">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {currentDemoUser.first_name[0]}{currentDemoUser.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-gray-600">
                    {currentDemoUser.email}
                    <div className="text-xs text-gray-400">
                      {currentDemoUser.role} (Demo)
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/">Back to Landing</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 mb-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer hover:shadow-3xl transition-all duration-300" title="Click to open Upload wizard">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg text-gray-100 mb-6 leading-relaxed">
              You have access to {demoMinistries.length} ministries with {totalFiles} total files. Recent uploads include your demo files from today's session. This is demo mode - try uploading files or exploring the features!
            </p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-full">
              <Link to="/demo/upload">
                <Folder className="h-5 w-5 mr-2" />
                Upload New Files
              </Link>
            </Button>
          </div>
          {/* Hover tooltip effect */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Files</p>
                  <p className="text-3xl font-bold text-gray-900">{totalFiles}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-amber-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{userUploadedFiles.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lime-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Storage Used</p>
                  <p className="text-3xl font-bold text-gray-900">Demo</p>
                </div>
                <div className="w-12 h-12 bg-lime-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-lime-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section Header */}
        <div className="mb-6 mt-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Ministries</h2>
        </div>

        {/* Ministry Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {demoMinistries.map((ministry, index) => {
            const Icon = getMinistryIcon(index);
            const colors = getMinistryColor(index);
            const fileCount = demoFiles.filter(f => f.ministry_id === ministry.id).length;
            
            return (
              <Card key={ministry.id} className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group overflow-hidden">
                <Link to="/demo/files" className="block">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 ${colors.bg} rounded-md flex items-center justify-center shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{ministry.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                      {ministry.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 font-medium">
                        {fileCount} files
                      </span>
                      <Button variant="outline" size="sm" className="rounded-lg bg-gray-50 border-gray-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                        View Files
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions Footer */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="bg-white rounded-xl shadow-lg p-6 border-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5">
                <Link to="/demo/files">
                  <FileText className="h-5 w-5 mr-2" />
                  View All My Files
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-secondary/40 hover:bg-secondary/5">
                <Link to="/demo/upload">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Photos
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-green-400 hover:bg-green-50">
                <Link to="/demo/files">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users (Demo)
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Demo Mode CTA */}
        {demoFiles.length > 0 && (
          <Card className="mt-8 shadow-xl border-0 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-3">Ready for More?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Sign up for ChurchShare Pro to get unlimited file storage, real team collaboration, 
                  and advanced ministry management features.
                </p>
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
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

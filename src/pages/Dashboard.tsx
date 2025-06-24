
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Users, Calendar, FileText, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoContext } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Dashboard = () => {
  const { isDemoMode, demoMinistries, demoFiles, currentDemoUser, searchDemoFiles } = useDemoContext();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Use demo data if in demo mode, otherwise use real data
  const ministries = isDemoMode ? demoMinistries : [
    {
      id: "1",
      name: "Youth Ministry",
      description: "Photos and videos from youth events and activities",
      file_count: 127,
      cover_image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b"
    },
    {
      id: "2", 
      name: "Worship Team",
      description: "Performance recordings and event photography",
      file_count: 89,
      cover_image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
    },
    {
      id: "3",
      name: "Children's Ministry", 
      description: "Sunday school activities and special events",
      file_count: 156,
      cover_image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7"
    },
    {
      id: "4",
      name: "Outreach Events",
      description: "Community service and evangelism activities", 
      file_count: 73,
      cover_image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb"
    }
  ];

  const totalFiles = isDemoMode ? demoFiles.length : 445;
  const userName = isDemoMode ? currentDemoUser.first_name : (user?.user_metadata?.first_name || 'User');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode && searchQuery.trim()) {
      // In demo mode, you could navigate to my-files with search query
      console.log('Searching demo files:', searchDemoFiles(searchQuery));
    }
    // In real mode, implement actual search
  };

  const getMinistryIcon = (index: number) => {
    const icons = [Users, Camera, Calendar, FileText];
    return icons[index % icons.length];
  };

  const getMinistryColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500"];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg opacity-90 mb-6">
              You have access to {ministries.length} ministries with {totalFiles} total files.
              {isDemoMode && " This is demo mode - try uploading files or exploring the features!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" size="lg" className="rounded-xl">
                <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                  <Camera className="h-5 w-5 mr-2" />
                  Upload New Files
                </Link>
              </Button>
              
              {/* Global Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
                  <Input
                    placeholder="Search all files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-xl"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{isDemoMode ? demoFiles.filter(f => !f.id.startsWith('demo-file-')).length : 23}</p>
                </div>
                <Camera className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{isDemoMode ? "Demo Mode" : "2.4 GB"}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ministry Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Ministries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {ministries.map((ministry, index) => {
              const Icon = getMinistryIcon(index);
              const fileCount = isDemoMode ? 
                demoFiles.filter(f => f.ministry_id === ministry.id).length :
                ministry.file_count;
              
              return (
                <Card key={ministry.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer group">
                  <Link to={`/ministry/${ministry.id}`} className="block">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 ${getMinistryColor(index)} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="mb-2">{ministry.name}</CardTitle>
                      <CardDescription className="mb-4">
                        {ministry.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {fileCount} files
                        </span>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          View Files
                        </Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-16 rounded-xl">
                <Link to="/my-files">
                  <FileText className="h-5 w-5 mr-2" />
                  View All My Files
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-xl">
                <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                  <Camera className="h-5 w-5 mr-2" />
                  Upload Photos
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-xl">
                <Link to="/admin">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;

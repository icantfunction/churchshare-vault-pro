
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Users, Calendar, FileText, ArrowRight, Search, TrendingUp, Clock } from "lucide-react";
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
  
  // Recent activity message
  const getRecentActivity = () => {
    if (isDemoMode) {
      const userFiles = demoFiles.filter(f => !f.id.startsWith('demo-file-'));
      if (userFiles.length > 0) {
        return "Recent uploads include your demo files from today's session.";
      }
      return "Try uploading some demo files to see them here!";
    }
    return "Recent uploads include photos from last Sunday's youth event.";
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemoMode && searchQuery.trim()) {
      console.log('Searching demo files:', searchDemoFiles(searchQuery));
    }
  };

  const getMinistryIcon = (index: number) => {
    const icons = [Users, Camera, Calendar, FileText];
    return icons[index % icons.length];
  };

  const getMinistryGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-blue-600", 
      "from-purple-500 to-purple-600", 
      "from-green-500 to-green-600", 
      "from-orange-500 to-orange-600"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary via-purple-600 to-blue-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg opacity-95 mb-6 leading-relaxed">
              You have access to {ministries.length} ministries with {totalFiles} total files. {getRecentActivity()}
              {isDemoMode && " This is demo mode - try uploading files or exploring the features!"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" size="lg" className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-white/30">
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
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-xl focus:bg-white/30"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total Files</p>
                  <p className="text-3xl font-bold text-gray-900">{totalFiles}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{isDemoMode ? demoFiles.filter(f => !f.id.startsWith('demo-file-')).length : 23}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Recent activity
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/10 to-orange-100 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Storage Used</p>
                  <p className="text-3xl font-bold text-gray-900">{isDemoMode ? "Demo" : "2.4 GB"}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {isDemoMode ? "Local storage" : "of 10 GB plan"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ministry Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Ministries</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ministries.map((ministry, index) => {
              const Icon = getMinistryIcon(index);
              const fileCount = isDemoMode ? 
                demoFiles.filter(f => f.ministry_id === ministry.id).length :
                ministry.file_count;
              
              return (
                <Card key={ministry.id} className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden">
                  <Link to={`/ministry/${ministry.id}`} className="block">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className={`w-14 h-14 bg-gradient-to-br ${getMinistryGradient(index)} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardTitle className="mb-3 text-xl">{ministry.name}</CardTitle>
                      <CardDescription className="mb-4 leading-relaxed">
                        {ministry.description}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 font-medium">
                          {fileCount} files
                        </span>
                        <Button variant="outline" size="sm" className="rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
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
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-16 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5">
                <Link to="/my-files">
                  <FileText className="h-5 w-5 mr-2" />
                  View All My Files
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-xl border-2 hover:border-secondary/40 hover:bg-secondary/5">
                <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                  <Camera className="h-5 w-5 mr-2" />
                  Upload Photos
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-16 rounded-xl border-2 hover:border-green-400 hover:bg-green-50">
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

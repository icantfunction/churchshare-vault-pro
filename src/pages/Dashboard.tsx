
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Calendar, FileText, ArrowRight, Upload, Folder } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoContext } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { isDemoMode, demoMinistries, demoFiles, currentDemoUser } = useDemoContext();
  const { user } = useAuth();

  // Use demo data if in demo mode, otherwise use real data
  const ministries = isDemoMode ? demoMinistries : [
    {
      id: "1",
      name: "Youth Ministry",
      description: "Photos and videos from youth events and activities",
      file_count: 127,
    },
    {
      id: "2", 
      name: "Worship Team",
      description: "Performance recordings and event photography",
      file_count: 89,
    },
    {
      id: "3",
      name: "Children's Ministry", 
      description: "Sunday school activities and special events",
      file_count: 156,
    },
    {
      id: "4",
      name: "Outreach Events",
      description: "Community service and evangelism activities", 
      file_count: 73,
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

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 mb-8 text-white shadow-2xl">
          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-lg text-gray-100 mb-6 leading-relaxed">
              You have access to {ministries.length} ministries with {totalFiles} total files. {getRecentActivity()}
              {isDemoMode && " This is demo mode - try uploading files or exploring the features!"}
            </p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white rounded-full">
              <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                <Folder className="h-5 w-5 mr-2" />
                Upload New Files
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
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
          
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">This Week</p>
                  <p className="text-3xl font-bold text-gray-900">{isDemoMode ? demoFiles.filter(f => !f.id.startsWith('demo-file-')).length : 23}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Camera className="h-6 w-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Storage Used</p>
                  <p className="text-3xl font-bold text-gray-900">{isDemoMode ? "Demo" : "2.4 GB"}</p>
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
          {ministries.map((ministry, index) => {
            const Icon = getMinistryIcon(index);
            const colors = getMinistryColor(index);
            const fileCount = isDemoMode ? 
              demoFiles.filter(f => f.ministry_id === ministry.id).length :
              ministry.file_count;
            
            return (
              <Card key={ministry.id} className="bg-white shadow-lg border-0 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 group overflow-hidden">
                <Link to={`/ministry/${ministry.id}`} className="block">
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

        {/* Quick Actions Footer Stub */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h3>
          <div className="bg-white rounded-xl shadow-lg p-6 border-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5">
                <Link to="/my-files">
                  <FileText className="h-5 w-5 mr-2" />
                  View All My Files
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-secondary/40 hover:bg-secondary/5">
                <Link to={isDemoMode ? "/demo/upload" : "/upload"}>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Photos
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-14 rounded-xl border-2 hover:border-green-400 hover:bg-green-50">
                <Link to="/admin">
                  <Users className="h-5 w-5 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

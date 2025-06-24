
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Users, Calendar, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const ministries = [
    {
      id: 1,
      name: "Youth Ministry",
      description: "Photos and videos from youth events and activities",
      fileCount: 127,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      id: 2,
      name: "Worship Team",
      description: "Performance recordings and event photography",
      fileCount: 89,
      icon: Camera,
      color: "bg-purple-500",
    },
    {
      id: 3,
      name: "Children's Ministry",
      description: "Sunday school activities and special events",
      fileCount: 156,
      icon: Calendar,
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Outreach Events",
      description: "Community service and evangelism activities",
      fileCount: 73,
      icon: FileText,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, Sarah! 👋
            </h1>
            <p className="text-lg opacity-90 mb-6">
              You have access to 4 ministries with 445 total files. 
              Recent uploads include photos from last Sunday's youth event.
            </p>
            <Button asChild variant="secondary" size="lg" className="rounded-xl">
              <Link to="/upload">
                <Camera className="h-5 w-5 mr-2" />
                Upload New Files
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">445</p>
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
                  <p className="text-2xl font-bold text-gray-900">23</p>
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
                  <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
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
            {ministries.map((ministry) => {
              const Icon = ministry.icon;
              return (
                <Card key={ministry.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow cursor-pointer group">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 ${ministry.color} rounded-lg flex items-center justify-center`}>
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
                        {ministry.fileCount} files
                      </span>
                      <Button asChild variant="outline" size="sm" className="rounded-lg">
                        <Link to={`/ministry/${ministry.id}`}>
                          View Files
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
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
                <Link to="/upload">
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

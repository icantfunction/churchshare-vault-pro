
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Users, Settings, FolderOpen, Plus, Menu, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/ProtectedRoute";
import KPICards from "@/components/KPICards";

interface Ministry {
  id: string;
  name: string;
  description: string;
  file_count?: number;
}

const Dashboard = () => {
  const { user, profile, signOut, profileError, profileRetryCount, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Debug admin panel visibility
  const canAccessAdmin = ['Admin', 'Director', 'SuperOrg'].includes(profile?.role || '');
  
  console.log('[DEBUG-DASHBOARD] Admin panel state:', {
    profileRole: profile?.role,
    canAccessAdmin,
    hasProfile: !!profile,
    profileError,
    profileRetryCount
  });

  useEffect(() => {
    if (profile) {
      fetchMinistries();
    }
  }, [profile]);

  const fetchMinistries = async () => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          id,
          name,
          description
        `)
        .order('name');

      if (error) throw error;

      // Get file counts for each ministry
      const ministriesWithCounts = await Promise.all(
        (data || []).map(async (ministry) => {
          const { count } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('ministry_id', ministry.id);
          
          return { ...ministry, file_count: count || 0 };
        })
      );

      setMinistries(ministriesWithCounts);
    } catch (error) {
      console.error('Error fetching ministries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('[DEBUG-DASHBOARD] Sign out initiated from Dashboard');
    // Just call signOut - let the auth system handle navigation
    await signOut();
  };

  const handleRefreshProfile = () => {
    console.log('[DEBUG-DASHBOARD] Manual profile refresh requested');
    if (refreshProfile) {
      refreshProfile();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-poppins">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-6">
              {/* Left: Logo and welcome text */}
              <div className="flex-1 min-w-0">
                <Link to="/" className="text-xl sm:text-2xl font-bold text-primary block">
                  ChurchShare
                </Link>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 truncate">
                  Welcome back, {profile?.first_name} {profile?.last_name}
                </p>
                {profileError && (
                  <p className="text-xs text-red-500 mt-1">
                    Profile issue: {profileError}
                    {profileRetryCount && profileRetryCount > 0 && ` (Retry ${profileRetryCount}/3)`}
                  </p>
                )}
              </div>
              
              {/* Desktop: Role badge and sign out */}
              <div className="hidden md:flex items-center space-x-4">
                {profile?.role ? (
                  <Badge variant="secondary" className="px-3 py-1">
                    {profile.role}
                  </Badge>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="px-3 py-1">
                      Loading...
                    </Badge>
                    {refreshProfile && (
                      <Button onClick={handleRefreshProfile} variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </div>

              {/* Mobile: Menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200/50 py-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-3 py-2">
                    {profile?.role ? (
                      <Badge variant="secondary" className="px-3 py-1">
                        {profile.role}
                      </Badge>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="px-3 py-1">
                          Loading...
                        </Badge>
                        {refreshProfile && (
                          <Button onClick={handleRefreshProfile} variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    <Button 
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }} 
                      variant="outline" 
                      size="sm"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Real-time KPI Cards */}
          <KPICards />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="shadow-sm border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/upload')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-blue-700">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  Upload Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-blue-600">Share photos and videos with your ministry</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/my-files')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-green-700">
                  <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  My Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-green-600">View and manage your uploaded files</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/my-files')}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-purple-700">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  Browse All
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs sm:text-sm text-purple-600">Explore files from all ministries</p>
              </CardContent>
            </Card>

            {/* Admin Panel Card - Show loading state or conditional rendering */}
            {profile ? (
              canAccessAdmin && (
                <Card className="shadow-sm border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/admin')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-orange-700">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                      Admin Panel
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs sm:text-sm text-orange-600">Manage ministries and users</p>
                  </CardContent>
                </Card>
              )
            ) : (
              <Card className="shadow-sm border-0 bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-500">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                    Loading...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm text-gray-400">Checking permissions</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ministries Section */}
          <Card className="shadow-sm border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Ministry Folders</CardTitle>
                  <CardDescription>
                    Browse files organized by ministry
                  </CardDescription>
                </div>
                {canAccessAdmin && (
                  <Button onClick={() => navigate('/admin')} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Manage</span>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
                  ))}
                </div>
              ) : ministries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ministries.map((ministry) => (
                    <Card 
                      key={ministry.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer border-gray-200"
                      onClick={() => navigate(`/ministry/${ministry.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg text-gray-800">{ministry.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {ministry.description || 'No description available'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-500">
                            {ministry.file_count} files
                          </span>
                          <Badge variant="outline" className="text-xs">
                            Ministry
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No ministries yet</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4">
                    {canAccessAdmin 
                      ? "Create your first ministry to start organizing files"
                      : "Contact your administrator to set up ministries"
                    }
                  </p>
                  {canAccessAdmin && (
                    <Button onClick={() => navigate('/admin')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ministry
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;

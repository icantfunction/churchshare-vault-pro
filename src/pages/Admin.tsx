
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, BarChart3, Shield, Plus, Search, UserCheck, UserX, Crown } from "lucide-react";
import { useState } from "react";
import { useDemoContext } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Admin = () => {
  const { isDemoMode, demoUsers, demoMinistries, demoFiles } = useDemoContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Check if user has admin access
  const hasAdminAccess = isDemoMode || user?.role === 'Admin';

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background font-poppins">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-lg border-0 text-center">
            <CardContent className="p-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">
                You need administrator privileges to access this page.
              </p>
              <Button asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Sample users for non-demo mode
  const sampleUsers = [
    {
      id: "1",
      email: "admin@church.com",
      role: "Admin",
      first_name: "Church",
      last_name: "Admin",
      ministry_id: "youth",
      created_at: "2024-01-15T10:00:00Z"
    },
    {
      id: "2", 
      email: "sarah@church.com",
      role: "MinistryLeader",
      first_name: "Sarah",
      last_name: "Johnson",
      ministry_id: "youth",
      created_at: "2024-02-01T14:30:00Z"
    },
    {
      id: "3",
      email: "mike@church.com", 
      role: "Member",
      first_name: "Mike",
      last_name: "Wilson",
      ministry_id: "worship",
      created_at: "2024-02-10T09:15:00Z"
    }
  ];

  const users = isDemoMode ? demoUsers : sampleUsers;
  const ministries = isDemoMode ? demoMinistries : [
    { id: "youth", name: "Youth Ministry" },
    { id: "worship", name: "Worship Team" },
    { id: "children", name: "Children's Ministry" },
    { id: "outreach", name: "Outreach Events" }
  ];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="h-4 w-4" />;
      case 'MinistryLeader':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'MinistryLeader':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMinistryName = (ministryId: string) => {
    return ministries.find(m => m.id === ministryId)?.name || ministryId;
  };

  // Usage stats
  const totalFiles = isDemoMode ? demoFiles.length : 445;
  const totalUsers = users.length;
  const totalMinistries = ministries.length;
  const totalStorage = isDemoMode ? "Demo Mode" : "2.4 GB";

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
            {isDemoMode && <Badge className="ml-2 bg-blue-100 text-blue-800">Demo Mode</Badge>}
          </h1>
          <p className="text-gray-600">Manage users, ministries, and system settings</p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ministries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMinistries}</p>
                </div>
                <Settings className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStorage}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Management */}
        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                {isDemoMode ? "Add User (Demo)" : "Add User"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48 h-12 rounded-xl">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="MinistryLeader">Ministry Leader</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">{getMinistryName(user.ministry_id)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge className={`${getRoleBadgeColor(user.role)} border-0`}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{user.role}</span>
                    </Badge>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg">
                        Edit
                      </Button>
                      {user.role !== 'Admin' && (
                        <Button variant="outline" size="sm" className="rounded-lg text-red-600 hover:text-red-700">
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ministry Management */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ministry Management</CardTitle>
                <CardDescription>Manage ministry groups and permissions</CardDescription>
              </div>
              <Button className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                {isDemoMode ? "Add Ministry (Demo)" : "Add Ministry"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ministries.map((ministry) => {
                const userCount = users.filter(u => u.ministry_id === ministry.id).length;
                const fileCount = isDemoMode ? 
                  demoFiles.filter(f => f.ministry_id === ministry.id).length : 
                  Math.floor(Math.random() * 100) + 50;
                
                return (
                  <Card key={ministry.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">{ministry.name}</h3>
                        <Button variant="outline" size="sm" className="rounded-lg">
                          Edit
                        </Button>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Users:</span>
                          <span>{userCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Files:</span>
                          <span>{fileCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Admin;

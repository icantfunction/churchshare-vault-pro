
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Building2, FileText, TrendingUp, Plus, Search, Edit, Trash2, Crown, UserCheck } from "lucide-react";
import { useState } from "react";
import { useDemoContext } from "@/contexts/DemoContext";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const Admin = () => {
  const { isDemoMode, demoUsers, demoMinistries, demoFiles } = useDemoContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  // Check if user has admin access
  const hasAdminAccess = isDemoMode || user?.role === 'Admin';

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 font-poppins">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Card className="shadow-lg border-0 text-center">
            <CardContent className="p-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
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
    { id: "youth", name: "Youth Ministry", description: "Photos and videos from youth events and activities" },
    { id: "worship", name: "Worship Team", description: "Performance recordings and event photography" },
    { id: "children", name: "Children's Ministry", description: "Sunday school activities and special events" },
    { id: "outreach", name: "Outreach Events", description: "Community service and evangelism activities" }
  ];

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = user.email.toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  // Calculate metrics
  const totalUsers = users.length;
  const totalMinistries = ministries.length;
  const totalFiles = isDemoMode ? demoFiles.length : 445;
  const storageUsed = isDemoMode ? "Demo Mode" : "2.4 GB";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'MinistryLeader':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const getMinistryName = (ministryId: string) => {
    return ministries.find(m => m.id === ministryId)?.name || ministryId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFileCount = (ministryId: string) => {
    if (isDemoMode) {
      return demoFiles.filter(f => f.ministry_id === ministryId).length;
    }
    return Math.floor(Math.random() * 100) + 50; // Random for non-demo
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Panel
            {isDemoMode && <Badge className="ml-2 bg-blue-100 text-blue-800">Demo Mode</Badge>}
          </h1>
          <p className="text-gray-600">Manage users, ministries, and system settings</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Ministries</p>
                  <p className="text-2xl font-bold text-gray-900">{totalMinistries}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{storageUsed}</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Segment Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100 rounded-lg">
            <TabsTrigger value="users" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium">
              User Management
            </TabsTrigger>
            <TabsTrigger value="ministries" className="data-[state=active]:bg-white data-[state=active]:text-primary font-medium">
              Ministry Management
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users">
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button className="bg-primary hover:brightness-110 rounded-lg px-5 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    {isDemoMode ? "Add User (Demo)" : "Add User"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Bar */}
                <div className="mb-6">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 rounded-lg"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Ministry</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div>
                              <div className="font-semibold">{user.first_name} {user.last_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getRoleBadge(user.role)} border-0`}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1">{user.role}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>{getMinistryName(user.ministry_id)}</TableCell>
                          <TableCell>{formatDate(user.created_at)}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {user.role !== 'Admin' && (
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No users found matching your search</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ministry Management Tab */}
          <TabsContent value="ministries">
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ministry Management</CardTitle>
                    <CardDescription>Manage ministry groups and settings</CardDescription>
                  </div>
                  <Button className="bg-primary hover:brightness-110 rounded-lg px-5 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    {isDemoMode ? "Add Ministry (Demo)" : "Add Ministry"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Ministries Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>File Count</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ministries.map((ministry) => (
                        <TableRow key={ministry.id} className="hover:bg-gray-50">
                          <TableCell className="font-semibold">{ministry.name}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={ministry.description}>
                              {ministry.description && ministry.description.length > 80 
                                ? ministry.description.substring(0, 80) + "..." 
                                : ministry.description}
                            </div>
                          </TableCell>
                          <TableCell>{getFileCount(ministry.id)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;

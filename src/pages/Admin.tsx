
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Building2, Files, TrendingUp, Plus, Edit, Trash2, Crown, User, UserCheck } from "lucide-react";

const Admin = () => {
  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@church.org",
      role: "Admin",
      ministry: "Youth Ministry",
      joinDate: "2024-01-15",
      status: "active",
    },
    {
      id: 2,
      name: "Mike Wilson",
      email: "mike@church.org",
      role: "Ministry Leader",
      ministry: "Worship Team",
      joinDate: "2024-02-01",
      status: "active",
    },
    {
      id: 3,
      name: "Lisa Chen",
      email: "lisa@church.org",
      role: "Member",
      ministry: "Children's Ministry",
      joinDate: "2024-02-15",
      status: "active",
    },
  ];

  const ministries = [
    {
      id: 1,
      name: "Youth Ministry",
      description: "Engaging teenagers in faith and community",
      leader: "Sarah Johnson",
      members: 24,
      files: 127,
    },
    {
      id: 2,
      name: "Worship Team",
      description: "Leading the congregation in worship",
      leader: "Mike Wilson",
      members: 12,
      files: 89,
    },
    {
      id: 3,
      name: "Children's Ministry",
      description: "Nurturing young hearts for Jesus",
      leader: "Lisa Chen",
      members: 18,
      files: 156,
    },
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'Ministry Leader':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ministry Leader':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, ministries, and system settings</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">54</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Ministries</p>
                  <p className="text-2xl font-bold text-gray-900">4</p>
                </div>
                <Building2 className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Files</p>
                  <p className="text-2xl font-bold text-gray-900">445</p>
                </div>
                <Files className="h-8 w-8 text-green-500" />
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
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="ministries">Ministry Management</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search users..."
                    className="max-w-sm rounded-xl"
                  />
                </div>
                
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
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getRoleBadgeColor(user.role)} border-0`}>
                            {getRoleIcon(user.role)}
                            <span className="ml-1">{user.role}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{user.ministry}</TableCell>
                        <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ministries">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ministry Management</CardTitle>
                    <CardDescription>Manage ministries and their settings</CardDescription>
                  </div>
                  <Button className="rounded-xl bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Ministry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ministries.map((ministry) => (
                    <Card key={ministry.id} className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">{ministry.name}</CardTitle>
                        <CardDescription>{ministry.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Leader:</span>
                            <span className="font-medium">{ministry.leader}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Members:</span>
                            <span className="font-medium">{ministry.members}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Files:</span>
                            <span className="font-medium">{ministry.files}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

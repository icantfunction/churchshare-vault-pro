
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Settings, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import InviteManager from "@/components/InviteManager";

interface Ministry {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  ministry_id: string;
  date_of_birth: string;
  created_at: string;
}

const Admin = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMinistry, setNewMinistry] = useState({ name: "", description: "" });

  useEffect(() => {
    const canAccessAdmin = ['Admin', 'Director', 'SuperOrg'].includes(profile?.role || '');
    if (profile && !canAccessAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchData();
  }, [profile, navigate]);

  const fetchData = async () => {
    try {
      // Fetch ministries
      const { data: ministriesData, error: ministriesError } = await supabase
        .from('ministries')
        .select('*')
        .order('name');

      if (ministriesError) throw ministriesError;
      setMinistries(ministriesData || []);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('first_name');

      if (usersError) throw usersError;
      setUsers(usersData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMinistry = async () => {
    if (!newMinistry.name.trim()) {
      toast({
        title: "Error",
        description: "Ministry name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ministries')
        .insert({
          name: newMinistry.name,
          description: newMinistry.description
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ministry created successfully",
      });

      setNewMinistry({ name: "", description: "" });
      fetchData();
    } catch (error) {
      console.error('Error creating ministry:', error);
      toast({
        title: "Error",
        description: "Failed to create ministry",
        variant: "destructive",
      });
    }
  };

  const deleteMinistry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ministries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ministry deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting ministry:', error);
      toast({
        title: "Error",
        description: "Failed to delete ministry",
        variant: "destructive",
      });
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role", 
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-poppins">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your organization's ministries and users
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="ministries" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ministries">Ministries</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="ministries" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ministry Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage ministries in your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Ministry Name</Label>
                      <Input
                        id="name"
                        value={newMinistry.name}
                        onChange={(e) => setNewMinistry(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Youth Ministry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newMinistry.description}
                        onChange={(e) => setNewMinistry(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                      />
                    </div>
                  </div>
                  <Button onClick={createMinistry} className="mb-6">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ministry
                  </Button>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ministries.map((ministry) => (
                        <TableRow key={ministry.id}>
                          <TableCell className="font-medium">{ministry.name}</TableCell>
                          <TableCell>{ministry.description || 'No description'}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteMinistry(ministry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>
                    View and manage users in your organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Ministry</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.first_name} {user.last_name}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => updateUserRole(user.id, value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Member">Member</SelectItem>
                                <SelectItem value="MinistryLeader">Ministry Leader</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Director">Director</SelectItem>
                                <SelectItem value="SuperOrg">Super Org</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {user.ministry_id ? 'Assigned' : 'No Ministry'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" disabled>
                              More actions coming soon
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invites" className="space-y-6">
              <InviteManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;

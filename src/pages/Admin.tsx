
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Settings, Plus, Trash2, Edit, UserX, RefreshCw } from "lucide-react";
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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);

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

  const updateUserDetails = async (updatedUser: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          ministry_id: updatedUser.ministry_id || null
        })
        .eq('id', updatedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User details updated successfully",
      });

      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error('Error updating user details:', error);
      toast({
        title: "Error",
        description: "Failed to update user details",
        variant: "destructive",
      });
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      // In a real implementation, you might soft-delete or mark as inactive
      // For demo purposes, we'll show a confirmation
      toast({
        title: "User Deactivated",
        description: "User account has been deactivated (demo action)",
      });

      setUserToDeactivate(null);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    }
  };

  const resetUserPassword = async (userEmail: string) => {
    try {
      // This would typically trigger a password reset email
      toast({
        title: "Password Reset",
        description: `Password reset email sent to ${userEmail} (demo action)`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to reset password",
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
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit User Details</DialogTitle>
                                    <DialogDescription>
                                      Update user information and ministry assignment
                                    </DialogDescription>
                                  </DialogHeader>
                                  {editingUser && (
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                          <Label>First Name</Label>
                                          <Input
                                            value={editingUser.first_name}
                                            onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label>Last Name</Label>
                                          <Input
                                            value={editingUser.last_name}
                                            onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                                          />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Ministry</Label>
                                        <Select
                                          value={editingUser.ministry_id || ""}
                                          onValueChange={(value) => setEditingUser({...editingUser, ministry_id: value})}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select ministry" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="">No Ministry</SelectItem>
                                            {ministries.map((ministry) => (
                                              <SelectItem key={ministry.id} value={ministry.id}>
                                                {ministry.name}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  )}
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setEditingUser(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => editingUser && updateUserDetails(editingUser)}>
                                      Save Changes
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => resetUserPassword(user.email)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => setUserToDeactivate(user)}
                                  >
                                    <UserX className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Deactivate User</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to deactivate {user.first_name} {user.last_name}? 
                                      This will prevent them from accessing the system.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setUserToDeactivate(null)}>
                                      Cancel
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => userToDeactivate && deactivateUser(userToDeactivate.id)}
                                    >
                                      Deactivate User
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
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

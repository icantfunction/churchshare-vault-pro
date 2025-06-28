
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { ArrowLeft, User, Shield, Crown } from "lucide-react";
import { useDemoContext } from "@/contexts/DemoContext";

const DemoUserManagement = () => {
  const { demoUsers, currentDemoUser, demoMinistries } = useDemoContext();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Crown className="h-4 w-4" />;
      case 'MinistryLeader':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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
    const ministry = demoMinistries.find(m => m.id === ministryId);
    return ministry?.name || 'Unknown Ministry';
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/demo/files">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Demo
                </Link>
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">User Management (Demo)</h1>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Demo Mode
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Notice */}
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Demo User Management</h3>
                <p className="text-amber-800 leading-relaxed">
                  This is a demonstration of the user management interface. In the full version of ChurchShare, 
                  you would be able to invite new users, assign roles, and manage permissions across different ministries.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Current Demo User</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentDemoUser.first_name[0]}{currentDemoUser.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {currentDemoUser.first_name} {currentDemoUser.last_name}
                </h3>
                <p className="text-gray-600">{currentDemoUser.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getRoleBadgeColor(currentDemoUser.role)}>
                    {getRoleIcon(currentDemoUser.role)}
                    <span className="ml-1">{currentDemoUser.role}</span>
                  </Badge>
                  <span className="text-sm text-gray-500">
                    • {getMinistryName(currentDemoUser.ministry_id)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Demo Users</CardTitle>
              <Button disabled className="opacity-50">
                Invite New User (Demo)
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Ministry</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                            {user.first_name[0]}{user.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.id === currentDemoUser.id && (
                            <div className="text-xs text-primary">You</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>{getMinistryName(user.ministry_id)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" disabled className="opacity-50">
                        Edit (Demo)
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-3">Ready for Real User Management?</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Sign up for ChurchShare Pro to invite team members, assign roles, and manage 
              permissions across your church ministries.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-purple-600">
              <Link to="/auth">Get Full Access</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DemoUserManagement;

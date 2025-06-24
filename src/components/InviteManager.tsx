
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Invite {
  code: string;
  role: string;
  expires_at: string;
  max_uses: number;
  uses: number;
  organisation_id: string;
}

const InviteManager = () => {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    role: 'Member',
    expiryDays: '14',
    maxUses: '1'
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('organisation_id', profile?.organisation_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast({
        title: "Error",
        description: "Failed to load invites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const createInvite = async () => {
    if (!profile?.organisation_id) return;
    
    setCreating(true);
    try {
      const code = generateInviteCode();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiryDays));

      const { error } = await supabase
        .from('invites')
        .insert({
          code,
          organisation_id: profile.organisation_id,
          role: formData.role,
          expires_at: expiresAt.toISOString(),
          max_uses: parseInt(formData.maxUses),
          uses: 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invite created successfully",
      });

      setShowForm(false);
      setFormData({ role: 'Member', expiryDays: '14', maxUses: '1' });
      fetchInvites();
    } catch (error) {
      console.error('Error creating invite:', error);
      toast({
        title: "Error",
        description: "Failed to create invite",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/signup?code=${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Invite link copied to clipboard",
    });
  };

  const deleteInvite = async (code: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('code', code);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invite deleted successfully",
      });

      fetchInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast({
        title: "Error",
        description: "Failed to delete invite",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isMaxedOut = (uses: number, maxUses: number) => {
    return uses >= maxUses;
  };

  if (loading) {
    return <div>Loading invites...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Invite Management</CardTitle>
            <CardDescription>
              Create and manage invite codes for new members
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Invite
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Create New Invite</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="MinistryLeader">Ministry Leader</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expires in (days)</Label>
                  <Input
                    type="number"
                    value={formData.expiryDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDays: e.target.value }))}
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max uses</Label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={createInvite} disabled={creating}>
                  {creating ? "Creating..." : "Create Invite"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.code}>
                <TableCell className="font-mono">{invite.code}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{invite.role}</Badge>
                </TableCell>
                <TableCell>
                  {isExpired(invite.expires_at) ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : isMaxedOut(invite.uses, invite.max_uses) ? (
                    <Badge variant="destructive">Max Uses Reached</Badge>
                  ) : (
                    <Badge variant="default">Active</Badge>
                  )}
                </TableCell>
                <TableCell>{invite.uses} / {invite.max_uses}</TableCell>
                <TableCell>{new Date(invite.expires_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyInviteLink(invite.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteInvite(invite.code)}
                    >
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
  );
};

export default InviteManager;

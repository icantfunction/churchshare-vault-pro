
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSupportRequests } from '@/hooks/useSupportRequests';

const SupportRequests = () => {
  const { requests, loading, createRequest } = useSupportRequests();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    subject: '',
    message: '',
    priority: 'medium' as const
  });

  const handleCreateRequest = async () => {
    const success = await createRequest({
      subject: newRequest.subject,
      message: newRequest.message,
      priority: newRequest.priority
    });

    if (success) {
      setNewRequest({ subject: '', message: '', priority: 'medium' });
      setIsDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Support Requests</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Support Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newRequest.subject}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of the issue"
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newRequest.priority} onValueChange={(value: any) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={newRequest.message}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Detailed description of the issue"
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateRequest} className="w-full">
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{request.subject}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getPriorityColor(request.priority)}>
                    {request.priority}
                  </Badge>
                  <Badge className={getStatusColor(request.status)}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{request.message}</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(request.updated_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {requests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No support requests yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SupportRequests;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileShareModalProps {
  fileId: string;
  fileName: string;
  children?: React.ReactNode;
}

const FileShareModal: React.FC<FileShareModalProps> = ({ fileId, fileName, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [expiresIn, setExpiresIn] = useState<'30min' | '24h' | '7days' | 'never'>('24h');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const createShareLink = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-share-link', {
        body: {
          fileId,
          expiresIn
        }
      });

      if (error) throw error;

      setShareUrl(data.shareUrl);
      toast({
        title: "Share link created",
        description: `Link ${expiresIn === 'never' ? 'never expires' : `expires in ${expiresIn}`}`,
      });
    } catch (error) {
      console.error('Share creation error:', error);
      toast({
        title: "Error creating share link",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const getExpirationText = () => {
    switch (expiresIn) {
      case '30min': return '30 minutes';
      case '24h': return '24 hours';
      case '7days': return '7 days';
      case 'never': return 'Never';
      default: return '';
    }
  };

  const handleExpirationChange = (value: string) => {
    setExpiresIn(value as '30min' | '24h' | '7days' | 'never');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share File
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">File</Label>
            <p className="text-sm text-gray-600 truncate">{fileName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Link Expiration</Label>
            <Select value={expiresIn} onValueChange={handleExpirationChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30min">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    30 minutes
                  </div>
                </SelectItem>
                <SelectItem value="24h">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    24 hours
                  </div>
                </SelectItem>
                <SelectItem value="7days">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    7 days
                  </div>
                </SelectItem>
                <SelectItem value="never">
                  Never expires
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Link will expire in {getExpirationText().toLowerCase()}
            </p>
          </div>

          {!shareUrl ? (
            <Button onClick={createShareLink} disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Share Link'}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Share URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={copyToClipboard} variant="outline" size="icon">
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Share link created!</strong> Anyone with this link can access the file
                  {expiresIn !== 'never' && ` for ${getExpirationText().toLowerCase()}`}.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileShareModal;

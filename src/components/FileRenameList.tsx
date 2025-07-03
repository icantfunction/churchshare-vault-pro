import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Video, X, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';
import { FileRename, validateFileName, sanitizeFileName, checkDuplicateNames, generateUniqueName } from '@/utils/fileNameUtils';
import { formatFileSize } from '@/utils/formatFileSize';
import { useToast } from '@/hooks/use-toast';

interface FileRenameListProps {
  fileRenames: FileRename[];
  onFileRenamesChange: (fileRenames: FileRename[]) => void;
  onRemoveFile: (id: string) => void;
}

const FileRenameList = ({ fileRenames, onFileRenamesChange, onRemoveFile }: FileRenameListProps) => {
  const { toast } = useToast();
  const [duplicates, setDuplicates] = useState<string[]>([]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-green-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-purple-500" />;
    }
  };

  const updateFileName = (id: string, newName: string) => {
    const updated = fileRenames.map(fr => {
      if (fr.id === id) {
        const validation = validateFileName(newName);
        return {
          ...fr,
          customName: newName,
          isValid: validation.isValid,
          error: validation.error
        };
      }
      return fr;
    });
    
    // Check for duplicates
    const newDuplicates = checkDuplicateNames(updated);
    setDuplicates(newDuplicates);
    
    // Mark files with duplicate names as invalid
    const finalUpdated = updated.map(fr => ({
      ...fr,
      isValid: fr.isValid && !newDuplicates.includes(fr.customName.toLowerCase()),
      error: newDuplicates.includes(fr.customName.toLowerCase()) 
        ? 'Duplicate filename' 
        : fr.error
    }));
    
    onFileRenamesChange(finalUpdated);
  };

  const autoRenameAll = () => {
    const updated = fileRenames.map(fr => {
      const sanitized = sanitizeFileName(fr.originalName);
      const validation = validateFileName(sanitized);
      return {
        ...fr,
        customName: sanitized,
        isValid: validation.isValid,
        error: validation.error
      };
    });
    
    // Resolve any duplicates
    const existingNames: string[] = [];
    const finalUpdated = updated.map(fr => {
      let uniqueName = fr.customName;
      if (existingNames.some(name => name.toLowerCase() === uniqueName.toLowerCase())) {
        uniqueName = generateUniqueName(uniqueName, existingNames);
      }
      existingNames.push(uniqueName);
      
      const validation = validateFileName(uniqueName);
      return {
        ...fr,
        customName: uniqueName,
        isValid: validation.isValid,
        error: validation.error
      };
    });
    
    setDuplicates([]);
    onFileRenamesChange(finalUpdated);
    
    toast({
      title: "Files Renamed",
      description: "All files have been automatically renamed with valid names",
    });
  };

  const allValid = fileRenames.every(fr => fr.isValid) && duplicates.length === 0;

  return (
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Selected Files ({fileRenames.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={autoRenameAll}
              className="text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Auto-Rename All
            </Button>
            {allValid ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                All Valid
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                Issues Found
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fileRenames.map((fileRename) => (
            <div key={fileRename.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                {getFileIcon(fileRename.file)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-600">Original:</p>
                    <p className="text-sm truncate">{fileRename.originalName}</p>
                  </div>
                  <p className="text-xs text-gray-500">{formatFileSize(fileRename.file.size)}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFile(fileRename.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`filename-${fileRename.id}`} className="text-sm font-medium">
                  New Filename
                </Label>
                <Input
                  id={`filename-${fileRename.id}`}
                  value={fileRename.customName}
                  onChange={(e) => updateFileName(fileRename.id, e.target.value)}
                  className={`${
                    fileRename.isValid 
                      ? 'border-green-300 focus:border-green-500' 
                      : 'border-red-300 focus:border-red-500'
                  }`}
                  placeholder="Enter filename..."
                />
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {fileRename.isValid ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Valid
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {fileRename.error}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {fileRename.customName.length}/50 chars
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {duplicates.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium">Duplicate filenames detected:</p>
            <p className="text-red-600 text-xs mt-1">
              {duplicates.join(', ')} - Please use unique names for all files.
            </p>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm font-medium">Filename Rules:</p>
          <ul className="text-blue-600 text-xs mt-1 space-y-1">
            <li>• Only letters (a-z, A-Z), numbers (0-9), and hyphens (-) allowed</li>
            <li>• Maximum 50 characters before file extension</li>
            <li>• Cannot start or end with hyphens</li>
            <li>• No consecutive hyphens (--)</li>
            <li>• Each filename must be unique</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileRenameList;
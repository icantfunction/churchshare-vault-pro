export interface FileRename {
  file: File;
  originalName: string;
  customName: string;
  isValid: boolean;
  error?: string;
  id: string;
}

// Validate filename to only allow alphanumeric characters, dots, hyphens
export const validateFileName = (filename: string): { isValid: boolean; error?: string } => {
  if (!filename || filename.trim().length === 0) {
    return { isValid: false, error: 'Filename cannot be empty' };
  }

  const nameWithoutExt = getFileNameWithoutExtension(filename);
  
  if (nameWithoutExt.length === 0) {
    return { isValid: false, error: 'Filename must have a name before the extension' };
  }

  if (nameWithoutExt.length > 50) {
    return { isValid: false, error: 'Filename must be 50 characters or less' };
  }

  // Allow only alphanumeric characters and hyphens for the main filename
  const validPattern = /^[a-zA-Z0-9-]+$/;
  if (!validPattern.test(nameWithoutExt)) {
    return { isValid: false, error: 'Only letters, numbers, and hyphens allowed' };
  }

  // Check for consecutive hyphens
  if (nameWithoutExt.includes('--')) {
    return { isValid: false, error: 'No consecutive hyphens allowed' };
  }

  // Check for starting or ending with hyphen
  if (nameWithoutExt.startsWith('-') || nameWithoutExt.endsWith('-')) {
    return { isValid: false, error: 'Cannot start or end with hyphen' };
  }

  return { isValid: true };
};

// Sanitize filename to alphanumeric + hyphens
export const sanitizeFileName = (filename: string): string => {
  const extension = getFileExtension(filename);
  const nameWithoutExt = getFileNameWithoutExtension(filename);
  
  // Replace spaces and special characters with hyphens
  let sanitized = nameWithoutExt
    .replace(/[^a-zA-Z0-9-]/g, '-')  // Replace invalid chars with hyphens
    .replace(/-+/g, '-')             // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');          // Remove leading/trailing hyphens

  // Ensure we have a valid name
  if (sanitized.length === 0) {
    sanitized = 'file';
  }

  // Limit length
  if (sanitized.length > 50) {
    sanitized = sanitized.substring(0, 50).replace(/-$/, '');
  }

  return extension ? `${sanitized}.${extension}` : sanitized;
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot + 1).toLowerCase() : '';
};

// Get filename without extension
export const getFileNameWithoutExtension = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
};

// Create FileRename object from File
export const createFileRename = (file: File, customName?: string): FileRename => {
  const originalName = file.name;
  const suggestedName = customName || sanitizeFileName(originalName);
  const validation = validateFileName(suggestedName);
  
  return {
    file,
    originalName,
    customName: suggestedName,
    isValid: validation.isValid,
    error: validation.error,
    id: Math.random().toString(36).substr(2, 9)
  };
};

// Check for duplicate filenames in array
export const checkDuplicateNames = (fileRenames: FileRename[]): string[] => {
  const names = fileRenames.map(fr => fr.customName.toLowerCase());
  const duplicates: string[] = [];
  
  names.forEach((name, index) => {
    if (names.indexOf(name) !== index && !duplicates.includes(name)) {
      duplicates.push(name);
    }
  });
  
  return duplicates;
};

// Generate unique name if duplicate exists
export const generateUniqueName = (baseName: string, existingNames: string[]): string => {
  const extension = getFileExtension(baseName);
  const nameWithoutExt = getFileNameWithoutExtension(baseName);
  
  let counter = 1;
  let uniqueName = baseName;
  
  while (existingNames.some(name => name.toLowerCase() === uniqueName.toLowerCase())) {
    uniqueName = extension 
      ? `${nameWithoutExt}-${counter}.${extension}`
      : `${nameWithoutExt}-${counter}`;
    counter++;
  }
  
  return uniqueName;
};
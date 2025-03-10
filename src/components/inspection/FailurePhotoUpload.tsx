
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';

interface FailurePhotoUploadProps {
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const FailurePhotoUpload: React.FC<FailurePhotoUploadProps> = ({ index, form, readOnly = false }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Watch for any existing photo URL in the form data
  const existingPhotoUrl = form.watch(`inspectionItems.${index}.failurePhotoUrl`);
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create a preview URL for the selected file
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Store the file in the form
    form.setValue(`inspectionItems.${index}.failurePhoto`, file);
  };
  
  const removePhoto = () => {
    setPreviewUrl(null);
    form.setValue(`inspectionItems.${index}.failurePhoto`, undefined);
    form.setValue(`inspectionItems.${index}.failurePhotoUrl`, undefined);
  };
  
  // Display either the preview URL (for newly selected photos) or the existing photo URL
  const displayUrl = previewUrl || existingPhotoUrl;
  
  if (readOnly && !displayUrl) {
    return <div className="text-sm text-gray-500">No failure photo provided</div>;
  }
  
  return (
    <FormItem>
      <FormLabel>Photo of Failure</FormLabel>
      <div className="space-y-2">
        {displayUrl ? (
          <div className="relative">
            <img 
              src={displayUrl} 
              alt="Failure evidence" 
              className="w-full max-h-64 object-contain rounded-md border border-gray-300"
            />
            {!readOnly && (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removePhoto}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
            <Camera className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2">Take a photo of the failure</p>
            <Button 
              type="button"
              disabled={readOnly}
              className="flex items-center space-x-2"
              onClick={() => document.getElementById(`photo-upload-${index}`)?.click()}
            >
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </Button>
            <input 
              id={`photo-upload-${index}`}
              type="file" 
              accept="image/*" 
              className="hidden"
              onChange={handlePhotoChange}
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    </FormItem>
  );
};

export default FailurePhotoUpload;

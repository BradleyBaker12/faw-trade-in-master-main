
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Video } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import { PhotoCategory } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type PhotoUploadSectionProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  uploadedPhotos: File[];
  setUploadedPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  showVideoUpload?: boolean;
};

const PhotoUploadSection: React.FC<PhotoUploadSectionProps> = ({ 
  form, 
  uploadedPhotos, 
  setUploadedPhotos,
  showVideoUpload = false
}) => {
  const { toast } = useToast();
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedPhotos(prev => [...prev, ...newFiles]);
      
      // Here we would normally upload the files to a server
      // For this demo, we'll just simulate the upload
      toast({
        title: "Files uploaded",
        description: `${newFiles.length} files have been uploaded.`,
      });
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const videoFile = event.target.files[0];
      setUploadedVideo(videoFile);
      
      toast({
        title: "Video uploaded",
        description: "Walkaround video has been uploaded.",
      });
    }
  };

  // Function to simulate approving all photos for testing/demo purposes
  const approveAllPhotos = () => {
    const dummyFile = new File(["dummy content"], "dummy.jpg", { type: "image/jpeg" });
    const dummyPhotos = Array(5).fill(dummyFile);
    setUploadedPhotos(dummyPhotos);
    
    if (showVideoUpload) {
      const dummyVideo = new File(["dummy video content"], "walkaround.mp4", { type: "video/mp4" });
      setUploadedVideo(dummyVideo);
    }
    
    toast({
      title: "All photos approved",
      description: "All required photos have been marked as uploaded.",
    });
  };

  // Define available photo categories including video if needed
  const categories = Object.values(PhotoCategory)
    .filter(category => category !== PhotoCategory.VIDEO_WALKAROUND || showVideoUpload);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Vehicle Documentation</CardTitle>
            <CardDescription>
              Upload photos of the vehicle from different angles
              {showVideoUpload && " and a walkaround video before entry"}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            onClick={approveAllPhotos}
            className="hidden sm:flex items-center space-x-2"
          >
            <span>Quick Approve Photos</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <div key={category} className="flex flex-col items-center justify-center p-4 border rounded-lg">
              {category === PhotoCategory.VIDEO_WALKAROUND ? (
                <Video className="h-8 w-8 text-muted-foreground mb-2" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
              )}
              <p className="text-sm font-medium text-center">{category}</p>
              <Badge 
                variant="outline" 
                className={`mt-1 ${category === PhotoCategory.VIDEO_WALKAROUND 
                  ? uploadedVideo 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                  : uploadedPhotos.length > 0 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {category === PhotoCategory.VIDEO_WALKAROUND
                  ? uploadedVideo
                    ? "Video uploaded"
                    : "No video uploaded" 
                  : uploadedPhotos.length > 0
                    ? "Photo uploaded"
                    : "No photo uploaded"}
              </Badge>
              <label htmlFor={`photo-${category}`} className="cursor-pointer mt-3">
                <div className="flex items-center space-x-1 text-xs text-faw-primary hover:text-faw-secondary">
                  <Upload className="h-3 w-3" />
                  <span>Upload {category === PhotoCategory.VIDEO_WALKAROUND ? 'Video' : 'Photo'}</span>
                </div>
                <input
                  id={`photo-${category}`}
                  type="file"
                  accept={category === PhotoCategory.VIDEO_WALKAROUND ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={category === PhotoCategory.VIDEO_WALKAROUND ? handleVideoUpload : handleFileUpload}
                />
              </label>
            </div>
          ))}
        </div>

        <Form {...form}>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional notes about the vehicle condition..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>

        <div className="sm:hidden">
          <Button 
            variant="outline" 
            onClick={approveAllPhotos}
            className="w-full"
          >
            Quick Approve Photos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotoUploadSection;

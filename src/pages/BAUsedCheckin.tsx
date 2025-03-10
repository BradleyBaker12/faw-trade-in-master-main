
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import PageTransition from '@/components/layout/PageTransition';
import { getTradeRequestById, updateInspectionStatus } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { formSchema } from '@/utils/inspectionSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PhotoUploadSection from '@/components/inspection/PhotoUploadSection';
import { InspectionStatus } from '@/types';

const BAUsedCheckin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [baCheckInNotes, setBaCheckInNotes] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
      dealerId: '',
      dealerName: '',
      vehicleInfo: {
        tradeType: undefined,
        color: '',
        make: '',
        model: '',
        year: undefined,
        regNumber: '',
        mileage: undefined,
        engineHours: undefined,
        vin: '',
      },
      inspectionItems: [],
      photos: []
    }
  });
  
  useEffect(() => {
    console.log("Current ID from params:", id);
    if (!id) {
      console.error("No ID provided, redirecting to BA Used page");
      toast({
        title: "Error",
        description: "No vehicle ID provided. Redirecting to vehicle list.",
        variant: "destructive"
      });
      navigate('/ba-used');
    }
  }, [id, navigate, toast]);

  const { data: tradeRequest, isLoading, isError } = useQuery({
    queryKey: ['tradeRequest', id],
    queryFn: () => {
      if (!id) {
        throw new Error("No trade request ID provided");
      }
      return getTradeRequestById(id);
    },
    enabled: !!id,
  });

  const inspection = tradeRequest?.inspection;

  useEffect(() => {
    if (isError) {
      toast({
        title: "Error",
        description: "Could not load vehicle details. Please try again.",
        variant: "destructive"
      });
    }
  }, [isError, toast]);

  const updateInspectionStatusMutation = useMutation({
    mutationFn: async (newStatus: InspectionStatus) => {
      if (!inspection?.id) {
        throw new Error("No inspection ID available");
      }
      console.log(`Updating inspection ${inspection.id} to status: ${newStatus}`);
      return updateInspectionStatus(inspection.id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['tradeRequest', id] });
    }
  });

  const isCheckInComplete = () => {
    return uploadedPhotos.length >= 1;
  };

  const handleSubmitCheckIn = () => {
    if (!isCheckInComplete()) {
      toast({
        title: "Check-in incomplete",
        description: "Please upload at least one photo before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    // Update the inspectionItems in the form
    const formValues = form.getValues();
    
    updateInspectionStatusMutation.mutate(InspectionStatus.BA_RECEIVED, {
      onSuccess: () => {
        toast({
          title: "Vehicle checked in",
          description: "The vehicle has been successfully checked in."
        });
        
        navigate('/ba-used');
      },
      onError: (error) => {
        console.error("Failed to update inspection status:", error);
        toast({
          title: "Error",
          description: "Failed to check in vehicle. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const getStatusBadgeColor = (status: InspectionStatus) => {
    switch (status) {
      case InspectionStatus.FAW_APPROVED:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case InspectionStatus.BA_RECEIVED:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case InspectionStatus.BA_INSPECTED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case InspectionStatus.BA_APPROVED:
        return 'bg-green-100 text-green-800 border-green-300';
      case InspectionStatus.BA_REJECTED:
        return 'bg-red-100 text-red-800 border-red-300';
      case InspectionStatus.READY_FOR_SALE:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default:
        return '';
    }
  };

  if (isError || !id) {
    return (
      <PageTransition>
        <div className="flex justify-center py-16 flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">Inspection Not Found</h1>
          <p className="text-muted-foreground">The requested inspection could not be found or loaded.</p>
          <Button onClick={() => navigate('/ba-used')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to BA Used
          </Button>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
      </div>
    );
  }

  if (!inspection || !tradeRequest) {
    return (
      <PageTransition>
        <div className="flex justify-center py-16 flex-col items-center space-y-4">
          <h1 className="text-2xl font-bold">No Inspection Found</h1>
          <p className="text-muted-foreground">The requested vehicle inspection could not be found.</p>
          <Button onClick={() => navigate('/ba-used')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to BA Used
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ba-used')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Vehicle Check-In
            </h1>
            <p className="text-muted-foreground">
              Receive and check-in the vehicle
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Vehicle Details</CardTitle>
              <Badge variant="outline" className={getStatusBadgeColor(inspection.status)}>
                {inspection.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.vin || tradeRequest.id.slice(0, 17)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make/Model</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.make} {tradeRequest.vehicleInfo.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mileage</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reg Number</p>
                <p className="font-medium">{tradeRequest.vehicleInfo.regNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dealer</p>
                <p className="font-medium">{tradeRequest.dealerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inspection Date</p>
                <p className="font-medium">{new Date(inspection.completedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormProvider {...form}>
          <div className="grid gap-6 grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Check-in</CardTitle>
                <CardDescription>Upload photos and videos of the vehicle upon arrival</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <PhotoUploadSection 
                  form={form} 
                  uploadedPhotos={uploadedPhotos} 
                  setUploadedPhotos={setUploadedPhotos}
                  showVideoUpload={true}
                />
                  
                <div className="mt-6 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Check-in Notes</p>
                    <Textarea 
                      placeholder="Add any notes about the vehicle condition upon arrival..."
                      value={baCheckInNotes}
                      onChange={(e) => setBaCheckInNotes(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitCheckIn}
                      disabled={updateInspectionStatusMutation.isPending}
                    >
                      {updateInspectionStatusMutation.isPending ? 'Submitting...' : 'Complete Check-In'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </FormProvider>
      </div>
    </PageTransition>
  );
};

export default BAUsedCheckin;

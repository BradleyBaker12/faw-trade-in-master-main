
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTradeRequestById, updateInspectionStatus } from '@/services/api';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  AlertCircle,
  ClipboardCheck,
  ShoppingCart
} from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
import { InspectionItem, InspectionStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';
import InspectionItemsSection from '@/components/inspection/InspectionItemsSection';
import DamagesTabContent from '@/components/inspection/DamagesTabContent';
import { externalCabInspectionItems, internalCabInspectionItems, externalCabMechanicalItems } from '@/utils/inspectionData';
import { useForm, FormProvider } from 'react-hook-form';
import { formSchema } from '@/utils/inspectionSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const BAUsedInspection = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reviewNotes, setReviewNotes] = useState('');
  const [localItems, setLocalItems] = useState<InspectionItem[]>([]);
  
  // Initialize allInspectionItems array
  const allInspectionItems: InspectionItem[] = [
    ...externalCabInspectionItems,
    ...internalCabInspectionItems,
    ...externalCabMechanicalItems
  ].map(item => ({
    ...item,
    id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
    category: item.category || "General",
    name: item.name || "",
    description: item.description || "",
    status: "Not Checked" as "Pass" | "Fail" | "Not Checked",
    notes: item.notes || ""
  }));
  
  // Group items by category
  const groupedItems = allInspectionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>);

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
      inspectionItems: allInspectionItems,
      photos: []
    }
  });

  const { data: request, isLoading } = useQuery({
    queryKey: ['tradeRequest', id],
    queryFn: () => getTradeRequestById(id as string),
    enabled: !!id,
  });

  // Check if inspection is in a read-only state (approved or rejected)
  const isReadOnly = request?.inspection?.status === InspectionStatus.BA_APPROVED || 
                    request?.inspection?.status === InspectionStatus.BA_REJECTED ||
                    request?.inspection?.status === InspectionStatus.READY_FOR_SALE;

  // Check if vehicle is ready for sale
  const isReadyForSale = request?.inspection?.status === InspectionStatus.READY_FOR_SALE;

  // Check if this is an approved vehicle that can be marked as ready for sale
  const canMarkAsReadyForSale = request?.inspection?.status === InspectionStatus.BA_APPROVED;

  useEffect(() => {
    if (request?.inspection?.items) {
      setLocalItems([...request.inspection.items]);
      
      // Update form values with the inspection items from the request
      form.setValue('inspectionItems', request.inspection.items);
    }
  }, [request?.inspection?.items, form]);

  const updateInspectionStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InspectionStatus }) => {
      return updateInspectionStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeRequest', id] });
      queryClient.invalidateQueries({ queryKey: ['tradeRequests'] });
    },
    onError: (error) => {
      console.error('Error updating inspection status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update inspection status',
        variant: 'destructive',
      });
    }
  });

  const handleApprove = () => {
    if (!request?.inspection?.id) {
      toast({
        title: 'Error',
        description: 'Inspection ID not found',
        variant: 'destructive',
      });
      return;
    }

    const updatedRequest = {
      ...request,
      inspection: {
        ...request.inspection,
        items: localItems,
      }
    };

    updateInspectionStatusMutation.mutate(
      { 
        id: request.inspection.id, 
        status: InspectionStatus.BA_APPROVED 
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Inspection approved successfully',
          });
          navigate('/ba-used');
        }
      }
    );
  };

  const handleReject = () => {
    if (!request?.inspection?.id) {
      toast({
        title: 'Error',
        description: 'Inspection ID not found',
        variant: 'destructive',
      });
      return;
    }

    updateInspectionStatusMutation.mutate(
      { 
        id: request.inspection.id, 
        status: InspectionStatus.BA_REJECTED 
      },
      {
        onSuccess: () => {
          toast({
            title: 'Inspection Rejected',
            description: 'The inspection has been rejected',
          });
          navigate('/ba-used');
        }
      }
    );
  };

  const handleMarkAsReadyForSale = () => {
    if (!request?.inspection?.id) {
      toast({
        title: 'Error',
        description: 'Inspection ID not found',
        variant: 'destructive',
      });
      return;
    }

    updateInspectionStatusMutation.mutate(
      { 
        id: request.inspection.id, 
        status: InspectionStatus.READY_FOR_SALE 
      },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'Vehicle is now marked as ready for sale',
          });
          navigate('/ba-used');
        }
      }
    );
  };

  const handleToggleStatus = (itemId: string, newStatus: 'Pass' | 'Fail' | 'Not Checked') => {
    if (isReadOnly) return; // Prevent changes in read-only mode
    
    setLocalItems(currentItems => 
      currentItems.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
    
    // Also update the form values
    const currentItems = form.getValues('inspectionItems');
    const updatedItems = currentItems.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    form.setValue('inspectionItems', updatedItems);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-700">Trade request not found</h2>
        <p className="text-gray-500 mt-2">The requested trade-in could not be found.</p>
        <Button variant="outline" onClick={() => navigate('/ba-used')} className="mt-4">
          Back to Vehicle List
        </Button>
      </div>
    );
  }

  const items = localItems.length > 0 ? localItems : (request.inspection?.items || []);
  const failedItems = items.filter(item => item.status === 'Fail');
  const passedItems = items.filter(item => item.status === 'Pass');
  const notCheckedItems = items.filter(item => item.status === 'Not Checked');

  // Group failed items by category for the Damages tab
  const externalFailedItems = failedItems.filter(item => 
    item.category?.includes('External Cab') && !item.category?.includes('Mechanical')
  ).map((item, index) => ({ ...item, formIndex: index }));
  
  const internalFailedItems = failedItems.filter(item => 
    item.category?.includes('Internal Cab')
  ).map((item, index) => ({ ...item, formIndex: index }));
  
  const mechanicalFailedItems = failedItems.filter(item => 
    item.category?.includes('Engine') || 
    item.category?.includes('Cooling') || 
    item.category?.includes('Gearbox') || 
    item.category?.includes('Axle') || 
    item.category?.includes('Steering') || 
    item.category?.includes('Propshaft') ||
    item.category?.includes('Fifth Wheel') ||
    (item.category?.includes('External Cab') && item.category?.includes('Mechanical'))
  ).map((item, index) => ({ ...item, formIndex: index }));

  const hasDamages = failedItems.length > 0;

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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/ba-used')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isReadOnly ? 'View Inspection Details' : 'Review Dealer Inspection'}
            </h1>
            <p className="text-muted-foreground">
              {isReadOnly ? 'View the inspection details' : 'Review and approve or reject the dealer\'s inspection'}
            </p>
          </div>
        </div>

        {isReadOnly && (
          <Alert className={request?.inspection?.status === InspectionStatus.BA_APPROVED ? 'bg-green-50' : 
                            request?.inspection?.status === InspectionStatus.READY_FOR_SALE ? 'bg-emerald-50' : 'bg-red-50'}>
            <div className="flex items-center gap-2">
              {request?.inspection?.status === InspectionStatus.BA_APPROVED ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : request?.inspection?.status === InspectionStatus.READY_FOR_SALE ? (
                <ShoppingCart className="h-5 w-5 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertTitle>
                {request?.inspection?.status === InspectionStatus.BA_APPROVED 
                  ? 'This inspection has been approved' 
                  : request?.inspection?.status === InspectionStatus.READY_FOR_SALE
                  ? 'This vehicle is ready for sale'
                  : 'This inspection has been rejected'}
              </AlertTitle>
            </div>
            <AlertDescription>
              {request?.inspection?.status === InspectionStatus.READY_FOR_SALE
                ? 'The vehicle has been processed and is now available for sale.'
                : 'The inspection is in read-only mode and cannot be modified.'}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle>Vehicle Details</CardTitle>
              <Badge variant="outline" className={getStatusBadgeColor(request.inspection?.status || InspectionStatus.FAW_APPROVED)}>
                {request.inspection?.status || 'Unknown Status'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">VIN</p>
                <p className="font-medium">{request.vehicleInfo.vin || request.id.slice(0, 17)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Make/Model</p>
                <p className="font-medium">{request.vehicleInfo.make} {request.vehicleInfo.model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-medium">{request.vehicleInfo.year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium">{request.vehicleInfo.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mileage</p>
                <p className="font-medium">{request.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reg Number</p>
                <p className="font-medium">{request.vehicleInfo.regNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dealer</p>
                <p className="font-medium">{request.dealerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inspection Date</p>
                <p className="font-medium">{request.inspection?.completedAt ? new Date(request.inspection.completedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <FormProvider {...form}>
          {/* Show full inspection checklist only when not in read-only mode */}
          {!isReadOnly && (
            <div className="grid gap-6 grid-cols-1">
              <InspectionItemsSection 
                form={form} 
                groupedItems={groupedItems} 
                allInspectionItems={allInspectionItems}
                readOnly={isReadOnly}
              />
            </div>
          )}
          
          {/* Show only damages section when in read-only mode */}
          {isReadOnly && hasDamages && (
            <Card>
              <CardHeader>
                <CardTitle>Inspection Damages</CardTitle>
              </CardHeader>
              <CardContent>
                <DamagesTabContent 
                  externalItems={externalFailedItems} 
                  internalItems={internalFailedItems} 
                  mechanicalItems={mechanicalFailedItems}
                  form={form}
                  readOnly={true}
                />
              </CardContent>
            </Card>
          )}
        </FormProvider>

        <Card>
          <CardHeader>
            <CardTitle>BA Used Review</CardTitle>
            <CardDescription>
              {isReadOnly 
                ? 'Review notes for this vehicle' 
                : 'Provide your assessment of this vehicle based on the dealer\'s inspection'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Add your review notes here..."
                className="min-h-24"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                readOnly={isReadOnly}
                disabled={isReadOnly}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/ba-used')}
                >
                  {isReadOnly ? 'Back' : 'Cancel'}
                </Button>
                
                {/* Show Ready for Sale button only for approved vehicles */}
                {canMarkAsReadyForSale && (
                  <Button 
                    onClick={handleMarkAsReadyForSale}
                    disabled={updateInspectionStatusMutation.isPending}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Mark Ready for Sale
                  </Button>
                )}
                
                {!isReadOnly && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={handleReject}
                      disabled={updateInspectionStatusMutation.isPending}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Reject Inspection
                    </Button>
                    <Button 
                      onClick={handleApprove}
                      disabled={updateInspectionStatusMutation.isPending}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve Inspection
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default BAUsedInspection;

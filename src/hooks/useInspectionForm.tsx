import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { formSchema } from '@/utils/inspectionSchemas';
import { TradeRequest, TradeType, VehicleInfo, InspectionItem, RequestStatus, InspectionStatus } from '@/types';
import { z } from 'zod';
import { getTradeRequestById, getInspectionItems, createTradeRequest } from '@/services/api';
import { externalCabInspectionItems, internalCabInspectionItems, externalCabMechanicalItems } from '@/utils/inspectionData';

export const useInspectionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isNewInspection = !id || id === 'new';
  
  const dealerData = location.state as { 
    dealerId?: string;
    dealerName?: string;
    tradeType?: TradeType;
  } | null;

  const { data: tradeRequest, isLoading: isLoadingRequest } = useQuery({
    queryKey: ['tradeRequest', id],
    queryFn: () => (isNewInspection ? null : getTradeRequestById(id as string)),
    enabled: !isNewInspection,
  });

  const typedTradeRequest = tradeRequest as TradeRequest | null;

  const { data: standardInspectionItems = [] } = useQuery({
    queryKey: ['standardInspectionItems'],
    queryFn: getInspectionItems,
  });

  const allInspectionItems: InspectionItem[] = [
    ...(standardInspectionItems || []), 
    ...externalCabInspectionItems,
    ...internalCabInspectionItems,
    ...externalCabMechanicalItems
  ].map(item => ({
    id: item.id || `item-${Math.random().toString(36).substring(2, 9)}`,
    category: item.category || "General",
    name: item.name || "",
    description: item.description || "",
    status: item.status as "Pass" | "Fail" | "Not Checked" || "Not Checked",
    notes: item.notes || ""
  }));

  const groupedItems = allInspectionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, InspectionItem[]>);

  const defaultVehicleInfo: VehicleInfo & { tradeType: TradeType } = {
    tradeType: dealerData?.tradeType || TradeType.TRADE_IN,
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    regNumber: '',
    mileage: 0,
    engineHours: 0,
    color: '',
  };

  console.log("All inspection items:", allInspectionItems.length);
  console.log("Trade request inspection items:", typedTradeRequest?.inspection?.items?.length || 0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealerId: dealerData?.dealerId || '',
      dealerName: dealerData?.dealerName || '',
      vehicleInfo: typedTradeRequest ? {
        tradeType: typedTradeRequest.tradeType,
        ...typedTradeRequest.vehicleInfo
      } : defaultVehicleInfo,
      inspectionItems: allInspectionItems,
      photos: [],
      notes: typedTradeRequest?.inspection?.notes || '',
    },
  });

  useEffect(() => {
    const items = form.getValues('inspectionItems');
    console.log("Current inspection items in form:", items.length);
  }, [form]);

  useEffect(() => {
    if (isNewInspection && dealerData && dealerData.dealerId) {
      form.setValue('dealerId', dealerData.dealerId);
      form.setValue('dealerName', dealerData.dealerName || '');
      if (dealerData.tradeType) {
        form.setValue('vehicleInfo.tradeType', dealerData.tradeType);
      }
    }
  }, [dealerData, form, isNewInspection]);

  useEffect(() => {
    if (typedTradeRequest?.inspection?.items?.length) {
      form.setValue('inspectionItems', typedTradeRequest.inspection.items);
    }
  }, [typedTradeRequest, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const anyNotChecked = values.inspectionItems.some(item => item.status === "Not Checked");
      
      if (anyNotChecked) {
        toast({
          title: "Inspection Incomplete",
          description: "All inspection items must be checked before submitting.",
          variant: "destructive"
        });
        return;
      }
      
      console.log('Form submitted:', values);
      
      if (isNewInspection) {
        const newTradeRequest: Partial<TradeRequest> = {
          dealerId: values.dealerId || dealerData?.dealerId || '',
          dealerName: values.dealerName || dealerData?.dealerName || '',
          tradeType: values.vehicleInfo.tradeType,
          status: RequestStatus.SUBMITTED,
          vehicleInfo: {
            vin: values.vehicleInfo.vin,
            make: values.vehicleInfo.make,
            model: values.vehicleInfo.model,
            year: values.vehicleInfo.year,
            regNumber: values.vehicleInfo.regNumber,
            mileage: values.vehicleInfo.mileage,
            color: values.vehicleInfo.color,
            engineHours: values.vehicleInfo.engineHours,
          },
          inspection: {
            id: `inspection-${Date.now()}`,
            tradeRequestId: `request-${Date.now()}`,
            completedBy: 'Dealer User',
            completedAt: new Date(),
            status: InspectionStatus.PENDING,
            items: values.inspectionItems.map(item => ({
              id: item.id,
              category: item.category,
              name: item.name,
              description: item.description,
              status: item.status,
              notes: item.notes || ''
            })),
            photos: [],
            notes: values.notes || '',
          }
        };
        
        try {
          const result = await createTradeRequest(newTradeRequest);
          console.log("Created new trade request with result:", result);
          
          toast({
            title: "Inspection saved",
            description: "New inspection has been created successfully."
          });
          
          navigate('/trade-ins');
        } catch (error) {
          console.error("Error creating trade request:", error);
          toast({
            title: "Error",
            description: "Failed to create trade request. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Inspection updated",
          description: "Inspection has been updated successfully."
        });
        
        navigate('/trade-ins');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsSubmitting(true);
      const values = form.getValues();
      
      if (isNewInspection) {
        const newTradeRequest: Partial<TradeRequest> = {
          dealerId: values.dealerId || dealerData?.dealerId || '',
          dealerName: values.dealerName || dealerData?.dealerName || '',
          tradeType: values.vehicleInfo.tradeType,
          status: RequestStatus.DRAFT,
          vehicleInfo: {
            vin: values.vehicleInfo.vin,
            make: values.vehicleInfo.make,
            model: values.vehicleInfo.model,
            year: values.vehicleInfo.year,
            regNumber: values.vehicleInfo.regNumber,
            mileage: values.vehicleInfo.mileage,
            color: values.vehicleInfo.color,
            engineHours: values.vehicleInfo.engineHours,
          },
          inspection: {
            id: `inspection-${Date.now()}`,
            tradeRequestId: `request-${Date.now()}`,
            completedBy: 'Dealer User',
            completedAt: new Date(),
            status: InspectionStatus.PENDING,
            items: values.inspectionItems.map(item => ({
              id: item.id,
              category: item.category,
              name: item.name,
              description: item.description,
              status: item.status,
              notes: item.notes || ''
            })),
            photos: [],
            notes: values.notes || '',
          }
        };
        
        try {
          const result = await createTradeRequest(newTradeRequest);
          console.log("Saved as draft:", result);
          
          toast({
            title: "Draft saved",
            description: "Inspection has been saved as a draft.",
          });
          
          navigate('/trade-ins');
        } catch (error) {
          console.error("Error saving draft:", error);
          toast({
            title: "Error",
            description: "Failed to save draft. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Draft updated",
          description: "Draft has been updated successfully.",
        });
        
        navigate('/trade-ins');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const approveAllItems = () => {
    const updatedItems = form.getValues().inspectionItems.map(item => ({
      ...item,
      status: "Pass" as const
    }));
    
    form.setValue('inspectionItems', updatedItems, { shouldValidate: true });
    
    toast({
      title: "All Items Approved",
      description: "All inspection items have been marked as 'Pass'.",
    });
  };

  return {
    id,
    isNewInspection,
    isLoadingRequest,
    isSubmitting,
    form,
    uploadedPhotos,
    setUploadedPhotos,
    groupedItems,
    allInspectionItems,
    handleSubmit,
    handleSaveAsDraft,
    approveAllItems
  };
};

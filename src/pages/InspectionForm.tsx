
import React from 'react';
import { Form } from '@/components/ui/form';
import PageTransition from '@/components/layout/PageTransition';
import { useInspectionForm } from '@/hooks/useInspectionForm';
import VehicleInfoSection from '@/components/inspection/VehicleInfoSection';
import InspectionItemsSection from '@/components/inspection/InspectionItemsSection';
import PhotoUploadSection from '@/components/inspection/PhotoUploadSection';
import FormActions from '@/components/inspection/FormActions';
import PageHeader from '@/components/inspection/PageHeader';
import { Button } from '@/components/ui/button';
import { CheckSquare } from 'lucide-react';

const InspectionForm = () => {
  const {
    id,
    isNewInspection,
    isLoadingRequest,
    form,
    uploadedPhotos,
    setUploadedPhotos,
    groupedItems,
    allInspectionItems,
    handleSubmit,
    handleSaveAsDraft,
    approveAllItems
  } = useInspectionForm();

  if (isLoadingRequest && !isNewInspection) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
      </div>
    );
  }

  return (
    <PageTransition children={
      <div className="space-y-6">
        <PageHeader 
          isNewInspection={isNewInspection}
          id={id}
          form={form}
          handleSubmit={handleSubmit}
          handleSaveAsDraft={handleSaveAsDraft}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            {/* Vehicle Information */}
            <VehicleInfoSection form={form} />

            {/* Approve All Button */}
            <div className="flex justify-end">
              <Button 
                type="button" 
                onClick={approveAllItems}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <CheckSquare className="h-4 w-4" />
                <span>Approve All Items</span>
              </Button>
            </div>

            {/* Inspection Items */}
            <InspectionItemsSection 
              form={form} 
              groupedItems={groupedItems} 
              allInspectionItems={allInspectionItems} 
            />

            {/* Photo Upload */}
            <PhotoUploadSection 
              form={form} 
              uploadedPhotos={uploadedPhotos} 
              setUploadedPhotos={setUploadedPhotos} 
            />

            <FormActions 
              form={form} 
              handleSubmit={handleSubmit} 
              handleSaveAsDraft={handleSaveAsDraft} 
            />
          </form>
        </Form>
      </div>
    } />
  );
};

export default InspectionForm;

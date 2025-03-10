
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import StatusButtons from '@/components/inspection/StatusButtons';
import { CheckCircle2, XCircle, HelpCircle, Camera } from 'lucide-react';
import FailureNotes from '@/components/inspection/FailureNotes';
import FailurePhotoUpload from '@/components/inspection/FailurePhotoUpload';

interface InspectionItemProps {
  item: any;
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const InspectionItem: React.FC<InspectionItemProps> = ({ item, index, form, readOnly = false }) => {
  // Get the current status from the form
  const status = form.watch(`inspectionItems.${index}.status`);
  
  const getBgColor = () => {
    switch (status) {
      case 'Pass':
        return 'bg-green-50 border-green-200';
      case 'Fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'Fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`border rounded-md p-4 ${getBgColor()} transition-colors`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-2">
          <div className="mt-1">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </div>
        
        <div className="flex items-center">
          {!readOnly && (
            <StatusButtons itemId={item.id} index={index} form={form} readOnly={readOnly} />
          )}
        </div>
      </div>
      
      {status === 'Fail' && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <FailureNotes index={index} form={form} readOnly={readOnly} />
          <FailurePhotoUpload index={index} form={form} readOnly={readOnly} />
        </div>
      )}
    </div>
  );
};

export default InspectionItem;

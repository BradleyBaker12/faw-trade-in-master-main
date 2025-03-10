
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FailureNotes from '@/components/inspection/FailureNotes';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import FailurePhotoUpload from '@/components/inspection/FailurePhotoUpload';

interface DamagesTabContentProps {
  externalItems: any[];
  internalItems: any[];
  mechanicalItems: any[];
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const DamagesTabContent: React.FC<DamagesTabContentProps> = ({ 
  externalItems, 
  internalItems, 
  mechanicalItems,
  form,
  readOnly = false
}) => {
  const allFailedItems = [...externalItems, ...internalItems, ...mechanicalItems];
  
  if (allFailedItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-700">No damages found</h3>
        <p className="text-gray-500 mt-1">All items have passed inspection or haven't been checked yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {externalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">External Damages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {externalItems.map((item) => (
                <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-red-600 text-sm font-medium">Failed</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <FailureNotes 
                    index={item.formIndex} 
                    form={form}
                    readOnly={readOnly}
                  />
                  <div className="mt-3">
                    <FailurePhotoUpload
                      index={item.formIndex}
                      form={form}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {internalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Internal Damages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {internalItems.map((item) => (
                <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-red-600 text-sm font-medium">Failed</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <FailureNotes 
                    index={item.formIndex} 
                    form={form}
                    readOnly={readOnly}
                  />
                  <div className="mt-3">
                    <FailurePhotoUpload
                      index={item.formIndex}
                      form={form}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {mechanicalItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mechanical Damages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mechanicalItems.map((item) => (
                <div key={item.id} className="p-4 border border-red-200 bg-red-50 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="text-red-600 text-sm font-medium">Failed</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  <FailureNotes 
                    index={item.formIndex} 
                    form={form}
                    readOnly={readOnly}
                  />
                  <div className="mt-3">
                    <FailurePhotoUpload
                      index={item.formIndex}
                      form={form}
                      readOnly={readOnly}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DamagesTabContent;

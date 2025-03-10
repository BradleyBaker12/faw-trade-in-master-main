
import React from 'react';
import { FormField, FormItem, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';

interface StatusButtonsProps {
  itemId: string;
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const StatusButtons: React.FC<StatusButtonsProps> = ({ itemId, index, form, readOnly = false }) => {
  if (readOnly) {
    // In read-only mode, we just show the current status
    const currentStatus = form.watch(`inspectionItems.${index}.status`);
    
    return (
      <div className="flex items-center">
        <div className={`flex items-center space-x-1 p-2 rounded-md
          ${currentStatus === 'Pass' ? 'bg-green-100 text-green-800' : 
            currentStatus === 'Fail' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'}`}
        >
          {currentStatus === 'Pass' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : currentStatus === 'Fail' ? (
            <XCircle className="h-5 w-5" />
          ) : (
            <HelpCircle className="h-5 w-5" />
          )}
          <span className="text-sm">{currentStatus}</span>
        </div>
      </div>
    );
  }
  
  return (
    <FormField
      control={form.control}
      name={`inspectionItems.${index}.status`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value);
                // Clear notes if changing from Fail to another status
                if (value !== 'Fail' && field.value === 'Fail') {
                  form.setValue(`inspectionItems.${index}.notes`, '');
                  form.setValue(`inspectionItems.${index}.failurePhoto`, undefined);
                  form.setValue(`inspectionItems.${index}.failurePhotoUrl`, undefined);
                }
              }}
              defaultValue={field.value}
              className="flex space-x-2"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Pass" id={`${itemId}-pass`} className="sr-only" />
                <label
                  htmlFor={`${itemId}-pass`}
                  className={`flex items-center space-x-1 p-2 rounded-md cursor-pointer ${
                    field.value === 'Pass'
                      ? 'bg-green-100 text-green-800'
                      : 'hover:bg-green-50'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm">Pass</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Fail" id={`${itemId}-fail`} className="sr-only" />
                <label
                  htmlFor={`${itemId}-fail`}
                  className={`flex items-center space-x-1 p-2 rounded-md cursor-pointer ${
                    field.value === 'Fail'
                      ? 'bg-red-100 text-red-800'
                      : 'hover:bg-red-50'
                  }`}
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-sm">Fail</span>
                </label>
              </div>
              
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="Not Checked" id={`${itemId}-not-checked`} className="sr-only" />
                <label
                  htmlFor={`${itemId}-not-checked`}
                  className={`flex items-center space-x-1 p-2 rounded-md cursor-pointer ${
                    field.value === 'Not Checked'
                      ? 'bg-gray-100 text-gray-800'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span className="text-sm">Not Checked</span>
                </label>
              </div>
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default StatusButtons;

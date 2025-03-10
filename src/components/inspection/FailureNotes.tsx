
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface FailureNotesProps {
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const FailureNotes: React.FC<FailureNotesProps> = ({ index, form, readOnly = false }) => {
  return (
    <FormField
      control={form.control}
      name={`inspectionItems.${index}.notes`}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea 
              placeholder="Notes on the failure..." 
              className="min-h-[80px]"
              {...field}
              readOnly={readOnly}
              disabled={readOnly}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default FailureNotes;

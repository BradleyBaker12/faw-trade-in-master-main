
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { formSchema } from '@/utils/inspectionSchemas';
import { z } from 'zod';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ItemDetailsProps {
  item: any;
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const ItemDetails: React.FC<ItemDetailsProps> = ({ item, index, form, readOnly = false }) => {
  return (
    <div>
      <FormField
        control={form.control}
        name={`inspectionItems.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <Label htmlFor={`notes-${item.id}`}>Notes</Label>
            <FormControl>
              <Textarea 
                id={`notes-${item.id}`}
                placeholder="Add any additional notes here..." 
                className="min-h-20"
                {...field}
                disabled={readOnly}
                readOnly={readOnly}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ItemDetails;

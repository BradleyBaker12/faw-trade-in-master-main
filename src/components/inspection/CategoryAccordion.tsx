
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import InspectionItem from '@/components/inspection/InspectionItem';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';

interface CategoryAccordionProps {
  category: string;
  items: any[];
  form: UseFormReturn<z.infer<typeof formSchema>>;
  readOnly?: boolean;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ category, items, form, readOnly = false }) => {
  // Calculate stats for this category
  const totalItems = items.length;
  const passedItems = items.filter(item => item.status === 'Pass').length;
  const failedItems = items.filter(item => item.status === 'Fail').length;
  const notCheckedItems = totalItems - passedItems - failedItems;
  
  // Display a simplified category name
  const displayCategory = category.replace('External Cab - ', '')
                                  .replace('Internal Cab - ', '')
                                  .replace('External Cab Mechanical - ', '');

  return (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value={category}>
        <AccordionTrigger className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-md">
          <div className="flex justify-between items-center w-full">
            <span>{displayCategory}</span>
            <div className="flex space-x-2 text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md">Pass: {passedItems}</span>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-md">Fail: {failedItems}</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md">Not Checked: {notCheckedItems}</span>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 mt-4">
            {items.map((item) => (
              <InspectionItem
                key={item.id}
                item={item}
                index={item.formIndex}
                form={form}
                readOnly={readOnly}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CategoryAccordion;

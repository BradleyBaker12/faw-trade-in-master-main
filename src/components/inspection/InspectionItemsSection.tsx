
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { formSchema } from '@/utils/inspectionSchemas';
import { InspectionItem as InspectionItemType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CategoryAccordion from '@/components/inspection/CategoryAccordion';
import DamagesTabContent from '@/components/inspection/DamagesTabContent';

interface InspectionItemsSectionProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  groupedItems: Record<string, InspectionItemType[]>;
  allInspectionItems: InspectionItemType[];
  readOnly?: boolean;
}

const InspectionItemsSection: React.FC<InspectionItemsSectionProps> = ({ 
  form, 
  groupedItems, 
  allInspectionItems,
  readOnly = false
}) => {
  const { control, watch } = form;
  const { fields } = useFieldArray({
    control,
    name: 'inspectionItems',
  });

  // Watch for changes in inspection items to update the UI
  const currentItems = watch('inspectionItems');

  console.log("Fields from useFieldArray:", fields.length);
  console.log("All inspection items passed to component:", allInspectionItems.length);
  console.log("Current items from form:", currentItems?.length);

  // Get the items from the form or default to the provided allInspectionItems
  const items = currentItems && currentItems.length > 0 ? currentItems : 
               (fields.length > 0 ? fields : allInspectionItems);

  console.log("Items used for rendering:", items.length);

  // Group items by category
  const formGroupedItems = items.reduce((acc: Record<string, any[]>, item, index) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    // Include the form index for each item
    acc[category].push({ ...item, formIndex: index });
    return acc;
  }, {});

  // Extract unique categories for rendering tabs or sections
  const categories = Object.keys(formGroupedItems);
  
  console.log("Categories found:", categories.length);
  console.log("Available categories:", categories);

  // Categorize items by their main group
  const externalCabItems = items.filter(item => 
    item.category?.includes('External Cab') || 
    item.category?.includes('R/H VIEW') || 
    item.category?.includes('L/H VIEW') || 
    item.category?.includes('FRONT VIEW') || 
    item.category?.includes('REAR CAB')
  );
  
  const internalCabItems = items.filter(item => 
    item.category?.includes('Internal Cab') || 
    item.category?.includes('DRIVER SIDE') || 
    item.category?.includes('MIDDLE CONSOLE') || 
    item.category?.includes('PASSENGER SIDE') || 
    item.category?.includes('BUNK BED')
  );
  
  const mechanicalItems = items.filter(item => 
    item.category?.includes('ENGINE') || 
    item.category?.includes('COOLING') || 
    item.category?.includes('GEARBOX') || 
    item.category?.includes('AXLE') || 
    item.category?.includes('STEERING') || 
    item.category?.includes('PROPSHAFT') ||
    item.category?.includes('5TH WHEEL')
  );

  // Get failed items for each category
  const failedExternalItems = externalCabItems
    .filter(item => item.status === 'Fail')
    .map((item, idx) => ({ ...item, formIndex: items.findIndex(i => i.id === item.id) }));
  
  const failedInternalItems = internalCabItems
    .filter(item => item.status === 'Fail')
    .map((item, idx) => ({ ...item, formIndex: items.findIndex(i => i.id === item.id) }));
  
  const failedMechanicalItems = mechanicalItems
    .filter(item => item.status === 'Fail')
    .map((item, idx) => ({ ...item, formIndex: items.findIndex(i => i.id === item.id) }));

  // Log failed items for debugging
  console.log("Failed external items:", failedExternalItems.length);
  console.log("Failed internal items:", failedInternalItems.length);
  console.log("Failed mechanical items:", failedMechanicalItems.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Checklist</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="external" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="external" className="flex-1">External Cab</TabsTrigger>
            <TabsTrigger value="internal" className="flex-1">Internal Cab</TabsTrigger>
            <TabsTrigger value="mechanical" className="flex-1">External Mechanical</TabsTrigger>
            <TabsTrigger value="damages" className="flex-1">Damages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="external">
            {Object.entries(formGroupedItems)
              .filter(([category]) => 
                category.includes('External Cab') || 
                category.includes('R/H VIEW') || 
                category.includes('L/H VIEW') || 
                category.includes('FRONT VIEW') || 
                category.includes('REAR CAB')
              )
              .map(([category, items]) => (
                <CategoryAccordion 
                  key={category} 
                  category={category} 
                  items={items} 
                  form={form}
                  readOnly={readOnly}
                />
              ))}
          </TabsContent>
          
          <TabsContent value="internal">
            {Object.entries(formGroupedItems)
              .filter(([category]) => 
                category.includes('Internal Cab') || 
                category.includes('DRIVER SIDE') || 
                category.includes('MIDDLE CONSOLE') || 
                category.includes('PASSENGER SIDE') || 
                category.includes('BUNK BED')
              )
              .map(([category, items]) => (
                <CategoryAccordion 
                  key={category} 
                  category={category} 
                  items={items} 
                  form={form}
                  readOnly={readOnly}
                />
              ))}
          </TabsContent>
          
          <TabsContent value="mechanical">
            {Object.entries(formGroupedItems)
              .filter(([category]) => 
                category.includes('ENGINE') || 
                category.includes('COOLING') || 
                category.includes('GEARBOX') || 
                category.includes('AXLE') || 
                category.includes('STEERING') || 
                category.includes('PROPSHAFT') ||
                category.includes('5TH WHEEL')
              )
              .map(([category, items]) => (
                <CategoryAccordion 
                  key={category} 
                  category={category} 
                  items={items} 
                  form={form}
                  readOnly={readOnly}
                />
              ))}
          </TabsContent>
          
          <TabsContent value="damages">
            <DamagesTabContent 
              externalItems={failedExternalItems} 
              internalItems={failedInternalItems} 
              mechanicalItems={failedMechanicalItems}
              form={form}
              readOnly={readOnly}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InspectionItemsSection;

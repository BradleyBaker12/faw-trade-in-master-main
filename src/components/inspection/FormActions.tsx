
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Send } from 'lucide-react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type FormActionsProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>;
  handleSubmit: (values: z.infer<typeof formSchema>) => void;
  handleSaveAsDraft: () => void;
};

const FormActions: React.FC<FormActionsProps> = ({ form, handleSubmit, handleSaveAsDraft }) => {
  const navigate = useNavigate();
  const watchedItems = useWatch({
    control: form.control,
    name: "inspectionItems",
  });
  
  const uncheckedItemsCount = watchedItems?.filter(item => item.status === "Not Checked").length || 0;
  const isComplete = uncheckedItemsCount === 0;

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate('/trade-ins')}
      >
        Cancel
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleSaveAsDraft}
      >
        <Save className="mr-2 h-4 w-4" />
        Save Draft
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button 
                type="button" 
                onClick={form.handleSubmit(handleSubmit)}
                disabled={!isComplete}
              >
                <Send className="mr-2 h-4 w-4" />
                Submit Inspection
              </Button>
            </span>
          </TooltipTrigger>
          {!isComplete && (
            <TooltipContent>
              <p>Complete all {uncheckedItemsCount} remaining inspection items before submitting</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default FormActions;

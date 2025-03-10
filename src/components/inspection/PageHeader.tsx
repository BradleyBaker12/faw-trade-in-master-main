
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { formSchema } from '@/utils/inspectionSchemas';

type PageHeaderProps = {
  isNewInspection: boolean;
  id?: string;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  handleSubmit: (values: z.infer<typeof formSchema>) => void;
  handleSaveAsDraft: () => void;
};

const PageHeader: React.FC<PageHeaderProps> = ({ 
  isNewInspection, 
  id,
  form,
  handleSubmit,
  handleSaveAsDraft
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isNewInspection ? "New Inspection" : "Edit Inspection"}
          </h1>
          <p className="text-muted-foreground">
            {isNewInspection 
              ? "Create a new vehicle inspection report" 
              : `Editing inspection for trade request #${id?.slice(0, 8)}`}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleSaveAsDraft}>
          <Save className="mr-2 h-4 w-4" /> Save Draft
        </Button>
        <Button onClick={form.handleSubmit(handleSubmit)}>
          <Send className="mr-2 h-4 w-4" /> Submit
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;

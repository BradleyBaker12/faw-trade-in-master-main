
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface InspectionStatusToggleProps {
  itemId: string;
  currentStatus: 'Pass' | 'Fail' | 'Not Checked';
  onStatusChange: (itemId: string, newStatus: 'Pass' | 'Fail' | 'Not Checked') => void;
}

const InspectionStatusToggle: React.FC<InspectionStatusToggleProps> = ({
  itemId,
  currentStatus,
  onStatusChange
}) => {
  return (
    <div className="flex space-x-1">
      <Button
        type="button"
        size="sm"
        variant={currentStatus === 'Pass' ? 'default' : 'outline'}
        className={
          currentStatus === 'Pass' 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'text-green-500 hover:text-green-600'
        }
        onClick={() => onStatusChange(itemId, 'Pass')}
      >
        <CheckCircle2 className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant={currentStatus === 'Fail' ? 'default' : 'outline'}
        className={
          currentStatus === 'Fail' 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'text-red-500 hover:text-red-600'
        }
        onClick={() => onStatusChange(itemId, 'Fail')}
      >
        <XCircle className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant={currentStatus === 'Not Checked' ? 'default' : 'outline'}
        className={
          currentStatus === 'Not Checked' 
            ? 'bg-gray-500 hover:bg-gray-600' 
            : 'text-gray-500 hover:text-gray-600'
        }
        onClick={() => onStatusChange(itemId, 'Not Checked')}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default InspectionStatusToggle;

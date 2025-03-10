
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface InspectionStatusAlertProps {
  uncompletedItems: number;
}

const InspectionStatusAlert: React.FC<InspectionStatusAlertProps> = ({ uncompletedItems }) => {
  if (uncompletedItems === 0) return null;

  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Inspection Incomplete</AlertTitle>
      <AlertDescription>
        {uncompletedItems} item{uncompletedItems !== 1 ? 's' : ''} not checked. All items must be completed before submitting.
      </AlertDescription>
    </Alert>
  );
};

export default InspectionStatusAlert;


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { clearTradeRequests } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const ClearDataButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleClearData = async () => {
    try {
      // Clear trade requests using the API
      await clearTradeRequests();
      
      // Additionally clear other potential localStorage items
      localStorage.removeItem('dealers');
      localStorage.removeItem('inspections');
      
      // Show success toast
      toast({
        title: "Data Cleared",
        description: "All application data has been removed successfully.",
        variant: "default"
      });
      
      // Navigate to home and force a page refresh to ensure a clean slate
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error("Error clearing data:", error);
      toast({
        title: "Error",
        description: "Failed to clear application data.",
        variant: "destructive"
      });
    } finally {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Reset Application
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all application data including trade requests, dealers, and inspections. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearData}>
              Yes, reset everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ClearDataButton;

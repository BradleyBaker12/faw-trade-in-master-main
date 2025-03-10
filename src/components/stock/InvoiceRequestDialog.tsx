import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TradeRequest, 
  InvoiceStatus
} from '@/types';
import { updateInvoiceStatus } from '@/services/api';
import { 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Upload, 
  Clock, 
  FileCheck, 
  FileX, 
  AlertTriangle,
  Download 
} from 'lucide-react';

interface InvoiceRequestDialogProps {
  vehicle: TradeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onRefetch: () => void;
}

const InvoiceRequestDialog: React.FC<InvoiceRequestDialogProps> = ({ 
  vehicle, 
  isOpen, 
  onClose, 
  onRefetch 
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [invoiceDocumentUrl, setInvoiceDocumentUrl] = useState('');
  const [activeTab, setActiveTab] = useState<string>('request');
  const { toast } = useToast();
  
  useEffect(() => {
    if (vehicle) {
      if (vehicle.invoiceDetails) {
        setInvoiceNumber(vehicle.invoiceDetails.invoiceNumber || '');
        setInvoiceAmount(vehicle.invoiceDetails.amount?.toString() || '');
        setPaymentReference(vehicle.invoiceDetails.paymentReference || '');
        setPaymentProofUrl(vehicle.invoiceDetails.paymentProofUrl || '');
        setInvoiceDocumentUrl(vehicle.invoiceDetails.invoiceDocumentUrl || '');
      }
      
      if (!vehicle.invoiceStatus) {
        setActiveTab('request');
      } else if (vehicle.invoiceStatus === 'requested') {
        setActiveTab('invoice');
      } else if (vehicle.invoiceStatus === 'invoiceReceived') {
        setActiveTab('payment');
      } else if (vehicle.invoiceStatus === 'paid') {
        setActiveTab('documents');
      } else {
        setActiveTab('complete');
      }
    }
  }, [vehicle]);
  
  const handleRequestInvoice = async () => {
    if (!vehicle) return;
    
    try {
      if (!invoiceNumber || !invoiceAmount) {
        toast({
          title: "Missing Information",
          description: "Please provide both invoice number and amount.",
          variant: "destructive"
        });
        return;
      }
      
      const amount = parseFloat(invoiceAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid invoice amount.",
          variant: "destructive"
        });
        return;
      }
      
      await updateInvoiceStatus(vehicle.id, InvoiceStatus.REQUESTED, {
        requestedAt: new Date(),
        requestedBy: "Current User", // In a real app, get from auth context
        invoiceNumber,
        amount
      });
      
      onRefetch();
      setActiveTab('invoice');
      
      toast({
        title: "Invoice Requested",
        description: `Invoice request submitted successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Invoice request error:", error);
      toast({
        title: "Request Failed",
        description: "There was an error requesting the invoice. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleInvoiceReceived = async () => {
    if (!vehicle) return;
    
    try {
      if (!invoiceDocumentUrl) {
        toast({
          title: "Missing Information",
          description: "Please provide the invoice document URL.",
          variant: "destructive"
        });
        return;
      }
      
      await updateInvoiceStatus(vehicle.id, InvoiceStatus.INVOICE_RECEIVED, {
        invoiceReceivedAt: new Date(),
        invoiceDocumentUrl
      });
      
      onRefetch();
      setActiveTab('payment');
      
      toast({
        title: "Invoice Received",
        description: `Invoice document uploaded successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Invoice upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading the invoice. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePaymentUpload = async () => {
    if (!vehicle) return;
    
    try {
      if (!paymentReference || !paymentProofUrl) {
        toast({
          title: "Missing Information",
          description: "Please provide both payment reference and proof of payment URL.",
          variant: "destructive"
        });
        return;
      }
      
      await updateInvoiceStatus(vehicle.id, InvoiceStatus.PAID, {
        paidAt: new Date(),
        paymentReference,
        paymentProofUrl
      });
      
      onRefetch();
      setActiveTab('documents');
      
      toast({
        title: "Payment Recorded",
        description: `Payment details recorded successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Payment upload error:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error recording the payment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDocumentsReceived = async () => {
    if (!vehicle) return;
    
    try {
      await updateInvoiceStatus(vehicle.id, InvoiceStatus.COMPLETED, {
        documentsReceivedAt: new Date()
      });
      
      onRefetch();
      onClose();
      
      toast({
        title: "Process Complete",
        description: `Documents received and process completed.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Documents confirmation error:", error);
      toast({
        title: "Confirmation Failed",
        description: "There was an error confirming receipt of documents. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  if (!vehicle) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            {!vehicle.invoiceStatus ? 'Request Invoice' : 
             vehicle.invoiceStatus === 'requested' ? 'Upload Invoice' :
             vehicle.invoiceStatus === 'invoiceReceived' ? 'Upload Payment' :
             vehicle.invoiceStatus === 'paid' ? 'Confirm Documents' : 'Process Complete'}
          </DialogTitle>
          <DialogDescription>
            {vehicle.vehicleInfo.make} {vehicle.vehicleInfo.model} ({vehicle.vehicleInfo.year})
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="request" disabled={vehicle.invoiceStatus && vehicle.invoiceStatus !== 'requested'}>
              Request
            </TabsTrigger>
            <TabsTrigger value="invoice" disabled={!vehicle.invoiceStatus || vehicle.invoiceStatus === 'completed'}>
              Invoice
            </TabsTrigger>
            <TabsTrigger value="payment" disabled={!vehicle.invoiceStatus || vehicle.invoiceStatus === 'requested' || vehicle.invoiceStatus === 'completed'}>
              Payment
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={!vehicle.invoiceStatus || ['requested', 'invoiceReceived'].includes(vehicle.invoiceStatus || '') || vehicle.invoiceStatus === 'completed'}>
              Docs
            </TabsTrigger>
            <TabsTrigger value="complete" disabled={vehicle.invoiceStatus !== 'completed'}>
              Done
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="request" className="mt-4 space-y-4">
            {vehicle.invoiceStatus === 'requested' ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Invoice Requested</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice #{vehicle.invoiceDetails?.invoiceNumber} was requested on {vehicle.invoiceDetails?.requestedAt && new Date(vehicle.invoiceDetails.requestedAt).toLocaleDateString()}.
                </p>
                <p className="text-base font-medium mt-2">
                  Amount: R{vehicle.invoiceDetails?.amount?.toLocaleString()}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input 
                      id="invoiceNumber" 
                      value={invoiceNumber} 
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Enter FAW invoice number" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="invoiceAmount">Invoice Amount (R)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-muted-foreground">R</span>
                      <Input 
                        id="invoiceAmount" 
                        type="number" 
                        value={invoiceAmount} 
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        className="pl-8"
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleRequestInvoice} 
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Request Invoice
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="invoice" className="mt-4 space-y-4">
            {vehicle.invoiceStatus === 'invoiceReceived' || vehicle.invoiceStatus === 'paid' || vehicle.invoiceStatus === 'completed' ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Invoice Received</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Invoice document for #{vehicle.invoiceDetails?.invoiceNumber} was received on {vehicle.invoiceDetails?.invoiceReceivedAt && new Date(vehicle.invoiceDetails.invoiceReceivedAt).toLocaleDateString()}.
                </p>
                {vehicle.invoiceDetails?.invoiceDocumentUrl && (
                  <Button 
                    variant="outline" 
                    className="mt-3"
                    onClick={() => window.open(vehicle.invoiceDetails?.invoiceDocumentUrl, '_blank')}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    View Invoice
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-2">
                  <div className="flex gap-2">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Invoice Requested</h4>
                      <p className="text-sm text-blue-700">
                        Invoice has been requested. Please upload the invoice document once received from FAW.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="invoiceDocumentUrl">Invoice Document URL</Label>
                    <Input 
                      id="invoiceDocumentUrl" 
                      value={invoiceDocumentUrl} 
                      onChange={(e) => setInvoiceDocumentUrl(e.target.value)}
                      placeholder="Link to invoice document" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      In a real app, this would be a file upload component
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handleInvoiceReceived} 
                  className="w-full"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Confirm Invoice Received
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="payment" className="mt-4 space-y-4">
            {vehicle.invoiceStatus === 'paid' || vehicle.invoiceStatus === 'completed' ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Payment Confirmed</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Payment for invoice #{vehicle.invoiceDetails?.invoiceNumber} was recorded on {vehicle.invoiceDetails?.paidAt && new Date(vehicle.invoiceDetails.paidAt).toLocaleDateString()}.
                </p>
                <p className="text-base font-medium mt-2">
                  Reference: {vehicle.invoiceDetails?.paymentReference}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-amber-50 p-3 rounded border border-amber-200 mb-2">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800">Important</h4>
                      <p className="text-sm text-amber-700">
                        Please make payment to FAW's bank account and upload the proof of payment here.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="paymentReference">Payment Reference</Label>
                    <Input 
                      id="paymentReference" 
                      value={paymentReference} 
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Enter payment reference" 
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="paymentProofUrl">Proof of Payment URL</Label>
                    <Input 
                      id="paymentProofUrl" 
                      value={paymentProofUrl} 
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      placeholder="Link to proof of payment" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      In a real app, this would be a file upload component
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={handlePaymentUpload} 
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Confirm Payment Made
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4 space-y-4">
            {vehicle.invoiceStatus === 'completed' ? (
              <div className="text-center py-4">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Documents Received</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Documents for invoice #{vehicle.invoiceDetails?.invoiceNumber} were received on {vehicle.invoiceDetails?.documentsReceivedAt && new Date(vehicle.invoiceDetails.documentsReceivedAt).toLocaleDateString()}.
                </p>
                <p className="text-base font-medium mt-2">
                  Process is now complete.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-2">
                  <div className="flex gap-2">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Waiting for Documents</h4>
                      <p className="text-sm text-blue-700">
                        Payment has been confirmed. FAW is now processing the documents.
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Click the button below when you receive the ownership documents.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDocumentsReceived} 
                  className="w-full"
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Confirm Documents Received
                </Button>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="complete" className="mt-4 space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-lg font-medium">Process Complete</h3>
              <p className="text-sm text-muted-foreground mt-1">
                All steps have been completed for this vehicle sale:
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Invoice requested ({vehicle.invoiceDetails?.requestedAt && new Date(vehicle.invoiceDetails.requestedAt).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Invoice received ({vehicle.invoiceDetails?.invoiceReceivedAt && new Date(vehicle.invoiceDetails.invoiceReceivedAt).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Payment made ({vehicle.invoiceDetails?.paidAt && new Date(vehicle.invoiceDetails.paidAt).toLocaleDateString()})</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Documents received ({vehicle.invoiceDetails?.documentsReceivedAt && new Date(vehicle.invoiceDetails.documentsReceivedAt).toLocaleDateString()})</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceRequestDialog;


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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TradeRequest, 
  InspectionStatus, 
  Dealer,
  SaleType
} from '@/types';
import { updateTradeRequest } from '@/services/api';
import { 
  Tag, 
  Store, 
  PackageCheck, 
  X, 
  Check,
  ExternalLink,
  RefreshCcw,
  Trash2
} from 'lucide-react';

interface VehicleDetailsDialogProps {
  vehicle: TradeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  dealers: Dealer[];
  onRefetch: () => void;
}

const VehicleDetailsDialog = ({ 
  vehicle, 
  isOpen, 
  onClose, 
  dealers, 
  onRefetch 
}: VehicleDetailsDialogProps) => {
  const [sellingPrice, setSellingPrice] = useState<string>('');
  const [saleType, setSaleType] = useState<SaleType>(SaleType.DEALER_SALE);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');
  const [isPriceEditing, setIsPriceEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('details');
  const { toast } = useToast();

  useEffect(() => {
    if (vehicle) {
      setSellingPrice(vehicle.sellingPrice ? vehicle.sellingPrice.toString() : '');
      setSaleType(vehicle.saleType || SaleType.DEALER_SALE);
      // Reset tab to details when opening a new vehicle
      setActiveTab('details');
    }
  }, [vehicle]);

  const handleUpdatePrice = async () => {
    if (!vehicle) return;

    try {
      const updateData: Partial<TradeRequest> = {
        saleType
      };
      
      if (saleType === SaleType.DEALER_SALE) {
        const price = parseFloat(sellingPrice);
        
        if (isNaN(price) || price <= 0) {
          toast({
            title: "Invalid Price",
            description: "Please enter a valid price greater than zero.",
            variant: "destructive"
          });
          return;
        }
        
        updateData.sellingPrice = price;
      } else {
        updateData.sellingPrice = undefined;
      }

      await updateTradeRequest(vehicle.id, updateData);

      setIsPriceEditing(false);
      onRefetch();
      
      toast({
        title: "Details Updated",
        description: saleType === SaleType.DEALER_SALE 
          ? `Selling price updated to R${parseFloat(sellingPrice).toLocaleString()}.`
          : "Updated to CTP sale type.",
        variant: "default"
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating the details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleConsignment = async () => {
    if (!vehicle || !selectedDealerId) {
      toast({
        title: "Error",
        description: "Please select a dealer for consignment",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedDealer = dealers.find(dealer => dealer.id === selectedDealerId);
      
      if (!selectedDealer) {
        throw new Error("Selected dealer not found");
      }

      await updateTradeRequest(vehicle.id, {
        inspection: {
          ...vehicle.inspection,
          status: InspectionStatus.CONSIGNED,
          consignedDealerId: selectedDealerId,
          consignedDealerName: selectedDealer.name,
          consignedAt: new Date()
        }
      });

      onRefetch();
      setActiveTab('details');
      
      toast({
        title: "Vehicle Consigned",
        description: `${vehicle.vehicleInfo.make} ${vehicle.vehicleInfo.model} has been consigned to ${selectedDealer.name}.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Consignment error:", error);
      toast({
        title: "Consignment Failed",
        description: "There was an error consigning the vehicle. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveConsignment = async () => {
    if (!vehicle) return;

    try {
      await updateTradeRequest(vehicle.id, {
        inspection: {
          ...vehicle.inspection,
          status: InspectionStatus.READY_FOR_SALE,
          consignedDealerId: undefined,
          consignedDealerName: undefined,
          consignedAt: undefined
        }
      });

      onRefetch();
      
      toast({
        title: "Consignment Removed",
        description: `${vehicle.vehicleInfo.make} ${vehicle.vehicleInfo.model} is no longer consigned and is ready for sale.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Remove consignment error:", error);
      toast({
        title: "Operation Failed",
        description: "There was an error removing the consignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleChangeConsignment = async () => {
    if (!vehicle || !selectedDealerId) {
      toast({
        title: "Error",
        description: "Please select a dealer to change the consignment",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedDealer = dealers.find(dealer => dealer.id === selectedDealerId);
      
      if (!selectedDealer) {
        throw new Error("Selected dealer not found");
      }

      await updateTradeRequest(vehicle.id, {
        inspection: {
          ...vehicle.inspection,
          consignedDealerId: selectedDealerId,
          consignedDealerName: selectedDealer.name,
          consignedAt: new Date()
        }
      });

      onRefetch();
      
      toast({
        title: "Consignment Changed",
        description: `${vehicle.vehicleInfo.make} ${vehicle.vehicleInfo.model} is now consigned to ${selectedDealer.name}.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Change consignment error:", error);
      toast({
        title: "Operation Failed",
        description: "There was an error changing the consignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePushToCTP = async () => {
    if (!vehicle) return;

    try {
      await updateTradeRequest(vehicle.id, {
        saleType: SaleType.CTP_LIVE,
        sellingPrice: undefined
      });

      onRefetch();
      setActiveTab('details');
      
      toast({
        title: "Pushed to CTP",
        description: `${vehicle.vehicleInfo.make} ${vehicle.vehicleInfo.model} has been pushed live to CTP.`,
        variant: "default"
      });
    } catch (error) {
      console.error("CTP push error:", error);
      toast({
        title: "CTP Push Failed",
        description: "There was an error pushing the vehicle to CTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {vehicle.vehicleInfo.make} {vehicle.vehicleInfo.model} ({vehicle.vehicleInfo.year})
          </DialogTitle>
          <DialogDescription>
            Vehicle details and selling information
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="details">Vehicle Details</TabsTrigger>
            <TabsTrigger value="consignment">Dealer Consignment</TabsTrigger>
            <TabsTrigger value="ctp">CTP Integration</TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Vehicle Information</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-muted-foreground">VIN</Label>
                    <p className="font-medium text-sm">{vehicle.vehicleInfo.vin}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Registration</Label>
                    <p className="font-medium">{vehicle.vehicleInfo.regNumber || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-muted-foreground">Color</Label>
                    <p className="font-medium">{vehicle.vehicleInfo.color}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Mileage</Label>
                    <p className="font-medium">{vehicle.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-muted-foreground">Source</Label>
                  <p className="font-medium">{vehicle.tradeType}</p>
                </div>
                
                {vehicle.vehicleInfo.engineHours && (
                  <div>
                    <Label className="text-muted-foreground">Engine Hours</Label>
                    <p className="font-medium">{vehicle.vehicleInfo.engineHours}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Selling Information</h3>
                
                <div className="space-y-2 pb-2">
                  <Label htmlFor="price" className="flex items-center gap-1">
                    <Tag className="h-4 w-4" /> Selling Details
                  </Label>
                  {isPriceEditing ? (
                    <div className="flex flex-col space-y-2">
                      <div className="space-y-2">
                        <Label>Sale Type</Label>
                        <Select 
                          value={saleType} 
                          onValueChange={(value) => setSaleType(value as SaleType)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sale type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={SaleType.DEALER_SALE}>Dealer Sale</SelectItem>
                            <SelectItem value={SaleType.CTP}>CTP</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {saleType === SaleType.DEALER_SALE && (
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-muted-foreground">R</span>
                          <Input
                            id="price"
                            type="number"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(e.target.value)}
                            className="pl-8"
                            placeholder="Enter selling price"
                          />
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-1">
                        <Button size="sm" onClick={handleUpdatePrice}>
                          <Check className="mr-1 h-4 w-4" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setIsPriceEditing(false)}>
                          <X className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="text-xl font-bold">
                        {vehicle.saleType === SaleType.CTP || vehicle.saleType === SaleType.CTP_LIVE ? (
                          vehicle.saleType === SaleType.CTP_LIVE ? 'CTP Live' : 'CTP'
                        ) : (
                          vehicle.sellingPrice 
                            ? `R${vehicle.sellingPrice.toLocaleString()}`
                            : 'Not set'
                        )}
                      </div>
                      {vehicle.saleType && (
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {vehicle.saleType}
                        </span>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setIsPriceEditing(true)}>
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                
                {vehicle.inspection.status === InspectionStatus.CONSIGNED && (
                  <div className="border rounded-md p-3 bg-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label className="text-muted-foreground">Consigned To</Label>
                        <p className="font-medium">{vehicle.inspection.consignedDealerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.inspection.consignedAt && new Date(vehicle.inspection.consignedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setActiveTab('consignment')}
                        className="text-blue-600"
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Consignment Tab */}
          <TabsContent value="consignment" className="mt-4">
            {vehicle.inspection.status === InspectionStatus.CONSIGNED ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Current Consignment</h3>
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200 mb-4">
                    <p className="text-blue-800">
                      This vehicle is currently consigned to <strong>{vehicle.inspection.consignedDealerName}</strong> since {new Date(vehicle.inspection.consignedAt!).toLocaleDateString()}.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col space-y-4">
                    <Button 
                      variant="destructive" 
                      onClick={handleRemoveConsignment}
                      className="flex items-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove Consignment
                    </Button>
                    
                    <div className="border-t pt-4 mt-2">
                      <h4 className="font-medium mb-2">Change Dealer Consignment</h4>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Store className="h-4 w-4" /> Select New Dealer
                        </Label>
                        <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a dealer" />
                          </SelectTrigger>
                          <SelectContent>
                            {dealers
                              .filter(dealer => dealer.status === 'Active' && dealer.id !== vehicle.inspection.consignedDealerId)
                              .map((dealer) => (
                                <SelectItem key={dealer.id} value={dealer.id}>
                                  {dealer.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={handleChangeConsignment} 
                        disabled={!selectedDealerId}
                        className="w-full mt-4"
                      >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Change Consignment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Consign to Dealer</h3>
                  <p className="text-muted-foreground mb-4">
                    Assign this vehicle to a dealer for sale through their network.
                  </p>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Store className="h-4 w-4" /> Select Dealer
                    </Label>
                    <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a dealer" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealers
                          .filter(dealer => dealer.status === 'Active')
                          .map((dealer) => (
                            <SelectItem key={dealer.id} value={dealer.id}>
                              {dealer.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleConsignment} 
                    disabled={!selectedDealerId}
                    className="w-full"
                  >
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Confirm Consignment
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* CTP Tab */}
          <TabsContent value="ctp" className="mt-4">
            {vehicle.saleType === SaleType.CTP_LIVE ? (
              <div className="text-center py-6">
                <ExternalLink className="h-12 w-12 mx-auto text-green-500 mb-2" />
                <h3 className="text-lg font-medium">Already Live on CTP</h3>
                <p className="text-muted-foreground">
                  This vehicle has been pushed to the CTP platform and is currently live.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg mb-2">Push to CTP</h3>
                  <p className="text-muted-foreground mb-4">
                    Make this vehicle available on the CTP third-party platform for wider exposure.
                  </p>
                </div>
                
                <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-4">
                  <h4 className="font-medium text-amber-800">Important Note</h4>
                  <p className="text-sm text-amber-700">
                    Pushing this vehicle to CTP will make it visible to all CTP partners. Once pushed, 
                    the vehicle details cannot be modified without removing it from CTP first.
                  </p>
                </div>
                
                <Button 
                  onClick={handlePushToCTP} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Push Live to CTP
                </Button>
              </div>
            )}
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

export default VehicleDetailsDialog;

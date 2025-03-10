import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTradeRequests, getDealers } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InspectionStatus, TradeRequest, SaleType } from '@/types';
import PageTransition from '@/components/layout/PageTransition';
import { Package, Search, Eye, FileText, CreditCard, Upload, CheckCircle2, Download } from 'lucide-react';
import VehicleDetailsDialog from '@/components/stock/VehicleDetailsDialog';
import InvoiceRequestDialog from '@/components/stock/InvoiceRequestDialog';

const Stock = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<TradeRequest | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { data: tradeRequests = [], isLoading: isLoadingStock, refetch: refetchStock } = useQuery({
    queryKey: ['tradeRequests'],
    queryFn: getTradeRequests
  });

  const { data: dealers = [], isLoading: isLoadingDealers } = useQuery({
    queryKey: ['dealers'],
    queryFn: getDealers
  });

  const stockItems = tradeRequests.filter(
    request => request.inspection.status === InspectionStatus.READY_FOR_SALE || 
               request.inspection.status === InspectionStatus.CONSIGNED
  );

  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = !searchTerm || 
      item.vehicleInfo.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleInfo.vin.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'unassigned':
        return item.inspection.status === InspectionStatus.READY_FOR_SALE && 
               item.saleType !== SaleType.CTP && 
               item.saleType !== SaleType.CTP_LIVE;
      case 'consigned':
        return item.inspection.status === InspectionStatus.CONSIGNED;
      case 'ctp':
        return item.saleType === SaleType.CTP || item.saleType === SaleType.CTP_LIVE;
      case 'invoiceRequested':
        return item.invoiceStatus === 'requested' || item.invoiceStatus === 'invoiceReceived';
      case 'invoicePaid':
        return item.invoiceStatus === 'paid';
      case 'completed':
        return item.invoiceStatus === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  const handleViewDetails = (vehicle: TradeRequest) => {
    setSelectedVehicle(vehicle);
    setDetailsDialogOpen(true);
  };

  const handleRequestInvoice = (vehicle: TradeRequest) => {
    setSelectedVehicle(vehicle);
    setInvoiceDialogOpen(true);
  };

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'unassigned':
        return stockItems.filter(item => 
          item.inspection.status === InspectionStatus.READY_FOR_SALE && 
          item.saleType !== SaleType.CTP && 
          item.saleType !== SaleType.CTP_LIVE
        ).length;
      case 'consigned':
        return stockItems.filter(item => item.inspection.status === InspectionStatus.CONSIGNED).length;
      case 'ctp':
        return stockItems.filter(item => 
          item.saleType === SaleType.CTP || 
          item.saleType === SaleType.CTP_LIVE
        ).length;
      case 'invoiceRequested':
        return stockItems.filter(item => 
          item.invoiceStatus === 'requested' || 
          item.invoiceStatus === 'invoiceReceived'
        ).length;
      case 'invoicePaid':
        return stockItems.filter(item => item.invoiceStatus === 'paid').length;
      case 'completed':
        return stockItems.filter(item => item.invoiceStatus === 'completed').length;
      case 'all':
      default:
        return stockItems.length;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Vehicle Stock Management</h1>
            <p className="text-muted-foreground">Manage ready-for-sale vehicles and consignments</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-7 mb-6">
            <TabsTrigger value="all" className="flex justify-between">
              <span>All</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('all')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="unassigned" className="flex justify-between">
              <span>Unassigned</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('unassigned')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="consigned" className="flex justify-between">
              <span>Consigned</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('consigned')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="ctp" className="flex justify-between">
              <span>CTP</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('ctp')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="invoiceRequested" className="flex justify-between">
              <span>Invoice Requested</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('invoiceRequested')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="invoicePaid" className="flex justify-between">
              <span>Invoice Paid</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('invoicePaid')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex justify-between">
              <span>Completed</span>
              <Badge variant="secondary" className="ml-2">{getTabCount('completed')}</Badge>
            </TabsTrigger>
          </TabsList>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by make, model, or VIN..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {isLoadingStock ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
              </div>
            ) : filteredStockItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No vehicles found</h3>
                <p className="mt-2 text-muted-foreground">
                  {activeTab === 'all' 
                    ? 'There are currently no vehicles in stock.' 
                    : `No vehicles found in the selected category.`}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStockItems.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">
                          {item.vehicleInfo.make} {item.vehicleInfo.model} ({item.vehicleInfo.year})
                        </CardTitle>
                        {item.inspection.status === InspectionStatus.CONSIGNED ? (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Consigned to {item.inspection.consignedDealerName}
                          </Badge>
                        ) : item.saleType === SaleType.CTP_LIVE ? (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800">
                            CTP Live
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                            Ready for Sale
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">VIN</p>
                            <p className="font-medium text-xs">{item.vehicleInfo.vin || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Source</p>
                            <p className="font-medium">{item.tradeType}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Color</p>
                            <p className="font-medium">{item.vehicleInfo.color || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Mileage</p>
                            <p className="font-medium">{item.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center">
                            {item.saleType === SaleType.CTP || item.saleType === SaleType.CTP_LIVE ? (
                              <span className="font-semibold">
                                {item.saleType === SaleType.CTP_LIVE ? 'CTP Live' : 'CTP'}
                              </span>
                            ) : (
                              <>
                                <span className="text-gray-500 mr-1">R</span>
                                <span className="font-semibold">
                                  {item.sellingPrice 
                                    ? item.sellingPrice.toLocaleString() 
                                    : 'Price not set'}
                                </span>
                              </>
                            )}
                          </div>
                          {item.saleType && (
                            <Badge variant="outline">
                              {item.saleType}
                            </Badge>
                          )}
                        </div>
                        
                        {item.invoiceStatus && (
                          <div className="flex items-center gap-1 text-sm mt-1">
                            {item.invoiceStatus === 'requested' && (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800">
                                <FileText className="h-3 w-3 mr-1" />
                                Invoice Requested
                              </Badge>
                            )}
                            {item.invoiceStatus === 'invoiceReceived' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                <Download className="h-3 w-3 mr-1" />
                                Invoice Received
                              </Badge>
                            )}
                            {item.invoiceStatus === 'paid' && (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                <CreditCard className="h-3 w-3 mr-1" />
                                Invoice Paid
                              </Badge>
                            )}
                            {item.invoiceStatus === 'completed' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Documents Received
                              </Badge>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-between pt-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleRequestInvoice(item)}
                            disabled={item.invoiceStatus === 'completed'}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            {!item.invoiceStatus ? 'Request Invoice' : 
                             item.invoiceStatus === 'requested' ? 'Upload Invoice' :
                             item.invoiceStatus === 'invoiceReceived' ? 'Upload Payment' :
                             item.invoiceStatus === 'paid' ? 'View Status' : 'Complete'}
                          </Button>
                          <Button variant="outline" onClick={() => handleViewDetails(item)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <VehicleDetailsDialog
        vehicle={selectedVehicle}
        isOpen={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        dealers={dealers}
        onRefetch={refetchStock}
      />

      <InvoiceRequestDialog
        vehicle={selectedVehicle}
        isOpen={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
        onRefetch={refetchStock}
      />
    </PageTransition>
  );
};

export default Stock;

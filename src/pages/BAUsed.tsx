
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, ClipboardCheck, CarFront, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Inspection, InspectionStatus, TradeRequest } from '@/types';
import PageTransition from '@/components/layout/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { getTradeRequests } from '@/services/api';

const BAUsed = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('awaiting-reception');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch trade requests instead of just inspections
  const { data: tradeRequests = [], isLoading } = useQuery({
    queryKey: ['tradeRequests'],
    queryFn: getTradeRequests
  });

  // Filter trade requests based on their inspection status and the current filter
  const getFilteredRequests = () => {
    const filteredBySearch = tradeRequests.filter((request) => {
      const matchesSearch = 
        request.vehicleInfo.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicleInfo.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.dealerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    switch(filter) {
      case 'awaiting-reception':
        return filteredBySearch.filter(request => 
          request.inspection.status === InspectionStatus.FAW_APPROVED);
      case 'in-reception':
        return filteredBySearch.filter(request => 
          request.inspection.status === InspectionStatus.BA_RECEIVED ||
          request.inspection.status === InspectionStatus.BA_INSPECTED);
      case 'approved':
        return filteredBySearch.filter(request => 
          request.inspection.status === InspectionStatus.BA_APPROVED);
      case 'ready-for-sale':
        return filteredBySearch.filter(request => 
          request.inspection.status === InspectionStatus.READY_FOR_SALE);
      case 'rejected':
        return filteredBySearch.filter(request => 
          request.inspection.status === InspectionStatus.BA_REJECTED);
      default:
        return filteredBySearch;
    }
  };

  const filteredRequests = getFilteredRequests();

  const getStatusBadgeColor = (status: InspectionStatus) => {
    switch(status) {
      case InspectionStatus.FAW_APPROVED:
        return 'bg-blue-100 text-blue-800';
      case InspectionStatus.BA_RECEIVED:
        return 'bg-yellow-100 text-yellow-800';
      case InspectionStatus.BA_INSPECTED:
        return 'bg-purple-100 text-purple-800';
      case InspectionStatus.BA_APPROVED:
        return 'bg-green-100 text-green-800';
      case InspectionStatus.BA_REJECTED:
        return 'bg-red-100 text-red-800';
      case InspectionStatus.READY_FOR_SALE:
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestAction = (request: TradeRequest, actionType: 'checkin' | 'inspect' | 'view') => {
    if (!request) {
      toast({
        title: "Error",
        description: "Cannot process request: No data provided",
        variant: "destructive"
      });
      return;
    }
    
    if (!request.id) {
      toast({
        title: "Error",
        description: "Cannot process request with missing ID",
        variant: "destructive"
      });
      return;
    }
    
    if (actionType === 'checkin') {
      navigate(`/ba-used/checkin/${request.id}`);
    } else if (actionType === 'inspect') {
      navigate(`/ba-used/inspect/${request.id}`);
    } else {
      // View action - update this to use the new route
      navigate(`/ba-used/view/${request.id}`);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">BA Used Vehicle Management</h1>
            <p className="text-muted-foreground">Manage and process FAW-approved vehicles</p>
          </div>
        </div>

        <Tabs defaultValue="awaiting-reception" value={filter} onValueChange={setFilter}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="awaiting-reception">Awaiting Reception</TabsTrigger>
            <TabsTrigger value="in-reception">In Reception</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="ready-for-sale">Ready for Sale</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="grid gap-4 md:grid-cols-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search vehicles..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="text-muted-foreground h-4 w-4" />
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="buy-back">Buy Back</SelectItem>
                  <SelectItem value="trade-in">Trade In</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="awaiting-reception">
            {renderRequests(filteredRequests, 'checkin')}
          </TabsContent>
          
          <TabsContent value="in-reception">
            {renderRequests(filteredRequests, 'inspect')}
          </TabsContent>
          
          <TabsContent value="approved">
            {renderRequests(filteredRequests, 'view')}
          </TabsContent>
          
          <TabsContent value="ready-for-sale">
            {renderRequests(filteredRequests, 'view')}
          </TabsContent>
          
          <TabsContent value="rejected">
            {renderRequests(filteredRequests, 'view')}
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );

  function renderRequests(requests: TradeRequest[], actionType: 'checkin' | 'inspect' | 'view') {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div className="text-center py-8">
          <CarFront className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg font-medium">No vehicles found</p>
          <p className="text-muted-foreground">
            There are no vehicles currently in this category.
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {request.vehicleInfo.make} {request.vehicleInfo.model} ({request.vehicleInfo.year})
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={getStatusBadgeColor(request.inspection.status)}
                >
                  {request.inspection.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Dealer</p>
                    <p className="font-medium">{request.dealerName}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Trade Type</p>
                    <p className="font-medium">{request.tradeType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">VIN</p>
                    <p className="font-medium text-xs">{request.vehicleInfo.vin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p className="font-medium">{request.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
                  </div>
                </div>
                
                <div className="flex justify-end pt-2">
                  {actionType === 'checkin' && (
                    <Button 
                      onClick={() => handleRequestAction(request, 'checkin')}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" /> Check In Vehicle
                    </Button>
                  )}
                  {actionType === 'inspect' && (
                    <Button 
                      onClick={() => handleRequestAction(request, 'inspect')}
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" /> Perform Inspection
                    </Button>
                  )}
                  {actionType === 'view' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleRequestAction(request, 'view')}
                    >
                      {request.inspection.status === InspectionStatus.READY_FOR_SALE ? (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View Stock
                        </>
                      ) : (
                        'View Details'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default BAUsed;

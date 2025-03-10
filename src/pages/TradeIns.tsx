import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Car, Check, X, AlertCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { TradeRequest, TradeType, RequestStatus, InspectionStatus } from '@/types';
import PageTransition from '@/components/layout/PageTransition';
import { getTradeRequests, updateInspectionStatus, clearTradeRequests } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const TradeIns = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<TradeRequest | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tradeRequests = [], isLoading } = useQuery({
    queryKey: ['tradeRequests'],
    queryFn: getTradeRequests,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InspectionStatus }) => 
      updateInspectionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeRequests'] });
    }
  });
  
  const clearTradeRequestsMutation = useMutation({
    mutationFn: clearTradeRequests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeRequests'] });
      setClearDialogOpen(false);
      toast({
        title: "Trade-in requests cleared",
        description: "All trade-in requests have been removed. You can now start testing from scratch."
      });
    },
    onError: (error) => {
      toast({
        title: "Error clearing requests",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  });

  const filteredRequests = tradeRequests.filter((request) => {
    const matchesSearch =
      request.vehicleInfo.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicleInfo.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.vehicleInfo.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.dealerName?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'buyback') return matchesSearch && request.tradeType === TradeType.BUY_BACK;
    if (activeTab === 'tradein') return matchesSearch && request.tradeType === TradeType.TRADE_IN;
    if (activeTab === 'pending') return matchesSearch && request.inspection?.status === InspectionStatus.PENDING;
    if (activeTab === 'approved') return matchesSearch && (
      request.inspection?.status === InspectionStatus.FAW_APPROVED || 
      request.inspection?.status === InspectionStatus.BA_APPROVED
    );
    if (activeTab === 'rejected') return matchesSearch && (
      request.inspection?.status === InspectionStatus.FAW_REJECTED ||
      request.inspection?.status === InspectionStatus.BA_REJECTED
    );
    
    return matchesSearch;
  });

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case RequestStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case RequestStatus.UNDER_REVIEW:
        return 'bg-yellow-100 text-yellow-800';
      case RequestStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case RequestStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case RequestStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInspectionStatusColor = (request: TradeRequest) => {
    const inspection = request.inspection;
    const failedItems = inspection.items?.filter(item => item.status === 'Fail').length || 0;
    
    switch (inspection.status) {
      case InspectionStatus.PENDING:
        if (failedItems > 5) return 'bg-red-100 text-red-800';
        if (failedItems > 0) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
      case InspectionStatus.FAW_APPROVED:
      case InspectionStatus.BA_APPROVED:
      case InspectionStatus.READY_FOR_SALE:
        return 'bg-green-100 text-green-800';
      case InspectionStatus.FAW_REJECTED:
      case InspectionStatus.BA_REJECTED:
        return 'bg-red-100 text-red-800';
      case InspectionStatus.BA_RECEIVED:
      case InspectionStatus.BA_INSPECTED:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveRequest = () => {
    if (!selectedRequest) return;
    
    updateStatusMutation.mutate(
      { id: selectedRequest.inspection.id, status: InspectionStatus.FAW_APPROVED },
      {
        onSuccess: () => {
          toast({
            title: "Trade-in request approved",
            description: "The request has been approved and sent to BA Used."
          });
          
          setApprovalDialogOpen(false);
          setSelectedRequest(null);
          setReviewNotes('');
        },
        onError: (error) => {
          toast({
            title: "Error approving request",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleRejectRequest = () => {
    if (!selectedRequest) return;
    
    if (!reviewNotes.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting the trade-in request.",
        variant: "destructive"
      });
      return;
    }
    
    updateStatusMutation.mutate(
      { id: selectedRequest.inspection.id, status: InspectionStatus.FAW_REJECTED },
      {
        onSuccess: () => {
          toast({
            title: "Trade-in request rejected",
            description: "The request has been rejected and sent back to the dealer."
          });
          
          setRejectionDialogOpen(false);
          setSelectedRequest(null);
          setReviewNotes('');
        },
        onError: (error) => {
          toast({
            title: "Error rejecting request",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleClearRequests = () => {
    clearTradeRequestsMutation.mutate();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Trade-In Requests</h1>
            <p className="text-muted-foreground">Manage all dealer trade-in and buy-back requests</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              onClick={() => setClearDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Clear All
            </Button>
            <Link to="/inspections/new">
              <Button className="w-full sm:w-auto">
                Create New Request
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by VIN, make, model or dealer..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="buyback">Buy Back</TabsTrigger>
            <TabsTrigger value="tradein">Trade In</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading)}
          </TabsContent>
          
          <TabsContent value="buyback" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading, "No buy-back requests found")}
          </TabsContent>
          
          <TabsContent value="tradein" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading, "No trade-in requests found")}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading, "No pending requests found")}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading, "No approved requests found")}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4 mt-4">
            {renderRequestsContent(filteredRequests, isLoading, "No rejected requests found")}
          </TabsContent>
        </Tabs>

        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Trade-In Request</DialogTitle>
              <DialogDescription>
                Approving this request will send it to BA Used for processing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Vehicle: {selectedRequest?.vehicleInfo.make} {selectedRequest?.vehicleInfo.model} ({selectedRequest?.vehicleInfo.year})
              </p>
              
              {selectedRequest?.inspection.items.filter(item => item.status === 'Fail').length > 0 && (
                <div className="flex items-start p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Warning</p>
                    <p className="text-sm text-yellow-600">
                      This inspection has {selectedRequest?.inspection.items.filter(item => item.status === 'Fail').length} failed items.
                      Are you sure you want to approve it?
                    </p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium mb-2">Approval Notes (Optional)</p>
                <Textarea 
                  placeholder="Add any notes for BA Used team..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setApprovalDialogOpen(false);
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApproveRequest}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Approve Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Trade-In Request</DialogTitle>
              <DialogDescription>
                Rejecting this request will send it back to the dealer for correction.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Vehicle: {selectedRequest?.vehicleInfo.make} {selectedRequest?.vehicleInfo.model} ({selectedRequest?.vehicleInfo.year})
              </p>
              
              <div>
                <p className="text-sm font-medium mb-2">Rejection Reason (Required)</p>
                <Textarea 
                  placeholder="Explain why the request is being rejected..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setRejectionDialogOpen(false);
                  setSelectedRequest(null);
                  setReviewNotes('');
                }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectRequest}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Reject Request'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Trade-In Requests</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove all trade-in requests? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setClearDialogOpen(false)}
                disabled={clearTradeRequestsMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearRequests}
                disabled={clearTradeRequestsMutation.isPending}
              >
                {clearTradeRequestsMutation.isPending ? 'Clearing...' : 'Clear All Requests'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
  
  function renderRequestsContent(requests: TradeRequest[], isLoading: boolean, emptyMessage = "No trade-in requests found") {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
        </div>
      );
    }
    
    if (requests.length === 0) {
      return (
        <div className="text-center py-8 space-y-4">
          <Car className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground">
            Create a new trade-in request to get started
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
                <div>
                  <CardTitle className="text-lg">
                    {request.vehicleInfo.make} {request.vehicleInfo.model}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{request.vehicleInfo.vin}</p>
                </div>
                <Badge 
                  variant="outline" 
                  className={getInspectionStatusColor(request)}
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
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{request.tradeType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Year</p>
                    <p className="font-medium">{request.vehicleInfo.year}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p className="font-medium">{request.vehicleInfo.mileage?.toLocaleString() || 0} km</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Link to={`/inspections/${request.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>

                  {request.inspection.status === InspectionStatus.PENDING && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setApprovalDialogOpen(true);
                        }}
                      >
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          setSelectedRequest(request);
                          setRejectionDialogOpen(true);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
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

export default TradeIns;

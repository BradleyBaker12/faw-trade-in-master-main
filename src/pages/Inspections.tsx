
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Plus, Check, X, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Inspection, InspectionStatus } from '@/types';
import PageTransition from '@/components/layout/PageTransition';
import { getInspections, updateInspectionStatus } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Inspections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ['inspections'],
    queryFn: () => getInspections(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InspectionStatus }) => 
      updateInspectionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspections'] });
    }
  });

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = 
      inspection.tradeRequestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inspection.completedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      '';
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'pending') return matchesSearch && inspection.status === InspectionStatus.PENDING;
    if (filter === 'approved') return matchesSearch && (
      inspection.status === InspectionStatus.FAW_APPROVED || 
      inspection.status === InspectionStatus.BA_APPROVED || 
      inspection.status === InspectionStatus.READY_FOR_SALE
    );
    if (filter === 'rejected') return matchesSearch && (
      inspection.status === InspectionStatus.FAW_REJECTED ||
      inspection.status === InspectionStatus.BA_REJECTED
    );
    
    return matchesSearch;
  });

  const handleApproveInspection = () => {
    if (!selectedInspection) return;
    
    updateStatusMutation.mutate(
      { id: selectedInspection.id, status: InspectionStatus.FAW_APPROVED },
      {
        onSuccess: () => {
          toast({
            title: "Inspection approved",
            description: "The inspection has been approved and sent to BA Used."
          });
          
          setApprovalDialogOpen(false);
          setSelectedInspection(null);
          setReviewNotes('');
        },
        onError: (error) => {
          toast({
            title: "Error approving inspection",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  const handleRejectInspection = () => {
    if (!selectedInspection) return;
    
    if (!reviewNotes.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting the inspection.",
        variant: "destructive"
      });
      return;
    }
    
    updateStatusMutation.mutate(
      { id: selectedInspection.id, status: InspectionStatus.FAW_REJECTED },
      {
        onSuccess: () => {
          toast({
            title: "Inspection rejected",
            description: "The inspection has been rejected and sent back to the dealer."
          });
          
          setRejectionDialogOpen(false);
          setSelectedInspection(null);
          setReviewNotes('');
        },
        onError: (error) => {
          toast({
            title: "Error rejecting inspection",
            description: error instanceof Error ? error.message : "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  const getInspectionStatusColor = (inspection: Inspection) => {
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

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inspections</h1>
            <p className="text-muted-foreground">Manage and review vehicle inspections</p>
          </div>
          <Link to="/inspections/new">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Inspection
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search inspections..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="text-muted-foreground h-4 w-4" />
            <Select defaultValue="all" onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inspections</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-faw-primary"></div>
          </div>
        ) : filteredInspections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInspections.map((inspection) => (
              <Card key={inspection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                      Inspection #{inspection.id?.slice(0, 8) || 'N/A'}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={getInspectionStatusColor(inspection)}
                    >
                      {inspection.status || 'Unknown'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Trade Request</p>
                        <p className="font-medium">#{inspection.tradeRequestId?.slice(0, 8) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Photos</p>
                        <p className="font-medium">{inspection.photos?.length || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed By</p>
                        <p className="font-medium">{inspection.completedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">
                          {inspection.completedAt ? new Date(inspection.completedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <Link to={`/inspections/${inspection.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>

                      {inspection.status === InspectionStatus.PENDING && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => {
                              setSelectedInspection(inspection);
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
                              setSelectedInspection(inspection);
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
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No inspections found</p>
          </div>
        )}

        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Inspection</DialogTitle>
              <DialogDescription>
                Approving this inspection will send it to BA Used for processing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Inspection #{selectedInspection?.id.slice(0, 8)} for vehicle {selectedInspection?.tradeRequestId.slice(0, 8)}
              </p>
              
              {selectedInspection?.items.filter(item => item.status === 'Fail').length > 0 && (
                <div className="flex items-start p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">Warning</p>
                    <p className="text-sm text-yellow-600">
                      This inspection has {selectedInspection?.items.filter(item => item.status === 'Fail').length} failed items.
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
                  setSelectedInspection(null);
                  setReviewNotes('');
                }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleApproveInspection}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Approve Inspection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Inspection</DialogTitle>
              <DialogDescription>
                Rejecting this inspection will send it back to the dealer for correction.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-sm">
                Inspection #{selectedInspection?.id.slice(0, 8)} for vehicle {selectedInspection?.tradeRequestId.slice(0, 8)}
              </p>
              
              <div>
                <p className="text-sm font-medium mb-2">Rejection Reason (Required)</p>
                <Textarea 
                  placeholder="Explain why the inspection is being rejected..."
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
                  setSelectedInspection(null);
                  setReviewNotes('');
                }}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectInspection}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? 'Processing...' : 'Reject Inspection'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Inspections;

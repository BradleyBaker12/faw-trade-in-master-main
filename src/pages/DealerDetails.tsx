
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Edit,
  Trash2,
  Truck,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ClipboardCheck,
  ChevronRight,
  FileText,
  UserCog,
  Upload
} from 'lucide-react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import PageTransition from '@/components/layout/PageTransition';
import { getDealerById, getTradeRequestsByDealerId } from '@/services/api';
import { Dealer, TradeRequest, RequestStatus, TradeType } from '@/types';

const DealerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const dealerData = await getDealerById(id);
          
          if (dealerData) {
            setDealer(dealerData);
            
            const requests = await getTradeRequestsByDealerId(id);
            setTradeRequests(requests);
          }
        } catch (error) {
          console.error("Error fetching dealer details:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [id]);

  const handleNewTradeInRequest = () => {
    if (dealer) {
      navigate('/inspections/new', { 
        state: { 
          dealerId: dealer.id,
          dealerName: dealer.name,
          tradeType: TradeType.TRADE_IN
        } 
      });
      
      toast.success('Creating new trade-in request', {
        description: `for ${dealer.name}`
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Building className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Dealer Not Found</h2>
        <p className="text-muted-foreground mb-6">The dealer you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/dealers')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dealers
        </Button>
      </div>
    );
  }

  const requestsByStatus = {
    draft: tradeRequests.filter(r => r.status === RequestStatus.DRAFT).length,
    submitted: tradeRequests.filter(r => r.status === RequestStatus.SUBMITTED).length,
    underReview: tradeRequests.filter(r => r.status === RequestStatus.UNDER_REVIEW).length,
    approved: tradeRequests.filter(r => r.status === RequestStatus.APPROVED).length,
    rejected: tradeRequests.filter(r => r.status === RequestStatus.REJECTED).length,
    completed: tradeRequests.filter(r => r.status === RequestStatus.COMPLETED).length,
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      toast("File uploaded", {
        description: "Your file has been uploaded successfully."
      });
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Link to="/dealers" className="hover:text-foreground inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              <span>Back to Dealers</span>
            </Link>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-3xl font-bold">{dealer.name}</h1>
                <Badge 
                  variant={dealer.status === 'Active' ? 'default' : 'secondary'}
                  className="ml-3"
                >
                  {dealer.status}
                </Badge>
              </div>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {dealer.address}, {dealer.city}, {dealer.province}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" className="h-9">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-9"
                onClick={() => {
                  toast.error("Delete operation not implemented", {
                    description: "This would delete the dealer in a real application."
                  });
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trade-requests">Trade Requests</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>Dealer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <UserCog className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Contact Person:</span>
                      <span className="ml-2">{dealer.contactPerson}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{dealer.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{dealer.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">Active Since:</span>
                      <span className="ml-2">{dealer.activeSince.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>Trade Request Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Total Requests</div>
                      <div className="text-2xl font-bold">{tradeRequests.length}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Pending</div>
                      <div className="text-2xl font-bold">
                        {requestsByStatus.submitted + requestsByStatus.underReview}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Approved</div>
                      <div className="text-2xl font-bold text-green-600">
                        {requestsByStatus.approved}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Rejected</div>
                      <div className="text-2xl font-bold text-red-600">
                        {requestsByStatus.rejected}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Link 
                    to="#trade-requests" 
                    className="text-faw-secondary text-sm font-medium flex items-center hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('[data-value="trade-requests"]')?.dispatchEvent(
                        new MouseEvent('click', { bubbles: true })
                      );
                    }}
                  >
                    View all requests
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </CardFooter>
              </Card>
              
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    size="sm"
                    onClick={handleNewTradeInRequest}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Trade-in Request
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Dealer
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {tradeRequests.length > 0 && (
              <Card className="border border-border/40 shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Trade Requests</CardTitle>
                  <CardDescription>Latest trade-in and buy-back requests from this dealer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tradeRequests.slice(0, 3).map((request) => {
                      let statusClass = '';
                      let StatusIcon = Clock;

                      switch (request.status) {
                        case RequestStatus.DRAFT:
                          statusClass = 'bg-gray-100 text-gray-800';
                          StatusIcon = Clock;
                          break;
                        case RequestStatus.SUBMITTED:
                          statusClass = 'bg-blue-100 text-blue-800';
                          StatusIcon = ClipboardCheck;
                          break;
                        case RequestStatus.UNDER_REVIEW:
                          statusClass = 'bg-yellow-100 text-yellow-800';
                          StatusIcon = Clock;
                          break;
                        case RequestStatus.APPROVED:
                          statusClass = 'bg-green-100 text-green-800';
                          StatusIcon = CheckCircle;
                          break;
                        case RequestStatus.REJECTED:
                          statusClass = 'bg-red-100 text-red-800';
                          StatusIcon = XCircle;
                          break;
                        case RequestStatus.COMPLETED:
                          statusClass = 'bg-purple-100 text-purple-800';
                          StatusIcon = CheckCircle;
                          break;
                      }

                      return (
                        <div 
                          key={request.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border/60 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              request.tradeType === TradeType.BUY_BACK ? "bg-faw-secondary/10" : "bg-faw-accent/10"
                            )}>
                              <Truck className={cn(
                                "w-5 h-5",
                                request.tradeType === TradeType.BUY_BACK ? "text-faw-secondary" : "text-faw-accent"
                              )} />
                            </div>
                            <div>
                              <div className="font-medium text-sm">
                                {request.vehicleInfo.make} {request.vehicleInfo.model} ({request.vehicleInfo.year})
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                                <span>{request.tradeType}</span>
                                <span>•</span>
                                <span>{request.createdAt.toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center",
                              statusClass
                            )}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {request.status}
                            </div>
                            <Link
                              to={`/inspections/${request.id}`}
                              className="p-2 text-gray-400 hover:text-faw-secondary rounded-full hover:bg-gray-100 transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                {tradeRequests.length > 3 && (
                  <CardFooter className="border-t pt-4">
                    <Link 
                      to="#trade-requests" 
                      className="text-faw-secondary text-sm font-medium flex items-center hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('[data-value="trade-requests"]')?.dispatchEvent(
                          new MouseEvent('click', { bubbles: true })
                        );
                      }}
                    >
                      View all requests
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </CardFooter>
                )}
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="trade-requests" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">All Trade Requests</h3>
              <Button onClick={handleNewTradeInRequest}>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
            
            <Separator />
            
            {tradeRequests.length > 0 ? (
              <div className="space-y-4">
                {tradeRequests.map((request) => {
                  let statusClass = '';
                  let StatusIcon = Clock;

                  switch (request.status) {
                    case RequestStatus.DRAFT:
                      statusClass = 'bg-gray-100 text-gray-800';
                      StatusIcon = Clock;
                      break;
                    case RequestStatus.SUBMITTED:
                      statusClass = 'bg-blue-100 text-blue-800';
                      StatusIcon = ClipboardCheck;
                      break;
                    case RequestStatus.UNDER_REVIEW:
                      statusClass = 'bg-yellow-100 text-yellow-800';
                      StatusIcon = Clock;
                      break;
                    case RequestStatus.APPROVED:
                      statusClass = 'bg-green-100 text-green-800';
                      StatusIcon = CheckCircle;
                      break;
                    case RequestStatus.REJECTED:
                      statusClass = 'bg-red-100 text-red-800';
                      StatusIcon = XCircle;
                      break;
                    case RequestStatus.COMPLETED:
                      statusClass = 'bg-purple-100 text-purple-800';
                      StatusIcon = CheckCircle;
                      break;
                  }

                  return (
                    <div 
                      key={request.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between p-6 rounded-lg border border-border/60 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          request.tradeType === TradeType.BUY_BACK ? "bg-faw-secondary/10" : "bg-faw-accent/10"
                        )}>
                          <Truck className={cn(
                            "w-6 h-6",
                            request.tradeType === TradeType.BUY_BACK ? "text-faw-secondary" : "text-faw-accent"
                          )} />
                        </div>
                        <div>
                          <div className="font-medium">
                            {request.vehicleInfo.make} {request.vehicleInfo.model} ({request.vehicleInfo.year})
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">VIN:</span> {request.vehicleInfo.vin}
                          </div>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline">
                              {request.tradeType}
                            </Badge>
                            <div className={cn(
                              "px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center",
                              statusClass
                            )}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {request.status}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:text-right">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Created:</span> {request.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Updated:</span> {request.updatedAt.toLocaleDateString()}
                        </div>
                        <div className="mt-2">
                          <Link
                            to={`/inspections/${request.id}`}
                            className="text-faw-secondary text-sm font-medium hover:underline flex items-center justify-end"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No trade requests yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  This dealer hasn't submitted any trade-in or buy-back requests.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Request
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">Dealer History</h3>
              <p className="mt-2 text-sm text-gray-500">
                Transaction history and dealer activity logs would appear here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Dealer Documents</CardTitle>
          <CardDescription>Upload and manage dealer-related documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-12 h-12 mb-3 text-gray-400" />
              <h3 className="font-medium">Dealership Agreement</h3>
              <p className="text-sm text-gray-500 text-center mb-4">Upload the signed dealership agreement</p>
              <label htmlFor="dealership-agreement" className="cursor-pointer">
                <Button variant="outline" size="sm" className="text-xs" onClick={(e) => e.preventDefault()}>
                  <Upload className="mr-1 w-3 h-3" /> Upload
                </Button>
                <input 
                  type="file" 
                  id="dealership-agreement" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-12 h-12 mb-3 text-gray-400" />
              <h3 className="font-medium">Business License</h3>
              <p className="text-sm text-gray-500 text-center mb-4">Upload current business license</p>
              <label htmlFor="business-license" className="cursor-pointer">
                <Button variant="outline" size="sm" className="text-xs" onClick={(e) => e.preventDefault()}>
                  <Upload className="mr-1 w-3 h-3" /> Upload
                </Button>
                <input 
                  type="file" 
                  id="business-license" 
                  className="hidden" 
                  accept=".pdf,.jpg,.png" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="flex flex-col items-center p-6 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="w-12 h-12 mb-3 text-gray-400" />
              <h3 className="font-medium">Tax Documents</h3>
              <p className="text-sm text-gray-500 text-center mb-4">Upload tax and financial documents</p>
              <label htmlFor="tax-documents" className="cursor-pointer">
                <Button variant="outline" size="sm" className="text-xs" onClick={(e) => e.preventDefault()}>
                  <Upload className="mr-1 w-3 h-3" /> Upload
                </Button>
                <input 
                  type="file" 
                  id="tax-documents" 
                  className="hidden" 
                  accept=".pdf,.csv,.xlsx" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};

export default DealerDetails;

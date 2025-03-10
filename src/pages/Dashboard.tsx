
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  ArrowUpRight, 
  Store, 
  Truck, 
  ClipboardCheck, 
  CheckCircle, 
  XCircle,
  Clock 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';
import PageTransition from '@/components/layout/PageTransition';
import { getDealers, getTradeRequests } from '@/services/api';
import { RequestStatus, TradeType, Dealer, TradeRequest } from '@/types';

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const Dashboard = () => {
  // Summary statistics
  const [stats, setStats] = useState({
    totalDealers: 0,
    activeDealers: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dealersData = await getDealers();
        const requestsData = await getTradeRequests();
        
        setDealers(dealersData);
        setTradeRequests(requestsData);
        
        // Calculate statistics
        const activeDealers = dealersData.filter(dealer => dealer.status === 'Active').length;
        const pendingRequests = requestsData.filter(
          req => req.status === RequestStatus.SUBMITTED || req.status === RequestStatus.UNDER_REVIEW
        ).length;
        const approvedRequests = requestsData.filter(
          req => req.status === RequestStatus.APPROVED || req.status === RequestStatus.COMPLETED
        ).length;
        const rejectedRequests = requestsData.filter(
          req => req.status === RequestStatus.REJECTED
        ).length;

        setStats({
          totalDealers: dealersData.length,
          activeDealers,
          totalRequests: requestsData.length,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    
    fetchData();
  }, []);

  // Request data for charts
  const statusData = [
    { name: 'Draft', value: tradeRequests.filter(r => r.status === RequestStatus.DRAFT).length },
    { name: 'Submitted', value: tradeRequests.filter(r => r.status === RequestStatus.SUBMITTED).length },
    { name: 'Under Review', value: tradeRequests.filter(r => r.status === RequestStatus.UNDER_REVIEW).length },
    { name: 'Approved', value: tradeRequests.filter(r => r.status === RequestStatus.APPROVED).length },
    { name: 'Rejected', value: tradeRequests.filter(r => r.status === RequestStatus.REJECTED).length },
    { name: 'Completed', value: tradeRequests.filter(r => r.status === RequestStatus.COMPLETED).length },
  ];

  // Data for dealer activity chart
  const dealerActivityData = dealers.map(dealer => {
    const requests = tradeRequests.filter(req => req.dealerId === dealer.id);
    return {
      name: dealer.name.split(' ')[0], // Use first word of dealer name
      requests: requests.length,
    };
  });

  // Colors for pie chart
  const COLORS = ['#e9ecef', '#74c0fc', '#4dabf7', '#228be6', '#f03e3e', '#40c057'];

  // Recent requests
  const recentRequests = [...tradeRequests]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your trade-in and buy-back operations
          </p>
        </div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item}>
            <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Dealers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{stats.totalDealers}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({stats.activeDealers} active)
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to="/dealers" 
                  className="text-faw-secondary text-sm font-medium flex items-center hover:underline"
                >
                  View all dealers
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{stats.totalRequests}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to="/trade-ins" 
                  className="text-faw-secondary text-sm font-medium flex items-center hover:underline"
                >
                  View all requests
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{stats.pendingRequests}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Link 
                  to="/trade-ins?status=pending" 
                  className="text-amber-500 text-sm font-medium flex items-center hover:underline"
                >
                  Review pending
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border border-border/40 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    {stats.totalRequests 
                      ? Math.round((stats.approvedRequests / (stats.approvedRequests + stats.rejectedRequests)) * 100) 
                      : 0}%
                  </span>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="text-sm text-muted-foreground flex items-center">
                  <span className="text-green-500 font-medium flex items-center mr-3">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {stats.approvedRequests}
                  </span>
                  <span className="text-red-500 font-medium flex items-center">
                    <XCircle className="h-3 w-3 mr-1" />
                    {stats.rejectedRequests}
                  </span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Card className="border border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle>Trade-in Status Overview</CardTitle>
                <CardDescription>Distribution of requests by current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card className="border border-border/40 shadow-sm">
              <CardHeader>
                <CardTitle>Dealer Activity</CardTitle>
                <CardDescription>Number of trade-in requests by dealer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dealerActivityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="border border-border/40 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Trade-in Requests</CardTitle>
              <CardDescription>Latest activity across all dealers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRequests.map((request) => {
                  // Status badge styling
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
                            <Store className="w-3 h-3" />
                            <span>{request.dealerName}</span>
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
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Link 
                to="/trade-ins" 
                className="text-faw-secondary text-sm font-medium flex items-center hover:underline"
              >
                View all requests
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;

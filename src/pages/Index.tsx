
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl px-4 sm:px-6"
      >
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Vehicle Management System</h1>
        <p className="text-xl text-gray-600 mb-8">
          A comprehensive platform for managing dealer trade-ins, inspections and used vehicle inventory
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Dealer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Add and manage dealer information and their trade-in requests.</p>
            </CardContent>
            <CardFooter>
              <Link to="/dealers" className="w-full">
                <Button className="w-full">View Dealers</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Create and review vehicle inspection reports.</p>
            </CardContent>
            <CardFooter>
              <Link to="/inspections" className="w-full">
                <Button className="w-full">View Inspections</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle>Stock Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Manage the inventory of used vehicles and dealer consignments.</p>
            </CardContent>
            <CardFooter>
              <Link to="/stock" className="w-full">
                <Button className="w-full">View Stock</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Link to="/dashboard">
            <Button variant="outline" size="lg">Go to Dashboard</Button>
          </Link>
          <Link to="/trade-ins">
            <Button size="lg">View Trade-Ins</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Index;

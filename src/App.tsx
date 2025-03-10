
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Suspense, lazy, useState, useEffect } from "react";
import Navbar from "./components/layout/Navbar";
import Dashboard from "./pages/Dashboard";
import Dealers from "./pages/Dealers";
import DealerDetails from "./pages/DealerDetails";
import TradeIns from "./pages/TradeIns";
import InspectionForm from "./pages/InspectionForm";
import BAUsed from "./pages/BAUsed";
import BAUsedCheckin from "./pages/BAUsedCheckin";
import NotFound from "./pages/NotFound";
import BAUsedInspection from './pages/BAUsedInspection';
import Stock from './pages/Stock';

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize any required app state or check data integrity
    try {
      // Ensure localStorage is accessible
      localStorage.getItem('test');
      // Remove the test item
      localStorage.removeItem('test');
    } catch (error) {
      console.error("LocalStorage error:", error);
      // If localStorage is not accessible, we might want to show an error
    }
    
    // Simulate a short loading time to ensure components are ready
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <Suspense fallback={<LoadingFallback />}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Navigate to="/" replace />} />
                    <Route path="/dealers" element={<Dealers />} />
                    <Route path="/dealers/:id" element={<DealerDetails />} />
                    <Route path="/trade-ins" element={<TradeIns />} />
                    <Route path="/inspections" element={<Navigate to="/trade-ins" replace />} />
                    <Route path="/inspections/new" element={<InspectionForm />} />
                    <Route path="/inspections/:id" element={<InspectionForm />} />
                    <Route path="/ba-used" element={<BAUsed />} />
                    <Route path="/ba-used/checkin/:id" element={<BAUsedCheckin />} />
                    <Route path="/ba-used/inspect/:id" element={<BAUsedInspection />} />
                    <Route path="/ba-used/view/:id" element={<BAUsedInspection />} />
                    <Route path="/stock" element={<Stock />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AnimatePresence>
              </Suspense>
            </div>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

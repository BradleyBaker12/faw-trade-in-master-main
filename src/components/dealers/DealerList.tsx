
import React from 'react';
import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dealer } from '@/types';
import DealerCard from './DealerCard';

export const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

interface DealerListProps {
  dealers: Dealer[];
  isLoading: boolean;
  clearFilters: () => void;
  noResults: boolean;
}

const DealerList = ({ dealers, isLoading, clearFilters, noResults }: DealerListProps) => {
  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : dealers.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {dealers.map((dealer) => (
            <DealerCard 
              key={dealer.id} 
              dealer={dealer} 
              requestCount={0} 
            />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No dealers found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {noResults 
              ? "Get started by adding your first dealer using the Add Dealer button."
              : "Try adjusting your search or filters to find what you're looking for."}
          </p>
          {!noResults && (
            <Button onClick={clearFilters} variant="outline" className="mt-4">
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default DealerList;

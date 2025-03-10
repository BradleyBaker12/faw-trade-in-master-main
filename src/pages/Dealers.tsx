
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '@/components/layout/PageTransition';
import { Dealer } from '@/types';
import AddDealerDialog from '@/components/dealers/AddDealerDialog';
import { getDealers } from '@/services/api';
import SearchBar from '@/components/dealers/SearchBar';
import DealerFilters from '@/components/dealers/DealerFilters';
import DealerList from '@/components/dealers/DealerList';

const Dealers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  
  const { 
    data: dealers = [], 
    isLoading, 
    refetch: refetchDealers 
  } = useQuery({
    queryKey: ['dealers'],
    queryFn: getDealers,
    staleTime: 10000, // 10 seconds
  });

  const filteredDealers = dealers.filter(dealer => {
    const matchesSearch = 
      dealer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dealer.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && dealer.status === 'Active') ||
      (statusFilter === 'inactive' && dealer.status === 'Inactive');
    
    const matchesProvince = 
      provinceFilter === 'all' || 
      dealer.province === provinceFilter;
    
    return matchesSearch && matchesStatus && matchesProvince;
  });

  const clearFilters = () => {
    setStatusFilter('all');
    setProvinceFilter('all');
    setSearchQuery('');
  };

  const handleDealerAdded = (newDealer: Dealer) => {
    console.info("New dealer created:", newDealer);
    refetchDealers();
  };

  const hasActiveFilters = statusFilter !== 'all' || provinceFilter !== 'all' || searchQuery !== '';

  useEffect(() => {
    console.log("Current dealers in component:", dealers.length);
  }, [dealers]);

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">Dealers</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your dealerships across the country
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
          
          <div className="flex gap-2 w-full sm:w-auto">
            <DealerFilters 
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              provinceFilter={provinceFilter}
              setProvinceFilter={setProvinceFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            
            <AddDealerDialog onDealerAdded={handleDealerAdded} />
          </div>
        </div>

        <DealerList 
          dealers={filteredDealers}
          isLoading={isLoading}
          clearFilters={clearFilters}
          noResults={dealers.length === 0}
        />
      </div>
    </PageTransition>
  );
};

export default Dealers;

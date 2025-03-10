
import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';

interface DealerFiltersProps {
  statusFilter: 'all' | 'active' | 'inactive';
  setStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
  provinceFilter: string;
  setProvinceFilter: (province: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DealerFilters = ({
  statusFilter,
  setStatusFilter,
  provinceFilter,
  setProvinceFilter,
  clearFilters,
  hasActiveFilters
}: DealerFiltersProps) => {
  
  const provinces = ['all', 'ON', 'QC', 'BC', 'AB'];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className={statusFilter === 'all' ? 'bg-accent' : ''}
                onClick={() => setStatusFilter('all')}
              >
                All
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={statusFilter === 'active' ? 'bg-accent' : ''}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={statusFilter === 'inactive' ? 'bg-accent' : ''}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuLabel>Province</DropdownMenuLabel>
            <DropdownMenuGroup>
              {provinces.map((province, index) => (
                <DropdownMenuItem 
                  key={index}
                  className={provinceFilter === province ? 'bg-accent' : ''}
                  onClick={() => setProvinceFilter(province)}
                >
                  {province === 'all' ? 'All Provinces' : province}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="px-2">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {(statusFilter !== 'all' || provinceFilter !== 'all') && (
        <div className="flex flex-wrap gap-2">
          {statusFilter !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Status: {statusFilter}
              <button onClick={() => setStatusFilter('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {provinceFilter !== 'all' && (
            <Badge variant="outline" className="flex items-center gap-1">
              Province: {provinceFilter}
              <button onClick={() => setProvinceFilter('all')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default DealerFilters;

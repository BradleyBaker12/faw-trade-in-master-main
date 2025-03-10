
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dealer } from '@/types';

export const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

interface DealerCardProps {
  dealer: Dealer;
  requestCount: number;
}

const DealerCard = ({ dealer, requestCount }: DealerCardProps) => {
  const {
    name = 'Unknown Dealer',
    city = 'Unknown', 
    province = 'Unknown',
    status = 'Active',
    phone = 'N/A',
    email = 'N/A',
    activeSince = new Date()
  } = dealer;

  const formatDate = (date: string | Date | null | undefined): string => {
    if (!date) return 'Unknown';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Unknown';
    }
  };

  return (
    <motion.div variants={item}>
      <Card className="border border-border/40 shadow-sm hover:shadow-md transition-all overflow-hidden group h-full flex flex-col">
        <CardContent className="p-6 space-y-4 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{name}</h3>
              <div className="flex items-center mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                <span>
                  {city}, {province}
                </span>
              </div>
            </div>
            <Badge variant={status === 'Active' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center text-sm">
              <Mail className="h-4 w-4 mr-2 text-gray-500" />
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span>Active since {formatDate(activeSince)}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-faw-secondary/10 text-faw-secondary px-3 py-1.5 rounded-full text-xs font-medium">
              {requestCount} trade requests
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-6 py-4 border-t bg-secondary/20">
          <Link 
            to={`/dealers/${dealer.id}`}
            className="text-faw-secondary text-sm font-medium flex items-center w-full justify-between group"
          >
            <span>View Details</span>
            <ChevronRight 
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5" 
            />
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DealerCard;

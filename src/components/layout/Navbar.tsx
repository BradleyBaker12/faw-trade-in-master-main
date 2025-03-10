
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Home, 
  Store, 
  Truck, 
  Menu, 
  X,
  CarFront,
  Package
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Dealers', path: '/dealers', icon: Store },
  { name: 'Trade-ins', path: '/trade-ins', icon: Truck },
  { name: 'BA Used', path: '/ba-used', icon: CarFront },
  { name: 'Stock', path: '/stock', icon: Package },
];

const Navbar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 lg:px-12',
        scrolled ? 'py-2 bg-white/80 backdrop-blur-md shadow-sm' : 'py-4 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-faw-primary to-faw-secondary flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
          </motion.div>
          <div className="text-xl font-bold bg-gradient-to-r from-faw-primary to-faw-secondary bg-clip-text text-transparent">
            FAW Trade-In
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center space-x-1 px-3 py-2 rounded-md transition-all',
                  isActive
                    ? 'text-faw-secondary font-medium'
                    : 'text-gray-600 hover:text-faw-secondary'
                )}
              >
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="h-1 w-full bg-faw-secondary absolute bottom-0 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-600 hover:text-faw-secondary transition-colors"
          aria-label={isOpen ? 'Close Menu' : 'Open Menu'}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="md:hidden overflow-hidden"
      >
        <div className="flex flex-col space-y-2 py-4 px-6 bg-white rounded-lg shadow-lg mt-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center justify-between py-3 px-4 rounded-md transition-all',
                  isActive
                    ? 'bg-faw-secondary/10 text-faw-secondary font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-faw-secondary'
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={cn(
                    'transition-transform',
                    isActive ? 'text-faw-secondary' : 'text-gray-400'
                  )} 
                />
              </Link>
            );
          })}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;

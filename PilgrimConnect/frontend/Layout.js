import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Home, 
  Ticket, 
  Users, 
  Shield, 
  Heart, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronDown,
  LayoutDashboard,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        // User not logged in
      }
    };
    loadUser();
  }, []);

  const pilgrimNav = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Book Darshan', icon: Ticket, page: 'BookDarshan' },
    { name: 'My Bookings', icon: Ticket, page: 'MyBookings' },
    { name: 'Emergency SOS', icon: AlertTriangle, page: 'EmergencySOS' },
  ];

  const adminNav = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'AdminDashboard' },
    { name: 'Crowd Monitor', icon: Users, page: 'CrowdMonitor' },
    { name: 'Slot Management', icon: Ticket, page: 'SlotManagement' },
    { name: 'Security', icon: Shield, page: 'SecurityDashboard' },
    { name: 'Medical', icon: Heart, page: 'MedicalDashboard' },
    { name: 'Emergencies', icon: AlertTriangle, page: 'EmergencyManagement' },
  ];

  const isAdmin = user?.role === 'admin';
  const navItems = isAdmin ? adminNav : pilgrimNav;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <style>{`
        :root {
          --color-saffron: #FF6B35;
          --color-sacred: #D4A373;
          --color-peace: #E9EDC9;
          --color-lotus: #FAEDCD;
          --color-divine: #CCD5AE;
        }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">🙏</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Darshan Seva
                </h1>
                <p className="text-xs text-amber-600/70">Sacred Journey Manager</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    currentPageName === item.page
                      ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link to={createPageUrl('Notifications')}>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                    </Button>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white text-sm font-medium">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="px-3 py-2 border-b">
                        <p className="font-medium text-sm">{user.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <DropdownMenuItem onClick={() => base44.auth.logout()}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-6"
                >
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-amber-100 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPageName === item.page
                      ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
                      : 'text-gray-600 hover:bg-orange-50'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/60 border-t border-amber-100 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            🙏 Darshan Seva - Ensuring Safe & Sacred Pilgrimages
          </p>
        </div>
      </footer>
    </div>
  );
}
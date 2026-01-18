import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronRight,
  Download,
  Share2,
  Filter,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import QRTicket from '@/components/booking/QRTicket';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MyBookings() {
  const [user, setUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user
  });

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const getTemple = (id) => temples.find(t => t.id === id);

  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' && new Date(b.booking_date) >= new Date()
  );
  
  const pastBookings = bookings.filter(b => 
    b.status !== 'confirmed' || new Date(b.booking_date) < new Date()
  );

  const filteredUpcoming = upcomingBookings.filter(b => 
    b.pilgrim_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTemple(b.temple_id)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPast = pastBookings.filter(b => 
    b.pilgrim_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getTemple(b.temple_id)?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BookingCard = ({ booking, isPast = false }) => {
    const temple = getTemple(booking.temple_id);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <Card 
          className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${isPast ? 'opacity-75' : ''}`}
          onClick={() => setSelectedBooking(booking)}
        >
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                {temple?.image_url ? (
                  <img src={temple.image_url} alt={temple.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-3xl">🛕</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{temple?.name || 'Temple'}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {temple?.city}, {temple?.state}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    {format(new Date(booking.booking_date), 'dd MMM yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {booking.slot_time}
                  </span>
                  <span className="flex items-center gap-1.5 text-gray-600">
                    <Ticket className="w-4 h-4 text-orange-500" />
                    {booking.ticket_number}
                  </span>
                </div>

                {booking.priority_access && (
                  <span className="inline-flex items-center mt-2 px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                    ⭐ Priority Access
                  </span>
                )}
              </div>

              <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600">Manage your darshan reservations</p>
          </div>
          <Link to={createPageUrl('BookDarshan')}>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full">
              <Ticket className="w-4 h-4 mr-2" />
              Book New Darshan
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by temple, ticket number, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 py-6 rounded-full border-gray-200"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="w-full bg-gray-100 p-1 rounded-full">
            <TabsTrigger value="upcoming" className="flex-1 rounded-full data-[state=active]:bg-white">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-full data-[state=active]:bg-white">
              Past ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {filteredUpcoming.length > 0 ? (
              filteredUpcoming.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                    <Ticket className="w-8 h-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Bookings</h3>
                  <p className="text-gray-600 mb-4">Book your darshan now for a blessed experience</p>
                  <Link to={createPageUrl('BookDarshan')}>
                    <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full">
                      Book Darshan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {filteredPast.length > 0 ? (
              filteredPast.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPast />
              ))
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Bookings</h3>
                  <p className="text-gray-600">Your completed bookings will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Ticket Dialog */}
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>E-Darshan Pass</DialogTitle>
            </DialogHeader>
            <div className="p-6">
              {selectedBooking && (
                <>
                  <QRTicket 
                    booking={selectedBooking} 
                    temple={getTemple(selectedBooking.temple_id)}
                  />
                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" className="flex-1 rounded-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-full">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
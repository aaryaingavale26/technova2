import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Ticket, 
  Calendar, 
  Shield, 
  Heart, 
  MapPin, 
  Users, 
  Clock, 
  ChevronRight,
  Star,
  AlertTriangle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';
import CrowdIndicator from '@/components/ui/CrowdIndicator';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const features = [
    {
      icon: Ticket,
      title: 'Easy Booking',
      description: 'Book your darshan slot in advance with just a few taps',
      color: 'from-orange-400 to-amber-400'
    },
    {
      icon: Users,
      title: 'Priority Access',
      description: 'Special queues for elderly, differently-abled & families',
      color: 'from-purple-400 to-pink-400'
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Real-time crowd management ensures your safety',
      color: 'from-emerald-400 to-teal-400'
    },
    {
      icon: Heart,
      title: 'Emergency Support',
      description: 'Instant SOS alerts to medical & security teams',
      color: 'from-red-400 to-rose-400'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 opacity-70" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-40" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur text-orange-700 text-sm font-medium mb-6 shadow-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live Crowd Updates Available
            </span>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Sacred Journey,
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Simplified</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Book darshan slots, skip long queues, and experience hassle-free pilgrimage with real-time crowd management and priority access.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl('BookDarshan')}>
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-orange-200">
                  <Ticket className="w-5 h-5 mr-2" />
                  Book Darshan Now
                </Button>
              </Link>
              {!user && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 py-6 text-lg border-2 border-orange-200 hover:bg-orange-50"
                  onClick={() => base44.auth.redirectToLogin()}
                >
                  Create Account
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Darshan Seva?</h2>
            <p className="text-gray-600">Technology-enabled pilgrimage experience for peace of mind</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Temples Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Temples</h2>
              <p className="text-gray-600">Book darshan at these sacred destinations</p>
            </div>
            <Link to={createPageUrl('BookDarshan')}>
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {temples.slice(0, 6).map((temple, index) => (
              <motion.div
                key={temple.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="relative h-48 bg-gradient-to-br from-orange-100 to-amber-100">
                    {temple.image_url ? (
                      <img 
                        src={temple.image_url} 
                        alt={temple.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🛕</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-medium text-gray-700">
                        <Clock className="w-3 h-3 mr-1" />
                        {temple.opening_time} - {temple.closing_time}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{temple.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {temple.city}, {temple.state}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">4.8</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <CrowdIndicator level={temple.current_crowd_level || 'low'} size="sm" />
                    </div>

                    <Link to={createPageUrl('BookDarshan') + `?temple=${temple.id}`}>
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full">
                        Book Darshan
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {temples.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-4xl">🛕</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Temples Coming Soon</h3>
              <p className="text-gray-600">We're adding more temples. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-100 overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center shadow-lg">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Emergency? We're Here to Help</h3>
                  <p className="text-gray-600">Instant SOS alerts to medical and security teams</p>
                </div>
              </div>
              <Link to={createPageUrl('EmergencySOS')}>
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 whitespace-nowrap">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Emergency SOS
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
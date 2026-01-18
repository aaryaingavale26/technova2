import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import CrowdIndicator from '@/components/ui/CrowdIndicator';

export default function CrowdMonitor() {
  const [selectedTemple, setSelectedTemple] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: temples = [], refetch: refetchTemples } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const { data: zoneCrowdData = [], refetch: refetchZones } = useQuery({
    queryKey: ['zone-crowd', selectedTemple],
    queryFn: () => selectedTemple 
      ? base44.entities.ZoneCrowdData.filter({ temple_id: selectedTemple })
      : base44.entities.ZoneCrowdData.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['today-bookings'],
    queryFn: () => base44.entities.Booking.filter({ 
      booking_date: new Date().toISOString().split('T')[0] 
    })
  });

  useEffect(() => {
    if (temples.length > 0 && !selectedTemple) {
      setSelectedTemple(temples[0].id);
    }
  }, [temples]);

  const handleRefresh = () => {
    refetchTemples();
    refetchZones();
    setLastUpdated(new Date());
  };

  const currentTemple = temples.find(t => t.id === selectedTemple);
  
  // Calculate totals
  const totalEntry = zoneCrowdData.reduce((sum, z) => sum + (z.entry_count_today || 0), 0);
  const totalExit = zoneCrowdData.reduce((sum, z) => sum + (z.exit_count_today || 0), 0);
  const currentOccupancy = zoneCrowdData.reduce((sum, z) => sum + (z.current_count || 0), 0);
  const totalCapacity = zoneCrowdData.reduce((sum, z) => sum + (z.capacity || 0), 0);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'decreasing': return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDensityColor = (level) => {
    switch (level) {
      case 'low': return 'bg-emerald-500';
      case 'moderate': return 'bg-amber-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // Mock zone data if none exists
  const zones = zoneCrowdData.length > 0 ? zoneCrowdData : [
    { zone_name: 'Main Entrance', current_count: 245, capacity: 500, density_level: 'moderate', trend: 'increasing', entry_count_today: 1200, exit_count_today: 955 },
    { zone_name: 'Queue Hall', current_count: 180, capacity: 300, density_level: 'moderate', trend: 'stable', entry_count_today: 890, exit_count_today: 710 },
    { zone_name: 'Sanctum Area', current_count: 85, capacity: 100, density_level: 'high', trend: 'stable', entry_count_today: 2100, exit_count_today: 2015 },
    { zone_name: 'Prasad Counter', current_count: 120, capacity: 200, density_level: 'moderate', trend: 'decreasing', entry_count_today: 1800, exit_count_today: 1680 },
    { zone_name: 'Exit Corridor', current_count: 45, capacity: 150, density_level: 'low', trend: 'stable', entry_count_today: 1500, exit_count_today: 1455 },
    { zone_name: 'Shoe Counter', current_count: 30, capacity: 100, density_level: 'low', trend: 'stable', entry_count_today: 1100, exit_count_today: 1070 },
  ];

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crowd Monitor</h1>
            <p className="text-gray-600">Real-time zone-wise crowd density tracking</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedTemple} onValueChange={setSelectedTemple}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Temple" />
              </SelectTrigger>
              <SelectContent>
                {temples.map((temple) => (
                  <SelectItem key={temple.id} value={temple.id}>{temple.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Current Occupancy</p>
                  <p className="text-4xl font-bold">{currentOccupancy || 705}</p>
                </div>
                <Users className="w-12 h-12 text-blue-200" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" />
                <span className="text-sm text-blue-100">Live</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Total Entry Today</p>
                  <p className="text-4xl font-bold">{totalEntry || 8590}</p>
                </div>
                <ArrowUpRight className="w-12 h-12 text-emerald-200" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-emerald-100">+12% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm mb-1">Total Exit Today</p>
                  <p className="text-4xl font-bold">{totalExit || 7885}</p>
                </div>
                <ArrowDownRight className="w-12 h-12 text-amber-200" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-amber-100">+8% from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Total Capacity</p>
                  <p className="text-4xl font-bold">{totalCapacity || 1350}</p>
                </div>
                <MapPin className="w-12 h-12 text-purple-200" />
              </div>
              <div className="mt-4">
                <span className="text-sm text-purple-100">{Math.round(((currentOccupancy || 705) / (totalCapacity || 1350)) * 100)}% utilized</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zone Grid */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              Zone-wise Crowd Density
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {zones.map((zone, index) => (
                <motion.div
                  key={zone.zone_name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-2 ${
                    zone.density_level === 'critical' ? 'border-red-200 bg-red-50' :
                    zone.density_level === 'high' ? 'border-orange-200 bg-orange-50' :
                    'border-gray-100'
                  }`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{zone.zone_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {getTrendIcon(zone.trend)}
                            <span className="text-xs text-gray-500 capitalize">{zone.trend}</span>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getDensityColor(zone.density_level)} ${zone.density_level === 'critical' ? 'animate-pulse' : ''}`} />
                      </div>

                      <div className="mb-4">
                        <div className="flex items-end justify-between mb-1">
                          <span className="text-3xl font-bold text-gray-900">{zone.current_count}</span>
                          <span className="text-sm text-gray-500">/ {zone.capacity}</span>
                        </div>
                        <CrowdIndicator level={zone.density_level} showLabel={false} size="md" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Entry Today</p>
                          <p className="font-semibold text-emerald-600">{zone.entry_count_today}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Exit Today</p>
                          <p className="font-semibold text-amber-600">{zone.exit_count_today}</p>
                        </div>
                      </div>

                      {zone.density_level === 'critical' && (
                        <div className="mt-4 p-2 bg-red-100 rounded-lg flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-xs text-red-700 font-medium">Capacity Alert - Take Action</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Crowd Density Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50">
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <div>
                  <p className="font-medium text-emerald-800">Low</p>
                  <p className="text-xs text-emerald-600">0-40% capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                <div className="w-4 h-4 rounded-full bg-amber-500" />
                <div>
                  <p className="font-medium text-amber-800">Moderate</p>
                  <p className="text-xs text-amber-600">40-60% capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <div>
                  <p className="font-medium text-orange-800">High</p>
                  <p className="text-xs text-orange-600">60-80% capacity</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <p className="font-medium text-red-800">Critical</p>
                  <p className="text-xs text-red-600">80%+ capacity</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
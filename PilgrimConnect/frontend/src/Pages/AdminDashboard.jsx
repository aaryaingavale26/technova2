import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Users, 
  Ticket, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  Shield,
  Heart,
  Activity
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import CrowdIndicator from '@/components/ui/CrowdIndicator';
import StatusBadge from '@/components/ui/StatusBadge';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

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

  const { data: bookings = [] } = useQuery({
    queryKey: ['all-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 100)
  });

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.EmergencyAlert.filter({ status: 'reported' })
  });

  const { data: zoneCrowdData = [] } = useQuery({
    queryKey: ['zone-crowd'],
    queryFn: () => base44.entities.ZoneCrowdData.list()
  });

  const todayBookings = bookings.filter(b => 
    b.booking_date === format(new Date(), 'yyyy-MM-dd')
  );

  const checkedIn = todayBookings.filter(b => b.status === 'checked_in').length;
  const totalCapacity = temples.reduce((sum, t) => sum + (t.daily_capacity || 0), 0);

  // Mock hourly data for chart
  const hourlyData = [
    { hour: '6AM', visitors: 120 },
    { hour: '8AM', visitors: 450 },
    { hour: '10AM', visitors: 780 },
    { hour: '12PM', visitors: 650 },
    { hour: '2PM', visitors: 890 },
    { hour: '4PM', visitors: 720 },
    { hour: '6PM', visitors: 540 },
    { hour: '8PM', visitors: 320 },
  ];

  const statusData = [
    { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: '#10b981' },
    { name: 'Checked In', value: bookings.filter(b => b.status === 'checked_in').length, color: '#3b82f6' },
    { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#6b7280' },
    { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#ef4444' },
  ];

  const stats = [
    { 
      title: "Today's Bookings", 
      value: todayBookings.length, 
      icon: Ticket, 
      color: 'from-orange-400 to-amber-400',
      change: '+12%',
      changePositive: true
    },
    { 
      title: 'Current Visitors', 
      value: checkedIn, 
      icon: Users, 
      color: 'from-blue-400 to-indigo-400',
      change: 'Live',
      live: true
    },
    { 
      title: 'Active Alerts', 
      value: alerts.length, 
      icon: AlertTriangle, 
      color: alerts.length > 0 ? 'from-red-400 to-rose-400' : 'from-emerald-400 to-green-400',
      urgent: alerts.length > 0
    },
    { 
      title: 'Total Capacity', 
      value: totalCapacity, 
      icon: MapPin, 
      color: 'from-purple-400 to-violet-400',
      change: 'Per day'
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Temple Dashboard</h1>
          <p className="text-gray-600">Real-time overview of all temple operations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                      {stat.change && (
                        <span className={`inline-flex items-center text-xs mt-2 ${
                          stat.live ? 'text-blue-600' : stat.changePositive ? 'text-emerald-600' : 'text-gray-500'
                        }`}>
                          {stat.live && <span className="w-2 h-2 bg-blue-500 rounded-full mr-1 animate-pulse" />}
                          {stat.change}
                        </span>
                      )}
                    </div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg ${stat.urgent ? 'animate-pulse' : ''}`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hourly Footfall Chart */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-500" />
                Hourly Footfall
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyData}>
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorVisitors)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Booking Status Pie */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-500" />
                Booking Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temple Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Temple Status
              </CardTitle>
              <Link to={createPageUrl('CrowdMonitor')}>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {temples.slice(0, 4).map((temple) => (
                <div key={temple.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                      <span className="text-xl">🛕</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{temple.name}</p>
                      <p className="text-xs text-gray-500">{temple.city}</p>
                    </div>
                  </div>
                  <div className="w-32">
                    <CrowdIndicator level={temple.current_crowd_level || 'low'} size="sm" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Active Alerts
              </CardTitle>
              <Link to={createPageUrl('EmergencyManagement')}>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length > 0 ? (
                alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{alert.alert_type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{alert.description}</p>
                      </div>
                    </div>
                    <StatusBadge status={alert.severity} />
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <p className="font-medium text-gray-900">All Clear</p>
                  <p className="text-sm text-gray-500">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to={createPageUrl('CrowdMonitor')}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Crowd Monitor</span>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('SlotManagement')}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Slot Management</span>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('SecurityDashboard')}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Security</span>
              </CardContent>
            </Card>
          </Link>
          <Link to={createPageUrl('MedicalDashboard')}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700">Medical</span>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Heart, 
  Ambulance, 
  MapPin, 
  Phone,
  Clock,
  Activity,
  Users,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Stethoscope,
  Pill,
  Accessibility
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';

export default function MedicalDashboard() {
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState('');

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const { data: resources = [] } = useQuery({
    queryKey: ['medical-resources', selectedTemple],
    queryFn: () => selectedTemple 
      ? base44.entities.MedicalResource.filter({ temple_id: selectedTemple })
      : base44.entities.MedicalResource.list()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['medical-alerts'],
    queryFn: () => base44.entities.EmergencyAlert.filter({ alert_type: 'medical' })
  });

  useEffect(() => {
    if (temples.length > 0 && !selectedTemple) {
      setSelectedTemple(temples[0].id);
    }
  }, [temples]);

  const updateResourceMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.MedicalResource.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medical-resources']);
    }
  });

  // Mock resources data if none exists
  const mockResources = resources.length > 0 ? resources : [
    { id: '1', resource_type: 'medical_booth', name: 'Medical Booth 1', location_zone: 'Main Entrance', status: 'available', staff_count: 3, contact_number: '+91 98765 11111' },
    { id: '2', resource_type: 'medical_booth', name: 'Medical Booth 2', location_zone: 'Queue Hall', status: 'busy', staff_count: 2, contact_number: '+91 98765 22222' },
    { id: '3', resource_type: 'ambulance', name: 'Ambulance Unit 1', location_zone: 'Parking Area', status: 'available', staff_count: 2, contact_number: '+91 98765 33333' },
    { id: '4', resource_type: 'ambulance', name: 'Ambulance Unit 2', location_zone: 'Emergency Bay', status: 'en_route', staff_count: 2, contact_number: '+91 98765 44444' },
    { id: '5', resource_type: 'first_aid_team', name: 'First Aid Team A', location_zone: 'Sanctum Area', status: 'available', staff_count: 4, contact_number: '+91 98765 55555' },
    { id: '6', resource_type: 'first_aid_team', name: 'First Aid Team B', location_zone: 'Exit Gate', status: 'busy', staff_count: 3, contact_number: '+91 98765 66666' },
    { id: '7', resource_type: 'wheelchair', name: 'Wheelchair Station', location_zone: 'Main Entrance', status: 'available', staff_count: 1, contact_number: '+91 98765 77777' },
    { id: '8', resource_type: 'stretcher', name: 'Stretcher Unit', location_zone: 'Medical Center', status: 'available', staff_count: 2, contact_number: '+91 98765 88888' },
  ];

  const ambulances = mockResources.filter(r => r.resource_type === 'ambulance');
  const booths = mockResources.filter(r => r.resource_type === 'medical_booth');
  const teams = mockResources.filter(r => r.resource_type === 'first_aid_team');
  const equipment = mockResources.filter(r => ['wheelchair', 'stretcher'].includes(r.resource_type));

  const available = mockResources.filter(r => r.status === 'available').length;
  const busy = mockResources.filter(r => r.status === 'busy').length;
  const enRoute = mockResources.filter(r => r.status === 'en_route').length;

  const activeEmergencies = alerts.filter(a => a.status !== 'resolved');

  const getResourceIcon = (type) => {
    switch (type) {
      case 'medical_booth': return <Stethoscope className="w-5 h-5" />;
      case 'ambulance': return <Ambulance className="w-5 h-5" />;
      case 'first_aid_team': return <Heart className="w-5 h-5" />;
      case 'wheelchair': return <Accessibility className="w-5 h-5" />;
      case 'stretcher': return <Activity className="w-5 h-5" />;
      default: return <Pill className="w-5 h-5" />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'medical_booth': return 'from-blue-400 to-indigo-400';
      case 'ambulance': return 'from-red-400 to-rose-400';
      case 'first_aid_team': return 'from-emerald-400 to-green-400';
      case 'wheelchair': return 'from-purple-400 to-violet-400';
      case 'stretcher': return 'from-amber-400 to-orange-400';
      default: return 'from-gray-400 to-slate-400';
    }
  };

  const ResourceCard = ({ resource }) => (
    <Card className={`border-2 ${
      resource.status === 'available' ? 'border-emerald-200' :
      resource.status === 'busy' ? 'border-red-200' :
      resource.status === 'en_route' ? 'border-blue-200 animate-pulse' :
      'border-gray-200'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getResourceColor(resource.resource_type)} flex items-center justify-center text-white shadow-md`}>
            {getResourceIcon(resource.resource_type)}
          </div>
          <StatusBadge status={resource.status} />
        </div>
        
        <h4 className="font-semibold text-gray-900 mb-1">{resource.name}</h4>
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <MapPin className="w-3 h-3" />
          {resource.location_zone}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            <Users className="w-4 h-4 inline mr-1" />
            {resource.staff_count} staff
          </span>
          <a href={`tel:${resource.contact_number}`} className="text-blue-600 hover:text-blue-700">
            <Phone className="w-4 h-4 inline mr-1" />
            Call
          </a>
        </div>

        {resource.status !== 'offline' && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
            {resource.status === 'available' && (
              <Button 
                size="sm" 
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs"
                onClick={() => updateResourceMutation.mutate({ id: resource.id, status: 'en_route' })}
              >
                Dispatch
              </Button>
            )}
            {resource.status === 'en_route' && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => updateResourceMutation.mutate({ id: resource.id, status: 'available' })}
              >
                Mark Available
              </Button>
            )}
            {resource.status === 'busy' && (
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => updateResourceMutation.mutate({ id: resource.id, status: 'available' })}
              >
                Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Medical Dashboard</h1>
            <p className="text-gray-600">Emergency resources and dispatch management</p>
          </div>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-green-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Available</p>
                  <p className="text-4xl font-bold">{available}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm mb-1">Busy</p>
                  <p className="text-4xl font-bold">{busy}</p>
                </div>
                <Activity className="w-12 h-12 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">En Route</p>
                  <p className="text-4xl font-bold">{enRoute}</p>
                </div>
                <Navigation className="w-12 h-12 text-blue-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm mb-1">Active Emergencies</p>
                  <p className="text-4xl font-bold">{activeEmergencies.length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-amber-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Emergencies */}
        {activeEmergencies.length > 0 && (
          <Card className="border-0 shadow-lg border-l-4 border-l-red-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                Active Medical Emergencies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeEmergencies.map((alert) => (
                  <div 
                    key={alert.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{alert.description}</p>
                        <p className="text-sm text-gray-500">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {alert.location_zone} • Reported {format(new Date(alert.created_date), 'hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={alert.status} />
                      <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                        Respond
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources Grid */}
        <div className="space-y-8">
          {/* Ambulances */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-red-500" />
                Ambulances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ambulances.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medical Booths */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-500" />
                Medical Booths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {booths.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* First Aid Teams */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-500" />
                First Aid Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-purple-500" />
                Mobility Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {equipment.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
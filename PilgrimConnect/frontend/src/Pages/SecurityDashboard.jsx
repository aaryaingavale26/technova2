import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, 
  Users, 
  MapPin, 
  AlertTriangle,
  Radio,
  Eye,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SecurityDashboard() {
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState('');

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const { data: personnel = [] } = useQuery({
    queryKey: ['security-personnel', selectedTemple],
    queryFn: () => selectedTemple 
      ? base44.entities.SecurityPersonnel.filter({ temple_id: selectedTemple })
      : base44.entities.SecurityPersonnel.list()
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['security-alerts'],
    queryFn: () => base44.entities.EmergencyAlert.filter({ alert_type: 'security' })
  });

  useEffect(() => {
    if (temples.length > 0 && !selectedTemple) {
      setSelectedTemple(temples[0].id);
    }
  }, [temples]);

  const updatePersonnelMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.SecurityPersonnel.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['security-personnel']);
    }
  });

  // Mock personnel data if none exists
  const mockPersonnel = personnel.length > 0 ? personnel : [
    { id: '1', name: 'Rajesh Kumar', badge_number: 'SP001', role: 'police', assigned_zone: 'Main Entrance', shift: 'morning', status: 'on_duty', contact_number: '+91 98765 43210' },
    { id: '2', name: 'Suresh Sharma', badge_number: 'SP002', role: 'security_guard', assigned_zone: 'Queue Hall', shift: 'morning', status: 'on_duty', contact_number: '+91 98765 43211' },
    { id: '3', name: 'Amit Singh', badge_number: 'SP003', role: 'crowd_controller', assigned_zone: 'Sanctum Area', shift: 'morning', status: 'responding', contact_number: '+91 98765 43212' },
    { id: '4', name: 'Priya Patel', badge_number: 'SP004', role: 'supervisor', assigned_zone: 'All Zones', shift: 'morning', status: 'on_duty', contact_number: '+91 98765 43213' },
    { id: '5', name: 'Vikram Reddy', badge_number: 'SP005', role: 'police', assigned_zone: 'Exit Gate', shift: 'afternoon', status: 'off_duty', contact_number: '+91 98765 43214' },
    { id: '6', name: 'Deepak Verma', badge_number: 'SP006', role: 'emergency_responder', assigned_zone: 'Medical Zone', shift: 'morning', status: 'on_duty', contact_number: '+91 98765 43215' },
  ];

  const onDuty = mockPersonnel.filter(p => p.status === 'on_duty').length;
  const responding = mockPersonnel.filter(p => p.status === 'responding').length;
  const offDuty = mockPersonnel.filter(p => p.status === 'off_duty' || p.status === 'on_break').length;

  const zones = ['Main Entrance', 'Queue Hall', 'Sanctum Area', 'Prasad Counter', 'Exit Gate', 'Parking'];

  const getRoleIcon = (role) => {
    switch (role) {
      case 'police': return '👮';
      case 'security_guard': return '🛡️';
      case 'crowd_controller': return '🚧';
      case 'supervisor': return '⭐';
      case 'emergency_responder': return '🚑';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'police': return 'bg-blue-100 text-blue-700';
      case 'security_guard': return 'bg-purple-100 text-purple-700';
      case 'crowd_controller': return 'bg-orange-100 text-orange-700';
      case 'supervisor': return 'bg-amber-100 text-amber-700';
      case 'emergency_responder': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-gray-600">Personnel deployment and incident management</p>
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
                  <p className="text-emerald-100 text-sm mb-1">On Duty</p>
                  <p className="text-4xl font-bold">{onDuty}</p>
                </div>
                <Shield className="w-12 h-12 text-emerald-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Responding</p>
                  <p className="text-4xl font-bold">{responding}</p>
                </div>
                <Radio className="w-12 h-12 text-blue-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-500 to-slate-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-200 text-sm mb-1">Off Duty</p>
                  <p className="text-4xl font-bold">{offDuty}</p>
                </div>
                <Clock className="w-12 h-12 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm mb-1">Active Incidents</p>
                  <p className="text-4xl font-bold">{alerts.filter(a => a.status !== 'resolved').length}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Zone Deployment */}
          <Card className="border-0 shadow-lg lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Zone Deployment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zones.map((zone) => {
                  const zonePersonnel = mockPersonnel.filter(p => p.assigned_zone === zone || p.assigned_zone === 'All Zones');
                  const onDutyCount = zonePersonnel.filter(p => p.status === 'on_duty' || p.status === 'responding').length;
                  
                  return (
                    <Card key={zone} className="border border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">{zone}</h4>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {onDutyCount} active
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {zonePersonnel.slice(0, 3).map((person) => (
                            <div 
                              key={person.id}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-50"
                            >
                              <span>{getRoleIcon(person.role)}</span>
                              <span className="text-xs text-gray-700">{person.name.split(' ')[0]}</span>
                              <span className={`w-2 h-2 rounded-full ${
                                person.status === 'on_duty' ? 'bg-emerald-500' :
                                person.status === 'responding' ? 'bg-blue-500 animate-pulse' :
                                'bg-gray-300'
                              }`} />
                            </div>
                          ))}
                          {zonePersonnel.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{zonePersonnel.length - 3} more
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Personnel List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {mockPersonnel.map((person) => (
                <div 
                  key={person.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${getRoleColor(person.role)} flex items-center justify-center text-lg`}>
                      {getRoleIcon(person.role)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{person.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{person.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={person.status} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => updatePersonnelMutation.mutate({ id: person.id, status: 'on_duty' })}>
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                          Mark On Duty
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePersonnelMutation.mutate({ id: person.id, status: 'responding' })}>
                          <Radio className="w-4 h-4 mr-2 text-blue-500" />
                          Mark Responding
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePersonnelMutation.mutate({ id: person.id, status: 'on_break' })}>
                          <Clock className="w-4 h-4 mr-2 text-amber-500" />
                          Mark On Break
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="w-4 h-4 mr-2" />
                          Call: {person.contact_number}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Barricade Positions */}
        <Card className="border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-500" />
              Barricade & Control Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {['Entry Gate A', 'Entry Gate B', 'Queue Start', 'Queue Middle', 'Queue End', 'Sanctum Entry', 'Prasad Exit', 'Main Exit'].map((point, index) => (
                <div key={point} className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-orange-300 transition-colors">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-2xl">🚧</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 text-center">{point}</p>
                  <p className="text-xs text-emerald-600 text-center mt-1">Active</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
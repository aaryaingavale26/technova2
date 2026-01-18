import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  MapPin, 
  Phone,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function EmergencyManagement() {
  const queryClient = useQueryClient();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['all-alerts'],
    queryFn: () => base44.entities.EmergencyAlert.list('-created_date', 100)
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      await base44.entities.EmergencyAlert.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-alerts']);
      setSelectedAlert(null);
      setResolutionNotes('');
    }
  });

  const activeAlerts = alerts.filter(a => !['resolved'].includes(a.status));
  const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

  const filteredActive = activeAlerts.filter(a => {
    const typeMatch = filterType === 'all' || a.alert_type === filterType;
    const searchMatch = !searchQuery || 
      a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reported_by_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });

  const getAlertTypeConfig = (type) => {
    const configs = {
      medical: { icon: '🏥', color: 'from-red-400 to-rose-400', bgColor: 'bg-red-50 border-red-200' },
      security: { icon: '🛡️', color: 'from-blue-400 to-indigo-400', bgColor: 'bg-blue-50 border-blue-200' },
      lost_person: { icon: '👤', color: 'from-purple-400 to-violet-400', bgColor: 'bg-purple-50 border-purple-200' },
      fire: { icon: '🔥', color: 'from-orange-400 to-red-400', bgColor: 'bg-orange-50 border-orange-200' },
      stampede: { icon: '⚠️', color: 'from-amber-400 to-orange-400', bgColor: 'bg-amber-50 border-amber-200' },
      other: { icon: '❗', color: 'from-gray-400 to-slate-400', bgColor: 'bg-gray-50 border-gray-200' }
    };
    return configs[type] || configs.other;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-gray-500';
    }
  };

  const handleStatusUpdate = (id, status) => {
    const data = { status };
    if (status === 'resolved') {
      data.resolved_at = new Date().toISOString();
      data.resolution_notes = resolutionNotes;
    }
    updateAlertMutation.mutate({ id, data });
  };

  const AlertCard = ({ alert }) => {
    const config = getAlertTypeConfig(alert.alert_type);
    const timeSinceCreated = Math.round((Date.now() - new Date(alert.created_date).getTime()) / 60000);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        layout
      >
        <Card 
          className={`border-2 cursor-pointer hover:shadow-lg transition-all ${config.bgColor}`}
          onClick={() => setSelectedAlert(alert)}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl shadow-md`}>
                  {config.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {alert.alert_type.replace('_', ' ')} Emergency
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <span className="text-xs text-gray-500 capitalize">{alert.severity} Severity</span>
                  </div>
                </div>
              </div>
              <StatusBadge status={alert.status} />
            </div>

            <p className="text-sm text-gray-700 mb-4 line-clamp-2">{alert.description}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                {alert.location_zone || 'Unknown Location'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                {timeSinceCreated < 60 ? `${timeSinceCreated}m ago` : `${Math.round(timeSinceCreated/60)}h ago`}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                {alert.reported_by_name || 'Anonymous'}
              </div>
              {alert.reported_by_phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {alert.reported_by_phone}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              {alert.status === 'reported' && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(alert.id, 'acknowledged');
                  }}
                >
                  Acknowledge
                </Button>
              )}
              {alert.status === 'acknowledged' && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(alert.id, 'dispatched');
                  }}
                >
                  Dispatch Team
                </Button>
              )}
              {['dispatched', 'in_progress'].includes(alert.status) && (
                <Button 
                  size="sm" 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAlert(alert);
                  }}
                >
                  Resolve
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Emergency Management</h1>
          <p className="text-gray-600">Incident reporting, escalation, and resolution tracking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{alerts.filter(a => a.status === 'reported').length}</p>
              <p className="text-sm text-gray-500">Reported</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{alerts.filter(a => a.status === 'acknowledged').length}</p>
              <p className="text-sm text-gray-500">Acknowledged</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{alerts.filter(a => ['dispatched', 'in_progress'].includes(a.status)).length}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">{resolvedAlerts.length}</p>
              <p className="text-sm text-gray-500">Resolved Today</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search emergencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="lost_person">Lost Person</SelectItem>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="stampede">Stampede</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="bg-gray-100 p-1 rounded-full">
            <TabsTrigger value="active" className="rounded-full data-[state=active]:bg-white">
              Active ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="resolved" className="rounded-full data-[state=active]:bg-white">
              Resolved ({resolvedAlerts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {filteredActive.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredActive.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear</h3>
                  <p className="text-gray-600">No active emergencies at this time</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resolved">
            {resolvedAlerts.length > 0 ? (
              <div className="space-y-4">
                {resolvedAlerts.map((alert) => (
                  <Card key={alert.id} className="border-0 shadow-sm opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getAlertTypeConfig(alert.alert_type).color} flex items-center justify-center text-lg`}>
                            {getAlertTypeConfig(alert.alert_type).icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{alert.alert_type.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{alert.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status="resolved" />
                          <p className="text-xs text-gray-500 mt-1">
                            {alert.resolved_at && format(new Date(alert.resolved_at), 'dd MMM, hh:mm a')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No resolved emergencies</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Resolution Dialog */}
        <Dialog open={!!selectedAlert && ['dispatched', 'in_progress'].includes(selectedAlert?.status)} onOpenChange={() => setSelectedAlert(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Emergency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Emergency Type</Label>
                <p className="text-sm text-gray-600 capitalize">{selectedAlert?.alert_type?.replace('_', ' ')}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm text-gray-600">{selectedAlert?.description}</p>
              </div>
              <div>
                <Label htmlFor="resolution">Resolution Notes *</Label>
                <Textarea
                  id="resolution"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the emergency was resolved..."
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedAlert(null)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={!resolutionNotes || updateAlertMutation.isPending}
                  onClick={() => handleStatusUpdate(selectedAlert.id, 'resolved')}
                >
                  Mark Resolved
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
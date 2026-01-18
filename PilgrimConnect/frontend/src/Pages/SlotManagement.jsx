import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings,
  Plus,
  Minus,
  Lock,
  Unlock,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SlotManagement() {
  const queryClient = useQueryClient();
  const [selectedTemple, setSelectedTemple] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['bookings-for-date', selectedTemple, selectedDate],
    queryFn: () => base44.entities.Booking.filter({ 
      temple_id: selectedTemple, 
      booking_date: selectedDate 
    }),
    enabled: !!selectedTemple
  });

  useEffect(() => {
    if (temples.length > 0 && !selectedTemple) {
      setSelectedTemple(temples[0].id);
    }
  }, [temples]);

  const currentTemple = temples.find(t => t.id === selectedTemple);

  const updateTempleMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Temple.update(selectedTemple, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['temples']);
      toast.success('Temple settings updated');
    }
  });

  // Generate slots based on temple config
  const generateSlots = () => {
    if (!currentTemple) return [];
    const slots = [];
    const startHour = parseInt(currentTemple.opening_time?.split(':')[0]) || 6;
    const endHour = parseInt(currentTemple.closing_time?.split(':')[0]) || 20;
    const duration = currentTemple.slot_duration_minutes || 60;
    const capacity = currentTemple.slot_capacity || 100;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += duration) {
        if (hour * 60 + min + duration <= endHour * 60) {
          const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          const endMin = min + duration;
          const endH = hour + Math.floor(endMin / 60);
          const endM = endMin % 60;
          const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
          const slotTime = `${startTime} - ${endTime}`;
          
          const slotBookings = bookings.filter(b => b.slot_time === slotTime);
          const booked = slotBookings.reduce((sum, b) => sum + (b.group_size || 1), 0);
          
          slots.push({
            time: slotTime,
            startTime,
            booked,
            capacity,
            available: capacity - booked,
            percentage: Math.round((booked / capacity) * 100)
          });
        }
      }
    }
    return slots;
  };

  const slots = generateSlots();
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const getSlotColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-gray-50 to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Slot Management</h1>
            <p className="text-gray-600">Configure and manage darshan time slots</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Temple Config */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Slot Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={currentTemple?.opening_time || '06:00'}
                    onChange={(e) => updateTempleMutation.mutate({ opening_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={currentTemple?.closing_time || '20:00'}
                    onChange={(e) => updateTempleMutation.mutate({ closing_time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Slot Duration (minutes)</Label>
                  <Select 
                    value={(currentTemple?.slot_duration_minutes || 60).toString()} 
                    onValueChange={(v) => updateTempleMutation.mutate({ slot_duration_minutes: parseInt(v) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Capacity per Slot</Label>
                  <div className="flex items-center gap-3 mt-1">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => updateTempleMutation.mutate({ 
                        slot_capacity: Math.max(10, (currentTemple?.slot_capacity || 100) - 10) 
                      })}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={currentTemple?.slot_capacity || 100}
                      onChange={(e) => updateTempleMutation.mutate({ slot_capacity: parseInt(e.target.value) })}
                      className="text-center"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => updateTempleMutation.mutate({ 
                        slot_capacity: (currentTemple?.slot_capacity || 100) + 10 
                      })}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mandatory Booking */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-orange-500" />
                  Crowd Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mandatory Pre-Booking</Label>
                    <p className="text-sm text-gray-500">Enforce slot booking during peak hours</p>
                  </div>
                  <Switch
                    checked={currentTemple?.is_mandatory_booking || false}
                    onCheckedChange={(checked) => updateTempleMutation.mutate({ is_mandatory_booking: checked })}
                  />
                </div>
                
                {currentTemple?.is_mandatory_booking && (
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 text-amber-700 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">Booking Enforced</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      Only pilgrims with confirmed bookings will be allowed entry
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Summary */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700">{bookings.length}</p>
                    <p className="text-sm text-blue-600">Total Bookings</p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <p className="text-2xl font-bold text-emerald-700">
                      {slots.reduce((sum, s) => sum + s.available, 0)}
                    </p>
                    <p className="text-sm text-emerald-600">Slots Available</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-2xl font-bold text-orange-700">
                      {bookings.filter(b => b.priority_access).length}
                    </p>
                    <p className="text-sm text-orange-600">Priority Access</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-2xl font-bold text-purple-700">{slots.length}</p>
                    <p className="text-sm text-purple-600">Total Slots</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Slot Grid */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Slot Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Date Selector */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {dates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                      className={`flex-shrink-0 p-3 rounded-xl border-2 text-center transition-all ${
                        selectedDate === format(date, 'yyyy-MM-dd')
                          ? 'border-orange-400 bg-orange-50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                      <div className="text-lg font-bold text-gray-900">{format(date, 'd')}</div>
                      <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                    </button>
                  ))}
                </div>

                {/* Slots Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {slots.map((slot, index) => (
                    <motion.div
                      key={slot.time}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className={`border-2 ${
                        slot.percentage >= 90 ? 'border-red-200 bg-red-50' :
                        slot.percentage >= 70 ? 'border-orange-200 bg-orange-50' :
                        'border-gray-100'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-900">{slot.startTime}</span>
                            <Badge className={`${getSlotColor(slot.percentage)} text-white`}>
                              {slot.percentage}%
                            </Badge>
                          </div>
                          
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div 
                              className={`h-full transition-all ${getSlotColor(slot.percentage)}`}
                              style={{ width: `${slot.percentage}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              <span className="font-medium">{slot.booked}</span>/{slot.capacity}
                            </span>
                            <span className={`font-medium ${
                              slot.available === 0 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {slot.available === 0 ? 'Full' : `${slot.available} left`}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {slots.length === 0 && (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No slots configured for this temple</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
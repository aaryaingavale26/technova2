import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, parse } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  CreditCard,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion, AnimatePresence } from 'framer-motion';
import CrowdIndicator from '@/components/ui/CrowdIndicator';
import QRTicket from '@/components/booking/QRTicket';

export default function BookDarshan() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedTemple = urlParams.get('temple');

  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [selectedTemple, setSelectedTemple] = useState(preselectedTemple || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [pilgrimData, setPilgrimData] = useState({
    full_name: '',
    phone: '',
    email: '',
    id_type: 'aadhaar',
    id_number: '',
    age: '',
    gender: 'male',
    priority_category: 'none',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [groupSize, setGroupSize] = useState(1);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setPilgrimData(prev => ({
          ...prev,
          full_name: userData.full_name || '',
          email: userData.email || ''
        }));
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const selectedTempleData = temples.find(t => t.id === selectedTemple);

  // Generate time slots based on temple config
  const generateSlots = () => {
    if (!selectedTempleData) return [];
    const slots = [];
    const startHour = parseInt(selectedTempleData.opening_time?.split(':')[0]) || 6;
    const endHour = parseInt(selectedTempleData.closing_time?.split(':')[0]) || 20;
    const duration = selectedTempleData.slot_duration_minutes || 60;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += duration) {
        if (hour * 60 + min + duration <= endHour * 60) {
          const startTime = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          const endMin = min + duration;
          const endH = hour + Math.floor(endMin / 60);
          const endM = endMin % 60;
          const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
          slots.push({
            time: `${startTime} - ${endTime}`,
            available: Math.floor(Math.random() * (selectedTempleData.slot_capacity || 100)),
            capacity: selectedTempleData.slot_capacity || 100
          });
        }
      }
    }
    return slots;
  };

  const slots = generateSlots();

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const createBookingMutation = useMutation({
    mutationFn: async (data) => {
      // First create or find pilgrim
      const pilgrims = await base44.entities.Pilgrim.filter({ id_number: pilgrimData.id_number });
      let pilgrimId;
      
      if (pilgrims.length > 0) {
        pilgrimId = pilgrims[0].id;
        await base44.entities.Pilgrim.update(pilgrimId, pilgrimData);
      } else {
        const newPilgrim = await base44.entities.Pilgrim.create(pilgrimData);
        pilgrimId = newPilgrim.id;
      }

      // Create booking
      const ticketNumber = `DS${Date.now().toString(36).toUpperCase()}`;
      const booking = await base44.entities.Booking.create({
        pilgrim_id: pilgrimId,
        temple_id: selectedTemple,
        booking_date: selectedDate,
        slot_time: selectedSlot,
        ticket_number: ticketNumber,
        qr_code: ticketNumber,
        status: 'confirmed',
        priority_access: pilgrimData.priority_category !== 'none',
        group_size: groupSize,
        pilgrim_name: pilgrimData.full_name,
        pilgrim_phone: pilgrimData.phone
      });

      // Create notification
      await base44.entities.Notification.create({
        recipient_id: pilgrimId,
        recipient_type: 'pilgrim',
        title: 'Booking Confirmed!',
        message: `Your darshan at ${selectedTempleData?.name} is confirmed for ${format(new Date(selectedDate), 'dd MMM yyyy')} at ${selectedSlot}`,
        type: 'booking_confirmation',
        priority: 'normal'
      });

      return booking;
    },
    onSuccess: (booking) => {
      setBookingComplete(booking);
      setStep(4);
    }
  });

  const handleSubmit = () => {
    createBookingMutation.mutate();
  };

  const priorityOptions = [
    { value: 'none', label: 'Regular Devotee' },
    { value: 'elderly', label: 'Senior Citizen (60+)', icon: '👴' },
    { value: 'differently_abled', label: 'Differently Abled', icon: '♿' },
    { value: 'women_with_children', label: 'Women with Children', icon: '👩‍👧' }
  ];

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Select Temple
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedTemple} onValueChange={setSelectedTemple}>
                {temples.map((temple) => (
                  <div key={temple.id} className="relative">
                    <RadioGroupItem value={temple.id} id={temple.id} className="peer sr-only" />
                    <Label
                      htmlFor={temple.id}
                      className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 cursor-pointer transition-all peer-data-[state=checked]:border-orange-400 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
                        {temple.image_url ? (
                          <img src={temple.image_url} alt={temple.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-3xl">🛕</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{temple.name}</h4>
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm">4.8</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{temple.city}, {temple.state}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {temple.opening_time} - {temple.closing_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {temple.slot_capacity}/slot
                          </span>
                        </div>
                        <div className="mt-2">
                          <CrowdIndicator level={temple.current_crowd_level || 'low'} size="sm" />
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {temples.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No temples available at the moment</p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full py-6"
                disabled={!selectedTemple}
                onClick={() => setStep(2)}
              >
                Continue <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Select Date & Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Choose Date</Label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(format(date, 'yyyy-MM-dd'))}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
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
              </div>

              {/* Slot Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Choose Time Slot</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const isAvailable = slot.available > 0;
                      const isFilling = slot.available < slot.capacity * 0.3;
                      return (
                        <button
                          key={slot.time}
                          onClick={() => isAvailable && setSelectedSlot(slot.time)}
                          disabled={!isAvailable}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            selectedSlot === slot.time
                              ? 'border-orange-400 bg-orange-50'
                              : isAvailable
                                ? 'border-gray-100 hover:border-orange-200'
                                : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">{slot.time.split(' - ')[0]}</span>
                            {isFilling && isAvailable && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Filling Fast</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {isAvailable ? `${slot.available} slots left` : 'Fully Booked'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Group Size */}
              {selectedSlot && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Number of Pilgrims</Label>
                  <Select value={groupSize.toString()} onValueChange={(v) => setGroupSize(parseInt(v))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? 'Person' : 'People'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full py-6" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full py-6"
                  disabled={!selectedDate || !selectedSlot}
                  onClick={() => setStep(3)}
                >
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                Pilgrim Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={pilgrimData.full_name}
                    onChange={(e) => setPilgrimData({ ...pilgrimData, full_name: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={pilgrimData.phone}
                    onChange={(e) => setPilgrimData({ ...pilgrimData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={pilgrimData.email}
                    onChange={(e) => setPilgrimData({ ...pilgrimData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={pilgrimData.age}
                    onChange={(e) => setPilgrimData({ ...pilgrimData, age: e.target.value })}
                    placeholder="Enter age"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>ID Type *</Label>
                  <Select value={pilgrimData.id_type} onValueChange={(v) => setPilgrimData({ ...pilgrimData, id_type: v })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="voter_id">Voter ID</SelectItem>
                      <SelectItem value="driving_license">Driving License</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="id_number">ID Number *</Label>
                  <Input
                    id="id_number"
                    value={pilgrimData.id_number}
                    onChange={(e) => setPilgrimData({ ...pilgrimData, id_number: e.target.value })}
                    placeholder="Enter ID number"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Priority Category */}
              <div>
                <Label className="mb-3 block">Priority Access Category</Label>
                <RadioGroup 
                  value={pilgrimData.priority_category} 
                  onValueChange={(v) => setPilgrimData({ ...pilgrimData, priority_category: v })}
                  className="grid grid-cols-2 gap-3"
                >
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="relative">
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label
                        htmlFor={option.value}
                        className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-100 cursor-pointer transition-all peer-data-[state=checked]:border-orange-400 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50"
                      >
                        {option.icon && <span>{option.icon}</span>}
                        <span className="text-sm">{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_name">Contact Name</Label>
                    <Input
                      id="emergency_name"
                      value={pilgrimData.emergency_contact_name}
                      onChange={(e) => setPilgrimData({ ...pilgrimData, emergency_contact_name: e.target.value })}
                      placeholder="Emergency contact name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_phone">Contact Phone</Label>
                    <Input
                      id="emergency_phone"
                      value={pilgrimData.emergency_contact_phone}
                      onChange={(e) => setPilgrimData({ ...pilgrimData, emergency_contact_phone: e.target.value })}
                      placeholder="Emergency phone number"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedTerms}
                  onCheckedChange={setAgreedTerms}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the terms and conditions and confirm that all details provided are accurate. I understand that my ID will be verified at the entry gate.
                </Label>
              </div>

              {/* Booking Summary */}
              <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temple</span>
                      <span className="font-medium">{selectedTempleData?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date</span>
                      <span className="font-medium">{selectedDate && format(new Date(selectedDate), 'dd MMM yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Slot</span>
                      <span className="font-medium">{selectedSlot}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pilgrims</span>
                      <span className="font-medium">{groupSize}</span>
                    </div>
                    {pilgrimData.priority_category !== 'none' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority Access</span>
                        <span className="font-medium text-orange-600">✓ Yes</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full py-6" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full py-6"
                  disabled={!pilgrimData.full_name || !pilgrimData.phone || !pilgrimData.id_number || !agreedTerms || createBookingMutation.isPending}
                  onClick={handleSubmit}
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking <CheckCircle className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <CardContent className="py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-8">Your darshan has been successfully booked</p>
              
              {bookingComplete && (
                <QRTicket 
                  booking={bookingComplete} 
                  temple={selectedTempleData}
                  pilgrim={pilgrimData}
                />
              )}

              <div className="mt-6 space-y-3">
                <p className="text-sm text-gray-500">
                  A confirmation has been sent to your phone and email
                </p>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => window.location.href = createPageUrl('MyBookings')}
                >
                  View All Bookings
                </Button>
              </div>
            </CardContent>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step >= s 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s}
                  </div>
                  {s < 3 && (
                    <div className={`w-16 h-1 rounded-full transition-all ${
                      step > s ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gray-100'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-center gap-8 mt-2 text-xs text-gray-500">
              <span>Temple</span>
              <span>Date & Time</span>
              <span>Details</span>
            </div>
          </div>
        )}

        <Card className="border-0 shadow-xl">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}
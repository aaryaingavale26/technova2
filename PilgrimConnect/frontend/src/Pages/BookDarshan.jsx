import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, addDays } from 'date-fns';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight,
  CheckCircle,
  AlertCircle,
  User,
  Star,
  Loader2
} from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { motion, AnimatePresence } from 'framer-motion';
// Make sure these components exist or comment them out if not
import CrowdIndicator from '@/Components/ui/CrowdIndication'; 

// --- UPDATED MOCK DATA WITH YOUR IMAGES ---
const MOCK_TEMPLES = [
  {
    id: '1',
    name: 'Shri Kashi Vishwanath',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    opening_time: '04:00',
    closing_time: '23:00',
    slot_capacity: 500,
    current_crowd_level: 'high',
    // Updated Image for Kashi Vishwanath
    image_url: 'https://tse4.mm.bing.net/th/id/OIP.eo2cs79eahrwSqoVwMgtQgHaFA?pid=Api&P=0&h=180'
  },
  {
    id: '2',
    name: 'Siddhivinayak Temple',
    city: 'Mumbai',
    state: 'Maharashtra',
    opening_time: '05:30',
    closing_time: '21:00',
    slot_capacity: 300,
    current_crowd_level: 'moderate',
    // Updated Image for Siddhivinayak
    image_url: 'https://tse2.mm.bing.net/th/id/OIP.Amu06Ha4uxQv5kC00P-HhAHaGT?pid=Api&P=0&h=180'
  }
];

export default function BookDarshan() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTemple, setSelectedTemple] = useState('');
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

  // Get selected temple details
  const selectedTempleData = MOCK_TEMPLES.find(t => t.id === selectedTemple);

  // Generate time slots based on temple config
  const generateSlots = () => {
    if (!selectedTempleData) return [];
    const slots = [];
    const startHour = parseInt(selectedTempleData.opening_time?.split(':')[0]) || 6;
    const endHour = parseInt(selectedTempleData.closing_time?.split(':')[0]) || 20;
    
    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        time: `${startTime} - ${endTime}`,
        available: Math.floor(Math.random() * 50) + 10, // Mock availability
        capacity: selectedTempleData.slot_capacity
      });
    }
    return slots;
  };

  const slots = generateSlots();
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare payload matches Backend Schema
      const payload = {
        full_name: pilgrimData.full_name,
        booking_date: selectedDate,
        slot_time: selectedSlot,
        members: groupSize,
        special_needs: pilgrimData.priority_category !== 'none' ? pilgrimData.priority_category : 'None'
      };

      // Connects to your running Backend
      const response = await axios.post('/darshan', payload);

      if (response.status === 200 || response.status === 201) {
        setBookingComplete({ ...payload, ticket_number: "TKT-" + Date.now() });
        setStep(4);
      }
    } catch (error) {
      console.error("Booking Error:", error);
      alert("Failed to book darshan. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
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
                {MOCK_TEMPLES.map((temple) => (
                  <div key={temple.id} className="relative">
                    <RadioGroupItem value={temple.id} id={temple.id} className="peer sr-only" />
                    <Label
                      htmlFor={temple.id}
                      className="flex items-start gap-4 p-4 rounded-xl border-2 border-gray-100 cursor-pointer transition-all peer-data-[state=checked]:border-orange-400 peer-data-[state=checked]:bg-orange-50 hover:bg-gray-50"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                        {temple.image_url ? (
                          <img 
                            src={temple.image_url} 
                            alt={temple.name} 
                            className="w-full h-full object-cover" 
                          />
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
                          <CrowdIndicator level={temple.current_crowd_level} size="sm" />
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

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
                  {availableDates.map((date) => {
                    const formatted = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(formatted)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          selectedDate === formatted
                            ? 'border-orange-400 bg-orange-50'
                            : 'border-gray-100 hover:border-orange-200'
                        }`}
                      >
                        <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                        <div className="text-lg font-bold text-gray-900">{format(date, 'd')}</div>
                        <div className="text-xs text-gray-500">{format(date, 'MMM')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Choose Time Slot</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {slots.map((slot) => {
                      const isAvailable = slot.available > 0;
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

              {/* Terms */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedTerms}
                  onCheckedChange={setAgreedTerms}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the terms and conditions and confirm that all details provided are accurate.
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
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-full py-6" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full py-6"
                  disabled={!pilgrimData.full_name || !pilgrimData.phone || !agreedTerms || loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
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
              
              <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                <p><strong>Name:</strong> {bookingComplete?.full_name}</p>
                <p><strong>Date:</strong> {bookingComplete?.booking_date}</p>
                <p><strong>Time:</strong> {bookingComplete?.slot_time}</p>
                <p><strong>Ticket ID:</strong> {bookingComplete?.ticket_number}</p>
              </div>

              <Button 
                variant="outline" 
                className="rounded-full w-full"
                onClick={() => window.location.href = '/'}
              >
                Go to Home
              </Button>
            </CardContent>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
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
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Heart, 
  Shield, 
  Users, 
  Flame,
  HelpCircle,
  Loader2,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencySOS() {
  const [user, setUser] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setContactName(userData.full_name || '');
      } catch (e) {}
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enter manually.');
        }
      );
    }
  }, []);

  const { data: temples = [] } = useQuery({
    queryKey: ['temples'],
    queryFn: () => base44.entities.Temple.list()
  });

  const emergencyTypes = [
    { value: 'medical', label: 'Medical Emergency', icon: Heart, color: 'from-red-500 to-rose-500', description: 'Health issues, injuries, or need medical assistance' },
    { value: 'security', label: 'Security Issue', icon: Shield, color: 'from-blue-500 to-indigo-500', description: 'Theft, harassment, or safety concerns' },
    { value: 'lost_person', label: 'Lost Person', icon: Users, color: 'from-purple-500 to-violet-500', description: 'Lost child, elderly, or family member' },
    { value: 'fire', label: 'Fire Emergency', icon: Flame, color: 'from-orange-500 to-red-500', description: 'Fire or smoke detected' },
    { value: 'stampede', label: 'Crowd Emergency', icon: AlertTriangle, color: 'from-amber-500 to-orange-500', description: 'Stampede risk or overcrowding' },
    { value: 'other', label: 'Other Emergency', icon: HelpCircle, color: 'from-gray-500 to-slate-500', description: 'Any other emergency situation' }
  ];

  const createAlertMutation = useMutation({
    mutationFn: async () => {
      const alert = await base44.entities.EmergencyAlert.create({
        temple_id: temples[0]?.id || '',
        pilgrim_id: user?.id || '',
        alert_type: selectedType,
        severity: ['fire', 'stampede'].includes(selectedType) ? 'critical' : 'high',
        description: description,
        location_zone: 'Detected via GPS',
        gps_coordinates: location ? `${location.lat},${location.lng}` : '',
        status: 'reported',
        reported_by_name: contactName,
        reported_by_phone: contactPhone
      });

      // Create notification for admins
      await base44.entities.Notification.create({
        recipient_id: 'admin',
        recipient_type: 'admin',
        title: `🚨 ${selectedType.toUpperCase()} EMERGENCY`,
        message: `${description}. Contact: ${contactName} (${contactPhone})`,
        type: 'emergency',
        priority: 'urgent'
      });

      return alert;
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = () => {
    if (selectedType && description && contactPhone) {
      createAlertMutation.mutate();
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-8 text-center text-white">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Help is on the Way!</h2>
              <p className="text-white/90">Your emergency has been reported</p>
            </div>
            <CardContent className="p-6 text-center">
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Alert Reference</p>
                  <p className="font-mono font-bold text-lg text-gray-900">SOS-{Date.now().toString(36).toUpperCase()}</p>
                </div>
                <p className="text-sm text-gray-600">
                  Emergency response team has been notified. Stay calm and stay where you are if it's safe.
                </p>
              </div>
              
              <div className="p-4 bg-red-50 rounded-xl mb-6">
                <p className="text-sm font-medium text-red-800 mb-2">Emergency Helplines</p>
                <div className="flex flex-col gap-2">
                  <a href="tel:112" className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                    <Phone className="w-4 h-4" /> 112 - Emergency
                  </a>
                  <a href="tel:108" className="flex items-center justify-center gap-2 text-red-600 font-semibold">
                    <Heart className="w-4 h-4" /> 108 - Ambulance
                  </a>
                </div>
              </div>

              <Button 
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="rounded-full"
              >
                Report Another Emergency
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency SOS</h1>
          <p className="text-gray-600">Get immediate help from medical and security teams</p>
        </div>

        {/* Quick Call Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <a href="tel:112">
            <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Phone className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-bold text-red-700">112</p>
                <p className="text-xs text-red-600">Emergency</p>
              </CardContent>
            </Card>
          </a>
          <a href="tel:108">
            <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 hover:shadow-lg transition-all cursor-pointer">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="font-bold text-pink-700">108</p>
                <p className="text-xs text-pink-600">Ambulance</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Emergency Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Report Emergency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Emergency Type */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Type of Emergency *</Label>
              <RadioGroup value={selectedType} onValueChange={setSelectedType} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {emergencyTypes.map((type) => (
                  <div key={type.value} className="relative">
                    <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                    <Label
                      htmlFor={type.value}
                      className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-100 cursor-pointer transition-all peer-data-[state=checked]:border-red-400 peer-data-[state=checked]:bg-red-50 hover:bg-gray-50"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2 shadow-md`}>
                        <type.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 text-center">{type.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Describe the Emergency *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened and any immediate needs..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* Location */}
            <div className="p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <Label className="font-medium text-blue-800">Your Location</Label>
              </div>
              {location ? (
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-gray-600">Location detected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                </div>
              ) : (
                <p className="text-sm text-blue-600">{locationError || 'Detecting your location...'}</p>
              )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactName">Your Name *</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone Number *</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedType || !description || !contactPhone || createAlertMutation.isPending}
              className="w-full bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white py-6 rounded-full text-lg font-semibold shadow-lg shadow-red-200"
            >
              {createAlertMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending Alert...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Send Emergency Alert
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By submitting, you confirm this is a genuine emergency. False alerts may result in penalties.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
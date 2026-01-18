import React from 'react';
import { format } from 'date-fns';
import { QrCode, Calendar, Clock, MapPin, User, Ticket } from 'lucide-react';
import { Card } from "@/components/ui/card";
import StatusBadge from '@/components/ui/StatusBadge';

export default function QRTicket({ booking, temple, pilgrim }) {
  // Generate a simple QR-like pattern using the ticket number
  const generateQRPattern = () => {
    const ticketNum = booking.ticket_number || 'UNKNOWN';
    const pattern = [];
    for (let i = 0; i < 64; i++) {
      const charCode = ticketNum.charCodeAt(i % ticketNum.length) || 0;
      pattern.push((charCode + i) % 2 === 0);
    }
    return pattern;
  };

  const qrPattern = generateQRPattern();

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-amber-50 border-2 border-amber-200 shadow-xl max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-2xl">🙏</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">Darshan Seva</h3>
              <p className="text-xs text-white/80">E-Darshan Pass</p>
            </div>
          </div>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* QR Code Section */}
      <div className="p-6 flex flex-col items-center border-b border-dashed border-amber-200">
        <div className="w-40 h-40 bg-white rounded-xl shadow-inner p-3 mb-4">
          <div className="w-full h-full grid grid-cols-8 gap-0.5">
            {qrPattern.map((filled, i) => (
              <div 
                key={i} 
                className={`rounded-sm ${filled ? 'bg-gray-900' : 'bg-gray-100'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Ticket className="w-4 h-4" />
          <span className="font-mono font-semibold">{booking.ticket_number}</span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Temple</p>
            <p className="font-semibold text-gray-800">{temple?.name || 'Temple Name'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-semibold text-gray-800">
                {booking.booking_date ? format(new Date(booking.booking_date), 'dd MMM yyyy') : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Time Slot</p>
              <p className="font-semibold text-gray-800">{booking.slot_time}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-amber-100">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Pilgrim</p>
            <p className="font-semibold text-gray-800">{booking.pilgrim_name || pilgrim?.full_name}</p>
            {booking.priority_access && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 mt-1">
                ⭐ Priority Access
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-50 px-6 py-3 text-center">
        <p className="text-xs text-amber-700">
          Please arrive 30 minutes before your slot time • Keep this pass ready for verification
        </p>
      </div>
    </Card>
  );
}
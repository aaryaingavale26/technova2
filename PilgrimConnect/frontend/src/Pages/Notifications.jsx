import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  Ticket, 
  Users,
  CheckCheck,
  Trash2,
  Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const queryClient = useQueryClient();
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

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter({ recipient_id: user.id }, '-created_date'),
    enabled: !!user
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notification.update(id, { is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notification.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'entry_reminder': return { icon: Calendar, color: 'from-blue-400 to-indigo-400' };
      case 'delay_alert': return { icon: Users, color: 'from-amber-400 to-orange-400' };
      case 'crowd_warning': return { icon: Users, color: 'from-orange-400 to-red-400' };
      case 'emergency': return { icon: AlertTriangle, color: 'from-red-400 to-rose-400' };
      case 'booking_confirmation': return { icon: Ticket, color: 'from-emerald-400 to-green-400' };
      default: return { icon: Bell, color: 'from-gray-400 to-slate-400' };
    }
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readNotifications = notifications.filter(n => n.is_read);

  const NotificationCard = ({ notification }) => {
    const { icon: Icon, color } = getNotificationIcon(notification.type);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
      >
        <Card 
          className={`border-0 shadow-sm hover:shadow-md transition-all ${!notification.is_read ? 'bg-orange-50/50' : ''}`}
          onClick={() => !notification.is_read && markReadMutation.mutate(notification.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {format(new Date(notification.created_date), 'dd MMM, hh:mm a')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotificationMutation.mutate(notification.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600">Stay updated on your bookings and alerts</p>
          </div>
          {unreadNotifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="w-full bg-gray-100 p-1 rounded-full">
            <TabsTrigger value="all" className="flex-1 rounded-full data-[state=active]:bg-white">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1 rounded-full data-[state=active]:bg-white">
              Unread ({unreadNotifications.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            <AnimatePresence>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <Bell className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                    <p className="text-gray-600">You're all caught up!</p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="unread" className="space-y-3">
            <AnimatePresence>
              {unreadNotifications.length > 0 ? (
                unreadNotifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))
              ) : (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                      <CheckCheck className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-600">No unread notifications</p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
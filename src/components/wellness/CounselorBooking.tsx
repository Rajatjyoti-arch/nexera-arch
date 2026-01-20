import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isBefore, startOfToday, parseISO } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  X,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  useAssignedCounselor,
  useStudentAppointments,
  useBookAppointment,
  useCancelAppointment,
  generateTimeSlots,
  CounselorAppointment,
} from '@/hooks/useCounselorBooking';

const timeSlots = generateTimeSlots(9, 17, 30);

export default function CounselorBooking() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  
  const { data: counselor, isLoading: counselorLoading } = useAssignedCounselor();
  const { data: appointments = [], isLoading: appointmentsLoading } = useStudentAppointments();
  const bookAppointment = useBookAppointment();
  const cancelAppointment = useCancelAppointment();
  
  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));
  
  const upcomingAppointments = appointments.filter(
    apt => apt.status !== 'cancelled' && !isBefore(parseISO(apt.appointment_date), today)
  );
  
  const pastAppointments = appointments.filter(
    apt => apt.status === 'completed' || isBefore(parseISO(apt.appointment_date), today)
  );
  
  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !counselor) return;
    
    const endTime = timeSlots[timeSlots.indexOf(selectedTime) + 1] || '17:00';
    
    await bookAppointment.mutateAsync({
      counselor_id: counselor.user_id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedTime,
      end_time: endTime,
      reason: reason || undefined,
    });
    
    setIsBookingOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setReason('');
  };
  
  const handleCancel = async (id: string) => {
    await cancelAppointment.mutateAsync(id);
  };
  
  const getStatusBadge = (status: CounselorAppointment['status']) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return styles[status];
  };
  
  if (counselorLoading || appointmentsLoading) {
    return (
      <div className="premium-card card-rose p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }
  
  return (
    <section className="space-y-6">
      <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
        <Calendar className="w-4 h-4" />
        Counselor Sessions
      </h2>
      
      {/* Assigned Counselor Card */}
      {counselor ? (
        <div className="premium-card card-rose p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-rose-500/20">
                <AvatarImage src={counselor.avatar_url || undefined} />
                <AvatarFallback className="bg-rose-500/10 text-rose-500 font-bold">
                  {counselor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-foreground">{counselor.name}</h3>
                <p className="text-xs text-foreground/70">{counselor.specialization || 'Wellness Counselor'}</p>
                {counselor.office_hours && (
                  <p className="text-[10px] text-foreground/60 mt-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {counselor.office_hours}
                  </p>
                )}
              </div>
            </div>
            
            <Button
              onClick={() => setIsBookingOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-black font-bold text-xs"
            >
              Book Session
            </Button>
          </div>
        </div>
      ) : (
        <div className="premium-card card-amber p-6">
          <div className="flex items-start gap-4">
            <div className="icon-box">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-500 mb-1">No Counselor Assigned</p>
              <p className="text-[11px] text-foreground/80">
                Contact your administrator to get assigned to a counselor for wellness support.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">
            Upcoming Sessions
          </h3>
          {upcomingAppointments.map((apt) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="premium-card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-rose-500 uppercase">
                    {format(parseISO(apt.appointment_date), 'MMM')}
                  </span>
                  <span className="text-lg font-bold text-rose-500">
                    {format(parseISO(apt.appointment_date), 'd')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {apt.counselor?.name || 'Counselor'}
                  </p>
                  <p className="text-[10px] text-foreground/70">
                    {apt.start_time} - {apt.end_time}
                  </p>
                  {apt.reason && (
                    <p className="text-[10px] text-foreground/60 mt-0.5 truncate max-w-[200px]">
                      {apt.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('text-[9px] uppercase tracking-widest', getStatusBadge(apt.status))}>
                  {apt.status}
                </Badge>
                {apt.status === 'pending' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-foreground/60 hover:text-red-500"
                    onClick={() => handleCancel(apt.id)}
                    disabled={cancelAppointment.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Past Appointments Summary */}
      {pastAppointments.length > 0 && (
        <div className="text-center py-4 border-t border-border">
          <p className="text-[10px] text-foreground/60">
            <CheckCircle className="w-3 h-3 inline mr-1" />
            {pastAppointments.length} completed session{pastAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
      
      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && counselor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsBookingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Book a Session</h3>
                  <p className="text-xs text-foreground/70">with {counselor.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsBookingOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Modal Content */}
              <ScrollArea className="max-h-[60vh]">
                <div className="p-6 space-y-6">
                  {/* Date Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-foreground/80 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Select Date
                      </h4>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                          disabled={weekOffset === 0}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setWeekOffset(weekOffset + 1)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {weekDays.map((day) => {
                        const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                        
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() => !isWeekend && setSelectedDate(day)}
                            disabled={isWeekend}
                            className={cn(
                              'flex flex-col items-center p-2 rounded-xl transition-all',
                              isSelected
                                ? 'bg-rose-500 text-black'
                                : isWeekend
                                  ? 'bg-secondary/30 text-foreground/30 cursor-not-allowed'
                                  : 'bg-secondary/50 hover:bg-secondary text-foreground'
                            )}
                          >
                            <span className="text-[9px] font-bold uppercase">
                              {format(day, 'EEE')}
                            </span>
                            <span className="text-sm font-bold">
                              {format(day, 'd')}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Time Selection */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <h4 className="text-[10px] font-black text-foreground/80 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Clock className="w-3 h-3" />
                        Select Time
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.slice(0, -1).map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={cn(
                              'p-2 rounded-lg text-xs font-medium transition-all',
                              selectedTime === time
                                ? 'bg-rose-500 text-black'
                                : 'bg-secondary/50 hover:bg-secondary text-foreground'
                            )}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Reason */}
                  {selectedTime && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                    >
                      <h4 className="text-[10px] font-black text-foreground/80 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <MessageSquare className="w-3 h-3" />
                        Reason (Optional)
                      </h4>
                      <Textarea
                        placeholder="Briefly describe what you'd like to discuss..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="resize-none text-sm"
                        rows={3}
                      />
                    </motion.div>
                  )}
                </div>
              </ScrollArea>
              
              {/* Modal Footer */}
              <div className="p-6 border-t border-border flex items-center justify-between">
                <div className="text-xs text-foreground/70">
                  {selectedDate && selectedTime ? (
                    <>
                      {format(selectedDate, 'EEEE, MMM d')} at {selectedTime}
                    </>
                  ) : (
                    'Select date and time'
                  )}
                </div>
                <Button
                  onClick={handleBook}
                  disabled={!selectedDate || !selectedTime || bookAppointment.isPending}
                  className="bg-rose-500 hover:bg-rose-600 text-black font-bold"
                >
                  {bookAppointment.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

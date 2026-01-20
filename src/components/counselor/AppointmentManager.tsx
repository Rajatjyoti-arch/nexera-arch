import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isBefore, startOfToday, addDays } from 'date-fns';
import {
  Calendar,
  Clock,
  CheckCircle,
  X,
  MessageSquare,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  useCounselorAppointments,
  useConfirmAppointment,
  useRescheduleAppointment,
  useCompleteAppointment,
  useCounselorCancelAppointment,
  CounselorAppointmentWithStudent,
} from '@/hooks/useCounselorAppointments';
import { generateTimeSlots } from '@/hooks/useCounselorBooking';
import { useNavigate } from 'react-router-dom';

const timeSlots = generateTimeSlots(9, 17, 30);

export default function CounselorAppointmentManager() {
  const navigate = useNavigate();
  const { data: appointments = [], isLoading } = useCounselorAppointments();
  const confirmAppointment = useConfirmAppointment();
  const rescheduleAppointment = useRescheduleAppointment();
  const completeAppointment = useCompleteAppointment();
  const cancelAppointment = useCounselorCancelAppointment();
  
  const [rescheduleModal, setRescheduleModal] = useState<CounselorAppointmentWithStudent | null>(null);
  const [completeModal, setCompleteModal] = useState<CounselorAppointmentWithStudent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  
  const today = startOfToday();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));
  
  const pendingAppointments = appointments.filter(
    apt => apt.status === 'pending' && !isBefore(parseISO(apt.appointment_date), today)
  );
  
  const upcomingAppointments = appointments.filter(
    apt => apt.status === 'confirmed' && !isBefore(parseISO(apt.appointment_date), today)
  );
  
  const pastAppointments = appointments.filter(
    apt => apt.status === 'completed' || (apt.status !== 'cancelled' && isBefore(parseISO(apt.appointment_date), today))
  );
  
  const handleConfirm = async (id: string) => {
    await confirmAppointment.mutateAsync(id);
  };
  
  const handleCancel = async (id: string) => {
    await cancelAppointment.mutateAsync(id);
  };
  
  const handleReschedule = async () => {
    if (!rescheduleModal || !selectedDate || !selectedTime) return;
    
    const endTime = timeSlots[timeSlots.indexOf(selectedTime) + 1] || '17:00';
    
    await rescheduleAppointment.mutateAsync({
      appointmentId: rescheduleModal.id,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      start_time: selectedTime,
      end_time: endTime,
      notes: notes || undefined,
    });
    
    setRescheduleModal(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setNotes('');
  };
  
  const handleComplete = async () => {
    if (!completeModal) return;
    
    await completeAppointment.mutateAsync({
      appointmentId: completeModal.id,
      notes: notes || undefined,
    });
    
    setCompleteModal(null);
    setNotes('');
  };
  
  const handleStartChat = (studentId: string) => {
    navigate('/counselor/chats', { state: { studentId } });
  };
  
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
      completed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    };
    return styles[status] || styles.pending;
  };
  
  const AppointmentCard = ({ appointment }: { appointment: CounselorAppointmentWithStudent }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-secondary/30 border border-border/50 space-y-3"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={appointment.student?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {appointment.student?.name?.charAt(0) || 'S'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{appointment.student?.name || 'Unknown Student'}</p>
            <p className="text-xs text-muted-foreground">
              {appointment.student?.course} • {appointment.student?.year}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-xs capitalize', getStatusBadge(appointment.status))}>
          {appointment.status}
        </Badge>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {appointment.start_time} - {appointment.end_time}
        </div>
      </div>
      
      {appointment.reason && (
        <p className="text-sm text-muted-foreground bg-secondary/50 p-2 rounded-lg">
          <FileText className="w-3 h-3 inline mr-1" />
          {appointment.reason}
        </p>
      )}
      
      {/* Actions based on status */}
      <div className="flex flex-wrap gap-2 pt-2">
        {appointment.status === 'pending' && (
          <>
            <Button
              size="sm"
              onClick={() => handleConfirm(appointment.id)}
              disabled={confirmAppointment.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {confirmAppointment.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirm
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRescheduleModal(appointment)}
            >
              <CalendarClock className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCancel(appointment.id)}
              disabled={cancelAppointment.isPending}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </>
        )}
        
        {appointment.status === 'confirmed' && (
          <>
            <Button
              size="sm"
              onClick={() => setCompleteModal(appointment)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Mark Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStartChat(appointment.student_id)}
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Chat
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRescheduleModal(appointment)}
            >
              <CalendarClock className="w-4 h-4 mr-1" />
              Reschedule
            </Button>
          </>
        )}
        
        {appointment.status === 'completed' && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStartChat(appointment.student_id)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Message Student
          </Button>
        )}
      </div>
    </motion.div>
  );
  
  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <div className="space-y-6">
        {/* Pending Requests */}
        {pendingAppointments.length > 0 && (
          <Card className="glass-card border-amber-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <Clock className="w-5 h-5" />
                Pending Requests ({pendingAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Upcoming Sessions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Sessions ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming sessions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Past Sessions */}
        {pastAppointments.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-5 h-5" />
                Past Sessions ({pastAppointments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-4">
                  {pastAppointments.slice(0, 10).map(apt => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Reschedule Modal */}
      <Dialog open={!!rescheduleModal} onOpenChange={() => setRescheduleModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {rescheduleModal && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rescheduleModal.student?.avatar_url || undefined} />
                  <AvatarFallback>{rescheduleModal.student?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{rescheduleModal.student?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Current: {format(parseISO(rescheduleModal.appointment_date), 'MMM d')} at {rescheduleModal.start_time}
                  </p>
                </div>
              </div>
            )}
            
            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium">New Date</p>
                <div className="flex gap-1">
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
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => !isWeekend && setSelectedDate(day)}
                      disabled={isWeekend}
                      className={cn(
                        'flex flex-col items-center p-2 rounded-lg transition-all text-xs',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : isWeekend
                            ? 'bg-secondary/30 text-muted-foreground/50'
                            : 'bg-secondary/50 hover:bg-secondary'
                      )}
                    >
                      <span className="font-medium">{format(day, 'EEE')}</span>
                      <span>{format(day, 'd')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Time Selection */}
            {selectedDate && (
              <div>
                <p className="text-sm font-medium mb-3">New Time</p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.slice(0, -1).map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        'p-2 rounded-lg text-xs font-medium transition-all',
                        selectedTime === time
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 hover:bg-secondary'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            <div>
              <p className="text-sm font-medium mb-2">Notes (Optional)</p>
              <Textarea
                placeholder="Add a note for the student..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleReschedule}
                disabled={!selectedDate || !selectedTime || rescheduleAppointment.isPending}
                className="flex-1"
              >
                {rescheduleAppointment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirm Reschedule'
                )}
              </Button>
              <Button variant="outline" onClick={() => setRescheduleModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Complete Session Modal */}
      <Dialog open={!!completeModal} onOpenChange={() => setCompleteModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {completeModal && (
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={completeModal.student?.avatar_url || undefined} />
                  <AvatarFallback>{completeModal.student?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{completeModal.student?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(parseISO(completeModal.appointment_date), 'MMM d, yyyy')} at {completeModal.start_time}
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium mb-2">Session Notes (Optional)</p>
              <Textarea
                placeholder="Add notes about this session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleComplete}
                disabled={completeAppointment.isPending}
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {completeAppointment.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setCompleteModal(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

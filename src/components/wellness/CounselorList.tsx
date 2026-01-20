import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  Star, 
  Clock, 
  Loader2,
  ChevronRight,
  Heart,
  GraduationCap,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAvailableCounselors, CounselorProfile } from '@/hooks/useCounselorBooking';
import { useNavigate } from 'react-router-dom';

const specializationIcons: Record<string, React.ElementType> = {
  'Mental Health': Heart,
  'Academic': GraduationCap,
  'Career': Briefcase,
  'default': Users,
};

export default function CounselorList() {
  const navigate = useNavigate();
  const { data: counselors = [], isLoading } = useAvailableCounselors();
  const [selectedCounselor, setSelectedCounselor] = useState<CounselorProfile | null>(null);
  
  const handleStartChat = (counselor: CounselorProfile) => {
    navigate('/student/chats', { state: { startChatWith: counselor.user_id, counselorName: counselor.name } });
  };
  
  if (isLoading) {
    return (
      <section className="space-y-6">
        <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
          <Users className="w-4 h-4" />
          Available Counselors
        </h2>
        <div className="premium-card p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      </section>
    );
  }
  
  if (counselors.length === 0) {
    return (
      <section className="space-y-6">
        <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
          <Users className="w-4 h-4" />
          Available Counselors
        </h2>
        <div className="premium-card card-amber p-6">
          <p className="text-sm text-foreground/70 text-center">
            No counselors available at the moment. Check back later!
          </p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="space-y-6">
      <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] flex items-center gap-3">
        <Users className="w-4 h-4" />
        Available Counselors
      </h2>
      
      <div className="space-y-3">
        {counselors.map((counselor, index) => {
          const Icon = specializationIcons[counselor.specialization || ''] || specializationIcons.default;
          const isSelected = selectedCounselor?.user_id === counselor.user_id;
          
          return (
            <motion.div
              key={counselor.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'premium-card p-4 cursor-pointer transition-all',
                isSelected ? 'ring-2 ring-violet-500/50 card-violet' : 'hover:bg-secondary/50'
              )}
              onClick={() => setSelectedCounselor(isSelected ? null : counselor)}
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-violet-500/20">
                  <AvatarImage src={counselor.avatar_url || undefined} />
                  <AvatarFallback className="bg-violet-500/10 text-violet-500 font-bold">
                    {counselor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-foreground truncate">{counselor.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-[9px] uppercase tracking-widest shrink-0',
                        counselor.availability_status === 'available' 
                          ? 'border-emerald-500 text-emerald-500' 
                          : 'border-amber-500 text-amber-500'
                      )}
                    >
                      {counselor.availability_status || 'Available'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="w-3 h-3 text-foreground/60" />
                    <p className="text-xs text-foreground/70">
                      {counselor.specialization || 'General Counseling'}
                    </p>
                  </div>
                  
                  {counselor.office_hours && (
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-foreground/60" />
                      <p className="text-[10px] text-foreground/60">{counselor.office_hours}</p>
                    </div>
                  )}
                </div>
                
                <ChevronRight className={cn(
                  'w-5 h-5 text-foreground/40 transition-transform',
                  isSelected && 'rotate-90'
                )} />
              </div>
              
              {/* Expanded Details */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-border space-y-4"
                >
                  {counselor.qualifications && (
                    <div>
                      <p className="text-[10px] font-black text-foreground/60 uppercase tracking-widest mb-1">
                        Qualifications
                      </p>
                      <p className="text-xs text-foreground/80">{counselor.qualifications}</p>
                    </div>
                  )}
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartChat(counselor);
                    }}
                    className="w-full bg-violet-500 hover:bg-violet-600 text-black font-bold"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

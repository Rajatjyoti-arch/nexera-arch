import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CounselorLayout from "@/components/layouts/CounselorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Save, 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap,
  Clock,
  Languages,
  Calendar,
  Loader2
} from "lucide-react";

interface CounselorProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
  designation: string | null;
  specialization: string | null;
  qualifications: string | null;
  office_hours: string | null;
  availability_status: string;
  years_of_experience: number | null;
  languages_spoken: string[] | null;
  bio: string | null;
}

export default function CounselorProfile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CounselorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('counselor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [user?.id]);

  const handleSave = async () => {
    if (!profile || !user?.id) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('counselor_profiles')
      .update({
        name: profile.name,
        department: profile.department,
        designation: profile.designation,
        specialization: profile.specialization,
        qualifications: profile.qualifications,
        office_hours: profile.office_hours,
        availability_status: profile.availability_status,
        years_of_experience: profile.years_of_experience,
        languages_spoken: profile.languages_spoken,
        bio: profile.bio,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully",
      });
      updateUser({ name: profile.name });
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({
        title: "Upload Failed",
        description: uploadError.message,
        variant: "destructive",
      });
    } else {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase
        .from('counselor_profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
      updateUser({ avatar: avatarUrl });

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated",
      });
    }
    setIsUploadingAvatar(false);
  };

  if (isLoading) {
    return (
      <CounselorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CounselorLayout>
    );
  }

  return (
    <CounselorLayout>
      <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your counselor profile</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card">
              <CardContent className="p-6 text-center space-y-4">
                <div className="relative inline-block">
                  <Avatar className="w-32 h-32 border-4 border-rose-500/50">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl bg-rose-500/20 text-rose-400">
                      {profile?.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors">
                    {isUploadingAvatar ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{profile?.name}</h3>
                  <p className="text-muted-foreground">{profile?.designation}</p>
                </div>
                <Badge 
                  variant={profile?.availability_status === 'available' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {profile?.availability_status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2"
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="h-11 bg-secondary/50"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input
                      id="designation"
                      value={profile?.designation || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, designation: e.target.value } : null)}
                      placeholder="e.g., Senior Counselor"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={profile?.department || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, department: e.target.value } : null)}
                      placeholder="e.g., Student Welfare"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={profile?.specialization || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, specialization: e.target.value } : null)}
                      placeholder="e.g., Academic Counseling, Mental Health"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={profile?.years_of_experience || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, years_of_experience: parseInt(e.target.value) || null } : null)}
                      placeholder="e.g., 5"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input
                      id="qualifications"
                      value={profile?.qualifications || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, qualifications: e.target.value } : null)}
                      placeholder="e.g., M.A. Psychology, Ph.D."
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="office_hours">Office Hours</Label>
                    <Input
                      id="office_hours"
                      value={profile?.office_hours || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, office_hours: e.target.value } : null)}
                      placeholder="e.g., Mon-Fri, 9 AM - 5 PM"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability Status</Label>
                  <Select
                    value={profile?.availability_status}
                    onValueChange={(value) => setProfile(prev => prev ? { ...prev, availability_status: value } : null)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    placeholder="Tell students about yourself and your counseling approach..."
                    rows={4}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full h-12 bg-gradient-to-r from-rose-500 to-pink-500"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </CounselorLayout>
  );
}
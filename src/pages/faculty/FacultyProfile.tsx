import { useState, useEffect, useRef } from "react";
import FacultyLayout from "@/components/layouts/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Save, X, Loader2, Camera, Mail, Building2, Briefcase, Clock, BookOpen } from "lucide-react";
import { useFacultyFullProfile, useUpdateFacultyProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function FacultyProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading, refetch } = useFacultyFullProfile();
  const updateProfile = useUpdateFacultyProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    department: "",
    designation: "",
    office_hours: "",
  });

  useEffect(() => {
    if (profile) {
      setEditData({
        name: profile.name || "",
        department: profile.department || "",
        designation: profile.designation || "",
        office_hours: profile.office_hours || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!editData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    try {
      await updateProfile.mutateAsync({
        name: editData.name.trim(),
        department: editData.department.trim() || null,
        designation: editData.designation.trim() || null,
        office_hours: editData.office_hours.trim() || null,
      });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      toast.success("Avatar updated successfully");
      refetch();
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (profile) {
      setEditData({
        name: profile.name || "",
        department: profile.department || "",
        designation: profile.designation || "",
        office_hours: profile.office_hours || "",
      });
    }
  };

  if (isLoading) {
    return (
      <FacultyLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </FacultyLayout>
    );
  }

  return (
    <FacultyLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="ghost" size="sm" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateProfile.isPending}
                size="sm"
                className="gap-2"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="p-6 animate-fade-in">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">
                  {(profile?.name || "F").split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            
            {isEditing ? (
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-4 text-center text-xl font-semibold max-w-xs"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-2xl font-semibold mt-4">{profile?.name || "Faculty"}</h2>
            )}
            
            {profile?.designation && (
              <Badge variant="secondary" className="mt-2">
                {profile.designation}
              </Badge>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-5">
            {/* Email - Read only */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-foreground">{profile?.email || user?.email}</p>
              </div>
            </div>
            
            {/* Department */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Department</Label>
                {isEditing ? (
                  <Input
                    value={editData.department}
                    onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                    placeholder="e.g., Computer Science"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground">{profile?.department || <span className="text-muted-foreground italic">Not set</span>}</p>
                )}
              </div>
            </div>
            
            {/* Designation */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Designation</Label>
                {isEditing ? (
                  <Input
                    value={editData.designation}
                    onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                    placeholder="e.g., Associate Professor"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground">{profile?.designation || <span className="text-muted-foreground italic">Not set</span>}</p>
                )}
              </div>
            </div>
            
            {/* Subjects */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Subjects</Label>
                {profile?.subjects && profile.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.subjects.map((subject, idx) => (
                      <Badge key={idx} variant="outline">{subject}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No subjects assigned</p>
                )}
              </div>
            </div>
            
            {/* Office Hours */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Office Hours</Label>
                {isEditing ? (
                  <Input
                    value={editData.office_hours}
                    onChange={(e) => setEditData({ ...editData, office_hours: e.target.value })}
                    placeholder="e.g., Mon-Fri: 2:00 PM - 4:00 PM"
                    className="mt-1"
                  />
                ) : (
                  <p className="text-foreground">{profile?.office_hours || <span className="text-muted-foreground italic">Not set</span>}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Account Status</p>
              <p className="font-medium capitalize">{profile?.status || 'Active'}</p>
            </div>
            <Badge variant={profile?.status === 'active' ? 'default' : 'secondary'}>
              {profile?.status === 'active' ? '✓ Verified' : profile?.status || 'Pending'}
            </Badge>
          </div>
        </Card>
      </div>
    </FacultyLayout>
  );
}

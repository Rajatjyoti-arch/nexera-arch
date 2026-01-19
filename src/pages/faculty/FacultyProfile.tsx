import { useState, useEffect } from "react";
import FacultyLayout from "@/components/layouts/FacultyLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit2, Save, X, Loader2 } from "lucide-react";
import { useFacultyFullProfile, useUpdateFacultyProfile } from "@/hooks/useProfile";

export default function FacultyProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useFacultyFullProfile();
  const updateProfile = useUpdateFacultyProfile();
  
  const [isEditing, setIsEditing] = useState(false);
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
    await updateProfile.mutateAsync({
      name: editData.name,
      department: editData.department || null,
      designation: editData.designation || null,
      office_hours: editData.office_hours || null,
    });
    setIsEditing(false);
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
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold">My Profile</h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={updateProfile.isPending}
                size="sm"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        <Card className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-faculty text-faculty-foreground text-2xl">
                {(profile?.name || "F").split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            {isEditing ? (
              <Input
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="mt-4 text-center text-xl font-semibold max-w-xs"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-xl font-semibold mt-4">{profile?.name || "Faculty"}</h2>
            )}
            <p className="text-foreground/60">{profile?.designation || "Faculty"}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-foreground/60">{profile?.email || user?.email}</p>
            </div>
            
            <div>
              <Label>Department</Label>
              {isEditing ? (
                <Input
                  value={editData.department}
                  onChange={(e) => setEditData({ ...editData, department: e.target.value })}
                  placeholder="e.g., Computer Science"
                />
              ) : (
                <p className="text-foreground/60">{profile?.department || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label>Designation</Label>
              {isEditing ? (
                <Input
                  value={editData.designation}
                  onChange={(e) => setEditData({ ...editData, designation: e.target.value })}
                  placeholder="e.g., Associate Professor"
                />
              ) : (
                <p className="text-foreground/60">{profile?.designation || "Not set"}</p>
              )}
            </div>
            
            <div>
              <Label>Subjects</Label>
              <p className="text-foreground/60">
                {profile?.subjects?.join(", ") || "No subjects assigned"}
              </p>
            </div>
            
            <div>
              <Label>Office Hours</Label>
              {isEditing ? (
                <Input
                  value={editData.office_hours}
                  onChange={(e) => setEditData({ ...editData, office_hours: e.target.value })}
                  placeholder="e.g., Mon-Fri: 2:00 PM - 4:00 PM"
                />
              ) : (
                <p className="text-foreground/60">{profile?.office_hours || "Not set"}</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </FacultyLayout>
  );
}

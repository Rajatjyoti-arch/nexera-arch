import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { authService, SignUpData } from '@/services/auth.service';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  role: UserRole;
  avatar?: string;
  college?: string;
  course?: string;
  year?: string;
  department?: string;
  designation?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  signup: (data: SignUpData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch full user profile based on role
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const role = await authService.getUserRole(supabaseUser.id);
    
    if (!role) {
      // Fallback to metadata if role not in DB yet
      const metaRole = supabaseUser.user_metadata?.role as UserRole;
      if (metaRole) {
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
          username: supabaseUser.user_metadata?.username,
          role: metaRole,
        };
      }
      return null;
    }

    let profile: User = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: '',
      role,
    };

    if (role === 'student') {
      const studentProfile = await authService.getStudentProfile(supabaseUser.id);
      if (studentProfile) {
        profile = {
          ...profile,
          name: studentProfile.name,
          username: studentProfile.username,
          avatar: studentProfile.avatar_url || undefined,
          college: studentProfile.college || undefined,
          course: studentProfile.course || undefined,
          year: studentProfile.year || undefined,
        };
      }
    } else if (role === 'faculty') {
      const facultyProfile = await authService.getFacultyProfile(supabaseUser.id);
      if (facultyProfile) {
        profile = {
          ...profile,
          name: facultyProfile.name,
          avatar: facultyProfile.avatar_url || undefined,
          department: facultyProfile.department || undefined,
          designation: facultyProfile.designation || undefined,
        };
      }
    } else if (role === 'admin') {
      const adminProfile = await authService.getAdminProfile(supabaseUser.id);
      if (adminProfile) {
        profile = {
          ...profile,
          name: adminProfile.name,
          avatar: adminProfile.avatar_url || undefined,
          department: adminProfile.department || undefined,
        };
      }
    }

    return profile;
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchUserProfile(newSession.user).then(profile => {
              setUser(profile);
              setIsLoading(false);
            });
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchUserProfile(existingSession.user).then(profile => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string, _role?: UserRole) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      // Auth state change will handle the rest
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      await authService.signUp(data);
      // Auth state change will handle the rest
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
    setSession(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        isAuthenticated: !!user && !!session, 
        isLoading, 
        login, 
        signup, 
        logout, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

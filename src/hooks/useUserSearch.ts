import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchableUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'student' | 'faculty' | 'admin';
  department?: string | null;
  course?: string | null;
}

export function useUserSearch(query: string, debounceMs: number = 300) {
  const { user } = useAuth();
  const [results, setResults] = useState<SearchableUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchTerm = `%${query.toLowerCase()}%`;

        // Search students, faculty, and admins in parallel
        const [studentsResult, facultyResult, adminsResult] = await Promise.all([
          supabase
            .from('student_profiles')
            .select('user_id, name, email, avatar_url, course')
            .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .neq('user_id', user?.id || '')
            .limit(10),
          supabase
            .from('faculty_profiles')
            .select('user_id, name, email, avatar_url, department')
            .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .neq('user_id', user?.id || '')
            .limit(10),
          supabase
            .from('admin_profiles')
            .select('user_id, name, email, avatar_url, department')
            .or(`name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .neq('user_id', user?.id || '')
            .limit(5),
        ]);

        const users: SearchableUser[] = [];

        // Add students
        (studentsResult.data || []).forEach(s => {
          users.push({
            id: s.user_id,
            name: s.name,
            email: s.email,
            avatarUrl: s.avatar_url,
            role: 'student',
            course: s.course,
          });
        });

        // Add faculty
        (facultyResult.data || []).forEach(f => {
          users.push({
            id: f.user_id,
            name: f.name,
            email: f.email,
            avatarUrl: f.avatar_url,
            role: 'faculty',
            department: f.department,
          });
        });

        // Add admins
        (adminsResult.data || []).forEach(a => {
          users.push({
            id: a.user_id,
            name: a.name,
            email: a.email,
            avatarUrl: a.avatar_url,
            role: 'admin',
            department: a.department,
          });
        });

        setResults(users);
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, user?.id, debounceMs]);

  return { results, isLoading };
}

// Get all users for selection (useful for group creation)
export function useAllUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<SearchableUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const [studentsResult, facultyResult, adminsResult] = await Promise.all([
          supabase
            .from('student_profiles')
            .select('user_id, name, email, avatar_url, course')
            .neq('user_id', user?.id || '')
            .limit(50),
          supabase
            .from('faculty_profiles')
            .select('user_id, name, email, avatar_url, department')
            .neq('user_id', user?.id || '')
            .limit(50),
          supabase
            .from('admin_profiles')
            .select('user_id, name, email, avatar_url, department')
            .neq('user_id', user?.id || '')
            .limit(20),
        ]);

        const allUsers: SearchableUser[] = [];

        (studentsResult.data || []).forEach(s => {
          allUsers.push({
            id: s.user_id,
            name: s.name,
            email: s.email,
            avatarUrl: s.avatar_url,
            role: 'student',
            course: s.course,
          });
        });

        (facultyResult.data || []).forEach(f => {
          allUsers.push({
            id: f.user_id,
            name: f.name,
            email: f.email,
            avatarUrl: f.avatar_url,
            role: 'faculty',
            department: f.department,
          });
        });

        (adminsResult.data || []).forEach(a => {
          allUsers.push({
            id: a.user_id,
            name: a.name,
            email: a.email,
            avatarUrl: a.avatar_url,
            role: 'admin',
            department: a.department,
          });
        });

        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) {
      fetchUsers();
    }
  }, [user?.id]);

  return { users, isLoading };
}

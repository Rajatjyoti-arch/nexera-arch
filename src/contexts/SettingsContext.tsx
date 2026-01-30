import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';

export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: Theme;
  notifications_notices: boolean;
  notifications_messages: boolean;
  notifications_reminders: boolean;
  sound_effects: boolean;
  language: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  notifications_notices: true,
  notifications_messages: true,
  notifications_reminders: true,
  sound_effects: true,
  language: 'en',
};

interface SettingsContextType {
  settings: UserSettings;
  isLoading: boolean;
  isSaving: boolean;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  effectiveTheme: 'light' | 'dark';
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface SettingsProviderProps {
  children: ReactNode;
  user?: User | null;
}

export function SettingsProvider({ children, user }: SettingsProviderProps) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  // Calculate effective theme
  const effectiveTheme = settings.theme === 'system' ? systemTheme : settings.theme;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Fetch settings on user change
  useEffect(() => {
    async function fetchSettings() {
      if (!user?.id) {
        setSettings(DEFAULT_SETTINGS);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setSettings({
            theme: (data.theme as Theme) || 'system',
            notifications_notices: data.notifications_notices ?? true,
            notifications_messages: data.notifications_messages ?? true,
            notifications_reminders: data.notifications_reminders ?? true,
            sound_effects: data.sound_effects ?? true,
            language: data.language || 'en',
          });
        } else {
          // Create default settings for new user
          const { error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              ...DEFAULT_SETTINGS,
            });

          if (insertError) {
            console.error('Failed to create default settings:', insertError);
          }
          setSettings(DEFAULT_SETTINGS);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [user?.id]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user?.id) return;

    // Optimistic update
    setSettings(prev => ({ ...prev, ...updates }));
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update settings:', error);
      // Revert on error
      setSettings(prev => prev);
    } finally {
      setIsSaving(false);
    }
  }, [user?.id]);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, isSaving, updateSettings, effectiveTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

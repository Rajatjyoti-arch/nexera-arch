import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Debug:', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: supabaseAnonKey ? 'Found' : 'Missing',
    mode: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Supabase keys are missing in this environment.');
}

// Prevent crash by using fallback if keys are missing, though calls will fail
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);

// Helper to check if supabase is properly configured
export const isSupabaseConfigured = () => {
    return (
        !!import.meta.env.VITE_SUPABASE_URL &&
        !!import.meta.env.VITE_SUPABASE_ANON_KEY
    );
};

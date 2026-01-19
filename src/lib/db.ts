import { supabase, isSupabaseConfigured } from './supabase';

interface LocalStorageTable {
  select: (query?: string) => Promise<{ data: any[]; error: null }>;
  insert: (values: any) => Promise<{ data: any; error: null }>;
  update: (values: any) => { match: (filter: any) => Promise<{ data: any; error: null }> };
  delete: () => { match: (filter: any) => Promise<{ data: null; error: null }> };
}

// Generic DB interface to handle both Supabase and LocalStorage fallback
export const db = {
  from(table: string): ReturnType<typeof supabase.from> | LocalStorageTable {
    if (isSupabaseConfigured()) {
      return supabase.from(table);
    }

    // Fallback to LocalStorage for a "zero-setup" experience
    return {
      select: async (query = '*') => {
        const data = JSON.parse(localStorage.getItem(`db_${table}`) || '[]');
        return { data, error: null };
      },
      insert: async (values: any) => {
        const data = JSON.parse(localStorage.getItem(`db_${table}`) || '[]');
        const newRecords = Array.isArray(values) ? values : [values];
        const updated = [...data, ...newRecords];
        localStorage.setItem(`db_${table}`, JSON.stringify(updated));
        return { data: newRecords, error: null };
      },
      update: (values: any) => ({
        match: async (filter: any) => {
          let data = JSON.parse(localStorage.getItem(`db_${table}`) || '[]');
          const key = Object.keys(filter)[0];
          data = data.map((item: any) => item[key] === filter[key] ? { ...item, ...values } : item);
          localStorage.setItem(`db_${table}`, JSON.stringify(data));
          return { data: values, error: null };
        }
      }),
      delete: () => ({
        match: async (filter: any) => {
          let data = JSON.parse(localStorage.getItem(`db_${table}`) || '[]');
          const key = Object.keys(filter)[0];
          data = data.filter((item: any) => item[key] !== filter[key]);
          localStorage.setItem(`db_${table}`, JSON.stringify(data));
          return { data: null, error: null };
        }
      })
    };
  }
};

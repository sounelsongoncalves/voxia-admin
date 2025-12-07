import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  client = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Missing Supabase environment variables. Using mock client.');
  // Create a proxy to safely handle missing Supabase connection without crashing
  const mockHandler = {
    get: (target: any, prop: string) => {
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
          signInWithPassword: async () => ({ data: null, error: { message: 'Supabase não configurado (Missing ENV vars)' } }),
          signOut: async () => ({ error: null }),
        };
      }
      if (prop === 'from') {
        return () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: { message: 'Supabase não configurado' } }),
              order: async () => ({ data: [], error: null }),
            }),
            order: async () => ({ data: [], error: null }),
          }),
          insert: async () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
          update: async () => ({ eq: async () => ({ error: null }) }),
        });
      }
      return target[prop];
    },
  };
  client = new Proxy({} as any, mockHandler);
}

// Expose for debug/admin creation
(window as any).supabase = client;

export const supabase = client;

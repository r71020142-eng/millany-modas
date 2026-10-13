import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://snmxdjwtnmhzumqdzjwn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNubXhkand0bm1oenVtcWR6anduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1ODQxOTAsImV4cCI6MjEwNzE2MDE5MH0.lNhJnD0Xn895nl5PdYxOnMAVzw-Nw40xgU4nbMsmD7M';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// app/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/utils/supabase_types';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../safe_constants';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Use this command to generate Supabase types
// PROJECT_REF="PROJECT_ID"
// npx supabase gen types typescript --project-id "$PROJECT_REF" --schema public > app/supabase_types.ts

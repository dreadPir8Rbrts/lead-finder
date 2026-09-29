import { createClient } from '@supabase/supabase-js'

// Server-only client — uses service_role key, never imported in client components
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

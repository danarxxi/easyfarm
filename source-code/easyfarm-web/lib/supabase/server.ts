import { createClient } from '@supabase/supabase-js'

// 서버 전용 (API Route에서 사용) — service_role 키로 RLS 우회
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

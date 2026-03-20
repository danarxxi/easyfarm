import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { AlertLog } from '@/types'

export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('alert_logs')
    .select('*, plants(name)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const alerts: AlertLog[] = (data ?? []).map((row) => ({
    id: row.id,
    plantId: row.plant_id,
    plantName: (row.plants as { name: string } | null)?.name ?? '알 수 없음',
    type: row.type,
    message: row.message,
    timestamp: row.created_at,
    resolved: row.resolved,
  }))

  return NextResponse.json(alerts)
}

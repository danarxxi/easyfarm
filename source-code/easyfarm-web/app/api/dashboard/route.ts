import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/types'

export async function GET() {
  const supabase = createServerClient()

  const [plantsResult, todayWateringResult, activeLedResult] = await Promise.all([
    supabase.from('plants_with_status').select('status'),
    // 오늘 자동 급수 횟수
    supabase
      .from('alert_logs')
      .select('id', { count: 'exact', head: true })
      .eq('type', 'auto_watering')
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    // 현재 LED ON 식물 수
    supabase
      .from('latest_sensor_per_plant')
      .select('plant_id', { count: 'exact', head: true })
      .eq('led_state', true),
  ])

  const plants = plantsResult.data ?? []
  const stats: DashboardStats = {
    total: plants.length,
    normal: plants.filter((p) => p.status === 'normal').length,
    warning: plants.filter((p) => p.status === 'warning').length,
    danger: plants.filter((p) => p.status === 'danger').length,
    todayWateringCount: todayWateringResult.count ?? 0,
    activeLedCount: activeLedResult.count ?? 0,
  }

  return NextResponse.json(stats)
}

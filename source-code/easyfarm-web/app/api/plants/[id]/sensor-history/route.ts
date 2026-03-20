import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { SensorData } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()

  // 최근 24시간 데이터 조회
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .eq('plant_id', id)
    .gte('recorded_at', since)
    .order('recorded_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const history: SensorData[] = (data ?? []).map((row) => ({
    temperature: row.temperature,
    humidity: row.humidity,
    soilMoisture: row.soil_moisture,
    ledState: row.led_state,
    timestamp: row.recorded_at,
  }))

  return NextResponse.json(history)
}

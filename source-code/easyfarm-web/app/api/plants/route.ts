import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { Plant } from '@/types'

export async function GET() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('plants_with_status')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const plants: Plant[] = (data ?? []).map(mapRowToPlant)
  return NextResponse.json(plants)
}

// DB row → 프론트 타입 변환
export function mapRowToPlant(row: Record<string, unknown>): Plant {
  return {
    id: row.id as string,
    name: row.name as string,
    species: row.species as string,
    location: row.location as string,
    targetHumidity: row.target_humidity as number,
    registeredAt: row.registered_at as string,
    status: (row.status as string ?? 'normal') as Plant['status'],
    currentSensor: {
      temperature: (row.temperature as number) ?? 0,
      humidity: (row.humidity as number) ?? 0,
      soilMoisture: (row.soil_moisture as number) ?? 0,
      ledState: (row.led_state as boolean) ?? false,
      timestamp: (row.sensor_updated_at as string) ?? new Date().toISOString(),
    },
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { mapRowToPlant } from '../route'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('plants_with_status')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
  }

  return NextResponse.json(mapRowToPlant(data))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const supabase = createServerClient()

  // LED 상태 변경 → sensor_data에 새 row 추가 (기존 최신값 + 변경 필드만 교체)
  if ('ledState' in body) {
    const { data: latest } = await supabase
      .from('latest_sensor_per_plant')
      .select('*')
      .eq('plant_id', id)
      .single()

    await supabase.from('sensor_data').insert({
      plant_id: id,
      temperature: latest?.temperature ?? 25,
      humidity: latest?.humidity ?? 50,
      soil_moisture: latest?.soil_moisture ?? 50,
      led_state: body.ledState,
    })

    // 알림 로그 기록
    await supabase.from('alert_logs').insert({
      plant_id: id,
      type: body.ledState ? 'led_on' : 'led_off',
      message: body.ledState ? '수동으로 LED 점등' : '수동으로 LED 소등',
      resolved: true,
    })
  }

  // 목표 습도 변경 → plants 테이블 업데이트
  if ('targetHumidity' in body) {
    await supabase
      .from('plants')
      .update({ target_humidity: body.targetHumidity })
      .eq('id', id)
  }

  return NextResponse.json({ success: true, updatedAt: new Date().toISOString() })
}

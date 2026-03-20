import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// 센서값 변동 시뮬레이션 (기존 Arduino Worker Thread 역할)
function fluctuate(base: number, range: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(base + (Math.random() - 0.5) * range)))
}

export async function POST() {
  const supabase = createServerClient()

  // 모든 식물의 최신 센서값 조회
  const { data: latestSensors, error: fetchError } = await supabase
    .from('latest_sensor_per_plant')
    .select('*')

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!latestSensors || latestSensors.length === 0) {
    return NextResponse.json({ error: 'No plants found' }, { status: 404 })
  }

  // 각 식물에 새 센서 데이터 생성
  const newSensorRows = latestSensors.map((s) => ({
    plant_id: s.plant_id,
    temperature: fluctuate(s.temperature, 2, 15, 40),
    humidity: fluctuate(s.humidity, 4, 10, 95),
    soil_moisture: fluctuate(s.soil_moisture, 3, 5, 100),
    led_state: s.led_state,
  }))

  const { error: insertError } = await supabase.from('sensor_data').insert(newSensorRows)

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // 자동 제어 로직 — 기존 Arduino 코드와 동일한 규칙
  const { data: plants } = await supabase
    .from('plants_with_status')
    .select('id, name, target_humidity, soil_moisture, temperature, led_state')

  const alertsToInsert = []

  for (const plant of plants ?? []) {
    // 토양 수분 임계값 미만 → 자동 급수 알림
    if (plant.soil_moisture < plant.target_humidity * 0.5) {
      alertsToInsert.push({
        plant_id: plant.id,
        type: 'auto_watering',
        message: `토양 수분 ${plant.soil_moisture}% 감지 → 자동 급수 실행 (1초)`,
        resolved: true,
      })
    }
    // 습도 부족 경고
    else if (plant.soil_moisture < plant.target_humidity * 0.8) {
      alertsToInsert.push({
        plant_id: plant.id,
        type: 'low_humidity',
        message: `습도 ${plant.soil_moisture}% — 목표치(${plant.target_humidity}%) 대비 부족`,
        resolved: false,
      })
    }
    // 고온 경고
    if (plant.temperature > 35) {
      alertsToInsert.push({
        plant_id: plant.id,
        type: 'high_temperature',
        message: `온도 ${plant.temperature}°C 초과 감지`,
        resolved: false,
      })
    }
  }

  if (alertsToInsert.length > 0) {
    await supabase.from('alert_logs').insert(alertsToInsert)
  }

  return NextResponse.json({
    success: true,
    updated: newSensorRows.length,
    alertsCreated: alertsToInsert.length,
    timestamp: new Date().toISOString(),
  })
}

// 모든 데이터 요청은 Next.js API 라우트를 통해 Supabase와 통신합니다
// 백엔드 변경 시 이 파일의 URL만 수정하면 됩니다

export async function fetchPlants() {
  const res = await fetch('/api/plants', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch plants')
  return res.json()
}

export async function fetchPlantById(id: string) {
  const res = await fetch(`/api/plants/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Plant not found')
  return res.json()
}

export async function fetchSensorHistory(plantId: string) {
  const res = await fetch(`/api/plants/${plantId}/sensor-history`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch sensor history')
  return res.json()
}

export async function fetchAlerts() {
  const res = await fetch('/api/alerts', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch alerts')
  return res.json()
}

export async function fetchDashboardStats() {
  const res = await fetch('/api/dashboard', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  return res.json()
}

// 기존 Android: sendDataToBluetooth("true\n" or "false\n")
export async function updateLedState(plantId: string, ledState: boolean) {
  const res = await fetch(`/api/plants/${plantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ledState }),
  })
  if (!res.ok) throw new Error('Failed to update LED state')
  return res.json()
}

// 기존 Android: sendDataToBluetooth("60\n")
export async function updateTargetHumidity(plantId: string, targetHumidity: number) {
  const res = await fetch(`/api/plants/${plantId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetHumidity }),
  })
  if (!res.ok) throw new Error('Failed to update target humidity')
  return res.json()
}

// 센서 데이터 시뮬레이션 실행 (Arduino 역할 대체)
export async function runSimulation() {
  const res = await fetch('/api/simulate', { method: 'POST' })
  if (!res.ok) throw new Error('Simulation failed')
  return res.json()
}

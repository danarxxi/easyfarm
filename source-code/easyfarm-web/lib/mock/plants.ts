import { Plant, SensorData, AlertLog, DashboardStats } from '@/types'

// 기존 Android 앱의 센서 데이터 구조 (temperature, humidity, ledState) 기반
const BASE_PLANTS: Plant[] = [
  {
    id: 'plant-1',
    name: '거실 몬스테라',
    species: '몬스테라',
    status: 'normal',
    targetHumidity: 60,
    location: '거실',
    registeredAt: '2024-01-10',
    currentSensor: {
      temperature: 24,
      humidity: 62,
      soilMoisture: 65,
      ledState: false,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'plant-2',
    name: '침실 선인장',
    species: '선인장',
    status: 'normal',
    targetHumidity: 20,
    location: '침실',
    registeredAt: '2024-01-15',
    currentSensor: {
      temperature: 22,
      humidity: 25,
      soilMoisture: 22,
      ledState: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'plant-3',
    name: '주방 바질',
    species: '바질',
    status: 'warning',
    targetHumidity: 70,
    location: '주방',
    registeredAt: '2024-02-03',
    currentSensor: {
      temperature: 28,
      humidity: 45,
      soilMoisture: 38,
      ledState: true,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'plant-4',
    name: '베란다 고무나무',
    species: '고무나무',
    status: 'danger',
    targetHumidity: 55,
    location: '베란다',
    registeredAt: '2024-02-20',
    currentSensor: {
      temperature: 33,
      humidity: 22,
      soilMoisture: 15,
      ledState: false,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'plant-5',
    name: '서재 스파티필럼',
    species: '스파티필럼',
    status: 'normal',
    targetHumidity: 65,
    location: '서재',
    registeredAt: '2024-03-01',
    currentSensor: {
      temperature: 23,
      humidity: 68,
      soilMoisture: 70,
      ledState: false,
      timestamp: new Date().toISOString(),
    },
  },
  {
    id: 'plant-6',
    name: '욕실 아이비',
    species: '아이비',
    status: 'warning',
    targetHumidity: 75,
    location: '욕실',
    registeredAt: '2024-03-10',
    currentSensor: {
      temperature: 26,
      humidity: 55,
      soilMoisture: 48,
      ledState: true,
      timestamp: new Date().toISOString(),
    },
  },
]

// 실시간 센서값 변동 시뮬레이션 (기존 Android Worker Thread 폴링 로직과 동일한 역할)
function fluctuate(base: number, range: number): number {
  return Math.round(base + (Math.random() - 0.5) * range)
}

export function getMockPlants(): Plant[] {
  return BASE_PLANTS.map((plant) => ({
    ...plant,
    currentSensor: {
      ...plant.currentSensor,
      temperature: fluctuate(plant.currentSensor.temperature, 2),
      humidity: fluctuate(plant.currentSensor.humidity, 4),
      soilMoisture: fluctuate(plant.currentSensor.soilMoisture, 3),
      timestamp: new Date().toISOString(),
    },
  }))
}

export function getMockPlantById(id: string): Plant | undefined {
  return getMockPlants().find((p) => p.id === id)
}

// 24시간 히스토리 데이터 생성
export function getMockSensorHistory(plantId: string): SensorData[] {
  const plant = BASE_PLANTS.find((p) => p.id === plantId)
  if (!plant) return []

  const history: SensorData[] = []
  const now = new Date()

  for (let i = 47; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 30 * 60 * 1000) // 30분 간격
    history.push({
      temperature: fluctuate(plant.currentSensor.temperature, 4),
      humidity: fluctuate(plant.currentSensor.humidity, 8),
      soilMoisture: fluctuate(plant.currentSensor.soilMoisture, 6),
      ledState: Math.random() > 0.5,
      timestamp: time.toISOString(),
    })
  }

  return history
}

export function getMockAlerts(): AlertLog[] {
  return [
    {
      id: 'alert-1',
      plantId: 'plant-4',
      plantName: '베란다 고무나무',
      type: 'auto_watering',
      message: '토양 수분 15% 감지 → 자동 급수 실행 (1초)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved: true,
    },
    {
      id: 'alert-2',
      plantId: 'plant-3',
      plantName: '주방 바질',
      type: 'low_humidity',
      message: '습도 45% — 목표치(70%) 대비 25% 부족',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: 'alert-3',
      plantId: 'plant-4',
      plantName: '베란다 고무나무',
      type: 'high_temperature',
      message: '온도 33°C 초과 감지',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: 'alert-4',
      plantId: 'plant-2',
      plantName: '침실 선인장',
      type: 'led_on',
      message: '조도 부족 감지 → LED 자동 점등',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
    {
      id: 'alert-5',
      plantId: 'plant-6',
      plantName: '욕실 아이비',
      type: 'auto_watering',
      message: '토양 수분 48% 감지 → 자동 급수 실행 (1초)',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
    {
      id: 'alert-6',
      plantId: 'plant-1',
      plantName: '거실 몬스테라',
      type: 'led_off',
      message: '조도 정상 복귀 → LED 자동 소등',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
  ]
}

export function getMockDashboardStats(): DashboardStats {
  const plants = getMockPlants()
  return {
    total: plants.length,
    normal: plants.filter((p) => p.status === 'normal').length,
    warning: plants.filter((p) => p.status === 'warning').length,
    danger: plants.filter((p) => p.status === 'danger').length,
    todayWateringCount: 8,
    activeLedCount: plants.filter((p) => p.currentSensor.ledState).length,
  }
}

export type PlantStatus = 'normal' | 'warning' | 'danger'

export interface SensorData {
  temperature: number
  humidity: number
  soilMoisture: number
  ledState: boolean
  timestamp: string
}

export interface Plant {
  id: string
  name: string
  species: string
  status: PlantStatus
  targetHumidity: number
  location: string
  registeredAt: string
  currentSensor: SensorData
}

export interface SensorHistory {
  plantId: string
  data: SensorData[]
}

export interface AlertLog {
  id: string
  plantId: string
  plantName: string
  type: 'auto_watering' | 'low_humidity' | 'high_temperature' | 'led_on' | 'led_off'
  message: string
  timestamp: string
  resolved: boolean
}

export interface DashboardStats {
  total: number
  normal: number
  warning: number
  danger: number
  todayWateringCount: number
  activeLedCount: number
}

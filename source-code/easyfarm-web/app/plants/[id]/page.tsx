'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { use, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plant, SensorData } from '@/types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchPlantById, fetchSensorHistory, updateLedState, updateTargetHumidity } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import SensorCard from '@/components/ui/SensorCard'

// 기존 Android 앱: 습도 설정값 5~100%, 5 단위
const HUMIDITY_OPTIONS = Array.from({ length: 20 }, (_, i) => (i + 1) * 5)

export default function PlantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [savedHumidity, setSavedHumidity] = useState<number | null>(null)
  const [aiAdvice, setAiAdvice] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const fetchAiAdvice = useCallback(async (plantData: Plant) => {
    setAiLoading(true)
    setAiAdvice(null)
    try {
      const res = await fetch('/api/ai/care-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plant: plantData }),
      })
      const data = await res.json()
      setAiAdvice(data.advice ?? data.error)
    } finally {
      setAiLoading(false)
    }
  }, [])

  const { data: plant, isLoading } = useQuery<Plant>({
    queryKey: ['plant', id],
    queryFn: () => fetchPlantById(id),
    refetchInterval: 5000,
  })

  const { data: history } = useQuery<SensorData[]>({
    queryKey: ['sensor-history', id],
    queryFn: () => fetchSensorHistory(id),
  })

  // 기존 Android: sendDataToBluetooth("true\n" or "false\n")
  const ledMutation = useMutation({
    mutationFn: (ledState: boolean) => updateLedState(id, ledState),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plant', id] }),
  })

  // 기존 Android: sendDataToBluetooth("60\n")
  const humidityMutation = useMutation({
    mutationFn: (targetHumidity: number) => updateTargetHumidity(id, targetHumidity),
    onSuccess: (_, value) => {
      setSavedHumidity(value)
      queryClient.invalidateQueries({ queryKey: ['plant', id] })
    },
  })

  const chartData = history?.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    온도: d.temperature,
    습도: d.humidity,
    토양수분: d.soilMoisture,
  }))

  if (isLoading) {
    return <div className="p-8 text-gray-400 text-sm">불러오는 중...</div>
  }

  if (!plant) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">식물을 찾을 수 없습니다.</p>
        <Link href="/plants" className="text-green-600 text-sm hover:underline mt-2 inline-block">목록으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/plants" className="text-sm text-gray-400 hover:text-gray-600">식물 목록</Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-600">{plant.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">{plant.name}</h2>
            <StatusBadge status={plant.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">{plant.species} · {plant.location} · 등록일 {plant.registeredAt}</p>
        </div>
      </div>

      {/* 실시간 센서 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SensorCard label="온도" value={plant.currentSensor.temperature} unit="°C" icon="🌡️" color="bg-orange-50 text-orange-500" />
        <SensorCard label="습도" value={plant.currentSensor.humidity} unit="%" icon="💧" color="bg-blue-50 text-blue-500" />
        <SensorCard label="토양 수분" value={plant.currentSensor.soilMoisture} unit="%" icon="🌱" color="bg-green-50 text-green-500" />
        <SensorCard
          label="LED 상태"
          value={plant.currentSensor.ledState ? 'ON' : 'OFF'}
          unit=""
          icon="💡"
          color={plant.currentSensor.ledState ? 'bg-amber-50 text-amber-500' : 'bg-gray-50 text-gray-400'}
        />
      </div>

      {/* 제어 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LED 제어 - 기존 Android PlantActivity의 LED 토글 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">LED 제어</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => ledMutation.mutate(true)}
              disabled={ledMutation.isPending || plant.currentSensor.ledState}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ON
            </button>
            <button
              onClick={() => ledMutation.mutate(false)}
              disabled={ledMutation.isPending || !plant.currentSensor.ledState}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              OFF
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">현재: {plant.currentSensor.ledState ? 'ON (점등 중)' : 'OFF (소등)'}</p>
        </div>

        {/* 습도 임계값 설정 - 기존 Android PlantActivity의 습도 드롭다운 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">자동 급수 임계값 설정</h3>
          <div className="flex items-center gap-3">
            <select
              defaultValue={plant.targetHumidity}
              onChange={(e) => humidityMutation.mutate(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {HUMIDITY_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            토양 수분이 이 값 미만이면 자동 급수 실행
            {savedHumidity && <span className="text-green-500 ml-1">· {savedHumidity}%로 저장됨</span>}
          </p>
        </div>
      </div>

      {/* AI 케어 어드바이저 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">AI 케어 어드바이저</h3>
            <p className="text-xs text-gray-400 mt-0.5">현재 센서 데이터를 기반으로 케어 방법을 추천해드립니다</p>
          </div>
          <button
            onClick={() => fetchAiAdvice(plant)}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                분석 중...
              </>
            ) : (
              <>✨ AI 분석</>
            )}
          </button>
        </div>

        {aiAdvice ? (
          <div className="bg-green-50 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {aiAdvice}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-400 text-center">
            버튼을 눌러 현재 상태에 맞는 케어 방법을 확인하세요
          </div>
        )}
      </div>

      {/* 센서 히스토리 차트 */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-6">센서 히스토리 (최근 24시간)</h3>
        {chartData && (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 0, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9ca3af' }} interval={7} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="온도" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="습도" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="토양수분" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

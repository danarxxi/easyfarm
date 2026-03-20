'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { fetchAlerts } from '@/lib/api'
import { AlertLog } from '@/types'

const ALERT_TYPE_CONFIG: Record<AlertLog['type'], { label: string; icon: string; color: string }> = {
  auto_watering: { label: '자동 급수', icon: '💧', color: 'bg-blue-50 text-blue-700' },
  low_humidity: { label: '습도 부족', icon: '⚠️', color: 'bg-yellow-50 text-yellow-700' },
  high_temperature: { label: '온도 초과', icon: '🌡️', color: 'bg-red-50 text-red-700' },
  led_on: { label: 'LED 점등', icon: '💡', color: 'bg-amber-50 text-amber-700' },
  led_off: { label: 'LED 소등', icon: '🔅', color: 'bg-gray-50 text-gray-600' },
}

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default function AlertsPage() {
  const { data: alerts, isLoading } = useQuery<AlertLog[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 10000,
  })

  const unresolved = alerts?.filter((a) => !a.resolved) ?? []
  const resolved = alerts?.filter((a) => a.resolved) ?? []

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">알림 로그</h2>
        <p className="text-sm text-gray-500 mt-1">자동 제어 이벤트 및 이상 감지 이력을 확인하세요.</p>
      </div>

      {/* 요약 */}
      <div className="flex gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-xs text-red-500">미해결</p>
          <p className="text-2xl font-bold text-red-700">{unresolved.length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
          <p className="text-xs text-gray-500">해결됨</p>
          <p className="text-2xl font-bold text-gray-700">{resolved.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
          <p className="text-xs text-blue-500">전체</p>
          <p className="text-2xl font-bold text-blue-700">{alerts?.length ?? 0}</p>
        </div>
      </div>

      {/* 알림 목록 */}
      {isLoading ? (
        <div className="text-center text-gray-400 text-sm py-12">불러오는 중...</div>
      ) : (
        <div className="space-y-6">
          {unresolved.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">미해결 알림</h3>
              <div className="space-y-2">
                {unresolved.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}
          {resolved.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">해결된 알림</h3>
              <div className="space-y-2">
                {resolved.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function AlertItem({ alert }: { alert: AlertLog }) {
  const config = ALERT_TYPE_CONFIG[alert.type]

  return (
    <div className={`bg-white rounded-xl border ${alert.resolved ? 'border-gray-100' : 'border-red-200'} p-4 flex items-start gap-4`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${config.color}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>{config.label}</span>
          {!alert.resolved && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">미해결</span>
          )}
        </div>
        <p className="text-sm text-gray-700">
          <Link href={`/plants/${alert.plantId}`} className="font-medium hover:text-green-600">
            {alert.plantName}
          </Link>
          {' — '}
          {alert.message}
        </p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">{timeAgo(alert.timestamp)}</span>
    </div>
  )
}

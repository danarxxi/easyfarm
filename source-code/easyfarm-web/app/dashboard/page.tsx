'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { fetchDashboardStats, fetchPlants, fetchAlerts, runSimulation } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import { AlertLog, Plant, DashboardStats } from '@/types'

export default function DashboardPage() {
  const queryClient = useQueryClient()

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 5000,
  })

  const { data: plants } = useQuery<Plant[]>({
    queryKey: ['plants'],
    queryFn: fetchPlants,
    refetchInterval: 5000,
  })

  // 센서 시뮬레이션 — Arduino가 없는 환경에서 DB에 새 센서 데이터를 생성
  const simulateMutation = useMutation({
    mutationFn: runSimulation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
  })

  const { data: alerts } = useQuery<AlertLog[]>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  })

  const unresolvedAlerts = alerts?.filter((a) => !a.resolved) ?? []

  return (
    <div className="p-8 space-y-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">전체 식물 운영 현황을 한눈에 확인하세요.</p>
        </div>
        <button
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {simulateMutation.isPending ? '실행 중...' : '센서 업데이트'}
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="전체 식물" value={stats?.total ?? '-'} icon="🌿" color="bg-green-50 text-green-600" />
        <StatCard label="정상" value={stats?.normal ?? '-'} icon="✅" color="bg-blue-50 text-blue-600" />
        <StatCard label="주의" value={stats?.warning ?? '-'} icon="⚠️" color="bg-yellow-50 text-yellow-600" />
        <StatCard label="위험" value={stats?.danger ?? '-'} icon="🚨" color="bg-red-50 text-red-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="오늘 자동 급수" value={`${stats?.todayWateringCount ?? '-'}회`} icon="💧" color="bg-cyan-50 text-cyan-600" />
        <StatCard label="현재 LED 가동" value={`${stats?.activeLedCount ?? '-'}개`} icon="💡" color="bg-amber-50 text-amber-600" />
      </div>

      {/* 미해결 알림 */}
      {unresolvedAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-red-700">미해결 알림 {unresolvedAlerts.length}건</h3>
            <Link href="/alerts" className="text-xs text-red-500 hover:underline">전체 보기</Link>
          </div>
          <ul className="space-y-2">
            {unresolvedAlerts.slice(0, 3).map((alert) => (
              <li key={alert.id} className="flex items-start gap-2 text-sm text-red-700">
                <span className="mt-0.5">•</span>
                <span>
                  <span className="font-medium">{alert.plantName}</span> — {alert.message}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 식물 상태 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">식물 현황</h3>
          <Link href="/plants" className="text-xs text-green-600 hover:underline">전체 보기</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium">이름</th>
                <th className="text-left px-6 py-3 font-medium">위치</th>
                <th className="text-right px-6 py-3 font-medium">온도</th>
                <th className="text-right px-6 py-3 font-medium">습도</th>
                <th className="text-right px-6 py-3 font-medium">토양수분</th>
                <th className="text-center px-6 py-3 font-medium">LED</th>
                <th className="text-center px-6 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody>
              {plants?.map((plant) => (
                <tr key={plant.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <Link href={`/plants/${plant.id}`} className="font-medium text-gray-800 hover:text-green-600">
                      {plant.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-gray-500">{plant.location}</td>
                  <td className="px-6 py-3 text-right text-gray-700">{plant.currentSensor.temperature}°C</td>
                  <td className="px-6 py-3 text-right text-gray-700">{plant.currentSensor.humidity}%</td>
                  <td className="px-6 py-3 text-right text-gray-700">{plant.currentSensor.soilMoisture}%</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${plant.currentSensor.ledState ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {plant.currentSensor.ledState ? 'ON' : 'OFF'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <StatusBadge status={plant.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${color}`}>{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

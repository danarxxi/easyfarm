'use client'

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { fetchPlants } from '@/lib/api'
import StatusBadge from '@/components/ui/StatusBadge'
import { Plant, PlantStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: PlantStatus | 'all' }[] = [
  { label: '전체', value: 'all' },
  { label: '정상', value: 'normal' },
  { label: '주의', value: 'warning' },
  { label: '위험', value: 'danger' },
]

export default function PlantsPage() {
  const [statusFilter, setStatusFilter] = useState<PlantStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: plants, isLoading } = useQuery<Plant[]>({
    queryKey: ['plants'],
    queryFn: fetchPlants,
    refetchInterval: 5000,
  })

  const filtered = plants?.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    const matchSearch =
      search === '' ||
      p.name.includes(search) ||
      p.species.includes(search) ||
      p.location.includes(search)
    return matchStatus && matchSearch
  })

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">식물 목록</h2>
        <p className="text-sm text-gray-500 mt-1">등록된 식물의 실시간 상태를 조회하고 관리하세요.</p>
      </div>

      {/* 필터 영역 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="이름, 종류, 위치 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-green-300"
        />
        <div className="flex gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                statusFilter === value
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">불러오는 중...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 font-medium">식물명</th>
                <th className="text-left px-6 py-3 font-medium">종류</th>
                <th className="text-left px-6 py-3 font-medium">위치</th>
                <th className="text-right px-6 py-3 font-medium">온도</th>
                <th className="text-right px-6 py-3 font-medium">습도</th>
                <th className="text-right px-6 py-3 font-medium">토양수분</th>
                <th className="text-right px-6 py-3 font-medium">목표습도</th>
                <th className="text-center px-6 py-3 font-medium">LED</th>
                <th className="text-center px-6 py-3 font-medium">상태</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                filtered?.map((plant) => (
                  <tr key={plant.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{plant.name}</td>
                    <td className="px-6 py-4 text-gray-500">{plant.species}</td>
                    <td className="px-6 py-4 text-gray-500">{plant.location}</td>
                    <td className="px-6 py-4 text-right text-gray-700">{plant.currentSensor.temperature}°C</td>
                    <td className="px-6 py-4 text-right text-gray-700">{plant.currentSensor.humidity}%</td>
                    <td className="px-6 py-4 text-right">
                      <span className={plant.currentSensor.soilMoisture < plant.targetHumidity ? 'text-red-500 font-medium' : 'text-gray-700'}>
                        {plant.currentSensor.soilMoisture}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">{plant.targetHumidity}%</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${plant.currentSensor.ledState ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {plant.currentSensor.ledState ? 'ON' : 'OFF'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge status={plant.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/plants/${plant.id}`} className="text-xs text-green-600 hover:underline">
                        상세 보기
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
        {filtered && (
          <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            총 {filtered.length}개 식물
          </div>
        )}
      </div>
    </div>
  )
}

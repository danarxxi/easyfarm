import { PlantStatus } from '@/types'

const config: Record<PlantStatus, { label: string; className: string }> = {
  normal: { label: '정상', className: 'bg-green-100 text-green-700' },
  warning: { label: '주의', className: 'bg-yellow-100 text-yellow-700' },
  danger: { label: '위험', className: 'bg-red-100 text-red-700' },
}

export default function StatusBadge({ status }: { status: PlantStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}

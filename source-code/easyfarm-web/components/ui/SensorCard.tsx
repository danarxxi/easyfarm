interface SensorCardProps {
  label: string
  value: string | number
  unit: string
  icon: string
  color: string
}

export default function SensorCard({ label, value, unit, icon, color }: SensorCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-semibold text-gray-800">
          {value}
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        </p>
      </div>
    </div>
  )
}

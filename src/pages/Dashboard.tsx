import { useBookingStore } from '@/store/useBookingStore'
import { CalendarDays, ClipboardList, CheckSquare, AlertTriangle, ArrowRight, UserX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getDateOffset } from '@/utils/date'

export default function Dashboard() {
  const { shifts, appointments, residents } = useBookingStore()
  const today = getDateOffset(0)

  const todayShifts = shifts.filter((s) => s.date === today)
  const todayAppointments = appointments.filter((a) => a.date === today)
  const pendingCount = todayAppointments.filter((a) => a.status === 'pending').length
  const completedCount = todayAppointments.filter((a) => a.status === 'completed').length
  const noshowCount = todayAppointments.filter((a) => a.status === 'noshow').length
  const suspendedResidents = residents.filter((r) => r.isSuspended)
  const activeBarbers = new Set(
    todayShifts.filter((s) => !s.isLeave).map((s) => s.barberId)
  ).size

  const stats = [
    {
      label: '今日排班',
      value: todayShifts.length,
      sub: `${activeBarbers} 位理发师在岗`,
      icon: CalendarDays,
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/20',
    },
    {
      label: '今日预约',
      value: todayAppointments.length,
      sub: `${pendingCount} 人待服务`,
      icon: ClipboardList,
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/20',
    },
    {
      label: '已完成',
      value: completedCount,
      sub: `爽约 ${noshowCount} 人`,
      icon: CheckSquare,
      gradient: 'from-emerald-500 to-green-500',
      shadow: 'shadow-emerald-500/20',
    },
    {
      label: '暂停预约',
      value: suspendedResidents.length,
      sub: '连续爽约≥2次',
      icon: UserX,
      gradient: 'from-rose-500 to-pink-500',
      shadow: 'shadow-rose-500/20',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">今日概览</h2>
        <p className="text-stone-500 text-sm mt-1">社区便民理发预约 — 日常运行状态</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-stone-800 mt-1">{stat.value}</p>
                <p className="text-stone-400 text-xs mt-1">{stat.sub}</p>
              </div>
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.shadow} shadow-lg flex items-center justify-center`}
              >
                <stat.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {suspendedResidents.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 text-rose-700 mb-3">
            <AlertTriangle size={18} />
            <span className="font-semibold text-sm">爽约提醒</span>
          </div>
          <div className="space-y-2">
            {suspendedResidents.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between bg-white/70 rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold">
                    {r.name[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-stone-700">{r.name}</span>
                    <span className="text-xs text-rose-500 ml-2">
                      连续爽约 {r.consecutiveNoShows} 次
                    </span>
                  </div>
                </div>
                <span className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-medium">
                  已暂停预约
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 mb-4">今日排班</h3>
          {todayShifts.length === 0 ? (
            <p className="text-stone-400 text-sm py-8 text-center">今日暂无排班</p>
          ) : (
            <div className="space-y-2">
              {todayShifts.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
                    s.isLeave
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-stone-50 border border-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        s.isLeave
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}
                    >
                      {s.barberName[0]}
                    </div>
                    <div>
                      <span className={`font-medium ${s.isLeave ? 'text-red-600 line-through' : 'text-stone-700'}`}>
                        {s.barberName}
                      </span>
                      <span className="text-stone-400 ml-2">
                        {s.startTime} - {s.endTime}
                      </span>
                    </div>
                  </div>
                  {s.isLeave ? (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      请假
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      在岗
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
          <h3 className="font-semibold text-stone-700 mb-4">快捷操作</h3>
          <div className="space-y-3">
            {[
              { to: '/schedule', label: '管理排班', desc: '为理发师创建或调整班次', color: 'orange' },
              { to: '/booking', label: '预约理发', desc: '帮居民选择上门或到店时段', color: 'blue' },
              { to: '/manage', label: '记录服务', desc: '标记完成或爽约', color: 'emerald' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-4 py-3 rounded-xl bg-${item.color}-50 border border-${item.color}-100 hover:bg-${item.color}-100 transition-colors group`}
              >
                <div>
                  <p className={`text-sm font-medium text-${item.color}-700`}>{item.label}</p>
                  <p className={`text-xs text-${item.color}-500`}>{item.desc}</p>
                </div>
                <ArrowRight
                  size={16}
                  className={`text-${item.color}-400 group-hover:translate-x-1 transition-transform`}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

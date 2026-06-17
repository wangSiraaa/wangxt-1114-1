import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { getDateOffset } from '@/utils/date'
import { Home, Store, Check, X, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import type { Appointment } from '@/types'

export default function Manage() {
  const { appointments, barbers, residents, completeAppointment, noShowAppointment, cancelAppointment } = useBookingStore()
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0))
  const [expandedBarbers, setExpandedBarbers] = useState<Set<string>>(new Set(barbers.map((b) => b.id)))
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'noshow' } | null>(null)

  const dateAppointments = appointments.filter((a) => a.date === selectedDate)
  const pending = dateAppointments.filter((a) => a.status === 'pending')
  const completed = dateAppointments.filter((a) => a.status === 'completed')
  const noshows = dateAppointments.filter((a) => a.status === 'noshow')

  const appointmentsByBarber = barbers
    .map((b) => ({
      barber: b,
      appointments: dateAppointments.filter((a) => a.barberId === b.id),
    }))
    .filter((g) => g.appointments.length > 0)

  const toggleBarber = (barberId: string) => {
    setExpandedBarbers((prev) => {
      const next = new Set(prev)
      if (next.has(barberId)) next.delete(barberId)
      else next.add(barberId)
      return next
    })
  }

  const handleNoShow = (id: string) => {
    noShowAppointment(id)
    setConfirmAction(null)
  }

  const getStatusBadge = (appointment: Appointment) => {
    switch (appointment.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={9} />
            待服务
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check size={9} />
            已完成
          </span>
        )
      case 'noshow':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <X size={9} />
            爽约
          </span>
        )
    }
  }

  const suspendedResidents = residents.filter((r) => r.isSuspended)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">预约管理</h2>
          <p className="text-stone-500 text-sm mt-1">志愿者记录服务完成和爽约情况</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{pending.length}</p>
          <p className="text-xs text-amber-600/70 mt-0.5">待服务</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{completed.length}</p>
          <p className="text-xs text-emerald-600/70 mt-0.5">已完成</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-rose-600">{noshows.length}</p>
          <p className="text-xs text-rose-600/70 mt-0.5">爽约</p>
        </div>
      </div>

      {suspendedResidents.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-rose-700 text-sm font-medium mb-2">
            <AlertTriangle size={14} />
            以下居民已被暂停预约（连续爽约≥2次）
          </div>
          <div className="flex flex-wrap gap-2">
            {suspendedResidents.map((r) => (
              <span key={r.id} className="text-xs bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full font-medium">
                {r.name}（{r.consecutiveNoShows}次）
              </span>
            ))}
          </div>
        </div>
      )}

      {appointmentsByBarber.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center text-stone-400 text-sm">
          <Clock size={40} className="mx-auto mb-3 text-stone-300" />
          该日暂无预约记录
        </div>
      ) : (
        <div className="space-y-3">
          {appointmentsByBarber.map(({ barber, appointments: group }) => {
            const isExpanded = expandedBarbers.has(barber.id)
            return (
              <div key={barber.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleBarber(barber.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-orange-500/20">
                      {barber.name[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-stone-700">{barber.name}</p>
                      <p className="text-xs text-stone-400">
                        {group.filter((a) => a.status === 'pending').length} 待服务 · {group.filter((a) => a.status === 'completed').length} 已完成 · {group.filter((a) => a.status === 'noshow').length} 爽约
                      </p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                </button>
                {isExpanded && (
                  <div className="border-t border-stone-100 divide-y divide-stone-50">
                    {group.map((appointment) => (
                      <div key={appointment.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            appointment.type === 'home' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {appointment.residentName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-stone-700">{appointment.residentName}</span>
                              {appointment.type === 'home' ? (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-full border border-orange-200">
                                  <Home size={8} />
                                  上门
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full border border-blue-200">
                                  <Store size={8} />
                                  到店
                                </span>
                              )}
                              {getStatusBadge(appointment)}
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {appointment.startTime} - {appointment.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {appointment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => completeAppointment(appointment.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              >
                                <Check size={12} />
                                完成
                              </button>
                              <button
                                onClick={() => setConfirmAction({ id: appointment.id, action: 'noshow' })}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                <X size={12} />
                                爽约
                              </button>
                              <button
                                onClick={() => cancelAppointment(appointment.id)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200 transition-colors"
                              >
                                取消
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center gap-2 text-rose-600 mb-2">
                <AlertTriangle size={20} />
                <span className="font-bold">确认爽约</span>
              </div>
              <p className="text-sm text-stone-600">
                标记爽约后，该居民的连续爽约次数将+1。连续爽约2次将自动暂停其预约资格。确定要继续吗？
              </p>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleNoShow(confirmAction.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              >
                确认爽约
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { formatDate, getWeekDates, getDateOffset } from '@/utils/date'
import type { AppointmentType } from '@/types'
import { Home, Store, AlertTriangle, Clock, User, CheckCircle2, XCircle } from 'lucide-react'

export default function Booking() {
  const { shifts, residents, appointments, createAppointment, getShiftAppointmentCount } = useBookingStore()
  const weekDates = getWeekDates()
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0))
  const [selectedResident, setSelectedResident] = useState('')
  const [bookingType, setBookingType] = useState<AppointmentType>('instore')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const dateShifts = shifts
    .filter((s) => s.date === selectedDate && !s.isLeave)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const selectedResidentData = residents.find((r) => r.id === selectedResident)

  const handleBook = (shiftId: string) => {
    if (!selectedResident) {
      setMessage({ type: 'error', text: '请先选择居民' })
      return
    }
    const err = createAppointment({ residentId: selectedResident, shiftId, type: bookingType })
    if (err) {
      setMessage({ type: 'error', text: err })
    } else {
      setMessage({ type: 'success', text: '预约成功！' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">预约理发</h2>
        <p className="text-stone-500 text-sm mt-1">选择居民和时段，预约上门或到店理发</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h3 className="font-semibold text-stone-700 mb-3">选择居民</h3>
            <select
              value={selectedResident}
              onChange={(e) => setSelectedResident(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            >
              <option value="">-- 请选择居民 --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id} disabled={r.isSuspended}>
                  {r.name}
                  {r.mobilityImpaired ? ' 🦽' : ''}
                  {r.isSuspended ? ' (已暂停预约)' : ''}
                </option>
              ))}
            </select>

            {selectedResidentData && (
              <div className="mt-3 p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-stone-400" />
                  <span className="font-medium text-stone-700">{selectedResidentData.name}</span>
                  {selectedResidentData.mobilityImpaired && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      行动不便
                    </span>
                  )}
                </div>
                {selectedResidentData.isSuspended && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-600">
                    <AlertTriangle size={12} />
                    该居民因连续爽约已被暂停预约，请联系社工
                  </div>
                )}
                {!selectedResidentData.isSuspended && selectedResidentData.consecutiveNoShows > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                    <AlertTriangle size={12} />
                    已连续爽约 {selectedResidentData.consecutiveNoShows} 次，再爽约1次将暂停预约
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-medium text-stone-600 mb-2">服务方式</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBookingType('instore')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    bookingType === 'instore'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-blue-300'
                  }`}
                >
                  <Store size={14} />
                  到店
                </button>
                <button
                  onClick={() => setBookingType('home')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    bookingType === 'home'
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-orange-300'
                  }`}
                >
                  <Home size={14} />
                  上门
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weekDates.map((d) => {
              const isSelected = d === selectedDate
              const isToday = d === getDateOffset(0)
              const activeShifts = shifts.filter((s) => s.date === d && !s.isLeave).length
              return (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`flex flex-col items-center min-w-[72px] px-3 py-2 rounded-xl text-sm transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                      : isToday
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-300'
                  }`}
                >
                  <span className="text-xs font-medium opacity-70">
                    {new Date(d + 'T00:00:00').toLocaleDateString('zh-CN', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-bold mt-0.5">{new Date(d + 'T00:00:00').getDate()}</span>
                  <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-orange-100' : 'text-stone-400'}`}>
                    {activeShifts} 可约
                  </span>
                </button>
              )
            })}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h3 className="font-semibold text-stone-700">{formatDate(selectedDate)} 可约时段</h3>
            </div>
            {dateShifts.length === 0 ? (
              <div className="py-16 text-center text-stone-400 text-sm">
                <Clock size={40} className="mx-auto mb-3 text-stone-300" />
                该日暂无可约时段
              </div>
            ) : (
              <div className="divide-y divide-stone-50">
                {dateShifts.map((s) => {
                  const count = getShiftAppointmentCount(s.id)
                  const isFull = count >= s.maxAppointments
                  const shiftAppointments = appointments.filter((a) => a.shiftId === s.id && a.status !== 'noshow')
                  return (
                    <div key={s.id} className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-orange-500/20">
                            {s.barberName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-stone-700">{s.barberName}</p>
                            <p className="text-xs text-stone-400">
                              {s.startTime} - {s.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className={`text-sm font-bold ${isFull ? 'text-stone-400' : 'text-emerald-600'}`}>
                              {count}/{s.maxAppointments}
                            </span>
                            <p className="text-[10px] text-stone-400">
                              {isFull ? '已满' : '可预约'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleBook(s.id)}
                            disabled={isFull || !selectedResident || (selectedResidentData?.isSuspended ?? false)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                              isFull || !selectedResident || (selectedResidentData?.isSuspended ?? false)
                                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg'
                            }`}
                          >
                            {isFull ? '已满' : '预约'}
                          </button>
                        </div>
                      </div>
                      {shiftAppointments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {shiftAppointments.map((a) => (
                            <span
                              key={a.id}
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                a.type === 'home'
                                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                                  : 'bg-blue-50 text-blue-600 border border-blue-200'
                              }`}
                            >
                              {a.type === 'home' ? <Home size={9} /> : <Store size={9} />}
                              {a.residentName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

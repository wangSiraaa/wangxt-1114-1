import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { formatDate, getWeekDates, getDateOffset } from '@/utils/date'
import { Plus, X, CalendarOff, Trash2 } from 'lucide-react'

export default function Schedule() {
  const { barbers, shifts, addShift, deleteShift, setLeave } = useBookingStore()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    barberId: barbers[0]?.id ?? '',
    date: getDateOffset(0),
    startTime: '08:00',
    endTime: '10:00',
    maxAppointments: 4,
  })

  const weekDates = getWeekDates()
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0))
  const filteredShifts = shifts
    .filter((s) => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const handleAdd = () => {
    if (!form.barberId || !form.date || !form.startTime || !form.endTime) return
    const barber = barbers.find((b) => b.id === form.barberId)
    if (!barber) return
    addShift({
      barberId: form.barberId,
      barberName: barber.name,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      isLeave: false,
      maxAppointments: form.maxAppointments,
    })
    setShowAdd(false)
    setForm({
      barberId: barbers[0]?.id ?? '',
      date: getDateOffset(0),
      startTime: '08:00',
      endTime: '10:00',
      maxAppointments: 4,
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">排班管理</h2>
          <p className="text-stone-500 text-sm mt-1">社工维护理发师班次，管理请假状态</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 transition-all"
        >
          <Plus size={16} />
          新增班次
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {weekDates.map((d) => {
          const isToday = d === getDateOffset(0)
          const isSelected = d === selectedDate
          const count = shifts.filter((s) => s.date === d).length
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
                {count} 班次
              </span>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-semibold text-stone-700">{formatDate(selectedDate)} 排班</h3>
          <span className="text-xs text-stone-400">{filteredShifts.length} 个班次</span>
        </div>
        {filteredShifts.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            <CalendarOff size={40} className="mx-auto mb-3 text-stone-300" />
            该日暂无排班，点击右上角新增
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {filteredShifts.map((s) => (
              <div
                key={s.id}
                className={`px-5 py-4 flex items-center justify-between transition-colors ${
                  s.isLeave ? 'bg-red-50/50' : 'hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                      s.isLeave
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-sm shadow-orange-500/20'
                    }`}
                  >
                    {s.barberName[0]}
                  </div>
                  <div>
                    <p className={`font-semibold text-sm ${s.isLeave ? 'text-red-500 line-through' : 'text-stone-700'}`}>
                      {s.barberName}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {s.startTime} - {s.endTime} · 最多 {s.maxAppointments} 人
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setLeave(s.id, !s.isLeave)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      s.isLeave
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {s.isLeave ? '取消请假' : '标记请假'}
                  </button>
                  <button
                    onClick={() => deleteShift(s.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h3 className="font-bold text-stone-800">新增班次</h3>
              <button onClick={() => setShowAdd(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">理发师</label>
                <select
                  value={form.barberId}
                  onChange={(e) => setForm({ ...form, barberId: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                >
                  {barbers.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">开始时间</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1.5">结束时间</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">最大预约数</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.maxAppointments}
                  onChange={(e) => setForm({ ...form, maxAppointments: Number(e.target.value) })}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setShowAdd(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg transition-all"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

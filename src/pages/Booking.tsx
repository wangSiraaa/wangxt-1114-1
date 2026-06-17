import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { formatDate, getWeekDates, getDateOffset } from '@/utils/date'
import type { AppointmentType } from '@/types'
import {
  Home,
  Store,
  AlertTriangle,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Sparkles,
  Users,
  Route,
  Unlock,
  FileText,
  Phone,
  ChevronRight,
  Star,
  ShieldCheck,
  MapPin,
  HandHelping,
  Lock,
} from 'lucide-react'
import WorkflowTimeline from '@/components/WorkflowTimeline'

export default function Booking() {
  const {
    shifts,
    residents,
    appointments,
    families,
    familyGroups,
    createAppointment,
    getShiftAppointmentCount,
    getRecommendedShifts,
    createFamilyGroup,
    addToFamilyGroup,
    getFamilyGroupAvailableSlots,
    submitReinstatementRequest,
    getUnlockConditions,
    canApplyReinstatement,
    getWorkflowSteps,
    getFamilyMembers,
  } = useBookingStore()

  const weekDates = getWeekDates()
  const [selectedDate, setSelectedDate] = useState(getDateOffset(0))
  const [selectedResident, setSelectedResident] = useState('')
  const [bookingType, setBookingType] = useState<AppointmentType>('instore')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showFamilyBooking, setShowFamilyBooking] = useState(false)
  const [selectedFamily, setSelectedFamily] = useState('')
  const [showReinstatement, setShowReinstatement] = useState(false)
  const [reinstatementForm, setReinstatementForm] = useState({ reason: '', contactPhone: '' })
  const [selectedAppointmentForWorkflow, setSelectedAppointmentForWorkflow] = useState<string | null>(null)
  const [showRecommended, setShowRecommended] = useState(true)

  const dateShifts = shifts
    .filter((s) => s.date === selectedDate && !s.isLeave)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  const selectedResidentData = residents.find((r) => r.id === selectedResident)
  const selectedFamilyData = families.find((f) => f.id === selectedFamily)
  const familyMembers = selectedFamily ? getFamilyMembers(selectedFamily) : []

  const recommendedShifts = selectedResident && showRecommended
    ? getRecommendedShifts(selectedResident, selectedDate, bookingType)
    : []

  const unlockConditions = selectedResident ? getUnlockConditions(selectedResident) : []
  const canApply = selectedResident ? canApplyReinstatement(selectedResident) : false

  const familyGroupsForDate = familyGroups.filter(
    (g) => g.date === selectedDate && g.isHomeService === (bookingType === 'home')
  )

  const residentAppointments = selectedResident
    ? appointments.filter((a) => a.residentId === selectedResident && a.status !== 'cancelled')
    : []

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

  const handleCreateFamilyGroup = (shiftId: string) => {
    if (!selectedFamily) {
      setMessage({ type: 'error', text: '请先选择家庭' })
      return
    }
    const group = createFamilyGroup(selectedFamily, shiftId, bookingType === 'home')
    if (group) {
      setMessage({ type: 'success', text: '家庭拼单已创建，请添加家庭成员' })
    } else {
      setMessage({ type: 'error', text: '创建拼单失败' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleAddToFamilyGroup = (groupId: string, residentId: string, shiftId: string) => {
    const err = addToFamilyGroup(groupId, residentId, shiftId)
    if (err) {
      setMessage({ type: 'error', text: err })
    } else {
      setMessage({ type: 'success', text: '已加入家庭拼单' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSubmitReinstatement = () => {
    if (!selectedResident) return
    const err = submitReinstatementRequest({
      residentId: selectedResident,
      reason: reinstatementForm.reason,
      contactPhone: reinstatementForm.contactPhone,
    })
    if (err) {
      setMessage({ type: 'error', text: err })
    } else {
      setMessage({ type: 'success', text: '复约申请已提交，请等待社工审核' })
      setShowReinstatement(false)
      setReinstatementForm({ reason: '', contactPhone: '' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800">预约理发</h2>
        <p className="text-stone-500 text-sm mt-1">选择居民和时段，支持上门优先、家庭拼单</p>
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
              onChange={(e) => {
                const residentId = e.target.value
                setSelectedResident(residentId)
                const res = residents.find((r) => r.id === residentId)
                if (res) {
                  setSelectedFamily(res.familyId)
                  if (res.mobilityImpaired) {
                    setBookingType('home')
                  }
                }
              }}
              className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
            >
              <option value="">-- 请选择居民 --</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                  {r.mobilityImpaired ? ' 🦽' : ''}
                  {r.isSuspended ? ' (已暂停)' : ''}
                </option>
              ))}
            </select>

            {selectedResidentData && (
              <div className="mt-3 p-3 bg-stone-50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-stone-400" />
                  <span className="font-medium text-stone-700">{selectedResidentData.name}</span>
                  {selectedResidentData.mobilityImpaired && (
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                      行动不便
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <MapPin size={12} />
                  {selectedResidentData.address}
                  <span className="text-stone-400">· {selectedResidentData.distance}km</span>
                </div>

                {selectedResidentData.isSuspended ? (
                  <div className="mt-2 p-2 bg-rose-50 rounded-lg border border-rose-100">
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
                      <AlertTriangle size={12} />
                      已暂停预约资格
                    </div>
                    <p className="text-[11px] text-rose-500 mt-1">
                      连续爽约 {selectedResidentData.consecutiveNoShows} 次
                    </p>
                    <button
                      onClick={() => setShowReinstatement(true)}
                      disabled={!canApply}
                      className={`mt-2 w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        canApply
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Unlock size={12} />
                      {canApply ? '申请复约' : '等待期满可申请'}
                    </button>
                  </div>
                ) : selectedResidentData.consecutiveNoShows > 0 ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                    <AlertTriangle size={12} />
                    已连续爽约 {selectedResidentData.consecutiveNoShows} 次，再爽约{2 - selectedResidentData.consecutiveNoShows}次将暂停
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-medium text-stone-600 mb-2">服务方式</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (selectedResidentData?.mobilityImpaired) {
                      setMessage({ type: 'error', text: '行动不便居民只能安排上门服务' })
                      setTimeout(() => setMessage(null), 3000)
                      return
                    }
                    setBookingType('instore')
                  }}
                  disabled={selectedResidentData?.mobilityImpaired}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    bookingType === 'instore'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                      : selectedResidentData?.mobilityImpaired
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
                      : 'bg-stone-50 text-stone-600 border border-stone-200 hover:border-blue-300'
                  }`}
                >
                  <Store size={14} />
                  到店
                  {selectedResidentData?.mobilityImpaired && <Lock size={12} />}
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
              {selectedResidentData?.mobilityImpaired && (
                <div className="flex items-center gap-1.5 mt-2 text-[11px] text-orange-600 bg-orange-50 px-2 py-1.5 rounded-lg">
                  <HandHelping size={12} />
                  <span>行动不便居民已自动锁定上门服务</span>
                </div>
              )}
            </div>

            {bookingType === 'home' && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-stone-600">家庭拼单</h4>
                  <button
                    onClick={() => setShowFamilyBooking(!showFamilyBooking)}
                    className="text-xs text-orange-500 hover:text-orange-600 font-medium"
                  >
                    {showFamilyBooking ? '收起' : '展开'}
                  </button>
                </div>
                {showFamilyBooking && (
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-orange-700">
                      <Users size={12} />
                      <span className="font-medium">同一家庭多人连约，共用一次上门路线</span>
                    </div>
                    <div className="text-[11px] text-orange-600">
                      最多4人拼单，到店和上门不能混成一单
                    </div>
                    <select
                      value={selectedFamily}
                      onChange={(e) => setSelectedFamily(e.target.value)}
                      className="w-full border border-orange-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                    >
                      <option value="">-- 选择家庭 --</option>
                      {families.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}（{f.memberIds.length}人）</option>
                      ))}
                    </select>
                    {selectedFamilyData && (
                      <div className="text-[11px] text-stone-500">
                        <Route size={11} className="inline mr-1" />
                        地址：{selectedFamilyData.address}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedResidentData && residentAppointments.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
              <h3 className="font-semibold text-stone-700 mb-3">我的预约</h3>
              <div className="space-y-2">
                {residentAppointments.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="p-3 bg-stone-50 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors"
                    onClick={() => setSelectedAppointmentForWorkflow(a.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {a.type === 'home' ? (
                          <Home size={14} className="text-orange-500" />
                        ) : (
                          <Store size={14} className="text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-stone-700">{a.barberName}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        a.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                        a.status === 'noshow' ? 'bg-rose-100 text-rose-700' :
                        'bg-stone-100 text-stone-500'
                      }`}>
                        {a.status === 'pending' ? '待服务' :
                         a.status === 'completed' ? '已完成' :
                         a.status === 'noshow' ? '爽约' : '已取消'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {a.date} {a.startTime}-{a.endTime}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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

          {selectedResident && bookingType === 'home' && recommendedShifts.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" />
                  <span className="font-semibold text-amber-800">智能推荐时段</span>
                </div>
                <button
                  onClick={() => setShowRecommended(!showRecommended)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {showRecommended ? '隐藏' : '显示'}
                </button>
              </div>
              {showRecommended && (
                <div className="space-y-2">
                  {recommendedShifts.slice(0, 3).filter((r) => r.score > 0).map((rec) => (
                    <div
                      key={rec.shift.id}
                      className="bg-white/80 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center text-sm font-bold">
                          {rec.shift.barberName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-stone-700">{rec.shift.barberName}</p>
                          <p className="text-xs text-stone-500">
                            {rec.shift.startTime} - {rec.shift.endTime}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rec.reasons.slice(0, 3).map((reason, i) => (
                              <span key={i} className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.volunteerAvailable && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                            <HandHelping size={10} />
                            志愿者
                          </div>
                        )}
                        <button
                          onClick={() => handleBook(rec.shift.id)}
                          disabled={selectedResidentData?.isSuspended}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md transition-all"
                        >
                          立即预约
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-semibold text-stone-700">{formatDate(selectedDate)} 可约时段</h3>
              <span className="text-xs text-stone-400">{dateShifts.length} 个班次</span>
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
                  const shiftAppointments = appointments.filter((a) => a.shiftId === s.id && a.status !== 'noshow' && a.status !== 'cancelled')
                  const familySlots = selectedFamily
                    ? getFamilyGroupAvailableSlots(selectedFamily, s.id)
                    : 0
                  const hasFamilyGroup = familyGroups.some(
                    (g) => g.shiftId === s.id && g.familyId === selectedFamily && g.isHomeService === (bookingType === 'home')
                  )
                  const barber = shifts.find(sh => sh.id === s.id)
                  const barberData = useBookingStore.getState().barbers.find(b => b.id === barber?.barberId)

                  return (
                    <div key={s.id} className="px-5 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-orange-500/20">
                            {s.barberName[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-stone-700">{s.barberName}</p>
                              {bookingType === 'home' && barberData?.homeService && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full border border-emerald-200">
                                  可上门
                                </span>
                              )}
                            </div>
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

                      {showFamilyBooking && selectedFamily && bookingType === 'home' && !isFull && (
                        <div className="mt-3 pt-3 border-t border-stone-100">
                          {hasFamilyGroup ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-orange-600">
                                <Users size={12} />
                                <span>已有家庭拼单，剩余{familySlots}个名额</span>
                              </div>
                              <button
                                onClick={() => {
                                  if (selectedResident) {
                                    const group = familyGroups.find(
                                      g => g.shiftId === s.id && g.familyId === selectedFamily
                                    )
                                    if (group) {
                                      handleAddToFamilyGroup(group.id, selectedResident, s.id)
                                    }
                                  }
                                }}
                                disabled={familySlots === 0 || !selectedResident}
                                className="px-3 py-1 rounded-lg text-xs font-medium bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors disabled:opacity-50"
                              >
                                加入拼单
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleCreateFamilyGroup(s.id)}
                              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
                            >
                              <Users size={12} />
                              创建家庭拼单
                            </button>
                          )}
                        </div>
                      )}

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
                              {a.isPriority && <Star size={8} className="text-amber-500 fill-amber-500" />}
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

      {showReinstatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <h3 className="font-bold text-stone-800 flex items-center gap-2">
                <Unlock size={18} className="text-orange-500" />
                申请复约
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <h4 className="text-sm font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-stone-500" />
                  解锁条件进度
                </h4>
                <div className="space-y-2">
                  {unlockConditions.map((cond) => (
                    <div key={cond.id} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        cond.met ? 'bg-emerald-500' : 'bg-stone-200'
                      }`}>
                        {cond.met && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${cond.met ? 'text-emerald-700' : 'text-stone-600'}`}>
                          {cond.name}
                        </p>
                        <p className="text-[11px] text-stone-400">{cond.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-1">
                  <FileText size={12} />
                  复约原因
                </label>
                <textarea
                  value={reinstatementForm.reason}
                  onChange={(e) => setReinstatementForm({ ...reinstatementForm, reason: e.target.value })}
                  rows={3}
                  placeholder="请说明爽约原因和后续保证..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-1">
                  <Phone size={12} />
                  联系电话
                </label>
                <input
                  type="tel"
                  value={reinstatementForm.contactPhone}
                  onChange={(e) => setReinstatementForm({ ...reinstatementForm, contactPhone: e.target.value })}
                  placeholder="请输入联系电话"
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
              <button
                onClick={() => setShowReinstatement(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmitReinstatement}
                disabled={!reinstatementForm.reason || !reinstatementForm.contactPhone}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 hover:shadow-lg transition-all disabled:opacity-50"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAppointmentForWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800">预约工作流</h3>
              <button
                onClick={() => setSelectedAppointmentForWorkflow(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-6">
              <WorkflowTimeline
                steps={getWorkflowSteps(selectedAppointmentForWorkflow)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

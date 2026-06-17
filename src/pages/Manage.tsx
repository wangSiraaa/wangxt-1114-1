import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { getDateOffset } from '@/utils/date'
import {
  Home,
  Store,
  Check,
  X,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Unlock,
  RefreshCw,
  CalendarClock,
  Users,
  Star,
  Workflow,
} from 'lucide-react'
import type { Appointment, ReinstatementRequest } from '@/types'
import WorkflowTimeline from '@/components/WorkflowTimeline'

export default function Manage() {
  const {
    appointments,
    barbers,
    residents,
    familyGroups,
    reinstatementRequests,
    recalculationLogs,
    completeAppointment,
    noShowAppointment,
    cancelAppointment,
    reviewReinstatementRequest,
    recalculateSchedule,
    getWorkflowSteps,
  } = useBookingStore()

  const [selectedDate, setSelectedDate] = useState(getDateOffset(0))
  const [expandedBarbers, setExpandedBarbers] = useState<Set<string>>(new Set(barbers.map((b) => b.id)))
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'noshow' } | null>(null)
  const [activeTab, setActiveTab] = useState<'appointments' | 'reinstatements' | 'recalculation'>('appointments')
  const [selectedAppointmentWorkflow, setSelectedAppointmentWorkflow] = useState<string | null>(null)
  const [reviewRequest, setReviewRequest] = useState<ReinstatementRequest | null>(null)
  const [reviewNote, setReviewNote] = useState('')

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

  const suspendedResidents = residents.filter((r) => r.isSuspended)
  const pendingRequests = reinstatementRequests.filter((r) => r.status === 'pending')

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

  const handleReview = (approved: boolean) => {
    if (!reviewRequest) return
    reviewReinstatementRequest(reviewRequest.id, approved, reviewNote)
    setReviewRequest(null)
    setReviewNote('')
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
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-100 text-stone-500 border border-stone-200">
            <X size={9} />
            已取消
          </span>
        )
    }
  }

  const getRecalculationReasonLabel = (reason: string) => {
    const map: Record<string, string> = {
      leave: '理发师请假',
      noshow: '居民爽约',
      family_group: '家庭拼单优化',
      priority: '优先级调整',
      manual: '手动触发',
    }
    return map[reason] || reason
  }

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

      <div className="flex gap-2 bg-stone-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'appointments'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <CalendarClock size={16} />
          当日预约
        </button>
        <button
          onClick={() => setActiveTab('reinstatements')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
            activeTab === 'reinstatements'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <Unlock size={16} />
          复约申请
          {pendingRequests.length > 0 && (
            <span className="absolute top-1 right-3 w-4 h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recalculation')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'recalculation'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          <RefreshCw size={16} />
          排班重算
        </button>
      </div>

      {activeTab === 'appointments' && (
        <>
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
                const homeAppts = group.filter(a => a.type === 'home' && a.status !== 'cancelled')
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
                      <div className="flex items-center gap-3">
                        {homeAppts.length > 0 && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
                            {homeAppts.length} 个上门
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-stone-100 divide-y divide-stone-50">
                        {group.map((appointment) => (
                          <div key={appointment.id} className="px-5 py-3">
                            <div className="flex items-center justify-between">
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
                                    {appointment.isPriority && (
                                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full border border-amber-200">
                                        <Star size={8} className="fill-amber-500" />
                                        优先
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
                                <button
                                  onClick={() => setSelectedAppointmentWorkflow(appointment.id)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                  title="查看工作流"
                                >
                                  <Workflow size={14} />
                                </button>
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
                            {appointment.familyGroupId && (
                              <div className="mt-2 ml-11 flex items-center gap-1 text-[11px] text-orange-600">
                                <Users size={10} />
                                家庭拼单
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'reinstatements' && (
        <div className="space-y-4">
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                <FileText size={14} />
                有 {pendingRequests.length} 个待审批的复约申请
              </div>
            </div>
          )}

          {reinstatementRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center text-stone-400 text-sm">
              <Unlock size={40} className="mx-auto mb-3 text-stone-300" />
              暂无复约申请记录
            </div>
          ) : (
            <div className="space-y-3">
              {reinstatementRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white flex items-center justify-center text-sm font-bold">
                        {req.residentName[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-stone-700">{req.residentName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {req.status === 'pending' ? '待审批' :
                             req.status === 'approved' ? '已通过' : '已驳回'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">申请日期：{req.requestDate}</p>
                        <p className="text-sm text-stone-600 mt-2">{req.reason}</p>
                        <p className="text-xs text-stone-400 mt-1">联系电话：{req.contactPhone}</p>
                        {req.reviewNote && (
                          <p className="text-xs text-stone-500 mt-2 bg-stone-50 rounded-lg px-3 py-2">
                            审批意见：{req.reviewNote}
                          </p>
                        )}
                      </div>
                    </div>
                    {req.status === 'pending' && (
                      <button
                        onClick={() => setReviewRequest(req)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                      >
                        审批
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'recalculation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">排班重算日志记录，最近50条</p>
            <button
              onClick={() => recalculateSchedule(selectedDate, 'manual', '社工')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20"
            >
              <RefreshCw size={14} />
              手动重算
            </button>
          </div>

          {recalculationLogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center text-stone-400 text-sm">
              <RefreshCw size={40} className="mx-auto mb-3 text-stone-300" />
              暂无排班重算记录
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-stone-50">
                {recalculationLogs.map((log) => (
                  <div key={log.id} className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        log.reason === 'leave' ? 'bg-red-50 text-red-500' :
                        log.reason === 'noshow' ? 'bg-rose-50 text-rose-500' :
                        log.reason === 'family_group' ? 'bg-orange-50 text-orange-500' :
                        log.reason === 'priority' ? 'bg-amber-50 text-amber-500' :
                        'bg-stone-50 text-stone-500'
                      }`}>
                        <RefreshCw size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-700">{log.description}</p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          {log.date} · 触发人：{log.triggerBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-stone-600">
                        {log.affectedAppointments} 个预约
                      </p>
                      <p className="text-xs text-stone-400">
                        {log.affectedBarbers} 位理发师
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {selectedAppointmentWorkflow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-800">预约工作流</h3>
              <button
                onClick={() => setSelectedAppointmentWorkflow(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <WorkflowTimeline
                steps={getWorkflowSteps(selectedAppointmentWorkflow)}
              />
            </div>
          </div>
        </div>
      )}

      {reviewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
              <h3 className="font-bold text-stone-800">审批复约申请</h3>
              <p className="text-sm text-stone-500 mt-1">{reviewRequest.residentName} 的复约申请</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-stone-50 rounded-xl p-4">
                <p className="text-xs text-stone-500 mb-1">申请原因</p>
                <p className="text-sm text-stone-700">{reviewRequest.reason}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1.5">审批意见</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  rows={3}
                  placeholder="请输入审批意见..."
                  className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-between">
              <button
                onClick={() => {
                  setReviewRequest(null)
                  setReviewNote('')
                }}
                className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
              >
                取消
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleReview(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  驳回
                </button>
                <button
                  onClick={() => handleReview(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

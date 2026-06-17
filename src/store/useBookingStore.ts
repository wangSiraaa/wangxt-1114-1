import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Barber,
  Shift,
  Resident,
  Appointment,
  AppointmentType,
  Volunteer,
  Family,
  FamilyGroup,
  ReinstatementRequest,
  ScheduleRecalculationLog,
  WorkflowStep,
  WorkflowStepType,
  RecommendedShift,
  UnlockCondition,
  RecalculationReason,
} from '@/types'
import {
  SUSPENSION_THRESHOLD,
  REINSTATEMENT_WAIT_DAYS,
  MAX_FAMILY_GROUP_SIZE,
} from '@/types'
import { getDateOffset } from '@/utils/date'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const defaultVolunteers: Volunteer[] = [
  { id: 'v1', name: '陈社工', phone: '137-0001-1111', skills: ['上门协助', '行动不便护理'] },
  { id: 'v2', name: '林社工', phone: '137-0002-2222', skills: ['上门协助', '沟通协调'] },
  { id: 'v3', name: '黄志愿者', phone: '137-0003-3333', skills: ['上门协助'] },
]

const defaultFamilies: Family[] = [
  { id: 'f1', name: '赵家', address: '阳光小区1号楼302室', distance: 0.8, memberIds: ['r1', 'r6'] },
  { id: 'f2', name: '钱家', address: '幸福里2号楼101室', distance: 1.2, memberIds: ['r2'] },
  { id: 'f3', name: '孙家', address: '和平巷5号', distance: 2.1, memberIds: ['r3'] },
  { id: 'f4', name: '周家', address: '阳光小区3号楼501室', distance: 1.0, memberIds: ['r4'] },
  { id: 'f5', name: '吴家', address: '园丁路8号', distance: 1.5, memberIds: ['r5'] },
]

const defaultBarbers: Barber[] = [
  { id: 'b1', name: '张师傅', phone: '138-0001-1111', homeService: true, homeRadius: 3 },
  { id: 'b2', name: '李师傅', phone: '138-0002-2222', homeService: true, homeRadius: 2 },
  { id: 'b3', name: '王师傅', phone: '138-0003-3333', homeService: false, homeRadius: 0 },
]

const defaultResidents: Resident[] = [
  { id: 'r1', name: '赵阿姨', phone: '139-0001-1111', familyId: 'f1', familyName: '赵家', address: '阳光小区1号楼302室', distance: 0.8, mobilityImpaired: true, consecutiveNoShows: 0, totalNoShows: 0, isSuspended: false },
  { id: 'r6', name: '赵伯伯', phone: '139-0006-6666', familyId: 'f1', familyName: '赵家', address: '阳光小区1号楼302室', distance: 0.8, mobilityImpaired: false, consecutiveNoShows: 0, totalNoShows: 0, isSuspended: false },
  { id: 'r2', name: '钱伯伯', phone: '139-0002-2222', familyId: 'f2', familyName: '钱家', address: '幸福里2号楼101室', distance: 1.2, mobilityImpaired: false, consecutiveNoShows: 0, totalNoShows: 0, isSuspended: false },
  { id: 'r3', name: '孙奶奶', phone: '139-0003-3333', familyId: 'f3', familyName: '孙家', address: '和平巷5号', distance: 2.1, mobilityImpaired: true, consecutiveNoShows: 0, totalNoShows: 0, isSuspended: false },
  { id: 'r4', name: '周叔叔', phone: '139-0004-4444', familyId: 'f4', familyName: '周家', address: '阳光小区3号楼501室', distance: 1.0, mobilityImpaired: false, consecutiveNoShows: 2, totalNoShows: 3, isSuspended: true, suspensionReason: '连续爽约2次', suspensionDate: getDateOffset(-3) },
  { id: 'r5', name: '吴阿姨', phone: '139-0005-5555', familyId: 'f5', familyName: '吴家', address: '园丁路8号', distance: 1.5, mobilityImpaired: false, consecutiveNoShows: 1, totalNoShows: 1, isSuspended: false },
]

const defaultShifts: Shift[] = [
  { id: 's1', barberId: 'b1', barberName: '张师傅', date: getDateOffset(0), startTime: '08:00', endTime: '10:00', isLeave: false, maxAppointments: 4 },
  { id: 's2', barberId: 'b1', barberName: '张师傅', date: getDateOffset(0), startTime: '14:00', endTime: '16:00', isLeave: false, maxAppointments: 4 },
  { id: 's3', barberId: 'b2', barberName: '李师傅', date: getDateOffset(0), startTime: '09:00', endTime: '11:00', isLeave: false, maxAppointments: 3 },
  { id: 's4', barberId: 'b2', barberName: '李师傅', date: getDateOffset(1), startTime: '08:00', endTime: '12:00', isLeave: false, maxAppointments: 5 },
  { id: 's5', barberId: 'b3', barberName: '王师傅', date: getDateOffset(1), startTime: '10:00', endTime: '14:00', isLeave: false, maxAppointments: 6 },
  { id: 's6', barberId: 'b1', barberName: '张师傅', date: getDateOffset(2), startTime: '08:00', endTime: '12:00', isLeave: false, maxAppointments: 5 },
]

const defaultAppointments: Appointment[] = [
  {
    id: 'a1',
    residentId: 'r1',
    residentName: '赵阿姨',
    shiftId: 's1',
    barberId: 'b1',
    barberName: '张师傅',
    date: getDateOffset(0),
    startTime: '08:00',
    endTime: '08:30',
    type: 'home',
    status: 'pending',
    isPriority: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    residentId: 'r6',
    residentName: '赵伯伯',
    shiftId: 's1',
    barberId: 'b1',
    barberName: '张师傅',
    date: getDateOffset(0),
    startTime: '08:30',
    endTime: '09:00',
    type: 'home',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a3',
    residentId: 'r2',
    residentName: '钱伯伯',
    shiftId: 's3',
    barberId: 'b2',
    barberName: '李师傅',
    date: getDateOffset(0),
    startTime: '09:00',
    endTime: '09:30',
    type: 'instore',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
]

const defaultFamilyGroups: FamilyGroup[] = []

const defaultReinstatementRequests: ReinstatementRequest[] = [
  {
    id: 'rr1',
    residentId: 'r4',
    residentName: '周叔叔',
    reason: '之前身体不适导致爽约，现在已经康复，保证以后按时到店',
    contactPhone: '139-0004-4444',
    status: 'pending',
    requestDate: getDateOffset(-1),
  },
]

const defaultRecalculationLogs: ScheduleRecalculationLog[] = []

interface BookingState {
  barbers: Barber[]
  shifts: Shift[]
  residents: Resident[]
  appointments: Appointment[]
  volunteers: Volunteer[]
  families: Family[]
  familyGroups: FamilyGroup[]
  reinstatementRequests: ReinstatementRequest[]
  recalculationLogs: ScheduleRecalculationLog[]

  addShift: (shift: Omit<Shift, 'id'>) => void
  deleteShift: (shiftId: string) => void
  setLeave: (shiftId: string, isLeave: boolean) => void

  getShiftAppointmentCount: (shiftId: string) => number
  createAppointment: (
    params: { residentId: string; shiftId: string; type: AppointmentType; familyGroupId?: string }
  ) => string | null
  completeAppointment: (appointmentId: string, note?: string) => void
  noShowAppointment: (appointmentId: string, reason?: string) => void
  cancelAppointment: (appointmentId: string) => void

  getRecommendedShifts: (residentId: string, date: string, type: AppointmentType) => RecommendedShift[]
  createFamilyGroup: (familyId: string, shiftId: string, isHomeService: boolean) => FamilyGroup | null
  addToFamilyGroup: (groupId: string, residentId: string, shiftId: string) => string | null
  removeFromFamilyGroup: (groupId: string, appointmentId: string) => void
  getFamilyGroupAvailableSlots: (familyId: string, shiftId: string) => number

  submitReinstatementRequest: (params: { residentId: string; reason: string; contactPhone: string }) => string | null
  reviewReinstatementRequest: (id: string, approved: boolean, note?: string) => void
  getUnlockConditions: (residentId: string) => UnlockCondition[]
  canApplyReinstatement: (residentId: string) => boolean

  recalculateSchedule: (date: string, reason: RecalculationReason, triggerBy: string) => void
  getWorkflowSteps: (appointmentId: string) => WorkflowStep[]

  getAvailableVolunteers: (date: string, shiftId: string) => Volunteer[]
  getFamilyMembers: (familyId: string) => Resident[]
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      barbers: defaultBarbers,
      shifts: defaultShifts,
      residents: defaultResidents,
      appointments: defaultAppointments,
      volunteers: defaultVolunteers,
      families: defaultFamilies,
      familyGroups: defaultFamilyGroups,
      reinstatementRequests: defaultReinstatementRequests,
      recalculationLogs: defaultRecalculationLogs,

      addShift: (shift) => {
        set((state) => ({
          shifts: [...state.shifts, { ...shift, id: genId() }],
        }))
      },

      deleteShift: (shiftId) => {
        set((state) => ({
          shifts: state.shifts.filter((s) => s.id !== shiftId),
        }))
      },

      setLeave: (shiftId, isLeave) => {
        set((state) => {
          const shift = state.shifts.find((s) => s.id === shiftId)
          if (!shift) return state

          if (isLeave) {
            get().recalculateSchedule(shift.date, 'leave', 'system')
          }

          return {
            shifts: state.shifts.map((s) =>
              s.id === shiftId ? { ...s, isLeave } : s
            ),
          }
        })
      },

      getShiftAppointmentCount: (shiftId) => {
        return get().appointments.filter(
          (a) => a.shiftId === shiftId && a.status !== 'cancelled' && a.status !== 'noshow'
        ).length
      },

      createAppointment: ({ residentId, shiftId, type, familyGroupId }) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === residentId)
        const shift = state.shifts.find((s) => s.id === shiftId)

        if (!resident || !shift) return '居民或班次不存在'
        if (resident.isSuspended) return '该居民已被暂停预约，请先申请复约'
        if (shift.isLeave) return '该班次已请假，不可预约'

        const count = state.getShiftAppointmentCount(shiftId)
        if (count >= shift.maxAppointments) return '该班次已满'

        const barber = state.barbers.find((b) => b.id === shift.barberId)
        if (type === 'home' && barber && !barber.homeService) {
          return '该理发师不提供上门服务'
        }
        if (type === 'home' && barber && resident.distance > barber.homeRadius) {
          return '该地址超出理发师上门服务范围'
        }

        if (type === 'home' && familyGroupId) {
          const group = state.familyGroups.find((g) => g.id === familyGroupId)
          if (group && !group.isHomeService) {
            return '家庭拼单类型不匹配，不能混排到店和上门'
          }
        }

        const slotDuration = 30
        const startMinutes = parseInt(shift.startTime.split(':')[0]) * 60 + parseInt(shift.startTime.split(':')[1])
        const appointmentIndex = count
        const apptStartMinutes = startMinutes + appointmentIndex * slotDuration
        const apptEndMinutes = apptStartMinutes + slotDuration
        const shiftEndMinutes = parseInt(shift.endTime.split(':')[0]) * 60 + parseInt(shift.endTime.split(':')[1])

        if (apptEndMinutes > shiftEndMinutes) return '该班次没有剩余时段'

        const formatTime = (mins: number) => {
          const h = Math.floor(mins / 60).toString().padStart(2, '0')
          const m = (mins % 60).toString().padStart(2, '0')
          return `${h}:${m}`
        }

        const newAppointment: Appointment = {
          id: genId(),
          residentId: resident.id,
          residentName: resident.name,
          shiftId: shift.id,
          barberId: shift.barberId,
          barberName: shift.barberName,
          date: shift.date,
          startTime: formatTime(apptStartMinutes),
          endTime: formatTime(apptEndMinutes),
          type,
          status: 'pending',
          familyGroupId,
          isPriority: resident.mobilityImpaired && type === 'home',
          createdAt: new Date().toISOString(),
        }

        set((state) => {
          let updatedFamilyGroups = state.familyGroups
          if (familyGroupId) {
            updatedFamilyGroups = state.familyGroups.map((g) =>
              g.id === familyGroupId
                ? { ...g, appointmentIds: [...g.appointmentIds, newAppointment.id] }
                : g
            )
          }

          return {
            appointments: [...state.appointments, newAppointment],
            familyGroups: updatedFamilyGroups,
          }
        })

        return null
      },

      completeAppointment: (appointmentId, note) => {
        set((state) => ({
          appointments: state.appointments.map((a) =>
            a.id === appointmentId
              ? { ...a, status: 'completed', completionNote: note }
              : a
          ),
        }))
      },

      noShowAppointment: (appointmentId, reason) => {
        set((state) => {
          const appointment = state.appointments.find((a) => a.id === appointmentId)
          if (!appointment) return state

          const updatedResidents = state.residents.map((r) => {
            if (r.id === appointment.residentId) {
              const newConsecutive = r.consecutiveNoShows + 1
              const newTotal = r.totalNoShows + 1
              const isSuspended = newConsecutive >= SUSPENSION_THRESHOLD
              return {
                ...r,
                consecutiveNoShows: newConsecutive,
                totalNoShows: newTotal,
                isSuspended,
                suspensionReason: isSuspended ? `连续爽约${newConsecutive}次` : undefined,
                suspensionDate: isSuspended ? getDateOffset(0) : undefined,
              }
            }
            return r
          })

          get().recalculateSchedule(appointment.date, 'noshow', 'volunteer')

          return {
            appointments: state.appointments.map((a) =>
              a.id === appointmentId ? { ...a, status: 'noshow', noshowReason: reason } : a
            ),
            residents: updatedResidents,
          }
        })
      },

      cancelAppointment: (appointmentId) => {
        set((state) => {
          const appointment = state.appointments.find((a) => a.id === appointmentId)
          if (!appointment) return state

          let updatedFamilyGroups = state.familyGroups
          if (appointment.familyGroupId) {
            updatedFamilyGroups = state.familyGroups.map((g) => {
              if (g.id === appointment.familyGroupId) {
                return {
                  ...g,
                  appointmentIds: g.appointmentIds.filter((id) => id !== appointmentId),
                }
              }
              return g
            }).filter((g) => g.appointmentIds.length > 0)
          }

          return {
            appointments: state.appointments.map((a) =>
              a.id === appointmentId ? { ...a, status: 'cancelled' } : a
            ),
            familyGroups: updatedFamilyGroups,
          }
        })
      },

      getRecommendedShifts: (residentId, date, type) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === residentId)
        if (!resident) return []

        const availableShifts = state.shifts.filter(
          (s) => s.date === date && !s.isLeave
        )

        const volunteers = state.getAvailableVolunteers(date, '')

        const recommendations: RecommendedShift[] = availableShifts.map((shift) => {
          const barber = state.barbers.find((b) => b.id === shift.barberId)
          const count = state.getShiftAppointmentCount(shift.id)
          const isFull = count >= shift.maxAppointments

          let score = 0
          const reasons: string[] = []

          if (isFull) {
            return {
              shift,
              score: 0,
              reasons: ['该班次已满'],
              volunteerAvailable: false,
              distance: resident.distance,
              familySlotsAvailable: 0,
            }
          }

          if (type === 'home') {
            if (barber?.homeService && resident.distance <= barber.homeRadius) {
              score += 40
              reasons.push('在上门服务范围内')
            } else {
              score -= 100
              reasons.push('超出上门服务范围')
            }

            if (resident.mobilityImpaired) {
              score += 30
              reasons.push('行动不便优先')
            }

            if (volunteers.length > 0) {
              score += 20
              reasons.push('有志愿者可协助')
            }

            const distanceScore = Math.max(0, 10 - resident.distance * 3)
            score += distanceScore
            if (resident.distance <= 1) {
              reasons.push('距离较近')
            }
          } else {
            score += 50
            reasons.push('到店服务随时可用')
          }

          const availableSlots = shift.maxAppointments - count
          if (availableSlots >= 3) {
            score += 10
            reasons.push('时段充足')
          }

          const familySlots = state.getFamilyGroupAvailableSlots(resident.familyId, shift.id)
          if (familySlots > 0 && type === 'home') {
            score += 15
            reasons.push('可加入家庭拼单')
          }

          const earlyHour = parseInt(shift.startTime.split(':')[0])
          if (earlyHour >= 8 && earlyHour < 12) {
            score += 5
          }

          return {
            shift,
            score: Math.max(0, score),
            reasons,
            volunteerAvailable: volunteers.length > 0,
            volunteer: volunteers[0],
            distance: resident.distance,
            familySlotsAvailable: familySlots,
          }
        })

        return recommendations.sort((a, b) => b.score - a.score)
      },

      createFamilyGroup: (familyId, shiftId, isHomeService) => {
        const state = get()
        const family = state.families.find((f) => f.id === familyId)
        const shift = state.shifts.find((s) => s.id === shiftId)
        const barber = state.barbers.find((b) => b.id === shift?.barberId)

        if (!family || !shift) return null
        if (isHomeService && barber && !barber.homeService) return null

        const newGroup: FamilyGroup = {
          id: genId(),
          familyId,
          familyName: family.name,
          date: shift.date,
          shiftId,
          barberId: shift.barberId,
          barberName: shift.barberName,
          appointmentIds: [],
          isHomeService,
          routeOptimized: true,
        }

        set((state) => ({
          familyGroups: [...state.familyGroups, newGroup],
        }))

        return newGroup
      },

      addToFamilyGroup: (groupId, residentId, shiftId) => {
        const state = get()
        const group = state.familyGroups.find((g) => g.id === groupId)
        const resident = state.residents.find((r) => r.id === residentId)

        if (!group || !resident) return '拼单组或居民不存在'
        if (resident.familyId !== group.familyId) return '只能添加同一家庭的成员'
        if (group.appointmentIds.length >= MAX_FAMILY_GROUP_SIZE) return '拼单人数已达上限'

        const existingAppts = state.appointments.filter(
          (a) => a.familyGroupId === groupId && a.status !== 'cancelled'
        )
        const existingResidentIds = existingAppts.map((a) => a.residentId)
        if (existingResidentIds.includes(residentId)) {
          return '该居民已在拼单中'
        }

        return state.createAppointment({
          residentId,
          shiftId,
          type: group.isHomeService ? 'home' : 'instore',
          familyGroupId: groupId,
        })
      },

      removeFromFamilyGroup: (groupId, appointmentId) => {
        set((state) => {
          const updatedGroups = state.familyGroups.map((g) => {
            if (g.id === groupId) {
              return {
                ...g,
                appointmentIds: g.appointmentIds.filter((id) => id !== appointmentId),
              }
            }
            return g
          }).filter((g) => g.appointmentIds.length > 0)

          return {
            appointments: state.appointments.map((a) =>
              a.id === appointmentId ? { ...a, status: 'cancelled', familyGroupId: undefined } : a
            ),
            familyGroups: updatedGroups,
          }
        })
      },

      getFamilyGroupAvailableSlots: (familyId, shiftId) => {
        const state = get()
        const group = state.familyGroups.find(
          (g) => g.familyId === familyId && g.shiftId === shiftId
        )
        if (!group) return MAX_FAMILY_GROUP_SIZE

        const activeAppts = state.appointments.filter(
          (a) => a.familyGroupId === group.id && a.status !== 'cancelled'
        )
        return MAX_FAMILY_GROUP_SIZE - activeAppts.length
      },

      submitReinstatementRequest: ({ residentId, reason, contactPhone }) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === residentId)

        if (!resident) return '居民不存在'
        if (!resident.isSuspended) return '该居民未被暂停预约'
        if (!state.canApplyReinstatement(residentId)) {
          return `需等待${REINSTATEMENT_WAIT_DAYS}天后才能申请复约`
        }

        const existingPending = state.reinstatementRequests.find(
          (r) => r.residentId === residentId && r.status === 'pending'
        )
        if (existingPending) return '已有待审批的复约申请'

        const newRequest: ReinstatementRequest = {
          id: genId(),
          residentId,
          residentName: resident.name,
          reason,
          contactPhone,
          status: 'pending',
          requestDate: getDateOffset(0),
        }

        set((state) => ({
          reinstatementRequests: [...state.reinstatementRequests, newRequest],
        }))

        return null
      },

      reviewReinstatementRequest: (id, approved, note) => {
        set((state) => {
          const request = state.reinstatementRequests.find((r) => r.id === id)
          if (!request) return state

          let updatedResidents = state.residents
          if (approved) {
            updatedResidents = state.residents.map((r) =>
              r.id === request.residentId
                ? {
                    ...r,
                    isSuspended: false,
                    consecutiveNoShows: 0,
                    suspensionReason: undefined,
                    suspensionDate: undefined,
                  }
                : r
            )
          }

          return {
            reinstatementRequests: state.reinstatementRequests.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: approved ? 'approved' : 'rejected',
                    reviewDate: getDateOffset(0),
                    reviewer: '社工',
                    reviewNote: note,
                  }
                : r
            ),
            residents: updatedResidents,
          }
        })
      },

      getUnlockConditions: (residentId) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === residentId)
        if (!resident) return []

        const conditions: UnlockCondition[] = []

        conditions.push({
          id: 'c1',
          name: '等待期满',
          description: '暂停预约后需等待7天方可申请复约',
          requirement: `等待${REINSTATEMENT_WAIT_DAYS}天`,
          met: state.canApplyReinstatement(residentId),
        })

        conditions.push({
          id: 'c2',
          name: '提交复约申请',
          description: '填写复约原因和联系电话',
          requirement: '提交申请',
          met: state.reinstatementRequests.some(
            (r) => r.residentId === residentId && r.status !== 'rejected'
          ),
        })

        conditions.push({
          id: 'c3',
          name: '社工审核通过',
          description: '社工审核复约申请',
          requirement: '审核通过',
          met: state.reinstatementRequests.some(
            (r) => r.residentId === residentId && r.status === 'approved'
          ),
        })

        conditions.push({
          id: 'c4',
          name: '签署守约承诺',
          description: '承诺按时履约，再次爽约将延长暂停期',
          requirement: '签署承诺',
          met: false,
        })

        return conditions
      },

      canApplyReinstatement: (residentId) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === residentId)
        if (!resident || !resident.isSuspended || !resident.suspensionDate) return false

        const suspendDate = new Date(resident.suspensionDate + 'T00:00:00')
        const today = new Date(getDateOffset(0) + 'T00:00:00')
        const diffDays = Math.floor((today.getTime() - suspendDate.getTime()) / (1000 * 60 * 60 * 24))

        return diffDays >= REINSTATEMENT_WAIT_DAYS
      },

      recalculateSchedule: (date, reason, triggerBy) => {
        const state = get()
        const dayAppointments = state.appointments.filter((a) => a.date === date)
        const dayShifts = state.shifts.filter((s) => s.date === date)
        const affectedBarbers = new Set(dayShifts.map((s) => s.barberId))

        const reasonDescriptions: Record<RecalculationReason, string> = {
          leave: '理发师请假，触发排班重算',
          noshow: '居民爽约，自动重排后续预约',
          family_group: '家庭拼单优化路线',
          priority: '行动不便居民优先级调整',
          manual: '手动触发重算',
        }

        const log: ScheduleRecalculationLog = {
          id: genId(),
          date,
          reason,
          triggerBy,
          affectedAppointments: dayAppointments.length,
          affectedBarbers: affectedBarbers.size,
          timestamp: new Date().toISOString(),
          description: reasonDescriptions[reason] || '排班重算',
        }

        set((state) => ({
          recalculationLogs: [log, ...state.recalculationLogs].slice(0, 50),
        }))
      },

      getWorkflowSteps: (appointmentId) => {
        const state = get()
        const appointment = state.appointments.find((a) => a.id === appointmentId)
        if (!appointment) return []

        const steps: WorkflowStep[] = [
          {
            id: 'shift',
            type: 'shift',
            label: '班次排定',
            description: '理发师排班确认',
            status: 'completed',
            iconName: 'CalendarDays',
          },
          {
            id: 'booking',
            type: 'booking',
            label: '预约确认',
            description: '居民成功预约时段',
            status: 'completed',
            iconName: 'ClipboardCheck',
          },
        ]

        if (appointment.type === 'home') {
          steps.push({
            id: 'onsite',
            type: 'onsite',
            label: '上门出发',
            description: '理发师前往居民家中',
            status: appointment.status === 'pending' ? 'pending' : 'completed',
            iconName: 'Home',
          })
        }

        steps.push({
          id: 'service',
          type: 'service',
          label: '服务进行',
          description: '理发服务中',
          status: appointment.status === 'pending' ? 'pending' : 'completed',
          iconName: 'Scissors',
        })

        if (appointment.status === 'completed') {
          steps.push({
            id: 'complete',
            type: 'complete',
            label: '服务完成',
            description: '服务已完成，确认满意',
            status: 'completed',
            iconName: 'CheckCircle',
          })
        } else if (appointment.status === 'noshow') {
          steps.push({
            id: 'noshow',
            type: 'noshow',
            label: '爽约',
            description: appointment.noshowReason || '居民未按时赴约',
            status: 'skipped',
            iconName: 'XCircle',
          })
        } else if (appointment.status === 'cancelled') {
          steps.push({
            id: 'complete',
            type: 'complete',
            label: '已取消',
            description: '预约已取消',
            status: 'skipped',
            iconName: 'XCircle',
          })
        }

        return steps.map((step, index) => {
          if (appointment.status === 'pending') {
            if (step.type === 'shift' || step.type === 'booking') {
              return { ...step, status: 'completed' as const }
            }
            if (step.type === (appointment.type === 'home' ? 'onsite' : 'service')) {
              return { ...step, status: 'current' as const }
            }
            return { ...step, status: 'pending' as const }
          }
          return step
        })
      },

      getAvailableVolunteers: (_date, _shiftId) => {
        return get().volunteers.filter((v) => v.skills.includes('上门协助'))
      },

      getFamilyMembers: (familyId) => {
        return get().residents.filter((r) => r.familyId === familyId)
      },
    }),
    {
      name: 'booking-store',
    }
  )
)

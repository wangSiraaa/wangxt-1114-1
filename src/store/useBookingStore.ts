import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Barber, Shift, Resident, Appointment, AppointmentType } from '@/types'
import { getDateOffset } from '@/utils/date'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const defaultBarbers: Barber[] = [
  { id: 'b1', name: '张师傅', phone: '138-0001-1111' },
  { id: 'b2', name: '李师傅', phone: '138-0002-2222' },
  { id: 'b3', name: '王师傅', phone: '138-0003-3333' },
]

const defaultResidents: Resident[] = [
  { id: 'r1', name: '赵阿姨', phone: '139-0001-1111', mobilityImpaired: true, consecutiveNoShows: 0, isSuspended: false },
  { id: 'r2', name: '钱伯伯', phone: '139-0002-2222', mobilityImpaired: false, consecutiveNoShows: 0, isSuspended: false },
  { id: 'r3', name: '孙奶奶', phone: '139-0003-3333', mobilityImpaired: true, consecutiveNoShows: 0, isSuspended: false },
  { id: 'r4', name: '周叔叔', phone: '139-0004-4444', mobilityImpaired: false, consecutiveNoShows: 2, isSuspended: true },
  { id: 'r5', name: '吴阿姨', phone: '139-0005-5555', mobilityImpaired: false, consecutiveNoShows: 1, isSuspended: false },
  { id: 'r6', name: '郑伯伯', phone: '139-0006-6666', mobilityImpaired: true, consecutiveNoShows: 0, isSuspended: false },
]

const defaultShifts: Shift[] = [
  { id: 's1', barberId: 'b1', barberName: '张师傅', date: getDateOffset(0), startTime: '08:00', endTime: '10:00', isLeave: false, maxAppointments: 4 },
  { id: 's2', barberId: 'b1', barberName: '张师傅', date: getDateOffset(0), startTime: '10:00', endTime: '12:00', isLeave: false, maxAppointments: 4 },
  { id: 's3', barberId: 'b2', barberName: '李师傅', date: getDateOffset(0), startTime: '09:00', endTime: '11:00', isLeave: false, maxAppointments: 3 },
  { id: 's4', barberId: 'b2', barberName: '李师傅', date: getDateOffset(0), startTime: '14:00', endTime: '16:00', isLeave: true, maxAppointments: 3 },
  { id: 's5', barberId: 'b3', barberName: '王师傅', date: getDateOffset(0), startTime: '08:30', endTime: '11:30', isLeave: false, maxAppointments: 5 },
  { id: 's6', barberId: 'b1', barberName: '张师傅', date: getDateOffset(1), startTime: '08:00', endTime: '10:00', isLeave: false, maxAppointments: 4 },
  { id: 's7', barberId: 'b2', barberName: '李师傅', date: getDateOffset(1), startTime: '09:00', endTime: '11:00', isLeave: false, maxAppointments: 3 },
  { id: 's8', barberId: 'b3', barberName: '王师傅', date: getDateOffset(1), startTime: '14:00', endTime: '17:00', isLeave: false, maxAppointments: 5 },
  { id: 's9', barberId: 'b1', barberName: '张师傅', date: getDateOffset(2), startTime: '09:00', endTime: '12:00', isLeave: false, maxAppointments: 4 },
  { id: 's10', barberId: 'b2', barberName: '李师傅', date: getDateOffset(2), startTime: '14:00', endTime: '16:00', isLeave: false, maxAppointments: 3 },
]

const defaultAppointments: Appointment[] = [
  { id: 'a1', residentId: 'r1', residentName: '赵阿姨', shiftId: 's1', barberId: 'b1', barberName: '张师傅', type: 'home', status: 'pending', date: getDateOffset(0), startTime: '08:00', endTime: '10:00', createdAt: new Date().toISOString() },
  { id: 'a2', residentId: 'r2', residentName: '钱伯伯', shiftId: 's1', barberId: 'b1', barberName: '张师傅', type: 'instore', status: 'pending', date: getDateOffset(0), startTime: '08:00', endTime: '10:00', createdAt: new Date().toISOString() },
  { id: 'a3', residentId: 'r3', residentName: '孙奶奶', shiftId: 's3', barberId: 'b2', barberName: '李师傅', type: 'home', status: 'pending', date: getDateOffset(0), startTime: '09:00', endTime: '11:00', createdAt: new Date().toISOString() },
  { id: 'a4', residentId: 'r5', residentName: '吴阿姨', shiftId: 's5', barberId: 'b3', barberName: '王师傅', type: 'instore', status: 'pending', date: getDateOffset(0), startTime: '08:30', endTime: '11:30', createdAt: new Date().toISOString() },
  { id: 'a5', residentId: 'r6', residentName: '郑伯伯', shiftId: 's6', barberId: 'b1', barberName: '张师傅', type: 'home', status: 'pending', date: getDateOffset(1), startTime: '08:00', endTime: '10:00', createdAt: new Date().toISOString() },
]

interface BookingStore {
  barbers: Barber[]
  shifts: Shift[]
  residents: Resident[]
  appointments: Appointment[]

  addShift: (shift: Omit<Shift, 'id'>) => void
  updateShift: (id: string, data: Partial<Shift>) => void
  deleteShift: (id: string) => void
  setLeave: (shiftId: string, isLeave: boolean) => void

  createAppointment: (data: { residentId: string; shiftId: string; type: AppointmentType }) => string | null
  completeAppointment: (id: string) => void
  noShowAppointment: (id: string) => void
  cancelAppointment: (id: string) => void

  isResidentSuspended: (residentId: string) => boolean
  getShiftAppointmentCount: (shiftId: string) => number
  resetData: () => void
}

const initialState = {
  barbers: defaultBarbers,
  shifts: defaultShifts,
  residents: defaultResidents,
  appointments: defaultAppointments,
}

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addShift: (shift) => {
        const newShift: Shift = { ...shift, id: genId() }
        set((s) => ({ shifts: [...s.shifts, newShift] }))
      },

      updateShift: (id, data) => {
        set((s) => ({
          shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, ...data } : sh)),
        }))
      },

      deleteShift: (id) => {
        set((s) => ({
          shifts: s.shifts.filter((sh) => sh.id !== id),
          appointments: s.appointments.filter((a) => a.shiftId !== id),
        }))
      },

      setLeave: (shiftId, isLeave) => {
        set((s) => ({
          shifts: s.shifts.map((sh) => (sh.id === shiftId ? { ...sh, isLeave } : sh)),
        }))
      },

      createAppointment: (data) => {
        const state = get()
        const resident = state.residents.find((r) => r.id === data.residentId)
        const shift = state.shifts.find((s) => s.id === data.shiftId)
        if (!resident || !shift) return '数据不存在'
        if (resident.isSuspended) return '该居民因连续爽约已被暂停预约，请联系社工'
        if (shift.isLeave) return '该班次理发师已请假，无法预约'
        const currentCount = state.appointments.filter(
          (a) => a.shiftId === data.shiftId && a.status !== 'noshow'
        ).length
        if (currentCount >= shift.maxAppointments) return '该时段已约满'

        const newAppointment: Appointment = {
          id: genId(),
          residentId: data.residentId,
          residentName: resident.name,
          shiftId: data.shiftId,
          barberId: shift.barberId,
          barberName: shift.barberName,
          type: data.type,
          status: 'pending',
          date: shift.date,
          startTime: shift.startTime,
          endTime: shift.endTime,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ appointments: [...s.appointments, newAppointment] }))
        return null
      },

      completeAppointment: (id) => {
        set((s) => {
          const appointment = s.appointments.find((a) => a.id === id)
          if (!appointment) return s
          const updatedResidents = s.residents.map((r) => {
            if (r.id === appointment.residentId) {
              return { ...r, consecutiveNoShows: 0, isSuspended: false }
            }
            return r
          })
          return {
            appointments: s.appointments.map((a) =>
              a.id === id ? { ...a, status: 'completed' as const } : a
            ),
            residents: updatedResidents,
          }
        })
      },

      noShowAppointment: (id) => {
        set((s) => {
          const appointment = s.appointments.find((a) => a.id === id)
          if (!appointment) return s
          const updatedResidents = s.residents.map((r) => {
            if (r.id === appointment.residentId) {
              const newCount = r.consecutiveNoShows + 1
              return {
                ...r,
                consecutiveNoShows: newCount,
                isSuspended: newCount >= 2,
              }
            }
            return r
          })
          return {
            appointments: s.appointments.map((a) =>
              a.id === id ? { ...a, status: 'noshow' as const } : a
            ),
            residents: updatedResidents,
          }
        })
      },

      cancelAppointment: (id) => {
        set((s) => ({
          appointments: s.appointments.filter((a) => a.id !== id),
        }))
      },

      isResidentSuspended: (residentId) => {
        const resident = get().residents.find((r) => r.id === residentId)
        return resident?.isSuspended ?? false
      },

      getShiftAppointmentCount: (shiftId) => {
        return get().appointments.filter(
          (a) => a.shiftId === shiftId && a.status !== 'noshow'
        ).length
      },

      resetData: () => {
        set(initialState)
      },
    }),
    {
      name: 'community-barber-booking',
    }
  )
)

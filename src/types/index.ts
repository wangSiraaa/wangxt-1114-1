export interface Barber {
  id: string
  name: string
  phone: string
}

export interface Shift {
  id: string
  barberId: string
  barberName: string
  date: string
  startTime: string
  endTime: string
  isLeave: boolean
  maxAppointments: number
}

export interface Resident {
  id: string
  name: string
  phone: string
  mobilityImpaired: boolean
  consecutiveNoShows: number
  isSuspended: boolean
}

export type AppointmentType = 'home' | 'instore'
export type AppointmentStatus = 'pending' | 'completed' | 'noshow'

export interface Appointment {
  id: string
  residentId: string
  residentName: string
  shiftId: string
  barberId: string
  barberName: string
  type: AppointmentType
  status: AppointmentStatus
  date: string
  startTime: string
  endTime: string
  createdAt: string
}

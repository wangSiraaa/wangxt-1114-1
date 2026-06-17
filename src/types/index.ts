export const SUSPENSION_THRESHOLD = 2
export const REINSTATEMENT_WAIT_DAYS = 7
export const MAX_FAMILY_GROUP_SIZE = 4
export const HOME_SERVICE_RADIUS_DEFAULT = 3

export type AppointmentType = 'instore' | 'home'
export type AppointmentStatus = 'pending' | 'completed' | 'noshow' | 'cancelled'
export type ReinstatementStatus = 'pending' | 'approved' | 'rejected'
export type WorkflowStepType = 'shift' | 'booking' | 'onsite' | 'service' | 'complete' | 'noshow'
export type RecalculationReason = 'leave' | 'noshow' | 'family_group' | 'priority' | 'manual'

export interface Barber {
  id: string
  name: string
  phone: string
  homeService: boolean
  homeRadius: number
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
  familyId: string
  familyName: string
  address: string
  distance: number
  mobilityImpaired: boolean
  consecutiveNoShows: number
  totalNoShows: number
  isSuspended: boolean
  suspensionReason?: string
  suspensionDate?: string
}

export interface Volunteer {
  id: string
  name: string
  phone: string
  skills: string[]
}

export interface Family {
  id: string
  name: string
  address: string
  distance: number
  memberIds: string[]
}

export interface FamilyGroup {
  id: string
  familyId: string
  familyName: string
  date: string
  shiftId: string
  barberId: string
  barberName: string
  appointmentIds: string[]
  isHomeService: boolean
  routeOptimized: boolean
}

export interface Appointment {
  id: string
  residentId: string
  residentName: string
  shiftId: string
  barberId: string
  barberName: string
  date: string
  startTime: string
  endTime: string
  type: AppointmentType
  status: AppointmentStatus
  familyGroupId?: string
  isPriority?: boolean
  volunteerId?: string
  volunteerName?: string
  noshowReason?: string
  completionNote?: string
  createdAt: string
}

export interface ReinstatementRequest {
  id: string
  residentId: string
  residentName: string
  reason: string
  contactPhone: string
  status: ReinstatementStatus
  requestDate: string
  reviewDate?: string
  reviewer?: string
  reviewNote?: string
}

export interface ScheduleRecalculationLog {
  id: string
  date: string
  reason: RecalculationReason
  triggerBy: string
  affectedAppointments: number
  affectedBarbers: number
  timestamp: string
  description: string
}

export interface WorkflowStep {
  id: string
  type: WorkflowStepType
  label: string
  description: string
  status: 'pending' | 'current' | 'completed' | 'skipped'
  iconName: string
}

export interface RecommendedShift {
  shift: Shift
  score: number
  reasons: string[]
  volunteerAvailable: boolean
  volunteer?: Volunteer
  distance: number
  familySlotsAvailable: number
}

export interface UnlockCondition {
  id: string
  name: string
  description: string
  requirement: string
  met: boolean
}

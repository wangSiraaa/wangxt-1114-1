import { CalendarDays, ClipboardCheck, Home, Scissors, CheckCircle, XCircle } from 'lucide-react'
import type { WorkflowStep } from '@/types'

interface WorkflowTimelineProps {
  steps: WorkflowStep[]
  compact?: boolean
}

const iconMap: Record<string, React.ComponentType<any>> = {
  CalendarDays,
  ClipboardCheck,
  Home,
  Scissors,
  CheckCircle,
  XCircle,
}

export default function WorkflowTimeline({ steps, compact = false }: WorkflowTimelineProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-emerald-500 text-white',
          line: 'bg-emerald-300',
          text: 'text-emerald-700',
          subtext: 'text-emerald-500',
        }
      case 'current':
        return {
          dot: 'bg-orange-500 text-white ring-4 ring-orange-100 animate-pulse',
          line: 'bg-stone-200',
          text: 'text-orange-700 font-semibold',
          subtext: 'text-orange-500',
        }
      case 'skipped':
        return {
          dot: 'bg-rose-500 text-white',
          line: 'bg-stone-200',
          text: 'text-rose-700',
          subtext: 'text-rose-500',
        }
      default:
        return {
          dot: 'bg-stone-200 text-stone-400',
          line: 'bg-stone-200',
          text: 'text-stone-400',
          subtext: 'text-stone-400',
        }
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {steps.map((step, index) => {
          const styles = getStatusStyles(step.status)
          const IconComponent = iconMap[step.iconName] || CalendarDays
          const isLast = index === steps.length - 1
          return (
            <div key={step.id} className="flex items-center">
              <div className={`w-7 h-7 rounded-full ${styles.dot} flex items-center justify-center flex-shrink-0`}>
                <IconComponent size={14} />
              </div>
              {!isLast && (
                <div className={`w-4 h-0.5 ${styles.line} mx-0.5`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="space-y-0">
        {steps.map((step, index) => {
          const styles = getStatusStyles(step.status)
          const IconComponent = iconMap[step.iconName] || CalendarDays
          const isLast = index === steps.length - 1

          return (
            <div key={step.id} className="relative flex gap-4">
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-8 w-0.5 h-full ${styles.line}`}
                  style={{ height: 'calc(100% - 32px)' }}
                />
              )}
              <div className={`w-8 h-8 rounded-full ${styles.dot} flex items-center justify-center flex-shrink-0 z-10`}>
                <IconComponent size={16} />
              </div>
              <div className="pb-5 flex-1">
                <div className={`text-sm ${styles.text}`}>
                  {step.label}
                </div>
                <div className={`text-xs ${styles.subtext} mt-0.5`}>
                  {step.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

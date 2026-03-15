import React, { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================
// OPTIMIZED CARD COMPONENTS
// ============================================

interface DashboardCardProps {
  children: React.ReactNode
  className?: string
  header?: {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
  }
  gradient?: 'emerald' | 'blue' | 'purple' | 'amber' | 'red' | 'slate'
  compact?: boolean
}

const gradientMap = {
  emerald: 'from-emerald-500 via-teal-500 to-cyan-500',
  blue: 'from-blue-500 via-indigo-500 to-purple-500',
  purple: 'from-purple-500 via-pink-500 to-rose-500',
  amber: 'from-amber-500 via-orange-500 to-yellow-500',
  red: 'from-red-500 via-rose-500 to-pink-500',
  slate: 'from-slate-500 via-slate-400 to-slate-500',
}

export const DashboardCard = memo(function DashboardCard({
  children,
  className,
  header,
  gradient,
  compact = false,
}: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'border shadow-lg overflow-hidden backdrop-blur-sm',
        'bg-white dark:bg-slate-800/60',
        'border-slate-200 dark:border-slate-700',
        className
      )}
    >
      {gradient && (
        <div className={`h-1 bg-gradient-to-r ${gradientMap[gradient]}`} />
      )}
      {header && (
        <CardHeader className={cn('pb-4', compact && 'p-4 pb-3')}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {header.icon && (
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradient ? gradientMap[gradient] : 'from-slate-500 to-slate-600'}`}>
                    <div className="text-white">{header.icon}</div>
                  </div>
                )}
                <CardTitle className="text-lg font-semibold truncate">
                  {header.title}
                </CardTitle>
              </div>
              {header.description && (
                <CardDescription className="mt-1.5 text-sm">
                  {header.description}
                </CardDescription>
              )}
            </div>
            {header.action && (
              <div className="flex-shrink-0">{header.action}</div>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={cn(compact && 'p-4 pt-0')}>
        {children}
      </CardContent>
    </Card>
  )
})

// ============================================
// SKELETON LOADING COMPONENTS
// ============================================

interface SkeletonProps {
  className?: string
}

export const Skeleton = memo(function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-slate-200 dark:bg-slate-700 shimmer',
        className
      )}
    />
  )
})

export const CardSkeleton = memo(function CardSkeleton({ 
  header = true,
  lines = 3,
  className 
}: { 
  header?: boolean
  lines?: number
  className?: string 
}) {
  return (
    <Card className={cn('border border-slate-200 dark:border-slate-700', className)}>
      {header && (
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  )
})

export const StatsSkeleton = memo(function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} header={false} lines={2} />
      ))}
    </div>
  )
})

export const TableSkeleton = memo(function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
})

// ============================================
// EMPTY STATE COMPONENT
// ============================================

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  compact?: boolean
}

export const EmptyState = memo(function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      compact ? 'py-8' : 'py-12'
    )}>
      <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <div className="text-slate-400">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 max-w-sm mb-4">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
})

// ============================================
// OPTIMIZED STAT CARD
// ============================================

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'slate'
  delay?: number
}

const colorClasses = {
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'bg-emerald-100 dark:bg-emerald-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'bg-blue-100 dark:bg-blue-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'bg-purple-100 dark:bg-purple-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'bg-amber-100 dark:bg-amber-800',
  },
  slate: {
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-600 dark:text-slate-400',
    icon: 'bg-slate-100 dark:bg-slate-800',
  },
}

export const StatCard = memo(function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'emerald',
  delay = 0,
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className="group"
    >
      <div
        className={cn(
          'relative p-4 rounded-xl border backdrop-blur-sm transition-all duration-300',
          'bg-white dark:bg-slate-800/60',
          'border-slate-200 dark:border-slate-700',
          'hover:border-emerald-500/30 hover:shadow-lg'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 mt-2 text-sm',
                  trend.positive ? 'text-emerald-500' : 'text-red-500'
                )}
              >
                <span>{trend.positive ? '↑' : '↓'}</span>
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
              colors.icon
            )}
          >
            <div className={colors.text}>{icon}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// ERROR BOUNDARY
// ============================================

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Something went wrong
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

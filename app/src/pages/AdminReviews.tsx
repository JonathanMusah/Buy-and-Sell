import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  MessageSquare,
  Clock,
  TriangleAlert
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export default function AdminReviews({ embedded }: { embedded?: boolean }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const res = await adminApi.getReviews()
      setReviews(res.data.data || [])
    } catch (err) {
      toast.error('Failed to load reviews')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await adminApi.updateReview(id, { isApproved: true })
      toast.success('Review approved')
      loadReviews()
    } catch (err) {
      toast.error('Failed to approve review')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminApi.updateReview(id, { isApproved: false })
      toast.success('Review rejected')
      loadReviews()
    } catch (err) {
      toast.error('Failed to reject review')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteReview(id)
      toast.success('Review deleted')
      loadReviews()
    } catch (err) {
      toast.error('Failed to delete review')
    }
  }

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending') return !r.isApproved
    if (filter === 'approved') return r.isApproved
    return true
  })

  const pendingCount = reviews.filter(r => !r.isApproved).length

  const Wrapper = embedded ? 'div' : 'div'

  return (
    <Wrapper className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reviews Management</h3>
          <p className="text-sm text-slate-500">{reviews.length} total reviews, {pendingCount} pending approval</p>
        </div>
        <div className="flex gap-1.5">
          {(['all', 'pending', 'approved'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className={filter === f ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
            >
              {f === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {f === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-[10px] rounded-full">{pendingCount}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-500">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'p-4 rounded-xl border transition-colors',
                isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200',
                !review.isApproved && (isDark ? 'border-amber-800/30' : 'border-amber-200')
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                      {review.firstName?.[0]}{review.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">
                        {review.firstName} {review.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{review.email}</p>
                    </div>
                    <Badge className={review.isApproved
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    }>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex gap-0.5 my-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn('w-4 h-4', s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700')} />
                    ))}
                  </div>

                  {review.title && <p className="font-medium text-sm text-slate-800 dark:text-slate-200">{review.title}</p>}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{review.text}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy h:mm a') : ''}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  {!review.isApproved && (
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-8" onClick={() => handleApprove(review.id)}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </Button>
                  )}
                  {review.isApproved && (
                    <Button size="sm" variant="outline" className="h-8" onClick={() => handleReject(review.id)}>
                      <XCircle className="w-3 h-3 mr-1" /> Unapprove
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className={cn(isDark ? 'bg-slate-900 border-slate-700' : 'bg-white')}>
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isDark ? 'bg-red-500/10' : 'bg-red-50')}>
                            <TriangleAlert className="w-5 h-5 text-red-500" />
                          </div>
                          <AlertDialogTitle className={cn(isDark ? 'text-white' : 'text-slate-900')}>Delete Review?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          This will permanently delete the review by <strong>{review.firstName} {review.lastName}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className={cn(isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : '')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(review.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >Delete Permanently</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Wrapper>
  )
}

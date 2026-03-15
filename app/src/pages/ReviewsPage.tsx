import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { reviewsApi, userApi } from '@/lib/apiClient'
import {
  Star,
  Send,
  Loader2,
  MessageSquare,
  CheckCircle,
  Clock,
  Edit2,
  Quote
} from 'lucide-react'
import { format } from 'date-fns'

// ============================================
// STAR RATING COMPONENT
// ============================================
function StarRating({ rating, onRate, size = 'md', readonly = false }: {
  rating: number
  onRate?: (r: number) => void
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }
  const s = sizes[size]

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            className={`${s} transition-colors ${
              star <= (hovered || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ============================================
// REVIEW CARD
// ============================================
function ReviewCard({ review, index }: { review: any; index: number }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'} overflow-hidden`}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {review.profileImage ? (
              <img
                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}${review.profileImage}`}
                alt={`${review.firstName} ${review.lastName}`}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  const el = e.currentTarget
                  el.style.display = 'none'
                  const fallback = el.nextElementSibling as HTMLElement
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 items-center justify-center text-white font-bold text-sm flex-shrink-0 ${review.profileImage ? 'hidden' : 'flex'}`}>
              {review.firstName?.[0]}{review.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  {review.firstName} {review.lastName}
                </p>
                <span className="text-xs text-slate-400">
                  {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}
                </span>
              </div>
              <StarRating rating={review.rating} readonly size="sm" />
              {review.title && (
                <p className="font-medium text-slate-800 dark:text-slate-200 text-sm mt-2">
                  {review.title}
                </p>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                <Quote className="w-3 h-3 inline text-emerald-500 mr-1" />
                {review.text}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================
// SUBMIT REVIEW FORM
// ============================================
function SubmitReviewForm({ existingReview, onSubmitted }: { existingReview: any | null; onSubmitted: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [title, setTitle] = useState(existingReview?.title || '')
  const [text, setText] = useState(existingReview?.text || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating)
      setTitle(existingReview.title || '')
      setText(existingReview.text || '')
    }
  }, [existingReview])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!text.trim()) {
      toast.error('Please write a review')
      return
    }
    setIsSubmitting(true)
    try {
      await reviewsApi.submit({ rating, title: title.trim() || undefined, text: text.trim() })
      toast.success(existingReview ? 'Review updated! It will be visible after approval.' : 'Review submitted! It will be visible after admin approval.')
      onSubmitted()
    } catch (err) {
      toast.error('Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={`border-2 ${isDark ? 'bg-slate-800 border-emerald-800/50' : 'bg-white border-emerald-200'} overflow-hidden`}>
      <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-500">
            {existingReview ? <Edit2 className="w-4 h-4 text-white" /> : <Star className="w-4 h-4 text-white" />}
          </div>
          {existingReview ? 'Update Your Review' : 'Write a Review'}
        </CardTitle>
        <CardDescription>
          {existingReview
            ? 'Update your experience with JDExchange'
            : 'Share your experience with the JDExchange community'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {existingReview && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
            existingReview.isApproved
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
          }`}>
            {existingReview.isApproved ? (
              <><CheckCircle className="w-4 h-4" /> Your review is live and visible to others</>
            ) : (
              <><Clock className="w-4 h-4" /> Your review is pending admin approval</>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rating</Label>
            <StarRating rating={rating} onRate={setRating} size="lg" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Title (optional)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience in a few words"
              className="h-10"
              maxLength={100}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Your Review</Label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your experience trading on JDExchange..."
              rows={4}
              required
              maxLength={1000}
              className={`w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500'
                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            <p className="text-xs text-slate-400 text-right">{text.length}/1000</p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4" /> {existingReview ? 'Update Review' : 'Submit Review'}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ============================================
// REVIEWS PAGE
// ============================================
export default function ReviewsPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [reviews, setReviews] = useState<any[]>([])
  const [myReview, setMyReview] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMyReview, setIsLoadingMyReview] = useState(true)

  const loadReviews = async () => {
    try {
      const res = await reviewsApi.getApproved()
      setReviews(res.data.data || [])
    } catch (err) {
      // silent
    } finally {
      setIsLoading(false)
    }
  }

  const loadMyReview = async () => {
    try {
      const res = await userApi.getMyReview()
      setMyReview(res.data.data || null)
    } catch (err) {
      setMyReview(null)
    } finally {
      setIsLoadingMyReview(false)
    }
  }

  useEffect(() => {
    loadReviews()
    loadMyReview()
  }, [])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reviews</h1>
            <p className="text-slate-500 dark:text-slate-400">See what our community says about JDExchange</p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">{avgRating}</p>
                    <StarRating rating={Math.round(parseFloat(avgRating))} readonly size="sm" />
                    <p className="text-xs text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex-1 space-y-1.5 w-full max-w-xs">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviews.filter(r => r.rating === stars).length
                      const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-3">{stars}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: 0.2 }}
                              className="h-full bg-amber-400 rounded-full"
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No reviews yet</p>
                  <p className="text-slate-400 text-sm mt-1">Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((review, i) => (
                  <ReviewCard key={review.id} review={review} index={i} />
                ))
              )}
            </div>

            {/* Submit review form */}
            <div>
              {isLoadingMyReview ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                </div>
              ) : (
                <SubmitReviewForm
                  existingReview={myReview}
                  onSubmitted={() => {
                    loadMyReview()
                    loadReviews()
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '@/context/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { userApi } from '@/lib/apiClient'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Upload,
  Camera,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  Info,
  User,
  CreditCard,
  Sparkles
} from 'lucide-react'

// ============================================
// TYPES
// ============================================
interface KycStatus {
  kycStatus: 'none' | 'pending' | 'verified' | 'rejected'
  kycSubmittedAt?: string
  kycReviewedAt?: string
  kycRejectionReason?: string
}

// ============================================
// STATUS CARD COMPONENT
// ============================================
function KycStatusBanner({ status }: { status: KycStatus }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const configs: Record<string, { icon: typeof CheckCircle; color: string; bg: string; title: string; description: string }> = {
    none: {
      icon: Shield,
      color: 'text-slate-500',
      bg: isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200',
      title: 'Identity Not Verified',
      description: 'Complete KYC verification to unlock higher trading limits and all platform features.',
    },
    pending: {
      icon: Clock,
      color: 'text-amber-500',
      bg: isDark ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200',
      title: 'Verification Under Review',
      description: 'Your documents are being reviewed. This usually takes 1-24 hours. We\'ll notify you once complete.',
    },
    verified: {
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: isDark ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200',
      title: 'Identity Verified',
      description: 'Your account is fully verified. You have access to all platform features and higher trading limits.',
    },
    rejected: {
      icon: XCircle,
      color: 'text-red-500',
      bg: isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200',
      title: 'Verification Rejected',
      description: status.kycRejectionReason || 'Your submission was rejected. Please review the reason and resubmit.',
    },
  }

  const config = configs[status.kycStatus] || configs.none
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-5 rounded-2xl border ${config.bg}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          status.kycStatus === 'verified' ? 'bg-emerald-500' :
          status.kycStatus === 'pending' ? 'bg-amber-500' :
          status.kycStatus === 'rejected' ? 'bg-red-500' :
          'bg-slate-500'
        }`}>
          <StatusIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.title}</h3>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{config.description}</p>
          {status.kycSubmittedAt && (
            <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Submitted: {new Date(status.kycSubmittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {status.kycReviewedAt && (
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Reviewed: {new Date(status.kycReviewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// STEP INDICATOR
// ============================================
function StepIndicator({ currentStep }: { currentStep: number }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const steps = [
    { label: 'ID Document', icon: CreditCard },
    { label: 'Selfie Photo', icon: Camera },
    { label: 'Review & Submit', icon: CheckCircle },
  ]

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, i) => {
        const StepIcon = step.icon
        const isActive = i === currentStep
        const isCompleted = i < currentStep
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted ? '#10b981' : isActive ? '#10b981' : isDark ? '#1e293b' : '#f1f5f9',
                }}
                className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-colors ${
                  isCompleted || isActive
                    ? 'border-emerald-500'
                    : isDark ? 'border-slate-700' : 'border-slate-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <StepIcon className={`w-5 h-5 ${isActive ? 'text-white' : isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                )}
              </motion.div>
              <span className={`text-xs mt-2 font-medium text-center ${
                isActive ? 'text-emerald-500' :
                isCompleted ? (isDark ? 'text-emerald-400' : 'text-emerald-600') :
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 mt-[-1rem] rounded ${
                isCompleted ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-300'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// FILE UPLOAD DROP ZONE
// ============================================
function FileDropZone({
  label,
  description,
  accept,
  file,
  onFileSelect,
  icon: Icon,
  preview,
}: {
  label: string
  description: string
  accept: string
  file: File | null
  onFileSelect: (file: File) => void
  icon: typeof Upload
  preview?: string | null
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) onFileSelect(droppedFile)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) onFileSelect(selectedFile)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
        isDragging
          ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]'
          : file
            ? isDark ? 'border-emerald-700 bg-emerald-900/10' : 'border-emerald-300 bg-emerald-50'
            : isDark ? 'border-slate-700 bg-slate-800/50 hover:border-slate-600' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      {preview ? (
        <div className="p-4">
          <div className="relative rounded-xl overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
              <div className="text-center text-white">
                <Camera className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">Click to change</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 px-1">
            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className={`text-sm font-medium truncate ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              {file?.name}
            </span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              ({(file?.size ? file.size / 1024 : 0).toFixed(0)} KB)
            </span>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-slate-700' : 'bg-slate-200'
          }`}>
            <Icon className={`w-7 h-7 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>
          <p className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{label}</p>
          <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{description}</p>
          <p className="text-xs text-slate-500">
            Drag & drop or click to browse • JPG, PNG (max 5MB)
          </p>
        </div>
      )}
    </div>
  )
}

// ============================================
// REQUIREMENTS LIST
// ============================================
function RequirementsList() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const requirements = [
    { icon: CreditCard, text: 'Valid Ghana Card, Passport, or Driver\'s License' },
    { icon: Eye, text: 'Document must be clear and all text readable' },
    { icon: Camera, text: 'A clear selfie of your face (well-lit, no sunglasses)' },
    { icon: User, text: 'Selfie must match the photo on your ID document' },
  ]

  return (
    <Card className={`border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-emerald-500" />
          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Requirements</h4>
        </div>
        <ul className="space-y-3">
          {requirements.map((req, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-50'}`}>
                <req.icon className="w-4 h-4 text-emerald-500" />
              </div>
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{req.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN KYC PAGE
// ============================================
export default function KYCPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  const [kycStatus, setKycStatus] = useState<KycStatus>({ kycStatus: 'none' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  
  // Files
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [documentPreview, setDocumentPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  // Fetch KYC status
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setIsLoading(true)
      const res = await userApi.getKycStatus()
      setKycStatus(res.data.data || { kycStatus: 'none' })
    } catch {
      // If no KYC data, default to none
      setKycStatus({ kycStatus: 'none' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG and PNG files are accepted')
      return
    }
    setDocumentFile(file)
    setDocumentPreview(URL.createObjectURL(file))
  }

  const handleSelfieSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be smaller than 5MB')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      toast.error('Only JPG and PNG files are accepted')
      return
    }
    setSelfieFile(file)
    setSelfiePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!documentFile || !selfieFile) {
      toast.error('Please upload both your ID document and selfie')
      return
    }

    try {
      setIsSubmitting(true)
      const formData = new FormData()
      formData.append('document', documentFile)
      formData.append('selfie', selfieFile)

      await userApi.submitKyc(formData)
      toast.success('KYC documents submitted successfully!')
      await fetchStatus()
      setCurrentStep(0)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      const msg = axiosErr?.response?.data?.error || 'Failed to submit documents'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceedStep0 = !!documentFile
  const canProceedStep1 = !!selfieFile
  const canSubmit = !!documentFile && !!selfieFile

  const showForm = kycStatus.kycStatus === 'none' || kycStatus.kycStatus === 'rejected'

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Identity Verification
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                kycStatus.kycStatus === 'verified'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : kycStatus.kycStatus === 'pending'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}>
                {kycStatus.kycStatus === 'verified' ? 'Verified' :
                 kycStatus.kycStatus === 'pending' ? 'Pending' :
                 kycStatus.kycStatus === 'rejected' ? 'Rejected' : 'Not Started'}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Verify your identity to unlock higher trading limits and all features
            </p>
          </motion.div>

          {/* Loading */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-sm text-slate-500">Loading verification status...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <KycStatusBanner status={kycStatus} />

              {/* If verified — show benefits */}
              {kycStatus.kycStatus === 'verified' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-500" />
                        <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Verified Benefits</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { icon: ArrowRight, text: 'Higher daily trading limits' },
                          { icon: Shield, text: 'Enhanced account security' },
                          { icon: Clock, text: 'Priority order processing' },
                          { icon: CheckCircle, text: 'Access to all cryptocurrencies' },
                        ].map((b, i) => (
                          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-50'}`}>
                            <b.icon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{b.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <Link to="/exchange">
                          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                            Start Trading <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* If pending — show timeline */}
              {kycStatus.kycStatus === 'pending' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <CardContent className="p-6">
                      <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>What happens next?</h3>
                      <div className="space-y-4">
                        {[
                          { step: 1, text: 'Documents submitted', done: true },
                          { step: 2, text: 'Under manual review by our team', done: false, current: true },
                          { step: 3, text: 'Verification complete — you\'ll be notified', done: false },
                        ].map((s) => (
                          <div key={s.step} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              s.done ? 'bg-emerald-500 text-white' :
                              s.current ? 'bg-amber-500 text-white animate-pulse' :
                              isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'
                            }`}>
                              {s.done ? <CheckCircle className="w-4 h-4" /> : s.step}
                            </div>
                            <span className={`text-sm ${
                              s.done ? 'text-emerald-500 line-through' :
                              s.current ? (isDark ? 'text-white font-medium' : 'text-slate-900 font-medium') :
                              isDark ? 'text-slate-500' : 'text-slate-400'
                            }`}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* KYC FORM — shown for 'none' or 'rejected' */}
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Rejection warning */}
                  {kycStatus.kycStatus === 'rejected' && kycStatus.kycRejectionReason && (
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${isDark ? 'bg-red-900/10 border-red-800/50' : 'bg-red-50 border-red-200'}`}>
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-red-400' : 'text-red-700'}`}>Reason for rejection:</p>
                        <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{kycStatus.kycRejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Step Indicator */}
                  <StepIndicator currentStep={currentStep} />

                  {/* Requirements */}
                  <RequirementsList />

                  {/* Form Steps */}
                  <AnimatePresence mode="wait">
                    {/* Step 0 — ID Document */}
                    {currentStep === 0 && (
                      <motion.div
                        key="step-0"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <CreditCard className="w-5 h-5 text-emerald-500" />
                              Upload ID Document
                            </CardTitle>
                            <CardDescription>
                              Upload a clear photo of your Ghana Card, Passport, or Driver's License
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FileDropZone
                              label="Upload ID Document"
                              description="Front side of your government-issued ID"
                              accept="image/jpeg,image/png,image/jpg"
                              file={documentFile}
                              onFileSelect={handleDocumentSelect}
                              icon={FileText}
                              preview={documentPreview}
                            />

                            <div className="flex justify-end">
                              <Button
                                onClick={() => setCurrentStep(1)}
                                disabled={!canProceedStep0}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                              >
                                Continue <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Step 1 — Selfie */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Camera className="w-5 h-5 text-emerald-500" />
                              Upload Selfie Photo
                            </CardTitle>
                            <CardDescription>
                              Take a clear selfie in good lighting — no sunglasses, hats, or filters
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <FileDropZone
                              label="Upload Selfie"
                              description="A clear, front-facing photo of your face"
                              accept="image/jpeg,image/png,image/jpg"
                              file={selfieFile}
                              onFileSelect={handleSelfieSelect}
                              icon={Camera}
                              preview={selfiePreview}
                            />

                            <div className="flex justify-between">
                              <Button
                                variant="outline"
                                onClick={() => setCurrentStep(0)}
                                className="gap-2"
                              >
                                <ArrowLeft className="w-4 h-4" /> Back
                              </Button>
                              <Button
                                onClick={() => setCurrentStep(2)}
                                disabled={!canProceedStep1}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                              >
                                Continue <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}

                    {/* Step 2 — Review & Submit */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className={`border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Eye className="w-5 h-5 text-emerald-500" />
                              Review Your Submission
                            </CardTitle>
                            <CardDescription>
                              Please review your uploads before submitting
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Preview grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>ID Document</p>
                                {documentPreview ? (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img src={documentPreview} alt="ID Document" className="w-full h-40 object-cover" />
                                  </div>
                                ) : (
                                  <div className={`h-40 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <span className="text-sm text-slate-500">No file selected</span>
                                  </div>
                                )}
                                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> {documentFile?.name}
                                </p>
                              </div>
                              <div>
                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Selfie Photo</p>
                                {selfiePreview ? (
                                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                                    <img src={selfiePreview} alt="Selfie" className="w-full h-40 object-cover" />
                                  </div>
                                ) : (
                                  <div className={`h-40 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                    <span className="text-sm text-slate-500">No file selected</span>
                                  </div>
                                )}
                                <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> {selfieFile?.name}
                                </p>
                              </div>
                            </div>

                            {/* Disclaimer */}
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                              <p className="text-xs text-slate-500">
                                By submitting, you confirm that the uploaded documents are genuine and belong to you.
                                Your data is encrypted and handled in accordance with our privacy policy.
                                Verification typically takes 1-24 hours.
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between">
                              <Button
                                variant="outline"
                                onClick={() => setCurrentStep(1)}
                                className="gap-2"
                              >
                                <ArrowLeft className="w-4 h-4" /> Back
                              </Button>
                              <Button
                                onClick={handleSubmit}
                                disabled={!canSubmit || isSubmitting}
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[160px]"
                              >
                                {isSubmitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4" />
                                    Submit for Verification
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

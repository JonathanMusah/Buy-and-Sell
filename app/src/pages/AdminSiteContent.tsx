import { useEffect, useState, useCallback, useId } from 'react'
import { adminApi } from '@/lib/apiClient'
import { useTheme } from '@/context/ThemeContext'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Save, Loader2, Plus, Trash2, GripVertical,
  Type, FileText, HelpCircle, Rocket, LayoutDashboard,
  ChevronDown, RefreshCw, AlertCircle,
  Sparkles, Eye, TriangleAlert
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ============================================
// TYPES
// ============================================

interface ContentItem {
  section: string
  key: string
  value: string
  type: string
}

interface SectionConfig {
  id: string
  label: string
  icon: React.ElementType
  description: string
  fields: FieldConfig[]
}

interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'json-array'
  placeholder?: string
  description?: string
  jsonFields?: { key: string; label: string; type: 'text' | 'textarea' }[]
}

// ============================================
// DEFAULT CONTENT - matches LandingPage.tsx hardcoded values
// ============================================

const DEFAULT_CONTENT: Record<string, Record<string, string>> = {
  hero: {
    badge: "West Africa's #1 Crypto Exchange",
    rotating_words: JSON.stringify(['Buy Bitcoin', 'Sell Ethereum', 'Trade USDT', 'Exchange Crypto']),
    headline_suffix: 'With Ghana Cedis',
    subtitle: 'Buy, sell, and exchange Bitcoin, Ethereum, USDT and more instantly. Secure, fast, and built for West Africa.',
    subtitle_highlight: 'Secure, fast, and built for West Africa.',
    trust_badges: JSON.stringify(['0.5% Fee', 'Instant Delivery', '24/7 Support', 'Bank-Grade Security']),
  },
  features: {
    badge_text: 'Why Choose Us',
    heading: 'Everything You Need to Trade',
    subheading: 'The most trusted cryptocurrency exchange in West Africa',
    items: JSON.stringify([
      { title: 'Instant Exchange', description: 'Complete transactions in under 2 minutes with our lightning-fast automated system.' },
      { title: 'Bank-Grade Security', description: '256-bit encryption and cold storage protect your assets 24/7.' },
      { title: 'Best Rates', description: 'Competitive exchange rates with only 0.5% trading fee. Maximum value.' },
      { title: 'Mobile Money', description: 'Deposit and withdraw via MTN MoMo, Telecel Cash, and AirtelTigo.' },
      { title: '24/7 Support', description: 'Our local support team is always ready to help you anytime, anywhere.' },
      { title: 'Multi-Currency', description: 'Trade Bitcoin, Ethereum, USDT and 10+ cryptocurrencies in one place.' },
    ]),
  },
  how_it_works: {
    badge_text: 'Get Started',
    heading: 'How It Works',
    subheading: 'Start trading in 4 simple steps',
    steps: JSON.stringify([
      { step: '1', title: 'Create Account', description: 'Sign up in seconds with your email and phone number' },
      { step: '2', title: 'Add Funds', description: 'Deposit via Mobile Money or bank transfer instantly' },
      { step: '3', title: 'Start Trading', description: 'Buy, sell, or exchange crypto with best rates' },
      { step: '4', title: 'Withdraw', description: 'Cash out to your Mobile Money wallet anytime' },
    ]),
  },
  faq: {
    items: JSON.stringify([
      { q: 'How long do transactions take?', a: 'Most transactions are completed within 1-2 minutes. Once your payment is confirmed, your crypto or cash is delivered instantly to your wallet or Mobile Money account.' },
      { q: 'What payment methods are supported?', a: 'We support MTN Mobile Money, Telecel Cash, AirtelTigo Money, and direct bank transfers. You can also pay with cryptocurrency for exchanges.' },
      { q: 'Is my money safe on JDExchange?', a: 'Absolutely. We use 256-bit encryption, cold storage for crypto assets, and two-factor authentication. Your funds are protected by bank-grade security protocols.' },
      { q: 'What are the trading fees?', a: 'We charge a flat 0.5% trading fee on all transactions — one of the lowest in West Africa. No hidden charges, no withdrawal fees on Mobile Money.' },
      { q: 'Which cryptocurrencies can I trade?', a: 'You can trade Bitcoin (BTC), Ethereum (ETH), Tether (USDT), BNB, Solana (SOL), and 10+ other popular cryptocurrencies, all with Ghana Cedis.' },
      { q: 'Do I need to verify my identity?', a: "Basic trading requires email verification. For higher limits, you'll need to complete KYC verification with a valid Ghana Card or passport, which takes under 5 minutes." },
    ]),
  },
  cta: {
    badge_text: 'Join 2,000+ Ghanaian traders',
    heading_line1: 'Your Crypto Journey',
    heading_line2: 'Starts Here',
    subtitle: 'Trade Bitcoin, Ethereum & more with Ghana Cedis. Instant Mobile Money deposits, bank-grade security, and the best rates in West Africa.',
    trust_indicators: JSON.stringify([
      { text: '256-bit Encryption' },
      { text: 'Instant Settlements' },
      { text: 'Trusted Community' },
    ]),
    note: 'No hidden fees · Start with as little as GH₵ 50 · 24/7 support',
  },
  footer: {
    description: "Ghana's premier cryptocurrency exchange. Trade securely with Ghana Cedis.",
    copyright: '© 2026 JDExchange. All rights reserved.',
  },
}

// ============================================
// SECTION CONFIGURATIONS
// ============================================

const SECTIONS: SectionConfig[] = [
  {
    id: 'hero',
    label: 'Hero Section',
    icon: Sparkles,
    description: 'The main banner area visitors see first',
    fields: [
      { key: 'badge', label: 'Badge Text', type: 'text', placeholder: "West Africa's #1 Crypto Exchange" },
      { key: 'rotating_words', label: 'Rotating Words', type: 'json-array', description: 'Words that rotate in the hero headline', jsonFields: [{ key: 'value', label: 'Text', type: 'text' }] },
      { key: 'headline_suffix', label: 'Headline Suffix', type: 'text', placeholder: 'With Ghana Cedis', description: 'Text after the rotating words' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', placeholder: 'Buy, sell, and exchange...' },
      { key: 'subtitle_highlight', label: 'Highlighted Part of Subtitle', type: 'text', placeholder: 'Secure, fast, and built for West Africa.', description: 'This part appears in green/emerald color' },
      { key: 'trust_badges', label: 'Trust Badges', type: 'json-array', description: 'Small badges shown below the CTA buttons', jsonFields: [{ key: 'value', label: 'Badge Text', type: 'text' }] },
    ],
  },
  {
    id: 'features',
    label: 'Features Section',
    icon: LayoutDashboard,
    description: 'Feature cards showcasing platform strengths',
    fields: [
      { key: 'badge_text', label: 'Section Badge', type: 'text', placeholder: 'Why Choose Us' },
      { key: 'heading', label: 'Section Heading', type: 'text', placeholder: 'Everything You Need to Trade' },
      { key: 'subheading', label: 'Section Subheading', type: 'text', placeholder: 'The most trusted...' },
      { key: 'items', label: 'Feature Cards', type: 'json-array', description: 'Each feature card with title and description', jsonFields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }] },
    ],
  },
  {
    id: 'how_it_works',
    label: 'How It Works',
    icon: FileText,
    description: 'Step-by-step guide for new users',
    fields: [
      { key: 'badge_text', label: 'Section Badge', type: 'text', placeholder: 'Get Started' },
      { key: 'heading', label: 'Section Heading', type: 'text', placeholder: 'How It Works' },
      { key: 'subheading', label: 'Section Subheading', type: 'text', placeholder: 'Start trading in 4 simple steps' },
      { key: 'steps', label: 'Steps', type: 'json-array', description: 'Each step with number, title, and description', jsonFields: [{ key: 'step', label: 'Step #', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }] },
    ],
  },
  {
    id: 'faq',
    label: 'FAQ Section',
    icon: HelpCircle,
    description: 'Frequently asked questions and answers',
    fields: [
      { key: 'items', label: 'FAQ Items', type: 'json-array', description: 'Questions and answers', jsonFields: [{ key: 'q', label: 'Question', type: 'text' }, { key: 'a', label: 'Answer', type: 'textarea' }] },
    ],
  },
  {
    id: 'cta',
    label: 'Call to Action',
    icon: Rocket,
    description: 'Bottom CTA section that drives sign-ups',
    fields: [
      { key: 'badge_text', label: 'Badge Text', type: 'text', placeholder: 'Join 2,000+ Ghanaian traders' },
      { key: 'heading_line1', label: 'Heading Line 1', type: 'text', placeholder: 'Your Crypto Journey' },
      { key: 'heading_line2', label: 'Heading Line 2 (gradient)', type: 'text', placeholder: 'Starts Here' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { key: 'trust_indicators', label: 'Trust Indicators', type: 'json-array', description: 'Icons with labels shown above CTA buttons', jsonFields: [{ key: 'text', label: 'Text', type: 'text' }] },
      { key: 'note', label: 'Bottom Note', type: 'text', placeholder: 'No hidden fees · Start with...' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: Type,
    description: 'Footer description and copyright text',
    fields: [
      { key: 'description', label: 'Site Description', type: 'textarea', placeholder: "Ghana's premier cryptocurrency exchange..." },
      { key: 'copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2026 JDExchange. All rights reserved.' },
    ],
  },
]

// ============================================
// INPUT COMPONENTS
// ============================================

function TextInput({ value, onChange, placeholder, label, description, isDark }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
  description?: string
  isDark: boolean
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={cn('block text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{label}</label>
      {description && <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{description}</p>}
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 min-h-[44px]',
          isDark
            ? 'bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600'
            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300'
        )}
      />
    </div>
  )
}

function TextAreaInput({ value, onChange, placeholder, label, description, isDark, rows = 3 }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
  description?: string
  isDark: boolean
  rows?: number
}) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={cn('block text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{label}</label>
      {description && <p className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{description}</p>}
      <textarea
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y min-h-[44px]',
          isDark
            ? 'bg-slate-800/60 border-slate-700 text-white placeholder:text-slate-500 hover:border-slate-600'
            : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 hover:border-slate-300'
        )}
      />
    </div>
  )
}

// ============================================
// JSON ARRAY EDITOR — for lists (FAQ, features, etc.)
// ============================================

function JsonArrayEditor({ value, onChange, label, description, jsonFields, isDark }: {
  value: string
  onChange: (v: string) => void
  label: string
  description?: string
  jsonFields: { key: string; label: string; type: 'text' | 'textarea' }[]
  isDark: boolean
}) {
  let items: Record<string, string>[] = []
  try {
    const parsed = JSON.parse(value)
    // Handle simple string arrays (like rotating_words, trust_badges)
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      items = parsed.map((v: string) => ({ value: v }))
    } else {
      items = parsed
    }
  } catch {
    items = []
  }

  const isSimple = jsonFields.length === 1 && jsonFields[0].key === 'value'

  const updateItem = (index: number, key: string, val: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: val }
    if (isSimple) {
      onChange(JSON.stringify(updated.map(i => i.value)))
    } else {
      onChange(JSON.stringify(updated))
    }
  }

  const addItem = () => {
    const newItem: Record<string, string> = {}
    jsonFields.forEach(f => { newItem[f.key] = '' })
    const updated = [...items, newItem]
    if (isSimple) {
      onChange(JSON.stringify(updated.map(i => i.value)))
    } else {
      onChange(JSON.stringify(updated))
    }
  }

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index)
    if (isSimple) {
      onChange(JSON.stringify(updated.map(i => i.value)))
    } else {
      onChange(JSON.stringify(updated))
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className={cn('block text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>{label}</label>
          {description && <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>{description}</p>}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addItem}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'relative rounded-xl border p-4',
                isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-50 border-slate-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn('mt-2 flex-shrink-0 hidden sm:block', isDark ? 'text-slate-600' : 'text-slate-300')} aria-hidden="true">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-3">
                  {jsonFields.map(field => (
                    <div key={field.key}>
                      {isSimple ? (
                        <input
                          type="text"
                          value={item[field.key] || ''}
                          onChange={e => updateItem(index, field.key, e.target.value)}
                          placeholder={field.label}
                          className={cn(
                            'w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                            isDark
                              ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                          )}
                        />
                      ) : (
                        <div className="space-y-1">
                          <label className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <textarea
                              value={item[field.key] || ''}
                              onChange={e => updateItem(index, field.key, e.target.value)}
                              rows={2}
                              className={cn(
                                'w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-y',
                                isDark
                                  ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                              )}
                            />
                          ) : (
                            <input
                              type="text"
                              value={item[field.key] || ''}
                              onChange={e => updateItem(index, field.key, e.target.value)}
                              className={cn(
                                'w-full px-3 py-2 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50',
                                isDark
                                  ? 'bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500'
                                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                              )}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove item ${index + 1}`}
                  className="flex-shrink-0 mt-1 p-2 rounded-lg text-red-400 hover:text-red-500 hover:bg-red-500/10 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {/* Item number badge */}
              <div className={cn(
                'absolute -top-2.5 left-3 px-2 py-0.5 rounded-md text-[10px] font-bold',
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-500'
              )}>
                #{index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className={cn(
            'text-center py-8 rounded-xl border-2 border-dashed',
            isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'
          )}>
            <p className="text-sm">No items yet. Click "Add" to create one.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// SECTION EDITOR PANEL
// ============================================

function SectionPanel({ section, content, onChange, onSave, onReset, saving, isDark }: {
  section: SectionConfig
  content: Record<string, string>
  onChange: (key: string, value: string) => void
  onSave: () => void
  onReset: () => void
  saving: boolean
  isDark: boolean
}) {
  const [isOpen, setIsOpen] = useState(true)
  const Icon = section.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border overflow-hidden',
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      )}
    >
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className={cn(
          'w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-colors',
          isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
        )}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
        )}>
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="flex-1 text-left">
          <h3 className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{section.label}</h3>
          <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-500' : 'text-slate-400')}>{section.description}</p>
        </div>
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className={cn('w-5 h-5', isDark ? 'text-slate-400' : 'text-slate-500')} />
        </motion.div>
      </button>

      {/* Section Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={cn(
              'px-5 pb-5 space-y-5 border-t',
              isDark ? 'border-slate-800' : 'border-slate-100'
            )}>
              <div className="pt-4 space-y-5">
                {section.fields.map(field => {
                  const val = content[field.key] ?? DEFAULT_CONTENT[section.id]?.[field.key] ?? ''

                  if (field.type === 'json-array') {
                    return (
                      <JsonArrayEditor
                        key={field.key}
                        value={val}
                        onChange={v => onChange(field.key, v)}
                        label={field.label}
                        description={field.description}
                        jsonFields={field.jsonFields!}
                        isDark={isDark}
                      />
                    )
                  }

                  if (field.type === 'textarea') {
                    return (
                      <TextAreaInput
                        key={field.key}
                        value={val}
                        onChange={v => onChange(field.key, v)}
                        label={field.label}
                        placeholder={field.placeholder}
                        description={field.description}
                        isDark={isDark}
                      />
                    )
                  }

                  return (
                    <TextInput
                      key={field.key}
                      value={val}
                      onChange={v => onChange(field.key, v)}
                      label={field.label}
                      placeholder={field.placeholder}
                      description={field.description}
                      isDark={isDark}
                    />
                  )
                })}
              </div>

              {/* Save button */}
              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn('text-xs w-full sm:w-auto', isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : '')}
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                      Reset to Defaults
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={cn(isDark ? 'bg-slate-900 border-slate-700' : 'bg-white')}>
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 mb-1">
                        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isDark ? 'bg-amber-500/10' : 'bg-amber-50')}>
                          <TriangleAlert className="w-5 h-5 text-amber-500" />
                        </div>
                        <AlertDialogTitle className={cn(isDark ? 'text-white' : 'text-slate-900')}>Reset {section.label}?</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                        This will restore all fields in <strong>{section.label}</strong> to their default values. Your changes won&apos;t be lost on the live site until you click <strong>Save</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={cn(isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : '')}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={onReset}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >Reset to Defaults</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  onClick={onSave}
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 w-full sm:w-auto"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save {section.label}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function AdminSiteContent() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [content, setContent] = useState<Record<string, Record<string, string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({})

  // Fetch existing content from backend
  const fetchContent = useCallback(async () => {
    try {
      setLoading(true)
      const res = await adminApi.getSiteContent()
      const data = res.data?.data || []

      // Group items by section
      const grouped: Record<string, Record<string, string>> = {}
      data.forEach((item: ContentItem) => {
        if (!grouped[item.section]) grouped[item.section] = {}
        grouped[item.section][item.key] = item.value
      })

      // Merge with defaults so all fields are populated
      const merged: Record<string, Record<string, string>> = {}
      SECTIONS.forEach(sec => {
        merged[sec.id] = { ...DEFAULT_CONTENT[sec.id], ...grouped[sec.id] }
      })

      setContent(merged)
    } catch (err) {
      console.error('Failed to fetch site content:', err)
      // Use defaults
      const defaults: Record<string, Record<string, string>> = {}
      SECTIONS.forEach(sec => {
        defaults[sec.id] = { ...DEFAULT_CONTENT[sec.id] }
      })
      setContent(defaults)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  // Update a field value
  const handleChange = useCallback((section: string, key: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }))
    setHasChanges(prev => ({ ...prev, [section]: true }))
  }, [])

  // Save a section
  const handleSave = useCallback(async (sectionId: string) => {
    const sectionContent = content[sectionId]
    if (!sectionContent) return

    setSaving(sectionId)
    try {
      const items = Object.entries(sectionContent).map(([key, value]) => {
        // Detect if value is JSON
        let type = 'text'
        try {
          JSON.parse(value)
          type = 'json'
        } catch {
          type = 'text'
        }
        return { section: sectionId, key, value, type }
      })

      await adminApi.updateSiteContent(items)
      toast.success(`${SECTIONS.find(s => s.id === sectionId)?.label || 'Section'} saved successfully!`)
      setHasChanges(prev => ({ ...prev, [sectionId]: false }))
    } catch (err) {
      console.error('Failed to save:', err)
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(null)
    }
  }, [content])

  // Save all sections
  const handleSaveAll = useCallback(async () => {
    setSaving('all')
    try {
      const allItems: { section: string; key: string; value: string; type: string }[] = []

      Object.entries(content).forEach(([section, fields]) => {
        Object.entries(fields).forEach(([key, value]) => {
          let type = 'text'
          try {
            JSON.parse(value)
            type = 'json'
          } catch {
            type = 'text'
          }
          allItems.push({ section, key, value, type })
        })
      })

      await adminApi.updateSiteContent(allItems)
      toast.success('All content saved successfully!')
      setHasChanges({})
    } catch (err) {
      console.error('Failed to save all:', err)
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(null)
    }
  }, [content])

  // Reset to defaults (called from AlertDialog, so no need for confirm())
  const handleReset = useCallback((sectionId: string) => {
    setContent(prev => ({
      ...prev,
      [sectionId]: { ...DEFAULT_CONTENT[sectionId] },
    }))
    setHasChanges(prev => ({ ...prev, [sectionId]: true }))
    toast.info('Reset to defaults. Click Save to apply.')
  }, [])

  const anyChanges = Object.values(hasChanges).some(Boolean)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>Loading site content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
            Site Content
          </h1>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Edit your homepage text content. Changes appear on the public site after saving.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchContent}
            className={cn(
              'text-sm',
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''
            )}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={saving === 'all' || !anyChanges}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
          >
            {saving === 'all' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Unsaved changes warning */}
      {anyChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center gap-3 p-4 rounded-xl border',
            isDark
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          )}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">You have unsaved changes. Remember to save before leaving this page.</p>
        </motion.div>
      )}

      {/* Info card */}
      <div className={cn(
        'flex items-start gap-3 p-4 rounded-xl border',
        isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'
      )}>
        <Eye className={cn('w-5 h-5 flex-shrink-0 mt-0.5', isDark ? 'text-blue-400' : 'text-blue-500')} />
        <div className={cn('text-sm', isDark ? 'text-blue-300/80' : 'text-blue-600')}>
          <p className="font-medium mb-1">How it works</p>
          <p>Edit the text fields below to change what appears on your homepage. For sections with lists (features, FAQ, etc.), you can add, remove, or reorder items. Click <strong>Save</strong> on each section, or use <strong>Save All Changes</strong> at the top.</p>
        </div>
      </div>

      {/* Section Editors */}
      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <SectionPanel
            key={section.id}
            section={section}
            content={content[section.id] || {}}
            onChange={(key, value) => handleChange(section.id, key, value)}
            onSave={() => handleSave(section.id)}
            onReset={() => handleReset(section.id)}
            saving={saving === section.id}
            isDark={isDark}
          />
        ))}
      </div>

      {/* Bottom save bar */}
      {anyChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'sticky bottom-4 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-xl',
            isDark
              ? 'bg-slate-900/90 border-slate-700'
              : 'bg-white/90 border-slate-200'
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
              Unsaved changes
            </span>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={saving === 'all'}
            className="bg-emerald-500 hover:bg-emerald-600 text-white w-full sm:w-auto"
          >
            {saving === 'all' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </motion.div>
      )}
    </div>
  )
}

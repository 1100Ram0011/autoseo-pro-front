// ─── Integration page status map (lowercase keys: active, connected, pending, etc.) ──
export const STATUS_MAP = {
  active: { bg: 'bg-emerald-100 dark:bg-[#14532d]', text: 'text-emerald-700 dark:text-[#4ade80]', label: 'Active' },
  connected: { bg: 'bg-emerald-100 dark:bg-[#14532d]', text: 'text-emerald-700 dark:text-[#4ade80]', label: 'Active' },
  pending: { bg: 'bg-amber-100 dark:bg-[#713f12]', text: 'text-amber-800 dark:text-[#fbbf24]', label: 'Pending' },
  disconnected: {
    bg: 'bg-red-100 dark:bg-[#4b1d1d]',
    text: 'text-red-700 dark:text-[#f87171]',
    label: 'Disconnected',
  },
  banned: { bg: 'bg-red-100 dark:bg-[#4b1d1d]', text: 'text-red-700 dark:text-[#f87171]', label: 'Banned' },
  paused: { bg: 'bg-indigo-100 dark:bg-[#312e81]', text: 'text-indigo-700 dark:text-[#a5b4fc]', label: 'Paused' },
}

// ─── Campaign page status config (UPPERCASE keys: DRAFT, RUNNING, etc.) ──
export const STATUS_CFG = {
  DRAFT: { stripe: '#64748b', glow: 'rgba(100,116,139,0.18)', textCls: 'text-slate-600 dark:text-slate-400', bgCls: 'bg-slate-100 dark:bg-slate-500/10', ringCls: 'ring-slate-300 dark:ring-slate-500/20', label: 'Draft' },
  SCHEDULED: { stripe: '#3b82f6', glow: 'rgba(59,130,246,0.18)', textCls: 'text-blue-600 dark:text-blue-400', bgCls: 'bg-blue-50 dark:bg-blue-500/10', ringCls: 'ring-blue-300 dark:ring-blue-500/20', label: 'Scheduled' },
  RUNNING: { stripe: '#10b981', glow: 'rgba(16,185,129,0.20)', textCls: 'text-emerald-600 dark:text-emerald-400', bgCls: 'bg-emerald-50 dark:bg-emerald-500/10', ringCls: 'ring-emerald-300 dark:ring-emerald-500/25', label: 'Running', pulse: true },
  PAUSED: { stripe: '#eab308', glow: 'rgba(234,179,8,0.18)', textCls: 'text-amber-600 dark:text-yellow-400', bgCls: 'bg-amber-50 dark:bg-yellow-500/10', ringCls: 'ring-amber-300 dark:ring-yellow-500/20', label: 'Paused' },
  COMPLETED: { stripe: '#22c55e', glow: 'rgba(34,197,94,0.18)', textCls: 'text-emerald-700 dark:text-emerald-400', bgCls: 'bg-emerald-100/70 dark:bg-emerald-500/10', ringCls: 'ring-emerald-300 dark:ring-emerald-500/20', label: 'Completed' },
  FAILED: { stripe: '#ef4444', glow: 'rgba(239,68,68,0.18)', textCls: 'text-red-600 dark:text-red-400', bgCls: 'bg-red-50 dark:bg-red-500/10', ringCls: 'ring-red-300 dark:ring-red-500/20', label: 'Failed' },
  CANCELLED: { stripe: '#475569', glow: 'rgba(71,85,105,0.12)', textCls: 'text-slate-500 dark:text-slate-400', bgCls: 'bg-slate-100 dark:bg-slate-700/10', ringCls: 'ring-slate-300 dark:ring-slate-700/20', label: 'Cancelled' },
}

// ─── Quality rating colors ──
export const QUALITY_COLORS = {
  GREEN: 'bg-emerald-500',
  YELLOW: 'bg-amber-400',
  RED: 'bg-red-500',
  UNKNOWN: 'bg-slate-400',
}

// ─── Shared form input class string ──
export const inputCls =
  'w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors duration-200'

// ─── Business Profile Verticals ──
export const BUSINESS_VERTICALS = [
  { value: 'ALCOHOL', label: 'Alcohol', desc: 'Winery, brewery, or liquor store.', policyWarning: 'Messaging about alcohol is restricted or prohibited in some regions (e.g. India, Middle East). Review Meta Commerce Policies.' },
  { value: 'APPAREL', label: 'Apparel', desc: 'Clothing, shoes, and accessories.' },
  { value: 'AUTO', label: 'Automotive', desc: 'Car sales, rentals, and repairs.' },
  { value: 'BEAUTY', label: 'Beauty', desc: 'Cosmetics, salons, and personal care.' },
  { value: 'EDU', label: 'Education', desc: 'Schools, colleges, and tutoring.' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', desc: 'Movies, music, and events.' },
  { value: 'EVENT_PLANNING', label: 'Event Planning', desc: 'Weddings, conferences, and parties.' },
  { value: 'FINANCE', label: 'Finance', desc: 'Banks, insurance, and investments.', policyWarning: 'Financial institutions may require additional review by Meta for API access.' },
  { value: 'FOOD_BEV', label: 'Food & Beverage', desc: 'Cafes, bakeries, and food products.' },
  { value: 'GROCERY', label: 'Grocery', desc: 'Supermarkets and convenience stores.' },
  { value: 'HOTEL', label: 'Hotel & Lodging', desc: 'Hotels, motels, and resorts.' },
  { value: 'MEDICAL_HEALTH', label: 'Medical & Health', desc: 'Clinics, pharmacies, and wellness.', policyWarning: 'Pharmacies and supplement sales are heavily restricted on WhatsApp. Check Commerce Policies.' },
  { value: 'NONPROFIT', label: 'Non-Profit', desc: 'Charities and NGOs.' },
  { value: 'PROF_SERVICES', label: 'Professional Services', desc: 'Consulting, legal, and B2B.' },
  { value: 'RETAIL', label: 'Retail', desc: 'General retail and shopping.' },
  { value: 'TRAVEL', label: 'Travel', desc: 'Airlines, agencies, and tour operators.' },
  { value: 'RESTAURANT', label: 'Restaurant', desc: 'Dine-in, delivery, and catering.' },
  { value: 'NOT_A_BIZ', label: 'Not a Business', desc: 'Personal or community project.' },
  { value: 'OTHER', label: 'Other', desc: 'Any other industry.' },
]


export const VALID_VERTICALS = BUSINESS_VERTICALS.map(v => v.value);


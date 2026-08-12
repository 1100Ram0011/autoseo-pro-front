// ─── Template Categories ──────────────────────────────────────────────────────
// Must match schema enum: "MARKETING" | "UTILITY" | "AUTHENTICATION"
export const CATEGORIES = {
  UTILITY: 'UTILITY',
  MARKETING: 'MARKETING',
  AUTHENTICATION: 'AUTHENTICATION',
}

// ─── Marketing Sub-types ──────────────────────────────────────────────────────
export const MARKETING_TYPES = {
  CUSTOM: 'CUSTOM',
  PRODUCT: 'PRODUCT',
  CAROUSEL: 'CAROUSEL',
  LIMITED_TIME_OFFER: 'LIMITED_TIME_OFFER',
  CALL_REQUEST_PERMISSION: 'CALL_REQUEST_PERMISSION',
}

// ─── Utility Sub-types ────────────────────────────────────────────────────────
export const UTILITY_TYPES = {
  CUSTOM: 'CUSTOM',
  CALL_REQUEST_PERMISSION: 'CALL_REQUEST_PERMISSION',
}

// ─── Product Format ───────────────────────────────────────────────────────────
export const PRODUCT_FORMATS = {
  CATALOGUE: 'CATALOGUE',
  SINGLE_PRODUCT: 'SINGLE_PRODUCT',
  MULTI_PRODUCT: 'MULTI_PRODUCT',
}

// ─── OTP Delivery Types ───────────────────────────────────────────────────────
export const OTP_DELIVERY_TYPES = {
  COPY_CODE: 'COPY_CODE',
  ZERO_TAP: 'ZERO_TAP',
  ONE_TAP: 'ONE_TAP',
}

// ─── Header Format Options ────────────────────────────────────────────────────
// Must match schema enum: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "NONE"
// NOTE: "LOCATION" removed — not supported by Meta template schema
export const HEADER_OPTIONS = ['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT']

// ─── Carousel Header Types ────────────────────────────────────────────────────
export const CAROUSEL_HEADER_TYPES = ['IMAGE', 'VIDEO']

// ─── Button Types ─────────────────────────────────────────────────────────────
// Must match schema enum
export const BUTTON_TYPES = {
  NONE: 'NONE',
  QUICK_REPLY: 'QUICK_REPLY',
  URL: 'URL',
  PHONE_NUMBER: 'PHONE_NUMBER',
  COPY_CODE: 'COPY_CODE',
  OTP: 'OTP',
  FLOW: 'FLOW',
  CATALOG: 'CATALOG',
  MPM: 'MPM',
  VOICE_CALL: 'VOICE_CALL',
}

// ─── Official Meta WhatsApp Supported Languages (BCP-47) ─────────────────────
export const LANGUAGES = [
  { code: 'af', label: 'Afrikaans' },
  { code: 'sq', label: 'Albanian' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ar_EG', label: 'Arabic (EGY)' },
  { code: 'ar_AE', label: 'Arabic (UAE)' },
  { code: 'ar_LB', label: 'Arabic (LBN)' },
  { code: 'ar_MA', label: 'Arabic (MAR)' },
  { code: 'ar_QA', label: 'Arabic (QAT)' },
  { code: 'az', label: 'Azerbaijani' },
  { code: 'be_BY', label: 'Belarusian' },
  { code: 'bn', label: 'Bengali' },
  { code: 'bn_IN', label: 'Bengali (IND)' },
  { code: 'bg', label: 'Bulgarian' },
  { code: 'ca', label: 'Catalan' },
  { code: 'zh_CN', label: 'Chinese (CHN)' },
  { code: 'zh_HK', label: 'Chinese (HKG)' },
  { code: 'zh_TW', label: 'Chinese (TAI)' },
  { code: 'hr', label: 'Croatian' },
  { code: 'cs', label: 'Czech' },
  { code: 'da', label: 'Danish' },
  { code: 'prs_AF', label: 'Dari' },
  { code: 'nl', label: 'Dutch' },
  { code: 'nl_BE', label: 'Dutch (BEL)' },
  { code: 'en', label: 'English' },
  { code: 'en_GB', label: 'English (UK)' },
  { code: 'en_US', label: 'English (US)' },
  { code: 'en_AE', label: 'English (UAE)' },
  { code: 'en_AU', label: 'English (AUS)' },
  { code: 'en_CA', label: 'English (CAN)' },
  { code: 'en_GH', label: 'English (GHA)' },
  { code: 'en_IE', label: 'English (IRL)' },
  { code: 'en_IN', label: 'English (IND)' },
  { code: 'en_JM', label: 'English (JAM)' },
  { code: 'en_MY', label: 'English (MYS)' },
  { code: 'en_NZ', label: 'English (NZL)' },
  { code: 'en_QA', label: 'English (QAT)' },
  { code: 'en_SG', label: 'English (SGP)' },
  { code: 'en_UG', label: 'English (UGA)' },
  { code: 'en_ZA', label: 'English (ZAF)' },
  { code: 'et', label: 'Estonian' },
  { code: 'fil', label: 'Filipino' },
  { code: 'fi', label: 'Finnish' },
  { code: 'fr', label: 'French' },
  { code: 'fr_BE', label: 'French (BEL)' },
  { code: 'fr_CA', label: 'French (CAN)' },
  { code: 'fr_CH', label: 'French (CHE)' },
  { code: 'fr_CI', label: 'French (CIV)' },
  { code: 'fr_MA', label: 'French (MAR)' },
  { code: 'ka', label: 'Georgian' },
  { code: 'de', label: 'German' },
  { code: 'de_AT', label: 'German (AUT)' },
  { code: 'de_CH', label: 'German (CHE)' },
  { code: 'el', label: 'Greek' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'ha', label: 'Hausa' },
  { code: 'he', label: 'Hebrew' },
  { code: 'hi', label: 'Hindi' },
  { code: 'hu', label: 'Hungarian' },
  { code: 'id', label: 'Indonesian' },
  { code: 'ga', label: 'Irish' },
  { code: 'it', label: 'Italian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'kn', label: 'Kannada' },
  { code: 'kk', label: 'Kazakh' },
  { code: 'rw_RW', label: 'Kinyarwanda' },
  { code: 'ko', label: 'Korean' },
  { code: 'ky_KG', label: 'Kyrgyz (Kyrgyzstan)' },
  { code: 'lo', label: 'Lao' },
  { code: 'lv', label: 'Latvian' },
  { code: 'lt', label: 'Lithuanian' },
  { code: 'mk', label: 'Macedonian' },
  { code: 'ms', label: 'Malay' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'mr', label: 'Marathi' },
  { code: 'nb', label: 'Norwegian' },
  { code: 'ps_AF', label: 'Pashto' },
  { code: 'fa', label: 'Persian' },
  { code: 'pl', label: 'Polish' },
  { code: 'pt_BR', label: 'Portuguese (BR)' },
  { code: 'pt_PT', label: 'Portuguese (POR)' },
  { code: 'pa', label: 'Punjabi' },
  { code: 'ro', label: 'Romanian' },
  { code: 'ru', label: 'Russian' },
  { code: 'sr', label: 'Serbian' },
  { code: 'si_LK', label: 'Sinhala' },
  { code: 'sk', label: 'Slovak' },
  { code: 'sl', label: 'Slovenian' },
  { code: 'es', label: 'Spanish' },
  { code: 'es_AR', label: 'Spanish (ARG)' },
  { code: 'es_CL', label: 'Spanish (CHL)' },
  { code: 'es_CO', label: 'Spanish (COL)' },
  { code: 'es_CR', label: 'Spanish (CRI)' },
  { code: 'es_DO', label: 'Spanish (DOM)' },
  { code: 'es_EC', label: 'Spanish (ECU)' },
  { code: 'es_HN', label: 'Spanish (HND)' },
  { code: 'es_MX', label: 'Spanish (MEX)' },
  { code: 'es_PA', label: 'Spanish (PAN)' },
  { code: 'es_PE', label: 'Spanish (PER)' },
  { code: 'es_ES', label: 'Spanish (SPA)' },
  { code: 'es_UY', label: 'Spanish (URY)' },
  { code: 'sw', label: 'Swahili' },
  { code: 'sv', label: 'Swedish' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'th', label: 'Thai' },
  { code: 'tr', label: 'Turkish' },
  { code: 'uk', label: 'Ukrainian' },
  { code: 'ur', label: 'Urdu' },
  { code: 'uz', label: 'Uzbek' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'zu', label: 'Zulu' },
]

// ─── Default Form State ───────────────────────────────────────────────────────
// header is now an object matching the schema's headerSchema: { format, text }
// body, footer, buttons align directly to schema fields
export const createDefaultForm = () => ({
  // ── Identity ──
  name: '',
  category: CATEGORIES.MARKETING,
  language: 'en_US',

  // ── Auth-specific ──
  ttl: '',
  authConfig: {
    addSecurityRecommendation: false,
    codeExpirationMinutes: '',
  },

  // ── Marketing sub-type (UI only, not stored on schema) ──
  marketingType: MARKETING_TYPES.CUSTOM,
  productFormat: PRODUCT_FORMATS.CATALOGUE,
  offerMessage: '',

  // ── Utility sub-type (UI only, not stored on schema) ──
  utilityType: UTILITY_TYPES.CUSTOM,
  variableType: 'NUMBER',

  // ── Content ──
  // header matches headerSchema: { format: string, text?: string }
  header: {
    format: 'NONE',
    text: '',
  },
  body: '',
  footer: '',
  bodySamples: [], // User-provided sample values for variables

  // ── Buttons ──
  // Each button: { type, text, url?, phoneNumber?, etc } matching buttonSchema
  buttons: [],

  // ── Advanced Options ──
  messageSendTtlSeconds: '',
  allowCategoryChange: false,

  // ── Carousel (UI only) ──
  carouselHeaderType: 'IMAGE',
  carouselCards: [createCarouselCard(1)],

  // ── Upload state (UI only, not sent to schema) ──
  headerHandle: null, // returned by /upload-media, attached at send time
  headerMediaType: null,
})

// ─── Carousel Card Factory ────────────────────────────────────────────────────
export const createCarouselCard = (index) => ({
  id: Date.now() + index,
  body: '',
  button1Text: '',
  button2Text: '',
})

// ─── Button Factory ───────────────────────────────────────────────────────────
// Produces objects matching the schema's buttonSchema
export const createButton = (type = BUTTON_TYPES.QUICK_REPLY) => {
  const btn = {
    id: Date.now() + Math.random(), // UI key only, stripped before API call
    type,
    text: '',
  }

  if (type === BUTTON_TYPES.URL) {
    btn.url = ''
  } else if (type === BUTTON_TYPES.PHONE_NUMBER) {
    btn.phoneNumber = ''
  } else if (type === BUTTON_TYPES.COPY_CODE) {
    btn.example = [''] // Needs one example for the code
  } else if (type === BUTTON_TYPES.FLOW) {
    btn.flowId = ''
    btn.flowName = ''
    btn.flowAction = 'navigate' // default
  } else if (type === BUTTON_TYPES.OTP) {
    btn.otpType = 'COPY_CODE' // default subtype
  }

  return btn
}

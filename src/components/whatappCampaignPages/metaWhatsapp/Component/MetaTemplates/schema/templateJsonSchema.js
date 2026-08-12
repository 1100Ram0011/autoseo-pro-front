// ─── Template Categories (Meta API v25.0) ────────────────────────────────────
export const CATEGORIES = {
  MARKETING: 'MARKETING',
  UTILITY: 'UTILITY',
  AUTHENTICATION: 'AUTHENTICATION',
}

// ─── Subtypes by Category Hierarchy ──────────────────────────────────────────
export const SUBTYPES_BY_CATEGORY = {
  MARKETING: [
    { value: 'CUSTOM', label: 'Custom Marketing Message' },
    { value: 'CAROUSEL', label: 'Carousel Message (2 - 10 Cards)' },
    { value: 'LIMITED_TIME_OFFER', label: 'Limited Time Offer' },
    { value: 'PRODUCT', label: 'Product / Catalog Display' },
    { value: 'CALL_REQUEST_PERMISSION', label: 'Call Permission Request' },
  ],
  UTILITY: [
    { value: 'CUSTOM', label: 'Custom Utility Notification' },
    { value: 'CALL_REQUEST_PERMISSION', label: 'Call Permission Request' },
  ],
  AUTHENTICATION: [
    { value: 'OTP', label: 'One-Time Password (OTP)' },
  ],
}

// ─── Header Formats ───────────────────────────────────────────────────────────
export const HEADER_FORMATS = [
  { value: 'NONE', label: 'None' },
  { value: 'TEXT', label: 'Text Header' },
  { value: 'IMAGE', label: 'Image Header' },
  { value: 'VIDEO', label: 'Video Header' },
  { value: 'DOCUMENT', label: 'Document / PDF Header' },
  { value: 'LOCATION', label: 'Location Header' },
]

// ─── Button Types ─────────────────────────────────────────────────────────────
export const BUTTON_TYPES = [
  { value: 'QUICK_REPLY', label: 'Quick Reply' },
  { value: 'URL', label: 'Visit Website (URL)' },
  { value: 'PHONE_NUMBER', label: 'Call Phone Number' },
  { value: 'COPY_CODE', label: 'Copy Coupon Code' },
  { value: 'FLOW', label: 'Launch WhatsApp Flow' },
  { value: 'CATALOG', label: 'View Catalog' },
  { value: 'MPM', label: 'View Product List' },
]

// ─── OTP Subtypes for Authentication ─────────────────────────────────────────
export const OTP_TYPES = [
  { value: 'COPY_CODE', label: 'Copy Code Button' },
  { value: 'ONE_TAP', label: 'One-Tap Autofill' },
  { value: 'ZERO_TAP', label: 'Zero-Tap Auto Verify' },
]

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

// ─── Declarative Template JSON Schema ─────────────────────────────────────────
export const TEMPLATE_JSON_SCHEMA = {
  // ── Section 1: Template Classification ──
  identity: {
    title: 'Template Classification',
    description: 'Basic details required by Meta for classification and billing',
    fields: {
      name: {
        label: 'Template Name',
        type: 'text',
        placeholder: 'e.g. summer_sale_offer',
        maxLength: 512,
        required: true,
        pattern: /^[a-z0-9_]+$/,
        helpText: 'Lowercase letters, numbers, and underscores only. No spaces.',
      },
      category: {
        label: 'Category',
        type: 'select',
        required: true,
        options: [
          { value: 'MARKETING', label: 'Marketing' },
          { value: 'UTILITY', label: 'Utility' },
          { value: 'AUTHENTICATION', label: 'Authentication' },
        ],
      },
      marketingType: {
        label: 'Marketing Sub-Type',
        type: 'select',
        visibleIf: (form) => form.category === CATEGORIES.MARKETING,
        options: SUBTYPES_BY_CATEGORY.MARKETING,
      },
      utilityType: {
        label: 'Utility Sub-Type',
        type: 'select',
        visibleIf: (form) => form.category === CATEGORIES.UTILITY,
        options: SUBTYPES_BY_CATEGORY.UTILITY,
      },
      language: {
        label: 'Language',
        type: 'select',
        required: true,
        default: 'en_US',
        options: LANGUAGES.map((l) => ({ value: l.code, label: `${l.label} (${l.code})` })),
      },
    },
  },

  // ── Section 2: Header Component ──
  header: {
    title: 'Header Component',
    description: 'Optional header displayed at the very top of the message',
    visibleIf: (form) =>
      form.category !== CATEGORIES.AUTHENTICATION &&
      form.marketingType !== 'CAROUSEL' &&
      form.marketingType !== 'CALL_REQUEST_PERMISSION' &&
      form.utilityType !== 'CALL_REQUEST_PERMISSION',
    fields: {
      format: {
        label: 'Header Format',
        type: 'select',
        options: HEADER_FORMATS,
      },
      text: {
        label: 'Header Text',
        type: 'text',
        placeholder: 'Header text (supports {{1}} variable)',
        maxLength: 60,
        visibleIf: (form) => form.header?.format === 'TEXT',
      },
      mediaUrl: {
        label: 'Header Media Upload / Link',
        type: 'media',
        visibleIf: (form) => ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(form.header?.format),
      },
    },
  },

  // ── Section 3: Body Component ──
  body: {
    title: 'Body Component',
    description: 'The primary text message content',
    visibleIf: (form) => form.category !== CATEGORIES.AUTHENTICATION,
    fields: {
      text: {
        label: 'Message Body',
        type: 'textarea',
        placeholder: 'Type your message text here. Use {{1}}, {{2}} for dynamic variables.',
        maxLength: 1024,
        required: true,
      },
    },
  },

  // ── Section 4: Limited Time Offer Component ──
  limitedTimeOffer: {
    title: 'Limited Time Offer Configuration',
    description: 'Offer details displayed prominently in the message',
    visibleIf: (form) => form.category === CATEGORIES.MARKETING && form.marketingType === 'LIMITED_TIME_OFFER',
    fields: {
      offerMessage: {
        label: 'Offer Expiration Text',
        type: 'text',
        placeholder: 'e.g. Claim offer before it expires',
        required: true,
      },
    },
  },

  // ── Section 5: Footer Component ──
  footer: {
    title: 'Footer Component',
    description: 'Optional small text displayed at the bottom of the message',
    visibleIf: (form) =>
      form.category !== CATEGORIES.AUTHENTICATION &&
      form.marketingType !== 'CAROUSEL' &&
      form.marketingType !== 'LIMITED_TIME_OFFER',
    fields: {
      text: {
        label: 'Footer Text',
        type: 'text',
        placeholder: 'e.g. Reply STOP to unsubscribe',
        maxLength: 60,
      },
    },
  },

  // ── Section 6: Buttons Component ──
  buttons: {
    title: 'Interactive Buttons',
    description: 'Call-to-action or quick reply buttons (Max 10 buttons total)',
    visibleIf: (form) =>
      form.category !== CATEGORIES.AUTHENTICATION &&
      form.marketingType !== 'CAROUSEL' &&
      form.marketingType !== 'CALL_REQUEST_PERMISSION' &&
      form.utilityType !== 'CALL_REQUEST_PERMISSION',
    maxButtons: 10,
  },

  // ── Section 7: Carousel Cards Component ──
  carousel: {
    title: 'Carousel Cards',
    description: 'Interactive carousel cards (Min 2, Max 10 cards)',
    visibleIf: (form) => form.category === CATEGORIES.MARKETING && form.marketingType === 'CAROUSEL',
    minCards: 2,
    maxCards: 10,
  },

  // ── Section 8: Authentication Configuration ──
  authentication: {
    title: 'OTP Authentication Settings',
    description: 'Configuration for One-Time Password verification messages',
    visibleIf: (form) => form.category === CATEGORIES.AUTHENTICATION,
    fields: {
      otpType: {
        label: 'OTP Delivery Type',
        type: 'select',
        options: OTP_TYPES,
      },
      addSecurityRecommendation: {
        label: 'Add Security Recommendation',
        type: 'toggle',
        helpText: 'Adds "For your security, do not share this code" to the message',
      },
      codeExpirationMinutes: {
        label: 'Code Expiration (Minutes)',
        type: 'number',
        placeholder: '1 - 90 minutes',
        min: 1,
        max: 90,
      },
    },
  },

  // ── Section 9: Advanced Submission Options ──
  advanced: {
    title: 'Advanced Submission Options',
    description: 'Meta delivery time-to-live and category re-classification options',
    fields: {
      allowCategoryChange: {
        label: 'Allow Category Change by Meta',
        type: 'toggle',
        helpText: 'If enabled, Meta can auto-change category if they disagree with your selection',
      },
      messageSendTtlSeconds: {
        label: 'Message Send Time-To-Live (Seconds)',
        type: 'number',
        placeholder: 'e.g. 259200 (72 hours)',
      },
    },
  },
}

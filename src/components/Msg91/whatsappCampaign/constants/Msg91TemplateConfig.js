// ─── Template Categories ──────────────────────────────────────────────────────
export const CATEGORIES = {
    UTILITY: 'Utility',
    MARKETING: 'Marketing',
    AUTHENTICATION: 'Authentication',
}

// ─── Marketing Sub-types ──────────────────────────────────────────────────────
export const MARKETING_TYPES = {
    CUSTOM: 'Custom',
    PRODUCT: 'Product',
    CAROUSEL: 'Carousel',
}

// ─── Product Format ───────────────────────────────────────────────────────────
export const PRODUCT_FORMATS = {
    CATALOGUE: 'Catalogue',
    MULTI_PRODUCT: 'Multi-product',
}

// ─── Header Options ───────────────────────────────────────────────────────────
export const HEADER_OPTIONS = [
    'None', 
    'Text', 
    'Image', 
    'Video', 
    'Document',
    'Location'
]

// ─── Carousel Header Types ────────────────────────────────────────────────────
export const CAROUSEL_HEADER_TYPES = ['Image', 'Video']

// ─── Button Types ─────────────────────────────────────────────────────────────
export const BUTTON_TYPES = {
    NONE: 'None',
    CALL_PHONE: 'Call phone number',
    VISIT_WEBSITE: 'Visit website',
    QUICK_REPLY: 'Quick Reply',
}

// ─── Languages ───────────────────────────────────────────────────────────────
export const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi' },
    { code: 'mr', label: 'Marathi' },
    { code: 'ta', label: 'Tamil' },
    { code: 'te', label: 'Telugu' },
    { code: 'bn', label: 'Bengali' },
    { code: 'gu', label: 'Gujarati' },
    { code: 'kn', label: 'Kannada' },
    { code: 'ml', label: 'Malayalam' },
    { code: 'pa', label: 'Punjabi' },
]

// ─── Default Form State ───────────────────────────────────────────────────────
export const createDefaultForm = () => ({
    name: '',
    category: CATEGORIES.UTILITY,
    ttl: '',
    language: 'en',

    // Marketing specific
    marketingType: MARKETING_TYPES.CUSTOM,
    productFormat: PRODUCT_FORMATS.CATALOGUE,

    // Custom / Utility fields
    header: 'None',
    headerText: '',
    mediaUrl: '',
    body: '',
    bodySamples: [],
    footer: '',

    // Buttons (CTA + Quick Reply)
    buttons: [],
    enableClickCount: false,

    // Carousel specific
    carouselHeaderType: 'Image',
    carouselButton1Type: BUTTON_TYPES.NONE,
    carouselButton2Type: BUTTON_TYPES.NONE,
    carouselCards: [createCarouselCard(1)],

    // Authentication specific
    addSecurityRecommendation: false,
    codeExpirationMinutes: '',
    buttonText: 'Copy code',
})

export const createCarouselCard = (index) => ({
    id: Date.now() + index,
    body: '',
    bodySamples: [],
    button1Text: '',
    button1UrlType: 'Static',
    button1Url: '',
    button1Phone: '',
    button2Text: '',
    button2UrlType: 'Static',
    button2Url: '',
    button2Phone: '',
})

export const createButton = (type) => ({
    id: Date.now() + Math.random(),
    type,
    text: '',
    phone: '',
    url: '',
})
import { useState, useCallback, useMemo } from 'react'
import { CATEGORIES, SUBTYPES_BY_CATEGORY } from '../schema/templateJsonSchema.js'

// Helper: Extract unique {{1}}, {{2}}... variable placeholder numbers in order
export const getUniqueVariables = (text = '') => {
  if (!text) return []
  const matches = [...text.matchAll(/\{\{(\d+)\}\}/g)]
  const nums = matches.map((m) => parseInt(m[1], 10))
  return [...new Set(nums)].sort((a, b) => a - b)
}

export const createDefaultFormState = () => ({
  // Identity
  name: '',
  category: CATEGORIES.MARKETING,
  marketingType: 'CUSTOM',
  utilityType: 'CUSTOM',
  language: 'en_US',

  // Header Component
  header: {
    format: 'NONE',
    text: '',
    mediaUrl: '',
    headerHandle: null,
  },
  headerSamples: [],

  // Body Component
  body: '',
  bodySamples: [],

  // Footer Component
  footer: '',

  // Offer Message (for LIMITED_TIME_OFFER)
  offerMessage: '',

  // Buttons Component
  buttons: [],

  // Carousel Component (for CAROUSEL marketingType)
  carouselHeaderType: 'IMAGE',
  carouselCards: [
    { id: 1, body: '', headerHandle: null, mediaUrl: '', buttons: [] },
    { id: 2, body: '', headerHandle: null, mediaUrl: '', buttons: [] },
  ],

  // Authentication Configuration
  ttl: '',
  otpType: 'COPY_CODE',
  authConfig: {
    addSecurityRecommendation: false,
    codeExpirationMinutes: '',
  },

  // Advanced Meta Submission Options
  allowCategoryChange: false,
  messageSendTtlSeconds: '',
})

export const useTemplateForm = (initialState = null) => {
  const [form, setForm] = useState(() => initialState || createDefaultFormState())

  // Generic top-level field update
  const updateField = useCallback((key, value) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value }

      // Handle category switches -> update default subType if needed
      if (key === 'category') {
        if (value === CATEGORIES.MARKETING) {
          updated.marketingType = 'CUSTOM'
        } else if (value === CATEGORIES.UTILITY) {
          updated.utilityType = 'CUSTOM'
        } else if (value === CATEGORIES.AUTHENTICATION) {
          updated.header = { format: 'NONE', text: '' }
          updated.footer = ''
          updated.buttons = [{ type: 'OTP', otpType: 'COPY_CODE', text: 'Copy Code' }]
        }
      }

      return updated
    })
  }, [])

  // Header updates
  const updateHeader = useCallback((field, value) => {
    setForm((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }))
  }, [])

  // Header variable sample updates
  const updateHeaderSample = useCallback((index, value) => {
    setForm((prev) => {
      const samples = [...prev.headerSamples]
      samples[index] = value
      return { ...prev, headerSamples: samples }
    })
  }, [])

  // Body variable sample updates
  const updateBodySample = useCallback((index, value) => {
    setForm((prev) => {
      const samples = [...prev.bodySamples]
      samples[index] = value
      return { ...prev, bodySamples: samples }
    })
  }, [])

  // Button operations
  const addButton = useCallback((type = 'QUICK_REPLY') => {
    setForm((prev) => {
      if (prev.buttons.length >= 10) return prev
      const newBtn = {
        id: Date.now() + Math.random(),
        type,
        text: '',
        url: type === 'URL' ? '' : undefined,
        phoneNumber: type === 'PHONE_NUMBER' ? '' : undefined,
        example: type === 'COPY_CODE' || type === 'URL' ? [''] : undefined,
        flowId: type === 'FLOW' ? '' : undefined,
        flowAction: type === 'FLOW' ? 'navigate' : undefined,
      }
      return { ...prev, buttons: [...prev.buttons, newBtn] }
    })
  }, [])

  const updateButton = useCallback((index, field, value) => {
    setForm((prev) => {
      const buttons = [...prev.buttons]
      buttons[index] = { ...buttons[index], [field]: value }
      return { ...prev, buttons }
    })
  }, [])

  const removeButton = useCallback((index) => {
    setForm((prev) => {
      const buttons = prev.buttons.filter((_, i) => i !== index)
      return { ...prev, buttons }
    })
  }, [])

  // Carousel Operations
  const addCarouselCard = useCallback(() => {
    setForm((prev) => {
      if (prev.carouselCards.length >= 10) return prev
      const newCard = {
        id: Date.now() + Math.random(),
        body: '',
        headerHandle: null,
        mediaUrl: '',
        buttons: [],
      }
      return { ...prev, carouselCards: [...prev.carouselCards, newCard] }
    })
  }, [])

  const updateCarouselCard = useCallback((index, field, value) => {
    setForm((prev) => {
      const cards = [...prev.carouselCards]
      cards[index] = { ...cards[index], [field]: value }
      return { ...prev, carouselCards: cards }
    })
  }, [])

  const removeCarouselCard = useCallback((index) => {
    setForm((prev) => {
      if (prev.carouselCards.length <= 2) return prev // Min 2 cards
      const cards = prev.carouselCards.filter((_, i) => i !== index)
      return { ...prev, carouselCards: cards }
    })
  }, [])

  // Auto-detected variables metadata
  const bodyVariables = useMemo(() => getUniqueVariables(form.body), [form.body])
  const headerVariables = useMemo(() => getUniqueVariables(form.header?.text), [form.header?.text])

  // Convert form state to Meta API JSON payload
  const toApiPayload = useCallback(
    (numberId) => {
      const payload = {
        numberId,
        name: form.name.trim().toLowerCase().replace(/\s+/g, '_'),
        category: form.category,
        language: form.language || 'en_US',
        allowCategoryChange: form.allowCategoryChange || false,
      }

      if (form.messageSendTtlSeconds) {
        payload.messageSendTtlSeconds = Number(form.messageSendTtlSeconds)
      }

      // Non-Authentication Category Payload
      if (form.category !== CATEGORIES.AUTHENTICATION) {
        payload.body = form.body

        if (form.footer) {
          payload.footer = form.footer
        }

        // Body Samples
        if (bodyVariables.length > 0 && form.bodySamples?.length > 0) {
          payload.bodySamples = [form.bodySamples.slice(0, bodyVariables.length)]
        }

        // Header Component
        if (form.header?.format && form.header.format !== 'NONE') {
          payload.header = {
            format: form.header.format,
            text: form.header.format === 'TEXT' ? form.header.text || '' : undefined,
            headerHandle: form.header.headerHandle || undefined,
            mediaUrl: form.header.mediaUrl || undefined,
          }

          if (form.header.format === 'TEXT' && headerVariables.length > 0 && form.headerSamples?.length > 0) {
            payload.header.example = {
              header_text: form.headerSamples.slice(0, headerVariables.length),
            }
          }
        }

        // Buttons Component
        if (form.buttons?.length > 0) {
          payload.buttons = form.buttons.map(({ id, ...btn }) => {
            const cleanBtn = { ...btn }
            if (cleanBtn.type === 'PHONE_NUMBER' && cleanBtn.phoneNumber) {
              let p = cleanBtn.phoneNumber.replace(/\D/g, '')
              if (p.length === 10) p = '91' + p
              cleanBtn.phoneNumber = '+' + p
            }
            return cleanBtn
          })
        }

        // Subtype Specific Payload Options
        if (form.category === CATEGORIES.MARKETING) {
          payload.marketingType = form.marketingType || 'CUSTOM'
          if (form.marketingType === 'LIMITED_TIME_OFFER' && form.offerMessage) {
            payload.offerMessage = form.offerMessage
            delete payload.footer // Meta forbids footers for Limited Time Offer
          }
          if (form.marketingType === 'CAROUSEL' && form.carouselCards?.length > 0) {
            payload.carouselCards = form.carouselCards.map((card, idx) => ({
              id: idx + 1,
              body: card.body,
              headerHandle: card.headerHandle || undefined,
              buttons: card.buttons || [],
            }))
            payload.header = { format: form.carouselHeaderType || 'IMAGE' }
          }
        } else if (form.category === CATEGORIES.UTILITY) {
          payload.utilityType = form.utilityType || 'CUSTOM'
        }
      } else {
        // AUTHENTICATION Category Payload
        if (form.ttl) payload.ttl = Number(form.ttl)
        payload.authConfig = {
          addSecurityRecommendation: Boolean(form.authConfig?.addSecurityRecommendation),
          codeExpirationMinutes: form.authConfig?.codeExpirationMinutes
            ? Number(form.authConfig.codeExpirationMinutes)
            : null,
        }
        if (form.buttons?.length > 0) {
          payload.buttons = form.buttons.map(({ id, ...btn }) => btn)
        }
      }

      return payload
    },
    [form, bodyVariables, headerVariables]
  )

  return {
    form,
    setForm,
    updateField,
    updateHeader,
    updateHeaderSample,
    updateBodySample,
    addButton,
    updateButton,
    removeButton,
    addCarouselCard,
    updateCarouselCard,
    removeCarouselCard,
    bodyVariables,
    headerVariables,
    toApiPayload,
  }
}

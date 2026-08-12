/**
 * Payloadtransformer.js
 *
 * Converts the frontend form state into the MongoDB-ready payload
 * that the backend controller expects (POST /api/whatsapp or PATCH /api/whatsapp/:id).
 *
 * Form shape (new — aligned to WaFormsections + schema):
 *   form.name          : string
 *   form.category      : 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
 *   form.language      : string  (single language, schema field)
 *   form.languages     : string[] (array, first element used as fallback)
 *   form.ttl           : number | string
 *   form.header        : { type: 'NONE'|'TEXT'|'IMAGE'|'VIDEO'|'DOCUMENT'|'LOCATION', text?, mediaUrl? }
 *   form.body          : string
 *   form.footer        : string
 *   form.buttons       : [{ type: 'QUICK_REPLY'|'URL'|'PHONE'|'VISIT_WEBSITE'|'CALL_PHONE', text, url?, phone? }]
 *   form.authConfig    : { addSecurityRecommendation: bool, codeExpirationMinutes: number|null }
 *
 * Schema enum alignment:
 *   header.type ∈ { TEXT, IMAGE, VIDEO, DOCUMENT, LOCATION, NONE }
 *   button.type ∈ { QUICK_REPLY, URL, PHONE }
 *   category    ∈ { MARKETING, UTILITY, AUTHENTICATION }
 */

/* ─────────────────────────────────────────────────────────────────────────────
   BUTTON TYPE MAPPER
   UI may use VISIT_WEBSITE / CALL_PHONE (old constant names) or the schema
   values URL / PHONE directly — handle both.
   Output must be the schema enum: QUICK_REPLY | URL | PHONE
──────────────────────────────────────────────────────────────────────────────*/
const mapButtonType = (type = '') => {
    switch ((type || '').toUpperCase()) {
        case 'URL':
        case 'VISIT_WEBSITE':
        case 'VISIT WEBSITE':
            return 'URL'
        case 'PHONE':
        case 'CALL_PHONE':
        case 'CALL PHONE NUMBER':
            return 'PHONE'
        case 'QUICK_REPLY':
        case 'QUICK REPLY':
        default:
            return 'QUICK_REPLY'
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUILD BUTTONS ARRAY
   Filters out empty buttons, maps types, attaches url/phone where relevant.
──────────────────────────────────────────────────────────────────────────────*/
const buildButtons = (formButtons = []) => {
    return formButtons
        .filter(btn => btn?.text?.trim())
        .map(btn => {
            const type = mapButtonType(btn.type)
            const mapped = {
                type,
                text: btn.text.trim()
            }

            if (type === 'URL' && btn.url?.trim()) {
                mapped.url = btn.url.trim()
                if (btn.urlSamples) {
                    mapped.urlSamples = btn.urlSamples
                }
            } else if (type === 'PHONE') {
                if (btn.phone?.trim()) {
                    mapped.phone = btn.phone.trim()
                } else if (btn.url?.trim()) {
                    // Sometimes phone is passed in url field for carousel
                    mapped.phone = btn.url.trim()
                }
            } else if (type === 'QUICK_REPLY' && btn.payload?.trim()) {
                mapped.payload = btn.payload.trim()
            }

            return mapped
        })
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUILD HEADER OBJECT
   Input: form.header = { type, text?, mediaUrl? }
   Output: { type, text?, mediaUrl? }  (schema-ready)

   Also handles the legacy flat shape where header was a string + headerText:
     form.header = 'Text' | 'Media' | 'None' | 'Location' → normalised
──────────────────────────────────────────────────────────────────────────────*/
const buildHeader = (formHeader, legacyHeaderText = '', legacyMediaUrl = '') => {
    // ── New shape: form.header is an object ────────────────────────────────
    if (formHeader && typeof formHeader === 'object') {
        const type = (formHeader.type || 'NONE').toUpperCase()

        if (type === 'NONE') return { type: 'NONE' }

        if (type === 'TEXT') {
            return {
                type: 'TEXT',
                ...(formHeader.text?.trim() ? { text: formHeader.text.trim() } : {})
            }
        }

        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(type)) {
            return {
                type,
                mediaUrl: formHeader.mediaUrl || ''
            }
        }

        if (type === 'LOCATION') return { type: 'LOCATION' }

        return { type: 'NONE' }
    }

    // ── Legacy shape: form.header is a string ─────────────────────────────
    const legacyType = (formHeader || 'none').toLowerCase()

    if (legacyType === 'text') {
        return {
            type: 'TEXT',
            ...(legacyHeaderText?.trim() ? { text: legacyHeaderText.trim() } : {})
        }
    }

    if (legacyType === 'media' || legacyType === 'image') {
        return { type: 'IMAGE', mediaUrl: legacyMediaUrl || '' }
    }

    if (legacyType === 'video') return { type: 'VIDEO', mediaUrl: legacyMediaUrl || '' }
    if (legacyType === 'document') return { type: 'DOCUMENT', mediaUrl: legacyMediaUrl || '' }
    if (legacyType === 'location') return { type: 'LOCATION' }

    return { type: 'NONE' }
}

/* ─────────────────────────────────────────────────────────────────────────────
   BUILD AUTH CONFIG
   New shape: form.authConfig = { addSecurityRecommendation, codeExpirationMinutes }
   Legacy flat: form.addSecurityRecommendation, form.codeExpirationMinutes
──────────────────────────────────────────────────────────────────────────────*/
const buildAuthConfig = (form) => {
    // New shape
    if (form.authConfig && typeof form.authConfig === 'object') {
        return {
            addSecurityRecommendation: Boolean(form.authConfig.addSecurityRecommendation ?? true),
            codeExpirationMinutes: form.authConfig.codeExpirationMinutes
                ? Number(form.authConfig.codeExpirationMinutes)
                : null
        }
    }

    // Legacy flat fields
    return {
        addSecurityRecommendation: Boolean(form.addSecurityRecommendation ?? true),
        codeExpirationMinutes: form.codeExpirationMinutes
            ? Number(form.codeExpirationMinutes)
            : null
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN EXPORT: buildMongoPayload
   @param  {Object} form        — frontend form state
   @param  {string} wabaNumber  — integrated WhatsApp number
   @returns {Object}            — MongoDB-ready payload
   @throws  {Error}             — if required fields are missing
──────────────────────────────────────────────────────────────────────────────*/
export const buildMongoPayload = (form = {}, wabaNumber = '') => {
    if (!form || typeof form !== 'object') {
        throw new Error('Invalid form payload')
    }

    if (!form.name?.trim()) {
        throw new Error('Template name is required')
    }

    if (!wabaNumber?.trim()) {
        throw new Error('Integrated WhatsApp number (wabaNumber) is required')
    }

    /* ── Name: lowercase + underscores (MSG91-safe) ───────────────────────── */
    const normalizedName = form.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s_]/g, '')   // strip special chars
        .replace(/\s+/g, '_')            // spaces → underscores

    /* ── Category ─────────────────────────────────────────────────────────── */
    const category = (form.category || 'MARKETING').toUpperCase()
    const isAuth = category === 'AUTHENTICATION'

    /* ── Language — support both form.language (single) and form.languages[] */
    const language =
        (typeof form.language === 'string' && form.language.trim())
        || (Array.isArray(form.languages) && form.languages[0])
        || 'en'

    /* ── Header ───────────────────────────────────────────────────────────── */
    const header = buildHeader(
        form.header,
        form.headerText,   // legacy flat field
        form.mediaUrl      // legacy flat field
    )

    /* ── Buttons (auth templates have no buttons in the form) ─────────────── */
    const buttons = isAuth ? [] : buildButtons(form.buttons ?? [])

    /* ── Core payload ─────────────────────────────────────────────────────── */
    const payload = {
        name: normalizedName,
        category,
        language,
        wabaNumber: wabaNumber.trim(),
        header,
        body: form.body?.trim() ?? '',
        buttons,
        status: 'DRAFT'
    }

    /* ── Optional fields ──────────────────────────────────────────────────── */
    if (form.footer?.trim()) {
        payload.footer = form.footer.trim()
    }

    if (form.ttl) {
        payload.ttl = Number(form.ttl)
    }
    
    if (form.bodySamples && Array.isArray(form.bodySamples)) {
        payload.bodySamples = form.bodySamples
    }

    if (form.marketingType === 'Carousel' && form.carouselCards) {
        payload.marketingType = 'Carousel'
        payload.carouselCards = form.carouselCards.map(card => {
            const cardHeader = buildHeader(form.carouselHeaderType, null, card.mediaUrl)
            
            const cardButtons = []
            if (form.carouselButton1Type && form.carouselButton1Type !== 'None') {
                cardButtons.push({
                    type: form.carouselButton1Type.toUpperCase(),
                    text: card.button1Text,
                    url: card.button1Url,
                    phone: card.button1Phone,
                    urlSamples: card.button1UrlSamples,
                    payload: card.button1Payload
                })
            }
            if (form.carouselButton2Type && form.carouselButton2Type !== 'None') {
                cardButtons.push({
                    type: form.carouselButton2Type.toUpperCase(),
                    text: card.button2Text,
                    url: card.button2Url,
                    phone: card.button2Phone,
                    urlSamples: card.button2UrlSamples,
                    payload: card.button2Payload
                })
            }

            return {
                header: cardHeader,
                body: card.body?.trim() || '',
                buttons: buildButtons(cardButtons)
            }
        })
    }

    /* ── Auth config (AUTHENTICATION templates only) ──────────────────────── */
    if (isAuth) {
        payload.authConfig = buildAuthConfig(form)
    }

    return payload
}
import React, { useState, useCallback } from 'react'
import { Btn, FloatingInput, FloatingSelect } from '../ui/Msg91WaBaseUI'
import { useMsg91CreateTemplateMutation, useMsg91SubmitTemplateMutation, useMsg91CloneTemplateMutation, useMsg91UpdateTemplateMutation } from '@/redux/apis/Templateapi'
import { CloseIcon, LoaderIcon } from '../ui/Msg91WaIcons'
import WhatsAppPreview from './Msg91WhatsAppPreview'
import Msg91AddSampleModal from './Msg91AddSampleModal'
import { CustomForm, ProductForm, CarouselForm, AuthenticationForm } from '../ui/Msg91WaFormsections'
import { CATEGORIES, MARKETING_TYPES, LANGUAGES, createDefaultForm } from '../../constants/Msg91TemplateConfig'
import toast from 'react-hot-toast'

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = (form) => {
    const errors = {}
    if (!form.name.trim()) errors.name = 'Template name is required'
    
    if (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CAROUSEL) {
        if (!form.body?.trim()) errors.body = 'Carousel global body is required'
        
        const isMediaHeader = ['Image', 'Video'].includes(form.carouselHeaderType)
        const invalidCards = form.carouselCards.some(c => {
            if (isMediaHeader && !c.mediaUrl?.trim()) return true
            if (!c.body?.trim()) return true
            
            // Validate Button 1
            if (form.carouselButton1Type && form.carouselButton1Type !== 'None') {
                if (!c.button1Text?.trim()) return true
                if (form.carouselButton1Type === 'Visit website' && !c.button1Url?.trim()) return true
                if (form.carouselButton1Type === 'Call phone number' && !c.button1Phone?.trim()) return true
            }
            
            // Validate Button 2
            if (form.carouselButton2Type && form.carouselButton2Type !== 'None') {
                if (!c.button2Text?.trim()) return true
                if (form.carouselButton2Type === 'Visit website' && !c.button2Url?.trim()) return true
                if (form.carouselButton2Type === 'Call phone number' && !c.button2Phone?.trim()) return true
            }
            
            return false
        })
        
        if (invalidCards) {
            toast.error('Please fill all required fields (Media URL & Body) in all Carousel Cards')
            errors.carousel = 'Invalid cards'
        }
    } else {
        if (form.category !== CATEGORIES.AUTHENTICATION && !form.body?.trim()) errors.body = 'Message body is required'
        if (['Image', 'Video', 'Document'].includes(form.header) && !form.mediaUrl?.trim()) {
            errors.mediaUrl = 'Sample Media URL is required for media headers'
        }
    }
    
    return errors
}

// ─── Language Mapping ────────────────────────────────────────────────────────
// Use LANGUAGES from Msg91TemplateConfig.js, map to { value, label } for FloatingSelect
const languageOptions = LANGUAGES.map(l => ({ value: l.code, label: l.label }))

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getVarCount = (text = '') => text.match(/\{\{\d+\}\}/g)?.length || 0;

const hasVariables = (form) => {
    let total = getVarCount(form.body);
    if (form.headerType === 'Text') {
        total += getVarCount(form.headerText);
    }
    
    if (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CAROUSEL) {
        form.carouselCards?.forEach(card => {
            total += getVarCount(card.body);
            if (card.button1Url) total += getVarCount(card.button1Url);
            if (card.button2Url) total += getVarCount(card.button2Url);
        });
    } else {
        if (form.buttons) {
            form.buttons.forEach(btn => {
                if (btn.type === 'Visit website' || btn.type === 'URL') {
                    total += getVarCount(btn.url);
                }
            });
        }
    }
    return total > 0;
}

const hasMissingSamples = (form) => {
    const bodyCount = getVarCount(form.body);
    for (let i = 0; i < bodyCount; i++) {
        if (!form.bodySamples?.[i]) return true;
    }
    
    if (form.headerType === 'Text') {
        const headerCount = getVarCount(form.headerText);
        for (let i = 0; i < headerCount; i++) {
            if (!form.headerSamples?.[i]) return true;
        }
    }
    
    if (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CAROUSEL) {
        for (const card of (form.carouselCards || [])) {
            const cCount = getVarCount(card.body);
            for (let i = 0; i < cCount; i++) {
                if (!card.bodySamples?.[i]) return true;
            }
            
            const b1Count = getVarCount(card.button1Url);
            for (let i = 0; i < b1Count; i++) {
                if (!card.button1UrlSamples?.[i]) return true;
            }
            
            const b2Count = getVarCount(card.button2Url);
            for (let i = 0; i < b2Count; i++) {
                if (!card.button2UrlSamples?.[i]) return true;
            }
        }
    } else {
        if (form.buttons) {
            for (const btn of form.buttons) {
                if (btn.type === 'Visit website' || btn.type === 'URL') {
                    const bCount = getVarCount(btn.url);
                    for (let i = 0; i < bCount; i++) {
                        if (!btn.urlSamples?.[i]) return true;
                    }
                }
            }
        }
    }
    return false;
}

// ─── Header ───────────────────────────────────────────────────────────────────
const ModalHeader = ({ title, onClose }) => (
    <div className="px-5 py-3.5 border-b border-[var(--app-pages-border)] flex justify-between bg-[var(--app-pages-bg)]">
        <h2 className="text-[15px] font-semibold text-[var(--app-pages-text)]">
            {title}
        </h2>
        <button
            onClick={onClose}
            className="p-1 rounded text-[var(--app-pages-text)] hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-btn-text)]"
        >
            <CloseIcon size={16} />
        </button>
    </div>
)

// ─── Footer ───────────────────────────────────────────────────────────────────
const ModalFooter = ({ onCancel, onSave, saving, form, onAddSample }) => (
    <div className="px-5 py-3 border-t flex justify-end gap-2 border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] items-center">
        {hasVariables(form) && (
            <button 
                onClick={onAddSample}
                className="text-[13px] font-medium text-blue-600 hover:text-blue-700 mr-2"
            >
                Add Sample
            </button>
        )}
        <Btn variant="ghost" onClick={onCancel}>Cancel</Btn>
        <Btn
            variant="primary"
            onClick={onSave}
            disabled={saving}
            icon={saving ? <LoaderIcon size={14} color="#fff" /> : null}
        >
            {saving ? 'Saving...' : 'Save'}
        </Btn>
    </div>
)

// ─── Top Row ──────────────────────────────────────────────────────────────────
const TopRow = ({ form, setField, errors }) => (
    <div className="flex gap-2.5 px-5 py-3.5 border-b border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]">
        <FloatingInput
            label="Name *"
            value={form.name}
            onChange={e => setField('name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            error={errors.name}
            maxLength={512}
            style={{ flex: 1 }}
        />
        <FloatingSelect
            label="Category"
            value={form.category}
            onChange={e => setField('category', e.target.value)}
            options={Object.values(CATEGORIES)}
            style={{ width: 160 }}
        />
        <FloatingSelect
            label="Language"
            value={form.language}
            onChange={e => setField('language', e.target.value)}
            options={languageOptions}
            style={{ width: 160 }}
        />
    </div>
)

const initializeForm = (data) => {
    if (!data) return createDefaultForm()
    
    const form = { ...data }
    
    // Reverse map carousel buttons for the UI
    if (form.category === CATEGORIES.MARKETING && form.marketingType === MARKETING_TYPES.CAROUSEL) {
        if (form.carouselCards?.length > 0) {
            const firstCard = form.carouselCards[0]
            
            // Map Button 1 Global Type
            if (firstCard.buttons?.[0]) {
                const b1 = firstCard.buttons[0]
                if (b1.type === 'URL') form.carouselButton1Type = 'Visit website'
                else if (b1.type === 'PHONE' || b1.type === 'PHONE_NUMBER') form.carouselButton1Type = 'Call phone number'
                else form.carouselButton1Type = 'Quick Reply'
            } else {
                form.carouselButton1Type = 'None'
            }
            
            // Map Button 2 Global Type
            if (firstCard.buttons?.[1]) {
                const b2 = firstCard.buttons[1]
                if (b2.type === 'URL') form.carouselButton2Type = 'Visit website'
                else if (b2.type === 'PHONE' || b2.type === 'PHONE_NUMBER') form.carouselButton2Type = 'Call phone number'
                else form.carouselButton2Type = 'Quick Reply'
            } else {
                form.carouselButton2Type = 'None'
            }
            
            // Map Card specific button data
            form.carouselCards = form.carouselCards.map(card => {
                const c = { ...card }
                if (c.buttons?.[0]) {
                    c.button1Text = c.buttons[0].text
                    c.button1Url = c.buttons[0].url || ''
                    c.button1Phone = c.buttons[0].phone || ''
                    c.button1UrlType = /{{\d+}}/.test(c.button1Url) ? 'Dynamic' : 'Static'
                }
                if (c.buttons?.[1]) {
                    c.button2Text = c.buttons[1].text
                    c.button2Url = c.buttons[1].url || ''
                    c.button2Phone = c.buttons[1].phone || ''
                    c.button2UrlType = /{{\d+}}/.test(c.button2Url) ? 'Dynamic' : 'Static'
                }
                return c
            })
        }
    } else {
        // Reverse map standard buttons
        if (form.buttons && form.buttons.length > 0) {
            form.buttons = form.buttons.map(btn => {
                const b = { ...btn }
                if (b.type === 'URL') b.type = 'Visit website'
                else if (b.type === 'PHONE' || b.type === 'PHONE_NUMBER') b.type = 'Call phone number'
                else if (b.type === 'QUICK_REPLY') b.type = 'Quick Reply'
                return b
            })
        }
    }
    
    return form
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
const Msg91CreateTemplateModal = ({ open, onClose, initialData, integratedNumber }) => {
    const [form, setForm] = useState(() => initializeForm(initialData))
    const [errors, setErrors] = useState({})
    const [saving, setSaving] = useState(false)
    const [showSampleModal, setShowSampleModal] = useState(false)

    const [createTemplate] = useMsg91CreateTemplateMutation()
    const [submitTemplate] = useMsg91SubmitTemplateMutation()
    const [cloneTemplate] = useMsg91CloneTemplateMutation()
    const [updateTemplate] = useMsg91UpdateTemplateMutation()

    const setField = useCallback((key, value) => {
        setForm(f => ({ ...f, [key]: value }))
        if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
    }, [errors])

    const handleSave = () => {
        const errs = validate(form)
        if (Object.keys(errs).length) return setErrors(errs)

        if (hasVariables(form) && hasMissingSamples(form)) {
            setShowSampleModal(true)
            return
        }

        performSave()
    }

    const performSave = async () => {
        setSaving(true)
        setShowSampleModal(false)
        try {
            let payloadForm = { ...form }
            
            // Map standard buttons
            if (payloadForm.buttons && payloadForm.buttons.length > 0) {
                payloadForm.buttons = payloadForm.buttons.map(btn => {
                    const mappedBtn = { ...btn }
                    if (mappedBtn.type === 'Visit website') mappedBtn.type = 'URL'
                    else if (mappedBtn.type === 'Call phone number') mappedBtn.type = 'PHONE'
                    else if (mappedBtn.type === 'Quick Reply') mappedBtn.type = 'QUICK_REPLY'
                    return mappedBtn
                })
            }
            
            if (payloadForm.category === CATEGORIES.MARKETING && payloadForm.marketingType === MARKETING_TYPES.CAROUSEL) {
                payloadForm.carouselCards = payloadForm.carouselCards.map(card => {
                    const mappedCard = { ...card }
                    
                    if (payloadForm.carouselHeaderType && payloadForm.carouselHeaderType !== 'None') {
                        mappedCard.header = {
                            type: payloadForm.carouselHeaderType.toUpperCase(),
                            mediaUrl: card.mediaUrl || ''
                        }
                    } else {
                        mappedCard.header = { type: 'NONE' }
                    }

                    mappedCard.buttons = []
                    
                    if (payloadForm.carouselButton1Type && payloadForm.carouselButton1Type !== 'None' && card.button1Text) {
                        const btnType = payloadForm.carouselButton1Type;
                        const pushBtn = { text: card.button1Text };
                        
                        if (btnType === 'Visit website') {
                            pushBtn.type = 'URL';
                            pushBtn.url = card.button1Url;
                            pushBtn.urlSamples = card.button1UrlSamples;
                        } else if (btnType === 'Call phone number') {
                            pushBtn.type = 'PHONE';
                            pushBtn.phone = card.button1Phone;
                        } else {
                            pushBtn.type = 'QUICK_REPLY';
                        }
                        mappedCard.buttons.push(pushBtn);
                    }
                    
                    if (payloadForm.carouselButton2Type && payloadForm.carouselButton2Type !== 'None' && card.button2Text) {
                        const btnType = payloadForm.carouselButton2Type;
                        const pushBtn = { text: card.button2Text };
                        
                        if (btnType === 'Visit website') {
                            pushBtn.type = 'URL';
                            pushBtn.url = card.button2Url;
                            pushBtn.urlSamples = card.button2UrlSamples;
                        } else if (btnType === 'Call phone number') {
                            pushBtn.type = 'PHONE';
                            pushBtn.phone = card.button2Phone;
                        } else {
                            pushBtn.type = 'QUICK_REPLY';
                        }
                        mappedCard.buttons.push(pushBtn);
                    }

                    return mappedCard
                })
            }

            let savedTemplate
            let shouldSubmit = true

            if (initialData?.id && initialData?.isLocked) {
                savedTemplate = await cloneTemplate(initialData.id).unwrap()
            } else if (!initialData?.id) {
                savedTemplate = await createTemplate({ ...payloadForm, integratedNumber: String(integratedNumber).trim() }).unwrap()
                if (savedTemplate?.data?.status === 'SUBMITTED') {
                    shouldSubmit = false
                }
            } else {
                savedTemplate = await updateTemplate({
                    form: payloadForm,
                    integratedNumber: String(integratedNumber).trim(),
                    templateId: initialData.id
                }).unwrap()
            }

            const templateId = savedTemplate?.data?._id || savedTemplate?._id

            if (!templateId) {
                throw new Error("Failed to save template ID")
            }

            if (shouldSubmit) {
                await submitTemplate(templateId).unwrap()
            }

            handleClose()
            toast.success('Created successfully')
            setForm(createDefaultForm())
        } catch (err) {
            console.error(err)
            toast.error(err?.data?.message || err?.message || 'Failed to create template')
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setForm(createDefaultForm())
        setErrors({})
        onClose?.()
    }

    if (!open) return null

    const renderForm = () => {
        if (form.category === CATEGORIES.AUTHENTICATION)
            return <AuthenticationForm form={form} setField={setField} />

        if (form.category === CATEGORIES.MARKETING) {
            if (form.marketingType === MARKETING_TYPES.PRODUCT)
                return <ProductForm form={form} setField={setField} errors={errors} />
            if (form.marketingType === MARKETING_TYPES.CAROUSEL)
                return <CarouselForm form={form} setField={setField} errors={errors} />
        }

        return <CustomForm form={form} setField={setField} errors={errors} />
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]  flex items-center justify-center p-4">
            <div className="bg-[var(--app-pages-bg)] rounded-xl w-full max-w-[1140px] max-h-[94vh] border-2 border-[var(--app-pages-border)] flex flex-col shadow-xl">

                <ModalHeader
                    title={initialData ? 'Edit Template' : 'Create Template'}
                    onClose={handleClose}
                />

                <div className="flex flex-1 overflow-hidden">

                    <div className="flex-1 overflow-y-auto bg-[var(--app-pages-bg)]">
                        <TopRow form={form} setField={setField} errors={errors} />

                        <div className="p-5">
                            {renderForm()}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="w-[280px] border-l border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]/50 backdrop-blur-sm p-4">
                        <WhatsAppPreview form={form} />
                    </div>

                </div>

                <ModalFooter
                    onCancel={handleClose}
                    onSave={handleSave}
                    saving={saving}
                    form={form}
                    onAddSample={() => setShowSampleModal(true)}
                />
            </div>
            
            {showSampleModal && (
                <Msg91AddSampleModal 
                    form={form} 
                    setField={setField} 
                    onSave={performSave} 
                    onCancel={() => setShowSampleModal(false)} 
                />
            )}
        </div>
    )
}

export default Msg91CreateTemplateModal
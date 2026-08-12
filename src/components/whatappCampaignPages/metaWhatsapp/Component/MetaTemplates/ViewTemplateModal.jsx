import React, { useState } from 'react'
import { CloseIcon } from './ui/WaIcons.jsx'
import WhatsAppPreview from './WhatsAppPreview.jsx'

const ViewTemplateModal = ({ open, onClose, template }) => {
    const [showSamples, setShowSamples] = useState(true);

    if (!open || !template) return null;

    // Convert API template format slightly if needed for WhatsAppPreview, 
    // or just pass it in. WhatsAppPreview expects a `form` object.
    const form = {
        ...template,
        // Ensure header is in the format WhatsAppPreview expects if needed
        // The API returns header as an object { format: 'TEXT', text: '...' } 
        // WhatsAppPreview expects form.header.type instead of format
        header: template.header ? {
            ...template.header,
            type: template.header.format || template.header.type || 'NONE'
        } : { type: 'NONE' },
        bodySamples: showSamples ? (template.bodySamples?.[0] || template.bodySamples || []) : [],
        headerSamples: showSamples ? (template.header?.example?.header_text?.[0] 
            ? [template.header.example.header_text[0]] 
            : template.header?.example?.header_text || []) : []
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 dark:bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="flex w-full max-w-[420px] h-[calc(100vh-12rem)] flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="flex flex-col border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                    <div className="flex items-center justify-between px-5 py-4">
                        <h2 className="m-0 text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate pr-4">
                            {template.name}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                        >
                            <CloseIcon size={16} />
                        </button>
                    </div>
                    {/* Toggle for samples */}
                    <div className="flex items-center justify-between px-5 pb-3 pt-1">
                        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">Show Sample Data</span>
                        <button
                            type="button"
                            onClick={() => setShowSamples(!showSamples)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${showSamples ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showSamples ? 'translate-x-4' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>
                </div>

                {/* Content Area - WhatsApp Background */}
                <div 
                    className="flex flex-1 flex-col overflow-auto bg-[#efeae2] p-5 relative"
                    style={{
                        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        backgroundRepeat: 'repeat',
                        backgroundSize: '300px'
                    }}
                >
                    <div className="w-full max-w-[340px] mx-auto drop-shadow-sm pb-4">
                        <WhatsAppPreview form={form} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewTemplateModal

import React from 'react'
import { Btn, FloatingInput } from '../ui/Msg91WaBaseUI'

// Helper to count variables
const getVarCount = (text = '') => text.match(/\{\{\d+\}\}/g)?.length || 0;

const Msg91AddSampleModal = ({ form, setField, onSave, onCancel }) => {
    const renderGlobalBodySamples = () => {
        const count = getVarCount(form.body);
        if (count === 0) return null;
        
        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    {form.marketingType === 'Carousel' ? 'Carousel Global Body' : 'Body'}
                </h4>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="mb-3">
                        <FloatingInput
                            label={`Enter sample for {{${i + 1}}}`}
                            value={form.bodySamples?.[i] || ''}
                            onChange={(e) => {
                                const newSamples = [...(form.bodySamples || [])];
                                newSamples[i] = e.target.value;
                                setField('bodySamples', newSamples);
                            }}
                        />
                    </div>
                ))}
            </div>
        )
    }

    const renderHeaderSamples = () => {
        if (form.headerType !== 'Text') return null;
        const count = getVarCount(form.headerText);
        if (count === 0) return null;
        
        return (
            <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    Header
                </h4>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="mb-3">
                        <FloatingInput
                            label={`Enter sample for {{${i + 1}}}`}
                            value={form.headerSamples?.[i] || ''}
                            onChange={(e) => {
                                const newSamples = [...(form.headerSamples || [])];
                                newSamples[i] = e.target.value;
                                setField('headerSamples', newSamples);
                            }}
                        />
                    </div>
                ))}
            </div>
        )
    }

    const renderButtonSamples = () => {
        if (form.marketingType === 'Carousel') return null;
        if (!form.buttons || form.buttons.length === 0) return null;

        return form.buttons.map((btn, bIndex) => {
            if (btn.type !== 'Visit website' && btn.type !== 'URL') return null;
            const count = getVarCount(btn.url);
            if (count === 0) return null;
            
            return (
                <div key={btn.id || bIndex} className="mb-6">
                    <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        Button: {btn.text || 'URL Button'}
                    </h4>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className="mb-3">
                            <FloatingInput
                                label={`Enter sample for {{${i + 1}}}`}
                                value={btn.urlSamples?.[i] || ''}
                                onChange={(e) => {
                                    const newBtns = [...form.buttons];
                                    const newSamples = [...(btn.urlSamples || [])];
                                    newSamples[i] = e.target.value;
                                    newBtns[bIndex] = { ...btn, urlSamples: newSamples };
                                    setField('buttons', newBtns);
                                }}
                            />
                        </div>
                    ))}
                </div>
            )
        })
    }

    const renderCarouselCardsSamples = () => {
        if (form.category !== 'Marketing' || form.marketingType !== 'Carousel') return null;
        
        return form.carouselCards?.map((card, cIndex) => {
            const count = getVarCount(card.body);
            if (count === 0) return null;
            
            return (
                <div key={card.id} className="mb-6 border border-[var(--app-pages-border)] p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-3 text-gray-800 dark:text-gray-200">
                        Card {cIndex + 1} Body
                    </h4>
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={`body-${i}`} className="mb-3">
                            <FloatingInput
                                label={`Enter sample for {{${i + 1}}}`}
                                value={card.bodySamples?.[i] || ''}
                                onChange={(e) => {
                                    const newCards = [...form.carouselCards];
                                    const newSamples = [...(card.bodySamples || [])];
                                    newSamples[i] = e.target.value;
                                    newCards[cIndex] = { ...card, bodySamples: newSamples };
                                    setField('carouselCards', newCards);
                                }}
                            />
                        </div>
                    ))}
                    
                    {/* Card Button 1 Sample */}
                    {card.button1Url && getVarCount(card.button1Url) > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Card {cIndex + 1} Button 1 URL
                            </h4>
                            {Array.from({ length: getVarCount(card.button1Url) }).map((_, i) => (
                                <div key={`b1-${i}`} className="mb-3">
                                    <FloatingInput
                                        label={`Enter sample for {{${i + 1}}}`}
                                        value={card.button1UrlSamples?.[i] || ''}
                                        onChange={(e) => {
                                            const newCards = [...form.carouselCards];
                                            const newSamples = [...(card.button1UrlSamples || [])];
                                            newSamples[i] = e.target.value;
                                            newCards[cIndex] = { ...card, button1UrlSamples: newSamples };
                                            setField('carouselCards', newCards);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Card Button 2 Sample */}
                    {card.button2Url && getVarCount(card.button2Url) > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Card {cIndex + 1} Button 2 URL
                            </h4>
                            {Array.from({ length: getVarCount(card.button2Url) }).map((_, i) => (
                                <div key={`b2-${i}`} className="mb-3">
                                    <FloatingInput
                                        label={`Enter sample for {{${i + 1}}}`}
                                        value={card.button2UrlSamples?.[i] || ''}
                                        onChange={(e) => {
                                            const newCards = [...form.carouselCards];
                                            const newSamples = [...(card.button2UrlSamples || [])];
                                            newSamples[i] = e.target.value;
                                            newCards[cIndex] = { ...card, button2UrlSamples: newSamples };
                                            setField('carouselCards', newCards);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )
        })
    }
    
    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-zinc-900 rounded-[20px] shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col border border-gray-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-6 py-5">
                    <h2 className="text-[18px] font-semibold text-gray-900 dark:text-white">
                        Add Sample Content ({form.language?.toUpperCase() || 'EN'})
                    </h2>
                </div>
                
                <div className="px-6 py-2 max-h-[60vh] overflow-y-auto">
                    <p className="text-[14px] text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                        To help us understand what kind of message that you want to send, you have the option to provide specific content examples for your template. You can add a sample template for one or all languages that you are submitting. Make sure that you don't include any actual user or customer information, and only provide sample content in your examples.
                    </p>
                    <p className="text-[14px] font-medium text-gray-800 dark:text-gray-200 mb-6">
                        <span className="font-semibold">Note:</span> Sample is mandatory.
                    </p>
                    {renderHeaderSamples()}
                    {renderGlobalBodySamples()}
                    {renderButtonSamples()}
                    {renderCarouselCardsSamples()}
                </div>
                
                <div className="px-6 py-4 flex justify-end gap-3 mt-2">
                    <Btn variant="ghost" onClick={onCancel} className="!px-6 !rounded-full">Cancel</Btn>
                    <Btn variant="primary" onClick={onSave} className="!px-6 !rounded-full">Save</Btn>
                </div>
            </div>
        </div>
    )
}

export default Msg91AddSampleModal

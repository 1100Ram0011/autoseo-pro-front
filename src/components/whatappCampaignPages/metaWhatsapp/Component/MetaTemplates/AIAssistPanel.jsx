import React, { useState } from 'react'
import { SparkleIcon } from './ui/WaIcons'
import { Btn, Badge } from './ui/WaBaseUI'

const AIAssistPanel = ({ onGenerate }) => {
    const [prompt, setPrompt] = useState('')

    return (
        <div style={{
            width: 210, background: '#fafbff', borderRight: '1px solid var(--border)',
            padding: 16, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <SparkleIcon size={18} color="var(--blue)" />
            </div>

            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
                Let AI help you create template!
            </p>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text)' }}>Sample prompt:</strong> Generate a marketing template in Hindi, English, and Marathi with a variable "model_no", and add two call-to-action buttons to promote our new product.
            </p>

            <div>
                <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe your template..."
                    style={{
                        width: '100%', minHeight: 70, padding: 10,
                        border: '1px solid var(--border)', borderRadius: 6, fontSize: 11,
                        fontFamily: "'DM Sans', sans-serif", color: 'var(--text)', resize: 'none',
                        outline: 'none', background: '#fff', boxSizing: 'border-box', lineHeight: 1.55,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
            </div>

            <Btn variant="primary" size="sm" icon={<SparkleIcon size={12} />}
                onClick={() => onGenerate?.(prompt)}
                style={{ justifyContent: 'center', width: '100%', position: 'relative' }}>
                Generate with AI
                <Badge>BETA</Badge>
            </Btn>

            <p style={{ fontSize: 10, color: 'var(--text-light)', margin: 0, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--text-muted)' }}>Note:</strong> AI can make mistakes. Results may need manual review.
            </p>
        </div>
    )
}

export default AIAssistPanel

// import { useEffect, useMemo, useRef, useState } from 'react'
// import grapesjs from 'grapesjs'
// import 'grapesjs/dist/css/grapes.min.css'
// import newsletterPlugin from 'grapesjs-preset-newsletter'
// import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
// import AuthPage from '@/pages/user/AuthPage'
// import { useSelector } from 'react-redux'
// import { useTheme } from '@/components/global/theme-provider'

// import {
//   useCreateEmailTemplateMutation,
//   useUpdateEmailTemplateMutation,
// } from '../../../../redux/apis/emailTemplateApi'

// import VariableList from './VariableList'

// // ─────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────
// function extractVariables(html = '') {
//   const regex = /{{(.*?)}}/g
//   return [...new Set([...html.matchAll(regex)].map((m) => m[1].trim()))]
// }

// function validateAndSanitize(value) {
//   const sanitized = value.replace(/[^A-Za-z0-9 _.-]/g, '')
//   const trimmed = sanitized.trim()
//   if (!trimmed) return { value: sanitized, error: 'This field is required.' }
//   if (!/[A-Za-z]/.test(trimmed))
//     return { value: sanitized, error: 'Must contain at least one letter.' }
//   if (/^[^A-Za-z0-9]+$/.test(trimmed))
//     return {
//       value: sanitized,
//       error: 'Cannot contain only special characters.',
//     }
//   return { value: sanitized, error: '' }
// }

// function downloadVariableExcel(templateName, variables) {
//   const headers = variables.length > 0 ? variables : ['email', 'firstName']
//   const csvRows = [
//     headers.join(','),
//     headers.map((h) => `Sample ${h}`).join(','),
//   ]
//   const blob = new Blob([csvRows.join('\r\n')], {
//     type: 'text/csv;charset=utf-8;',
//   })
//   const url = URL.createObjectURL(blob)
//   const a = document.createElement('a')
//   a.href = url
//   a.download = `${(templateName || 'template')
//     .toLowerCase()
//     .replace(/[^a-z0-9]/g, '_')}_format.csv`
//   document.body.appendChild(a)
//   a.click()
//   document.body.removeChild(a)
//   URL.revokeObjectURL(url)
// }



// // ─────────────────────────────────────────────
// // Default starter HTML — NO unsubscribe link
// // ─────────────────────────────────────────────
// const STARTER_HTML = `
// <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f4f4f4;">
//   <tr>
//     <td align="center" style="padding:40px 20px;">
//       <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
//         <tr>
//           <td style="background:#1E4E79;padding:30px 40px;text-align:center;">
//             <h1 style="color:#ffffff;margin:0;font-size:26px;">{{companyName}}</h1>
//           </td>
//         </tr>
//         <tr>
//           <td style="padding:40px;">
//             <p style="margin:0 0 16px;font-size:16px;color:#333;">Hi {{firstName}},</p>
//             <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
//               Your message goes here. Drag blocks from the left panel to build your email.
//               Use <strong>{{variableName}}</strong> syntax for dynamic content.
//             </p>
//             <table cellpadding="0" cellspacing="0">
//               <tr>
//                 <td style="background:#1E4E79;border-radius:4px;">
//                   <a href="{{ctaUrl}}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;">
//                     Get Started
//                   </a>
//                 </td>
//               </tr>
//             </table>
//           </td>
//         </tr>
//       </table>
//     </td>
//   </tr>
// </table>
// `.trim()

// // ─────────────────────────────────────────────
// // Scoped GrapesJS CSS overrides (injected once)
// // + Mobile layout helpers
// // ─────────────────────────────────────────────
// const GRAPES_OVERRIDES = `
//   .gjs-drawer-wrap .gjs-editor { border: none !important; }
//   .gjs-drawer-wrap [title="About"],
//   .gjs-drawer-wrap .gjs-logo-version { display: none !important; }
//   .gjs-drawer-wrap .gjs-block { border-radius: 6px; }
//   .gjs-drawer-wrap .gjs-pn-panel { background: #fff; }
//   #gjs-blocks-container .gjs-block-category .gjs-title { font-size: 11px; }

//   /* Grapes panels scroll nicer on small screens */
//   .gjs-drawer-wrap #gjs-blocks-container { overscroll-behavior: contain; }
//   .gjs-drawer-wrap #gjs-styles-container,
//   .gjs-drawer-wrap #gjs-layers-container,
//   .gjs-drawer-wrap #gjs-traits-container { overscroll-behavior: contain; }

//   /* ───── Dark mode (Tailwind .dark on <html>) ───── */
//   .dark .gjs-drawer-wrap .gjs-pn-panel,
//   .dark .gjs-drawer-wrap .gjs-one-bg,
//   .dark .gjs-drawer-wrap .gjs-two-color {
//     background: #0b1220 !important;
//     color: #e5e7eb !important;
//   }
//   .dark .gjs-drawer-wrap .gjs-block {
//     background: rgba(255,255,255,0.03) !important;
//     border-color: rgba(148,163,184,0.25) !important;
//     color: #e5e7eb !important;
//   }
//   .dark .gjs-drawer-wrap .gjs-block:hover {
//     border-color: rgba(148,163,184,0.45) !important;
//   }
//   .dark .gjs-drawer-wrap .gjs-sm-sector,
//   .dark .gjs-drawer-wrap .gjs-sm-title,
//   .dark .gjs-drawer-wrap .gjs-title {
//     color: #cbd5e1 !important;
//   }
//   .dark .gjs-drawer-wrap .gjs-field,
//   .dark .gjs-drawer-wrap .gjs-input-holder input,
//   .dark .gjs-drawer-wrap input,
//   .dark .gjs-drawer-wrap select,
//   .dark .gjs-drawer-wrap textarea {
//     background: rgba(255,255,255,0.04) !important;
//     color: #e5e7eb !important;
//     border-color: rgba(148,163,184,0.25) !important;
//   }
//   .dark .gjs-drawer-wrap .gjs-pn-btn { color: #e5e7eb !important; }
//   .dark .gjs-drawer-wrap .gjs-pn-btn:hover { background: rgba(255,255,255,0.06) !important; }
//   .dark .gjs-drawer-wrap .gjs-cv-canvas { background: #0b1220 !important; }
// `

// // ─────────────────────────────────────────────
// // Component
// // ─────────────────────────────────────────────
// export default function TemplateDrawer({ template, onClose }) {
//   const { isDark } = useTheme()
//   const isEdit = Boolean(template?._id)

//   // Mobile UI: show panels in a drawer instead of 3-column layout
//   const [mobilePanel, setMobilePanel] = useState('canvas') // canvas | blocks | right


//   // ── Form state
//   const [name, setName] = useState('')
//   const [subject, setSubject] = useState('')
//   const [html, setHtml] = useState('')
//   const [css, setCss] = useState('')

//   const [newFiles, setNewFiles] = useState([])
//   const [existingAttachments, setExistingAttachments] = useState([])
//   const [removedKeys, setRemovedKeys] = useState([])

//   const [errors, setErrors] = useState({})
//   const [error, setError] = useState('')
//   const [editorMounted, setEditorMounted] = useState(false)

//   // ── Success screen state
//   const [savedInfo, setSavedInfo] = useState(null)

//   const [showAuthModal, setShowAuthModal] = useState(false)
//   const reduxUser = useSelector((state) => state.auth?.user)
//   const accentGradientClasses = isDark
//     ? 'from-[#FB6218] to-[#FEBC02]'
//     : 'from-sky-400 to-blue-600'



//   // ── Refs
//   const containerRef = useRef(null)
//   const editorRef = useRef(null)

//   // ── Mirror form state into refs
//   const nameRef = useRef('')
//   const subjectRef = useRef('')

//   useEffect(() => {
//     nameRef.current = name
//   }, [name])
//   useEffect(() => {
//     subjectRef.current = subject
//   }, [subject])

//   // ── RTK Query
//   const [createTemplate, { isLoading: isCreating }] =
//     useCreateEmailTemplateMutation()
//   const [updateTemplate, { isLoading: isUpdating }] =
//     useUpdateEmailTemplateMutation()
//   const isSaving = isCreating || isUpdating

//   // ── Derived variables
//   const variables = useMemo(() => {
//     return Array.from(new Set([...extractVariables(html), 'email']))
//   }, [html])

//   // ── Sync form when template prop changes
//   useEffect(() => {
//     queueMicrotask(() => {
//       if (template) {
//         setName(template.name ?? '')
//         setSubject(template.subject ?? '')
//         setHtml(template.html ?? '')
//         setExistingAttachments(template.attachments ?? [])
//       } else {
//         setName('')
//         setSubject('')
//         setHtml(STARTER_HTML)
//         setExistingAttachments([])
//       }
//       setNewFiles([])
//       setRemovedKeys([])
//       setErrors({})
//       setError('')
//       setEditorMounted(false)
//       setSavedInfo(null)
//       setMobilePanel('canvas')
//     })
//   }, [template])

//   // ── Prevent background scroll
//   useEffect(() => {
//     document.body.style.overflow = 'hidden'
//     return () => {
//       document.body.style.overflow = 'auto'
//     }
//   }, [])

//   // ── Inject CSS overrides once
//   useEffect(() => {
//     const id = 'gjs-drawer-overrides'
//     if (!document.getElementById(id)) {
//       const style = document.createElement('style')
//       style.id = id
//       style.textContent = GRAPES_OVERRIDES
//       document.head.appendChild(style)
//     }
//   }, [])

//   // ── Mount / re-mount GrapesJS
//   useEffect(() => {
//     if (!containerRef.current) return

//     if (editorRef.current) {
//       try {
//         editorRef.current.destroy()
//       } catch {
//         // Ignore stale GrapesJS instance teardown errors during remount.
//       }
//       editorRef.current = null
//     }

//     const initialHtml = template?.html ?? STARTER_HTML

//     const editor = grapesjs.init({
//       container: containerRef.current,
//       height: '100%',
//       width: '100%',
//       storageManager: false,
//       noticeOnUnload: false,
//       components: initialHtml,
//       style: '',
//       plugins: [newsletterPlugin],
//       pluginsOpts: {
//         [newsletterPlugin]: {
//           modalTitleImport: 'Import HTML Template',
//           modalLabelImport: 'Paste your email HTML here:',
//           modalTitleExport: 'Export HTML',
//           importPlaceholder: '<table>…</table>',
//           inlineCss: true,
//           codeViewerTheme: 'material',
//         },
//       },
//       blockManager: { appendTo: '#gjs-blocks-container' },
//       styleManager: { appendTo: '#gjs-styles-container' },
//       layerManager: { appendTo: '#gjs-layers-container' },
//       traitManager: { appendTo: '#gjs-traits-container' },
//       deviceManager: {
//         devices: [
//           { name: 'Desktop', width: '' },
//           { name: 'Mobile', width: '480px', widthMedia: '640px' },
//         ],
//       },
//     })

//     editorRef.current = editor

//     const syncState = () => {
//       setHtml(editor.getHtml() ?? '')
//       setCss(editor.getCss() ?? '')
//     }

//     ;[
//       'component:update',
//       'component:add',
//       'component:remove',
//       'style:change',
//     ].forEach((ev) => editor.on(ev, syncState))

//     editor.on('load', () => {
//       syncState()
//       setEditorMounted(true)
//     })

//     const fallback = setTimeout(() => {
//       syncState()
//       setEditorMounted(true)
//     }, 500)

//     // On small screens default to "Mobile" device
//     const mq = window.matchMedia('(max-width: 768px)')
//     const setDeviceByMq = () => {
//       try {
//         editor.setDevice(mq.matches ? 'Mobile' : 'Desktop')
//       } catch {
//         // Ignore device switch failures until the editor is fully ready.
//       }
//     }
//     setDeviceByMq()
//     mq.addEventListener?.('change', setDeviceByMq)

//     return () => {
//       clearTimeout(fallback)
//       mq.removeEventListener?.('change', setDeviceByMq)
//       if (editorRef.current) {
//         try {
//           editorRef.current.destroy()
//         } catch {
//           // Ignore duplicate destroy calls during unmount.
//         }
//         editorRef.current = null
//       }
//     }
//   }, [template])

//   // ── Field handlers
//   const handleNameChange = (e) => {
//     const { value, error: err } = validateAndSanitize(e.target.value)
//     setName(value)
//     setErrors((p) => ({ ...p, name: err }))
//   }

//   const handleSubjectChange = (e) => {
//     const { value, error: err } = validateAndSanitize(e.target.value)
//     setSubject(value)
//     setErrors((p) => ({ ...p, subject: err }))
//   }

//   // ── Attachment handlers
//   const handleFileChange = (e) =>
//     setNewFiles((p) => [...p, ...Array.from(e.target.files || [])])

//   const removeNewFile = (i) =>
//     setNewFiles((p) => p.filter((_, idx) => idx !== i))

//   const removeExistingAttachment = (key) => {
//     setRemovedKeys((p) => [...p, key])
//     setExistingAttachments((p) => p.filter((a) => a.key !== key))
//   }

//   // ── Submit
//   const isFormInvalid =
//     !!errors.name ||
//     !!errors.subject ||
//     !name.trim() ||
//     !subject.trim() ||
//     !html.trim()

//   const handleSubmit = async () => {
//     if (reduxUser?.isGuest) {
//       setShowAuthModal(true)
//       return
//     }
//     const currentName = nameRef.current.trim()
//     const currentSubject = subjectRef.current.trim()

//     const editor = editorRef.current
//     const finalHtml = editor ? (editor.getHtml() ?? '') : html
//     const finalCss = editor ? (editor.getCss() ?? '') : css

//     const fullHtml = finalCss
//       ? `<style>${finalCss}</style>\n${finalHtml}`
//       : finalHtml

//     if (!currentName) {
//       setErrors((p) => ({ ...p, name: 'This field is required.' }))
//       setError('Please fix validation errors before saving.')
//       return
//     }
//     if (!currentSubject) {
//       setErrors((p) => ({ ...p, subject: 'This field is required.' }))
//       setError('Please fix validation errors before saving.')
//       return
//     }
//     if (!fullHtml.trim()) {
//       setError('HTML content cannot be empty.')
//       return
//     }
//     if (errors.name || errors.subject) {
//       setError('Please fix validation errors before saving.')
//       return
//     }

//     try {
//       setError('')

//       const formData = new FormData()
//       formData.append('name', currentName)
//       formData.append('subject', currentSubject)
//       formData.append('html', fullHtml)

//       newFiles.forEach((f) => formData.append('attachments', f))
//       removedKeys.forEach((k) => formData.append('removeAttachments[]', k))

//       const currentVariables = extractVariables(finalHtml)
//       const updatedVariables = currentVariables.includes('email')
//         ? currentVariables
//         : [...currentVariables, 'email']

//       if (isEdit) {
//         await updateTemplate({ id: template._id, body: formData }).unwrap()
//       } else {
//         await createTemplate(formData).unwrap()
//       }

//       setSavedInfo({ name: currentName, variables: updatedVariables })
//     } catch (err) {
//       setError(err?.data?.message ?? 'Failed to save template.')
//     }
//   }

//   // ── Success screen
//   if (savedInfo) {
//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//         <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900 sm:p-8">
//           <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-green-100 bg-green-50 dark:border-emerald-900/40 dark:bg-emerald-950/40">
//             <svg
//               className="h-8 w-8 text-green-500 dark:text-emerald-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth={2.5}
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </div>

//           <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-slate-100">
//             Template {isEdit ? 'Updated' : 'Created'}!
//           </h3>
//           <p className="mb-6 text-sm text-gray-500 dark:text-slate-400">
//             <span className="font-semibold text-gray-700 dark:text-slate-200">
//               {savedInfo.name}
//             </span>{' '}
//             was saved successfully.
//           </p>

//           {savedInfo.variables.length > 0 && (
//             <div className="mb-6 w-full rounded-xl border border-blue-100 bg-blue-50 p-4 text-left dark:border-slate-700 dark:bg-slate-800/60">
//               <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-sky-300">
//                 Detected Variables
//               </p>
//               <div className="flex flex-wrap gap-1.5">
//                 {savedInfo.variables.map((v) => (
//                   <span
//                     key={v}
//                     className="inline-flex items-center rounded-md border border-blue-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-blue-700 dark:border-slate-600 dark:bg-slate-900 dark:text-sky-200"
//                   >
//                     {`{{${v}}}`}
//                   </span>
//                 ))}
//               </div>
//               <p className="mt-3 text-[11px] leading-relaxed text-blue-500 dark:text-slate-300">
//                 Download the format file — it contains the exact column headers
//                 your CSV/Excel needs for mail-merge.
//               </p>
//             </div>
//           )}

//           <div className="flex w-full flex-col gap-3">
//             <button
//               onClick={() =>
//                 downloadVariableExcel(savedInfo.name, savedInfo.variables)
//               }
//               className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D6F42] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#155c35]"
//             >
//               <svg
//                 className="h-4 w-4"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"
//                 />
//               </svg>
//               Download Excel Format
//             </button>
//             <button
//               onClick={onClose}
//               className="w-full rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // ─────────────────────────────────────────────
//   // Main drawer (mobile responsive)
//   // - Desktop: 3 columns (Blocks | Canvas | Right)
//   // - Mobile: Canvas full, panels open as bottom sheet
//   // ─────────────────────────────────────────────
//   return (
//     <div className="fixed inset-0 z-[60] flex items-stretch bg-black/40 p-2 sm:p-4">
//       <div className="gjs-drawer-wrap flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-700 dark:bg-slate-900">
//         {/* HEADER */}
//         <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:items-center sm:px-8 sm:py-4">
//           <div className="min-w-0">
//             <h2 className="truncate text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg">
//               {isEdit ? 'Edit Template' : 'Create Template'}
//             </h2>
//             <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
//               Drag-and-drop builder · variables · attachments
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>

//         {/* BODY */}
//         <div className="flex flex-1 flex-col overflow-hidden bg-[#F9FAFB] dark:bg-slate-950/40">
//           {/* Error banner */}
//           {error && (
//             <div className="mx-3 mt-3 flex shrink-0 items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 sm:mx-6 sm:mt-4">
//               <span>⚠️</span>
//               <span className="min-w-0 break-words">{error}</span>
//             </div>
//           )}

//           {/* Meta bar */}
//           <div className="shrink-0 border-b bg-white px-3 pb-3 pt-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6 sm:pb-4 sm:pt-5">
//             <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
//               {/* Name */}
//               <div className="min-w-0">
//                 <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
//                   Template Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={name}
//                   maxLength={50}
//                   placeholder="e.g. Welcome Email"
//                   onChange={handleNameChange}
//                   className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
//                     errors.name
//                       ? 'border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40'
//                       : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-sky-400 dark:focus:ring-sky-900/40'
//                   }`}
//                 />
//                 {errors.name && (
//                   <p className="mt-1 text-xs text-red-500 dark:text-red-300">
//                     {errors.name}
//                   </p>
//                 )}
//               </div>

//               {/* Subject */}
//               <div className="min-w-0">
//                 <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
//                   Email Subject <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   value={subject}
//                   maxLength={100}
//                   placeholder="e.g. Welcome to {{companyName}}!"
//                   onChange={handleSubjectChange}
//                   className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
//                     errors.subject
//                       ? 'border-red-400 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/40'
//                       : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:border-sky-400 dark:focus:ring-sky-900/40'
//                   }`}
//                 />
//                 {errors.subject && (
//                   <p className="mt-1 text-xs text-red-500 dark:text-red-300">
//                     {errors.subject}
//                   </p>
//                 )}
//               </div>

//               {/* Attachments */}
//               <div className="min-w-0">
//                 <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
//                   Attachments
//                 </label>
//                 <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 transition hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-500 dark:hover:text-sky-300">
//                   <span>📎</span>
//                   <span>Add files</span>
//                   <input
//                     type="file"
//                     multiple
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
//                 </label>
//               </div>
//             </div>

//             {(existingAttachments.length > 0 || newFiles.length > 0) && (
//               <div className="mt-3 flex flex-wrap gap-2">
//                 {existingAttachments.map((att) => (
//                   <AttachmentChip
//                     key={att.key}
//                     label={att.originalName}
//                     onRemove={() => removeExistingAttachment(att.key)}
//                   />
//                 ))}
//                 {newFiles.map((f, i) => (
//                   <AttachmentChip
//                     key={i}
//                     label={f.name}
//                     isNew
//                     onRemove={() => removeNewFile(i)}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Mobile panel switcher */}
//             <div className="mt-3 flex items-center gap-2 md:hidden">
//               <button
//                 onClick={() => setMobilePanel('blocks')}
//                 className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
//                   mobilePanel === 'blocks'
//                     ? 'border-[#1E4E79] bg-[#1E4E79]/10 text-[#1E4E79] dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-200'
//                     : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
//                 }`}
//               >
//                 Blocks
//               </button>
//               <button
//                 onClick={() => setMobilePanel('canvas')}
//                 className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
//                   mobilePanel === 'canvas'
//                     ? 'border-[#1E4E79] bg-[#1E4E79]/10 text-[#1E4E79] dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-200'
//                     : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
//                 }`}
//               >
//                 Canvas
//               </button>
//               <button
//                 onClick={() => setMobilePanel('right')}
//                 className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
//                   mobilePanel === 'right'
//                     ? 'border-[#1E4E79] bg-[#1E4E79]/10 text-[#1E4E79] dark:border-sky-400 dark:bg-sky-400/10 dark:text-sky-200'
//                     : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
//                 }`}
//               >
//                 Panel
//               </button>
//             </div>
//           </div>

//           {/* Editor area */}
//           <div className="flex flex-1 overflow-hidden">
//             {/* Desktop blocks */}
//             <div
//               id="gjs-blocks-container"
//               className="hidden w-56 shrink-0 overflow-y-auto border-r bg-white dark:border-slate-700 dark:bg-slate-900 md:block lg:w-60"
//             />

//             {/* Canvas */}
//             <div className="relative flex-1 overflow-hidden bg-white dark:bg-slate-900">
//               {!editorMounted && (
//                 <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 bg-white/90 dark:bg-slate-900/80">
//                   <svg
//                     className="h-5 w-5 animate-spin text-[#1E4E79] dark:text-sky-400"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8z"
//                     />
//                   </svg>
//                   <span className="text-sm text-gray-500 dark:text-slate-300">
//                     Loading editor…
//                   </span>
//                 </div>
//               )}
//               <div
//                 ref={containerRef}
//                 style={{ height: '100%', width: '100%' }}
//               />
//             </div>

//             {/* Desktop right panel */}
//             <div className="hidden w-72 shrink-0 flex-col overflow-hidden border-l bg-white dark:border-slate-700 dark:bg-slate-900 md:flex lg:w-80">
//               <RightPanel variables={variables} />
//             </div>
//           </div>

//           {/* Mobile bottom sheet */}
//           <MobileSheet
//             open={mobilePanel === 'blocks' || mobilePanel === 'right'}
//             title={mobilePanel === 'blocks' ? 'Blocks' : 'Panel'}
//             onClose={() => setMobilePanel('canvas')}
//           >
//             {mobilePanel === 'blocks' ? (
//               <div
//                 className="h-[55vh] overflow-y-auto"
//                 id="gjs-blocks-container-mobile"
//               >
//                 {/* We reuse same id container by cloning content via CSS:
//                     simplest approach: render the original blocks container on mobile in sheet */}
//                 <div
//                   id="gjs-blocks-container"
//                   className="h-[55vh] overflow-y-auto bg-white dark:bg-slate-900"
//                 />
//               </div>
//             ) : (
//               <div className="h-[55vh] overflow-hidden">
//                 <RightPanel variables={variables} />
//               </div>
//             )}
//           </MobileSheet>
//         </div>

//         {/* FOOTER */}
//         <div className="flex shrink-0 flex-col gap-3 border-t bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-4">
//           <p className="text-xs text-gray-400 dark:text-slate-400">
//             {variables.length > 0
//               ? `${variables.length} variable${variables.length > 1 ? 's' : ''} detected`
//               : 'No variables yet'}
//           </p>

//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={isSaving}
//               className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:flex-none sm:px-5"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={isSaving || isFormInvalid}
//               className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${accentGradientClasses} px-4 py-2 text-sm text-white transition hover:brightness-110 disabled:opacity-50 sm:flex-none sm:px-6`}
//             >
//               {isSaving && (
//                 <svg
//                   className="h-4 w-4 animate-spin"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8z"
//                   />
//                 </svg>
//               )}
//               {isSaving
//                 ? 'Saving…'
//                 : isEdit
//                   ? 'Update Template'
//                   : 'Save Template'}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Helper style for bottom sheet drag handle animation */}
//       <style>{`
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//       `}</style>
//            {
//         showAuthModal && (
//           <DemoAnimatedAuthModal
//             isOpen={showAuthModal}
//             onClose={() => setShowAuthModal(false)}
//           >
//             <AuthPage onSuccess={() => setShowAuthModal(false)} />
//           </DemoAnimatedAuthModal>
//         )
//       }
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// // RightPanel — tabbed: Styles | Layers | Variables
// // ─────────────────────────────────────────────
// function RightPanel({ variables }) {
//   const [tab, setTab] = useState('styles')

//   return (
//     <div className="flex h-full flex-col">
//       <div className="flex shrink-0 border-b dark:border-slate-700">
//         {[
//           { id: 'styles', label: 'Styles' },
//           { id: 'layers', label: 'Layers' },
//           { id: 'vars', label: 'Variables' },
//         ].map(({ id, label }) => (
//           <button
//             key={id}
//             onClick={() => setTab(id)}
//             className={`flex-1 py-2.5 text-xs font-medium transition ${
//               tab === id
//                 ? 'border-b-2 border-[#1E4E79] text-[#1E4E79] dark:border-sky-400 dark:text-sky-300'
//                 : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
//             }`}
//           >
//             {label}
//           </button>
//         ))}
//       </div>

//       <div className="flex-1 overflow-y-auto">
//         <div
//           id="gjs-styles-container"
//           style={{ display: tab === 'styles' ? 'block' : 'none' }}
//         />
//         <div
//           id="gjs-layers-container"
//           style={{ display: tab === 'layers' ? 'block' : 'none' }}
//         />

//         <div
//           className="p-4"
//           style={{ display: tab === 'vars' ? 'block' : 'none' }}
//         >
//           <VariableList variables={variables} />
//           {variables.length > 0 && (
//             <p className="mt-4 text-xs leading-relaxed text-gray-400 dark:text-slate-400">
//               Ensure your Excel/CSV has matching column headers for each
//               variable above.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// // ─────────────────────────────────────────────
// // AttachmentChip
// // ─────────────────────────────────────────────
// function AttachmentChip({ label, isNew = false, onRemove }) {
//   return (
//     <span
//       className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${
//         isNew
//           ? 'border-green-200 bg-green-50 text-green-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300'
//           : 'border-gray-200 bg-gray-100 text-gray-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200'
//       }`}
//       title={label}
//     >
//       <span className="truncate">📎 {label}</span>
//       {isNew && (
//         <span className="ml-0.5 font-medium text-green-500 dark:text-emerald-300">
//           NEW
//         </span>
//       )}
//       <button
//         onClick={onRemove}
//         className="ml-1 shrink-0 text-base leading-none text-gray-400 transition hover:text-red-500 dark:hover:text-red-300"
//         aria-label={`Remove ${label}`}
//       >
//         ×
//       </button>
//     </span>
//   )
// }

// // ─────────────────────────────────────────────
// // Mobile bottom sheet component
// // ─────────────────────────────────────────────
// function MobileSheet({ open, title, onClose, children }) {
//   return (
//     <div className={`md:hidden ${open ? '' : 'pointer-events-none'}`}>
//       {/* Backdrop */}
//       <div
//         className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${
//           open ? 'opacity-100' : 'opacity-0'
//         }`}
//         onClick={onClose}
//       />
//       {/* Sheet */}
//       <div
//         className={`fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl border border-gray-200 bg-white shadow-2xl transition-transform duration-200 dark:border-slate-700 dark:bg-slate-900 ${
//           open ? 'translate-y-0' : 'translate-y-full'
//         }`}
//         style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
//       >
//         <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-slate-700">
//           <div className="flex items-center gap-2">
//             <span className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-slate-700" />
//             <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
//               {title}
//             </h4>
//           </div>
//           <button
//             onClick={onClose}
//             className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
//           >
//             Close
//           </button>
//         </div>

//         <div className="px-2">{children}</div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import EmailEditor from 'react-email-editor'
import DemoAnimatedAuthModal from '@/ReUseAbleComponents/DemoAnimatedAuthModal'
import AuthPage from '@/pages/user/AuthPage'
import { useSelector } from 'react-redux'
import { useTheme } from '@/components/global/theme-provider'

import {
  useCreateEmailTemplateMutation,
  useUpdateEmailTemplateMutation,
} from '../../../../redux/apis/emailTemplateApi'
import { LoaderCircle } from 'lucide-react'
import { useGetMyBusinessDetailSummaryQuery } from '@/redux/apis/business.api'
import { extractHex } from '@/pages/user/webAnalysis'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function extractVariables(html = "") {
  const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
  return [...new Set([...html.matchAll(regex)].map(m => m[1]))];
}

function validateAndSanitize(value) {
  const sanitized = value.replace(/[^A-Za-z0-9 _.-]/g, '')
  const trimmed = sanitized.trim()
  if (!trimmed) return { value: sanitized, error: 'This field is required.' }
  if (!/[A-Za-z]/.test(trimmed))
    return { value: sanitized, error: 'Must contain at least one letter.' }
  if (/^[^A-Za-z0-9]+$/.test(trimmed))
    return {
      value: sanitized,
      error: 'Cannot contain only special characters.',
    }
  return { value: sanitized, error: '' }
}

function downloadVariableExcel(templateName, variables) {
  const headers = variables.length > 0 ? variables : ['email', 'firstName']
  const csvRows = [
    headers.join(','),
    headers.map((h) => `Sample ${h}`).join(','),
  ]
  const blob = new Blob([csvRows.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(templateName || 'template')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')}_format.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

//           draggable: true,
//           duplicatable: true,
//           deletable: true,
//           hideable: true,
//         },
//       },
//     ],
//     values: {
//       popupPosition: 'center',
//       popupWidth: '600px',
//       popupHeight: 'auto',
//       borderRadius: '10px',
//       contentAlign: 'center',
//       contentVerticalAlign: 'center',
//       contentWidth: '600px',
//       fontFamily: { label: 'Arial', value: 'arial,helvetica,sans-serif' },
//       textColor: '#000000',
//       popupBackgroundColor: '#FFFFFF',
//       popupBackgroundImage: { url: '', fullWidth: true, repeat: 'no-repeat', size: 'cover', position: 'center' },
//       popupOverlay_backgroundColor: 'rgba(0, 0, 0, 0.1)',
//       popupCloseButton_position: 'top-right',
//       popupCloseButton_backgroundColor: '#DDDDDD',
//       popupCloseButton_iconColor: '#000000',
//       popupCloseButton_borderRadius: '0px',
//       popupCloseButton_margin: '0px',
//       popupCloseButton_action: { name: 'close_popup', attrs: { onClick: "document.querySelector('.u-popup-container').style.display = 'none';" } },
//       backgroundColor: '#e7e7e7',
//       backgroundImage: { url: '', fullWidth: true, repeat: 'no-repeat', size: 'custom', position: 'center' },
//       preheaderText: '',
//       linkStyle: {
//         body: true,
//         linkColor: '#0000ee',
//         linkHoverColor: '#0000ee',
//         linkUnderline: true,
//         linkHoverUnderline: true,
//       },
//       _meta: { htmlID: 'u_body', htmlClassNames: 'u_body' },
//     },
//   },
//   schemaVersion: 16,
// }

/**
 * Build a professional email design based on comprehensive business analysis data
 * @param {Object} summaryData - The complete business analysis object
 * @returns {Object} Email design configuration object
 */
function buildBusinessEmail(summaryData) {
  // ═══════════════════════════════════════════════════════════════
  // EXTRACT BUSINESS DATA
  // ═══════════════════════════════════════════════════════════════

  const analysis = summaryData?.data?.analysis || {};

  // Brand Information
  const brandName = analysis?.business_overview?.brand_name || "Your Brand";
  const legalName = analysis?.business_overview?.legal_name || "";
  const businessType = analysis?.business_overview?.business_type || "B2B SaaS";
  const valueProposition = analysis?.business_overview?.core_value_proposition ||
    "AI-powered business intelligence and marketing automation";

  // Logo & Visual Assets
  const logoUrl = analysis?.branding_guidelines?.logo_url || "";

  // Brand Colors (using the actual Borade AI palette)
  // const brandColors = {
  //   primaryGray: "#9CA3AF",      // Light gray - primary
  //   darkCharcoal: "#1F2631",     // Dark charcoal - secondary
  //   deepPlum: "#352826",         // Deep plum - accent
  //   warmAmber: "#E5873A",        // Warm amber - highlight
  //   lightBg: "#F3F4F6",          // Light background
  //   darkBg: "#111827",           // Dark footer background
  //   textLight: "#D1D5DB",        // Light text
  //   textDark: "#374151"          // Dark text
  // };

  const rawColors = analysis?.branding_guidelines?.brand_colors || [];

  // Convert ["#9CA3AF (primary...)", ...] → ["#9CA3AF", ...]
  // const parsedColors = rawColors.map(c => c.split(" ")[0]);
  const colors = rawColors?.map((item) => extractHex(item));

  const brandColors = {
    primaryGray: colors?.[0] || "#9CA3AF",
    darkCharcoal: colors?.[1] || "#1F2631",
    deepPlum: colors?.[2] || "#352826",
    warmAmber: colors?.[3] || "#E5873A",

    lightBg: "#F3F4F6",
    darkBg: "#111827",
    textLight: "#D1D5DB",
    textDark: "#374151",
  };

  // Content Strategy
  const contentPillars = analysis?.content_strategy?.content_pillars || [];
  const emotionalTriggers = analysis?.content_strategy?.emotional_triggers || [];

  // Target Personas
  const personas = analysis?.persona_specific_marketing_angles || [];
  const primaryPersona = personas[0] || {};

  // SEO & Keywords
  const primaryKeywords = analysis?.seo_performance?.keyword_analysis?.primary_keywords || [];

  // Lead Magnets
  const leadMagnets = analysis?.lead_magnet_ideas || [];
  const primaryLeadMagnet = leadMagnets[0] || {};

  // Competitive Advantages
  const competitiveAdvantages = analysis?.competitive_differentiation_matrix || {};

  // Website & Contact
  const websiteUrl = analysis?.contact_info?.website || "https://ai.mytek.in";

  const socials =
    analysis?.digital_marketing_needs?.social_links || {};

  // ═══════════════════════════════════════════════════════════════
  // BUILD EMAIL STRUCTURE
  // ═══════════════════════════════════════════════════════════════

  return {
    counters: {
      u_column: 5,
      u_row: 5,
      u_content_text: 8,
      u_content_button: 2,
      u_content_image: 2,
      u_content_divider: 1,
    },

    body: {
      id: "body",
      rows: [

        // ═══════════════════════════════════════════════════════════
        // HEADER SECTION - Professional brand header
        // ═══════════════════════════════════════════════════════════
        {
          id: "header-row",
          cells: [1],
          columns: [
            {
              id: "header-col",
              contents: [
                // Logo
                {
                  id: "logo-image",
                  type: "image",
                  values: {
                    src: {
                      url: logoUrl,
                      width: 200,
                      height: "auto",
                    },
                    altText: brandName,
                    textAlign: "center",
                    containerPadding: "30px 20px 10px 20px",
                    maxWidth: "120px",
                    _meta: {
                      htmlID: "u_content_image_1",
                      htmlClassNames: "u_content_image"
                    }
                  },
                },

                // Brand Title & Tagline
                {
                  id: "brand-header-text",
                  type: "text",
                  values: {
                    textAlign: "center",
                    containerPadding: "0px 20px 30px 20px",
                    // <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">
                    //   ${brandName}
                    // </h1>
                    text: `
                      <p style="margin:8px 0 0;color:${brandColors.textLight};font-size:14px;line-height:1.6;">
                        ${valueProposition}
                      </p>
                    `,
                    _meta: {
                      htmlID: "u_content_text_1",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },
              ],
              values: {
                backgroundColor: brandColors.darkCharcoal,
                padding: "0px",
                border: {}
              },
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════
        // MAIN CONTENT SECTION
        // ═══════════════════════════════════════════════════════════
        {
          id: "content-row",
          cells: [1],
          columns: [
            {
              id: "content-col",
              contents: [

                // Personalized Greeting
                {
                  id: "greeting-text",
                  type: "text",
                  values: {
                    containerPadding: "40px 30px 20px 30px",
                    text: `
                      <p style="margin:0;color:${brandColors.textDark};font-size:16px;line-height:1.6;">
                        Hi {{firstName}},
                      </p>
                    `,
                    _meta: {
                      htmlID: "u_content_text_2",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },

                // Main Hook (using emotional triggers and pain points)
                {
                  id: "hook-text",
                  type: "text",
                  values: {
                    containerPadding: "10px 30px 20px 30px",
                    text: `
                      <p style="margin:0 0 16px;color:${brandColors.textDark};font-size:16px;line-height:1.8;">
                        ${emotionalTriggers[0] || "What if you could transform your entire marketing strategy with AI?"}
                      </p>
                      
                      <p style="margin:0 0 16px;color:${brandColors.textDark};font-size:16px;line-height:1.8;">
                        ${brandName} analyzes your business, identifies SEO gaps, tracks competitors, 
                        and builds a complete growth strategy<strong style="color:${brandColors.warmAmber};"></strong>.
                      </p>
                      
                      <p style="margin:0;color:${brandColors.textDark};font-size:16px;line-height:1.8;">
                        ${competitiveAdvantages.transparency_advantage || "No sign-in required. No lengthy setup. Just results."}
                      </p>
                    `,
                    _meta: {
                      htmlID: "u_content_text_3",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },

                // Value Propositions (Key Features)
                {
                  id: "features-text",
                  type: "text",
                  values: {
                    containerPadding: "20px 30px 30px 30px",
                    text: `
                      <div style="background-color:${brandColors.lightBg};padding:24px;border-radius:8px;border-left:4px solid ${brandColors.warmAmber};">
                        <p style="margin:0 0 12px;color:${brandColors.textDark};font-size:15px;line-height:1.6;">
                          <strong style="color:${brandColors.darkCharcoal};">✓</strong> AI-powered business intelligence & competitor analysis
                        </p>
                        <p style="margin:0 0 12px;color:${brandColors.textDark};font-size:15px;line-height:1.6;">
                          <strong style="color:${brandColors.darkCharcoal};">✓</strong> Automated content generation with brand voice
                        </p>
                        <p style="margin:0 0 12px;color:${brandColors.textDark};font-size:15px;line-height:1.6;">
                          <strong style="color:${brandColors.darkCharcoal};">✓</strong> Multi-platform social media automation (LinkedIn, Instagram, YouTube)
                        </p>
                        <p style="margin:0;color:${brandColors.textDark};font-size:15px;line-height:1.6;">
                          <strong style="color:${brandColors.darkCharcoal};">✓</strong> ${competitiveAdvantages.speed_advantage || "Real-time SEO audit and growth recommendations"}
                        </p>
                      </div>
                    `,
                    _meta: {
                      htmlID: "u_content_text_4",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },

                // Primary CTA Button
                {
                  id: "primary-cta",
                  type: "button",
                  values: {
                    text: `<span style="font-size:16px;font-weight:600;">${primaryLeadMagnet.title || "Start Your Free AI Analysis"}</span>`,
                    href: {
                      name: "web",
                      values: {
                        href: "{{ctaUrl}}",
                        target: "_blank",
                      },
                    },
                    buttonColors: {
                      color: "#ffffff",
                      backgroundColor: brandColors.warmAmber,
                      hoverColor: "#ffffff",
                      hoverBackgroundColor: "#D47629"
                    },
                    textAlign: "center",
                    padding: "16px 40px",
                    borderRadius: "8px",
                    containerPadding: "10px 30px 20px 30px",
                    _meta: {
                      htmlID: "u_content_button_1",
                      htmlClassNames: "u_content_button"
                    }
                  },
                },

                // Secondary Value Statement
                {
                  id: "secondary-value",
                  type: "text",
                  values: {
                    textAlign: "center",
                    containerPadding: "10px 30px 40px 30px",
                    text: `
                      <p style="margin:0;color:${brandColors.primaryGray};font-size:13px;line-height:1.6;">
                        ${competitiveAdvantages.pricing_advantage || "All-in-one platform replacing 5+ separate tools"}
                      </p>
                    `,
                    _meta: {
                      htmlID: "u_content_text_5",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════
        // SOCIAL PROOF / TRUST SECTION (Optional)
        // ═══════════════════════════════════════════════════════════
        {
          id: "trust-row",
          cells: [1],
          columns: [
            {
              id: "trust-col",
              contents: [
                {
                  id: "trust-text",
                  type: "text",
                  values: {
                    textAlign: "center",
                    containerPadding: "30px 30px 30px 30px",
                    text: `
                      <p style="margin:0 0 16px;color:${brandColors.textDark};font-size:14px;font-weight:600;">
                        Trusted by ${businessType} Companies Worldwide
                      </p>
                      <p style="margin:0;color:${brandColors.primaryGray};font-size:13px;line-height:1.6;">
                        Join marketing directors, agency owners, and growth managers who are transforming 
                        their strategies with AI-powered intelligence.
                      </p>
                    `,
                    _meta: {
                      htmlID: "u_content_text_6",
                      htmlClassNames: "u_content_text"
                    }
                  },
                },
              ],
              values: {
                backgroundColor: brandColors.lightBg,
                padding: "0px",
              },
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════
        // DIVIDER
        // ═══════════════════════════════════════════════════════════
        {
          id: "divider-row",
          cells: [1],
          columns: [
            {
              id: "divider-col",
              contents: [
                {
                  id: "divider",
                  type: "divider",
                  values: {
                    width: "100%",
                    border: {
                      borderTopWidth: "1px",
                      borderTopStyle: "solid",
                      borderTopColor: brandColors.primaryGray
                    },
                    containerPadding: "0px",
                    _meta: {
                      htmlID: "u_content_divider_1",
                      htmlClassNames: "u_content_divider"
                    }
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
              },
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════
        // FOOTER SECTION - Professional footer with legal info
        // ═══════════════════════════════════════════════════════════
        //     {
        //       id: "footer-row",
        //       cells: [1],
        //       columns: [
        //         {
        //           id: "footer-col",
        //           contents: [

        //             // Footer Branding
        //             {
        //               id: "footer-brand",
        //               type: "text",
        //               values: {
        //                 textAlign: "center",
        //                 containerPadding: "30px 20px 10px 20px",
        //                 text: `
        //                   <p style="margin:0;color:${brandColors.textLight};font-size:16px;font-weight:600;">
        //                     ${brandName}
        //                   </p>
        //                 `,
        //                 _meta: {
        //                   htmlID: "u_content_text_7",
        //                   htmlClassNames: "u_content_text"
        //                 }
        //               },
        //             },

        //             // Footer Description
        //             {
        //               id: "footer-description",
        //               type: "text",
        //               values: {
        //                 textAlign: "center",
        //                 containerPadding: "10px 30px 20px 30px",
        //                 text: `
        //                   <p style="margin:0;color:${brandColors.primaryGray};font-size:13px;line-height:1.6;">
        //                     AI-powered business intelligence and marketing automation for modern teams
        //                   </p>
        //                 `,
        //                 _meta: {
        //                   htmlID: "u_content_text_8",
        //                   htmlClassNames: "u_content_text"
        //                 }
        //               },
        //             },

        //             // Footer Links
        //             {
        //               id: "footer-links",
        //               type: "text",
        //               values: {
        //                 textAlign: "center",
        //                 containerPadding: "10px 20px 20px 20px",
        //                 text: `
        //                   <p style="margin:0;font-size:13px;line-height:2;">
        //                     <a href="${websiteUrl}" style="color:${brandColors.warmAmber};text-decoration:none;">
        //                       Visit Website
        //                     </a>
        //                     <span style="color:${brandColors.primaryGray};"> | </span>
        //                     <a href="{{privacyUrl}}" style="color:${brandColors.warmAmber};text-decoration:none;">
        //                       Privacy Policy
        //                     </a>
        //                     <span style="color:${brandColors.primaryGray};"> | </span>
        //                     <a href="{{termsUrl}}" style="color:${brandColors.warmAmber};text-decoration:none;">
        //                       Terms of Service
        //                     </a>
        //                   </p>
        //                 `,
        //                 _meta: {
        //                   htmlID: "u_content_text_9",
        //                   htmlClassNames: "u_content_text"
        //                 }
        //               },
        //             },

        //             {
        //               id: "footer-socials",
        //               type: "text",
        //               values: {
        //                 textAlign: "center",
        //                 containerPadding: "0px 20px 20px 20px",
        //                 text: `
        //   <p style="margin:0;font-size:13px;line-height:1;">

        //     ${socials?.linkedin ? `
        //       <a href="${socials.linkedin}" target="_blank" style="margin:0 6px;display:inline-block;">
        //         <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" 
        //              width="20" height="20" 
        //              style="display:inline-block;border:none;" 
        //              alt="LinkedIn" />
        //       </a>
        //     ` : ""}

        //     ${socials?.instagram ? `
        //       <a href="${socials.instagram}" target="_blank" style="margin:0 6px;display:inline-block;">
        //         <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" 
        //              width="20" height="20" 
        //              style="display:inline-block;border:none;" 
        //              alt="Instagram" />
        //       </a>
        //     ` : ""}

        //     ${socials?.youtube ? `
        //       <a href="${socials.youtube}" target="_blank" style="margin:0 6px;display:inline-block;">
        //         <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" 
        //              width="20" height="20" 
        //              style="display:inline-block;border:none;" 
        //              alt="YouTube" />
        //       </a>
        //     ` : ""}

        //     ${socials?.facebook ? `
        //       <a href="${socials.facebook}" target="_blank" style="margin:0 6px;display:inline-block;">
        //         <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" 
        //              width="20" height="20" 
        //              style="display:inline-block;border:none;" 
        //              alt="Facebook" />
        //       </a>
        //     ` : ""}

        //     ${socials?.twitter ? `
        //       <a href="${socials.twitter}" target="_blank" style="margin:0 6px;display:inline-block;">
        //         <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" 
        //              width="20" height="20" 
        //              style="display:inline-block;border:none;" 
        //              alt="Twitter" />
        //       </a>
        //     ` : ""}

        //   </p>
        // `,
        //                 _meta: {
        //                   htmlID: "u_content_text_social",
        //                   htmlClassNames: "u_content_text"
        //                 }
        //               },
        //             },

        //             // Legal & Company Info
        //             {
        //               id: "footer-legal",
        //               type: "text",
        //               values: {
        //                 textAlign: "center",
        //                 containerPadding: "10px 30px 20px 30px",
        //                 text: `
        //                   <p style="margin:0 0 8px;font-size:12px;color:${brandColors.primaryGray};line-height:1.6;">
        //                     You're receiving this email because you interacted with ${brandName}.
        //                   </p>

        //                   <p style="margin:0 0 8px;font-size:12px;color:${brandColors.primaryGray};line-height:1.6;">
        //                     © ${new Date().getFullYear()} ${legalName || brandName}. All rights reserved.
        //                   </p>
        //                 `,
        //                 _meta: {
        //                   htmlID: "u_content_text_10",
        //                   htmlClassNames: "u_content_text"
        //                 }
        //               },
        //             },

        //           ],
        //           values: {
        //             backgroundColor: brandColors.darkBg,
        //             padding: "0px",
        //           },
        //         },
        //       ],
        //     },

        // ═══════════════════════════════════════════════════════════
        // FOOTER SECTION - DYNAMIC STATIC Footer 
        // ═══════════════════════════════════════════════════════════
        // {
        //   id: "footer-row",
        //   cells: [1],
        //   columns: [
        //     {
        //       id: "footer-col",
        //       contents: [

        //         // ───────── STATIC COMPLIANCE FOOTER ─────────
        //         {
        //           id: "footer-static",
        //           type: "text",
        //           values: {
        //             textAlign: "center",
        //             containerPadding: "25px 30px 30px 30px",
        //             text: `
        //       <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};line-height:1.6;">
        //         This email was sent by <strong>${brandName}</strong>.
        //       </p>

        //       <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};line-height:1.6;">
        //         © ${new Date().getFullYear()} ${legalName || brandName}. All rights reserved.
        //       </p>

        //       <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};line-height:1.6;">
        //         ${brandName} • ${analysis?.contact_info?.address || ""}
        //       </p>

        //       <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};line-height:1.6;">
        //         This message was delivered using the <strong>BoradeAI</strong> marketing automation platform on behalf of <strong>${brandName}</strong>.
        //       </p>

        //       <p style="margin:0;font-size:12px;line-height:1.6;text-decoration:underline;">
        //           Unsubscribe
        //       </p>
        //     `,

        //             // 🔒 LOCK EVERYTHING
        //             selectable: false,
        //             draggable: false,
        //             duplicatable: false,
        //             deletable: false,
        //             hideable: false,

        //             _meta: {
        //               htmlID: "u_content_footer_static",
        //               htmlClassNames: "u_content_text locked-footer"
        //             }
        //           },
        //         },

        //       ],

        //       values: {
        //         backgroundColor: brandColors.lightBg,
        //         padding: "0px",

        //         // 🔒 LOCK COLUMN
        //         selectable: false,
        //         draggable: false,
        //         duplicatable: false,
        //         deletable: false,
        //       },
        //     },
        //   ],

        //   values: {
        //     // 🔒 LOCK ROW
        //     selectable: false,
        //     draggable: false,
        //     duplicatable: false,
        //     deletable: false,
        //   },
        // }
      ],

      // ═══════════════════════════════════════════════════════════
      // GLOBAL EMAIL SETTINGS
      // ═══════════════════════════════════════════════════════════
      values: {
        contentWidth: "600px",
        backgroundColor: brandColors.primaryGray,
        fontFamily: {
          label: "Sora",
          value: "Sora, 'Helvetica Neue', Arial, sans-serif",
        },
        textColor: brandColors.textDark,
        linkStyle: {
          color: brandColors.warmAmber,
          underline: true,
          inherit: false
        },
        _meta: {
          htmlID: "u_body",
          htmlClassNames: "u_body"
        }
      },
    },

    schemaVersion: 16,
  };
}

function convertHtmlToSafeDesign(html) {
  return {
    schemaVersion: 16,
    body: {
      rows: [
        {
          id: "html-import-row",
          cells: [1],
          columns: [
            {
              id: "html-import-col",
              contents: [
                {
                  id: "html-import-block",
                  type: "html",
                  values: {
                    html: html,
                  },
                },
              ],
              values: {
                backgroundColor: "#ffffff",
                padding: "0px",
              },
            },
          ],
          values: {
            backgroundColor: "#ffffff",
          },
        },
      ],
    },
  }
}

/**
/**
 * Extract CSS properties from the full HTML's <style> block.
 */
function extractTemplateStyles(fullHtml, design = null) {
  const r = {
    bodyBg: design?.body?.values?.backgroundColor || null,
    textColor: design?.body?.values?.textColor || null,
    containerBg: null,
    headerBg: null
  };

  if (fullHtml) {
    const m = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (m) {
      const css = m[1];
      const pick = (re) => { const x = css.match(re); return x ? x[1].trim() : null; };
      r.bodyBg = pick(/body\s*\{[^}]*background(?:-color)?\s*:\s*([^;!}]+)/i) || r.bodyBg;
      r.textColor = pick(/body\s*\{[^}]*(?:^|;)\s*color\s*:\s*([^;!}]+)/i) || r.textColor;
      r.containerBg = pick(/\.container\s*\{[^}]*background(?:-color)?\s*:\s*([^;!}]+)/i) || r.containerBg;

      const hdrMatch = css.match(/\.header\s*\{([^}]*)\}/i);
      if (hdrMatch) {
        const hex = hdrMatch[1].match(/background(?:-color)?\s*:\s*([^;!}]+)/i);
        r.headerBg = hex ? hex[1].trim() : r.containerBg;
      }
    }

    if (!r.bodyBg) {
      const bodyBgMatch = fullHtml.match(/<body[^>]*style=["'][^"']*background(?:-color)?\s*:\s*([^;!"']+)/i)
        || fullHtml.match(/<table[^>]*style=["'][^"']*background(?:-color)?\s*:\s*([^;!"']+)/i);
      if (bodyBgMatch) r.bodyBg = bodyBgMatch[1].trim();
    }

    if (!r.textColor) {
      const textColorMatch = fullHtml.match(/<body[^>]*style=["'][^"']*color\s*:\s*([^;!"']+)/i)
        || fullHtml.match(/<table[^>]*style=["'][^"']*color\s*:\s*([^;!"']+)/i)
        || fullHtml.match(/<td[^>]*style=["'][^"']*color\s*:\s*([^;!"']+)/i)
        || fullHtml.match(/<p[^>]*style=["'][^"']*color\s*:\s*([^;!"']+)/i);
      if (textColorMatch) r.textColor = textColorMatch[1].trim();
    }
  }

  r.bodyBg = r.bodyBg || "#0f1419";
  r.textColor = r.textColor || "#e5e7eb";
  r.containerBg = r.containerBg || "#1f2631";
  r.headerBg = r.headerBg || r.containerBg;

  return r;
}

/**
 * Converts AI design JSON into native Unlayer blocks (image, text, button)
 * grouped into container rows with perfect padding and colors.
 */
function patchAIDesignForUnlayer(design, fullHtml) {
  if (!design?.body?.rows) return convertHtmlToSafeDesign(fullHtml || "");

  const sp = extractTemplateStyles(fullHtml, design);
  const headerBg = sp.headerBg || sp.containerBg || "#1f2631";
  const contentBg = sp.containerBg || "#1f2631";

  const result = {
    schemaVersion: 16,
    body: {
      values: {
        contentWidth: "600px",
        fontFamily: { label: "Arial", value: "arial,helvetica,sans-serif" },
        textColor: sp.textColor,
        backgroundColor: sp.bodyBg,
        linkStyle: { body: false, inherit: { textDecoration: true, linkColor: true } },
        _meta: { htmlID: "u_body", htmlClassNames: "u_body" },
      },
      rows: [],
    },
  };

  const isFooter = (row) => row.id && (row.id.startsWith("footer-") || row.id === "unsubscribe-compliance-row");

  const headerRow = {
    id: "ai-header-row",
    cells: [1],
    values: { backgroundColor: "transparent", padding: "0px" },
    columns: [{
      id: "ai-header-col",
      values: { backgroundColor: headerBg, padding: "0px" },
      contents: [],
    }],
  };

  const contentRow = {
    id: "ai-content-row",
    cells: [1],
    values: { backgroundColor: "transparent", padding: "0px" },
    columns: [{
      id: "ai-content-col",
      values: { backgroundColor: contentBg, padding: "0px" },
      contents: [],
    }],
  };

  const footerRows = [];
  const contentBlocksHtml = [];

  design.body.rows.forEach((row, rIdx) => {
    if (isFooter(row)) {
      // Clean up empty blocks in the footer (like the invisible socials gap)
      if (row.columns) {
        row.columns.forEach(col => {
          if (col.contents) {
            col.contents = col.contents.filter(block => {
              if (block.type === 'text') {
                const textOnly = (block.values?.text || "").replace(/<[^>]*>/g, "").trim();
                const hasImage = (block.values?.text || "").toLowerCase().includes("<img");
                return textOnly || hasImage;
              }
              return true;
            });
          }
        });
      }
      // footerRows.push(row);
      return;
    }

    const isHeader = rIdx === 0;
    const html = row.columns?.[0]?.contents?.[0]?.values?.text || "";

    // Ignore rows with no meaningful content (empty divs stripped by Unlayer)
    const textOnly = html.replace(/<[^>]*>/g, "").trim();
    const hasImage = html.toLowerCase().includes("<img");
    const hasButton = html.toLowerCase().includes("<a") && html.toLowerCase().includes("background-color");
    if (!textOnly && !hasImage && !hasButton) return;

    if (isHeader) {
      const imgMatch = html.match(/<img\s+[^>]*src=['"]([^'"]+)['"][^>]*>/i);
      if (imgMatch) {
        headerRow.columns[0].contents.push({
          id: `ai-img-${rIdx}`, type: "image",
          values: {
            src: { url: imgMatch[1], width: 140, height: 50 },
            textAlign: "center", altText: "Logo",
            action: { name: "web", values: { href: "", target: "_blank" } },
            containerPadding: "40px 10px 10px 10px", width: "140px",
          },
        });
        const textAfter = html.replace(/<img[^>]*>/i, "").trim();
        if (textAfter) {
          headerRow.columns[0].contents.push({
            id: `ai-txt-${rIdx}`, type: "text",
            values: { text: textAfter, textAlign: "center", containerPadding: "10px 20px 40px 20px" },
          });
        }
      } else {
        headerRow.columns[0].contents.push({
          id: `ai-txt-${rIdx}`, type: "text",
          values: { text: html, textAlign: "center", containerPadding: "40px 20px 40px 20px" },
        });
      }
    } else {
      contentBlocksHtml.push(html);
    }
  });

  // Process content blocks to calculate correct padding mimicking CSS
  contentBlocksHtml.forEach((html, i) => {
    const isFirst = i === 0;
    const isLast = i === contentBlocksHtml.length - 1;

    // Simulate .content padding 40px top/bottom and .section margin-bottom 30px
    const topPad = isFirst ? "40px" : "15px";
    const botPad = isLast ? "40px" : "15px";
    const pad = `${topPad} 30px ${botPad} 30px`;

    const isCTA = html.includes("background-color") && /<a\s/.test(html) && !/<h[1-6]/.test(html) && !/<p[\s>]/.test(html);
    if (isCTA) {
      const btnM = html.match(/<a\s+href=['"]([^'"]+)['"][^>]*>([^<]+)<\/a>/i);
      const bg = html.match(/background-color\s*:\s*(#[0-9a-fA-F]{3,8})/i);
      const tc = html.match(/(?:^|;)\s*color\s*:\s*(#[0-9a-fA-F]{3,8})/i);
      const br = html.match(/border-radius\s*:\s*(\d+px)/i);
      if (btnM) {
        contentRow.columns[0].contents.push({
          id: `ai-btn-${i}`, type: "button",
          values: {
            href: { name: "web", values: { href: btnM[1], target: "_blank" } },
            buttonColors: {
              color: tc?.[1] || "#ffffff", backgroundColor: bg?.[1] || "#e5873a",
              hoverColor: tc?.[1] || "#ffffff", hoverBackgroundColor: bg?.[1] || "#d47830",
            },
            size: { autoWidth: true, width: "100%" },
            textAlign: "center", lineHeight: "120%",
            padding: "12px 32px", borderRadius: br?.[1] || "6px",
            text: `<strong><span style="font-size:14px;">${btnM[2].trim()}</span></strong>`,
            containerPadding: pad,
            calculatedWidth: 250, calculatedHeight: 42,
          },
        });
        return;
      }
    }

    contentRow.columns[0].contents.push({
      id: `ai-txt-c${i}`, type: "text",
      values: {
        text: html,
        textAlign: "left",
        containerPadding: pad,
      },
    });
  });

  if (headerRow.columns[0].contents.length > 0) result.body.rows.push(headerRow);
  if (contentRow.columns[0].contents.length > 0) result.body.rows.push(contentRow);
  result.body.rows.push(...footerRows);

  return result;
}

function normalizeDesignForEditor(design) {
  if (!design?.body?.rows) return design;

  const cloned = JSON.parse(JSON.stringify(design));

  cloned.schemaVersion = 16;

  cloned.body.rows = cloned.body.rows.map((row, rowIndex) => {

    row.id = row.id || `u_row_${rowIndex + 1}`;

    row.columns = (row.columns || []).map((col, colIndex) => {

      col.id = col.id || `u_column_${rowIndex + 1}_${colIndex + 1}`;

      col.contents = (col.contents || []).map((content, contentIndex) => {

        // preserve native blocks exactly
        if (
          content.type === "text" ||
          content.type === "image" ||
          content.type === "button" ||
          content.type === "divider"
        ) {

          content.id =
            content.id ||
            `u_content_${content.type}_${rowIndex + 1}_${contentIndex + 1}`;

          content.values = {
            ...(content.values || {}),
          };

          // ensure meta
          content.values._meta = {
            htmlID: content.id,
            htmlClassNames: `u_content_${content.type}`,
            ...(content.values?._meta || {}),
          };

          return content;
        }

        // convert unsupported blocks into text safely
        return {
          id: `u_content_text_${rowIndex + 1}_${contentIndex + 1}`,
          type: "text",
          values: {
            text:
              content?.values?.text ||
              content?.values?.html ||
              "<p></p>",
            containerPadding: "10px 30px",
            textAlign: "left",
            _meta: {
              htmlID: `u_content_text_${rowIndex + 1}_${contentIndex + 1}`,
              htmlClassNames: "u_content_text",
            },
          },
        };
      });

      return col;
    });

    return row;
  });

  return cloned;
}

/**
 * Adds a locked, non-editable unsubscribe row to the design if not already present.
 * Used for compliance in both create and edit flows.
 */
function ensureUnsubscribeRow(design, refetchSummary, summaryData) {
  if (!design?.body?.rows) return design;
  refetchSummary()
  const analysis = summaryData?.data?.analysis || {};
  const companyName = analysis?.business_overview?.brand_name || analysis?.business_overview?.legal_name || "the business";
  const address = analysis?.contact_info?.address || "";


  // Check if any unsubscribe/compliance row already exists
  const hasUnsubscribe = design.body.rows.some(
    (row) =>
      row.id === "unsubscribe-compliance-row" ||
      row.id === "footer-compliance-row"
  );

  if (!hasUnsubscribe) {
    design.body.rows.push({
      id: "unsubscribe-compliance-row",
      cells: [1],
      columns: [
        {
          id: "unsubscribe-col",
          contents: [
            {
              id: "unsubscribe-text",
              type: "text",
              values: {
                textAlign: "center",
                containerPadding: "15px 30px 20px 30px",
                text: `
 <p style="margin:0;font-size:12px;color:#666666;line-height:1.8;text-align:center;">
  This email was sent by 
  <strong>${companyName}</strong>.
</p>

<p style="margin:6px 0 0;font-size:12px;color:#666666;line-height:1.8;text-align:center;">
  ${companyName}
  ${address ? `• ${address}` : ""}
</p>

<p style="margin:6px 0 0;font-size:12px;color:#666666;line-height:1.8;text-align:center;">
  This message was delivered using the 
  <strong>BoradeAI</strong> marketing automation platform on behalf of 
  <strong>${companyName}</strong>.
</p>

<p style="margin:6px 0 0;font-size:12px;color:#666666;line-height:1.8;text-align:center;">
  If you no longer wish to receive communications from 
  <strong>${companyName}</strong>, 
  you may 
 <p
  style="
    display:inline;
    margin:0;
    color:#2563eb;
  "
>
  unsubscribe here
</p>
</p>
`,
                // 🔒 LOCKED — not editable by user
                selectable: false,
                draggable: false,
                duplicatable: false,
                deletable: false,
                hideable: false,
              },
            },
          ],
          values: {
            backgroundColor: "#f3f4f6",
            padding: "0px",
            selectable: false,
            draggable: false,
            duplicatable: false,
            deletable: false,
          },
        },
      ],
      values: {
        selectable: false,
        draggable: false,
        duplicatable: false,
        deletable: false,
      },
    });
  }

  return design;
}

// function prepareDesign({ design, html, isEdit, STARTER_DESIGN }) {
//   let finalDesign = sanitizeUnlayerDesign(design);

//   if (!finalDesign) {
//     if (!isEdit) return STARTER_DESIGN;

//     return {
//       schemaVersion: 16,
//       body: {
//         rows: [
//           {
//             cells: [1],
//             columns: [
//               {
//                 contents: [
//                   {
//                     type: "text",
//                     values: {
//                       text: html,
//                       containerPadding: "10px",
//                     },
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     };
//   }

//   finalDesign = enhanceDesignWithHeuristics(finalDesign, html);

//   return finalDesign;
// }

function prepareDesign({
  design,
  html,
  isEdit,
  STARTER_DESIGN,
  brandName,
  brandColors,
  legalName,
  analysis,
}) {
  let finalDesign = sanitizeUnlayerDesign(design);

  // ❌ NO VALID DESIGN
  if (!finalDesign) {
    if (!isEdit) return STARTER_DESIGN;

    finalDesign = {
      schemaVersion: 16,
      body: {
        rows: [
          {
            id: "fallback-row",
            cells: [1],
            columns: [
              {
                id: "fallback-col",
                contents: [
                  {
                    id: "fallback-text",
                    type: "html", // ✅ IMPORTANT (not text)
                    values: {
                      html: html,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    };
  }

  // ✅ Enhance design (your existing logic)
  finalDesign = enhanceDesignWithHeuristics(finalDesign, html);

  // ✅ ADD FOOTER SAFELY (NO DUPLICATES)
  const alreadyHasFooter = finalDesign.body.rows.some(
    (row) => row.id === "footer-compliance-row"
  );

  if (!alreadyHasFooter) {
    const year = new Date().getFullYear();

    finalDesign.body.rows.push({
      id: "footer-compliance-row",
      cells: [1],
      columns: [
        {
          id: "footer-compliance-col",
          contents: [
            {
              id: "footer-static",
              type: "text",
              values: {
                textAlign: "center",
                containerPadding: "25px 30px 30px 30px",
                text: `
                  <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};">
                    This email was sent by <strong>${brandName}</strong>.
                  </p>

                  <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};">
                    © ${year} ${legalName || brandName}. All rights reserved.
                  </p>

                  <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};">
                    ${brandName} • ${analysis?.contact_info?.address || ""}
                  </p>

                  <p style="margin:0 0 10px;font-size:12px;color:${brandColors?.darkBg};">
                    This message was delivered using the <strong>BoradeAI</strong> platform.
                  </p>

                  <p style="margin:0;font-size:12px;text-decoration:underline;">
                    Unsubscribe
                  </p>
                `,

                // 🔒 LOCK
                selectable: false,
                draggable: false,
                duplicatable: false,
                deletable: false,
                hideable: false,
              },
            },
          ],
          values: {
            backgroundColor: brandColors?.lightBg,
            padding: "0px",

            // 🔒 LOCK COLUMN
            selectable: false,
            draggable: false,
            duplicatable: false,
            deletable: false,
          },
        },
      ],
      values: {
        // 🔒 LOCK ROW
        selectable: false,
        draggable: false,
        duplicatable: false,
        deletable: false,
        hideable: false,
      },
    });
  }

  return finalDesign;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function TemplateDrawer({ template, onClose }) {
  const { isDark } = useTheme()
  const isEdit = Boolean(template?._id)

  // Mobile UI
  const [mobilePanel, setMobilePanel] = useState('canvas')

  // ── Form state
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [design, setDesign] = useState(null)

  const [newFiles, setNewFiles] = useState([])
  const [existingAttachments, setExistingAttachments] = useState([])
  const [removedKeys, setRemovedKeys] = useState([])

  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [editorReady, setEditorReady] = useState(false)

  // ── Success screen state
  const [savedInfo, setSavedInfo] = useState(null)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const reduxUser = useSelector((state) => state.auth?.user)

  // ── Editor Options
  const editorOptions = useMemo(() => ({
    appearance: {
      theme: isDark ? 'dark' : 'light',
    },
    features: {
      imageEditor: true,
      undoRedo: true,
      stockImages: true,
      smartMergeTags: true,
      textEditor: {
        mergeTags: true,
      },
    },
  }), [isDark]);

  // ── Refs
  const emailEditorRef = useRef(null)
  const nameRef = useRef('')
  const subjectRef = useRef('')

  useEffect(() => {
    nameRef.current = name
  }, [name])
  useEffect(() => {
    subjectRef.current = subject
  }, [subject])

  // ── RTK Query
  const [createTemplate, { isLoading: isCreating }] =
    useCreateEmailTemplateMutation()
  const [updateEmailTemplate, { isLoading: isUpdating }] =
    useUpdateEmailTemplateMutation()

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useGetMyBusinessDetailSummaryQuery()

  const STARTER_DESIGN = buildBusinessEmail(summaryData)

  const isSaving = isCreating || isUpdating

  // ── Derived variables
  const variables = useMemo(() => {
    const extracted = extractVariables(html);
    return Array.from(new Set([...extracted, "email"]));
  }, [html]);

  // console.log("variables", editorReady ? variables : "Loading")

  // ── Sync form when template prop changes
  useEffect(() => {
    queueMicrotask(() => {
      if (template) {
        setName(template.name ?? '')
        setSubject(template.subject ?? '')
        setHtml(template.html ?? '')
        setDesign(template.design ? JSON.parse(template.design) : null)
        setExistingAttachments(template.attachments ?? [])
      } else {
        setName('')
        setSubject('')
        setHtml('')
        setDesign(null)
        setExistingAttachments([])
      }
      setNewFiles([])
      setRemovedKeys([])
      setErrors({})
      setError('')
      setEditorReady(false)
      setSavedInfo(null)
      setMobilePanel('canvas')
    })
  }, [template])

  // ── Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])



  useEffect(() => {
    if (editorReady && emailEditorRef.current?.editor) {
      const newMergeTags = variables.reduce((acc, v) => {
        acc[v] = {
          name: v,
          value: `{{${v}}}`,
          sample: `Sample ${v}`
        };
        return acc;
      }, {});
      emailEditorRef.current.editor.setMergeTags(newMergeTags);
    }
  }, [variables, editorReady]);

  // ── Unlayer ready handler
  const onReady = (unlayer) => {
    const updateHtml = () => {
      unlayer.exportHtml((data) => {
        console.log("data", data)
        setHtml(data.html || "")
      })
    }

    unlayer.addEventListener("design:updated", updateHtml)
    unlayer.addEventListener("design:loaded", updateHtml)

    let finalDesign;

    // Parse design directly from the template prop (not state) to avoid
    // queueMicrotask timing issues — the template prop is always available.
    const templateDesign = template?.design
      ? (typeof template.design === "string" ? JSON.parse(template.design) : template.design)
      : null;
    const templateHtml = template?.html || "";
    const analysis = summaryData?.data?.analysis || {};
    if (isEdit) {
      // ── EDITING ──
      // Detect genuine Unlayer editor exports by checking for `counters`.
      // Unlayer ONLY adds `counters` when a design is exported from the editor.
      // AI/backend generated designs never have this field.
      const isUnlayerExport = templateDesign?.counters && templateDesign?.body?.rows;


      // if (isUnlayerExport) {
      //   // Design was previously saved from the Unlayer editor → load directly
      //   finalDesign = templateDesign;
      //   console.log("isUnlayerExport if", isUnlayerExport)
      //   console.log("templateDesign if", templateDesign)
      // } else if (templateDesign?.body?.rows) {
      //   // AI/backend generated design — patch with CSS colors + convert text→html.
      //   // Pass the full template HTML so we can extract <style> block colors.
      //   // finalDesign = patchAIDesignForUnlayer(templateDesign, templateHtml);
      //   finalDesign = normalizeDesignForEditor(templateDesign);
      //   console.log("isUnlayerExport else", isUnlayerExport)
      //   console.log("templateDesign else", templateDesign)
      // } else if (templateHtml) {
      //   // No design JSON at all (legacy template) → wrap HTML in editable block
      //   finalDesign = convertHtmlToSafeDesign(templateHtml);
      //   console.log("isUnlayerExport else if 2", isUnlayerExport)
      //   console.log("templateDesign else if 2", templateDesign)
      // } else {
      //   finalDesign = STARTER_DESIGN;
      //   console.log("isUnlayerExport else", isUnlayerExport)
      //   console.log("templateDesign else", templateDesign)
      // }

      if (isUnlayerExport) {
        finalDesign = templateDesign;
      } else if (templateDesign?.body?.rows) {
        finalDesign = normalizeDesignForEditor(templateDesign);
      } else if (templateHtml) {
        finalDesign = convertHtmlToSafeDesign(templateHtml);
      } else {
        finalDesign = STARTER_DESIGN;
      }

      // Only add a locked unsubscribe row (not the full footer)
      ensureUnsubscribeRow(finalDesign, refetchSummary, summaryData);
    } else {
      finalDesign = STARTER_DESIGN;
      ensureUnsubscribeRow(finalDesign, refetchSummary, summaryData);
    }

    unlayer.loadDesign(finalDesign);
    setEditorReady(true);
  };

  // ── Unlayer design change handler (fallback)
  const onDesignLoad = () => {
    if (emailEditorRef.current?.editor) {
      emailEditorRef.current.editor.exportHtml((data) => {
        setHtml(data.html || '')
      })
    }
  }

  // ── Export current design
  const exportDesign = () => {
    return new Promise((resolve, reject) => {
      if (!emailEditorRef.current?.editor) {
        reject(new Error('Editor not ready'))
        return
      }

      emailEditorRef.current.editor.exportHtml((data) => {
        const { design: exportedDesign, html: exportedHtml } = data
        resolve({ design: exportedDesign, html: exportedHtml })
      })
    })
  }

  // ── Field handlers
  const handleNameChange = (e) => {
    const { value, error: err } = validateAndSanitize(e.target.value)
    setName(value)
    setErrors((p) => ({ ...p, name: err }))
  }

  const handleSubjectChange = (e) => {
    const { value, error: err } = validateAndSanitize(e.target.value)
    setSubject(value)
    setErrors((p) => ({ ...p, subject: err }))
  }

  const [newVariable, setNewVariable] = useState("");

  const addVariable = () => {
    const clean = newVariable.trim();

    if (!clean) return;

    // prevent invalid format
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      alert("Only letters, numbers, underscore allowed");
      return;
    }

    insertVariable(clean);
    setNewVariable("");
  };


  const insertVariable = (variable) => {
    if (!emailEditorRef.current?.editor) return;

    emailEditorRef.current.editor.execCommand({
      command: "insertHTML",
      value: `{{${variable}}}`,
    });
  };

  // ── Attachment handlers
  const handleFileChange = (e) =>
    setNewFiles((p) => [...p, ...Array.from(e.target.files || [])])

  const removeNewFile = (i) =>
    setNewFiles((p) => p.filter((_, idx) => idx !== i))

  const removeExistingAttachment = (key) => {
    setRemovedKeys((p) => [...p, key])
    setExistingAttachments((p) => p.filter((a) => a.key !== key))
  }

  // ── Submit
  const isFormInvalid =
    !!errors.name ||
    !!errors.subject ||
    !name.trim() ||
    !subject.trim()

  const handleSubmit = async () => {
    if (reduxUser?.isGuest) {
      setShowAuthModal(true)
      return
    }

    const currentName = nameRef.current.trim()
    const currentSubject = subjectRef.current.trim()

    if (!currentName) {
      setErrors((p) => ({ ...p, name: 'This field is required.' }))
      setError('Please fix validation errors before saving.')
      return
    }
    if (!currentSubject) {
      setErrors((p) => ({ ...p, subject: 'This field is required.' }))
      setError('Please fix validation errors before saving.')
      return
    }
    if (errors.name || errors.subject) {
      setError('Please fix validation errors before saving.')
      return
    }

    try {
      setError('')

      let { design: exportedDesign, html: exportedHtml } = await exportDesign()

      if (!exportedHtml?.trim()) {
        setError('HTML content cannot be empty.')
        return
      }

      // ✅ Remove compliance rows from design
      const COMPLIANCE_ROW_IDS = [
        'unsubscribe-compliance-row',
        'footer-compliance-row'
      ]

      if (exportedDesign?.body?.rows) {
        exportedDesign.body.rows = exportedDesign.body.rows.filter(
          (row) => !COMPLIANCE_ROW_IDS.includes(row.id)
        )
      }

      // ✅ Remove compliance footer HTML before storing
      let cleanedHtml = exportedHtml || ""

      // Remove BoradeAI compliance/footer section
      cleanedHtml = cleanedHtml.replace(
        /<p[^>]*>\s*This email was sent by[\s\S]*?unsubscribe here\s*<\/p>/gi,
        ''
      )

      // Remove empty wrappers generated after cleanup
      cleanedHtml = cleanedHtml.replace(
        /<div[^>]*>\s*<\/div>/gi,
        ''
      )

      cleanedHtml = cleanedHtml.replace(
        /<td[^>]*>\s*<\/td>/gi,
        ''
      )

      const formData = new FormData()
      formData.append('name', currentName)
      formData.append('subject', currentSubject)
      formData.append('html', cleanedHtml)
      formData.append('design', JSON.stringify(exportedDesign))

      newFiles.forEach((f) => formData.append('attachments', f))
      removedKeys.forEach((k) => formData.append('removeAttachments[]', k))

      const currentVariables = extractVariables(exportedHtml)
      const updatedVariables = currentVariables.includes('email')
        ? currentVariables
        : [...currentVariables, 'email']

      if (isEdit) {
        console.log("isEdit", isEdit)
        console.log("template._id", template._id)
        console.log("formData", Object.fromEntries(formData.entries()))
        await updateEmailTemplate({ id: template._id, body: formData }).unwrap()
      } else {
        console.log("isEdit else", isEdit)
        console.log("template._id else", template._id)
        console.log("formData else", Object.fromEntries(formData.entries()))
        await createTemplate(formData).unwrap()
      }

      setSavedInfo({ name: currentName, variables: updatedVariables })
    } catch (err) {
      setError(err?.data?.message ?? 'Failed to save template.')
    }
  }

  // ── Success screen
  if (savedInfo) {
    return createPortal(
      <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-[var(--app-pages-bg)]/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md animate-in zoom-in-95 duration-200 rounded-2xl border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full  bg-[var(--app-profile-btn-bg)]">
            <svg
              className="h-10 w-10 text-[var(--app-profile-btn-text)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h3 className="mb-2 text-2xl font-bold text-[var(--app-pages-text)]">
            Template {isEdit ? 'Updated' : 'Created'}
          </h3>
          <p className="mb-8 text-sm text-[var(--app-pages-subhead-text)]">
            <span className="font-semibold text-[var(--app-pages-text)]">
              {savedInfo.name}
            </span>{' '}
            was saved successfully and is ready to use.
          </p>

          {savedInfo.variables.length > 0 && (
            <div className="mb-8 rounded-xl border border-[var(--app-pages-border)] p-5 text-left ">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--app-brand-primary)] shadow-sm">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-[var(--app-pages-text)]">
                  Template Variables Detected
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedInfo.variables.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-3 py-1.5 font-mono text-xs font-semibold text-[var(--app-pages-text)]"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[var(--app-pages-subhead-text)]">
                💡 Download the format file to get a CSV template with these exact column headers for your mail-merge.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                downloadVariableExcel(savedInfo.name, savedInfo.variables)
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v2a2 2 0 002 2h14a2 2 0 002-2v-2"
                />
              </svg>
              Download Excel Format
            </button>
            <button
              onClick={onClose}
              className="w-full rounded-xl border-2 border-[var(--app-pages-border)] px-6 py-3 text-sm font-semibold text-[var(--app-pages-text)] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // ─────────────────────────────────────────────
  // Main drawer - PROFESSIONAL REDESIGN
  // ─────────────────────────────────────────────
  return createPortal(
    <div className="fixed inset-0 z-[1200] flex items-stretch bg-black/50 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex w-[90%] h-[90%] m-auto flex-col overflow-hidden bg-[var(--app-pages-bg)] shadow-2xl  sm:rounded-2xl sm:border sm:border-[var(--app-pages-border)]">

        {/* ═══════════════════════════════════════════
            HEADER
        ═══════════════════════════════════════════ */}
        <div className="flex shrink-0 items-center justify-between border-b bg-[var(--app-pages-bg)] px-6 py-4">
          <div className="flex items-center gap-4">
            {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div> */}
            <div>
              <h2 className="text-lg font-bold text-[var(--app-pages-text)]">
                {isEdit ? 'Edit Email Template' : 'Create Email Template'}
              </h2>
              <p className="text-xs text-[var(--app-pages-subhead-text)]">
                Professional email builder with variables & attachments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-pages-text)] transition-all hover:text-[var(--app-pages-muted)]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            ERROR BANNER
        ═══════════════════════════════════════════ */}
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl border-l-4 border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] px-4 py-3 text-sm text-[var(--app-debit-color)]">
            <svg className="mt-0.5 h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="min-w-0 flex-1">{error}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════
            MOBILE PANEL SWITCHER
        ═══════════════════════════════════════════ */}
        <div className="mx-4 mt-4 flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobilePanel('canvas')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${mobilePanel === 'canvas'
              ? 'bg-[var(--app-pages-bg)] text-[var(--app-brand-primary)]'
              : 'border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-[var(--app-pages-border)] hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)]'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editor
            </span>
          </button>
          <button
            onClick={() => setMobilePanel('details')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${mobilePanel === 'details'
              ? 'bg-[var(--app-pages-bg)] text-[var(--app-brand-primary)]'
              : 'border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] text-[var(--app-pages-text)] hover:border-[var(--app-pages-border)] hover:bg-[var(--app-pages-bg)] hover:text-[var(--app-pages-text)]'
              }`}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Details
            </span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════
            MAIN CONTENT AREA
        ═══════════════════════════════════════════ */}
        <div className="flex flex-1 overflow-hidden">

          {/* ─────────────────────────────────────────
              CANVAS - EMAIL EDITOR
          ───────────────────────────────────────── */}
          <div className={`relative flex-1 overflow-hidden bg-white dark:bg-slate-950 ${mobilePanel === 'details' ? 'hidden md:block' : ''}`}>
            {!editorReady && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-white/95 backdrop-blur-sm dark:bg-slate-950/95">
                {/* <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30">
                  <svg
                    className="h-8 w-8 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                </div> */}
                <LoaderCircle className="animate-spin text-blue-600 h-10 w-10" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    Loading Email Editor
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                    Preparing your canvas...
                  </p>
                </div>
              </div>
            )}
            <EmailEditor
              ref={emailEditorRef}
              onReady={onReady}
              onLoad={onDesignLoad}
              minHeight="100%"
              options={editorOptions}
            />
          </div>

          {/* ─────────────────────────────────────────
              RIGHT SIDEBAR - TEMPLATE DETAILS
          ───────────────────────────────────────── */}
          <div className={`flex w-full flex-col overflow-hidden border-l bg-[var(--app-pages-bg)] md:w-96 lg:w-[420px] ${mobilePanel === 'canvas' ? 'hidden md:flex' : ''}`}>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">

              {/* ─── Template Details Section ─── */}
              <div className="border-b p-6 border-[var(--app-pages-border)]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-brand-primary)]">
                    <svg className="h-4 w-4 text-[var(--app-pages-bg)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Template Details
                  </h3>
                </div>

                {/* Template Name */}
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    maxLength={50}
                    placeholder="e.g. Welcome Email Campaign"
                    onChange={handleNameChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2  ${errors.name
                      ? 'border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] focus:ring-red-200'
                      : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]'
                      }`}
                  />
                  {errors.name && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--app-debit-color)]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Subject */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Email Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={subject}
                    maxLength={100}
                    placeholder="e.g. Welcome to {{companyName}}!"
                    onChange={handleSubjectChange}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2  ${errors.name
                      ? 'border-[var(--app-debit-color)] bg-[var(--app-pages-bg)] focus:ring-red-200'
                      : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]'
                      }`}
                  />
                  {errors.subject && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-[var(--app-debit-color)]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.subject}
                    </p>
                  )}
                </div>
              </div>

              {/* ─── Attachments Section ─── */}
              <div className="border-b p-6 border-[var(--app-pages-border)]">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-pages-bg)]">
                    <svg className="h-4 w-4 text-[var(--app-pages-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Attachments
                  </h3>
                </div>

                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] px-4 py-6 text-center transition-all  hover:border-[var(--app-pages-muted)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-pages-bg)]">
                    <svg className="h-6 w-6 text-[var(--app-pages-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--app-pages-text)]">
                      Add Files
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--app-pages-subhead-text)]">
                      Click to browse or drag & drop
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {(existingAttachments.length > 0 || newFiles.length > 0) && (
                  <div className="mt-4 space-y-2">
                    {existingAttachments.map((att) => (
                      <AttachmentChip
                        key={att.key}
                        label={att.originalName}
                        onRemove={() => removeExistingAttachment(att.key)}
                      />
                    ))}
                    {newFiles.map((f, i) => (
                      <AttachmentChip
                        key={i}
                        label={f.name}
                        isNew
                        onRemove={() => removeNewFile(i)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Variables Section ─── */}
              <div className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-pages-bg)]">
                    <svg className="h-4 w-4 text-[var(--app-pages-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--app-pages-text)]">
                    Template Variables
                  </h3>
                  <span className="ml-auto rounded-full bg-[var(--app-pages-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--app-credit-color)]">
                    {variables.length}
                  </span>
                </div>

                {variables.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {variables.map((v) => (
                        <div
                          key={v}
                          className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 bg-[var(--app-pages-bg)]"
                        >
                          <code className="font-mono text-xs text-[var(--app-credit-color)]">
                            {`{{${v}}}`}
                          </code>

                          <div className="flex gap-1">
                            {/* INSERT */}
                            {/* <button
                              onClick={() => insertVariable(v)}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Insert
                            </button> */}

                            {/* COPY */}
                            <button
                              onClick={() => navigator.clipboard.writeText(`{{${v}}}`)}
                              className="text-xs px-2 py-1 border rounded"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-3">
                      <p className="text-xs leading-relaxed text-[var(--app-pages-text)]">
                        💡 <strong>Tip :</strong> Ensure your Excel/CSV file has matching column headers for each variable above to enable mail-merge functionality.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6 text-center">
                    <svg className="mx-auto h-10 w-10 text-[var(--app-pages-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <p className="mt-2 text-xs font-medium text-[var(--app-pages-text)]">
                      No variables detected yet
                    </p>
                    <p className="mt-1 text-xs text-[var(--app-pages-text)]">
                      Add {`{{variableName}}`} in your template
                    </p>
                  </div>
                )}

                {/* <div className="mb-4 flex gap-2">
                  <input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="Add variable (e.g. firstName)"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm dark:bg-slate-950"
                  />
                  <button
                    onClick={addVariable}
                    className="rounded-lg bg-green-600 px-3 py-2 text-white text-sm"
                  >
                    Add
                  </button>
                </div> */}
              </div>
            </div>

            {/* ─── Footer Actions ─── */}
            <div className="border-t border-[var(--app-pages-border)] bg-[var(--app-pages-bg)] p-6">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border-2 border-[var(--app-pages-border)] px-5 py-3 text-sm font-semibold text-[var(--app-pages-text)] transition-all hover:border-[var(--app-pages-border)] hover:bg-[var(--app-pages-bg)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || isFormInvalid || !editorReady}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--app-profile-btn-text)] bg-[var(--app-profile-btn-bg)] transition-all hover:opacity-90hover:shadow-xl hover:shadow-[var(--app-brand-primary)]/40 hover:brightness-80 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                  )}
                  {isSaving
                    ? 'Saving...'
                    : isEdit
                      ? 'Update Template'
                      : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAuthModal && (
        <DemoAnimatedAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        >
          <AuthPage onSuccess={() => setShowAuthModal(false)} />
        </DemoAnimatedAuthModal>
      )}
    </div>,
    document.body
  )
}

// ─────────────────────────────────────────────
// AttachmentChip - REDESIGNED
// ─────────────────────────────────────────────
function AttachmentChip({ label, isNew = false, onRemove }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${isNew
        ? 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]'
        : 'border-[var(--app-pages-border)] bg-[var(--app-pages-bg)]'
        }`}
      title={label}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isNew
          ? 'bg-emerald-100 dark:bg-emerald-950/40'
          : 'bg-gray-100 dark:bg-slate-800'
          }`}>
          <svg className={`h-4 w-4 ${isNew ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className={`truncate text-sm font-medium ${isNew
          ? 'text-emerald-700 dark:text-emerald-300'
          : 'text-gray-700 dark:text-slate-200'
          }`}>
          {label}
        </span>
        {isNew && (
          <span className="shrink-0 rounded-md bg-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            New
          </span>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400"
        aria-label={`Remove ${label}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
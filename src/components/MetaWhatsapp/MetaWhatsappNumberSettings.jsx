import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  RefreshCcw,
  ShieldAlert,
  PhoneCall,
  Link,
  Zap,
  Save,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
import {
  useGetNumberSettingsQuery,
  useUpdateNumberSettingsMutation,
} from '@/redux/apis/metaWhatsapp.api'

// Pixel-perfect, perfectly symmetrical Toggle Switch component
const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={`relative inline-flex shrink-0 items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div className="peer h-6 w-11 rounded-full bg-slate-200 transition-colors duration-200 dark:bg-slate-700 peer-checked:bg-emerald-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 dark:after:border-slate-600 after:bg-white after:shadow-xs after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-5 peer-checked:after:border-white"></div>
    </label>
  )
}

// Interactive Info Badge / Help Tooltip component with high Z-index stacking
const InfoBadge = ({ text, title, align = 'left' }) => {
  const [show, setShow] = useState(false)
  return (
    <div className={`relative ml-1.5 inline-flex items-center ${show ? 'z-50' : 'z-10'}`}>
      <button
        type="button"
        onClick={() => setShow(!show)}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-pointer rounded-full p-0.5 text-slate-400 outline-none transition-colors hover:text-emerald-600 dark:hover:text-emerald-400"
        title="Click for feature details"
      >
        <HelpCircle size={15} />
      </button>
      {show && (
        <div
          className={`pointer-events-none absolute top-6 z-50 w-56 rounded-lg border border-slate-700/60 bg-slate-900 p-3 text-xs text-white shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95 dark:bg-slate-800 sm:w-64 ${
            align === 'right' ? 'left-auto right-0' : 'left-0 right-auto'
          }`}
        >
          {title && (
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              {title}
            </p>
          )}
          <p className="font-normal leading-relaxed text-slate-200">{text}</p>
        </div>
      )}
    </div>
  )
}

const MetaWhatsappNumberSettings = ({
  phoneNumberId,
  selectedNumber,
  onClose,
}) => {
  const [settings, setSettings] = useState(null)
  const [savingSection, setSavingSection] = useState(null)

  const {
    data: queryData,
    isLoading,
    isError,
    refetch,
  } = useGetNumberSettingsQuery(phoneNumberId, {
    skip: !phoneNumberId,
  })
  const [updateSettings] = useUpdateNumberSettingsMutation()

  useEffect(() => {
    if (queryData?.success) {
      setSettings(queryData.settings)
    }
  }, [queryData])

  const handleSave = async (sectionKey, sectionLabel) => {
    try {
      setSavingSection(sectionKey)
      const payload = {
        phoneNumberId,
        [sectionKey]: settings[sectionKey],
      }
      const res = await updateSettings(payload).unwrap()

      if (res.success) {
        toast.success(`${sectionLabel || 'Settings'} updated successfully`)
        setSettings(res.settings)
      }
    } catch (err) {
      console.error('Settings Update Error:', err)
      const errorMessage =
        err?.data?.message ||
        err?.error ||
        err?.message ||
        'Failed to save settings.'
      toast.error(errorMessage)
    } finally {
      setSavingSection(null)
    }
  }

  const handleNestedChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev?.[section],
        [field]: value,
      },
    }))
  }

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <div className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
        <p className="text-xs font-semibold">
          Loading settings...
        </p>
      </div>
    )

  if (isError)
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-800/50 dark:bg-red-950/30">
        <p className="text-sm font-semibold">Failed to load number settings</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Check your network connection and token permissions.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 cursor-pointer rounded-lg bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300"
        >
          Retry Loading
        </button>
      </div>
    )

  if (!settings)
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
        No settings found for this phone number.
      </div>
    )

  const cardBaseCls =
    'rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col justify-between transition-all relative'
  const saveBtnCls =
    'px-3.5 py-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs hover:shadow active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0'

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200">
      {/* Header Description */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800/60">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage operational behavior, call preferences, and automated
            protection rules for this number.
          </p>
        </div>
        {selectedNumber && (
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            {selectedNumber.displayName || selectedNumber.phoneNumber}
          </span>
        )}
      </div>

      {/* Feature 1: Auto-Retry */}
      <div className={cardBaseCls}>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <RefreshCcw size={16} />
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Auto-Retry Failed Messages
                  </h4>
                  <InfoBadge
                    title="Auto-Retry Rule"
                    text="Automatically attempts to resend outbound campaign messages that fail due to temporary network timeouts or Meta server glitches within your specified retry count."
                  />
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Automatically retry campaign sends on transient network
                  failures.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.retryConfig?.enabled || false}
              onChange={(e) =>
                handleNestedChange('retryConfig', 'enabled', e.target.checked)
              }
            />
          </div>

          {settings.retryConfig?.enabled && (
            <div className="mt-3.5 grid grid-cols-1 gap-3.5 border-t border-slate-100 pt-3.5 dark:border-slate-800 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Max Retries (1-5)
                  <InfoBadge text="Number of retry attempts allowed per recipient before marking as permanently failed." />
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-colors focus:border-emerald-500 dark:border-slate-700/80 dark:bg-slate-800/60 dark:focus:border-emerald-500"
                  value={settings.retryConfig?.maxRetries || 3}
                  onChange={(e) =>
                    handleNestedChange(
                      'retryConfig',
                      'maxRetries',
                      Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Retry Window (Hours)
                  <InfoBadge align="right" text="Max duration in hours allowed for retry attempts (e.g. 24h)." />
                </label>
                <input
                  type="number"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-colors focus:border-emerald-500 dark:border-slate-700/80 dark:bg-slate-800/60 dark:focus:border-emerald-500"
                  value={settings.retryConfig?.retryWindowHours || 24}
                  onChange={(e) =>
                    handleNestedChange(
                      'retryConfig',
                      'retryWindowHours',
                      Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Integrated Card Footer */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Resends transiently failed campaign messages
          </span>
          <button
            onClick={() => handleSave('retryConfig', 'Retry Settings')}
            disabled={savingSection === 'retryConfig'}
            className={saveBtnCls}
          >
            {savingSection === 'retryConfig' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={13} />
            )}
            Save Retry Config
          </button>
        </div>
      </div>

      {/* Feature 2: Template Protection */}
      <div className={cardBaseCls}>
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 rounded-lg bg-rose-50 p-2 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <ShieldAlert size={16} />
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Template Quality Protection
                  </h4>
                  <InfoBadge
                    title="Quality Protection"
                    text="If Meta flags a message template as Low Quality (Red rating), this system automatically pauses active campaigns using that template to protect your phone number health."
                  />
                </div>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Pause campaigns automatically if template quality turns Low /
                  Red.
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.autoTemplateDisable?.enabled || false}
              onChange={(e) =>
                handleNestedChange(
                  'autoTemplateDisable',
                  'enabled',
                  e.target.checked
                )
              }
            />
          </div>
        </div>

        {/* Integrated Card Footer */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Protects number health against Red template ratings
          </span>
          <button
            onClick={() =>
              handleSave('autoTemplateDisable', 'Quality Protection')
            }
            disabled={savingSection === 'autoTemplateDisable'}
            className={saveBtnCls}
          >
            {savingSection === 'autoTemplateDisable' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={13} />
            )}
            Save Protection Config
          </button>
        </div>
      </div>

      {/* Feature 3: Voice Calling */}
      <div className={cardBaseCls}>
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-start gap-3">
            <div className="mt-0.5 shrink-0 rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <PhoneCall size={16} />
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  WhatsApp Voice Calling
                </h4>
                <InfoBadge
                  title="Voice Call Settings"
                  text="Configure inbound WhatsApp voice calling capability directly via Meta Graph API. You can toggle calls enabled and control call button visibility."
                />
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Control inbound voice calls and WhatsApp call button visibility.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5 rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Calling Capability
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none transition-colors focus:border-emerald-500 dark:border-slate-700/80 dark:bg-slate-900"
                value={settings.callSettings?.status || 'DISABLED'}
                onChange={(e) =>
                  handleNestedChange('callSettings', 'status', e.target.value)
                }
              >
                <option value="ENABLED">Enabled</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Call Icon Visibility
              </label>
              <select
                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none transition-colors focus:border-emerald-500 dark:border-slate-700/80 dark:bg-slate-900 ${
                  settings.callSettings?.status === 'DISABLED'
                    ? 'cursor-not-allowed opacity-50'
                    : ''
                }`}
                value={
                  settings.callSettings?.callIconVisibility || 'DISABLE_ALL'
                }
                onChange={(e) =>
                  handleNestedChange(
                    'callSettings',
                    'callIconVisibility',
                    e.target.value
                  )
                }
                disabled={settings.callSettings?.status === 'DISABLED'}
              >
                <option value="DEFAULT">Visible (Default)</option>
                <option value="DISABLE_ALL">Hidden (Disable All)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Integrated Card Footer */}
        <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Syncs calling preferences to Meta Cloud API
          </span>
          <button
            onClick={() => handleSave('callSettings', 'Call Settings')}
            disabled={savingSection === 'callSettings'}
            className={saveBtnCls}
          >
            {savingSection === 'callSettings' ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save size={13} />
            )}
            Update Call Settings
          </button>
        </div>
      </div>

      {/* Feature 4 & 5: Link Previews & MM Lite */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Link Previews */}
        <div className={cardBaseCls}>
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-violet-50 p-2 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                  <Link size={16} />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Link Previews
                    </h4>
                    <InfoBadge text="Renders rich website thumbnails and page titles when outbound text messages contain HTTPS URLs." />
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    Render URL preview cards in chats.
                  </p>
                </div>
              </div>

              <ToggleSwitch
                checked={settings.previewUrlEnabled ?? true}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    previewUrlEnabled: e.target.checked,
                  }))
                }
              />
            </div>
          </div>

          {/* Integrated Card Footer */}
          <div className="flex items-center justify-end rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <button
              onClick={() => handleSave('previewUrlEnabled', 'Link Previews')}
              disabled={savingSection === 'previewUrlEnabled'}
              className={saveBtnCls}
            >
              {savingSection === 'previewUrlEnabled' ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save size={12} />
              )}
              Save Previews
            </button>
          </div>
        </div>

        {/* MM Lite */}
        <div className={cardBaseCls}>
          <div className="p-4 sm:p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="flex items-center">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      MM Lite API
                    </h4>
                    <InfoBadge
                      align="right"
                      text="Meta Marketing Messages Lite route for high-throughput messaging. Must accept Meta ToS."
                    />
                  </div>
                </div>
              </div>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  settings.mmLite?.eligible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400'
                    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-400'
                }`}
              >
                {settings.mmLite?.eligible ? 'ELIGIBLE' : 'INELIGIBLE'}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Terms of Service
              </span>
              <ToggleSwitch
                checked={settings.mmLite?.tosAccepted || false}
                onChange={(e) =>
                  handleNestedChange(
                    'mmLite',
                    'tosAccepted',
                    e.target.checked
                  )
                }
              />
            </div>
          </div>

          {/* Integrated Card Footer */}
          <div className="flex items-center justify-end rounded-b-xl border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
            <button
              onClick={() => handleSave('mmLite', 'MM Lite Settings')}
              disabled={savingSection === 'mmLite'}
              className={saveBtnCls}
            >
              {savingSection === 'mmLite' ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save size={12} />
              )}
              Save MM Lite
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetaWhatsappNumberSettings

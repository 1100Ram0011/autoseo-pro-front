import React, { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'
import { useMetaConnectEmbeddedWhatsappMutation } from '@/redux/apis/metaWhatsapp.api'

export default function EmbeddedSignupLauncher({
  action,
  onComplete,
  fbReady,
}) {
  const [embeddedLoading, setEmbeddedLoading] = useState(false)

  const wabaIdRef = useRef(null)
  const phoneNumberIdRef = useRef(null)
  const embeddedCancelledRef = useRef(false)

  const [connectEmbedded] = useMetaConnectEmbeddedWhatsappMutation()

  useEffect(() => {
    const handleMessage = (event) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      )
        return

      try {
        const data =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data?.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.event && data.event.startsWith('FINISH')) {
            console.log("data.event", data.event);
            wabaIdRef.current = data.data?.waba_id ?? null
            phoneNumberIdRef.current = data.data?.phone_number_id ?? null
          } else if (data.event === 'CANCEL') {
            embeddedCancelledRef.current = true
          } else if (data.event === 'ERROR') {
            toast.error(data.data?.error_message || 'Signup error occurred')
          }
        }
      } catch (err) {}
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConnect = useCallback(() => {
    if (!fbReady || !window.FB) {
      toast.error('Facebook SDK not loaded yet. Please wait a moment.')
      return
    }

    wabaIdRef.current = null
    phoneNumberIdRef.current = null
    embeddedCancelledRef.current = false
    setEmbeddedLoading(true)

   const loginOptions = {
  config_id: process.env.NEXT_PUBLIC_FB_CONFIG_ID,
  response_type: "code",
  override_default_response_type: true,
  extras: {
    setup: {},
    version: "4",
    sessionInfoVersion: "3",
    ...(action.featureType ? { featureType: action.featureType } : {})
  },
}

    window.FB.login((response) => {
      if (!response.authResponse) {
        if (!embeddedCancelledRef.current) {
          toast.info('WhatsApp connection was cancelled.')
        }
        embeddedCancelledRef.current = false
        setEmbeddedLoading(false)
        return
      }

      const code = response.authResponse.code

      connectEmbedded({
        code,
        wabaId: wabaIdRef.current,
        phoneNumberId: phoneNumberIdRef.current,
      })
        .unwrap()
        .then(() => {
          toast.success(
            'Successfully initiated connection! Setting up your account...'
          )
          if (onComplete) onComplete()
        })
        .catch((err) => {
          toast.error(
            err?.data?.message || 'Failed to connect WhatsApp account.'
          )
        })
        .finally(() => {
          setEmbeddedLoading(false)
        })
    }, loginOptions)
  }, [fbReady, action.featureType, connectEmbedded, onComplete])

  // const [fetchCreditLineId] = useLazyTestCreditLineIdQuery()

  // const handleTestCreditLine = async () => {
  //   try {
  //     const result = await fetchCreditLineId().unwrap()
  //     if (result.creditLineId) {
  //       toast.success(`Credit Line ID: ${result.creditLineId}`)
  //     } else {
  //       toast.error('No Credit Line ID found.')
  //     }
  //     console.log('Credit Line API Response:', result)
  //   } catch (err) {
  //     toast.error(err?.data?.message || 'Failed to fetch Credit Line ID')
  //     console.error('Credit Line API Error:', err)
  //   }
  // }

  return (
    <button
      onClick={handleConnect}
      disabled={embeddedLoading || !fbReady}
      className={`group flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all ${
        embeddedLoading
          ? 'cursor-not-allowed bg-slate-50 opacity-70'
          : 'bg-white hover:border-blue-500 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-md bg-slate-50 p-2 transition-colors group-hover:bg-blue-50">
          {action.icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800">{action.title}</h4>
          <p className="text-sm text-slate-500">{action.description}</p>
        </div>
      </div>
      <div className="text-slate-400 transition-colors group-hover:text-blue-500">
        {embeddedLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        ) : (
          <ChevronRight className="h-5 w-5" />
        )}
      </div>
    </button>
  )
}

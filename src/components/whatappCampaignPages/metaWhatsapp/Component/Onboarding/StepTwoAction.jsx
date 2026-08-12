import React from 'react'
import {
  ArrowLeft,
  PlusCircle,
  Replace,
  Layers,
  Link as LinkIcon,
  DownloadCloud,
} from 'lucide-react'
import EmbeddedSignupLauncher from './EmbeddedSignupLauncher'

export default function StepTwoAction({
  currentState,
  onBack,
  onComplete,
  fbReady,
}) {
  const getActions = () => {
    switch (currentState) {
      case 'no_whatsapp':
        return [
          {
            id: 'fresh_number',
            title: 'Register a new number',
            description:
              'Start fresh with a brand new number on the official WhatsApp API.',
            icon: <PlusCircle className="h-5 w-5 text-blue-600" />,
            featureType: '',
          },
        ]
      case 'has_app':
        return [
          {
            id: 'coexistence',
            title: 'Connect existing WhatsApp Business App (keep app active)',
            description:
              'Use Borade AI and your WhatsApp Business App simultaneously on the same number.',
            icon: <Layers className="h-5 w-5 text-purple-600" />,
            featureType: 'whatsapp_business_app_onboarding',
          },
          {
            id: 'full_migration',
            title: 'Migrate from WhatsApp Business App',
            description:
              'Move completely to Borade AI. The WhatsApp app on your phone will stop working.',
            icon: <Replace className="h-5 w-5 text-orange-600" />,
            featureType: '',
          },
        ]
      case 'has_api':
        return [
          {
            id: 'bsp_migration',
            title: 'Migrate from another provider (BSP)',
            description:
              'Transfer your API number from MSG91, etc. IMPORTANT: You MUST turn off 2-Step Verification (2FA) in your current provider first!',
            icon: <DownloadCloud className="h-5 w-5 text-green-600" />,
            featureType: '',
          },
          
          {
            id: 'reconnect',
            title: 'Connect existing WhatsApp API account',
            description: 'Re-authenticate your existing Meta Cloud API setup.',
            icon: <LinkIcon className="h-5 w-5 text-teal-600" />,
            featureType: '',
          },
          
        ]
      default:
        return []
    }
  }

  const actions = getActions()

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={onBack}
          className="rounded-full p-1 transition-colors hover:bg-slate-100"
          title="Go Back"
        >
          <ArrowLeft className="h-5 w-5 text-slate-500" />
        </button>
        <h3 className="text-lg font-medium text-slate-700">
          Choose your connection method
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {actions.map((action) => (
          <EmbeddedSignupLauncher
            key={action.id}
            action={action}
            onComplete={onComplete}
            fbReady={fbReady}
          />
        ))}
      </div>
    </div>
  )
}

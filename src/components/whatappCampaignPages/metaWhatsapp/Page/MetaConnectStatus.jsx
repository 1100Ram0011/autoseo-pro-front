import { useNavigate, useSearchParams } from '@/components/react-router-dom'
import { useTheme } from '@/components/global/theme-provider'

export default function MetaConnectStatus() {
  const { isDark } = useTheme()

  const [params] = useSearchParams()

  const status = params.get('status')
  const message = params.get('message')
  const numbers = params.get('numbers')

  const navigate = useNavigate()

  const HandleRedirect = () => {
    navigate('/whatsapp')
  }

  if (status === 'success') {
    return (
      <div
        className={`whatsapp-theme ${isDark ? 'whatsapp-theme-dark bg-slate-800' : 'whatsapp-theme-light bg-slate-100'} flex h-screen items-center justify-center px-4`}
      >
        <div
          className={`rounded-xl border p-10 text-center shadow-lg ${isDark ? 'border-slate-800 bg-black text-white' : 'border-slate-200 bg-white text-slate-900 shadow-[0_18px_40px_rgba(37,99,235,0.12)]'}`}
        >
          {/* <div className="text-green-600 text-5xl mb-4">
                        ✅
                    </div> */}

          <h1 className="text-2xl font-semibold">
            WhatsApp Connected Successfully
          </h1>

          <p className={`mt-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
            {numbers} number(s) connected
          </p>

          <button
            onClick={HandleRedirect}
            className={`mt-4 rounded-md px-4 py-2 text-white ${isDark ? 'bg-blue-500' : 'bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_12px_24px_rgba(37,99,235,0.2)]'}`}
          >
            Go to Campaign
          </button>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div
        className={`whatsapp-theme ${isDark ? 'whatsapp-theme-dark bg-slate-900' : 'whatsapp-theme-light bg-slate-100'} flex h-screen items-center justify-center px-4`}
      >
        <div
          className={`rounded-xl border p-10 text-center shadow-lg ${isDark ? 'border-slate-800 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)]'}`}
        >
          <div className="mb-4 text-5xl text-red-500">❌</div>

          <h1 className="text-xl font-semibold">Connection Failed</h1>

          <p className={`mt-2 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
            {message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`whatsapp-theme ${isDark ? 'whatsapp-theme-dark bg-slate-950' : 'whatsapp-theme-light bg-slate-100'} flex h-screen items-center justify-center`}
    >
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-500"></div>

        <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
          Connecting WhatsApp...
        </p>
      </div>
    </div>
  )
}

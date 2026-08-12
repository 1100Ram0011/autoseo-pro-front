const backendBaseUrl = String((process.env.NEXT_PUBLIC_API_URL.replace('/api', '')) || '').replace(/\/+$/, '')

const isProtectedSocialImage = (url) => {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    return (
      hostname === 'instagram.com' ||
      hostname.endsWith('.instagram.com') ||
      hostname.endsWith('.cdninstagram.com') ||
      hostname.endsWith('.fbcdn.net') ||
      hostname === 'licdn.com' ||
      hostname.endsWith('.licdn.com') ||
      hostname === 'yt3.ggpht.com' ||
      hostname.endsWith('.yt3.ggpht.com') ||
      hostname.endsWith('.googleusercontent.com')
    )
  } catch {
    return false
  }
}

// Route social CDN media through the API origin. The frontend host only proxies
// this path in local Vite development; the production static host does not.
export const getProxiedSocialMediaImage = (url) => {
  if (!url || typeof url !== 'string') return url

  const imageUrl = url.trim()
  if (!imageUrl || imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
    return imageUrl
  }
  if (!isProtectedSocialImage(imageUrl)) return imageUrl

  const proxyPath = `/api/social-link-analysis/proxy-image?url=${encodeURIComponent(imageUrl)}`
  return backendBaseUrl ? `${backendBaseUrl}${proxyPath}` : proxyPath
}

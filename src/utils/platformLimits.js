import { useGetAllPlatformLimitsQuery } from '@/redux/apis/platformLimits.api'
import { useMemo } from 'react'

// Official Social Media Character Limits (Fallback)
export const PLATFORM_LIMITS_FALLBACK = {
  instagram: 2200,
  facebook: 63206, // Practically unlimited
  threads: 500,
  twitter: 280,
  linkedin: 3000,
  youtube: 5000, // Description limit
  pinterest: 500, // Description limit
}

export const PLATFORM_TITLE_LIMITS_FALLBACK = {
  youtube: 100,
  pinterest: 100,
}

/**
 * Custom hook to retrieve dynamic platform character limits.
 * Fetches from the dedicated backend PlatformLimit schema.
 * Falls back to official documented limits if not found or on error.
 */
export const usePlatformLimits = () => {
  const { data: limitsData, isLoading } = useGetAllPlatformLimitsQuery()

  const limits = useMemo(() => {
    const dynamicValues = {}
    if (limitsData?.success && Array.isArray(limitsData.data)) {
      limitsData.data.forEach((limitObj) => {
        if (limitObj.isActive) {
          dynamicValues[limitObj.platform.toLowerCase()] =
            limitObj.characterLimit
        }
      })
    }

    return {
      instagram: dynamicValues.instagram ?? PLATFORM_LIMITS_FALLBACK.instagram,
      facebook: dynamicValues.facebook ?? PLATFORM_LIMITS_FALLBACK.facebook,
      threads: dynamicValues.threads ?? PLATFORM_LIMITS_FALLBACK.threads,
      twitter: dynamicValues.twitter ?? PLATFORM_LIMITS_FALLBACK.twitter,
      linkedin: dynamicValues.linkedin ?? PLATFORM_LIMITS_FALLBACK.linkedin,
      youtube: dynamicValues.youtube ?? PLATFORM_LIMITS_FALLBACK.youtube,
      pinterest: dynamicValues.pinterest ?? PLATFORM_LIMITS_FALLBACK.pinterest,
    }
  }, [limitsData])
  const costs = useMemo(() => {
    const dynamicValues = {}
    if (limitsData?.success && Array.isArray(limitsData.data)) {
      limitsData.data.forEach((limitObj) => {
        if (limitObj.isActive) {
          dynamicValues[limitObj.platform.toLowerCase()] =
            limitObj.generationCost || 0
        }
      })
    }

    return {
      instagram: dynamicValues.instagram ?? 0,
      facebook: dynamicValues.facebook ?? 0,
      threads: dynamicValues.threads ?? 0,
      twitter: dynamicValues.twitter ?? 0,
      linkedin: dynamicValues.linkedin ?? 0,
      youtube: dynamicValues.youtube ?? 0,
      pinterest: dynamicValues.pinterest ?? 0,
    }
  }, [limitsData])

  const titleLimits = useMemo(() => {
    const dynamicValues = {}
    if (limitsData?.success && Array.isArray(limitsData.data)) {
      limitsData.data.forEach((limitObj) => {
        if (limitObj.isActive && limitObj.titleLimit > 0) {
          dynamicValues[limitObj.platform.toLowerCase()] =
            limitObj.titleLimit
        }
      })
    }

    return {
      youtube: dynamicValues.youtube ?? PLATFORM_TITLE_LIMITS_FALLBACK.youtube,
      pinterest: dynamicValues.pinterest ?? PLATFORM_TITLE_LIMITS_FALLBACK.pinterest,
    }
  }, [limitsData])

  return { limits, costs, titleLimits, isLoading }
}

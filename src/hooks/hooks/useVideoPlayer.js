import { useEffect } from 'react'

import Hls from 'hls.js'

export const useVideoPlayer = ({
  videoRef,
  src,
  isActive,
}) => {
  useEffect(() => {
    const video = videoRef.current

    if (!video || !src) return

    let hls = null

    const isHls =
      src.includes('.m3u8')

    if (isHls) {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,

          lowLatencyMode: true,

          backBufferLength: 90,
        })

        hls.loadSource(src)

        hls.attachMedia(video)
      } else if (
        video.canPlayType(
          'application/vnd.apple.mpegurl'
        )
      ) {
        video.src = src
      }
    } else {
      video.src = src
    }

    return () => {
      if (hls) {
        hls.destroy()
      }
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current

    if (!video) return

    if (isActive) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [isActive])
}
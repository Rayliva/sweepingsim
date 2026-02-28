import { useState, useRef, useEffect } from 'react'

const MUSIC_STORAGE_KEY = 'sweepingsim-music'

// Local file + SoundHelix (royalty-free). Add your own MP3s to public/audio/
const PLAYLIST = [
  { title: 'Spring', url: '/audio/spring.mp3' },
  { title: 'Summer', url: '/audio/summer.mp3' },
  { title: 'Autumn', url: '/audio/autumn.mp3' },
  { title: 'Winter', url: '/audio/winter.mp3' },
]

function loadMusicPrefs() {
  try {
    const raw = localStorage.getItem(MUSIC_STORAGE_KEY)
    if (!raw) return { index: 0, playing: false }
    const { index, playing } = JSON.parse(raw)
    const i = Math.max(0, Math.min(index, PLAYLIST.length - 1))
    return { index: i, playing: !!playing }
  } catch {
    return { index: 0, playing: false }
  }
}

function saveMusicPrefs(index, playing) {
  try {
    localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify({ index, playing }))
  } catch {
    // ignore
  }
}

export default function MusicBar() {
  const [currentIndex, setCurrentIndex] = useState(() => loadMusicPrefs().index)
  const [isPlaying, setIsPlaying] = useState(() => loadMusicPrefs().playing)
  const [error, setError] = useState(null)
  const audioRef = useRef(null)

  const currentTrack = PLAYLIST[currentIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setCurrentIndex((i) => (i + 1) % PLAYLIST.length)
    }
    const handleError = (e) => {
      setError('Could not load audio')
      setIsPlaying(false)
    }
    const handleCanPlay = () => setError(null)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)
    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [])

  useEffect(() => {
    saveMusicPrefs(currentIndex, isPlaying)
  }, [currentIndex, isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    setError(null)
    audio.src = currentTrack.url
    audio.load()
    if (isPlaying) {
      const p = audio.play()
      if (p) p.catch(() => setIsPlaying(false))
    }
  }, [currentIndex])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      setError(null)
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            setError('Playback blocked - try clicking play again')
            setIsPlaying(false)
          })
      } else {
        setIsPlaying(true)
      }
    }
  }

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % PLAYLIST.length)
    setIsPlaying(true)
  }

  const goPrev = () => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 2) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      setCurrentIndex((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length)
      setIsPlaying(true)
    }
  }

  return (
    <div className="music-bar">
      <audio ref={audioRef} preload="auto" />
      <span className="music-bar-title">{currentTrack.title}</span>
      <div className="music-bar-controls">
        <button type="button" className="music-bar-btn" onClick={goPrev} aria-label="Previous song">
          ⏮
        </button>
        <button type="button" className="music-bar-btn music-bar-btn-play" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button type="button" className="music-bar-btn" onClick={goNext} aria-label="Next song">
          ⏭
        </button>
      </div>
      <span className="music-bar-track-info">{currentIndex + 1} / {PLAYLIST.length}</span>
      {error && <span className="music-bar-error">{error}</span>}
    </div>
  )
}

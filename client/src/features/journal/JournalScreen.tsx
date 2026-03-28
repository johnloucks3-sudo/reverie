import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '@/shared/lib/api'
import BottomNav from '@/shared/ui/BottomNav'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

interface JournalEntry {
  id: number
  timestamp: string
  lat: number | null
  lon: number | null
  location_name: string | null
  note: string
  photo_links: string[]
  tags: string[]
  mood: number | null
  entry_type: string
  created_at: string
}

interface JournalResp { entries: JournalEntry[] }

const TRAVEL_EMOJIS = [
  '🌊','🚢','✈️','🌅','🏔️','🐋','🦅','🍣','🌸','🗾','🗺️','📸',
  '⚓','🌙','⭐','🍶','🏯','🎌','🌋','🦞','🐟','🌺','🏖️','⛵',
  '🌤️','🍜','🥢','🐬','🦀','🎋','💙','🍱','🌿','🎏','🏝️','😊',
]

const MOOD_LABELS = ['', 'Rough', 'Low', 'Neutral', 'Good', 'Incredible']
const MOOD_COLORS = ['', 'text-witness', 'text-ember', 'text-dusk', 'text-ether', 'text-gold']

const TAG_OPTIONS = [
  'port day', 'sea day', 'dining', 'excursion', 'sunset', 'wildlife',
  'culture', 'memory', 'gratitude', 'first time', 'milestone',
]

const ENTRY_TYPES = [
  { value: 'ad_hoc', label: 'Quick Note' },
  { value: 'port_note', label: 'Port Note' },
  { value: 'eod_debrief', label: 'End of Day' },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function JournalScreen() {
  const navigate = useNavigate()
  const noteRef = useRef<HTMLTextAreaElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  // New entry form state
  const [note, setNote] = useState('')
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lon, setLon] = useState<number | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'found' | 'denied'>('idle')
  const [mood, setMood] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [entryType, setEntryType] = useState('ad_hoc')
  const [showComposer, setShowComposer] = useState(false)

  // Photo state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Voice + emoji
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const fetchEntries = () => {
    api.get<JournalResp>('/api/journal')
      .then(r => setEntries(r.entries))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  const captureGPS = () => {
    if (!navigator.geolocation) {
      setGpsStatus('denied')
      return
    }
    setGpsStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLon(pos.coords.longitude)
        setGpsStatus('found')
      },
      () => setGpsStatus('denied'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setSelectedFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => setPhotoPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(file)
    })
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const removePhoto = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const insertEmoji = (emoji: string) => {
    const el = noteRef.current
    if (!el) { setNote(prev => prev + emoji); setShowEmojiPicker(false); return }
    const start = el.selectionStart ?? note.length
    const end = el.selectionEnd ?? note.length
    const next = note.slice(0, start) + emoji + note.slice(end)
    setNote(next)
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + emoji.length; el.focus() }, 0)
    setShowEmojiPicker(false)
  }

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return }
    const r = new SR()
    r.continuous = false
    r.interimResults = false
    r.lang = 'en-US'
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setNote(prev => prev + (prev && !prev.endsWith(' ') ? ' ' : '') + t)
    }
    r.onend = () => setIsListening(false)
    r.onerror = () => setIsListening(false)
    recognitionRef.current = r
    r.start()
    setIsListening(true)
  }

  const handleSubmit = async () => {
    if (!note.trim()) return
    setSubmitting(true)
    let photoUrls: string[] = []

    // Upload photos first
    if (selectedFiles.length > 0) {
      setUploadingPhotos(true)
      try {
        const uploads = await Promise.all(
          selectedFiles.map(file => {
            const fd = new FormData()
            fd.append('file', file)
            return api.upload<{ url: string }>('/api/journal/photo', fd)
          })
        )
        photoUrls = uploads.map(r => r.url)
      } catch {
        // Photos failed — submit without them
      } finally {
        setUploadingPhotos(false)
      }
    }

    try {
      await api.post('/api/journal', {
        note: note.trim(),
        lat,
        lon,
        location_name: locationName.trim() || null,
        tags,
        mood,
        entry_type: entryType,
        photo_links: photoUrls,
      })
      // Reset form
      setNote('')
      setLocationName('')
      setLat(null)
      setLon(null)
      setGpsStatus('idle')
      setMood(null)
      setTags([])
      setEntryType('ad_hoc')
      setSelectedFiles([])
      setPhotoPreviews([])
      setShowComposer(false)
      fetchEntries()
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (pendingDeleteId !== id) {
      setPendingDeleteId(id)
      return
    }
    setPendingDeleteId(null)
    try {
      await api.delete(`/api/journal/${id}`)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-dvh bg-vault pb-24 animate-fade-in">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-between">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/chamber')} className="text-ember hover:text-dusk transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="font-display text-gold text-xl tracking-widest font-light">AFTERGLOW</h1>
            <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mt-0.5">Journey Journal</p>
          </div>
          <div className="w-5" />
        </div>
      </div>

      {/* Compose Toggle */}
      {!showComposer && (
        <div className="px-5 pt-5">
          <button
            onClick={() => { setShowComposer(true); setTimeout(() => noteRef.current?.focus(), 100) }}
            className="w-full bg-layer rounded-xl p-5 border border-gold/30 hover:border-gold/60 transition-colors duration-300 text-left"
            style={{ boxShadow: '0 0 20px rgba(232, 192, 122, 0.06)' }}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <div>
                <p className="text-vellum font-ui font-ui-light text-sm">Capture a moment</p>
                <p className="text-ember font-ui font-ui-xlight text-xs mt-0.5">Notes, thoughts, memories from your voyage</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Composer */}
      {showComposer && (
        <div className="px-5 pt-5">
          <div className="bg-layer rounded-xl p-5 border border-gold/30 space-y-4"
            style={{ boxShadow: '0 0 20px rgba(232, 192, 122, 0.06)' }}>

            {/* Entry Type */}
            <div className="flex gap-2">
              {ENTRY_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setEntryType(t.value)}
                  className={`font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                    entryType === t.value
                      ? 'border-gold/50 bg-gold/15 text-gold'
                      : 'border-between text-ember hover:text-dusk'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Note */}
            <textarea
              ref={noteRef}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={entryType === 'eod_debrief'
                ? "How was today? What stood out? What will you remember?"
                : "What are you seeing, feeling, thinking right now?"
              }
              rows={4}
              className="w-full bg-vault/50 rounded-lg px-4 py-3 text-vellum font-ui font-ui-light text-sm placeholder-ember/40 border border-between focus:border-gold/40 focus:outline-none resize-none transition-colors"
            />

            {/* Voice + emoji toolbar */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleVoice}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors duration-200 font-ui font-ui-xlight text-[10px] tracking-wider uppercase ${
                  isListening
                    ? 'border-witness/50 bg-witness/15 text-witness animate-pulse'
                    : 'border-between text-ember hover:text-dusk hover:border-dusk/30'
                }`}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" />
                </svg>
                {isListening ? 'Listening...' : 'Dictate'}
              </button>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors duration-200 font-ui font-ui-xlight text-[10px] tracking-wider uppercase ${
                  showEmojiPicker
                    ? 'border-gold/50 bg-gold/15 text-gold'
                    : 'border-between text-ember hover:text-dusk hover:border-dusk/30'
                }`}
              >
                <span className="text-sm leading-none">😊</span>
                Emoji
              </button>
            </div>
            {showEmojiPicker && (
              <div className="grid grid-cols-9 gap-1 bg-vault/80 rounded-xl p-3 border border-between">
                {TRAVEL_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => insertEmoji(e)}
                    className="text-xl text-center py-1 hover:bg-hover rounded transition-colors">
                    {e}
                  </button>
                ))}
              </div>
            )}

            {/* Location */}
            <div className="flex gap-2">
              <input
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                placeholder="Location name (optional)"
                className="flex-1 bg-vault/50 rounded-lg px-3 py-2 text-vellum font-ui font-ui-xlight text-xs placeholder-ember/40 border border-between focus:border-gold/40 focus:outline-none transition-colors"
              />
              <button
                onClick={captureGPS}
                className={`shrink-0 px-3 py-2 rounded-lg border transition-colors duration-200 font-ui font-ui-xlight text-[10px] tracking-wider uppercase ${
                  gpsStatus === 'found' ? 'border-ether/50 bg-ether/15 text-ether'
                  : gpsStatus === 'locating' ? 'border-gold/30 bg-gold/10 text-gold animate-pulse'
                  : gpsStatus === 'denied' ? 'border-witness/30 text-witness'
                  : 'border-between text-ember hover:text-dusk hover:border-dusk/30'
                }`}
              >
                {gpsStatus === 'found' ? 'GPS Locked' : gpsStatus === 'locating' ? 'Locating...' : gpsStatus === 'denied' ? 'No GPS' : 'Pin Location'}
              </button>
            </div>
            {gpsStatus === 'found' && lat !== null && lon !== null && (
              <p className="text-dusk font-ui font-ui-xlight text-[10px]">
                {lat.toFixed(4)}, {lon.toFixed(4)}
              </p>
            )}

            {/* Camera / Photos */}
            <div>
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-between text-ember hover:text-dusk hover:border-dusk/30 transition-colors duration-200 font-ui font-ui-xlight text-[10px] tracking-wider uppercase"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                {selectedFiles.length > 0 ? `${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}` : 'Add Photo'}
              </button>
              {photoPreviews.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="relative shrink-0">
                      <img
                        src={src}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-between"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-witness text-white flex items-center justify-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mood */}
            <div>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mb-2">Mood</p>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(mood === m ? null : m)}
                    className={`flex-1 py-2 rounded-lg border text-center transition-colors duration-200 ${
                      mood === m
                        ? `${MOOD_COLORS[m]} border-current bg-current/10`
                        : 'border-between text-ember hover:text-dusk'
                    }`}
                  >
                    <span className="font-ui font-ui-xlight text-[10px] tracking-wider uppercase">{MOOD_LABELS[m]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <p className="text-ember font-ui font-ui-xlight text-[10px] tracking-wider uppercase mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {TAG_OPTIONS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`font-ui font-ui-xlight text-[10px] tracking-wider px-2.5 py-1 rounded-full border transition-colors duration-200 ${
                      tags.includes(tag)
                        ? 'border-gold/40 bg-gold/15 text-gold'
                        : 'border-between text-ember hover:text-dusk'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowComposer(false)}
                className="flex-1 py-2.5 rounded-lg border border-between text-ember font-ui font-ui-xlight text-xs tracking-wider uppercase hover:text-dusk transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!note.trim() || submitting}
                className="flex-1 py-2.5 rounded-lg border border-gold/50 bg-gold/15 text-gold font-ui font-ui-xlight text-xs tracking-wider uppercase hover:bg-gold/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {uploadingPhotos ? 'Uploading...' : submitting ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Count */}
      <div className="px-6 pt-5 pb-2">
        <p className="text-dusk font-ui font-ui-xlight text-xs tracking-widest uppercase">
          {loading ? 'Loading...' : `${entries.length} ${entries.length === 1 ? 'Entry' : 'Entries'}`}
        </p>
      </div>

      {/* Entries Feed */}
      <div className="px-5 space-y-2.5 pb-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="bg-layer rounded-lg p-4 border border-between hover:bg-hover transition-colors duration-300"
          >
            {/* Header row */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className={`font-ui font-ui-xlight text-[10px] tracking-wider uppercase px-2 py-0.5 rounded ${
                  entry.entry_type === 'eod_debrief' ? 'bg-gold/15 text-gold'
                  : entry.entry_type === 'port_note' ? 'bg-ether/15 text-ether'
                  : 'bg-between text-dusk'
                }`}>
                  {entry.entry_type === 'eod_debrief' ? 'End of Day'
                    : entry.entry_type === 'port_note' ? 'Port Note'
                    : 'Quick Note'}
                </span>
                {entry.mood && (
                  <span className={`font-ui font-ui-xlight text-[10px] ${MOOD_COLORS[entry.mood]}`}>
                    {MOOD_LABELS[entry.mood]}
                  </span>
                )}
              </div>
              {pendingDeleteId === entry.id ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPendingDeleteId(null)}
                    className="text-ember/50 hover:text-dusk transition-colors font-ui font-ui-xlight text-[10px] tracking-wider uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-witness font-ui font-ui-xlight text-[10px] tracking-wider uppercase hover:text-witness/80 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-ember/30 hover:text-witness/60 transition-colors p-0.5"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Note text */}
            <p className="text-vellum font-ui font-ui-light text-sm leading-relaxed whitespace-pre-line mb-2">
              {entry.note}
            </p>

            {/* Location */}
            {entry.lat !== null && entry.lon !== null && (
              <div className="relative mb-2 rounded-lg overflow-hidden border border-between" style={{ height: 100 }}>
                <MapContainer
                  center={[entry.lat, entry.lon]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  dragging={false}
                  zoomControl={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  keyboard={false}
                  touchZoom={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <CircleMarker
                    center={[entry.lat, entry.lon]}
                    radius={7}
                    pathOptions={{ color: '#E8C07A', fillColor: '#E8C07A', fillOpacity: 0.9, weight: 2 }}
                  />
                </MapContainer>
                {entry.location_name && (
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-vault/80 backdrop-blur-sm">
                    <p className="text-ether font-ui font-ui-xlight text-[10px] truncate">{entry.location_name}</p>
                  </div>
                )}
              </div>
            )}
            {!entry.lat && entry.location_name && (
              <p className="text-ether font-ui font-ui-xlight text-xs mb-1">{entry.location_name}</p>
            )}

            {/* Photos */}
            {entry.photo_links.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                {entry.photo_links.map((url, i) => (
                  <img
                    key={i}
                    src={url.startsWith('/') ? `${API_BASE}${url}` : url}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover shrink-0 border border-between"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {entry.tags.map(tag => (
                  <span key={tag} className="font-ui font-ui-xlight text-[9px] tracking-wider text-dusk bg-hover px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div className="flex justify-between items-center">
              <p className="text-ember font-ui font-ui-xlight text-[10px]">
                {formatDateTime(entry.timestamp)}
              </p>
              <p className="text-ember/60 font-ui font-ui-xlight text-[10px]">
                {timeAgo(entry.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {!loading && entries.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-10 h-10 text-ember/30 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M4 4h16v16H4zM8 8h8M8 12h6M8 16h4" />
            </svg>
            <p className="text-dusk font-ui font-ui-light text-sm">No entries yet</p>
            <p className="text-ember font-ui font-ui-xlight text-xs mt-1">Tap above to capture your first moment</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

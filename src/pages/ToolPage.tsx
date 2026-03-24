import { Check, Copy, Plus, Shuffle, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ShareModal, isShareDismissed } from '@/components/ShareModal'
import { PageHeader } from '@/pages/PageHeader'

type GradientType = 'linear' | 'radial' | 'conic'

interface ColorStop {
  id: string
  color: string
  position: number
}

let nextId = 1
function makeId() {
  return `stop-${nextId++}`
}

function randomHex(): string {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`
}

const PRESETS: { stops: Array<{ color: string; position: number }>; type: GradientType; angle: number }[] = [
  { type: 'linear', angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { type: 'linear', angle: 90, stops: [{ color: '#f093fb', position: 0 }, { color: '#f5576c', position: 100 }] },
  { type: 'linear', angle: 135, stops: [{ color: '#4facfe', position: 0 }, { color: '#00f2fe', position: 100 }] },
  { type: 'linear', angle: 90, stops: [{ color: '#43e97b', position: 0 }, { color: '#38f9d7', position: 100 }] },
  { type: 'linear', angle: 135, stops: [{ color: '#fa709a', position: 0 }, { color: '#fee140', position: 100 }] },
  { type: 'linear', angle: 90, stops: [{ color: '#a18cd1', position: 0 }, { color: '#fbc2eb', position: 100 }] },
  { type: 'linear', angle: 135, stops: [{ color: '#fccb90', position: 0 }, { color: '#d57eeb', position: 100 }] },
  { type: 'linear', angle: 90, stops: [{ color: '#e0c3fc', position: 0 }, { color: '#8ec5fc', position: 100 }] },
  { type: 'radial', angle: 0, stops: [{ color: '#ffecd2', position: 0 }, { color: '#fcb69f', position: 100 }] },
  { type: 'linear', angle: 45, stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fecfef', position: 50 }, { color: '#fecfef', position: 100 }] },
  { type: 'linear', angle: 180, stops: [{ color: '#0c0c0c', position: 0 }, { color: '#e96d2d', position: 50 }, { color: '#0c0c0c', position: 100 }] },
  { type: 'conic', angle: 0, stops: [{ color: '#ff6b6b', position: 0 }, { color: '#feca57', position: 25 }, { color: '#48dbfb', position: 50 }, { color: '#ff9ff3', position: 75 }, { color: '#ff6b6b', position: 100 }] },
]

function buildGradientCss(type: GradientType, angle: number, stops: ColorStop[]): string {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const stopsStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ')
  switch (type) {
    case 'linear':
      return `linear-gradient(${angle}deg, ${stopsStr})`
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`
    case 'conic':
      return `conic-gradient(from ${angle}deg, ${stopsStr})`
  }
}

export function ToolPage() {
  const { t } = useTranslation()
  const [type, setType] = useState<GradientType>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<ColorStop[]>([
    { id: makeId(), color: '#e96d2d', position: 0 },
    { id: makeId(), color: '#764ba2', position: 100 },
  ])
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [hasUsed, setHasUsed] = useState(false)

  const gradientCss = buildGradientCss(type, angle, stops)
  const fullCss = `background: ${gradientCss};`

  const triggerShare = useCallback(() => {
    if (!hasUsed) {
      setHasUsed(true)
      if (!isShareDismissed()) {
        setTimeout(() => setShareOpen(true), 1500)
      }
    }
  }, [hasUsed])

  const copyCss = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullCss)
      setCopied(true)
      toast.success(t('tool.copiedToClipboard'))
      setTimeout(() => setCopied(false), 1500)
      triggerShare()
    } catch {
      toast.error(t('tool.copyFailed'))
    }
  }, [fullCss, t, triggerShare])

  const addStop = useCallback(() => {
    const pos = stops.length > 0 ? Math.round((stops[stops.length - 1].position + stops[0].position) / 2) : 50
    setStops(prev => [...prev, { id: makeId(), color: randomHex(), position: pos }])
  }, [stops])

  const removeStop = useCallback((id: string) => {
    setStops(prev => (prev.length <= 2 ? prev : prev.filter(s => s.id !== id)))
  }, [])

  const updateStop = useCallback((id: string, updates: Partial<ColorStop>) => {
    setStops(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  const randomize = useCallback(() => {
    const count = 2 + Math.floor(Math.random() * 3)
    const newStops: ColorStop[] = []
    for (let i = 0; i < count; i++) {
      newStops.push({ id: makeId(), color: randomHex(), position: Math.round((i / (count - 1)) * 100) })
    }
    setStops(newStops)
    setAngle(Math.floor(Math.random() * 360))
    triggerShare()
  }, [triggerShare])

  const reverseStops = useCallback(() => {
    setStops(prev =>
      prev.map(s => ({ ...s, position: 100 - s.position }))
    )
  }, [])

  const applyPreset = useCallback((preset: typeof PRESETS[0]) => {
    setType(preset.type)
    setAngle(preset.angle)
    setStops(preset.stops.map(s => ({ id: makeId(), color: s.color, position: s.position })))
    triggerShare()
  }, [triggerShare])

  const types: GradientType[] = ['linear', 'radial', 'conic']

  return (
    <div className="space-y-6">
      <PageHeader />

      <div className="mx-auto max-w-4xl px-4">
        {/* Live preview */}
        <div
          className="mb-6 h-56 w-full rounded-xl border shadow-sm sm:h-72"
          style={{ background: gradientCss }}
        />

        {/* Controls */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          {/* Gradient type + angle */}
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('tool.gradientType')}</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {types.map(gt => (
                  <button
                    key={gt}
                    type="button"
                    onClick={() => setType(gt)}
                    className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                      type === gt
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-accent/50'
                    }`}
                  >
                    {t(`tool.${gt}`)}
                  </button>
                ))}
              </div>
            </div>

            {(type === 'linear' || type === 'conic') && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('tool.angle')}</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={angle}
                  onChange={e => setAngle(Number(e.target.value))}
                  className="w-28"
                />
                <span className="w-12 text-center text-sm font-mono" dir="ltr">{angle}°</span>
              </div>
            )}

            <div className="ms-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={reverseStops}>
                {t('tool.reverse')}
              </Button>
              <Button variant="outline" size="sm" onClick={randomize}>
                <Shuffle className="mr-1.5 size-4" />
                {t('tool.random')}
              </Button>
            </div>
          </div>

          {/* Color stops */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">{t('tool.colorStops')}</span>
              <Button variant="outline" size="sm" onClick={addStop}>
                <Plus className="mr-1.5 size-4" />
                {t('tool.addStop')}
              </Button>
            </div>
            <div className="space-y-2">
              {stops.map(stop => (
                <div key={stop.id} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStop(stop.id, { color: e.target.value })}
                    className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={stop.color.toUpperCase()}
                    onChange={e => {
                      const v = e.target.value
                      if (/^#[0-9a-fA-F]{6}$/.test(v)) updateStop(stop.id, { color: v })
                    }}
                    className="w-24 rounded border border-border bg-background px-2 py-1.5 text-sm font-mono"
                    dir="ltr"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={e => updateStop(stop.id, { position: Number(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="w-12 text-center text-sm font-mono" dir="ltr">{stop.position}%</span>
                  <button
                    type="button"
                    onClick={() => removeStop(stop.id)}
                    disabled={stops.length <= 2}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CSS output */}
          <div className="rounded-lg border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t('tool.cssOutput')}</span>
              <Button variant="outline" size="sm" onClick={copyCss}>
                {copied ? (
                  <>
                    <Check className="mr-1.5 size-4" />
                    {t('tool.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 size-4" />
                    {t('tool.copy')}
                  </>
                )}
              </Button>
            </div>
            <code className="block text-sm font-mono break-all text-foreground" dir="ltr">{fullCss}</code>
          </div>
        </div>

        {/* Presets */}
        <div className="mb-6">
          <p className="mb-3 text-center text-sm font-semibold text-muted-foreground">{t('tool.presets')}</p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {PRESETS.map((preset, i) => {
              const previewStops = preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')
              const bg =
                preset.type === 'linear'
                  ? `linear-gradient(${preset.angle}deg, ${previewStops})`
                  : preset.type === 'radial'
                    ? `radial-gradient(circle, ${previewStops})`
                    : `conic-gradient(from ${preset.angle}deg, ${previewStops})`
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="h-16 rounded-lg border shadow-sm transition-all hover:scale-105 hover:shadow-md"
                  style={{ background: bg }}
                />
              )
            })}
          </div>
        </div>
      </div>

      <ShareModal open={shareOpen} onOpenChange={setShareOpen} showDismissOption />
    </div>
  )
}

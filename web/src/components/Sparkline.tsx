/**
 * Inline SVG sparkline. No external dependency, server-renderable.
 *
 * <Sparkline data={[60, 62, 65, 64, 68, 71]} />
 */

interface Props {
  data: number[]
  width?: number
  height?: number
  className?: string
  strokeWidth?: number
  /** Auto color: green if last > first, red if down, gray if flat. */
  autoColor?: boolean
  color?: string
  fill?: boolean
}

export default function Sparkline({
  data,
  width = 80,
  height = 24,
  className,
  strokeWidth = 1.5,
  autoColor = true,
  color,
  fill = false,
}: Props) {
  if (!data || data.length < 2) {
    return <svg width={width} height={height} className={className} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const path = `M ${points.join(' L ')}`
  const trend = data[data.length - 1] - data[0]
  const stroke = color || (autoColor
    ? (trend > 0 ? '#10b981' : trend < 0 ? '#ef4444' : '#94a3b8')
    : '#0ea5e9')
  const fillColor = autoColor
    ? (trend > 0 ? 'rgba(16,185,129,0.12)' : trend < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)')
    : 'rgba(14,165,233,0.12)'

  const areaPath = fill
    ? `${path} L ${(width).toFixed(1)},${height} L 0,${height} Z`
    : ''

  return (
    <svg width={width} height={height} className={className} aria-hidden viewBox={`0 0 ${width} ${height}`}>
      {fill && <path d={areaPath} fill={fillColor} stroke="none" />}
      <path d={path} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" />
      {/* End dot */}
      <circle
        cx={(data.length - 1) * stepX}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r={2}
        fill={stroke}
      />
    </svg>
  )
}

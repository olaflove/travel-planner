import { useState } from 'react'
import type { AnnualClimateMonth } from '../services/weather'
import '../styles/annualClimate.css'

type Props = {
  cityName: string
  months: AnnualClimateMonth[]
  selectedMonth: number
}

const chart = { left: 70, right: 850, top: 32, bottom: 268 }
const round = (value: number) => Math.round(value)

function smoothPath(points: Array<{ x: number; y: number }>): string {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`
    const previous = points[index - 1]
    const middle = (previous.x + point.x) / 2
    return `${path} C ${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`
  }, '')
}

export default function AnnualClimateChart({ cityName, months, selectedMonth }: Props) {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null)
  const shownMonth = months.find((item) => item.month === (hoveredMonth ?? selectedMonth)) ?? months[0]
  const temperatureMin = Math.floor(Math.min(0, ...months.map((item) => item.averageLow)) / 5) * 5
  const temperatureMax = Math.max(temperatureMin + 5, Math.ceil(Math.max(0, ...months.map((item) => item.averageHigh)) / 5) * 5)
  const rainMax = Math.max(50, Math.ceil(Math.max(...months.map((item) => item.averageRainfall)) / 50) * 50)
  const plotHeight = chart.bottom - chart.top
  const x = (index: number) => chart.left + index * (chart.right - chart.left) / (months.length - 1)
  const temperatureY = (value: number) => chart.bottom - (value - temperatureMin) / (temperatureMax - temperatureMin) * plotHeight
  const rainY = (value: number) => chart.bottom - value / rainMax * plotHeight
  const highPoints = months.map((item, index) => ({ x: x(index), y: temperatureY(item.averageHigh) }))
  const lowPoints = months.map((item, index) => ({ x: x(index), y: temperatureY(item.averageLow) }))
  const shownIndex = months.findIndex((item) => item.month === shownMonth.month)

  return (
    <section className="annual-climate" aria-labelledby="annual-climate-title">
      <div className="annual-climate-heading">
        <div><h3 id="annual-climate-title">{cityName}의 1년 날씨</h3><p>2021–2025년 월별 평균 · 선택한 달과 관계없이 12개월을 보여드려요.</p></div>
        <div className="annual-climate-legend" aria-label="그래프 범례"><span className="high">최고기온</span><span className="low">최저기온</span><span className="rain">강수량</span></div>
      </div>
      <div className="annual-chart-scroll">
        <div className="annual-chart-surface">
          <svg viewBox="0 0 920 292" role="img" aria-label={`${cityName}의 1월부터 12월까지 월별 최고기온, 최저기온, 강수량 그래프`}>
            <text x="10" y="20" className="chart-unit">℃</text><text x="886" y="20" className="chart-unit">mm</text>
            <rect x={x(shownIndex) - 24} y={chart.top} width="48" height={plotHeight} className="chart-selected-band" />
            {Array.from({ length: 5 }, (_, index) => {
              const lineY = chart.top + index * plotHeight / 4
              return <g key={index}><line x1={chart.left} x2={chart.right} y1={lineY} y2={lineY} className="chart-grid" /><text x="52" y={lineY + 4} className="chart-axis" textAnchor="end">{round(temperatureMax - index * (temperatureMax - temperatureMin) / 4)}</text><text x="866" y={lineY + 4} className="chart-axis">{round(rainMax - index * rainMax / 4)}</text></g>
            })}
            {months.map((item, index) => <rect key={item.month} x={x(index) - 15} y={rainY(item.averageRainfall)} width="30" height={chart.bottom - rainY(item.averageRainfall)} className={item.month === shownMonth.month ? 'chart-rain-bar active' : 'chart-rain-bar'} />)}
            <path d={smoothPath(highPoints)} className="chart-high-line" /><path d={smoothPath(lowPoints)} className="chart-low-line" />
            <line x1={x(shownIndex)} x2={x(shownIndex)} y1={chart.top} y2={chart.bottom} className="chart-marker" />
            <circle cx={highPoints[shownIndex].x} cy={highPoints[shownIndex].y} r="5" className="chart-high-point" /><circle cx={lowPoints[shownIndex].x} cy={lowPoints[shownIndex].y} r="5" className="chart-low-point" />
          </svg>
          <div className="annual-chart-months" aria-label="월별 수치 살펴보기">
            {months.map((item) => <button key={item.month} type="button" className={item.month === shownMonth.month ? 'active' : ''} onMouseEnter={() => setHoveredMonth(item.month)} onMouseLeave={() => setHoveredMonth(null)} onFocus={() => setHoveredMonth(item.month)} onBlur={() => setHoveredMonth(null)} onClick={() => setHoveredMonth(item.month)} aria-label={`${item.month}월 최고 ${round(item.averageHigh)}도, 최저 ${round(item.averageLow)}도, 강수량 ${round(item.averageRainfall)}밀리미터`}>{item.month}월</button>)}
          </div>
        </div>
      </div>
      <div className="annual-chart-detail"><strong>{shownMonth.month}월 평균</strong><span>최고 {round(shownMonth.averageHigh)}℃</span><span>최저 {round(shownMonth.averageLow)}℃</span><span>강수량 {round(shownMonth.averageRainfall)}mm</span></div>
      <table className="annual-sr-only"><caption>{cityName}의 2021–2025년 월별 평균 기후</caption><thead><tr><th>월</th><th>평균 최고기온</th><th>평균 최저기온</th><th>월 강수량</th></tr></thead><tbody>{months.map((item) => <tr key={item.month}><th>{item.month}월</th><td>{item.averageHigh.toFixed(1)}℃</td><td>{item.averageLow.toFixed(1)}℃</td><td>{item.averageRainfall.toFixed(1)}mm</td></tr>)}</tbody></table>
    </section>
  )
}

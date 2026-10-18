import { readFile, writeFile } from 'node:fs/promises'
import { recommendationCities } from '../src/data/recommendationCities.ts'

const startDate = '2021-01-01'
const endDate = '2025-12-31'
const output = new URL('../src/data/recommendationClimate.json', import.meta.url)

async function fetchArchive(city) {
  const url = new URL('https://archive-api.open-meteo.com/v1/archive')
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: city.timezone,
  }).toString()

  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!data.daily) throw new Error(data.reason || 'daily data missing')
      return data.daily
    } catch (error) {
      if (attempt === 6) throw new Error(`${city.name}: ${error.message}`)
      await new Promise((resolve) => setTimeout(resolve, error.message.includes('429') ? 20000 : attempt * 2000))
    }
  }
}

function summarize(daily) {
  const totals = Array.from({ length: 12 }, () => ({ days: 0, high: 0, low: 0, rain: 0, wetDays: 0 }))
  daily.time.forEach((date, index) => {
    const month = Number(date.slice(5, 7)) - 1
    const high = daily.temperature_2m_max[index]
    const low = daily.temperature_2m_min[index]
    const rain = daily.precipitation_sum[index]
    if (high == null || low == null || rain == null) return
    const item = totals[month]
    item.days += 1
    item.high += high
    item.low += low
    item.rain += rain
    if (rain >= 1) item.wetDays += 1
  })
  return totals.map((item, index) => ({
    month: index + 1,
    high: Number((item.high / item.days).toFixed(1)),
    low: Number((item.low / item.days).toFixed(1)),
    rainfall: Math.round(item.rain / 5),
    wetDayPercent: Math.round(item.wetDays / item.days * 100),
  }))
}

let cities = []
try {
  cities = JSON.parse(await readFile(output, 'utf8')).cities
} catch {
  // 첫 실행에는 저장된 자료가 없다.
}
for (const city of recommendationCities) {
  if (cities.some((item) => item.name === city.name)) continue
  const daily = await fetchArchive(city)
  const months = summarize(daily)
  cities.push({ name: city.name, months })
  console.log(`${cities.length}/${recommendationCities.length} ${city.name}`)
  await writeFile(output, `${JSON.stringify({ source: 'Open-Meteo Historical Weather API', period: `${startDate}–${endDate}`, cities }, null, 2)}\n`, 'utf8')
  await new Promise((resolve) => setTimeout(resolve, 2500))
}
console.log(`Saved ${output.pathname}`)

export type City = {
  id?: number
  name: string
  country: string
  country_code?: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

export type MonthlyClimate = {
  averageHigh: number
  averageLow: number
  averageRainfall: number
  rainyDayPercent: number
  sampleDays: number
}

export type AnnualClimateMonth = MonthlyClimate & { month: number }

type GeocodingResponse = { results?: City[]; error?: boolean; reason?: string }
type ArchiveResponse = {
  daily?: {
    time: string[]
    temperature_2m_max: Array<number | null>
    temperature_2m_min: Array<number | null>
    precipitation_sum: Array<number | null>
  }
  error?: boolean
  reason?: string
}

const archiveCache = new Map<string, Promise<ArchiveResponse>>()
const period = { start: '2021-01-01', end: '2025-12-31' }

export async function searchCities(query: string, signal?: AbortSignal): Promise<City[]> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.search = new URLSearchParams({ name: query, count: '5', language: 'ko', format: 'json' }).toString()
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('도시 검색에 실패했어요. 잠시 후 다시 시도해 주세요.')
  const data = await response.json() as GeocodingResponse
  if (data.error) throw new Error(data.reason || '도시 검색에 실패했어요.')
  return data.results ?? []
}

async function getArchive(city: City): Promise<ArchiveResponse> {
  const key = `${city.latitude.toFixed(3)},${city.longitude.toFixed(3)}`
  if (!archiveCache.has(key)) {
    const url = new URL('https://archive-api.open-meteo.com/v1/archive')
    url.search = new URLSearchParams({
      latitude: String(city.latitude),
      longitude: String(city.longitude),
      start_date: period.start,
      end_date: period.end,
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
      timezone: city.timezone || 'auto',
    }).toString()
    const request = fetch(url).then(async (response) => {
      if (!response.ok) throw new Error('날씨 데이터를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.')
      const data = await response.json() as ArchiveResponse
      if (data.error || !data.daily) throw new Error(data.reason || '이 도시의 날씨 데이터가 없어요.')
      return data
    }).catch((error: unknown) => {
      archiveCache.delete(key)
      throw error
    })
    archiveCache.set(key, request)
  }
  return archiveCache.get(key)!
}

export async function getAnnualClimate(city: City): Promise<AnnualClimateMonth[]> {
  const archive = await getArchive(city)
  const daily = archive.daily!
  const totals = Array.from({ length: 12 }, () => ({ high: 0, low: 0, rain: 0, rainyDays: 0, days: 0 }))

  daily.time.forEach((date, index) => {
    const monthIndex = Number(date.slice(5, 7)) - 1
    const high = daily.temperature_2m_max[index]
    const low = daily.temperature_2m_min[index]
    const rain = daily.precipitation_sum[index]
    if (monthIndex < 0 || monthIndex > 11 || high == null || low == null || rain == null) return
    const item = totals[monthIndex]
    item.high += high
    item.low += low
    item.rain += rain
    if (rain >= 1) item.rainyDays += 1
    item.days += 1
  })

  if (totals.some((item) => !item.days)) throw new Error('이 도시의 월별 날씨 데이터가 부족해요.')
  return totals.map((item, index) => ({
    month: index + 1,
    averageHigh: item.high / item.days,
    averageLow: item.low / item.days,
    averageRainfall: item.rain / 5,
    rainyDayPercent: item.rainyDays / item.days * 100,
    sampleDays: item.days,
  }))
}

export async function getMonthlyClimate(city: City, month: number): Promise<MonthlyClimate> {
  const annual = await getAnnualClimate(city)
  const result = annual[month - 1]
  if (!result) throw new Error('선택한 달의 날씨 데이터가 없어요.')
  return result
}

export function getOutfitTip(climate: MonthlyClimate): string {
  const average = (climate.averageHigh + climate.averageLow) / 2
  if (average < 10) return '두꺼운 외투와 보온용 겹옷을 챙겨 보세요.'
  if (average < 17) return '가벼운 외투와 겹쳐 입을 옷이 잘 어울려요.'
  if (average < 24) return '긴소매나 얇은 겉옷을 준비하면 좋아요.'
  return '통기성 좋은 가벼운 옷과 햇빛 가리개를 챙겨 보세요.'
}

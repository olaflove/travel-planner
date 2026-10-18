import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import Header from '../components/Header'
import { recommendationCities } from '../data/recommendationCities'
import recommendationClimate from '../data/recommendationClimate.json'
import { recommendationMonths } from '../data/recommendationMonths'
import { getMonthlyClimate, getOutfitTip, searchCities, type City, type MonthlyClimate } from '../services/weather'
import '../styles/weather.css'

const months = Array.from({ length: 12 }, (_, index) => index + 1)
type ClimateSnapshot = typeof recommendationClimate.cities[number]['months'][number]
type Recommendation = { city: City; climate: ClimateSnapshot }
const rounded = (value: number) => Math.round(value)

function getRecommendations(month: number): Recommendation[] {
  return recommendationCities.flatMap((city) => {
    if (!recommendationMonths[city.name]?.includes(month)) return []
    const climate = recommendationClimate.cities.find((item) => item.name === city.name)?.months.find((item) => item.month === month)
    return climate ? [{ city, climate }] : []
  })
}

export default function WeatherPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCity = searchParams.get('city') || ''
  const initialMonth = Number(searchParams.get('month'))
  const [cityInput, setCityInput] = useState(initialCity)
  const [month, setMonth] = useState(initialMonth >= 1 && initialMonth <= 12 ? initialMonth : new Date().getMonth() + 1)
  const [cityOptions, setCityOptions] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [climate, setClimate] = useState<MonthlyClimate | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [recommendationMonth, setRecommendationMonth] = useState(0)
  const recommendations = getRecommendations(recommendationMonth)
  const initialLookupStarted = useRef(false)
  const weatherRequestId = useRef(0)

  async function showClimate(city: City, targetMonth: number) {
    const requestId = ++weatherRequestId.current
    setSelectedCity(city)
    setClimate(null)
    setWeatherError('')
    setWeatherLoading(true)
    try {
      const result = await getMonthlyClimate(city, targetMonth)
      if (requestId === weatherRequestId.current) setClimate(result)
    } catch (error) {
      if (requestId === weatherRequestId.current) setWeatherError(error instanceof Error ? error.message : '날씨를 가져오지 못했어요.')
    } finally {
      if (requestId === weatherRequestId.current) setWeatherLoading(false)
    }
  }

  async function lookupCity(query: string, targetMonth: number) {
    const requestId = ++weatherRequestId.current
    setWeatherLoading(true)
    setWeatherError('')
    setClimate(null)
    setSelectedCity(null)
    setCityOptions([])
    try {
      const results = await searchCities(query)
      if (requestId !== weatherRequestId.current) return
      if (!results.length) throw new Error('검색된 도시가 없어요. 도시 이름이나 국가 이름을 함께 입력해 보세요.')
      setCityOptions(results)
      await showClimate(results[0], targetMonth)
    } catch (error) {
      if (requestId === weatherRequestId.current) {
        setWeatherError(error instanceof Error ? error.message : '도시를 검색하지 못했어요.')
        setWeatherLoading(false)
      }
    }
  }

  useEffect(() => {
    if (initialLookupStarted.current || !initialCity.trim() || initialMonth < 1 || initialMonth > 12) return
    initialLookupStarted.current = true
    void lookupCity(initialCity, initialMonth)
  }, [])

  function handleWeatherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = cityInput.trim()
    if (!query) return
    setSearchParams({ city: query, month: String(month) })
    void lookupCity(query, month)
  }

  function useRecommendedCity({ city, climate: snapshot }: Recommendation) {
    ++weatherRequestId.current
    setCityInput(city.name)
    setMonth(recommendationMonth)
    setCityOptions([])
    setSelectedCity(city)
    setClimate({ averageHigh: snapshot.high, averageLow: snapshot.low, averageRainfall: snapshot.rainfall, rainyDayPercent: snapshot.wetDayPercent, sampleDays: 0 })
    setWeatherLoading(false)
    setWeatherError('')
    setSearchParams({ city: city.name, month: String(recommendationMonth) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="weather-page" id="top">
      <Header />
      <main>
        <section className="weather-intro">
          <div className="weather-intro-inner">
            <span className="section-kicker">WEATHER GUIDE</span>
            <h1>어느 달에 떠나도,<br /><em>날씨는 알고 가요.</em></h1>
            <p>도시의 월별 기후를 살펴보거나, 여행하기 편안한 달의 도시를 찾아보세요.</p>
          </div>
          <div className="weather-intro-symbol" aria-hidden="true">☀</div>
        </section>

        <section className="weather-content" aria-labelledby="city-weather-title">
          <div className="weather-section-heading">
            <div className="weather-step">01</div>
            <div><h2 id="city-weather-title">도시의 날씨 살펴보기</h2><p>도시와 월을 고르면 최근 5년의 같은 달을 비교해 보여드려요.</p></div>
          </div>
          <form className="weather-query" onSubmit={handleWeatherSubmit}>
            <label>도시 이름<input value={cityInput} onChange={(event) => setCityInput(event.target.value)} placeholder="예: 리스본, 포르투갈" required /></label>
            <label>여행할 달<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{months.map((item) => <option key={item} value={item}>{item}월</option>)}</select></label>
            <button type="submit" disabled={weatherLoading}>{weatherLoading ? '불러오는 중…' : '날씨 보기 →'}</button>
          </form>
          {cityOptions.length > 1 && <div className="city-options"><span>검색된 도시</span>{cityOptions.map((city, index) => <button key={`${city.id || city.name}-${index}`} type="button" className={selectedCity === city ? 'selected' : ''} onClick={() => { setCityInput(city.name); void showClimate(city, month) }}>{city.name}, {city.admin1 ? `${city.admin1}, ` : ''}{city.country}</button>)}</div>}
          {weatherError && <p className="weather-message error" role="alert">{weatherError}</p>}
          {weatherLoading && <p className="weather-message" role="status">도시의 기후 자료를 읽고 있어요…</p>}
          {selectedCity && climate && !weatherLoading && <div className="climate-result" aria-live="polite">
            <div className="climate-result-header"><div><span className="section-kicker">MONTHLY CLIMATE</span><h3>{selectedCity.name}, {selectedCity.country} <small>{month}월</small></h3></div><span className="climate-sun" aria-hidden="true">☀</span></div>
            <div className="climate-stats"><div><span>평균 낮 최고</span><strong>{rounded(climate.averageHigh)}°</strong><small>℃</small></div><div><span>평균 밤 최저</span><strong>{rounded(climate.averageLow)}°</strong><small>℃</small></div><div><span>월 강수량</span><strong>{rounded(climate.averageRainfall)}</strong><small>mm</small></div><div><span>강수일 비율</span><strong>{rounded(climate.rainyDayPercent)}</strong><small>%</small></div></div>
            <div className="outfit-tip"><span aria-hidden="true">✦</span><p><strong>옷차림 참고</strong> {getOutfitTip(climate)}</p></div>
            <p className="data-note">2021–2025년 같은 달의 과거 자료 평균입니다. 선택한 여행 날짜의 예보가 아니며, 강수일은 비·눈을 합친 하루 강수량 1mm 이상을 뜻해요.</p>
          </div>}
        </section>

        <section className="weather-content recommendation-section" aria-labelledby="recommendation-title">
          <div className="weather-section-heading"><div className="weather-step">02</div><div><h2 id="recommendation-title">이 달엔 어디가 좋을까요?</h2><p>떠날 달만 고르면 미리 선정한 여행지가 바로 보여요.</p></div></div>
          <div className="month-picker" aria-label="여행할 달 선택">{months.map((item) => <button key={item} type="button" className={recommendationMonth === item ? 'active' : ''} onClick={() => setRecommendationMonth(item)}>{item}월</button>)}</div>
          <div className="recommendation-rule"><strong>선정 기준</strong><span>2021–2025년의 월별 기온·강수량을 비교하고 지역별 태풍 집중 시기를 참고했어요.</span></div>
          {recommendationMonth > 0 && <>
            {recommendations.length ? <div className="recommendation-grid">{recommendations.map((recommendation) => <article className="recommendation-card" key={recommendation.city.name}><span>{recommendation.city.country}</span><h3>{recommendation.city.name}</h3><p>평균 낮 {rounded(recommendation.climate.high)}℃ · 월 강수량 {rounded(recommendation.climate.rainfall)}mm</p><button type="button" onClick={() => useRecommendedCity(recommendation)}>날씨 자세히 보기 ↗</button></article>)}</div> : <p className="weather-message">선정한 여행지가 없어요. 다른 달을 선택해 보세요.</p>}
          </>}
          <p className="data-note recommendation-note">선정한 {recommendationCities.length}개 여행지만 추천 후보로 사용합니다. 발리는 덴파사르, 괌은 하갓냐 기준입니다. 인터라켄은 시내 기준이므로 산 위 날씨와 다를 수 있어요. 도시마다 쾌적한 기온이 달라 상대적으로 여행하기 좋은 달을 선정했으며, 특정 날짜의 날씨나 태풍 안전을 보장하지는 않아요.</p>
        </section>
        <div className="weather-source">기후 데이터 제공: <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> (2021–2025년 자료를 월별 평균으로 가공) · 도시 검색 데이터: <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">GeoNames</a> · 계절 참고: <a href="https://www.jma.go.jp/jma/kishou/know/typhoon/1-4.html" target="_blank" rel="noreferrer">일본 기상청</a>, <a href="https://www.hko.gov.hk/en/cis/climahk.htm" target="_blank" rel="noreferrer">홍콩 천문대</a>, <a href="https://www.weather.gov/safety/hurricane" target="_blank" rel="noreferrer">미국 기상청</a></div>
      </main>
      <footer className="site-footer"><span>✳ 어디로</span><small>여행의 시작을 가볍게.</small></footer>
    </div>
  )
}

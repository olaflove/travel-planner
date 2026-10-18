import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import Header from '../components/Header'
import AnnualClimateChart from '../components/AnnualClimateChart'
import { recommendationCities } from '../data/recommendationCities'
import recommendationClimate from '../data/recommendationClimate.json'
import { recommendationMonths } from '../data/recommendationMonths'
import { getAnnualClimate, getOutfitTip, searchCities, type AnnualClimateMonth, type City, type MonthlyClimate } from '../services/weather'
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

function getStoredAnnualClimate(city: City): AnnualClimateMonth[] | null {
  const knownCity = recommendationCities.find((item) => item.name === city.name && Math.abs(item.latitude - city.latitude) < 0.1 && Math.abs(item.longitude - city.longitude) < 0.1)
  if (!knownCity) return null
  const stored = recommendationClimate.cities.find((item) => item.name === knownCity.name)
  if (!stored) return null
  return stored.months.map((item) => ({
    month: item.month,
    averageHigh: item.high,
    averageLow: item.low,
    averageRainfall: item.rainfall,
    rainyDayPercent: item.wetDayPercent,
    sampleDays: 0,
  }))
}

export default function WeatherPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCity = searchParams.get('city') || ''
  const initialMonth = Number(searchParams.get('month'))
  const [cityInput, setCityInput] = useState(initialCity)
  const [chosenCity, setChosenCity] = useState<City | null>(null)
  const [suggestionOpen, setSuggestionOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [remoteSuggestions, setRemoteSuggestions] = useState<{ query: string; cities: City[] }>({ query: '', cities: [] })
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [month, setMonth] = useState(initialMonth >= 1 && initialMonth <= 12 ? initialMonth : new Date().getMonth() + 1)
  const [displayMonth, setDisplayMonth] = useState(initialMonth >= 1 && initialMonth <= 12 ? initialMonth : new Date().getMonth() + 1)
  const [cityOptions, setCityOptions] = useState<City[]>([])
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [climate, setClimate] = useState<MonthlyClimate | null>(null)
  const [annualClimate, setAnnualClimate] = useState<AnnualClimateMonth[] | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [recommendationMonth, setRecommendationMonth] = useState(0)
  const recommendations = getRecommendations(recommendationMonth)
  const cityQuery = cityInput.trim().toLocaleLowerCase()
  const localSuggestions = cityQuery ? recommendationCities.filter((city) => city.name.toLocaleLowerCase().includes(cityQuery) || city.country.toLocaleLowerCase().includes(cityQuery)).slice(0, 6) : []
  const extraSuggestions = remoteSuggestions.query === cityQuery ? remoteSuggestions.cities.filter((city) => !localSuggestions.some((local) => local.name === city.name && local.country === city.country)) : []
  const suggestions: City[] = [...localSuggestions, ...extraSuggestions].slice(0, 8)
  const initialLookupStarted = useRef(false)
  const weatherRequestId = useRef(0)

  useEffect(() => {
    if (!suggestionOpen || cityQuery.length < 3 || chosenCity?.name.toLocaleLowerCase() === cityQuery) {
      setSuggestionLoading(false)
      return
    }
    setSuggestionLoading(true)
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      void searchCities(cityQuery, controller.signal)
        .then((cities) => setRemoteSuggestions({ query: cityQuery, cities }))
        .catch(() => { /* 입력 중 검색 실패는 제출할 때 안내한다. */ })
        .finally(() => { if (!controller.signal.aborted) setSuggestionLoading(false) })
    }, 350)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [cityQuery, suggestionOpen, chosenCity])

  function chooseSuggestion(city: City) {
    setCityInput(city.name)
    setChosenCity(city)
    setSuggestionOpen(false)
    setActiveSuggestion(-1)
    setCityOptions([])
  }

  async function showClimate(city: City, targetMonth: number) {
    const requestId = ++weatherRequestId.current
    setSelectedCity(city)
    setClimate(null)
    setAnnualClimate(null)
    setWeatherError('')
    setWeatherLoading(true)
    try {
      const result = getStoredAnnualClimate(city) ?? await getAnnualClimate(city)
      if (requestId === weatherRequestId.current) {
        setAnnualClimate(result)
        setClimate(result[targetMonth - 1])
        setDisplayMonth(targetMonth)
      }
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
    setAnnualClimate(null)
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
    setSuggestionOpen(false)
    setSearchParams({ city: query, month: String(month) })
    if (chosenCity?.name === query) {
      void showClimate(chosenCity, month)
    } else {
      void lookupCity(query, month)
    }
  }

  function useRecommendedCity({ city, climate: snapshot }: Recommendation) {
    ++weatherRequestId.current
    setCityInput(city.name)
    setChosenCity(city)
    setSuggestionOpen(false)
    setMonth(recommendationMonth)
    setDisplayMonth(recommendationMonth)
    setCityOptions([])
    setSelectedCity(city)
    const annual = getStoredAnnualClimate(city)
    setAnnualClimate(annual)
    setClimate(annual?.[recommendationMonth - 1] ?? { averageHigh: snapshot.high, averageLow: snapshot.low, averageRainfall: snapshot.rainfall, rainyDayPercent: snapshot.wetDayPercent, sampleDays: 0 })
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
            <div><h2 id="city-weather-title">도시의 날씨 살펴보기</h2><p>도시와 월을 고르면 2021–2025년 평균 날씨와 연중 변화를 보여드려요.</p></div>
          </div>
          <form className="weather-query" onSubmit={handleWeatherSubmit}>
            <div className="city-search-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionOpen(false) }}>
              <label htmlFor="weather-city">도시 이름</label>
              <div className="city-input-wrap">
                <input id="weather-city" value={cityInput} onChange={(event) => { setCityInput(event.target.value); setChosenCity(null); setSuggestionOpen(true); setActiveSuggestion(-1) }} onFocus={() => { if (cityInput.trim()) setSuggestionOpen(true) }} onKeyDown={(event) => {
                  if (event.key === 'Escape') { setSuggestionOpen(false); setActiveSuggestion(-1) }
                  if (!suggestionOpen || !suggestions.length) return
                  if (event.key === 'ArrowDown') { event.preventDefault(); setActiveSuggestion((current) => (current + 1) % suggestions.length) }
                  if (event.key === 'ArrowUp') { event.preventDefault(); setActiveSuggestion((current) => current <= 0 ? suggestions.length - 1 : current - 1) }
                  if (event.key === 'Enter' && activeSuggestion >= 0) { event.preventDefault(); chooseSuggestion(suggestions[activeSuggestion]) }
                }} placeholder="예: 파리, 리스본" role="combobox" aria-autocomplete="list" aria-expanded={suggestionOpen && !!cityQuery} aria-controls="weather-city-suggestions" aria-activedescendant={activeSuggestion >= 0 && suggestionOpen ? `weather-city-option-${activeSuggestion}` : undefined} autoComplete="off" required />
                {suggestionOpen && cityQuery && <div className="city-suggestions" id="weather-city-suggestions" role="listbox" aria-label="도시 추천">
                  {suggestions.map((city, index) => <button id={`weather-city-option-${index}`} key={`${city.name}-${city.country}-${city.latitude}`} type="button" role="option" aria-selected={index === activeSuggestion} className={index === activeSuggestion ? 'active' : ''} onClick={() => chooseSuggestion(city)}><strong>{city.name}</strong><span>{city.country}</span></button>)}
                  {!suggestions.length && <p>{suggestionLoading ? '도시를 찾는 중이에요…' : cityQuery.length < 3 ? '추천 도시가 없어요. 다른 도시는 3글자 이상 입력해 보세요.' : '추천 도시가 없어요. 도시 이름을 더 입력하거나 날씨 보기를 눌러 검색해 보세요.'}</p>}
                </div>}
              </div>
            </div>
            <label>여행할 달<select value={month} onChange={(event) => setMonth(Number(event.target.value))}>{months.map((item) => <option key={item} value={item}>{item}월</option>)}</select></label>
            <button type="submit" disabled={weatherLoading}>{weatherLoading ? '불러오는 중…' : '날씨 보기 →'}</button>
          </form>
          {cityOptions.length > 1 && <div className="city-options"><span>검색된 도시</span>{cityOptions.map((city, index) => <button key={`${city.id || city.name}-${index}`} type="button" className={selectedCity === city ? 'selected' : ''} onClick={() => { chooseSuggestion(city); void showClimate(city, month) }}>{city.name}, {city.admin1 ? `${city.admin1}, ` : ''}{city.country}</button>)}</div>}
          {weatherError && <p className="weather-message error" role="alert">{weatherError}</p>}
          {weatherLoading && <p className="weather-message" role="status">도시의 기후 자료를 읽고 있어요…</p>}
          {selectedCity && climate && !weatherLoading && <div className="climate-result" aria-live="polite">
            <div className="climate-result-header"><div><span className="section-kicker">MONTHLY CLIMATE</span><h3>{selectedCity.name}, {selectedCity.country} <small>{displayMonth}월</small></h3></div><span className="climate-sun" aria-hidden="true">☀</span></div>
            <div className="climate-stats"><div><span>평균 낮 최고</span><strong>{rounded(climate.averageHigh)}°</strong><small>℃</small></div><div><span>평균 밤 최저</span><strong>{rounded(climate.averageLow)}°</strong><small>℃</small></div><div><span>월 강수량</span><strong>{rounded(climate.averageRainfall)}</strong><small>mm</small></div><div><span>강수일 비율</span><strong>{rounded(climate.rainyDayPercent)}</strong><small>%</small></div></div>
            <div className="outfit-tip"><span aria-hidden="true">✦</span><p><strong>옷차림 참고</strong> {getOutfitTip(climate)}</p></div>
            <p className="data-note">2021–2025년 같은 달의 과거 자료 평균입니다. 선택한 여행 날짜의 예보가 아니며, 강수일은 비·눈을 합친 하루 강수량 1mm 이상을 뜻해요.</p>
          </div>}
          {selectedCity && annualClimate && !weatherLoading && <AnnualClimateChart cityName={selectedCity.name} months={annualClimate} selectedMonth={displayMonth} />}
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

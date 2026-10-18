import { useState, type FormEvent } from 'react'

const popularCities = ['삿포로', '다낭', '리스본', '치앙마이']
const months = Array.from({ length: 12 }, (_, index) => index + 1)

export default function DestinationSearch() {
  const [city, setCity] = useState('')
  const [month, setMonth] = useState('')
  const [submitted, setSubmitted] = useState<{ city: string; month: string } | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedCity = city.trim()
    if (!trimmedCity || !month) return
    setSubmitted({ city: trimmedCity, month })
  }

  return (
    <div className="search-wrap" id="weather">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="field city-field">
          <label htmlFor="destination">어디로 떠나세요?</label>
          <div className="field-control">
            <span aria-hidden="true" className="field-icon">⌕</span>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="도시를 입력해 주세요"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              autoComplete="off"
              required
            />
          </div>
        </div>
        <div className="field month-field">
          <label htmlFor="travel-month">언제 떠나세요?</label>
          <div className="field-control">
            <span aria-hidden="true" className="field-icon calendar-icon">▦</span>
            <select
              id="travel-month"
              name="travel-month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
              required
            >
              <option value="" disabled>여행 월 선택</option>
              {months.map((item) => <option key={item} value={item}>{item}월</option>)}
            </select>
          </div>
        </div>
        <button className="search-button" type="submit">날씨 살펴보기 <span aria-hidden="true">→</span></button>
      </form>
      <div className="popular-cities">
        <span>인기 여행지</span>
        {popularCities.map((popularCity) => (
          <button key={popularCity} type="button" onClick={() => setCity(popularCity)}>{popularCity}</button>
        ))}
      </div>
      {submitted && (
        <div className="search-feedback" role="status">
          <strong>{submitted.city} · {submitted.month}월</strong>
          <span>선택했어요. 월별 날씨 데이터 연결은 다음 단계에서 진행합니다.</span>
        </div>
      )}
    </div>
  )
}

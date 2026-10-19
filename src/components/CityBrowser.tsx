import { useState } from 'react'
import { cityRegions, findBrowseCity, popularCityNames, type BrowseCity } from '../data/cityBrowser'
import '../styles/cityBrowser.css'

type Props = { onSelectCity: (city: BrowseCity) => void; selectedCityName?: string }

export default function CityBrowser({ onSelectCity, selectedCityName }: Props) {
  const [open, setOpen] = useState(false)
  const [regionIndex, setRegionIndex] = useState(0)
  const [countryIndex, setCountryIndex] = useState(0)
  const region = cityRegions[regionIndex]
  const selectedCountry = region.countries[countryIndex]

  function choose(city: BrowseCity) {
    onSelectCity(city)
  }

  function changeRegion(index: number) {
    setRegionIndex(index)
    setCountryIndex(0)
  }

  return (
    <div className="city-browser">
      <div className="popular-cities"><span>인기 검색지</span>{popularCityNames.map((name) => {
        const city = findBrowseCity(name)!
        return <button key={name} type="button" aria-pressed={selectedCityName === name} onClick={() => choose(city)}>{name}</button>
      })}</div>
      <button className="city-browser-toggle" type="button" aria-expanded={open} aria-controls="city-browser-panel" onClick={() => setOpen((current) => !current)}><span>도시가 바로 떠오르지 않나요? <strong>지역·국가별로 찾아보기</strong></span><span aria-hidden="true">{open ? '접기 −' : '열기 +'}</span></button>
      {open && <div className="city-browser-panel" id="city-browser-panel">
        <div className="city-browser-step"><strong>01 지역 선택</strong></div>
        <div className="city-region-list">{cityRegions.map((item, index) => <button key={item.name} type="button" className={index === regionIndex ? 'active' : ''} aria-pressed={index === regionIndex} onClick={() => changeRegion(index)}>{item.name}</button>)}</div>
        {region.countries.length > 1 && <>
          <div className="city-browser-step"><strong>02 국가 선택</strong></div>
          <div className="city-country-list">{region.countries.map((item, index) => <button key={item.name} type="button" className={index === countryIndex ? 'active' : ''} aria-pressed={index === countryIndex} onClick={() => setCountryIndex(index)}>{item.name}</button>)}</div>
        </>}
        <div className="city-browser-step"><strong>{region.countries.length > 1 ? '03' : '02'} 도시 선택</strong></div>
        <div className="city-browser-grid">{selectedCountry.cities.map((city) => <button key={city.name} type="button" className={selectedCityName === city.name ? 'active' : ''} aria-pressed={selectedCityName === city.name} onClick={() => choose(city)}>{city.name}</button>)}</div>
      </div>}
    </div>
  )
}

import { useState } from 'react'
import { cityRegions, findBrowseCity, popularCityNames, type BrowseCity } from '../data/cityBrowser'
import ChipButton from './ChipButton'
import '../styles/cityBrowser.css'

type Props = { open: boolean; onSelectCity: (city: BrowseCity) => void; selectedCityName?: string }

export default function CityBrowser({ open, onSelectCity, selectedCityName }: Props) {
  const [regionIndex, setRegionIndex] = useState(0)
  const [countryIndex, setCountryIndex] = useState<number | null>(0)
  const region = cityRegions[regionIndex]
  const selectedCountry = countryIndex === null ? null : region.countries[countryIndex]

  function choose(city: BrowseCity) {
    onSelectCity(city)
  }

  function changeRegion(index: number) {
    setRegionIndex(index)
    setCountryIndex(index === 0 ? 0 : null)
  }

  return (
    <div className="city-browser">
      {!open && <div className="popular-cities"><span>인기 검색지</span>{popularCityNames.map((name) => {
        const city = findBrowseCity(name)!
        return <ChipButton key={name} selected={selectedCityName === name} onClick={() => choose(city)}>{name}</ChipButton>
      })}</div>}
      {open && <div className="city-browser-panel" id="city-browser-panel">
        <div className="city-browser-step"><strong>01 지역 선택</strong></div>
        <div className="city-region-list">{cityRegions.map((item, index) => <ChipButton key={item.name} selected={index === regionIndex} onClick={() => changeRegion(index)}>{item.name}</ChipButton>)}</div>
        {region.countries.length > 1 && <>
          <div className="city-browser-step"><strong>02 국가 선택</strong>{!selectedCountry && <span>국가를 선택하면 도시가 보여요.</span>}</div>
          <div className="city-country-list">{region.countries.map((item, index) => <ChipButton key={item.name} selected={index === countryIndex} onClick={() => setCountryIndex(index)}>{item.name}</ChipButton>)}</div>
        </>}
        {selectedCountry && <>
          <div className="city-browser-step"><strong>{region.countries.length > 1 ? '03' : '02'} 도시 선택</strong></div>
          <div className="city-browser-grid">{selectedCountry.cities.map((city) => <ChipButton key={city.name} selected={selectedCityName === city.name} onClick={() => choose(city)}>{city.name}</ChipButton>)}</div>
        </>}
      </div>}
    </div>
  )
}

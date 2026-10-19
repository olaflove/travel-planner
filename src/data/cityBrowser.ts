export type BrowseCity = {
  name: string
  country: string
  query: string
  referencePoint?: string
  countryCode?: string
}

export type BrowseCountry = {
  name: string
  cities: BrowseCity[]
}

export type BrowseRegion = {
  name: string
  countries: BrowseCountry[]
}

type Lookup = string | { query: string; referencePoint: string; countryCode?: string }

function country(name: string, names: string[], lookups: Record<string, Lookup> = {}): BrowseCountry {
  return {
    name,
    cities: names.map((cityName) => {
      const lookup = lookups[cityName]
      return {
        name: cityName,
        country: name,
        query: typeof lookup === 'string' ? lookup : lookup?.query ?? cityName,
        referencePoint: typeof lookup === 'object' ? lookup.referencePoint : undefined,
        countryCode: typeof lookup === 'object' ? lookup.countryCode : undefined,
      }
    }),
  }
}

// 이 메뉴는 도시 탐색용이다. 월별 추천 대상 30개 도시와는 별도로 관리한다.
export const cityRegions: BrowseRegion[] = [
  {
    name: '일본',
    countries: [country('일본', ['도쿄', '후쿠오카', '오사카', '가고시마', '시즈오카', '나고야', '삿포로', '오키나와', '히로시마', '나가사키', '요나고', '다카마쓰', '대마도', '마쓰야마', '구마모토'], {
      가고시마: 'Kagoshima, Japan', 시즈오카: 'Shizuoka, Japan', 나고야: 'Nagoya, Japan', 삿포로: 'Sapporo, Japan',
      오키나와: { query: 'Naha, Japan', referencePoint: '나하' }, 히로시마: 'Hiroshima, Japan', 나가사키: 'Nagasaki, Japan',
      요나고: 'Yonago, Japan', 다카마쓰: 'Takamatsu, Japan', 대마도: { query: 'Izuhara, Japan', referencePoint: '이즈하라' },
      마쓰야마: 'Matsuyama, Japan', 구마모토: 'Kumamoto, Japan',
    })],
  },
  {
    name: '중화권',
    countries: [
      country('대만', ['가오슝', '타이베이'], { 가오슝: 'Kaohsiung, Taiwan' }),
      country('중국', ['칭다오', '하이난', '대련', '연태', '상하이', '베이징'], {
        칭다오: 'Qingdao, China', 하이난: { query: 'Haikou, China', referencePoint: '하이커우' },
        대련: 'Dalian, China', 연태: 'Yantai, China',
      }),
      country('홍콩', ['홍콩']),
    ],
  },
  {
    name: '동남아시아',
    countries: [
      country('베트남', ['나트랑', '다낭', '하노이', '달랏', '호치민', '푸꾸옥'], {
        하노이: 'Hanoi, Vietnam', 달랏: 'Da Lat, Vietnam', 호치민: 'Ho Chi Minh City, Vietnam', 푸꾸옥: 'Phu Quoc, Vietnam',
      }),
      country('필리핀', ['마닐라', '세부', '보라카이'], { 마닐라: 'Manila, Philippines', 세부: 'Cebu City, Philippines', 보라카이: 'Boracay, Philippines' }),
      country('태국', ['방콕', '치앙마이', '푸켓'], { 푸켓: 'Phuket, Thailand' }),
      country('말레이시아', ['쿠알라룸푸르', '코타키나발루']),
      country('싱가포르', ['싱가포르']),
      country('인도네시아', ['발리']),
    ],
  },
  {
    name: '아시아',
    countries: [
      country('몽골', ['울란바타르'], { 울란바타르: 'Ulaanbaatar, Mongolia' }),
      country('카자흐스탄', ['알마티'], { 알마티: 'Almaty, Kazakhstan' }),
      country('아랍에미리트', ['두바이'], { 두바이: 'Dubai, United Arab Emirates' }),
      country('튀르키예', ['이스탄불', '카파도키아'], { 이스탄불: 'Istanbul', 카파도키아: { query: 'Goreme', referencePoint: '괴레메', countryCode: 'TR' } }),
      country('몰디브', ['몰디브'], { 몰디브: { query: 'Male, Maldives', referencePoint: '말레' } }),
    ],
  },
  {
    name: '남태평양',
    countries: [
      country('호주', ['시드니', '멜버른', '브리즈번'], { 멜버른: 'Melbourne, Australia', 브리즈번: 'Brisbane, Australia' }),
      country('뉴질랜드', ['오클랜드', '퀸스타운'], { 오클랜드: 'Auckland, New Zealand', 퀸스타운: 'Queenstown, New Zealand' }),
      country('미국령 괌', ['괌']),
      country('북마리아나 제도', ['사이판']),
    ],
  },
  {
    name: '유럽',
    countries: [
      country('크로아티아', ['두브로브니크', '자그레브'], { 두브로브니크: 'Dubrovnik, Croatia', 자그레브: 'Zagreb, Croatia' }),
      country('포르투갈', ['리스본'], { 리스본: 'Lisbon, Portugal' }),
      country('이탈리아', ['밀라노', '로마', '피렌체'], { 밀라노: 'Milan, Italy', 피렌체: 'Florence, Italy' }),
      country('벨기에', ['브뤼셀'], { 브뤼셀: 'Brussels, Belgium' }),
      country('핀란드', ['헬싱키'], { 헬싱키: 'Helsinki, Finland' }),
      country('그리스', ['아테네'], { 아테네: 'Athens, Greece' }),
      country('프랑스', ['니스', '파리'], { 니스: 'Nice, France' }),
      country('스페인', ['마요르카', '바르셀로나', '마드리드'], { 마요르카: { query: 'Palma, Spain', referencePoint: '팔마' }, 마드리드: 'Madrid, Spain' }),
      country('체코', ['프라하']),
      country('영국', ['런던']),
      country('오스트리아', ['빈']),
      country('스위스', ['인터라켄', '취리히'], { 취리히: 'Zurich, Switzerland' }),
      country('헝가리', ['부다페스트']),
      country('독일', ['프랑크푸르트', '뮌헨', '베를린'], { 프랑크푸르트: 'Frankfurt am Main, Germany', 뮌헨: 'Munich, Germany', 베를린: 'Berlin, Germany' }),
      country('네덜란드', ['암스테르담']),
    ],
  },
  {
    name: '미주',
    countries: [
      country('캐나다', ['밴쿠버', '토론토'], { 토론토: 'Toronto, Canada' }),
      country('미국', ['샌프란시스코', '시애틀', '하와이', '뉴욕', '로스앤젤레스'], {
        샌프란시스코: 'San Francisco, United States', 시애틀: 'Seattle, United States',
        하와이: { query: 'Honolulu, United States', referencePoint: '호놀룰루' },
      }),
    ],
  },
]

export const popularCityNames = ['후쿠오카', '상하이', '다낭', '방콕']

export function findBrowseCity(name: string): BrowseCity | undefined {
  for (const region of cityRegions) {
    for (const item of region.countries) {
      const city = item.cities.find((candidate) => candidate.name === name)
      if (city) return city
    }
  }
  return undefined
}

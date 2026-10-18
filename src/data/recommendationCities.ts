export type RecommendationCity = {
  name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}

// 사용자가 지정한 기존 21개 여행지와 유럽 추천 도시 9개.
// 발리는 덴파사르, 괌은 하갓냐를 대표 지점으로 사용한다.
export const recommendationCities: RecommendationCity[] = [
  { name: '후쿠오카', country: '일본', latitude: 33.6, longitude: 130.41667, timezone: 'Asia/Tokyo' },
  { name: '오사카', country: '일본', latitude: 34.69379, longitude: 135.50107, timezone: 'Asia/Tokyo' },
  { name: '도쿄', country: '일본', latitude: 35.6895, longitude: 139.69171, timezone: 'Asia/Tokyo' },
  { name: '상하이', country: '중국', latitude: 31.22222, longitude: 121.45806, timezone: 'Asia/Shanghai' },
  { name: '베이징', country: '중국', latitude: 39.9075, longitude: 116.39723, timezone: 'Asia/Shanghai' },
  { name: '다낭', country: '베트남', latitude: 16.06778, longitude: 108.22083, timezone: 'Asia/Ho_Chi_Minh' },
  { name: '나트랑', country: '베트남', latitude: 12.24507, longitude: 109.19432, timezone: 'Asia/Ho_Chi_Minh' },
  { name: '방콕', country: '태국', latitude: 13.75398, longitude: 100.50144, timezone: 'Asia/Bangkok' },
  { name: '치앙마이', country: '태국', latitude: 18.79038, longitude: 98.98468, timezone: 'Asia/Bangkok' },
  { name: '타이베이', country: '대만', latitude: 25.05306, longitude: 121.52639, timezone: 'Asia/Taipei' },
  { name: '홍콩', country: '홍콩', latitude: 22.27832, longitude: 114.17469, timezone: 'Asia/Hong_Kong' },
  { name: '싱가포르', country: '싱가포르', latitude: 1.28967, longitude: 103.85007, timezone: 'Asia/Singapore' },
  { name: '쿠알라룸푸르', country: '말레이시아', latitude: 3.1412, longitude: 101.68653, timezone: 'Asia/Kuala_Lumpur' },
  { name: '코타키나발루', country: '말레이시아', latitude: 5.9749, longitude: 116.0724, timezone: 'Asia/Kuching' },
  { name: '발리', country: '인도네시아 · 덴파사르 기준', latitude: -8.65, longitude: 115.21667, timezone: 'Asia/Makassar' },
  { name: '시드니', country: '호주', latitude: -33.86785, longitude: 151.20732, timezone: 'Australia/Sydney' },
  { name: '괌', country: '미국령 괌 · 하갓냐 기준', latitude: 13.47567, longitude: 144.74886, timezone: 'Pacific/Guam' },
  { name: '사이판', country: '북마리아나 제도', latitude: 15.21233, longitude: 145.7545, timezone: 'Pacific/Saipan' },
  { name: '뉴욕', country: '미국', latitude: 40.71427, longitude: -74.00597, timezone: 'America/New_York' },
  { name: '로스앤젤레스', country: '미국', latitude: 34.05223, longitude: -118.24368, timezone: 'America/Los_Angeles' },
  { name: '밴쿠버', country: '캐나다', latitude: 49.24966, longitude: -123.11934, timezone: 'America/Vancouver' },
  { name: '파리', country: '프랑스', latitude: 48.85341, longitude: 2.3488, timezone: 'Europe/Paris' },
  { name: '런던', country: '영국', latitude: 51.50853, longitude: -0.12574, timezone: 'Europe/London' },
  { name: '암스테르담', country: '네덜란드', latitude: 52.37403, longitude: 4.88969, timezone: 'Europe/Amsterdam' },
  { name: '로마', country: '이탈리아', latitude: 41.89193, longitude: 12.51133, timezone: 'Europe/Rome' },
  { name: '바르셀로나', country: '스페인', latitude: 41.38879, longitude: 2.15899, timezone: 'Europe/Madrid' },
  { name: '프라하', country: '체코', latitude: 50.08804, longitude: 14.42076, timezone: 'Europe/Prague' },
  { name: '빈', country: '오스트리아', latitude: 48.20849, longitude: 16.37208, timezone: 'Europe/Vienna' },
  { name: '부다페스트', country: '헝가리', latitude: 47.49835, longitude: 19.04045, timezone: 'Europe/Budapest' },
  { name: '인터라켄', country: '스위스', latitude: 46.68387, longitude: 7.86638, timezone: 'Europe/Zurich' },
]

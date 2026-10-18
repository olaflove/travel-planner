import { Link, useLocation } from 'react-router'

export default function Header() {
  const isWeatherPage = useLocation().pathname === '/weather'
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="어디로 홈">
        <span className="brand-mark" aria-hidden="true">✳</span>
        <span>어디로</span>
      </Link>
      <nav className="header-nav" aria-label="주요 메뉴">
        <Link to="/weather" aria-current={isWeatherPage ? 'page' : undefined}>날씨와 옷차림</Link>
        <Link to="/#plan">일정 만들기</Link>
      </nav>
      <Link className="header-cta" to="/weather">여행 준비하기 <span aria-hidden="true">↗</span></Link>
    </header>
  )
}

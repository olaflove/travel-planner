export default function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="어디로 홈">
        <span className="brand-mark" aria-hidden="true">✳</span>
        <span>어디로</span>
      </a>
      <nav className="header-nav" aria-label="주요 메뉴">
        <a href="#weather">날씨와 옷차림</a>
        <a href="#plan">일정 만들기</a>
      </nav>
      <a className="header-cta" href="#weather">여행 준비하기 <span aria-hidden="true">↗</span></a>
    </header>
  )
}

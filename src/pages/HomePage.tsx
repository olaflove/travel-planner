import { useState } from 'react'
import Header from '../components/Header'
import DestinationSearch from '../components/DestinationSearch'
import FeatureCard from '../components/FeatureCard'

export default function HomePage() {
  const [showPlanNote, setShowPlanNote] = useState(false)

  return (
    <div id="top">
      <Header />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> 가볍게 시작하는 여행 준비</div>
            <h1 id="hero-title">낯선 도시도,<br /><em>떠나기 전부터</em> 편안하게.</h1>
            <p>여행할 도시와 시기만 고르세요.<br />그곳의 날씨와 옷차림부터 차근차근 준비해요.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sun" />
            <div className="art-cloud cloud-one" />
            <div className="art-cloud cloud-two" />
            <div className="art-hill hill-back" />
            <div className="art-hill hill-front" />
            <div className="art-road" />
            <div className="art-ticket"><span>YOUR NEXT STOP</span><strong>어디로?</strong><i>↗</i></div>
          </div>
          <div className="hero-index" aria-hidden="true">01 / 03 <span>EXPLORE MORE ↓</span></div>
        </section>

        <section className="search-section" aria-labelledby="search-title">
          <div className="section-heading">
            <span className="section-kicker">START HERE</span>
            <h2 id="search-title">이번 여행, 어디로 떠나세요?</h2>
            <p>도시와 여행할 달을 선택해 여행 준비를 시작해 보세요.</p>
          </div>
          <DestinationSearch />
        </section>

        <section className="features-section" aria-labelledby="features-title">
          <div className="section-heading compact">
            <span className="section-kicker">PLAN BETTER</span>
            <h2 id="features-title">여행 준비의 복잡함은 덜고,<br />설렘은 더하고.</h2>
          </div>
          <div className="feature-grid">
            <FeatureCard number="01" icon="☀" title="월별 날씨 확인" description="여행할 때의 평균적인 날씨를 한눈에 살펴보세요." className="weather-card" />
            <FeatureCard number="02" icon="♧" title="옷차림 가이드" description="기온에 맞는 옷차림을 참고해 짐을 준비하세요." className="outfit-card" />
            <FeatureCard number="03" icon="↗" title="자동 일정 만들기" description="가고 싶은 곳을 중심으로 여행 동선을 그려보세요." className="itinerary-card" />
          </div>
        </section>

        <section className="plan-section" id="plan" aria-labelledby="plan-title">
          <div className="plan-decoration" aria-hidden="true">✳</div>
          <div>
            <span className="section-kicker">NEXT STEP</span>
            <h2 id="plan-title">이제, 여행의 하루를 그려볼까요?</h2>
            <p>가고 싶은 도시의 명소를 담아 나만의 일정을 만들어 보세요.</p>
          </div>
          <button type="button" onClick={() => setShowPlanNote(true)}>일정 만들기 <span aria-hidden="true">→</span></button>
          {showPlanNote && <p className="plan-note" role="status">자동 일정 만들기는 다음 단계에서 구현할 예정이에요.</p>}
        </section>
      </main>
      <footer className="site-footer"><span>✳ 어디로</span><small>여행의 시작을 가볍게.</small></footer>
    </div>
  )
}

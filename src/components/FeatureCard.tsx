import { Link } from 'react-router'

type FeatureCardProps = {
  number: string
  icon: string
  title: string
  description: string
  className?: string
  to?: string
}

export default function FeatureCard({ number, icon, title, description, className = '', to }: FeatureCardProps) {
  const content = (
    <>
      <div className="feature-top"><span>{number}</span><span className="feature-icon" aria-hidden="true">{icon}</span></div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </>
  )
  const cardClass = `feature-card ${className}`
  return to ? <Link className={cardClass} to={to}>{content}</Link> : <article className={cardClass}>{content}</article>
}

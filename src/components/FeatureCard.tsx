type FeatureCardProps = {
  number: string
  icon: string
  title: string
  description: string
  className?: string
}

export default function FeatureCard({ number, icon, title, description, className = '' }: FeatureCardProps) {
  return (
    <article className={`feature-card ${className}`}>
      <div className="feature-top"><span>{number}</span><span className="feature-icon" aria-hidden="true">{icon}</span></div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  )
}

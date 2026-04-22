export function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`surface-card section-card ${className}`.trim()}>
      <div className="section-card__header">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

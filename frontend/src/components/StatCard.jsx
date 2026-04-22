export function StatCard({ label, value, accent, meta }) {
  return (
    <article className="surface-card stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      <div className="stat-card__footer">
        <span className={`status-dot status-dot--${accent || "neutral"}`} />
        <p>{meta}</p>
      </div>
    </article>
  );
}

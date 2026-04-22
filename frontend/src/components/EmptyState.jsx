export function EmptyState({ eyebrow, title, description, action }) {
  return (
    <div className="empty-state">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

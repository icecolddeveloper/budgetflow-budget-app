import { PencilLine, Trash2 } from "lucide-react";

import { formatCurrency } from "../utils/format";
import { resolveCategoryIcon } from "../utils/icons";

export function CategoryCard({ category, onEdit, onDelete, compact = false }) {
  const Icon = resolveCategoryIcon(category.icon);

  return (
    <article className={`surface-card category-card ${compact ? "category-card--compact" : ""}`}>
      <div className="category-card__header">
        <div className="category-card__identity">
          <span className="category-card__icon" style={{ backgroundColor: `${category.color}18`, color: category.color }}>
            <Icon size={20} />
          </span>
          <div>
            <h3>
              {category.name}
              {category.is_primary ? <span className="category-card__tag">Wallet</span> : null}
            </h3>
            <p>{category.description || "Flexible spending bucket"}</p>
          </div>
        </div>
        {onEdit || onDelete ? (
          <div className="category-card__actions">
            {onEdit ? (
              <button type="button" className="icon-button" onClick={() => onEdit(category)} aria-label={`Edit ${category.name}`}>
                <PencilLine size={16} />
              </button>
            ) : null}
            {onDelete && !category.is_primary ? (
              <button
                type="button"
                className="icon-button icon-button--danger"
                onClick={() => onDelete(category)}
                aria-label={`Delete ${category.name}`}
              >
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="category-card__numbers">
        <div>
          <span className="metric-label">Current balance</span>
          <strong>{formatCurrency(category.balance)}</strong>
        </div>
      </div>
    </article>
  );
}

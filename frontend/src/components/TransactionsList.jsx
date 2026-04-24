import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight } from "lucide-react";

import { formatCurrency, formatDateTime } from "../utils/format";

const iconMap = {
  deposit: ArrowDownLeft,
  transfer: ArrowRightLeft,
  withdraw: ArrowUpRight,
};

const kindLabelMap = {
  deposit: "Income",
  withdraw: "Expense",
  transfer: "Allocate",
};

export function TransactionsList({ transactions, compact = false }) {
  return (
    <div className={`transactions-list ${compact ? "transactions-list--compact" : ""}`}>
      {transactions.map((transaction) => {
        const Icon = iconMap[transaction.kind] || ArrowRightLeft;

        return (
          <article key={transaction.id} className="transaction-row">
            <div className="transaction-row__main">
              <span className={`transaction-row__icon transaction-row__icon--${transaction.kind}`}>
                <Icon size={18} />
              </span>
              <div>
                <strong>{transaction.title}</strong>
                <p>{transaction.description || "No description added"}</p>
              </div>
            </div>

            <div className="transaction-row__meta">
              <span className={`pill pill--${transaction.kind}`}>
                {kindLabelMap[transaction.kind] || transaction.kind}
              </span>
              <strong>{formatCurrency(transaction.amount)}</strong>
              <time dateTime={transaction.occurred_at}>{formatDateTime(transaction.occurred_at)}</time>
            </div>
          </article>
        );
      })}
    </div>
  );
}

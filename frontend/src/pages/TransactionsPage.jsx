import { Search, Plus } from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";

import { budgetApi } from "../api/client";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { TransactionsList } from "../components/TransactionsList";
import { useToast } from "../components/ToastProvider";
import { formatCurrency } from "../utils/format";

const filters = [
  { value: "all", label: "All activity" },
  { value: "deposit", label: "Deposits" },
  { value: "withdraw", label: "Withdrawals" },
  { value: "transfer", label: "Transfers" },
];

export function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  async function loadData() {
    try {
      const [transactionResponse, categoryResponse] = await Promise.all([
        budgetApi.getTransactions(),
        budgetApi.getCategories(),
      ]);
      setTransactions(transactionResponse);
      setCategories(categoryResponse);
    } catch (error) {
      toast.error("Unable to load transactions", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(payload) {
    try {
      await budgetApi.createTransaction(payload);
      toast.success("Transaction saved", "Your ledger and category balances are updated.");
      setShowModal(false);
      await loadData();
    } catch (error) {
      toast.error("Could not save transaction", error.message);
    }
  }

  if (loading) {
    return <LoadingState message="Loading your transaction history..." />;
  }

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter !== "all" && transaction.kind !== filter) {
      return false;
    }

    if (!deferredQuery) {
      return true;
    }

    const haystack = [
      transaction.title,
      transaction.description,
      transaction.source_category_label,
      transaction.destination_category_label,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredQuery);
  });

  const depositTotal = transactions
    .filter((transaction) => transaction.kind === "deposit")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const outflowTotal = transactions
    .filter((transaction) => transaction.kind !== "deposit")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Activity feed</span>
          <h2>Stay close to every deposit, withdrawal, and category transfer</h2>
          <p>
            Search history instantly, review the latest money movement, and capture new actions in
            one place.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Add transaction
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Transactions"
          value={transactions.length}
          accent="neutral"
          meta="Recorded in your ledger"
        />
        <StatCard
          label="Total deposits"
          value={formatCurrency(depositTotal)}
          accent="success"
          meta="Funds added to categories"
        />
        <StatCard
          label="Total outflow"
          value={formatCurrency(outflowTotal)}
          accent="warning"
          meta="Withdrawals and transfers"
        />
      </section>

      <SectionCard title="Transaction history" subtitle="Filter and search your ledger without losing detail">
        <div className="toolbar">
          <div className="search-field">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search descriptions or categories"
            />
          </div>

          <div className="filter-row" role="tablist" aria-label="Transaction type filters">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`pill-button ${filter === item.value ? "pill-button--active" : ""}`}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length ? (
          <TransactionsList transactions={filteredTransactions} />
        ) : (
          <EmptyState
            eyebrow="No matching transactions"
            title="Nothing matches your current filters"
            description="Try a different keyword, switch the filter, or create a new transaction."
            action={
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(true)}>
                <Plus size={16} />
                Add transaction
              </button>
            }
          />
        )}
      </SectionCard>

      {showModal ? (
        <TransactionFormModal
          categories={categories}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}

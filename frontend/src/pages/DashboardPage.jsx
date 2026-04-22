import { ArrowRightLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { budgetApi } from "../api/client";
import { CashflowChart } from "../components/CashflowChart";
import { CategoryCard } from "../components/CategoryCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { SectionCard } from "../components/SectionCard";
import { SpendingChart } from "../components/SpendingChart";
import { StatCard } from "../components/StatCard";
import { useToast } from "../components/ToastProvider";
import { TransactionFormModal } from "../components/TransactionFormModal";
import { TransactionsList } from "../components/TransactionsList";
import { formatCurrency } from "../utils/format";

export function DashboardPage() {
  const toast = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  async function loadDashboard() {
    try {
      const response = await budgetApi.getDashboard();
      setDashboard(response);
    } catch (error) {
      toast.error("Unable to load dashboard", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleTransactionCreate(payload) {
    try {
      await budgetApi.createTransaction(payload);
      toast.success("Transaction saved", "Your balances and charts were refreshed.");
      setShowTransactionModal(false);
      await loadDashboard();
    } catch (error) {
      toast.error("Could not save transaction", error.message);
    }
  }

  if (loading) {
    return <LoadingState message="Loading your financial overview..." />;
  }

  if (!dashboard) {
    return (
      <EmptyState
        eyebrow="Dashboard unavailable"
        title="We could not load your budget workspace"
        description="Try refreshing the page once your backend is running."
      />
    );
  }

  const topCategories = dashboard.categories.slice(0, 4);
  const trendData = dashboard.cashflow_trend.map((item) => ({
    ...item,
    deposits: Number(item.deposits),
    spending: Number(item.spending),
  }));
  const spendingData = dashboard.spending_breakdown.map((item) => ({
    ...item,
    total: Number(item.total),
  }));

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">This month</span>
          <h2>{formatCurrency(dashboard.total_balance)} available across your plan</h2>
          <p>
            Keep an eye on category health, recent activity, and how cash is moving in and out of
            your budget.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowTransactionModal(true)}>
          <ArrowRightLeft size={16} />
          New transaction
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Total balance"
          value={formatCurrency(dashboard.total_balance)}
          accent="success"
          meta="Available across all categories"
        />
        <StatCard
          label="Monthly inflow"
          value={formatCurrency(dashboard.monthly_inflow)}
          accent="success"
          meta="Funds added this month"
        />
        <StatCard
          label="Monthly outflow"
          value={formatCurrency(dashboard.monthly_outflow)}
          accent="warning"
          meta="Spending and transfers out"
        />
        <StatCard
          label="Active categories"
          value={dashboard.category_count}
          accent="neutral"
          meta="Buckets currently in your system"
        />
      </section>

      <section className="dashboard-grid">
        <SectionCard
          title="Spending trend"
          subtitle="Six-month view of deposits versus outflow"
          className="dashboard-grid__wide"
        >
          <CashflowChart data={trendData} />
        </SectionCard>

        <SectionCard title="Spending mix" subtitle="Where your outflow is concentrated right now">
          {spendingData.length ? (
            <>
              <SpendingChart data={spendingData} />
              <div className="legend-list">
                {spendingData.map((item) => (
                  <div key={item.category} className="legend-item">
                    <span className="legend-item__swatch" style={{ backgroundColor: item.color }} />
                    <div>
                      <strong>{item.category}</strong>
                      <p>{formatCurrency(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              eyebrow="No outflow yet"
              title="Your chart will come alive with activity"
              description="Create a withdrawal or transfer to start building a spending view."
              action={
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransactionModal(true)}>
                  <Plus size={16} />
                  Add first transaction
                </button>
              }
            />
          )}
        </SectionCard>
      </section>

      <section className="dashboard-grid">
        <SectionCard
          title="Category balances"
          subtitle="Your top funded categories at a glance"
          action={
            <Link to="/categories" className="text-link">
              Manage categories
            </Link>
          }
          className="dashboard-grid__wide"
        >
          {topCategories.length ? (
            <div className="category-grid">
              {topCategories.map((category) => (
                <CategoryCard key={category.id} category={category} compact />
              ))}
            </div>
          ) : (
            <EmptyState
              eyebrow="No categories"
              title="Start shaping your budget"
              description="Add your first category to organize how money should move."
            />
          )}
        </SectionCard>

        <SectionCard title="Recent activity" subtitle="The latest money movement across your plan">
          {dashboard.recent_transactions.length ? (
            <TransactionsList transactions={dashboard.recent_transactions} compact />
          ) : (
            <EmptyState
              eyebrow="No activity yet"
              title="Your ledger is ready"
              description="Once you add a transaction, it will appear here with timestamps and context."
            />
          )}
        </SectionCard>
      </section>

      {showTransactionModal ? (
        <TransactionFormModal
          categories={dashboard.categories}
          onClose={() => setShowTransactionModal(false)}
          onSubmit={handleTransactionCreate}
        />
      ) : null}
    </div>
  );
}

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { budgetApi } from "../api/client";
import { CategoryCard } from "../components/CategoryCard";
import { CategoryFormModal } from "../components/CategoryFormModal";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { SectionCard } from "../components/SectionCard";
import { StatCard } from "../components/StatCard";
import { useToast } from "../components/ToastProvider";
import { formatCurrency } from "../utils/format";

export function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  async function loadCategories() {
    try {
      const response = await budgetApi.getCategories();
      setCategories(response);
    } catch (error) {
      toast.error("Unable to load categories", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(payload) {
    try {
      if (editingCategory) {
        await budgetApi.updateCategory(editingCategory.id, payload);
        toast.success("Category updated", "Your category settings are now live.");
      } else {
        await budgetApi.createCategory(payload);
        toast.success("Category created", "A new budget bucket was added successfully.");
      }
      setShowModal(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      toast.error("Could not save category", error.message);
    }
  }

  async function handleDelete(category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"? Categories must have a zero balance before they can be removed.`
    );
    if (!confirmed) {
      return;
    }

    try {
      await budgetApi.deleteCategory(category.id);
      toast.success("Category deleted", "The category was removed from your plan.");
      await loadCategories();
    } catch (error) {
      toast.error("Could not delete category", error.message);
    }
  }

  if (loading) {
    return <LoadingState message="Loading category balances..." />;
  }

  const totalBalance = categories.reduce((sum, category) => sum + Number(category.balance), 0);
  const totalTarget = categories.reduce((sum, category) => sum + Number(category.monthly_budget), 0);

  return (
    <div className="page-stack">
      <section className="hero-banner">
        <div>
          <span className="eyebrow">Category system</span>
          <h2>Shape the buckets that define your budget strategy</h2>
          <p>
            Give each stream of money a clear purpose with visual labels, target amounts, and
            current balances.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingCategory(null);
            setShowModal(true);
          }}
        >
          <Plus size={16} />
          Add category
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Categories"
          value={categories.length}
          accent="neutral"
          meta="Active budget buckets"
        />
        <StatCard
          label="Allocated balance"
          value={formatCurrency(totalBalance)}
          accent="success"
          meta="Money currently sitting in categories"
        />
        <StatCard
          label="Monthly targets"
          value={formatCurrency(totalTarget)}
          accent="warning"
          meta="Combined target across categories"
        />
      </section>

      <SectionCard
        title="All categories"
        subtitle="Edit names, colors, icons, and monthly targets as your plan evolves"
      >
        {categories.length ? (
          <div className="category-grid category-grid--full">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={(selectedCategory) => {
                  setEditingCategory(selectedCategory);
                  setShowModal(true);
                }}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            eyebrow="No categories yet"
            title="Create your first budget bucket"
            description="Start with food, rent, or savings and build the structure of your plan from there."
            action={
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditingCategory(null);
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                Create category
              </button>
            }
          />
        )}
      </SectionCard>

      {showModal ? (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </div>
  );
}

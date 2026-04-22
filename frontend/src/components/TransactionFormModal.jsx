import { useState } from "react";

import { ModalShell } from "./ModalShell";

const transactionKinds = [
  { value: "deposit", label: "Deposit" },
  { value: "withdraw", label: "Withdraw" },
  { value: "transfer", label: "Transfer" },
];

function formatLocalDateTime() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - offset * 60000);
  return localTime.toISOString().slice(0, 16);
}

export function TransactionFormModal({ categories, onClose, onSubmit }) {
  const [form, setForm] = useState({
    kind: "deposit",
    amount: "",
    description: "",
    source_category: "",
    destination_category: categories[0]?.id ? String(categories[0].id) : "",
    occurred_at: formatLocalDateTime(),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const sortedCategories = [...categories].sort((left, right) => left.name.localeCompare(right.name));

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.amount || Number(form.amount) <= 0) {
      nextErrors.amount = "Enter an amount greater than zero.";
    }
    if (form.kind === "deposit" && !form.destination_category) {
      nextErrors.destination_category = "Choose a category to fund.";
    }
    if (form.kind === "withdraw" && !form.source_category) {
      nextErrors.source_category = "Choose a category to spend from.";
    }
    if (form.kind === "transfer") {
      if (!form.source_category) {
        nextErrors.source_category = "Choose a source category.";
      }
      if (!form.destination_category) {
        nextErrors.destination_category = "Choose a destination category.";
      }
      if (
        form.source_category &&
        form.destination_category &&
        form.source_category === form.destination_category
      ) {
        nextErrors.destination_category = "Choose a different destination category.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        amount: Number(form.amount).toFixed(2),
        source_category: form.source_category || null,
        destination_category: form.destination_category || null,
        occurred_at: new Date(form.occurred_at).toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      title="New transaction"
      description="Move money with a single action and keep every category balance up to date."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Type</span>
            <select name="kind" value={form.kind} onChange={updateField}>
              {transactionKinds.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Amount</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={updateField}
              placeholder="0.00"
            />
            {errors.amount ? <small>{errors.amount}</small> : null}
          </label>

          {form.kind !== "deposit" ? (
            <label className="field">
              <span>Source category</span>
              <select name="source_category" value={form.source_category} onChange={updateField}>
                <option value="">Select a category</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.source_category ? <small>{errors.source_category}</small> : null}
            </label>
          ) : null}

          {form.kind !== "withdraw" ? (
            <label className="field">
              <span>Destination category</span>
              <select
                name="destination_category"
                value={form.destination_category}
                onChange={updateField}
              >
                <option value="">Select a category</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.destination_category ? <small>{errors.destination_category}</small> : null}
            </label>
          ) : null}

          <label className="field">
            <span>Time</span>
            <input
              type="datetime-local"
              name="occurred_at"
              value={form.occurred_at}
              onChange={updateField}
            />
          </label>

          <label className="field field--full">
            <span>Description</span>
            <textarea
              rows="3"
              name="description"
              value={form.description}
              onChange={updateField}
              placeholder="Add context like weekly groceries or rent transfer."
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Processing..." : "Save transaction"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

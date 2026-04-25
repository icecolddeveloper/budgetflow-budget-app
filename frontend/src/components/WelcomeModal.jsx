import { ArrowRightLeft, Receipt, Sparkles, WalletCards } from "lucide-react";
import { useState } from "react";

import { ModalShell } from "./ModalShell";

const slides = [
  {
    Icon: WalletCards,
    eyebrow: "Step 1 of 3",
    title: "Your paycheck lands in Wallet",
    body:
      "Every time you get paid, log it as Income into your Wallet. It's your home for unallocated funds, ready to be distributed.",
  },
  {
    Icon: ArrowRightLeft,
    eyebrow: "Step 2 of 3",
    title: "Allocate to envelopes",
    body:
      "Split your Wallet into category envelopes like Rent, Food, or Savings. Every dollar gets a job before you spend it.",
  },
  {
    Icon: Receipt,
    eyebrow: "Step 3 of 3",
    title: "Spend from the right envelope",
    body:
      "When you buy something, log an Expense from the matching envelope. You'll always see what's left in each pocket.",
  },
];

export function WelcomeModal({ onClose }) {
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;
  const isFirst = index === 0;
  const slide = slides[index];
  const { Icon } = slide;

  function handleNext() {
    if (isLast) {
      onClose();
    } else {
      setIndex((current) => current + 1);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setIndex((current) => current - 1);
    }
  }

  return (
    <ModalShell
      title="Welcome to BudgetFlow"
      description="A quick tour of how your money flows."
      onClose={onClose}
    >
      <div className="welcome-modal">
        <div className="welcome-modal__hero">
          <span className="welcome-modal__icon">
            <Icon size={28} />
          </span>
          <span className="welcome-modal__eyebrow">{slide.eyebrow}</span>
          <h3>{slide.title}</h3>
          <p>{slide.body}</p>
        </div>

        <div className="welcome-modal__dots" role="tablist" aria-label="Tour progress">
          {slides.map((item, slideIndex) => (
            <button
              key={item.title}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              className={`welcome-modal__dot ${
                slideIndex === index ? "welcome-modal__dot--active" : ""
              }`}
              onClick={() => setIndex(slideIndex)}
              aria-label={`Go to step ${slideIndex + 1}`}
            />
          ))}
        </div>

        <div className="welcome-modal__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Skip tour
          </button>
          <div className="welcome-modal__nav">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleBack}
              disabled={isFirst}
            >
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={handleNext}>
              {isLast ? (
                <>
                  <Sparkles size={16} />
                  Get started
                </>
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

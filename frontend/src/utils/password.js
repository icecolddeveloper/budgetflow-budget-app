const STRENGTH_LABELS = ["Too weak", "Weak", "Okay", "Good", "Strong"];

export function computePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: "" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score = Math.min(score + 1, 4);

  return { score, label: STRENGTH_LABELS[score] };
}

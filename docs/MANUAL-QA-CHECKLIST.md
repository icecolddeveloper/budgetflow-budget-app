# Manual QA Checklist

Use this when a change affects flows, UX, or setup.

## Auth

- [ ] Sign up works with a new username and valid password
- [ ] Starter categories are created after registration
- [ ] Login works with the new account
- [ ] Invalid login shows a useful error
- [ ] Protected routes redirect correctly when logged out

## Dashboard

- [ ] Dashboard loads without crashing
- [ ] Total balance card renders
- [ ] Recent transactions render after activity exists
- [ ] Empty states appear when there is no activity
- [ ] Charts render without console errors

## Categories

- [ ] Create category works
- [ ] Edit category updates fields correctly
- [ ] Delete category is blocked when balance is not zero
- [ ] Zero-balance category can be deleted

## Transactions

- [ ] Deposit increases destination category balance
- [ ] Withdraw decreases source category balance
- [ ] Transfer moves funds between two different categories
- [ ] Insufficient balance shows a clear error
- [ ] Transaction history shows title, description, amount, and timestamp

## Responsive checks

- [ ] Auth page works on desktop
- [ ] Auth page works on mobile width
- [ ] Dashboard cards stack cleanly on mobile
- [ ] Categories layout is readable on tablet and mobile
- [ ] Transactions toolbar remains usable on small screens

## Docs and repo hygiene

- [ ] README instructions still match the actual project
- [ ] New environment variables are documented
- [ ] Screenshots are updated if the UI changed meaningfully

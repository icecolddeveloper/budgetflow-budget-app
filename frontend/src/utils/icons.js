import {
  Building2,
  CarFront,
  CircleDollarSign,
  LayoutGrid,
  PartyPopper,
  PiggyBank,
  UtensilsCrossed,
  WalletCards,
} from "lucide-react";

export const categoryIconMap = {
  "building-2": Building2,
  "car-front": CarFront,
  "party-popper": PartyPopper,
  "piggy-bank": PiggyBank,
  "utensils-crossed": UtensilsCrossed,
  "circle-dollar-sign": CircleDollarSign,
  "wallet-cards": WalletCards,
  wallet: WalletCards,
};

export function resolveCategoryIcon(iconName) {
  return categoryIconMap[iconName] || LayoutGrid;
}

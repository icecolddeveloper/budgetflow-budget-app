import {
  ArrowRightLeft,
  LayoutGrid,
  LogOut,
  PieChart,
  Plus,
  Sparkles,
} from "lucide-react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const navigation = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/categories", label: "Categories", icon: PieChart },
  { to: "/transactions", label: "Transactions", icon: ArrowRightLeft },
];

const pageMeta = {
  "/dashboard": {
    title: "Financial command center",
    description: "Track the flow of every dollar and keep your categories healthy.",
  },
  "/categories": {
    title: "Category planning",
    description: "Shape the budgets, targets, and visual labels behind your money system.",
  },
  "/transactions": {
    title: "Ledger activity",
    description: "Capture deposits, withdrawals, and transfers with a clean operational view.",
  },
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentMeta = pageMeta[location.pathname] || pageMeta["/dashboard"];

  function handleLogout() {
    logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand-mark">
          <span className="brand-mark__badge">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>BudgetFlow</strong>
            <p>Premium personal finance workspace</p>
          </div>
        </div>

        <nav className="nav-stack" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "nav-link--active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-cta">
          <p>Keep every category funded and every decision visible.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/transactions")}>
            <Plus size={16} />
            Quick add from any page
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div>
            <span className="eyebrow">Budget workspace</span>
            <h1>{currentMeta.title}</h1>
            <p>{currentMeta.description}</p>
          </div>

          <div className="app-header__actions">
            <div className="user-pill">
              <span>{user?.first_name?.trim() || user?.username?.slice(0, 1)?.toUpperCase() || "U"}</span>
              <div>
                <strong>{user?.first_name || user?.username}</strong>
                <p>{user?.email || "Your secure budget account"}</p>
              </div>
            </div>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </header>

        <div className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <Outlet />
      </div>
    </div>
  );
}

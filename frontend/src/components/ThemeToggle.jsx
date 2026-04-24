import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme } from "../context/ThemeContext";

const modeMeta = {
  system: { Icon: Monitor, label: "System" },
  light: { Icon: Sun, label: "Light" },
  dark: { Icon: Moon, label: "Dark" },
};

const nextMode = { system: "light", light: "dark", dark: "system" };

export function ThemeToggle() {
  const { mode, cycleMode } = useTheme();
  const { Icon, label } = modeMeta[mode] || modeMeta.system;
  const next = modeMeta[nextMode[mode]] || modeMeta.system;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycleMode}
      aria-label={`Theme: ${label}. Switch to ${next.label}.`}
      title={`Theme: ${label} (click for ${next.label})`}
    >
      <Icon size={16} />
    </button>
  );
}

'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-inner">
        <span className="sun-icon" aria-hidden="true">
          ☀️
        </span>
        <span className="moon-icon" aria-hidden="true">
          🌙
        </span>
        <span className="toggle-thumb" data-theme={theme} />
      </div>
    </button>
  );
}
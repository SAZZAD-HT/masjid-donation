'use client';
// components/DarkModeToggle.js
import { useDarkMode } from '../lib/darkMode';

export default function DarkModeToggle({ style = {} }) {
  const { dark, toggle } = useDarkMode();

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      style={{
        width: 40, height: 40, borderRadius: '50%',
        background: dark ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.1)',
        border: dark ? '1.5px solid rgba(251,191,36,0.4)' : '1.5px solid rgba(255,255,255,0.2)',
        cursor: 'pointer', fontSize: '1.1rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

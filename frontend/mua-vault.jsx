const { useState, useEffect, useRef } = React;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');

:root {
  --teal:        #8b5cf6;
  --teal-deep:   #6d28d9;
  --teal-glow:   rgba(139,92,246,0.18);
  --teal-faint:  rgba(139,92,246,0.08);
  --pink:        #9d174d;
  --pink-hot:    #be185d;
  --pink-pale:   #fce7f3;
  --pink-glow:   rgba(157,23,77,0.16);
  --lime:        #1e3a5f;
  --lime-bright: #bfdbfe;
  --lime-glow:   rgba(30,58,95,0.14);
  --bg:          #f4f2f8;
  --bg-2:        #ffffff;
  --bg-3:        #ffffff;
  --glass:       rgba(255,255,255,0.72);
  --glass-2:     rgba(255,255,255,0.94);
  --text:        #18101e;
  --text-dim:    #6b5b8a;
  --text-faint:  #a090b8;
  --border:      #e0d8f0;
  --border-hot:  #c8c0dc;
  --scan-color:  rgba(139,92,246,0.03);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
  min-height: 100vh;
  overflow-x: hidden;
  cursor: auto;
  padding: 1.4rem;
}

.cursor {
  position: fixed;
  width: 10px; height: 10px;
  background: var(--pink);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%,-50%);
  transition: transform 0.08s, width 0.2s, height 0.2s, background 0.2s;
  mix-blend-mode: screen;
}
.cursor-ring {
  position: fixed;
  width: 32px; height: 32px;
  border: 1px solid var(--teal);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9998;
  transform: translate(-50%,-50%);
  transition: transform 0.18s ease, width 0.25s, height 0.25s, border-color 0.2s;
}

body::before {
  display: none;
}
@keyframes scan-shift {
  0%   { background-position-y: 0; }
  100% { background-position-y: 100px; }
}

body::after {
  display: none;
}

.layout {
  display: block;
}

.sidebar {
  position: sticky;
  top: 0;
  z-index: 200;
  width: 100%;
  height: auto;
  margin: 0 auto 1.1rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--glass);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;
  gap: 0.75rem;
}

.sidebar::after {
  display: none;
}

.logo-circle,
.sidebar-avatar,
.nav-circle {
  border-color: var(--border);
  background: var(--bg-2);
  color: var(--text);
  box-shadow: none;
}

.logo-circle {
  width: 44px;
  height: 44px;
  margin-bottom: 0;
}

.logo-letter,
.nav-circle,
.sidebar-avatar,
.topbar-title,
.section-title,
.view-title,
.morgue-look-name,
.prod-name,
.client-name,
.appt-name,
.card-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
}

.nav-circle {
  width: 42px;
  height: 42px;
}

.nav-tooltip,
.nav-badge {
  display: none;
}

.sidebar-spacer {
  display: none;
}

.main {
  margin-left: 0;
  min-height: auto;
}

.topbar {
  position: static;
  height: auto;
  padding: 0.9rem 1rem;
  gap: 0.8rem;
  flex-wrap: wrap;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--glass);
  backdrop-filter: blur(10px);
  margin-bottom: 1rem;
}

.topbar::after {
  display: none;
}

.topbar-title {
  flex: 1 1 220px;
  letter-spacing: 0.18em;
  font-size: 1.6rem;
}

.topbar-title span {
  color: var(--teal);
}

.topbar-date {
  font-size: 0.62rem;
  letter-spacing: 0.22em;
  color: var(--text-faint);
}

.search-input {
  background: var(--bg-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
}

.search-input:focus {
  width: 220px;
  border-color: var(--teal);
  box-shadow: none;
}

.topbar-btn,
.topbar-login,
.panel-link,
.section-action,
.row-upload-btn,
.upload-btn,
.view-close,
.bubble-btn,
.bubble-btn-outline,
.filter-pill,
.film-submenu-btn {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-2);
  color: var(--text-dim);
  box-shadow: none;
}

.topbar-btn:hover,
.topbar-login:hover,
.panel-link:hover,
.section-action:hover,
.row-upload-btn:hover,
.upload-btn:hover,
.view-close:hover,
.filter-pill:hover,
.film-submenu-btn:hover {
  border-color: var(--teal);
  color: var(--teal-deep);
  box-shadow: none;
}

.topbar-operator {
  background: var(--bg-2);
  border-color: var(--border);
  color: var(--text-dim);
}

.page {
  padding: 0;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.section-tag {
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.section-title {
  font-size: 1.5rem;
  letter-spacing: 0.08em;
}

.section-action,
.panel-link {
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.morgue-hero,
.panel,
.morgue-card,
.stat-card,
.prod-card,
.client-row,
.view-content,
.entity-card,
.view-item,
.view-list-item,
.upload-item {
  background: var(--glass-2);
  border: 1px solid var(--border);
  box-shadow: 0 16px 40px rgba(128, 58, 74, 0.08);
}

.morgue-hero {
  padding: 1.1rem;
  border-radius: 28px;
}

.morgue-filter-row,
.morgue-row,
.actions-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-pill,
.m-pill,
.h-pill,
.status-pill,
.morgue-tag {
  font-family: 'Montserrat', sans-serif;
  font-weight: 400;
}

.filter-pill,
.m-pill {
  border-radius: 999px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.filter-pill.active,
.m-pill.sel,
.m-pill.pink-sel,
.h-pill.on {
  background: var(--text);
  color: #f4f1ff;
  border-color: var(--text);
}

.film-submenu,
.bridal-submenu {
  border-radius: 18px;
  border: 1px solid var(--border);
  background: var(--bg-2);
}

.morgue-grid {
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 0.75rem;
}

.morgue-card {
  border-radius: 18px;
  overflow: hidden;
  min-height: 160px;
}

.morgue-card.featured {
  grid-row: span 2;
  min-height: 340px;
}

.morgue-swatch,
.row-thumb,
.view-thumb,
.prod-cover,
.library-thumb,
.drawer-img {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.morgue-swatch {
  min-height: inherit;
}

.morgue-overlay {
  background: linear-gradient(0deg, rgba(24, 16, 30, 0.82) 0%, rgba(24, 16, 30, 0.12) 58%, transparent 100%);
}

.morgue-look-cat,
.morgue-tag,
.morgue-save,
.stat-label,
.stat-sub,
.view-item-meta,
.view-list-meta,
.upload-meta,
.client-meta,
.appt-type,
.topbar-date,
.upload-helper,
.empty-state-copy {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.morgue-look-name,
.prod-name,
.client-name,
.appt-name,
.view-item-title,
.view-list-title,
.card-title,
.empty-state-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  color: var(--text);
}

.morgue-save {
  opacity: 0.88;
  background: rgba(255,255,255,0.72);
  color: var(--text-dim);
}

.stats-row,
.prod-grid,
.view-grid,
.clients-grid,
.two-col {
  gap: 0.75rem;
}

.stat-card,
.prod-card,
.view-item,
.client-row,
.view-list-item,
.upload-item,
.panel,
.empty-state {
  border-radius: 18px;
}

.stat-value {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 2.2rem;
  color: var(--text);
}

.actions-row {
  margin-bottom: 0;
}

.action-circle,
.sidebar-avatar,
.logo-circle,
.topbar-btn,
.view-close {
  border-radius: 50%;
}

.action-circle {
  width: 54px;
  height: 54px;
  background: var(--bg-2);
  border: 1px solid var(--border);
  color: var(--text-dim);
}

.action-lbl {
  color: var(--text-faint);
  letter-spacing: 0.2em;
}

.panel-head {
  padding: 0.9rem 1rem;
  background: rgba(255,255,255,0.45);
  border-bottom: 1px solid var(--border);
}

.panel-label {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 1rem;
  letter-spacing: 0.14em;
  color: var(--text-dim);
}

.appt-row,
.client-row,
.view-list-item,
.upload-item {
  background: rgba(255,255,255,0.72);
  border-bottom: 1px solid rgba(224,216,240,0.7);
}

.row-thumb,
.view-thumb,
.prod-cover {
  border: 1px solid var(--border);
  background-color: #ede9fe;
}

.row-thumb {
  width: 72px;
  height: 72px;
  border-radius: 14px;
}

.view-thumb {
  height: 120px;
  border-radius: 14px;
}

.prod-cover {
  border-radius: 14px;
}

.view-modal {
  background: rgba(24, 16, 30, 0.48);
  backdrop-filter: blur(8px);
}

.view-content {
  max-width: 920px;
  padding: 24px;
  border-radius: 24px;
  background: var(--glass-2);
}

.view-header {
  border-bottom-color: var(--border);
}

.view-title {
  font-size: 1.6rem;
}

.view-list {
  gap: 0.75rem;
}

.upload-btn,
.row-upload-btn {
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  padding: 0.55rem 0.9rem;
}

.upload-actions {
  gap: 0.65rem;
}

.upload-helper,
.status-pill,
.upload-meta,
.client-tone-tag,
.view-item-meta,
.view-list-meta,
.stat-sub,
.appt-period,
.appt-type,
.topbar-date,
.morgue-look-cat,
.morgue-tag {
  font-size: 0.62rem;
  color: var(--text-faint);
}

.status-pill.s-upcoming,
.status-pill.s-booked,
.status-pill.s-completed,
.status-pill.s-cancelled {
  background: var(--bg-2);
}

body::before,
body::after,
.cursor,
.cursor-ring {
  display: none;
}

@media (max-width: 960px) {
  .layout {
    display: block;
  }

  .sidebar {
    border-radius: 22px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .topbar {
    justify-content: center;
  }

  .morgue-grid,
  .stats-row,
  .prod-grid,
  .clients-grid,
  .two-col {
    grid-template-columns: 1fr;
  }

  .morgue-card.featured {
    grid-row: span 1;
    min-height: 220px;
  }
}

@media (max-width: 640px) {
  body {
    padding: 0.72rem;
  }

  .sidebar,
  .topbar,
  .morgue-hero,
  .panel,
  .view-content {
    border-radius: 20px;
    padding: 1rem;
  }

  .topbar-title {
    font-size: 1.35rem;
  }

  .view-grid,
  .morgue-grid {
    grid-template-columns: 1fr;
  }

  .view-thumb,
  .row-thumb,
  .prod-cover {
    height: 140px;
  }
}

.layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 72px;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  gap: 8px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 200;
  flex-shrink: 0;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0; right: -1px; bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--teal), var(--pink), var(--teal), transparent);
  opacity: 0.4;
}

.logo-circle {
  width: 42px; height: 42px;
  border-radius: 50%;
  border: 1.5px solid var(--teal);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
  cursor: pointer;
}
.logo-circle::before {
  content: '';
  position: absolute; inset: 3px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--teal-glow), transparent);
  animation: logo-pulse 3s ease-in-out infinite;
}
@keyframes logo-pulse {
  0%,100% { opacity: 0.4; transform: scale(0.9); }
  50%      { opacity: 1;   transform: scale(1.1); }
}
.logo-letter {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  color: var(--teal);
  letter-spacing: 0.05em;
  position: relative;
  z-index: 1;
}

.nav-circle {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s;
  position: relative;
  color: var(--text-dim);
  flex-shrink: 0;
}
.nav-circle:hover {
  border-color: var(--teal);
  color: var(--teal);
  background: var(--teal-faint);
  box-shadow: 0 0 14px var(--teal-glow);
}
.nav-circle.active {
  border-color: var(--pink);
  color: var(--pink);
  background: rgba(244,114,182,0.08);
  box-shadow: 0 0 18px var(--pink-glow);
}
.nav-circle svg { width: 17px; height: 17px; stroke-width: 1.5; }

.nav-tooltip {
  position: absolute;
  left: calc(100% + 14px);
  background: var(--bg-3);
  border: 1px solid var(--border-hot);
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 2px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  box-shadow: 0 0 12px var(--teal-glow);
}
.nav-circle:hover .nav-tooltip { opacity: 1; }

.nav-badge {
  position: absolute;
  top: -2px; right: -2px;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--pink-hot);
  font-size: 7px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bg);
}

.sidebar-spacer { flex: 1; }

.sidebar-avatar {
  width: 38px; height: 38px;
  border-radius: 50%;
  border: 1.5px solid var(--teal-deep);
  background: linear-gradient(135deg, var(--teal-deep), var(--bg-3));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  color: var(--teal);
  cursor: pointer;
  transition: border-color 0.2s;
}
.sidebar-avatar:hover { border-color: var(--pink); color: var(--pink); }

.main {
  margin-left: 72px;
  flex: 1;
  min-height: 100vh;
}

.topbar {
  position: sticky; top: 0; z-index: 100;
  background: rgba(6,14,13,0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 32px;
  height: 56px;
  gap: 24px;
}
.topbar::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--teal), var(--pink), var(--lime), var(--teal), transparent);
  opacity: 0.4;
}

.topbar-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 0.12em;
  color: var(--text);
  flex: 1;
}
.topbar-title span { color: var(--teal); }

.topbar-date {
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.search-wrap { position: relative; }
.search-input {
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 7px 16px 7px 34px;
  color: var(--text);
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 300;
  letter-spacing: 0.08em;
  width: 180px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, width 0.3s;
}
.search-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 10px var(--teal-glow);
  width: 220px;
}
.search-input::placeholder { color: var(--text-faint); }
.search-icon {
  position: absolute; left: 11px; top: 50%;
  transform: translateY(-50%);
  color: var(--text-faint);
  width: 13px; height: 13px;
}

.topbar-btn {
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-3);
  color: var(--text-dim);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  flex-shrink: 0;
}
.topbar-btn:hover {
  border-color: var(--pink);
  color: var(--pink);
  box-shadow: 0 0 12px var(--pink-glow);
}
.topbar-btn svg { width: 14px; height: 14px; stroke-width: 1.5; }
.topbar-dot {
  position: absolute; top: 5px; right: 5px;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 6px var(--lime-glow);
}

.topbar-login {
  margin-left: auto;
  border: 1px solid rgba(13,158,143,0.45);
  background: rgba(13,158,143,0.12);
  color: var(--text);
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}
.topbar-login:hover {
  border-color: var(--pink);
  color: var(--pink);
  box-shadow: 0 0 12px var(--pink-glow);
}

.topbar-tab {
  margin-left: auto;
  border: 1px solid var(--border);
  background: var(--bg-2);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
}

.topbar-tab:hover {
  border-color: var(--teal);
  color: var(--teal-deep);
  box-shadow: 0 0 10px var(--teal-glow);
}

.topbar-operator {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  background: var(--bg-3);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 8px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-dim);
}

.topbar-operator strong {
  color: var(--text);
  letter-spacing: 0.1em;
}

.topbar-operator small {
  color: var(--text-faint);
  letter-spacing: 0.12em;
}

.section-library {
  margin-top: 12px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-3);
}

.section-library-meta {
  font-size: 8px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 8px;
}

.library-strip {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.library-thumb {
  width: 82px;
  height: 82px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
}

.login-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  background:
    radial-gradient(circle at top left, rgba(13,158,143,0.2), transparent 32%),
    radial-gradient(circle at bottom right, rgba(244,114,182,0.18), transparent 30%),
    linear-gradient(135deg, rgba(6,14,13,0.98), rgba(9,25,23,0.98));
}

.login-card {
  width: min(100%, 460px);
  border: 1px solid var(--border);
  border-radius: 24px;
  background: rgba(7,20,18,0.92);
  box-shadow: 0 24px 70px rgba(0,0,0,0.45);
  padding: 32px;
}

.login-kicker {
  font-size: 9px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 10px;
}

.login-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 48px;
  letter-spacing: 0.08em;
  line-height: 0.95;
  margin-bottom: 12px;
}

.login-copy {
  color: var(--text-dim);
  line-height: 1.5;
  margin-bottom: 24px;
}

.login-form {
  display: grid;
  gap: 14px;
}

.login-label {
  display: grid;
  gap: 8px;
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.login-input {
  width: 100%;
  border: 1px solid var(--border);
  background: var(--bg-3);
  color: var(--text);
  border-radius: 14px;
  padding: 14px 16px;
  outline: none;
  font: inherit;
  letter-spacing: 0.04em;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.login-input:focus {
  border-color: var(--teal);
  box-shadow: 0 0 10px var(--teal-glow);
}

.login-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.login-button {
  border: 1px solid transparent;
  background: linear-gradient(145deg, var(--teal), var(--pink));
  color: #fff;
  border-radius: 999px;
  padding: 12px 18px;
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  cursor: pointer;
}

.login-button.secondary {
  background: transparent;
  border-color: var(--border);
  color: var(--text-dim);
}

.page { padding: 28px 32px 60px; }

.section-head {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.section-tag {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 11px;
  letter-spacing: 0.35em;
  color: var(--teal);
  background: var(--teal-faint);
  border: 1px solid rgba(13,158,143,0.25);
  padding: 3px 12px;
  border-radius: 20px;
  white-space: nowrap;
}
.section-tag.pink {
  color: var(--pink);
  background: rgba(244,114,182,0.08);
  border-color: rgba(244,114,182,0.25);
}
.section-tag.lime {
  color: var(--lime);
  background: rgba(163,230,53,0.08);
  border-color: rgba(163,230,53,0.25);
}
.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--text);
  flex: 1;
}
.section-action {
  font-size: 9px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--teal);
  background: none;
  border: 1px solid rgba(13,158,143,0.3);
  border-radius: 20px;
  padding: 5px 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.section-action:hover {
  background: var(--teal-faint);
  box-shadow: 0 0 10px var(--teal-glow);
}

.theme-chip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
}

.theme-chip {
  border: 1px solid var(--border);
  background: var(--bg-3);
  color: var(--text-dim);
  padding: 10px 12px;
  border-radius: 999px;
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-chip:hover {
  border-color: var(--teal);
  color: var(--teal);
}

.theme-chip.active {
  border-color: var(--pink);
  color: var(--pink);
  background: rgba(244,114,182,0.08);
  box-shadow: 0 0 12px var(--pink-glow);
}

.connector-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-top: 10px;
}

.connector-card {
  border: 1px solid var(--border);
  background: linear-gradient(180deg, rgba(13,30,28,0.92), rgba(7,20,18,0.96));
  border-radius: 18px;
  padding: 18px;
}

.connector-card.accent {
  border-color: rgba(244,114,182,0.35);
  box-shadow: 0 0 24px rgba(244,114,182,0.08);
}

.connector-kicker {
  font-size: 9px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 10px;
}

.connector-card h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24px;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.connector-card p {
  color: var(--text-dim);
  line-height: 1.5;
  margin-bottom: 16px;
}

.foundation-ref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.foundation-ref-card {
  text-align: left;
  border: 1px solid var(--border);
  background: var(--bg-3);
  color: var(--text);
  border-radius: 14px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.foundation-ref-card:hover {
  border-color: var(--teal);
  box-shadow: 0 0 12px var(--teal-glow);
}

.foundation-ref-card.active {
  border-color: var(--pink);
  background: rgba(244,114,182,0.08);
  box-shadow: 0 0 16px var(--pink-glow);
}

.foundation-ref-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 8px;
}

.foundation-ref-name {
  font-size: 12px;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.foundation-ref-meta {
  font-size: 9px;
  color: var(--text-dim);
  line-height: 1.4;
}

.row-upload-btn {
  font-size: 8px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--teal);
  background: rgba(13,158,143,0.08);
  border: 1px solid rgba(13,158,143,0.28);
  border-radius: 18px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: auto;
}

.row-upload-btn:hover {
  background: var(--teal-faint);
  border-color: rgba(13,158,143,0.45);
  box-shadow: 0 0 10px var(--teal-glow);
}

.delete-action.row-upload-btn,
.delete-action.row-upload-btn:hover {
  color: #b42318;
  background: rgba(180, 35, 24, 0.08);
  border-color: rgba(180, 35, 24, 0.28);
}

.delete-action.row-upload-btn:hover {
  background: rgba(180, 35, 24, 0.14);
  border-color: rgba(180, 35, 24, 0.45);
  box-shadow: 0 0 10px rgba(180, 35, 24, 0.14);
}

.morgue-hero {
  margin-bottom: 36px;
}

.morgue-filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.film-submenu {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin: -6px 0 18px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(7,20,18,0.86);
}

.film-submenu-btn {
  border: 1px solid rgba(13,158,143,0.25);
  background: var(--bg-3);
  color: var(--text);
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 9px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
}

.film-submenu-btn:hover {
  border-color: var(--pink);
  color: var(--pink);
  box-shadow: 0 0 12px var(--pink-glow);
}
.filter-pill {
  font-size: 9px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg-3);
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.2s;
}
.filter-pill:hover { border-color: var(--teal); color: var(--teal); }
.filter-pill.active {
  border-color: var(--pink);
  color: var(--pink);
  background: rgba(244,114,182,0.08);
  box-shadow: 0 0 10px var(--pink-glow);
}

.morgue-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 12px;
}

.morgue-card {
  position: relative;
  display: block;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: border-color 0.3s, transform 0.3s;
  background: var(--bg-3);
}
.morgue-card:hover {
  border-color: var(--teal);
  transform: translateY(-2px);
}
.morgue-card.featured {
  grid-row: span 2;
  min-height: 340px;
}
.morgue-card:not(.featured) { min-height: 160px; }

.morgue-swatch {
  width: 100%; height: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #ede9fe;
}

.morgue-image {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
  display: block;
}

.swatch-1 { background: linear-gradient(135deg, #1a0a2e 0%, #0d9e8f 40%, #f472b6 100%); }
.swatch-2 { background: linear-gradient(135deg, #0b1614 0%, #a3e635 50%, #0d9e8f 100%); }
.swatch-3 { background: linear-gradient(135deg, #1f0a1a 0%, #ec4899 60%, #bef264 100%); }
.swatch-4 { background: linear-gradient(160deg, #0d1f1c 0%, #f472b6 45%, #0d9e8f 100%); }
.swatch-5 { background: linear-gradient(135deg, #0a1a0a 0%, #bef264 50%, #f472b6 100%); }
.swatch-6 { background: radial-gradient(ellipse at 30% 40%, #ec4899 0%, #0d9e8f 50%, #060e0d 100%); }

.swatch-pattern {
  position: absolute; inset: 0;
  background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.04) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%);
}

.morgue-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(0deg, rgba(6,14,13,0.92) 0%, rgba(6,14,13,0.2) 50%, transparent 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  transition: background 0.3s;
  z-index: 2;
}
.morgue-card:hover .morgue-overlay {
  background: linear-gradient(0deg, rgba(6,14,13,0.95) 0%, rgba(6,14,13,0.4) 60%, transparent 100%);
}

.morgue-look-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  color: var(--text);
  line-height: 1.1;
}
.morgue-card.featured .morgue-look-name { font-size: 30px; }

.morgue-look-cat {
  font-size: 8px;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 4px;
}

.morgue-tags {
  display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
}
.morgue-tag {
  font-size: 7px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid;
}
.tag-teal  { color: var(--teal);  border-color: rgba(13,158,143,0.4);  background: rgba(13,158,143,0.08); }
.tag-pink  { color: var(--pink);  border-color: rgba(244,114,182,0.4); background: rgba(244,114,182,0.08); }
.tag-lime  { color: var(--lime);  border-color: rgba(163,230,53,0.4);  background: rgba(163,230,53,0.08); }

.morgue-save {
  position: absolute;
  top: 10px; right: 10px;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(6,14,13,0.7);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text-dim);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, border-color 0.2s;
}
.morgue-card:hover .morgue-save { opacity: 1; }
.morgue-save:hover { border-color: var(--pink); color: var(--pink); }
.morgue-save svg { width: 12px; height: 12px; stroke-width: 1.5; }

.hr-fancy {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 32px 0 24px;
}
.hr-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-hot), transparent);
}
.hr-cross {
  width: 5px; height: 5px;
  border: 1px solid var(--teal);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 28px;
}

.stat-card {
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  cursor: default;
}
.stat-card:hover { border-color: var(--teal-deep); }
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
}
.stat-card:nth-child(1)::before { background: linear-gradient(90deg, var(--teal), transparent); }
.stat-card:nth-child(2)::before { background: linear-gradient(90deg, var(--pink), transparent); }
.stat-card:nth-child(3)::before { background: linear-gradient(90deg, var(--lime), transparent); }
.stat-card:nth-child(4)::before { background: linear-gradient(90deg, var(--teal), var(--pink)); }

.stat-label {
  font-size: 7px;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-bottom: 8px;
}
.stat-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 44px;
  letter-spacing: 0.02em;
  line-height: 1;
  color: var(--text);
}
.stat-card:nth-child(1) .stat-value { color: var(--teal); }
.stat-card:nth-child(2) .stat-value { color: var(--pink); }
.stat-card:nth-child(3) .stat-value { color: var(--lime); }
.stat-sub {
  font-size: 8px;
  letter-spacing: 0.15em;
  color: var(--text-faint);
  margin-top: 4px;
  text-transform: uppercase;
}

.two-col {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.panel {
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 4px;
  overflow: hidden;
}
.panel-head {
  padding: 13px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(7,20,18,0.6);
}
.panel-label {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  letter-spacing: 0.25em;
  color: var(--text-dim);
}
.panel-link {
  font-size: 8px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--teal);
  cursor: pointer;
  background: none;
  border: none;
  transition: color 0.2s;
}
.panel-link:hover { color: var(--lime); }

.delete-action {
  color: #b42318;
  background: rgba(180, 35, 24, 0.08);
  border-color: rgba(180, 35, 24, 0.28);
}

.delete-action:hover {
  color: #7a160f;
  background: rgba(180, 35, 24, 0.14);
  border-color: rgba(180, 35, 24, 0.45);
  box-shadow: 0 0 10px rgba(180, 35, 24, 0.14);
}

.appt-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 20px;
  border-bottom: 1px solid rgba(13,158,143,0.06);
  transition: background 0.2s;
  cursor: pointer;
}
.appt-row:last-child { border-bottom: none; }
.appt-row:hover { background: rgba(13,158,143,0.04); }

.appt-time-block {
  text-align: center;
  min-width: 46px;
}
.appt-hour {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;
  letter-spacing: 0.03em;
  color: var(--teal);
  line-height: 1;
}
.appt-period {
  font-size: 7px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.appt-vline {
  width: 1px; height: 32px;
  background: linear-gradient(180deg, transparent, var(--teal), transparent);
  opacity: 0.25;
  flex-shrink: 0;
}
.appt-body { flex: 1; min-width: 0; }
.appt-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 16px;
  letter-spacing: 0.06em;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.appt-type {
  font-size: 8px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
  margin-top: 1px;
}
.status-pill {
  font-size: 7px;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 10px;
  border: 1px solid;
  flex-shrink: 0;
}
.s-upcoming  { color: var(--teal);  border-color: rgba(13,158,143,0.4);  background: rgba(13,158,143,0.07); }
.s-booked    { color: var(--pink);  border-color: rgba(244,114,182,0.4); background: rgba(244,114,182,0.07); }
.s-completed { color: var(--text-faint); border-color: rgba(61,112,106,0.35); background: rgba(61,112,106,0.05); }
.s-cancelled { color: var(--text-faint); border-color: rgba(61,112,106,0.35); background: rgba(61,112,106,0.05); }

.prod-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 24px;
}

.prod-card {
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 18px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.3s, transform 0.25s;
}
.prod-card:hover {
  border-color: rgba(13,158,143,0.45);
  transform: translateY(-2px);
}
.prod-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
}
.prod-card:nth-child(1)::after { background: linear-gradient(90deg, var(--teal), transparent); }
.prod-card:nth-child(2)::after { background: linear-gradient(90deg, var(--pink), transparent); }
.prod-card:nth-child(3)::after { background: linear-gradient(90deg, var(--lime), transparent); }

.prod-cover {
  width: 100%;
  height: 120px;
  border: 1px solid var(--border);
  border-radius: 6px;
  margin-bottom: 10px;
  background-size: cover;
  background-position: center;
}

.row-thumb {
  width: 58px;
  height: 58px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--bg-3);
  background-attachment: scroll;
  flex-shrink: 0;
  margin-right: 12px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  will-change: transform;
}
.row-thumb:hover {
  border-color: var(--teal);
  box-shadow: 0 0 8px var(--teal-glow);
  transform: scale(1.05);
}

.prod-type-tag {
  font-size: 7px;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--teal);
  margin-bottom: 6px;
}
.prod-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.06em;
  color: var(--text);
  line-height: 1.1;
  margin-bottom: 10px;
}
.prod-meta {
  font-size: 8px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.prod-pulse {
  position: absolute;
  top: 14px; right: 14px;
  width: 7px; height: 7px;
  border-radius: 50%;
}
.pulse-live {
  background: var(--lime);
  box-shadow: 0 0 0 0 rgba(163,230,53,0.5);
  animation: live-pulse 2s infinite;
}
.pulse-off { background: var(--text-faint); }
@keyframes live-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(163,230,53,0.5); }
  70%  { box-shadow: 0 0 0 8px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.clients-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.client-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(13,158,143,0.06);
  border-right: 1px solid rgba(13,158,143,0.06);
  cursor: pointer;
  transition: background 0.2s;
}
.client-row:hover { background: rgba(13,158,143,0.04); }
.client-row:nth-child(2n) { border-right: none; }
.client-row:nth-last-child(-n+2) { border-bottom: none; }
.client-av {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--teal-deep);
  background: var(--bg-2);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  color: var(--teal);
  flex-shrink: 0;
  transition: border-color 0.2s;
}
.client-row:hover .client-av { border-color: var(--pink); color: var(--pink); }
.client-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: var(--text);
}
.client-meta {
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-faint);
}
.client-tone-tag {
  margin-left: auto;
  font-size: 7px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(13,158,143,0.2);
  color: var(--text-faint);
  flex-shrink: 0;
}

.actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 28px;
}
.action-circle-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  cursor: pointer;
}
.action-circle {
  width: 54px; height: 54px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--bg-3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s;
  color: var(--text-dim);
  font-size: 18px;
}
.action-circle:hover {
  transform: scale(1.1);
}
.action-circle-btn:nth-child(1) .action-circle:hover { border-color: var(--teal); box-shadow: 0 0 18px var(--teal-glow); color: var(--teal); }
.action-circle-btn:nth-child(2) .action-circle:hover { border-color: var(--pink); box-shadow: 0 0 18px var(--pink-glow); color: var(--pink); }
.action-circle-btn:nth-child(3) .action-circle:hover { border-color: var(--lime); box-shadow: 0 0 18px var(--lime-glow); color: var(--lime); }
.action-circle-btn:nth-child(4) .action-circle:hover { border-color: var(--teal); box-shadow: 0 0 18px var(--teal-glow); color: var(--teal); }
.action-circle-btn:nth-child(5) .action-circle:hover { border-color: var(--pink); box-shadow: 0 0 18px var(--pink-glow); color: var(--pink); }

.action-lbl {
  font-size: 7px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--text-faint);
  text-align: center;
}

.upload-panel {
  margin-top: 10px;
}

.upload-body {
  padding: 14px 20px 18px;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.upload-btn {
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--text);
  background: rgba(13, 158, 143, 0.15);
  border: 1px solid rgba(13, 158, 143, 0.45);
  border-radius: 16px;
  padding: 7px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-btn:hover {
  box-shadow: 0 0 10px var(--teal-glow);
  border-color: var(--teal);
}

.upload-helper {
  font-size: 9px;
  letter-spacing: 0.08em;
  color: var(--text-faint);
}

.upload-list {
  display: grid;
  gap: 8px;
}

.upload-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid rgba(13, 158, 143, 0.2);
  background: rgba(7, 20, 18, 0.55);
  border-radius: 4px;
  padding: 8px 10px;
}

.upload-name {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text);
}

.upload-meta {
  font-size: 8px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.status-live {
  color: var(--teal);
  font-size: 8px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.glitch {
  position: relative;
  display: inline-block;
}
.glitch::before, .glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0;
  font-family: inherit;
  font-size: inherit;
  letter-spacing: inherit;
  color: inherit;
}
.glitch::before {
  color: var(--pink);
  clip-path: polygon(0 0, 100% 0, 100% 35%, 0 35%);
  transform: translateX(-1px);
  opacity: 0;
  animation: glitch-1 6s 2s infinite;
}
.glitch::after {
  color: var(--teal);
  clip-path: polygon(0 65%, 100% 65%, 100% 100%, 0 100%);
  transform: translateX(1px);
  opacity: 0;
  animation: glitch-2 6s 2.2s infinite;
}
@keyframes glitch-1 {
  0%,94%,100% { opacity: 0; }
  95%,97%     { opacity: 1; transform: translateX(-2px); }
  96%,98%     { opacity: 0; }
}
@keyframes glitch-2 {
  0%,94%,100% { opacity: 0; }
  95%,97%     { opacity: 1; transform: translateX(2px); }
  96%,98%     { opacity: 0; }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.f0 { animation: fadeUp 0.5s 0.0s both; }
.f1 { animation: fadeUp 0.5s 0.1s both; }
.f2 { animation: fadeUp 0.5s 0.18s both; }
.f3 { animation: fadeUp 0.5s 0.26s both; }
.f4 { animation: fadeUp 0.5s 0.34s both; }
.f5 { animation: fadeUp 0.5s 0.42s both; }

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--teal-deep); border-radius: 2px; }

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .morgue-grid {
    grid-template-columns: 1fr 1fr;
  }

  .morgue-card.featured {
    grid-column: span 2;
    grid-row: span 1;
  }

  .prod-grid {
    grid-template-columns: 1fr;
  }

  .two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  body {
    cursor: auto;
  }

  .cursor,
  .cursor-ring {
    display: none;
  }

  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: flex-start;
    overflow-x: auto;
    padding: 10px;
    gap: 10px;
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .sidebar::after,
  .sidebar-spacer,
  .nav-tooltip {
    display: none;
  }

  .main {
    margin-left: 0;
  }

  .topbar {
    padding: 0 12px;
    gap: 10px;
  }

  .topbar-date,
  .search-wrap {
    display: none;
  }

  .page {
    padding: 16px 12px 34px;
  }

  .section-head {
    flex-wrap: wrap;
  }

  .stats-row,
  .morgue-grid,
  .clients-grid {
    grid-template-columns: 1fr;
  }

  .client-row {
    border-right: none;
  }

  .entity-grid {
    grid-template-columns: 1fr;
  }
}

@media (pointer: coarse) {
  body {
    cursor: auto;
  }

  .cursor,
  .cursor-ring {
    display: none;
  }
}

.view-modal {
  position: fixed;
  inset: 0;
  background: rgba(6, 14, 13, 0.95);
  backdrop-filter: blur(8px);
  z-index: 5000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.view-content {
  width: 100%;
  max-width: 900px;
  background: var(--glass-2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 28px;
  margin: 40px 20px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.view-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  letter-spacing: 0.08em;
  color: var(--text);
}

.view-close {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-dim);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 18px;
  flex-shrink: 0;
}

.view-close:hover {
  border-color: var(--pink);
  color: var(--pink);
  box-shadow: 0 0 10px var(--pink-glow);
}

.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.view-item {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-3);
  transition: all 0.2s;
  cursor: pointer;
}

.view-item:hover {
  border-color: var(--teal);
  background: var(--bg-2);
  box-shadow: 0 0 12px var(--teal-glow);
  transform: translateY(-3px);
}

.timeline-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 10px;
  color: var(--text-dim);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.timeline-divider::before,
.timeline-divider::after {
  content: "";
  height: 1px;
  background: var(--border);
  flex: 1;
}

.view-thumb {
  width: 100%;
  height: 96px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background-color: var(--bg-2);
  background-size: cover;
  background-position: center;
  margin-bottom: 10px;
}

.view-item-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: var(--text);
  margin-bottom: 6px;
  text-transform: capitalize;
}

.view-item-meta {
  font-size: 8px;
  color: var(--text-faint);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.view-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.view-list-item {
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
}

.view-list-item:hover {
  border-color: var(--teal);
  background: var(--bg-2);
  box-shadow: 0 0 10px var(--teal-glow);
}

.view-list-left {
  flex: 1;
}

.view-list-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--text);
  margin-bottom: 4px;
}

.view-list-meta {
  font-size: 8px;
  color: var(--text-faint);
  letter-spacing: 0.1em;
}

.view-list-status {
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--teal);
  color: var(--teal);
  flex-shrink: 0;
  margin-left: 8px;
}

.entity-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.entity-label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 8px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.entity-input {
  background: var(--bg-3);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 10px;
  font-size: 12px;
}

.entity-textarea {
  min-height: 80px;
  resize: vertical;
}

.entity-hint {
  margin-top: 12px;
  font-size: 8px;
  letter-spacing: 0.1em;
  color: var(--text-faint);
}

.empty-state {
  border: 1px dashed var(--border);
  border-radius: 10px;
  padding: 22px;
  text-align: center;
  background: var(--bg-3);
}

.empty-state-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 20px;
  letter-spacing: 0.08em;
  color: var(--text);
}

.empty-state-copy {
  margin-top: 8px;
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--text-faint);
}

.empty-state-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}
`;

const fallbackLooks = [
  { id: 101, name: "Toxic Siren", cat: "Editorial - FX", tags: ["Deep", "Shimmer", "Avant-garde"], swatch: "swatch-6", featured: true },
  { id: 102, name: "Glass Skin", cat: "Bridal", tags: ["Fair", "Dewy"], swatch: "swatch-2" },
  { id: 103, name: "Noir Baroque", cat: "Film", tags: ["Medium", "Matte"], swatch: "swatch-3" },
  { id: 104, name: "Bio-Luminescent", cat: "Runway", tags: ["Deep", "Glitter"], swatch: "swatch-4" },
  { id: 105, name: "Velvet Wound", cat: "Theater - FX", tags: ["Tan", "SFX"], swatch: "swatch-5" },
];

const fallbackAppts = [
  { id: 201, h: "9:00", p: "AM", name: "Celeste Montague", type: "Bridal Trial - $280", s: "s-upcoming", status: "Upcoming" },
  { id: 202, h: "11:30", p: "AM", name: "Rania Al-Hassan", type: "Editorial - $450", s: "s-booked", status: "Booked" },
  { id: 203, h: "2:00", p: "PM", name: "Sofia Vreeland", type: "FX Makeup - $320", s: "s-booked", status: "Booked" },
  { id: 204, h: "4:30", p: "PM", name: "Margot De Luca", type: "Red Carpet - $390", s: "s-upcoming", status: "Upcoming" },
  { id: 205, h: "6:00", p: "PM", name: "Isla Thornton", type: "Touch-up - $90", s: "s-completed", status: "Completed" },
];

const fallbackClients = [
  { id: 301, i: "CM", name: "Celeste Montague", meta: "14 visits", tone: "Light - Cool" },
  { id: 302, i: "RA", name: "Rania Al-Hassan", meta: "8 visits", tone: "Medium - Warm" },
  { id: 303, i: "SV", name: "Sofia Vreeland", meta: "22 visits", tone: "Deep - Neutral" },
  { id: 304, i: "MD", name: "Margot De Luca", meta: "5 visits", tone: "Fair - Cool" },
];

const fallbackProds = [
  { id: 401, name: "Noir Baroque", type: "Film", meta: "Day 7 of 24", live: true, status: "Live" },
  { id: 402, name: "Vogue Italia SS26", type: "Editorial", meta: "Shoot in 3 days", live: true, status: "Live" },
  { id: 403, name: "Echo & Dust", type: "Theater", meta: "Wrapped", live: false, status: "Wrapped" },
];

const navItems = [
  { icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", label: "Dashboard", active: true },
  { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Appointments", badge: "5" },
  { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "Clients" },
  { icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01", label: "Looks", badge: "" },
  { icon: "M15 10l4.553-2.069A1 1 0 0121 8.82V15a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h3m3 0V3m0 0h2m-2 0v1M9 7h6", label: "Productions", badge: "2" },
  { icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Look Morgue" },
  { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Kit & Inventory" },
];

const filters = ["All", "Editorial", "Bridal", "Film", "Theater", "Runway", "FX"];
const LOOK_THEMES = ["Bridal", "Glam", "Fashion", "Editorial", "Runway", "Film", "Theater", "FX"];

const API_BASE = "/api";
const PRODUCTION_TYPES = ["Film", "TV Show", "Commercial", "Photoshoot", "Theater", "Music Video", "Editorial"];
const SKIN_TONES = ["Fair", "Light", "Medium", "Tan", "Deep"];
const UNDERTONES = ["Cool", "Warm", "Neutral", "Olive"];
const PRODUCT_CATEGORIES = [
  "Foundation",
  "Concealer",
  "Eyeshadow",
  "Lipstick",
  "Lipgloss",
  "Blush",
  "Bronzer",
  "Highlighter",
  "Primer",
  "Setting Spray",
  "Powder",
  "Moisturizer",
];
const FX_EFFECT_TYPES = ["Bruise", "Cut", "Burn", "Zombie", "Old Age", "Fantasy", "Prosthetic"];
const VIEW_TO_HASH = {
  dashboard: "/dashboard",
  login: "/login",
  "browse-all": "/looks",
  "runway-looks": "/looks/runway",
  "fx-looks": "/looks/fx",
  "new-look": "/looks/new",
  "look-morgue-connector": "/looks/morgue",
  "manage-prods": "/productions/manage",
  "full-calendar": "/appointments/calendar",
  "all-clients": "/clients",
  "client-profile": "/clients/profile",
  "new-appointment": "/appointments/new",
  "add-client": "/clients/new",
  "production-center": "/productions/new",
  "upload-center": "/uploads",
  "add-product": "/products/new",
  "foundations": "/foundations",
  "fx-makeup": "/fx-makeup",
  "call-sheets": "/call-sheets",
  "uploads-dashboard": "/uploads/dashboard",
  "history-tracker": "/history",
};
const HASH_TO_VIEW = Object.fromEntries(Object.entries(VIEW_TO_HASH).map(([view, hash]) => [hash, view]));

function viewFromLocationHash() {
  const raw = (window.location.hash || "#/dashboard").replace(/^#/, "");
  return HASH_TO_VIEW[raw] || "dashboard";
}
const swatches = ["swatch-1", "swatch-2", "swatch-3", "swatch-4", "swatch-5", "swatch-6"];

function parseArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseThemeList(categoryRaw) {
  return String(categoryRaw || "")
    .split(",")
    .map((theme) => theme.trim())
    .filter(Boolean);
}

function formatMoney(raw) {
  if (raw == null) {
    return "";
  }
  const amount = Number(raw);
  if (Number.isNaN(amount)) {
    return String(raw);
  }
  return `$${amount.toFixed(0)}`;
}

function formatTime(raw) {
  if (!raw || typeof raw !== "string") {
    return { h: "--:--", p: "--" };
  }
  const [hourRaw, minRaw] = raw.split(":");
  const hour = Number(hourRaw);
  if (Number.isNaN(hour)) {
    return { h: raw, p: "" };
  }
  const period = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return { h: `${normalizedHour}:${minRaw ?? "00"}`, p: period };
}

function resolveImageUrl(raw) {
  const value = String(raw || "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  return value;
}

function placeholderImage(seed, width = 960, height = 720) {
  // Placeholder images disabled - use real uploads only
  return null;
}

function lookPlaceholderImage(look) {
  return null;
}

function resolveLookPreviewImage(look) {
  return resolveImageUrl(look?.imageUrl) || null;
}

function resolveUploadPreviewImage(row) {
  const fileUrl = resolveImageUrl(row?.storage_url);
  const isImage = String(row?.mime_type || "").startsWith("image/");
  if (isImage && fileUrl) {
    return fileUrl;
  }
  return null;
}

function noImagePlaceholder() {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 960 720'%3E%3Crect fill='%230f1f1c' width='960' height='720'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%237ab5ae' font-size='32' font-family='sans-serif'%3ENo Image Uploaded%3C/text%3E%3C/svg%3E";
}
function detailImageUrl(item) {
  if (!item || typeof item !== "object") {
    return "";
  }
  const direct = resolveImageUrl(item.imageUrl || item.storage_url || item.image_link || item.api_featured_image || item.photo_url || "");
  if (direct) {
    return direct;
  }
  if (item.name || item.cat || item.id) {
    return resolveLookPreviewImage(item);
  }
  return "";
}

function lookMatchesFilter(categoryRaw, filterRaw) {
  const category = String(categoryRaw || "").toLowerCase();
  const filter = String(filterRaw || "all").toLowerCase();
  if (filter === "all") {
    return true;
  }
  return category.includes(filter);
}

function initials(name) {
  if (!name) {
    return "--";
  }
  const parts = String(name).trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "--";
}

function MuaVault() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [filmMenuOpen, setFilmMenuOpen] = useState(false);
  const [bridalMenuOpen, setBridalMenuOpen] = useState(false);
  const [editorialMenuOpen, setEditorialMenuOpen] = useState(false);
  const [cursor, setCursor] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const fileInputRef = useRef(null);
  const lookImageInputRef = useRef(null);
  const sectionImageInputRef = useRef(null);
  const [currentView, setCurrentView] = useState(viewFromLocationHash());
  const [loginEmail, setLoginEmail] = useState("bianca.admin@muavault.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [sectionImageTarget, setSectionImageTarget] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const [looks, setLooks] = useState(fallbackLooks);
  const [appts, setAppts] = useState(fallbackAppts);
  const [clients, setClients] = useState(fallbackClients);
  const [prods, setProds] = useState(fallbackProds);
  const [stats, setStats] = useState([
    { l: "Today's Bookings", v: "0", s: "loaded from API" },
    { l: "Active Clients", v: "0", s: "loaded from API" },
    { l: "Looks in Vault", v: "0", s: "loaded from API" },
    { l: "Productions", v: "0", s: "loaded from API" },
  ]);
  const [uploadRows, setUploadRows] = useState([]);
  const [allUploadsData, setAllUploadsData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [externalLipsticks, setExternalLipsticks] = useState([]);
  const [externalFoundations, setExternalFoundations] = useState([]);
  const [externalEyeshadows, setExternalEyeshadows] = useState([]);
  const [externalApiProducts, setExternalApiProducts] = useState([]);
  const [foundationChoices, setFoundationChoices] = useState([]);
  const [productionsData, setProductionsData] = useState([]);
  const [effectsMakeupData, setEffectsMakeupData] = useState([]);
  const [callSheetsData, setCallSheetsData] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [charactersData, setCharactersData] = useState([]);
  const [shootDaysData, setShootDaysData] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [lookImageTargetId, setLookImageTargetId] = useState(null);
  const [apiStatus, setApiStatus] = useState("Connecting...");
  const [refreshKey, setRefreshKey] = useState(0);
  const [historyEntries, setHistoryEntries] = useState(() => {
    try {
      const raw = window.localStorage.getItem("muaVaultHistory");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = window.localStorage.getItem("muaVaultCurrentUser");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  });
  const filledFieldTrackerRef = useRef({});
  const [appointmentForm, setAppointmentForm] = useState({
    client_id: "",
    appointment_date: "",
    start_time: "",
    end_time: "",
    event_type: "Makeup Session",
    location: "Studio",
    status: "Booked",
    price: "",
    look_id: "",
    notes: "",
  });
  const [clientForm, setClientForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    instagram_handle: "",
    skin_tone: "",
    undertone: "",
    skin_type: "",
    notes: "",
  });
  const [productionForm, setProductionForm] = useState({
    production_name: "",
    production_type: "Film",
    director_name: "",
    producer_name: "",
    start_date: "",
    end_date: "",
    location: "",
    notes: "",
  });
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "",
    category: "Foundation",
    shade: "",
    finish: "",
    suitable_skin_type: "",
    expiration_date: "",
    notes: "",
  });
  const [fxForm, setFxForm] = useState({
    character_id: "",
    effect_type: "Bruise",
    materials_used: "",
    application_time_minutes: "",
    removal_notes: "",
  });
  const [callSheetForm, setCallSheetForm] = useState({
    shoot_day_id: "",
    call_sheet_file: "",
    crew_call_time: "",
    talent_call_time: "",
    notes: "",
  });
  const [lookForm, setLookForm] = useState({
    look_name: "",
    description: "",
    skin_tone_match: "",
    difficulty_level: "Intermediate",
    image_url: "",
  });
  const [lookThemes, setLookThemes] = useState(["Bridal"]);
  const [selectedFoundationChoiceId, setSelectedFoundationChoiceId] = useState(null);

  // Client Profile & Scheduling Features
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClientData, setSelectedClientData] = useState(null);
  const [focusedAppointment, setFocusedAppointment] = useState(null);
  const [clientLog, setClientLog] = useState(() => {
    try {
      const raw = window.localStorage.getItem("muaVaultClientLog");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarAppointments, setCalendarAppointments] = useState({});
  const [exportFiles, setExportFiles] = useState([]);
  const [dataUpdateFilter, setDataUpdateFilter] = useState("all");
  const [dataUpdateSearch, setDataUpdateSearch] = useState("");
  
  // Entity images - keyed by "entityType-entityId"
  const [entityImages, setEntityImages] = useState({});
  const [imagesLoading, setImagesLoading] = useState({});

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(viewFromLocationHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const target = VIEW_TO_HASH[currentView] || "/dashboard";
    const nextHash = `#${target}`;
    if (window.location.hash !== nextHash) {
      window.location.hash = target;
    }
  }, [currentView]);

  useEffect(() => {
    try {
      window.localStorage.setItem("muaVaultHistory", JSON.stringify(historyEntries.slice(0, 250)));
    } catch {
      // localStorage can fail in strict browser contexts.
    }
  }, [historyEntries]);

  useEffect(() => {
    appointmentsData.slice(0, 12).forEach((appt) => {
      const key = `appointments-${appt.id}`;
      if (!entityImages[key] && !imagesLoading[key]) {
        loadEntityImages("appointments", appt.id);
      }
    });
  }, [appointmentsData, entityImages, imagesLoading]);

  useEffect(() => {
    clientsData.slice(0, 12).forEach((client) => {
      const key = `clients-${client.id}`;
      if (!entityImages[key] && !imagesLoading[key]) {
        loadEntityImages("clients", client.id);
      }
    });
  }, [clientsData, entityImages, imagesLoading]);

  useEffect(() => {
    productsData.slice(0, 12).forEach((product) => {
      const key = `products-${product.id}`;
      if (!entityImages[key] && !imagesLoading[key]) {
        loadEntityImages("products", product.id);
      }
    });
  }, [productsData, entityImages, imagesLoading]);

  useEffect(() => {
    try {
      if (currentUser) {
        window.localStorage.setItem("muaVaultCurrentUser", JSON.stringify(currentUser));
      } else {
        window.localStorage.removeItem("muaVaultCurrentUser");
      }
    } catch {
      // localStorage can fail in strict browser contexts.
    }
  }, [currentUser]);

  function addHistoryEntry(action, payload = {}) {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: new Date().toISOString(),
      action,
      payload,
    };
    setHistoryEntries((prev) => [entry, ...prev].slice(0, 250));
  }

  function trackFilledFields(formName, values) {
    Object.entries(values || {}).forEach(([fieldName, value]) => {
      const key = `${formName}.${fieldName}`;
      const hasValue = String(value ?? "").trim() !== "";
      const wasFilled = Boolean(filledFieldTrackerRef.current[key]);
      if (hasValue && !wasFilled) {
        filledFieldTrackerRef.current[key] = true;
        addHistoryEntry("Field filled", { form: formName, field: fieldName });
      }
      if (!hasValue && wasFilled) {
        filledFieldTrackerRef.current[key] = false;
      }
    });
  }

  function openDetail(type, item) {
    setSelectedDetail({ type, item });
    addHistoryEntry("Opened details", { type, id: item?.id ?? null });
  }

  function openImagePreview(imageUrl, title) {
    const resolved = resolveImageUrl(imageUrl);
    if (!resolved) {
      return;
    }
    setPreviewImage({ url: resolved, title: title || "Image preview" });
    addHistoryEntry("Opened image", { title: title || "Image preview" });
  }

  // Client Profile & Scheduling Functions
  async function loadClientProfile(clientId) {
    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}`);
      if (!response.ok) throw new Error("Failed to load client");
      const json = await response.json();
      setSelectedClientData(json.data);
      
      // Load client history
      const historyResponse = await fetch(`${API_BASE}/client-history/client/${clientId}`);
      if (historyResponse.ok) {
        const historyJson = await historyResponse.json();
        setSelectedClientData(prev => ({ ...prev, appointment_history: historyJson.data }));
      }
    } catch (err) {
      console.error("Error loading client profile:", err);
      alert("Could not load client profile");
    }
  }

  function logClientCreation(clientName, clientData) {
    const newEntry = {
      id: Date.now(),
      name: clientName,
      timestamp: new Date().toISOString(),
      data: clientData
    };
    const updated = [newEntry, ...clientLog].slice(0, 100);
    setClientLog(updated);
    try {
      window.localStorage.setItem("muaVaultClientLog", JSON.stringify(updated));
    } catch {
      // localStorage can fail in strict browser contexts
    }
  }

  function getCalendarAppointments() {
    const apptsByDate = {};
    appointmentsData.forEach(appt => {
      const date = appt.appointment_date ? appt.appointment_date.split('T')[0] : null;
      if (date) {
        if (!apptsByDate[date]) apptsByDate[date] = [];
        apptsByDate[date].push(appt);
      }
    });
    return apptsByDate;
  }

  function handlePrevMonth() {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  function getFirstDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  async function loadEntityImages(entityType, entityId) {
    const key = `${entityType}-${entityId}`;
    if (imagesLoading[key]) return; // Already loading
    
    setImagesLoading(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`${API_BASE}/uploads/${entityType}/${entityId}/images`);
      if (response.ok) {
        const json = await response.json();
        setEntityImages(prev => ({ ...prev, [key]: json.data || [] }));
      }
    } catch (err) {
      console.error(`Failed to load images for ${key}:`, err);
    } finally {
      setImagesLoading(prev => ({ ...prev, [key]: false }));
    }
  }

  function getEntityImages(entityType, entityId) {
    const key = `${entityType}-${entityId}`;
    return entityImages[key] || [];
  }

  function getEntityPrimaryImage(entityType, entityId) {
    const images = getEntityImages(entityType, entityId);
    if (images.length === 0) return null;
    return images.find(img => img.is_primary === 1) || images[0];
  }

  useEffect(() => {
    trackFilledFields("login", { email: loginEmail, password: loginPassword });
  }, [loginEmail, loginPassword]);

  useEffect(() => {
    trackFilledFields("appointment", appointmentForm);
  }, [appointmentForm]);

  useEffect(() => {
    trackFilledFields("client", clientForm);
  }, [clientForm]);

  useEffect(() => {
    trackFilledFields("production", productionForm);
  }, [productionForm]);

  useEffect(() => {
    trackFilledFields("product", productForm);
  }, [productForm]);

  useEffect(() => {
    trackFilledFields("fx", fxForm);
  }, [fxForm]);

  useEffect(() => {
    trackFilledFields("call-sheet", callSheetForm);
  }, [callSheetForm]);

  useEffect(() => {
    const move = (e) => {
      setCursor({ x: e.clientX, y: e.clientY });
      ringRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", move);

    let raf;
    const lerp = (a, b, t) => a + (b - a) * t;
    let rx = -100;
    let ry = -100;

    const animate = () => {
      rx = lerp(rx, ringRef.current.x, 0.12);
      ry = lerp(ry, ringRef.current.y, 0.12);
      setRing({ x: rx, y: ry });
      raf = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const lookFilter = activeFilter === "All" ? "all" : activeFilter;
        const [
          dashboardRes,
          clientsRes,
          apptsRes,
          looksRes,
          uploadsRes,
          productsRes,
          externalLipsticksRes,
          externalFoundationsRes,
          externalEyeshadowsRes,
          externalApiProductsRes,
          foundationShadesRes,
          productionsRes,
          effectsRes,
          callSheetsRes,
          charactersRes,
          shootDaysRes,
        ] = await Promise.allSettled([
          fetch(`${API_BASE}/industry/dashboard`),
          fetch(`${API_BASE}/clients/?limit=100&offset=0`),
          fetch(`${API_BASE}/appointments/?limit=100&offset=0`),
          fetch(`${API_BASE}/makeup-looks/?limit=100&offset=0`),
          fetch(`${API_BASE}/uploads/`),
          fetch(`${API_BASE}/products/?limit=100&offset=0`),
          fetch(`${API_BASE}/products/external/lipsticks?limit=24`),
          fetch(`${API_BASE}/look-products/external/foundations?limit=24`),
          fetch(`${API_BASE}/products/external/eyeshadows?limit=24`),
          fetch(`${API_BASE}/look-products/external/products?limit=24`),
          fetch(`${API_BASE}/foundation-shades/?limit=100&offset=0`),
          fetch(`${API_BASE}/productions/?limit=100&offset=0`),
          fetch(`${API_BASE}/effects-makeup/?limit=100&offset=0`),
          fetch(`${API_BASE}/call-sheets/?limit=100&offset=0`),
          fetch(`${API_BASE}/effects-makeup/character-options`),
          fetch(`${API_BASE}/call-sheets/shoot-day-options`),
        ]);

        const dashboardResponse = dashboardRes.status === "fulfilled" ? dashboardRes.value : null;
        const clientsResponse = clientsRes.status === "fulfilled" ? clientsRes.value : null;
        const appointmentsResponse = apptsRes.status === "fulfilled" ? apptsRes.value : null;
        const looksResponse = looksRes.status === "fulfilled" ? looksRes.value : null;
        const uploadsResponse = uploadsRes.status === "fulfilled" ? uploadsRes.value : null;
        const productsResponse = productsRes.status === "fulfilled" ? productsRes.value : null;
        const externalLipsticksResponse = externalLipsticksRes.status === "fulfilled" ? externalLipsticksRes.value : null;
        const externalFoundationsResponse = externalFoundationsRes.status === "fulfilled" ? externalFoundationsRes.value : null;
        const externalEyeshadowsResponse = externalEyeshadowsRes.status === "fulfilled" ? externalEyeshadowsRes.value : null;
        const externalApiProductsResponse = externalApiProductsRes.status === "fulfilled" ? externalApiProductsRes.value : null;
        const foundationShadesResponse = foundationShadesRes.status === "fulfilled" ? foundationShadesRes.value : null;
        const productionsResponse = productionsRes.status === "fulfilled" ? productionsRes.value : null;
        const effectsResponse = effectsRes.status === "fulfilled" ? effectsRes.value : null;
        const callSheetsResponse = callSheetsRes.status === "fulfilled" ? callSheetsRes.value : null;
        const charactersResponse = charactersRes.status === "fulfilled" ? charactersRes.value : null;
        const shootDaysResponse = shootDaysRes.status === "fulfilled" ? shootDaysRes.value : null;

        if (!dashboardResponse?.ok) {
          throw new Error("Dashboard API not reachable");
        }

        const dashboard = await dashboardResponse.json();
        const clientsPayload = clientsResponse?.ok ? await clientsResponse.json() : { data: [] };
        const appointmentsPayload = appointmentsResponse?.ok ? await appointmentsResponse.json() : { data: [] };
        const looksPayload = looksResponse?.ok ? await looksResponse.json() : { data: [] };
        const uploadsPayload = uploadsResponse?.ok ? await uploadsResponse.json() : { data: [] };
        const productsPayload = productsResponse?.ok ? await productsResponse.json() : { data: [] };
        const externalLipsticksPayload = externalLipsticksResponse?.ok ? await externalLipsticksResponse.json() : { data: [] };
        const externalFoundationsPayload = externalFoundationsResponse?.ok ? await externalFoundationsResponse.json() : { data: [] };
        const externalEyeshadowsPayload = externalEyeshadowsResponse?.ok ? await externalEyeshadowsResponse.json() : { data: [] };
        const externalApiProductsPayload = externalApiProductsResponse?.ok ? await externalApiProductsResponse.json() : { data: [] };
        const foundationShadesPayload = foundationShadesResponse?.ok ? await foundationShadesResponse.json() : { data: [] };
        const productionsPayload = productionsResponse?.ok ? await productionsResponse.json() : { data: [] };
        const effectsPayload = effectsResponse?.ok ? await effectsResponse.json() : { data: [] };
        const callSheetsPayload = callSheetsResponse?.ok ? await callSheetsResponse.json() : { data: [] };
        const charactersPayload = charactersResponse?.ok ? await charactersResponse.json() : { data: [] };
        const shootDaysPayload = shootDaysResponse?.ok ? await shootDaysResponse.json() : { data: [] };

        const totals = dashboard?.data?.totals ?? {};
        const upcoming = dashboard?.data?.upcomingShootDays ?? [];
        const dashboardStatuses = dashboard?.data?.statuses ?? {};
        const appointmentRows = Array.isArray(dashboardStatuses?.appointmentRows)
          ? dashboardStatuses.appointmentRows
          : Array.isArray(appointmentsPayload?.data)
            ? appointmentsPayload.data
            : [];
        const clientRows = Array.isArray(clientsPayload?.data) ? clientsPayload.data : [];
        const allLookRows = Array.isArray(looksPayload?.data) ? looksPayload.data : [];
        const lookRows = lookFilter === "all"
          ? allLookRows
          : allLookRows.filter((row) => lookMatchesFilter(row.category, lookFilter));
        const uploads = Array.isArray(dashboardStatuses?.uploadRows)
          ? dashboardStatuses.uploadRows
          : Array.isArray(uploadsPayload?.data)
            ? uploadsPayload.data
            : [];
        const productionRows = Array.isArray(dashboardStatuses?.productionRows) ? dashboardStatuses.productionRows : [];
        const productsRows = Array.isArray(productsPayload?.data) ? productsPayload.data : [];
        const externalLipstickRows = Array.isArray(externalLipsticksPayload?.data) ? externalLipsticksPayload.data : [];
        const externalFoundationRows = Array.isArray(externalFoundationsPayload?.data) ? externalFoundationsPayload.data : [];
        const externalEyeshadowRows = Array.isArray(externalEyeshadowsPayload?.data) ? externalEyeshadowsPayload.data : [];
        const externalAllProductRows = Array.isArray(externalApiProductsPayload?.data) ? externalApiProductsPayload.data : [];
        const foundationChoiceRows = Array.isArray(foundationShadesPayload?.data) ? foundationShadesPayload.data : [];
        const productionsRows = Array.isArray(productionsPayload?.data) ? productionsPayload.data : [];
        const effectsRows = Array.isArray(effectsPayload?.data) ? effectsPayload.data : [];
        const callSheetRows = Array.isArray(callSheetsPayload?.data) ? callSheetsPayload.data : [];
        const characterRows = Array.isArray(charactersPayload?.data) ? charactersPayload.data : [];
        const shootDayRows = Array.isArray(shootDaysPayload?.data) ? shootDaysPayload.data : [];

        setStats([
          { l: "Today's Bookings", v: String(appointmentRows.length), s: "appointments loaded" },
          { l: "Active Clients", v: String(clientRows.length), s: "client list loaded" },
          { l: "Looks in Vault", v: String(lookRows.length), s: "filtered by category" },
          { l: "Productions", v: String(totals.productions ?? 0), s: `${totals.shoot_days ?? 0} shoot days` },
        ]);

        setProds(
          (productionRows.length ? productionRows : upcoming.map((row) => ({
            id: row.id,
            name: row.production_name || "Untitled Production",
            type: row.production_type || "Production",
            meta: row.shoot_date ? `Shoot ${row.shoot_date}` : "Date TBD",
            status: "Live",
            live: true,
          }))).slice(0, 3).map((row) => ({
            id: row.id,
            name: row.name || row.production_name || "Untitled Production",
            type: row.type || row.production_type || "Production",
            meta: row.meta || (row.shoot_date ? `Shoot ${row.shoot_date}` : "Date TBD"),
            status: row.status || (row.live ? "Live" : "Planned"),
            live: row.status ? row.status === "Live" : Boolean(row.live),
          }))
        );

        setAppts(
          appointmentRows.slice(0, 6).map((row) => {
            if (row.h && row.p && row.name && row.type && row.s) {
              return row;
            }
            const time = formatTime(row.start_time);
            const status = String(row.status || "booked").toLowerCase();
            const statusClass = status.includes("complete") ? "s-completed" : status.includes("cancel") ? "s-cancelled" : status.includes("upcoming") ? "s-upcoming" : "s-booked";
            return {
              id: row.id,
              h: time.h,
              p: time.p,
              name: row.client_name || "Client",
              type: `${row.event_type || "Service"} - ${formatMoney(row.price)}`,
              s: statusClass,
              status: row.status || "Booked",
            };
          })
        );

        setClients(
          clientRows.slice(0, 6).map((row) => ({
            id: row.id,
            i: initials(row.full_name),
            name: row.full_name || "Client",
            meta: row.email || "No email",
            tone: `${row.skin_tone || "Tone n/a"} - ${row.undertone || "Undertone n/a"}`,
          }))
        );

        setLooks(
          lookRows.map((row, index) => ({
            id: row.id,
            name: row.look_name || "Untitled Look",
            cat: row.category || "Look",
            tags: [
              ...parseThemeList(row.category),
              row.skin_tone_match || "All tones",
              row.difficulty_level || "Intermediate",
            ].filter((tag, tagIndex, tagList) => tag && tagList.indexOf(tag) === tagIndex),
            imageUrl: row.image_url || null,
            swatch: swatches[index % swatches.length],
            featured: index === 0,
          }))
        );

        setUploadRows(
          uploads.slice(0, 6).map((row) => ({
            name: row.name || row.original_filename || "uploaded-file",
            meta: row.meta || `${row.entity_type || "asset"} ${row.entity_id ?? ""}`.trim(),
            status: row.status || "Ready",
          }))
        );
        setAllUploadsData(Array.isArray(uploadsPayload?.data) ? uploadsPayload.data : []);

        setAppointmentsData(Array.isArray(appointmentsPayload?.data) ? appointmentsPayload.data : []);
        setClientsData(clientRows);
        setProductsData(productsRows);
        setExternalLipsticks(externalLipstickRows);
        setExternalFoundations(externalFoundationRows);
        setExternalEyeshadows(externalEyeshadowRows);
        setExternalApiProducts(externalAllProductRows);
        setFoundationChoices(foundationChoiceRows);
        setProductionsData(productionsRows);
        setEffectsMakeupData(effectsRows);
        setCallSheetsData(callSheetRows);
        setCharactersData(characterRows);
        setShootDaysData(shootDayRows);
          // load export files list
          try {
            const exRes = await fetch(`${API_BASE}/exports/`);
            if (exRes.ok) {
              const exJson = await exRes.json();
              setExportFiles(Array.isArray(exJson.data) ? exJson.data : []);
            }
          } catch {
            setExportFiles([]);
          }

        setApiStatus("Connected");
      } catch {
        setApiStatus("Using local fallback data");
        setProds(fallbackProds);
        setAppts(fallbackAppts);
        setClients(fallbackClients);
        setLooks(fallbackLooks);
        setAppointmentsData([]);
        setClientsData([]);
        setAllUploadsData([]);
        setProductsData([]);
        setExternalLipsticks([]);
        setExternalFoundations([]);
        setExternalEyeshadows([]);
        setExternalApiProducts([]);
        setFoundationChoices([]);
        setProductionsData([]);
        setEffectsMakeupData([]);
        setCallSheetsData([]);
        setCharactersData([]);
        setShootDaysData([]);
      }
    }

    loadData();
  }, [activeFilter, refreshKey]);

  function refreshData() {
    setRefreshKey((v) => v + 1);
  }

  function openPicker() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(event) {
    const picked = Array.from(event.target.files || []).map((file) => ({
      name: file.name,
      meta: `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setSelectedFiles(picked);
  }

  function openLookImagePicker(lookId) {
    if (!lookId) {
      alert("This look is missing an ID, create/save it first.");
      return;
    }
    setLookImageTargetId(lookId);
    if (lookImageInputRef.current) {
      lookImageInputRef.current.value = "";
      lookImageInputRef.current.click();
    }
  }

  async function handleLookImageFileChange(event) {
    const file = (event.target.files || [])[0];
    if (!file || !lookImageTargetId) {
      return;
    }

    try {
      setApiStatus("Uploading look image...");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE}/makeup-looks/${lookImageTargetId}/image`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      setApiStatus("Look image uploaded");
      addHistoryEntry("Look image uploaded", { look_id: lookImageTargetId, filename: file.name });
      setLookImageTargetId(null);
      
      // Immediately refetch looks data to display new image
      try {
        const res = await fetch(`${API_BASE}/makeup-looks/?limit=100&offset=0`);
        if (res.ok) {
          const payload = await res.json();
          setLooks(Array.isArray(payload?.data) ? payload.data : []);
        }
      } catch (err) {
        console.error("Error refetching looks:", err);
      }
      
      refreshData();
    } catch (err) {
      setApiStatus(`Look image upload failed: ${err.message}`);
      alert(`Could not upload look image: ${err.message}`);
    }
  }

  function openSectionImagePicker(target) {
    if (!target?.entityType || !target?.entityId || !target?.fieldName) {
      alert("This section is missing an upload target.");
      return;
    }
    setSectionImageTarget(target);
    if (sectionImageInputRef.current) {
      sectionImageInputRef.current.value = "";
      sectionImageInputRef.current.multiple = true; // Allow multiple files
      sectionImageInputRef.current.click();
    }
  }

  async function handleSectionImageFileChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !sectionImageTarget) {
      return;
    }

    try {
      setApiStatus(`Uploading ${files.length} image(s) for ${sectionImageTarget.label}...`);
      const formData = new FormData();
      
      // Add all files
      files.forEach(file => {
        formData.append("files", file);
      });
      
      formData.append("entityType", sectionImageTarget.entityType);
      formData.append("entityId", String(sectionImageTarget.entityId));
      formData.append("fieldName", sectionImageTarget.fieldName);
      if (sectionImageTarget.notes) {
        formData.append("notes", sectionImageTarget.notes);
      }

      const response = await fetch(`${API_BASE}/uploads/linked-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = `Upload failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      setApiStatus(`${files.length} image(s) uploaded for ${sectionImageTarget.label}`);
      addHistoryEntry("Multiple images uploaded", {
        entity_type: sectionImageTarget.entityType,
        entity_id: sectionImageTarget.entityId,
        field_name: sectionImageTarget.fieldName,
        count: files.length,
      });
      
      // Load the images for this entity
      const entityType = sectionImageTarget.entityType;
      const entityId = sectionImageTarget.entityId;
      await loadEntityImages(entityType, entityId);
      
      setSectionImageTarget(null);
      refreshData();
    } catch (err) {
      setApiStatus(`Picture upload failed: ${err.message}`);
      alert(`Could not upload picture: ${err.message}`);
    }
  }

  async function handleUpload() {
    if (!selectedFiles.length) {
      alert("Please select files to upload");
      return;
    }

    try {
      setApiStatus("Uploading...");
      const fileInput = fileInputRef.current;
      if (!fileInput || !fileInput.files) {
        alert("No files selected");
        return;
      }

      const formData = new FormData();
      Array.from(fileInput.files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_BASE}/uploads/`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setApiStatus(`✓ Uploaded ${selectedFiles.length} file(s)`);
      addHistoryEntry("Bulk upload", { count: selectedFiles.length });
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Reload uploads
      const uploadsRes = await fetch(`${API_BASE}/uploads/?limit=20&offset=0`);
      if (uploadsRes.ok) {
        const uploadsData = await uploadsRes.json();
        setUploadRows(parseArray(uploadsData.data || []));
      }
      refreshData();
    } catch (err) {
      setApiStatus(`✗ Upload error: ${err.message}`);
      console.error("Upload error:", err);
    }
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      try {
        const err = await response.json();
        msg = err?.detail || err?.error?.message || msg;
      } catch {
        // no-op
      }
      throw new Error(msg);
    }
    return response.json();
  }

  async function submitAppointmentForm(event) {
    event.preventDefault();
    try {
      await postJson(`${API_BASE}/appointments/`, {
        client_id: Number(appointmentForm.client_id),
        appointment_date: appointmentForm.appointment_date,
        start_time: appointmentForm.start_time,
        end_time: appointmentForm.end_time || null,
        event_type: appointmentForm.event_type,
        location: appointmentForm.location || null,
        status: appointmentForm.status,
        price: appointmentForm.price ? Number(appointmentForm.price) : null,
        look_id: appointmentForm.look_id ? Number(appointmentForm.look_id) : null,
        notes: appointmentForm.notes || null,
      });
      setApiStatus("Appointment created");
      addHistoryEntry("Created appointment", {
        client_id: Number(appointmentForm.client_id),
        appointment_date: appointmentForm.appointment_date,
        event_type: appointmentForm.event_type,
      });
      setAppointmentForm({
        client_id: "",
        appointment_date: "",
        start_time: "",
        end_time: "",
        event_type: "Makeup Session",
        location: "Studio",
        status: "Booked",
        price: "",
        look_id: "",
        notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create appointment: ${err.message}`);
    }
  }

  async function submitClientForm(event) {
    event.preventDefault();
    try {
      const response = await postJson(`${API_BASE}/clients/`, {
        full_name: clientForm.full_name,
        email: clientForm.email || null,
        phone: clientForm.phone || null,
        instagram_handle: clientForm.instagram_handle || null,
        skin_tone: clientForm.skin_tone || null,
        undertone: clientForm.undertone || null,
        skin_type: clientForm.skin_type || null,
        notes: clientForm.notes || null,
      });
      
      // Log the client creation
      logClientCreation(clientForm.full_name, {
        email: clientForm.email,
        phone: clientForm.phone,
        skin_tone: clientForm.skin_tone
      });
      
      setApiStatus("Client created");
      addHistoryEntry("Created client", {
        full_name: clientForm.full_name,
        email: clientForm.email || null,
      });
      setClientForm({
        full_name: "",
        email: "",
        phone: "",
        instagram_handle: "",
        skin_tone: "",
        undertone: "",
        skin_type: "",
        notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create client: ${err.message}`);
    }
  }

  async function submitProductionForm(event) {
    event.preventDefault();
    try {
      await postJson(`${API_BASE}/productions/`, {
        production_name: productionForm.production_name,
        production_type: productionForm.production_type,
        director_name: productionForm.director_name || null,
        producer_name: productionForm.producer_name || null,
        start_date: productionForm.start_date || null,
        end_date: productionForm.end_date || null,
        location: productionForm.location || null,
        notes: productionForm.notes || null,
      });
      setApiStatus("Production created");
      addHistoryEntry("Created production", {
        production_name: productionForm.production_name,
        production_type: productionForm.production_type,
      });
      setProductionForm({
        production_name: "",
        production_type: "Film",
        director_name: "",
        producer_name: "",
        start_date: "",
        end_date: "",
        location: "",
        notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create production: ${err.message}`);
    }
  }

  async function submitProductForm(event) {
    event.preventDefault();
    try {
      await postJson(`${API_BASE}/products/`, {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
        shade: productForm.shade || null,
        finish: productForm.finish || null,
        suitable_skin_type: productForm.suitable_skin_type || null,
        expiration_date: productForm.expiration_date || null,
        notes: productForm.notes || null,
      });
      setApiStatus("Product created");
      addHistoryEntry("Created product", {
        name: productForm.name,
        brand: productForm.brand,
        category: productForm.category,
      });
      setProductForm({
        name: "",
        brand: "",
        category: "Foundation",
        shade: "",
        finish: "",
        suitable_skin_type: "",
        expiration_date: "",
        notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create product: ${err.message}`);
    }
  }

  function applyApiProductToForm(item, categoryOverride = "") {
    if (!item) {
      return;
    }

    const resolvedCategory = categoryOverride || item.category || item.product_type || productForm.category;
    const normalizedCategory = String(resolvedCategory || "").toLowerCase().includes("moist")
      ? "Moisturizer"
      : String(resolvedCategory || "").toLowerCase().includes("powder")
        ? "Powder"
        : String(resolvedCategory || "").toLowerCase().includes("eye")
          ? "Eyeshadow"
          : String(resolvedCategory || "").toLowerCase().includes("lip")
            ? "Lipstick"
            : String(resolvedCategory || "").toLowerCase().includes("foundation")
              ? "Foundation"
              : resolvedCategory;

    setProductForm((prev) => ({
      ...prev,
      name: item.name || prev.name,
      brand: item.brand || prev.brand,
      category: normalizedCategory || prev.category,
      shade: item.shade || item.name || prev.shade,
      notes: item.price ? `API source price: ${item.price_sign || "$"}${item.price}` : prev.notes,
    }));
  }

  async function submitFxForm(event) {
    event.preventDefault();
    try {
      await postJson(`${API_BASE}/effects-makeup/`, {
        character_id: Number(fxForm.character_id),
        effect_type: fxForm.effect_type,
        materials_used: fxForm.materials_used || null,
        application_time_minutes: fxForm.application_time_minutes ? Number(fxForm.application_time_minutes) : null,
        removal_notes: fxForm.removal_notes || null,
      });
      setApiStatus("FX makeup entry created");
      addHistoryEntry("Created FX task", {
        character_id: Number(fxForm.character_id),
        effect_type: fxForm.effect_type,
      });
      setFxForm({
        character_id: "",
        effect_type: "Bruise",
        materials_used: "",
        application_time_minutes: "",
        removal_notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create FX makeup entry: ${err.message}`);
    }
  }

  async function submitCallSheetForm(event) {
    event.preventDefault();
    try {
      await postJson(`${API_BASE}/call-sheets/`, {
        shoot_day_id: Number(callSheetForm.shoot_day_id),
        call_sheet_file: callSheetForm.call_sheet_file || null,
        crew_call_time: callSheetForm.crew_call_time || null,
        talent_call_time: callSheetForm.talent_call_time || null,
        notes: callSheetForm.notes || null,
      });
      setApiStatus("Call sheet created");
      addHistoryEntry("Created call sheet", {
        shoot_day_id: Number(callSheetForm.shoot_day_id),
        crew_call_time: callSheetForm.crew_call_time || null,
      });
      setCallSheetForm({
        shoot_day_id: "",
        call_sheet_file: "",
        crew_call_time: "",
        talent_call_time: "",
        notes: "",
      });
      refreshData();
    } catch (err) {
      alert(`Could not create call sheet: ${err.message}`);
    }
  }

  async function handleCreateAppointment() {
    const clientId = Number(prompt("Client ID"));
    if (!clientId) return;
    const appointmentDate = prompt("Appointment Date (YYYY-MM-DD)") || "";
    const startTime = prompt("Start Time (HH:MM)") || "";
    const endTime = prompt("End Time (HH:MM)") || null;
    const eventType = prompt("Event Type") || "Makeup Session";
    const location = prompt("Location") || "Studio";

    try {
      await postJson(`${API_BASE}/appointments/`, {
        client_id: clientId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        event_type: eventType,
        location,
        status: "Booked",
      });
      setApiStatus("Appointment created");
      addHistoryEntry("Created appointment", { client_id: clientId, appointment_date: appointmentDate, event_type: eventType });
      refreshData();
    } catch (err) {
      alert(`Could not create appointment: ${err.message}`);
    }
  }

  async function handleCreateClient() {
    const fullName = (prompt("Client Full Name") || "").trim();
    if (!fullName) return;
    const email = (prompt("Email (optional)") || "").trim() || null;
    const phone = (prompt("Phone (optional)") || "").trim() || null;

    try {
      await postJson(`${API_BASE}/clients/`, {
        full_name: fullName,
        email,
        phone,
      });
      setApiStatus("Client created");
      addHistoryEntry("Created client", { full_name: fullName, email });
      refreshData();
    } catch (err) {
      alert(`Could not create client: ${err.message}`);
    }
  }

  async function handleCreateLook() {
    setCurrentView("new-look");
  }

  async function submitLookForm(event) {
    event.preventDefault();

    const selectedCategory = lookThemes.length ? lookThemes.join(", ") : "Editorial";

    try {
      await postJson(`${API_BASE}/makeup-looks/`, {
        look_name: lookForm.look_name.trim(),
        category: selectedCategory,
        description: lookForm.description.trim() || null,
        skin_tone_match: lookForm.skin_tone_match || null,
        difficulty_level: lookForm.difficulty_level,
        image_url: lookForm.image_url.trim() || null,
      });
      setApiStatus("Makeup look created");
      addHistoryEntry("Created look", { look_name: lookForm.look_name, category: selectedCategory });
      setLookForm({
        look_name: "",
        description: "",
        skin_tone_match: "",
        difficulty_level: "Intermediate",
        image_url: "",
      });
      setLookThemes(["Bridal"]);
      setSelectedFoundationChoiceId(null);
      refreshData();
      setCurrentView("browse-all");
    } catch (err) {
      alert(`Could not create look: ${err.message}`);
    }
  }

  async function handleCreateProduct() {
    const name = (prompt("Product Name") || "").trim();
    if (!name) return;
    const brand = (prompt("Brand") || "").trim();
    if (!brand) return;
    const category = (prompt("Category (Foundation, Concealer, Eyeshadow, Lipstick, Lipgloss, Blush, Bronzer, Highlighter, Primer, Setting Spray)") || "Foundation").trim();
    const shade = (prompt("Shade (optional)") || "").trim() || null;

    try {
      await postJson(`${API_BASE}/products/`, {
        name,
        brand,
        category,
        shade,
      });
      setApiStatus("Product created");
      addHistoryEntry("Created product", { name, brand, category });
      refreshData();
    } catch (err) {
      alert(`Could not create product: ${err.message}`);
    }
  }

  async function handleQuickAction(label) {
    if (label === "New Appt") {
      setCurrentView("new-appointment");
      return;
    }
    if (label === "New Look") {
      await handleCreateLook();
      return;
    }
    if (label === "Add Client") {
      setCurrentView("add-client");
      return;
    }
    if (label === "Upload") {
      setCurrentView("upload-center");
      return;
    }
    if (label === "Add Product") {
      setCurrentView("add-product");
      return;
    }
    if (label === "Production") {
      setCurrentView("production-center");
      return;
    }
    if (label === "FX Makeup") {
      setCurrentView("fx-makeup");
      return;
    }
    if (label === "Call Sheet") {
      setCurrentView("call-sheets");
      return;
    }
    if (label === "Foundation API") {
      setCurrentView("foundations");
      return;
    }
    if (label === "Uploads Dashboard") {
      setCurrentView("uploads-dashboard");
      return;
    }
    if (label === "History") {
      setCurrentView("history-tracker");
    }
  }

  function handleBrowseAll() {
    setCurrentView("browse-all");
  }

  function handleOpenLookMorgueConnector() {
    setCurrentView("look-morgue-connector");
  }

  function handleOpenLookMorgue() {
    setCurrentView("dashboard");
    window.setTimeout(() => {
      const anchor = document.getElementById("look-morgue-anchor");
      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  }

  function toggleLookTheme(theme) {
    setLookThemes((prev) => {
      if (prev.includes(theme)) {
        return prev.filter((item) => item !== theme);
      }
      return [...prev, theme];
    });
  }

  function chooseFoundationReference(choice) {
    if (!choice) {
      return;
    }
    setSelectedFoundationChoiceId(choice.id);
    const foundationLabel = [choice.brand, choice.shade_name, choice.shade_code].filter(Boolean).join(" · ");
    setLookForm((value) => ({
      ...value,
      skin_tone_match: foundationLabel || value.skin_tone_match,
    }));
  }

  function handleLoginView() {
    setCurrentView("login");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    try {
      const email = loginEmail.trim();
      const password = loginPassword;
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      async function attemptLogin() {
        return fetch(`${API_BASE}/users/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      }

      setApiStatus("Signing in...");
      let response = await attemptLogin();

      if (response.status === 401 || response.status === 404) {
        const inferredName = email.split("@")[0].replace(/[._-]+/g, " ").trim() || "Vault User";
        const createRes = await fetch(`${API_BASE}/users/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: inferredName,
            email,
            password,
            role: "artist",
          }),
        });

        if (createRes.ok || createRes.status === 400) {
          response = await attemptLogin();
        }
      }

      if (!response.ok) {
        let message = `Login failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || err?.message || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      const payload = await response.json();
      const user = payload?.data || {};
      setCurrentUser({
        id: user.id ?? null,
        name: user.name || "Vault User",
        email: user.email || email,
        role: user.role || "artist",
        last_login: new Date().toISOString(),
      });
      setApiStatus(`Signed in as ${user.name || loginEmail}`);
      addHistoryEntry("Login success", { email: user.email || email });
      setCurrentView("dashboard");
    } catch (err) {
      setApiStatus(`Login error: ${err.message}`);
      addHistoryEntry("Login error", { email: loginEmail.trim(), message: err.message });
      alert(`Could not sign in: ${err.message}`);
    }
  }

  function handleLogout() {
    if (currentUser) {
      addHistoryEntry("Logout", { email: currentUser.email || null });
    }
    setCurrentUser(null);
    setApiStatus("Logged out");
    setCurrentView("login");
  }

  function handleManageProds() {
    setCurrentView("manage-prods");
  }

  function handleFullCalendar() {
    setCurrentView("full-calendar");
  }

  function handleDataUpdates() {
    setCurrentView("data-updates");
  }

  function handleAllClients() {
    setCurrentView("all-clients");
  }

  function handleClientsPage() {
    setCurrentView("all-clients");
  }

  function handleClientProfile(clientId, appointment = null) {
    setSelectedClientId(clientId);
    setFocusedAppointment(appointment);
    loadClientProfile(clientId);
    setCurrentView("client-profile");
  }

  async function deleteClient(clientId, clientName = "this client") {
    const confirmed = window.confirm(`Delete ${clientName}? This will remove the client and related history.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/clients/${clientId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = `Delete failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      addHistoryEntry("Deleted client", { client_id: clientId, client_name: clientName });
      setApiStatus(`Deleted ${clientName}`);
      setSelectedClientData(null);
      setSelectedClientId(null);
      setCurrentView("all-clients");
      refreshData();
    } catch (err) {
      alert(`Could not delete client: ${err.message}`);
    }
  }

  async function deleteLook(lookId, lookName = "this look") {
    const confirmed = window.confirm(`Delete ${lookName}? This will remove the look from the morgue.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/makeup-looks/${lookId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = `Delete failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      addHistoryEntry("Deleted look", { look_id: lookId, look_name: lookName });
      setApiStatus(`Deleted ${lookName}`);
      if (selectedDetail?.type === "Look" && selectedDetail?.item?.id === lookId) {
        setSelectedDetail(null);
      }
      refreshData();
    } catch (err) {
      alert(`Could not delete look: ${err.message}`);
    }
  }

  async function deleteProduction(productionId, productionName = "this production") {
    const confirmed = window.confirm(`Delete ${productionName}? This will remove the production from the vault.`);
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/productions/${productionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = `Delete failed (${response.status})`;
        try {
          const err = await response.json();
          message = err?.detail || message;
        } catch {
          // no-op
        }
        throw new Error(message);
      }

      addHistoryEntry("Deleted production", { production_id: productionId, production_name: productionName });
      setApiStatus(`Deleted ${productionName}`);
      if (selectedDetail?.type === "Production" && selectedDetail?.item?.id === productionId) {
        setSelectedDetail(null);
      }
      refreshData();
    } catch (err) {
      alert(`Could not delete production: ${err.message}`);
    }
  }

  const runwayLooks = looks.filter((lk) => lookMatchesFilter(lk.cat, "Runway"));
  const fxLooks = looks.filter((lk) => lookMatchesFilter(lk.cat, "FX"));
  const foundationPageChoices = foundationChoices.length ? foundationChoices : [];
  const groupedUploads = allUploadsData.reduce((acc, row) => {
    const key = row.entity_type || "general";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {});

  const productionCoverMap = allUploadsData.reduce((acc, row) => {
    if (!row || row.entity_type !== "productions" || row.entity_id == null) {
      return acc;
    }
    const key = String(row.entity_id);
    if (!acc[key]) {
      const resolved = resolveImageUrl(row.storage_url);
      if (resolved) {
        acc[key] = resolved;
      }
    }
    return acc;
  }, {});

  function productionCoverUrl(production) {
    if (!production) {
      return noImagePlaceholder();
    }
    const fromUploads = productionCoverMap[String(production.id)];
    if (fromUploads) {
      return fromUploads;
    }
    const fromRecord = resolveImageUrl(production.cover_image || production.imageUrl || production.photo_url || "");
    if (fromRecord) {
      return fromRecord;
    }
    return noImagePlaceholder();
  }

  function entityTypePhotoRows(entityType) {
    return allUploadsData.filter((row) => {
      if (!row || row.entity_type !== entityType) {
        return false;
      }
      const hasUrl = Boolean(resolveImageUrl(row.storage_url));
      return hasUrl;
    });
  }

  function renderEntityTypeLibrary(entityType, title) {
    const rows = entityTypePhotoRows(entityType);
    return (
      <div className="section-library">
        <div className="section-library-meta">{title} · {rows.length} photo(s)</div>
        {rows.length ? (
          <div className="library-strip">
            {rows.map((row, idx) => {
              const url = resolveImageUrl(row.storage_url) || noImagePlaceholder();
              return (
                <div
                  key={`${entityType}-${row.upload_id || idx}`}
                  className="library-thumb"
                  style={{ backgroundImage: `url(${url})` }}
                  onClick={() => openImagePreview(url, row.original_filename || `${title} photo`)}
                />
              );
            })}
          </div>
        ) : (
          <div className="section-library-meta">No photos uploaded yet.</div>
        )}
      </div>
    );
  }

  function historyLabel(entry) {
    const at = new Date(entry.at);
    const timestamp = Number.isNaN(at.getTime()) ? entry.at : at.toLocaleString();
    return `${entry.action} · ${timestamp}`;
  }

  function updateCategory(entry) {
    const action = String(entry?.action || "").toLowerCase();
    if (action.includes("export") || action.includes("parquet") || action.includes("quality")) return "export";
    if (action.includes("appointment")) return "appointment";
    if (action.includes("client")) return "client";
    if (action.includes("login") || action.includes("logout")) return "system";
    if (action.includes("upload") || action.includes("image")) return "media";
    return "vault";
  }

  function updateIcon(kind) {
    switch (kind) {
      case "export":
        return "⬇︎";
      case "appointment":
        return "⌁";
      case "client":
        return "◉";
      case "system":
        return "✦";
      case "media":
        return "▣";
      default:
        return "✳";
    }
  }

  function updateTint(kind) {
    switch (kind) {
      case "export":
        return "var(--teal)";
      case "appointment":
        return "var(--lime-bright)";
      case "client":
        return "var(--pink)";
      case "system":
        return "var(--yellow, #f5c542)";
      case "media":
        return "var(--orange, #d88f52)";
      default:
        return "var(--text)";
    }
  }

  function updateDateKey(entry) {
    const raw = entry?.at || entry?.timestamp || new Date().toISOString();
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
      return "Unknown date";
    }
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <>
      <style>{CSS}</style>

      <div className="cursor" style={{ left: cursor.x, top: cursor.y }} />
      <div className="cursor-ring" style={{ left: ring.x, top: ring.y }} />

      {previewImage && (
        <div className="view-modal" onClick={() => setPreviewImage(null)}>
          <div className="view-content" style={{ maxWidth: 920 }} onClick={(event) => event.stopPropagation()}>
            <div className="view-header">
              <h2 className="view-title">{previewImage.title}</h2>
              <button className="view-close" onClick={() => setPreviewImage(null)}>✕</button>
            </div>
            <img
              src={previewImage.url}
              alt={previewImage.title}
              style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", borderRadius: 10, border: "1px solid var(--border)" }}
            />
          </div>
        </div>
      )}

      {selectedDetail && (
        <div className="view-modal" onClick={() => setSelectedDetail(null)}>
          <div className="view-content" style={{ maxWidth: 760 }} onClick={(event) => event.stopPropagation()}>
            <div className="view-header">
              <h2 className="view-title">{selectedDetail.type} Details</h2>
              <button className="view-close" onClick={() => setSelectedDetail(null)}>✕</button>
            </div>
            {detailImageUrl(selectedDetail.item) ? (
              <img
                src={detailImageUrl(selectedDetail.item)}
                alt={`${selectedDetail.type} preview`}
                style={{ width: "100%", maxHeight: "52vh", objectFit: "contain", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 12 }}
              />
            ) : null}
            {selectedDetail.type === "Look" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  className="panel-link delete-action"
                  type="button"
                  onClick={() => deleteLook(selectedDetail.item?.id, selectedDetail.item?.name || "this look")}
                >
                  Delete Look -&gt;
                </button>
              </div>
            ) : null}
            {selectedDetail.type === "Production" ? (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <button
                  className="panel-link delete-action"
                  type="button"
                  onClick={() => deleteProduction(selectedDetail.item?.id, selectedDetail.item?.name || selectedDetail.item?.production_name || "this production")}
                >
                  Delete Production -&gt;
                </button>
              </div>
            ) : null}
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11, lineHeight: 1.5, color: "var(--text)", background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8, padding: 14 }}>
              {JSON.stringify(selectedDetail.item, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {currentView === "login" && (
        <div className="login-screen">
          <div className="login-card">
            <p className="login-kicker">MUA Vault Access</p>
            <h1 className="login-title">Sign in to your vault</h1>
            <p className="login-copy">
              Use your workspace account to open the dashboard, review looks, and manage productions.
            </p>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <label className="login-label">
                Email
                <input
                  className="login-input"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@muavault.com"
                />
              </label>
              <label className="login-label">
                Password
                <input
                  className="login-input"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </label>
              <div className="login-actions">
                <button className="login-button" type="submit">Login</button>
                <button className="login-button secondary" type="button" onClick={() => setCurrentView("dashboard")}>Back to Vault</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "browse-all" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">THE VAULT - All Looks</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div className="view-grid">
              {looks.map((lk, i) => (
                <div key={i} className="view-item">
                  <div
                    className="view-thumb"
                    style={{ backgroundImage: `url(${resolveLookPreviewImage(lk)})` }}
                    onClick={(event) => {
                      event.stopPropagation();
                      openImagePreview(resolveLookPreviewImage(lk), lk.name || "Look");
                    }}
                  />
                  <div className="view-item-title">{lk.name}</div>
                  <div className="view-item-meta">{parseThemeList(lk.cat).join(" · ") || lk.cat}</div>
                  <div style={{ marginTop: 8, fontSize: 8, color: "var(--text-faint)" }}>
                    {lk.tags.slice(0, 3).join(" · ")}
                  </div>
                  <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openLookImagePicker(lk.id); }}>
                    Upload Photo -&gt;
                  </button>
                  <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openDetail("Look", lk); }}>
                    View Details -&gt;
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "new-look" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">New Look</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>

            <form className="entity-form" onSubmit={submitLookForm}>
              <div className="entity-grid">
                <label className="entity-label">
                  Look Name
                  <input className="entity-input" required value={lookForm.look_name} onChange={(e) => setLookForm((v) => ({ ...v, look_name: e.target.value }))} />
                </label>
                <label className="entity-label">
                  Skin Tone Match
                  <select className="entity-input" value={lookForm.skin_tone_match} onChange={(e) => setLookForm((v) => ({ ...v, skin_tone_match: e.target.value }))}>
                    <option value="">All tones</option>
                    {SKIN_TONES.map((tone) => <option key={tone} value={tone}>{tone}</option>)}
                  </select>
                </label>
                <label className="entity-label">
                  Difficulty
                  <select className="entity-input" value={lookForm.difficulty_level} onChange={(e) => setLookForm((v) => ({ ...v, difficulty_level: e.target.value }))}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </label>
                <label className="entity-label">
                  Image URL
                  <input className="entity-input" value={lookForm.image_url} onChange={(e) => setLookForm((v) => ({ ...v, image_url: e.target.value }))} placeholder="Optional upload link" />
                </label>
              </div>

              <label className="entity-label">
                Description
                <textarea className="entity-input entity-textarea" value={lookForm.description} onChange={(e) => setLookForm((v) => ({ ...v, description: e.target.value }))} />
              </label>

              <div style={{ marginTop: 14 }}>
                <div className="section-head" style={{ marginBottom: 10 }}>
                  <span className="section-tag pink">Themes</span>
                  <h3 className="view-title" style={{ fontSize: 18 }}>Choose look themes</h3>
                  <button className="section-action" type="button" onClick={handleOpenLookMorgueConnector}>Open Connector</button>
                </div>
                <div className="theme-chip-grid">
                  {LOOK_THEMES.map((theme) => (
                    <button
                      key={theme}
                      type="button"
                      className={`theme-chip ${lookThemes.includes(theme) ? "active" : ""}`}
                      onClick={() => toggleLookTheme(theme)}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Selected: {lookThemes.length ? lookThemes.join(" · ") : "None"}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div className="section-head" style={{ marginBottom: 10 }}>
                  <span className="section-tag lime">Foundation API</span>
                  <h3 className="view-title" style={{ fontSize: 18 }}>Connect a matching foundation reference</h3>
                  <button className="section-action" type="button" onClick={() => setCurrentView("foundations")}>Open Foundation Page</button>
                </div>
                <div className="foundation-ref-grid">
                  {foundationPageChoices.slice(0, 8).map((choice) => {
                    const isActive = selectedFoundationChoiceId === choice.id;
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        className={`foundation-ref-card ${isActive ? "active" : ""}`}
                        onClick={() => chooseFoundationReference(choice)}
                      >
                        <div className="foundation-ref-top">
                          <span>{choice.brand || "Brand"}</span>
                          <span>{choice.shade_code || "Shade"}</span>
                        </div>
                        <div className="foundation-ref-name">{choice.shade_name || "Unnamed shade"}</div>
                        <div className="foundation-ref-meta">{choice.undertone || "Undertone n/a"} · {choice.client_name || "Client n/a"}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Foundation match: {lookForm.skin_tone_match || "Not selected"}
                </div>
              </div>

              <div className="login-actions" style={{ marginTop: 18 }}>
                <button className="login-button" type="submit">Create Look</button>
                <button className="login-button secondary" type="button" onClick={handleOpenLookMorgueConnector}>Go to Morgue Connector</button>
              </div>
            </form>

            <div className="view-list" style={{ marginTop: 18 }}>
              {looks.slice(0, 8).map((lk) => (
                <div key={lk.id} className="view-list-item" onClick={() => openDetail("Look", lk)} style={{ cursor: "pointer" }}>
                  <div className="view-list-left">
                    <div className="view-list-title">{lk.name}</div>
                    <div className="view-list-meta">{lk.cat}</div>
                  </div>
                  <button type="button" className="row-upload-btn" onClick={(e) => { e.stopPropagation(); openLookImagePicker(lk.id); }}>
                    Upload
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "look-morgue-connector" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Look Morgue Connector</h2>
              <button className="view-close" onClick={() => setCurrentView("new-look")}>✕</button>
            </div>

            <div className="connector-panel">
              <div className="connector-card">
                <div className="connector-kicker">Step 1</div>
                <h3>Build the look</h3>
                <p>Use the new look form to choose themes, tone match, and difficulty before saving it to the vault.</p>
                <button className="login-button" type="button" onClick={() => setCurrentView("new-look")}>Back to New Look</button>
              </div>
              <div className="connector-card accent">
                <div className="connector-kicker">Step 2</div>
                <h3>Open the look morgue</h3>
                <p>Jump into the Look Morgue reference wall for inspiration, lookbook browsing, and visual matching.</p>
                <button className="login-button" type="button" onClick={handleOpenLookMorgue}>Go to Look Morgue</button>
              </div>
              <div className="connector-card">
                <div className="connector-kicker">Step 3</div>
                <h3>Foundation API</h3>
                <p>Match the look to a foundation reference pulled directly from the live foundation-shades endpoint.</p>
                <button className="login-button secondary" type="button" onClick={() => setCurrentView("foundations")}>Open Foundation Page</button>
              </div>
            </div>

            <div className="view-list" style={{ marginTop: 18 }}>
              {looks.slice(0, 4).map((lk) => (
                <div key={lk.id} className="view-list-item" onClick={() => openDetail("Look", lk)} style={{ cursor: "pointer" }}>
                  <div className="view-list-left">
                    <div className="view-list-title">{lk.name}</div>
                    <div className="view-list-meta">{parseThemeList(lk.cat).join(" · ") || lk.cat}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "runway-looks" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Runway Looks</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <button className="login-button secondary" type="button" onClick={() => setCurrentView("uploads-dashboard")}>Open Uploads Dashboard</button>
            </div>
            {runwayLooks.length ? (
              <div className="view-grid">
                {runwayLooks.map((lk, i) => (
                  <div key={lk.id || i} className="view-item">
                    <div
                      className="view-thumb"
                      style={{ backgroundImage: `url(${resolveLookPreviewImage(lk)})` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        openImagePreview(resolveLookPreviewImage(lk), lk.name || "Runway look");
                      }}
                    />
                    <div className="view-item-title">{lk.name}</div>
                    <div className="view-item-meta">{lk.cat}</div>
                    <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openLookImagePicker(lk.id); }}>Upload Photo -&gt;</button>
                    <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openDetail("Runway look", lk); }}>View Details -&gt;</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Runway Looks Yet</div>
                <div className="empty-state-copy">Create one now or switch back to all looks.</div>
                <div className="empty-state-actions">
                  <button className="login-button" type="button" onClick={handleCreateLook}>Create Look</button>
                  <button className="login-button secondary" type="button" onClick={() => setCurrentView("browse-all")}>Browse All Looks</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "fx-looks" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">FX Looks</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <button className="login-button secondary" type="button" onClick={() => setCurrentView("uploads-dashboard")}>Open Uploads Dashboard</button>
            </div>
            {fxLooks.length ? (
              <div className="view-grid">
                {fxLooks.map((lk, i) => (
                  <div key={lk.id || i} className="view-item">
                    <div
                      className="view-thumb"
                      style={{ backgroundImage: `url(${resolveLookPreviewImage(lk)})` }}
                      onClick={(event) => {
                        event.stopPropagation();
                        openImagePreview(resolveLookPreviewImage(lk), lk.name || "FX look");
                      }}
                    />
                    <div className="view-item-title">{lk.name}</div>
                    <div className="view-item-meta">{lk.cat}</div>
                    <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openLookImagePicker(lk.id); }}>Upload Photo -&gt;</button>
                    <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openDetail("FX look", lk); }}>View Details -&gt;</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No FX Looks Yet</div>
                <div className="empty-state-copy">Add your first FX look, then upload photos directly.</div>
                <div className="empty-state-actions">
                  <button className="login-button" type="button" onClick={handleCreateLook}>Create Look</button>
                  <button className="login-button secondary" type="button" onClick={() => setCurrentView("browse-all")}>Browse All Looks</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "manage-prods" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Production Manager</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div className="view-list">
              {prods.map((p, i) => (
                <div key={i} className="view-list-item" onClick={() => openDetail("Production", p)}>
                  <div className="view-list-left">
                    <div className="view-list-title">{p.name}</div>
                    <div className="view-list-meta">{p.meta}</div>
                  </div>
                  <span className="view-list-status">{p.status || (p.live ? "LIVE" : "PLANNED")}</span>
                  <button type="button" className="row-upload-btn delete-action" onClick={(event) => { event.stopPropagation(); deleteProduction(p.id, p.name); }}>
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "full-calendar" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Appointment Calendar</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div style={{ padding: "16px" }}>
              {/* Calendar Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <button className="login-button secondary" onClick={handlePrevMonth}>← Prev</button>
                <h3 style={{ fontSize: "16px", margin: 0 }}>
                  {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <button className="login-button secondary" onClick={handleNextMonth}>Next →</button>
              </div>

              {/* Day Headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} style={{ textAlign: "center", fontWeight: "bold", color: "var(--teal)", fontSize: "12px", padding: "4px" }}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {Array.from({ length: getFirstDayOfMonth(calendarMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} style={{ aspectRatio: "1", background: "var(--bg-3)", borderRadius: "4px" }} />
                ))}
                {Array.from({ length: getDaysInMonth(calendarMonth) }).map((_, i) => {
                  const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i + 1);
                  const dateStr = date.toISOString().split('T')[0];
                  const appts = getCalendarAppointments()[dateStr] || [];
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  
                  return (
                    <div
                      key={i + 1}
                      style={{
                        aspectRatio: "1",
                        border: isToday ? "2px solid var(--pink)" : "1px solid var(--border)",
                        borderRadius: "4px",
                        background: appts.length > 0 ? "var(--teal-faint)" : "var(--bg-3)",
                        padding: "4px",
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "10px",
                        cursor: "pointer",
                        overflow: "hidden",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: "bold", color: isToday ? "var(--pink)" : "var(--text)", marginBottom: "2px" }}>
                        {i + 1}
                      </div>
                      <div style={{ fontSize: "8px", color: "var(--text-dim)", overflow: "hidden" }}>
                        {appts.length > 0 && (
                          <>
                            <div style={{ color: "var(--teal)" }}>{appts.length} appt{appts.length > 1 ? 's' : ''}</div>
                            {appts.slice(0, 2).map((a, idx) => (
                              <div key={idx} onClick={(e) => { e.stopPropagation(); handleClientProfile(a.client_id || a.client?.id, a); }} style={{ color: "var(--lime-bright)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}>
                                {a.client_name?.split(' ')[0] || `#${a.id}`}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Appointments List */}
              <div style={{ marginTop: "24px" }}>
                <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--teal)" }}>
                  Appointments ({appointmentsData.length})
                </h3>
                <div className="view-list">
                  {appointmentsData.slice(0, 10).map((a) => (
                    <div key={a.id} className="view-list-item" onClick={(e) => { e.stopPropagation(); handleClientProfile(a.client_id || a.client?.id, a); }}>
                      <div className="view-list-left">
                        <div className="view-list-title">{a.client_name || `Client ${a.client_id}`}</div>
                        <div className="view-list-meta">{a.appointment_date} · {a.start_time} · {a.event_type}</div>
                      </div>
                      <span className="view-list-status">{a.status || "Booked"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "all-clients" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Client Roster</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>

            {/* Client Log Section */}
            {clientLog.length > 0 && (
              <div style={{ marginBottom: "16px", padding: "12px", background: "var(--bg-3)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--teal)", marginBottom: "8px" }}>
                  Recently Added Clients
                </div>
                {clientLog.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: "6px 8px",
                      background: "var(--bg)",
                      borderRadius: "4px",
                      marginBottom: "4px",
                      fontSize: "11px",
                      color: "var(--text-dim)",
                      borderLeft: "2px solid var(--lime)"
                    }}
                  >
                    <div style={{ color: "var(--text)" }}>{entry.name}</div>
                    <div style={{ fontSize: "9px" }}>{new Date(entry.timestamp).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="view-list">
              {clientsData && clientsData.length > 0 ? (
                clientsData.map((c) => (
                  <div
                    key={c.id}
                    className="view-list-item"
                    onClick={() => handleClientProfile(c.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="view-list-left">
                      <div className="view-list-title">{c.full_name}</div>
                      <div className="view-list-meta">{c.email || c.phone || 'No contact'} · {c.skin_tone || 'N/A'}</div>
                    </div>
                    <button type="button" className="row-upload-btn delete-action" onClick={(e) => { e.stopPropagation(); deleteClient(c.id, c.full_name); }}>
                      Delete
                    </button>
                    <button type="button" className="row-upload-btn" onClick={(e) => { e.stopPropagation(); handleClientProfile(c.id); }}>
                      View Profile →
                    </button>
                  </div>
                ))
              ) : (
                clients.map((c, i) => (
                  <div
                    key={i}
                    className="view-list-item"
                    onClick={() => handleClientProfile(c.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="view-list-left">
                      <div className="view-list-title">{c.name}</div>
                      <div className="view-list-meta">{c.meta} · {c.tone}</div>
                    </div>
                    <button type="button" className="row-upload-btn delete-action" onClick={(e) => { e.stopPropagation(); deleteClient(c.id, c.name); }}>
                      Delete
                    </button>
                    <button type="button" className="row-upload-btn" onClick={(e) => { e.stopPropagation(); handleClientProfile(c.id); }}>
                      View Profile →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "data-updates" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Data Updates</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div style={{ padding: "16px" }}>
              <div className="section-head" style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 className="view-title" style={{ fontSize: 16 }}>Recent Vault Updates</h3>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{historyEntries.length} record(s)</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
                <div className="view-item" style={{ background: "linear-gradient(180deg, rgba(92,210,196,0.16), rgba(92,210,196,0.05))" }}>
                  <div className="view-item-meta">Total Updates</div>
                  <div className="view-item-title">{historyEntries.length}</div>
                </div>
                <div className="view-item" style={{ background: "linear-gradient(180deg, rgba(173,108,255,0.16), rgba(173,108,255,0.05))" }}>
                  <div className="view-item-meta">Exports</div>
                  <div className="view-item-title">{historyEntries.filter((item) => updateCategory(item) === "export").length}</div>
                </div>
                <div className="view-item" style={{ background: "linear-gradient(180deg, rgba(255,110,183,0.16), rgba(255,110,183,0.05))" }}>
                  <div className="view-item-meta">Appointments</div>
                  <div className="view-item-title">{historyEntries.filter((item) => updateCategory(item) === "appointment").length}</div>
                </div>
                <div className="view-item" style={{ background: "linear-gradient(180deg, rgba(255,198,80,0.16), rgba(255,198,80,0.05))" }}>
                  <div className="view-item-meta">Clients</div>
                  <div className="view-item-title">{historyEntries.filter((item) => updateCategory(item) === "client").length}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                {["all", "export", "appointment", "client", "system", "media"].map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    className="login-button secondary"
                    onClick={() => setDataUpdateFilter(kind)}
                    style={{ opacity: dataUpdateFilter === kind ? 1 : 0.6, padding: "8px 12px" }}
                  >
                    {kind === "all" ? "All" : kind.charAt(0).toUpperCase() + kind.slice(1)}
                  </button>
                ))}
                <input
                  className="search-input"
                  placeholder="Search updates..."
                  value={dataUpdateSearch}
                  onChange={(e) => setDataUpdateSearch(e.target.value)}
                  style={{ minWidth: 220, flex: 1 }}
                />
              </div>

              {/* Export Files */}
              <div style={{ marginBottom: 12, padding: 12, border: "1px solid var(--border)", borderRadius: 14, background: "var(--bg-3)" }}>
                <h4 style={{ margin: 0, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-dim)" }}>Latest Exports</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
                  {exportFiles.length ? exportFiles.slice(0, 6).map((f) => (
                    <div key={f.name} className="view-item" style={{ width: "100%", minHeight: 126, borderTop: "3px solid var(--teal)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          <div className="view-item-title">{f.name}</div>
                          <div className="view-item-meta">{new Date((f.modified || 0) * 1000).toLocaleString()}</div>
                        </div>
                        <span className="view-list-status" style={{ background: "rgba(92,210,196,0.12)", color: "var(--teal)" }}>{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                      <a className="panel-link" href={f.url} target="_blank" rel="noreferrer" style={{ marginTop: 10, display: "inline-flex" }}>Download →</a>
                    </div>
                  )) : (
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>No exports yet</div>
                  )}
                </div>
              </div>

              <div>
                {(() => {
                  const filtered = historyEntries
                    .filter((entry) => dataUpdateFilter === "all" || updateCategory(entry) === dataUpdateFilter)
                    .filter((entry) => {
                      const haystack = `${entry.action || ""} ${JSON.stringify(entry.payload || {})}`.toLowerCase();
                      return haystack.includes(dataUpdateSearch.toLowerCase());
                    })
                    .slice(0, 12);

                  const grouped = filtered.reduce((acc, entry) => {
                    const key = updateDateKey(entry);
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(entry);
                    return acc;
                  }, {});

                  return Object.entries(grouped).map(([dateLabel, entries]) => (
                    <div key={dateLabel} style={{ marginBottom: 18 }}>
                      <div className="timeline-divider">{dateLabel}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                        {entries.map((h) => {
                          const kind = updateCategory(h);
                          return (
                            <div key={h.id} className="view-item" style={{ cursor: "pointer", position: "relative", borderTop: `3px solid ${updateTint(kind)}`, minHeight: 150, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))" }} onClick={() => { setCurrentView("history-tracker"); }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 12 }}>
                                <div style={{ width: 34, height: 34, borderRadius: 10, display: "grid", placeItems: "center", background: "var(--bg-3)", color: updateTint(kind), fontSize: 18, border: `1px solid ${updateTint(kind)}33` }}>
                                  {updateIcon(kind)}
                                </div>
                                <span className="view-list-status" style={{ background: `${updateTint(kind)}22`, color: updateTint(kind) }}>{kind}</span>
                              </div>
                              <div className="view-item-title">{h.action}</div>
                              <div className="view-item-meta">{new Date(h.at || h.timestamp || Date.now()).toLocaleString()}</div>
                              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8, maxHeight: 60, overflow: "hidden", textOverflow: "ellipsis" }}>{JSON.stringify(h.payload || {})}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "client-profile" && selectedClientData && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">{selectedClientData.full_name || "Client Profile"}</h2>
              <button className="view-close" onClick={() => { setCurrentView("all-clients"); setSelectedClientData(null); }}>✕</button>
            </div>

            <div style={{ padding: "16px" }}>
              {/* Client Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Email</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.email || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Phone</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.phone || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Skin Tone</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.skin_tone || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Undertone</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.undertone || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Skin Type</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.skin_type || "N/A"}</div>
                </div>
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "4px" }}>Instagram</div>
                  <div style={{ fontSize: "12px", color: "var(--text)" }}>{selectedClientData.instagram_handle || "N/A"}</div>
                </div>
              </div>

              {/* Notes */}
              {selectedClientData.notes && (
                <div style={{ background: "var(--bg-3)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", marginBottom: "24px" }}>
                  <div style={{ fontSize: "9px", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: "8px" }}>Notes</div>
                  <div style={{ fontSize: "12px", color: "var(--text)", lineHeight: "1.4" }}>{selectedClientData.notes}</div>
                </div>
              )}

              {/* Focused Appointment (from calendar click) */}
              {focusedAppointment && (
                <div style={{ marginBottom: 16, padding: 14, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Upcoming Appointment</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 6 }}>{new Date(focusedAppointment.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {focusedAppointment.start_time || ''}</div>
                      <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>{focusedAppointment.event_type || 'Service'} · {focusedAppointment.location || 'Location TBD'}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--teal)" }}>{focusedAppointment.status || 'Booked'}</div>
                      {focusedAppointment.price ? <div style={{ fontSize: 14, color: "var(--text)" }}>{formatMoney(focusedAppointment.price)}</div> : null}
                      <button className="panel-link" style={{ marginTop: 8 }} onClick={() => { setFocusedAppointment(null); }}>Close</button>
                    </div>
                  </div>
                  {focusedAppointment.notes && (
                    <div style={{ fontSize: 12, color: "var(--text)", background: "var(--bg-3)", padding: 10, borderRadius: 8 }}>{focusedAppointment.notes}</div>
                  )}
                </div>
              )}

              {/* Appointment History */}
              <div>
                <h3 style={{ fontSize: "14px", color: "var(--teal)", marginBottom: "12px" }}>Appointment History</h3>
                {selectedClientData.appointment_history && selectedClientData.appointment_history.length > 0 ? (
                  <div className="view-list">
                    {selectedClientData.appointment_history.map((h) => (
                      <div key={h.id} style={{ padding: "8px", background: "var(--bg-3)", borderRadius: "4px", marginBottom: "6px", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: "11px", color: "var(--text)" }}>{h.date}</div>
                        <div style={{ fontSize: "10px", color: "var(--text-dim)" }}>{h.event_type || h.look_name || "Service"}</div>
                        {h.client_feedback && <div style={{ fontSize: "9px", color: "var(--lime)", marginTop: "4px" }}>{h.client_feedback}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "11px", color: "var(--text-faint)", padding: "12px", background: "var(--bg-3)", borderRadius: "4px" }}>
                    No appointment history found
                  </div>
                )}
              </div>

              <button className="login-button" onClick={() => setCurrentView("all-clients")} style={{ marginTop: "16px", width: "100%" }}>
                Back to Roster
              </button>
              <button className="login-button secondary delete-action" onClick={() => deleteClient(selectedClientData.id, selectedClientData.full_name)} style={{ marginTop: "10px", width: "100%" }}>
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "new-appointment" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Appointment Setter</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <form className="entity-form" onSubmit={submitAppointmentForm}>
              <div className="entity-grid">
                <label className="entity-label">Client ID<input className="entity-input" type="number" min="1" required value={appointmentForm.client_id} onChange={(e) => setAppointmentForm((v) => ({ ...v, client_id: e.target.value }))} /></label>
                <label className="entity-label">Date<input className="entity-input" type="date" required value={appointmentForm.appointment_date} onChange={(e) => setAppointmentForm((v) => ({ ...v, appointment_date: e.target.value }))} /></label>
                <label className="entity-label">Start Time<input className="entity-input" type="time" required value={appointmentForm.start_time} onChange={(e) => setAppointmentForm((v) => ({ ...v, start_time: e.target.value }))} /></label>
                <label className="entity-label">End Time<input className="entity-input" type="time" value={appointmentForm.end_time} onChange={(e) => setAppointmentForm((v) => ({ ...v, end_time: e.target.value }))} /></label>
                <label className="entity-label">Event Type<input className="entity-input" required value={appointmentForm.event_type} onChange={(e) => setAppointmentForm((v) => ({ ...v, event_type: e.target.value }))} /></label>
                <label className="entity-label">Location<input className="entity-input" value={appointmentForm.location} onChange={(e) => setAppointmentForm((v) => ({ ...v, location: e.target.value }))} /></label>
                <label className="entity-label">Status
                  <select className="entity-input" value={appointmentForm.status} onChange={(e) => setAppointmentForm((v) => ({ ...v, status: e.target.value }))}>
                    <option>Booked</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </label>
                <label className="entity-label">Price<input className="entity-input" type="number" min="0" step="0.01" value={appointmentForm.price} onChange={(e) => setAppointmentForm((v) => ({ ...v, price: e.target.value }))} /></label>
              </div>
              <label className="entity-label">Notes<textarea className="entity-input entity-textarea" value={appointmentForm.notes} onChange={(e) => setAppointmentForm((v) => ({ ...v, notes: e.target.value }))} /></label>
              <button className="login-button" type="submit">Create Appointment</button>
            </form>
            {renderEntityTypeLibrary("appointments", "Appointments Library")}
            <div className="view-list" style={{ marginTop: 16 }}>
              {appointmentsData.slice(0, 12).map((a) => {
                const images = getEntityImages("appointments", a.id);
                const photoUrl = images.length > 0 ? images[0].storage_url : noImagePlaceholder();
                return (
                <div key={a.id} className="view-list-item">
                  <div className="row-thumb" style={{ backgroundImage: `url(${photoUrl})` }} onClick={() => openImagePreview(photoUrl, a.client_name || "Appointment photo")} />
                  <div className="view-list-left">
                    <div className="view-list-title">{a.client_name || `Client ${a.client_id}`}</div>
                    <div className="view-list-meta">{a.appointment_date} · {a.start_time} · {a.event_type}</div>
                  </div>
                  <button className="row-upload-btn" type="button" onClick={() => openSectionImagePicker({ entityType: "appointments", entityId: a.id, fieldName: "reference_photo", label: a.client_name || "appointment" })}>Upload</button>
                </div>
              );
              })}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "add-client" && (
        <div className="view-modal"><div className="view-content"><div className="view-header"><h2 className="view-title">Client Manager</h2><button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button></div>
          <form className="entity-form" onSubmit={submitClientForm}>
            <div className="entity-grid">
              <label className="entity-label">Full Name<input className="entity-input" required value={clientForm.full_name} onChange={(e) => setClientForm((v) => ({ ...v, full_name: e.target.value }))} /></label>
              <label className="entity-label">Email<input className="entity-input" type="email" value={clientForm.email} onChange={(e) => setClientForm((v) => ({ ...v, email: e.target.value }))} /></label>
              <label className="entity-label">Phone<input className="entity-input" value={clientForm.phone} onChange={(e) => setClientForm((v) => ({ ...v, phone: e.target.value }))} /></label>
              <label className="entity-label">Instagram<input className="entity-input" value={clientForm.instagram_handle} onChange={(e) => setClientForm((v) => ({ ...v, instagram_handle: e.target.value }))} /></label>
              <label className="entity-label">Skin Tone
                <select className="entity-input" value={clientForm.skin_tone} onChange={(e) => setClientForm((v) => ({ ...v, skin_tone: e.target.value }))}>
                  <option value="">-- Select Tone --</option>
                  {SKIN_TONES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="entity-label">Undertone
                <select className="entity-input" value={clientForm.undertone} onChange={(e) => setClientForm((v) => ({ ...v, undertone: e.target.value }))}>
                  <option value="">-- Select Undertone --</option>
                  {UNDERTONES.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </label>
            </div>
            <label className="entity-label">Notes<textarea className="entity-input entity-textarea" value={clientForm.notes} onChange={(e) => setClientForm((v) => ({ ...v, notes: e.target.value }))} /></label>
            <button className="login-button" type="submit">Create Client</button>
          </form>
          {renderEntityTypeLibrary("clients", "Clients Library")}
          <div className="view-list" style={{ marginTop: 16 }}>{clientsData.slice(0, 12).map((c) => {
            const images = getEntityImages("clients", c.id);
            const photoUrl = images.length > 0 ? images[0].storage_url : noImagePlaceholder();
            return (
              <div key={c.id} className="view-list-item">
                <div className="row-thumb" style={{ backgroundImage: `url(${photoUrl})` }} onClick={() => openImagePreview(photoUrl, c.full_name || "Client photo")} />
                <div className="view-list-left">
                  <div className="view-list-title">{c.full_name}</div>
                  <div className="view-list-meta">{c.email || "No email"} · {c.skin_tone || "Tone n/a"}</div>
                </div>
                <button className="row-upload-btn" type="button" onClick={() => openSectionImagePicker({ entityType: "clients", entityId: c.id, fieldName: "photo_url", label: c.full_name })}>Upload Picture</button>
              </div>
            );
          })}</div>
        </div></div>
      )}

      {currentView !== "login" && currentView === "production-center" && (
        <div className="view-modal"><div className="view-content"><div className="view-header"><h2 className="view-title">Production Center</h2><button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button></div>
          <form className="entity-form" onSubmit={submitProductionForm}>
            <div className="entity-grid">
              <label className="entity-label">Production Name<input className="entity-input" required value={productionForm.production_name} onChange={(e) => setProductionForm((v) => ({ ...v, production_name: e.target.value }))} /></label>
              <label className="entity-label">Type<select className="entity-input" value={productionForm.production_type} onChange={(e) => setProductionForm((v) => ({ ...v, production_type: e.target.value }))}>{PRODUCTION_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="entity-label">Director<input className="entity-input" value={productionForm.director_name} onChange={(e) => setProductionForm((v) => ({ ...v, director_name: e.target.value }))} /></label>
              <label className="entity-label">Producer<input className="entity-input" value={productionForm.producer_name} onChange={(e) => setProductionForm((v) => ({ ...v, producer_name: e.target.value }))} /></label>
              <label className="entity-label">Start Date<input className="entity-input" type="date" value={productionForm.start_date} onChange={(e) => setProductionForm((v) => ({ ...v, start_date: e.target.value }))} /></label>
              <label className="entity-label">End Date<input className="entity-input" type="date" value={productionForm.end_date} onChange={(e) => setProductionForm((v) => ({ ...v, end_date: e.target.value }))} /></label>
            </div>
            <label className="entity-label">Location<input className="entity-input" value={productionForm.location} onChange={(e) => setProductionForm((v) => ({ ...v, location: e.target.value }))} /></label>
            <button className="login-button" type="submit">Create Production</button>
          </form>
          {renderEntityTypeLibrary("productions", "Productions Library")}
          <div className="view-list" style={{ marginTop: 16 }}>{productionsData.slice(0, 12).map((p) => (<div key={p.id} className="view-list-item"><div className="row-thumb" style={{ backgroundImage: `url(${productionCoverUrl(p)})` }} onClick={(event) => { event.stopPropagation(); openImagePreview(productionCoverUrl(p), p.production_name || "Production image"); }} /><div className="view-list-left"><div className="view-list-title">{p.production_name}</div><div className="view-list-meta">{p.production_type} · {p.start_date || "No start date"}</div></div><button className="row-upload-btn" type="button" onClick={() => openSectionImagePicker({ entityType: "productions", entityId: p.id, fieldName: "cover_image", label: p.production_name })}>Upload</button><button className="row-upload-btn delete-action" type="button" onClick={() => deleteProduction(p.id, p.production_name || "this production")}>Delete</button></div>))}</div>
        </div></div>
      )}

      {currentView !== "login" && currentView === "upload-center" && (
        <div className="view-modal"><div className="view-content"><div className="view-header"><h2 className="view-title">Upload Center</h2><button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button></div>
          <div className="upload-actions"><button className="upload-btn" type="button" onClick={openPicker}>Select Files</button><button className="upload-btn" type="button" style={{ marginLeft: 8 }} onClick={handleUpload} disabled={!selectedFiles.length}>Upload Files ↑</button><button className="upload-btn" type="button" style={{ marginLeft: 8 }} onClick={() => setCurrentView("uploads-dashboard")}>Section Dashboard →</button></div>
          <div className="view-list" style={{ marginTop: 16 }}>{(selectedFiles.length ? selectedFiles : uploadRows).map((u, i) => (<div key={`${u.name}-${i}`} className="view-list-item"><div className="view-list-left"><div className="view-list-title">{u.name}</div><div className="view-list-meta">{u.meta}</div></div><span className="view-list-status">{u.status || "Ready"}</span></div>))}</div>
        </div></div>
      )}

      {currentView !== "login" && currentView === "uploads-dashboard" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Uploads By Section</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>

            {Object.keys(groupedUploads).length ? (
              Object.entries(groupedUploads).map(([section, rows]) => (
                <div key={section} style={{ marginBottom: 18 }}>
                  <div className="section-head" style={{ marginBottom: 10 }}>
                    <span className="section-tag">{section}</span>
                    <h3 className="view-title" style={{ fontSize: 16 }}>{rows.length} upload(s)</h3>
                  </div>
                  <div className="view-grid">
                    {rows.slice(0, 16).map((row, idx) => {
                      const previewUrl = resolveUploadPreviewImage(row);
                      return (
                        <div key={`${section}-${row.upload_id || idx}`} className="view-item" onClick={() => openImagePreview(previewUrl, row.original_filename || "Uploaded image") }>
                          <div
                            className="view-thumb"
                            style={{ backgroundImage: `url(${previewUrl})` }}
                          />
                          <div className="view-item-title">{row.original_filename || "Uploaded file"}</div>
                          <div className="view-item-meta">#{row.entity_id || "-"} · {row.field_name || "asset"}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Uploads Yet</div>
                <div className="empty-state-copy">Upload files from any section, then they will appear here grouped by section.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "history-tracker" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Work History Tracker</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <button className="login-button secondary" type="button" onClick={() => setHistoryEntries([])}>Clear History</button>
            </div>
            <div className="view-list">
              {historyEntries.length ? historyEntries.map((entry) => (
                <div key={entry.id} className="view-list-item">
                  <div className="view-list-left">
                    <div className="view-list-title">{historyLabel(entry)}</div>
                    <div className="view-list-meta">{JSON.stringify(entry.payload || {})}</div>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <div className="empty-state-title">No History Yet</div>
                  <div className="empty-state-copy">Field activity, uploads, logins, and new records will appear here automatically.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "add-product" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Product Center</h2>
              <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
            </div>

            <form className="entity-form" onSubmit={submitProductForm}>
              <div className="entity-grid">
                <label className="entity-label">Name
                  <input className="entity-input" required value={productForm.name} onChange={(e) => setProductForm((v) => ({ ...v, name: e.target.value }))} />
                </label>
                <label className="entity-label">Brand
                  <input className="entity-input" required value={productForm.brand} onChange={(e) => setProductForm((v) => ({ ...v, brand: e.target.value }))} />
                </label>
                <label className="entity-label">Category
                  <select className="entity-input" value={productForm.category} onChange={(e) => setProductForm((v) => ({ ...v, category: e.target.value }))}>
                    {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="entity-label">Shade
                  <input className="entity-input" value={productForm.shade} onChange={(e) => setProductForm((v) => ({ ...v, shade: e.target.value }))} />
                </label>
              </div>
              <button className="login-button" type="submit">Create Product</button>
            </form>

            <div className="view-list" style={{ marginTop: 16 }}>
              {productsData.slice(0, 12).map((p) => (
                <div key={p.id} className="view-list-item">
                  <div
                    className="row-thumb"
                    style={{
                      backgroundImage: `url(${(getEntityImages("products", p.id)[0]?.storage_url) || noImagePlaceholder()})`,
                    }}
                    onClick={() => {
                      const preview = (getEntityImages("products", p.id)[0]?.storage_url) || noImagePlaceholder();
                      openImagePreview(preview, p.name || "Product image");
                    }}
                  />
                  <div className="view-list-left">
                    <div className="view-list-title">{p.name}</div>
                    <div className="view-list-meta">{p.brand} · {p.category}</div>
                  </div>
                  <button
                    className="row-upload-btn"
                    type="button"
                    onClick={() => openSectionImagePicker({ entityType: "products", entityId: p.id, fieldName: "product_image", label: p.name || "product" })}
                  >
                    Upload
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="section-head" style={{ marginBottom: 12 }}>
                <span className="section-tag lime">API Connect</span>
                <h3 className="view-title" style={{ fontSize: 18 }}>Foundation API Choices</h3>
                <button className="section-action" type="button" onClick={() => setCurrentView("foundations")}>Open Page -&gt;</button>
              </div>
              <div className="view-grid">
                {foundationPageChoices.slice(0, 6).map((shade) => (
                  <div key={shade.id} className="view-item">
                    <div className="view-thumb swatch-2" style={{
                      background: shade.undertone === "Warm" ? "linear-gradient(135deg, #f6c177, #b66b32)" : shade.undertone === "Cool" ? "linear-gradient(135deg, #9dd9d2, #4d8f8b)" : shade.undertone === "Olive" ? "linear-gradient(135deg, #a5b67d, #58694a)" : "linear-gradient(135deg, #eed7c5, #8b5f4b)",
                    }} />
                    <div className="view-item-title">{shade.brand} · {shade.shade_name}</div>
                    <div className="view-item-meta">{shade.client_name || "Client"} · {shade.undertone || "Undertone n/a"}</div>
                    <button
                      className="panel-link"
                      style={{ marginTop: 8 }}
                      type="button"
                      onClick={() => applyApiProductToForm({
                        name: `${shade.brand} ${shade.shade_name}`,
                        brand: shade.brand,
                        category: "Foundation",
                        shade: shade.shade_name,
                      }, "Foundation")}
                    >
                      Use In Form -&gt;
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 className="view-title" style={{ fontSize: 18 }}>External Makeup API Feed</h3>
              <div className="view-grid" style={{ marginTop: 10 }}>
                {externalApiProducts.slice(0, 6).map((item, idx) => {
                  const imageUrl = item.image_link || item.api_featured_image || "";
                  const resolvedImageUrl = imageUrl ? (imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl) : noImagePlaceholder();
                  return (
                    <div key={`${item.id || idx}-${item.name || "api-product"}`} className="view-item">
                      <div className="view-thumb" style={{ backgroundImage: `url(${resolvedImageUrl})` }} onClick={(event) => { event.stopPropagation(); openImagePreview(resolvedImageUrl, item.name || "Product"); }} />
                      <div className="view-item-title">{item.name || "Unnamed product"}</div>
                      <div className="view-item-meta">{item.brand || "Unknown brand"} · {item.product_type || "product"}</div>
                      <button className="panel-link" type="button" style={{ marginTop: 8 }} onClick={() => applyApiProductToForm(item, item.product_type || "Foundation")}>Use In Form -&gt;</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 className="view-title" style={{ fontSize: 18 }}>External Foundation API Feed</h3>
              <div className="view-grid" style={{ marginTop: 10 }}>
                {externalFoundations.slice(0, 6).map((item, idx) => {
                  const imageUrl = item.image_link || item.api_featured_image || "";
                  const resolvedImageUrl = imageUrl ? (imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl) : noImagePlaceholder();
                  return (
                    <div key={`${item.id || idx}-${item.name || "foundation"}`} className="view-item">
                      <div className="view-thumb" style={{ backgroundImage: `url(${resolvedImageUrl})` }} onClick={(event) => { event.stopPropagation(); openImagePreview(resolvedImageUrl, item.name || "Foundation"); }} />
                      <div className="view-item-title">{item.name || "Unnamed foundation"}</div>
                      <div className="view-item-meta">{item.brand || "Unknown brand"} · {item.price_sign || "$"}{item.price || "n/a"}</div>
                      <button className="panel-link" type="button" style={{ marginTop: 8 }} onClick={() => applyApiProductToForm(item, "Foundation")}>Use In Form -&gt;</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 className="view-title" style={{ fontSize: 18 }}>External Lipstick API Feed</h3>
              <div className="view-grid" style={{ marginTop: 10 }}>
                {externalLipsticks.slice(0, 6).map((item, idx) => {
                  const imageUrl = item.image_link || item.api_featured_image || "";
                  const resolvedImageUrl = imageUrl ? (imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl) : noImagePlaceholder();
                  return (
                    <div key={`${item.id || idx}-${item.name || "lip"}`} className="view-item">
                      <div className="view-thumb" style={{ backgroundImage: `url(${resolvedImageUrl})` }} onClick={(event) => { event.stopPropagation(); openImagePreview(resolvedImageUrl, item.name || "Lipstick"); }} />
                      <div className="view-item-title">{item.name || "Unnamed lipstick"}</div>
                      <div className="view-item-meta">{item.brand || "Unknown brand"} · {item.price_sign || "$"}{item.price || "n/a"}</div>
                      <button className="panel-link" type="button" style={{ marginTop: 8 }} onClick={() => applyApiProductToForm(item, "Lipstick")}>Use In Form -&gt;</button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <h3 className="view-title" style={{ fontSize: 18 }}>External Eyeshadow API Feed</h3>
              <div className="view-grid" style={{ marginTop: 10 }}>
                {externalEyeshadows.slice(0, 6).map((item, idx) => {
                  const imageUrl = item.image_link || item.api_featured_image || "";
                  const resolvedImageUrl = imageUrl ? (imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl) : noImagePlaceholder();
                  return (
                    <div key={`${item.id || idx}-${item.name || "eye"}`} className="view-item">
                      <div className="view-thumb" style={{ backgroundImage: `url(${resolvedImageUrl})` }} onClick={(event) => { event.stopPropagation(); openImagePreview(resolvedImageUrl, item.name || "Eyeshadow"); }} />
                      <div className="view-item-title">{item.name || "Unnamed eyeshadow"}</div>
                      <div className="view-item-meta">{item.brand || "Unknown brand"} · {item.price_sign || "$"}{item.price || "n/a"}</div>
                      <button className="panel-link" type="button" style={{ marginTop: 8 }} onClick={() => applyApiProductToForm(item, "Eyeshadow")}>Use In Form -&gt;</button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "foundations" && (
        <div className="view-modal">
          <div className="view-content">
            <div className="view-header">
              <h2 className="view-title">Foundation Choices</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <a className="panel-link" href="/api/foundation-shades/" target="_blank" rel="noreferrer">Open FastAPI Endpoint -&gt;</a>
                <button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button>
              </div>
            </div>
            <div className="section-head" style={{ marginBottom: 14 }}>
              <span className="section-tag">Stored</span>
              <h3 className="view-title" style={{ fontSize: 18 }}>Saved Foundation Shades</h3>
            </div>
            {foundationPageChoices.length ? (
              <div className="view-grid">
                {foundationPageChoices.slice(0, 12).map((shade) => {
                  const swatchStyle = {
                    background: shade.undertone === "Warm"
                      ? "linear-gradient(135deg, #f6c177, #b66b32)"
                      : shade.undertone === "Cool"
                        ? "linear-gradient(135deg, #9dd9d2, #4d8f8b)"
                        : shade.undertone === "Olive"
                          ? "linear-gradient(135deg, #a5b67d, #58694a)"
                          : "linear-gradient(135deg, #eed7c5, #8b5f4b)",
                  };
                  return (
                    <div key={shade.id} className="view-item">
                      <div className="view-thumb" style={swatchStyle} onClick={(event) => event.stopPropagation()} />
                      <div className="view-item-title">{shade.brand} · {shade.shade_name}</div>
                      <div className="view-item-meta">{shade.client_name || "Client"} · {shade.shade_code || "No code"}</div>
                      <div style={{ marginTop: 8, fontSize: 8, color: "var(--text-faint)" }}>{shade.undertone || "Undertone n/a"}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-title">No Foundation Shades Yet</div>
                <div className="empty-state-copy">Add your first foundation shade from a client profile.</div>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <div className="section-head" style={{ marginBottom: 14 }}>
                <span className="section-tag lime">API</span>
                <h3 className="view-title" style={{ fontSize: 18 }}>External Choice Cards With Pictures</h3>
              </div>
              <div className="view-grid">
                {externalLipsticks.slice(0, 12).map((item, idx) => {
                  const imageUrl = item.image_link || item.api_featured_image || "";
                  const resolvedImageUrl = imageUrl ? (imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl) : noImagePlaceholder();
                  return (
                    <div key={`${item.id || idx}-${item.name || "lip"}`} className="view-item">
                      <div className="view-thumb" style={{ backgroundImage: `url(${resolvedImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} onClick={(event) => { event.stopPropagation(); openImagePreview(resolvedImageUrl, item.name || "Lipstick"); }} />
                      <div className="view-item-title">{item.name || "Unnamed lipstick"}</div>
                      <div className="view-item-meta">{item.brand || "Unknown brand"}</div>
                      <div style={{ marginTop: 8, fontSize: 8, color: "var(--text-faint)" }}>{item.price_sign || "$"}{item.price || "n/a"} · {item.product_type || "lipstick"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView !== "login" && currentView === "fx-makeup" && (
        <div className="view-modal"><div className="view-content"><div className="view-header"><h2 className="view-title">FX Makeup Lab</h2><button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button></div>
          <form className="entity-form" onSubmit={submitFxForm}><div className="entity-grid"><label className="entity-label">Character ID<input className="entity-input" type="number" min="1" required value={fxForm.character_id} onChange={(e) => setFxForm((v) => ({ ...v, character_id: e.target.value }))} /></label><label className="entity-label">Effect Type<select className="entity-input" value={fxForm.effect_type} onChange={(e) => setFxForm((v) => ({ ...v, effect_type: e.target.value }))}>{FX_EFFECT_TYPES.map((f) => <option key={f}>{f}</option>)}</select></label><label className="entity-label">Application Minutes<input className="entity-input" type="number" min="0" value={fxForm.application_time_minutes} onChange={(e) => setFxForm((v) => ({ ...v, application_time_minutes: e.target.value }))} /></label><label className="entity-label">Materials<input className="entity-input" value={fxForm.materials_used} onChange={(e) => setFxForm((v) => ({ ...v, materials_used: e.target.value }))} /></label></div><label className="entity-label">Removal Notes<textarea className="entity-input entity-textarea" value={fxForm.removal_notes} onChange={(e) => setFxForm((v) => ({ ...v, removal_notes: e.target.value }))} /></label><button className="login-button" type="submit">Create FX Task</button></form>
          <div className="entity-hint">Characters available: {charactersData.map((c) => `${c.id}:${c.character_name}`).join(" · ") || "none"}</div>
          {renderEntityTypeLibrary("effects_makeup", "FX Library")}
          <div className="view-list" style={{ marginTop: 16 }}>{effectsMakeupData.slice(0, 12).map((fx) => (<div key={fx.id} className="view-list-item"><div className="view-list-left"><div className="view-list-title">{fx.effect_type} · {fx.character_name}</div><div className="view-list-meta">{fx.materials_used || "No materials"}</div></div><button className="row-upload-btn" type="button" onClick={() => openSectionImagePicker({ entityType: "effects_makeup", entityId: fx.id, fieldName: "reference_photo", label: fx.character_name || "FX" })}>Upload</button></div>))}</div>
        </div></div>
      )}

      {currentView !== "login" && currentView === "call-sheets" && (
        <div className="view-modal"><div className="view-content"><div className="view-header"><h2 className="view-title">Call Sheet Desk</h2><button className="view-close" onClick={() => setCurrentView("dashboard")}>✕</button></div>
          <form className="entity-form" onSubmit={submitCallSheetForm}><div className="entity-grid"><label className="entity-label">Shoot Day ID<input className="entity-input" type="number" min="1" required value={callSheetForm.shoot_day_id} onChange={(e) => setCallSheetForm((v) => ({ ...v, shoot_day_id: e.target.value }))} /></label><label className="entity-label">Call Sheet URL<input className="entity-input" value={callSheetForm.call_sheet_file} onChange={(e) => setCallSheetForm((v) => ({ ...v, call_sheet_file: e.target.value }))} placeholder="https://..." /></label><label className="entity-label">Crew Call<input className="entity-input" type="time" value={callSheetForm.crew_call_time} onChange={(e) => setCallSheetForm((v) => ({ ...v, crew_call_time: e.target.value }))} /></label><label className="entity-label">Talent Call<input className="entity-input" type="time" value={callSheetForm.talent_call_time} onChange={(e) => setCallSheetForm((v) => ({ ...v, talent_call_time: e.target.value }))} /></label></div><label className="entity-label">Notes<textarea className="entity-input entity-textarea" value={callSheetForm.notes} onChange={(e) => setCallSheetForm((v) => ({ ...v, notes: e.target.value }))} /></label><button className="login-button" type="submit">Create Call Sheet</button></form>
          <div className="entity-hint">Shoot days available: {shootDaysData.map((s) => `${s.id}:${s.production_name} ${s.shoot_date}`).join(" · ") || "none"}</div>
          {renderEntityTypeLibrary("call_sheets", "Call Sheets Library")}
          <div className="view-list" style={{ marginTop: 16 }}>{callSheetsData.slice(0, 12).map((cs) => (<div key={cs.id} className="view-list-item"><div className="view-list-left"><div className="view-list-title">{cs.production_name} · Day {cs.shoot_day_id}</div><div className="view-list-meta">{cs.shoot_date} · Crew {cs.crew_call_time || "n/a"}</div></div><button className="row-upload-btn" type="button" onClick={() => openSectionImagePicker({ entityType: "call_sheets", entityId: cs.id, fieldName: "call_sheet_file", label: cs.production_name || "Call Sheet" })}>Upload</button></div>))}</div>
        </div></div>
      )}

      {currentView !== "login" && (
      <div className="layout">
        <main className="main">
          <header className="topbar">
            <h1 className="topbar-title">
              <span className="glitch" data-text="MUA">MUA</span> VAULT
            </h1>
            <button className="topbar-tab" type="button" onClick={handleClientsPage}>Clients</button>
            <button className="topbar-tab" type="button" onClick={() => setCurrentView("data-updates")}>Updates</button>
            <span className="topbar-date">Wed · 22 Apr 2026</span>
            <div className="search-wrap">
              <svg className="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input className="search-input" placeholder="Search vault..." />
            </div>
            <div className="topbar-btn">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div className="topbar-dot" />
            </div>
            {currentUser ? (
              <>
                <div className="topbar-operator">
                  <span>Operator</span>
                  <strong>{currentUser.name || currentUser.email || "User"}</strong>
                  <small>{historyEntries.length} actions</small>
                </div>
                <button className="topbar-login" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <>
                <button className="topbar-btn" type="button" aria-label="Open login" onClick={handleLoginView}>
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button className="topbar-login" onClick={handleLoginView}>Login</button>
              </>
            )}
          </header>

          <div className="page">
            <div className="morgue-hero f0" id="look-morgue-anchor">
              <div className="section-head">
                <span className="section-tag">✦ Look Morgue</span>
                <h2 className="section-title">THE VAULT</h2>
                <button className="section-action" onClick={handleBrowseAll}>Browse All -&gt;</button>
                  <button className="section-action" type="button" onClick={handleCreateLook}>New Look -&gt;</button>
              </div>

              <div className="morgue-filter-row">
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`filter-pill ${activeFilter === f ? "active" : ""}`}
                      type="button"
                      onClick={() => {
                      setActiveFilter(f);
                      if (f === "Runway") {
                          setFilmMenuOpen(false);
                        setBridalMenuOpen(false);
                        setEditorialMenuOpen(false);
                        setCurrentView("runway-looks");
                        return;
                      }
                      if (f === "FX") {
                          setFilmMenuOpen(false);
                        setBridalMenuOpen(false);
                        setEditorialMenuOpen(false);
                        setCurrentView("fx-looks");
                        return;
                      }
                        if (f === "Film") {
                        setBridalMenuOpen(false);
                        setEditorialMenuOpen(false);
                          setFilmMenuOpen((value) => !value);
                          return;
                        }
                      if (f === "Bridal") {
                        setFilmMenuOpen(false);
                        setEditorialMenuOpen(false);
                        setBridalMenuOpen((value) => !value);
                        return;
                      }
                      if (f === "Editorial") {
                        setFilmMenuOpen(false);
                        setBridalMenuOpen(false);
                        setEditorialMenuOpen((value) => !value);
                        return;
                      }
                        setFilmMenuOpen(false);
                      setBridalMenuOpen(false);
                      setEditorialMenuOpen(false);
                      if (currentView === "runway-looks" || currentView === "fx-looks") {
                        setCurrentView("dashboard");
                      }
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {filmMenuOpen && activeFilter === "Film" && (
                <div className="film-submenu">
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("production-center")}>Production</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("call-sheets")}>Call Sheet</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("fx-makeup")}>FX</button>
                </div>
              )}

              {bridalMenuOpen && activeFilter === "Bridal" && (
                <div className="film-submenu bridal-submenu">
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("new-appointment")}>New Appt</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("new-look")}>New Look</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("add-client")}>Add Clients</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("upload-center")}>Upload</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("add-product")}>Add Products</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("history-tracker")}>Client History</button>
                </div>
              )}

              {editorialMenuOpen && activeFilter === "Editorial" && (
                <div className="film-submenu bridal-submenu">
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("new-look")}>New Look</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("new-appointment")}>New Appt</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("add-client")}>Add Client</button>
                  <button type="button" className="film-submenu-btn" onClick={() => setCurrentView("add-product")}>Add Products</button>
                </div>
              )}

              <div className="morgue-grid">
                {looks.slice(0, 5).map((lk, i) => (
                  <div
                    key={i}
                    className={`morgue-card ${lk.featured ? "featured" : ""}`}
                  >
                    {(() => {
                      const lookPreviewUrl = resolveLookPreviewImage(lk) || noImagePlaceholder();
                      return (
                        <div
                          className="morgue-swatch"
                          onClick={(event) => {
                            event.stopPropagation();
                            openImagePreview(lookPreviewUrl, lk.name || "Look preview");
                          }}
                        >
                          <img className="morgue-image" src={lookPreviewUrl} alt={lk.name || "Look preview"} />
                          {!resolveLookPreviewImage(lk) && <div className="swatch-pattern" />}
                        </div>
                      );
                    })()}
                    <div className="morgue-save" onClick={(event) => { event.stopPropagation(); openLookImagePicker(lk.id); }} title="Upload look photo">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="morgue-overlay">
                      <div className="morgue-look-cat">{parseThemeList(lk.cat).join(" · ") || lk.cat}</div>
                      <div className="morgue-look-name">{lk.name}</div>
                      <div className="morgue-tags">
                        {lk.tags.slice(0, 3).map((t, j) => (
                          <span key={j} className={`morgue-tag ${j === 0 ? "tag-teal" : j === 1 ? "tag-pink" : "tag-lime"}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                      <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); handleOpenLookMorgueConnector(); }}>
                        Open Connector -&gt;
                      </button>
                      <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openLookImagePicker(lk.id); }}>
                        Upload Picture -&gt;
                      </button>
                      <button className="panel-link delete-action" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); deleteLook(lk.id, lk.name); }}>
                        Delete Look -&gt;
                      </button>
                      <button className="panel-link" style={{ marginTop: 8 }} onClick={(event) => { event.stopPropagation(); openDetail("Look", lk); }}>
                        Open Details -&gt;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hr-fancy f1">
              <div className="hr-line" />
              <div className="hr-cross" />
              <div className="hr-line" />
            </div>

            <div className="stats-row f1">
              {stats.map(({ l, v, s }, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-label">{l}</div>
                  <div className="stat-value">{v}</div>
                  <div className="stat-sub">{s}</div>
                </div>
              ))}
            </div>

            <div className="hr-fancy f2">
              <div className="hr-line" />
              <div className="hr-cross" />
              <div className="hr-line" />
            </div>

            <div style={{ marginBottom: 28 }} className="f2">
              <div className="section-head" style={{ marginBottom: 14 }}>
                <span className="section-tag lime">Actions</span>
                <h2 className="section-title" style={{ fontSize: 20 }}>QUICK ACCESS</h2>
              </div>
              <div className="actions-row">
                {[
                  { icon: "📅", lbl: "New Appt" },
                  { icon: "💄", lbl: "New Look" },
                  { icon: "👤", lbl: "Add Client" },
                  { icon: "🎬", lbl: "Production" },
                  { icon: "📸", lbl: "Upload" },
                  { icon: "🧴", lbl: "Add Product" },
                  { icon: "🩸", lbl: "FX Makeup" },
                  { icon: "📋", lbl: "Call Sheet" },
                  { icon: "🧪", lbl: "Foundation API" },
                  { icon: "🗂️", lbl: "Uploads Dashboard" },
                  { icon: "🕘", lbl: "History" },
                ].map(({ icon, lbl }) => (
                  <div key={lbl} className="action-circle-btn" onClick={() => handleQuickAction(lbl)}>
                    <div className="action-circle">{icon}</div>
                    <span className="action-lbl">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel upload-panel f2">
              <div className="panel-head">
                <span className="panel-label">Upload Center</span>
                <button className="panel-link" onClick={openPicker}>Choose Files -&gt;</button>
              </div>
              <div className="upload-body">
                <div className="upload-actions">
                  <button className="upload-btn" type="button" onClick={openPicker}>Select Portfolio Files</button>
                  <button className="upload-btn" style={{ marginLeft: 8 }} onClick={handleUpload} disabled={!selectedFiles.length}>
                    Upload Files ↑
                  </button>
                  <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleFileChange} />
                  <input ref={lookImageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLookImageFileChange} />
                  <input ref={sectionImageInputRef} type="file" style={{ display: "none" }} onChange={handleSectionImageFileChange} />
                  <span className="upload-helper">{apiStatus} on /api/uploads</span>
                </div>
                <div className="upload-list">
                  {(selectedFiles.length ? selectedFiles : uploadRows).map((row, index) => (
                    <div className="upload-item" key={`${row.name}-${index}`}>
                      <div>
                        <div className="upload-name">{row.name}</div>
                        <div className="upload-meta">{row.meta}</div>
                      </div>
                        <span className="status-live">{row.status || "Ready"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hr-fancy f2">
              <div className="hr-line" />
              <div className="hr-cross" />
              <div className="hr-line" />
            </div>
            <div className="section-head f3">
              <span className="section-tag pink">Live</span>
              <h2 className="section-title">PRODUCTIONS</h2>
              <button className="section-action" onClick={handleManageProds}>Manage -&gt;</button>
            </div>
            <div className="prod-grid f3">
              {prods.slice(0, 3).map((p) => (
                <div key={p.id || p.name} className="prod-card">
                  <div className={`prod-pulse ${p.live ? "pulse-live" : "pulse-off"}`} />
                  <div
                    className="prod-cover"
                    style={{ backgroundImage: `url(${productionCoverUrl(p)})` }}
                    onClick={(event) => {
                      event.stopPropagation();
                      openImagePreview(productionCoverUrl(p), p.name || "Production image");
                    }}
                  />
                  <div className="prod-type-tag">{p.type}</div>
                  <div className="prod-name">{p.name}</div>
                  <div className="prod-meta">{p.meta}</div>
                  <button
                    type="button"
                    className="row-upload-btn"
                    onClick={() => openSectionImagePicker({
                      entityType: "productions",
                      entityId: p.id,
                      fieldName: "cover_image",
                      label: p.name,
                      notes: `Production cover image for ${p.name}`,
                    })}
                  >
                    Upload Picture
                  </button>
                </div>
              ))}
            </div>
            {renderEntityTypeLibrary("productions", "Film Upload Library")}

            <div className="hr-fancy f3">
              <div className="hr-line" />
              <div className="hr-cross" />
              <div className="hr-line" />
            </div>
            <div className="two-col f4">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-label">Today's Schedule</span>
                  <button className="panel-link" onClick={handleFullCalendar}>Full Calendar -&gt;</button>
                </div>
                {appts.slice(0, 6).map((a, i) => (
                  <div key={a.id || i} className="appt-row">
                    <div className="appt-time-block">
                      <div className="appt-hour">{a.h}</div>
                      <div className="appt-period">{a.p}</div>
                    </div>
                    <div className="appt-vline" />
                    <div className="appt-body">
                      <div className="appt-name">{a.name}</div>
                      <div className="appt-type">{a.type}</div>
                    </div>
                    <div className={`status-pill ${a.s}`}>{a.status || a.s.replace("s-", "")}</div>
                    <button
                      type="button"
                      className="row-upload-btn"
                      onClick={() => openSectionImagePicker({
                        entityType: "appointments",
                        entityId: a.id,
                        fieldName: "reference_photo",
                        label: a.name,
                        notes: `Reference picture for ${a.name}`,
                      })}
                    >
                      Upload Picture
                    </button>
                  </div>
                ))}
              </div>

              <div className="panel">
                <div className="panel-head">
                  <span className="panel-label">Client Hub</span>
                  <button className="panel-link" onClick={handleClientsPage}>Open Roster -&gt;</button>
                </div>
                <div className="view-list" style={{ padding: 12 }}>
                  {clients.slice(0, 3).map((c, i) => (
                    <div key={c.id || i} className="client-row">
                      <div className="client-av">{c.i}</div>
                      <div>
                        <div className="client-name">{c.name}</div>
                        <div className="client-meta">{c.meta}</div>
                      </div>
                      <span className="client-tone-tag">{c.tone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 40 }} />
          </div>
        </main>
      </div>
        )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<MuaVault />);

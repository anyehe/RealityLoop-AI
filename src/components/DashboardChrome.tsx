import type { ReactNode } from 'react';

type Status = 'LOCAL SIMULATION' | 'MISSION COMPLETE' | 'SURVIVAL FAILED';

const nav = [
  ['dashboard', '▦', 'Dashboard'],
  ['simulation', '◫', 'Simulation'],
  ['analytics', '⌁', 'Analytics'],
  ['experiments', '▤', 'Experiments'],
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <a className="sidebar-brand" href="#dashboard" aria-label="RealityLoop AI home">
        <span className="sidebar-brand-mark">R</span>
        <span><strong>RealityLoop</strong><small>AI CONTROL LAB</small></span>
      </a>
      <nav className="sidebar-nav">
        <p className="nav-label">WORKSPACE</p>
        {nav.map(([id, icon, label], index) => (
          <a className={index === 0 ? 'active' : ''} href={`#${id}`} key={id}>
            <span className="nav-icon" aria-hidden="true">{icon}</span><span>{label}</span><span className="nav-chevron">›</span>
          </a>
        ))}
        <p className="nav-label nav-section-gap">SYSTEM</p>
        <a href="#learning"><span className="nav-icon">◉</span><span>Learning History</span><span className="nav-chevron">›</span></a>
        <a href="#about"><span className="nav-icon">⚙</span><span>Settings</span><span className="nav-chevron">›</span></a>
      </nav>
      <div className="sidebar-footer">
        <span className="live-dot" />
        <span><strong>Engine online</strong><small>Local deterministic runtime</small></span>
      </div>
    </aside>
  );
}

export function DashboardHeader({ status }: { status: Status }) {
  return (
    <header className="dashboard-header">
      <div>
        <p className="header-kicker">ADAPTIVE SURVIVAL LAB</p>
        <h1>President's Dashboard</h1>
      </div>
      <div className="header-actions">
        <label className="header-search"><span>⌕</span><input aria-label="Search dashboard" placeholder="Search dashboard" /></label>
        <button className="icon-button" aria-label="Notifications">●</button>
        <button className="icon-button" aria-label="Settings">⚙</button>
        <span className={`status-pill ${status === 'SURVIVAL FAILED' ? 'failed' : ''}`}><span className="status-dot" />{status}</span>
        <span className="avatar" aria-hidden="true">RL</span>
      </div>
    </header>
  );
}

export function PageHeading({ children }: { children?: ReactNode }) {
  return <div className="page-heading">{children}</div>;
}

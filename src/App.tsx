import { useEffect, useMemo, useState, type FormEvent } from "react";

type IconName = "grid" | "wallet" | "chart" | "activity" | "users" | "compass" | "settings" | "search" | "bell" | "arrow" | "download" | "clock" | "menu" | "close";
type AuthUser = { id: number; name: string; email: string; preferred_language: "kin" | "en" };

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const message = result && typeof result === "object" && "error" in result && typeof result.error === "string"
      ? result.error
      : "The request could not be completed.";
    throw new Error(message);
  }
  return result as T;
}

function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    wallet: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M16 15h2" /><path d="M6 5V4a2 2 0 0 1 2-2h10" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 6-7" /><path d="M16 6h4v4" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    compass: <><circle cx="12" cy="12" r="10" /><path d="m16.2 7.8-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1Z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1) scale(1.08)" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5M12 15V3" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navigation: { name: string; icon: IconName; href: string }[] = [
  { name: "Overview", icon: "grid", href: "#overview" },
  { name: "Financials", icon: "wallet", href: "#financials" },
  { name: "Sales & marketing", icon: "chart", href: "#sales" },
  { name: "Operations", icon: "activity", href: "#operations" },
  { name: "Team", icon: "users", href: "#team" },
  { name: "Strategic growth", icon: "compass", href: "#growth" },
];

const kpis = [
  { label: "Total revenue", value: "RWF 48.2M", change: "+12.8%", note: "vs. previous period", icon: "wallet" as const, tone: "green" },
  { label: "Sales pipeline", value: "RWF 126.4M", change: "+8.4%", note: "24 active opportunities", icon: "chart" as const, tone: "blue" },
  { label: "Operating margin", value: "24.6%", change: "+2.1 pts", note: "vs. previous period", icon: "activity" as const, tone: "violet" },
  { label: "Customer satisfaction", value: "92.4%", change: "+3.6%", note: "from 386 responses", icon: "users" as const, tone: "orange" },
];

const trendValues: Record<string, number[]> = {
  "7 days": [34, 41, 38, 53, 48, 65, 59, 71, 66, 78, 70, 88],
  "30 days": [32, 38, 35, 49, 45, 59, 54, 68, 61, 75, 69, 84],
  "90 days": [27, 35, 31, 42, 40, 54, 50, 61, 58, 68, 64, 78],
};

const activities = [
  { initials: "MK", title: "Marketing campaign launched", detail: "Brand awareness · Kigali", time: "12 min ago", color: "lavender" },
  { initials: "JN", title: "Quarterly forecast updated", detail: "Finance · Q4 outlook", time: "48 min ago", color: "mint" },
  { initials: "AK", title: "New opportunity added", detail: "Sales · Inyange Partners", time: "2 hours ago", color: "peach" },
];

const team = [
  { initials: "UW", name: "Umutoni W.", role: "Sales lead", progress: 84, color: "mint" },
  { initials: "DK", name: "Diane K.", role: "Marketing", progress: 72, color: "lavender" },
  { initials: "PN", name: "Patrick N.", role: "Operations", progress: 91, color: "peach" },
];

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [period, setPeriod] = useState("30 days");
  const [activeNav, setActiveNav] = useState("Overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    requestJson<{ user: AuthUser | null }>("/api/auth/me")
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(error instanceof Error ? error.message : "Could not check your sign-in status.");
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  const chartPoints = useMemo(() => {
    const values = trendValues[period];
    return values.map((value, index) => `${24 + index * 55},${176 - value * 1.48}`).join(" ");
  }, [period]);

  function exportReport() {
    const rows = [
      ["Metric", "Synthetic value", "Change"],
      ["Total revenue", "RWF 48.2M", "+12.8%"],
      ["Sales pipeline", "RWF 126.4M", "+8.4%"],
      ["Operating margin", "24.6%", "+2.1 pts"],
      ["Customer satisfaction", "92.4%", "+3.6%"],
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "control-room-synthetic-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function selectNavigation(name: string) {
    setActiveNav(name);
    setMobileNavOpen(false);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError("");
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    if (authMode === "register" && password !== String(formData.get("confirmPassword") || "")) {
      setAuthError("The passwords do not match.");
      setAuthBusy(false);
      return;
    }

    try {
      const body = {
        email: String(formData.get("email") || ""),
        password,
        ...(authMode === "register" ? { name: String(formData.get("name") || "") } : {}),
      };
      const result = await requestJson<{ user: AuthUser }>(`/api/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setUser(result.user);
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "The account request could not be completed.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      await requestJson<{ user: null }>("/api/auth/logout", { method: "POST" });
      setUser(null);
      setAuthMode("login");
      setAuthError("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  if (authLoading) {
    return <main className="auth-page"><div className="auth-loading" role="status">Checking your sign-in…</div></main>;
  }

  if (!user) {
    const isRegister = authMode === "register";
    return <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="brand auth-brand" href="#overview" aria-label="Kora business control room">
          <span className="brand-symbol">k<span>.</span></span>
          <span className="brand-name">kora<small>BUSINESS CONTROL ROOM</small></span>
        </a>
        <div className="auth-intro">
          <span className="auth-eyebrow">YOUR BUSINESS, IN ONE VIEW</span>
          <h1 id="auth-title">{isRegister ? "Create your account" : "Welcome back"}</h1>
          <p>{isRegister ? "Set up an account to access your control room." : "Sign in to continue to your business control room."}</p>
        </div>
        <form className="auth-form" onSubmit={submitAuth}>
          {isRegister && <label>Full name<input name="name" type="text" autoComplete="name" maxLength={80} required /></label>}
          <label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <label>Password<input name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={12} maxLength={128} required /><small>Use 12–128 characters.</small></label>
          {isRegister && <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>}
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={authBusy}>
            {authBusy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Kora?"}{" "}
          <button type="button" onClick={() => { setAuthMode(isRegister ? "login" : "register"); setAuthError(""); }}>
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </p>
        <p className="auth-data-note"><strong>Prototype notice</strong> The dashboard uses synthetic sample data only. Do not enter real financial, customer, staff, or other sensitive information.</p>
      </section>
    </main>;
  }

  return <div className="control-room">
    <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
      <a className="brand" href="#overview" onClick={() => selectNavigation("Overview")} aria-label="Kora control room home">
        <span className="brand-symbol">k<span>.</span></span>
        <span className="brand-name">kora<small>BUSINESS CONTROL ROOM</small></span>
      </a>
      <div className="workspace-switcher">
        <span className="workspace-avatar">K</span>
        <span className="workspace-copy"><strong>Kora Collective</strong><small>Business workspace</small></span>
        <span className="workspace-chevron" aria-hidden="true">⌄</span>
      </div>
      <div className="nav-heading">WORKSPACE</div>
      <nav className="side-nav" aria-label="Control room sections">
        {navigation.map((item) => <a key={item.name} href={item.href} className={activeNav === item.name ? "nav-link nav-link-active" : "nav-link"} onClick={() => selectNavigation(item.name)}>
          <Icon name={item.icon} size={17} /><span>{item.name}</span>
          {item.name === "Operations" && <span className="nav-count">3</span>}
        </a>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><span className="help-spark">✳</span><strong>Need a hand?</strong><p>Your workspace guide is here whenever you need it.</p><button type="button" onClick={() => setNoticeOpen(true)}>Open help center <span aria-hidden="true">→</span></button></div>
        <a className="nav-link settings-link" href="#settings" onClick={() => selectNavigation("Settings")}><Icon name="settings" size={17} /><span>Settings</span></a>
        <div className="profile"><span className="profile-avatar">{getInitials(user.name)}</span><span className="profile-copy"><strong>{user.name}</strong><small>{user.email}</small></span><button className="profile-menu" type="button" onClick={signOut}>Sign out</button></div>
      </div>
    </aside>

    {mobileNavOpen && <button className="sidebar-scrim" type="button" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
    <main className="main-panel" id="overview">
      <header className="topbar">
        <button className="mobile-menu" type="button" aria-label={mobileNavOpen ? "Close menu" : "Open menu"} onClick={() => setMobileNavOpen(!mobileNavOpen)}><Icon name={mobileNavOpen ? "close" : "menu"} /></button>
        <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div>
        <div className="topbar-actions">
          <label className="search-box"><Icon name="search" size={16} /><span className="sr-only">Search workspace</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search anything..." /><kbd>⌘ K</kbd></label>
          <div className="notice-wrap"><button className="icon-button notification-button" type="button" aria-label="Notifications" aria-expanded={noticeOpen} onClick={() => setNoticeOpen(!noticeOpen)}><Icon name="bell" size={18} /><i /></button>
            {noticeOpen && <div className="notification-popover"><strong>You're all caught up</strong><p>New updates will appear here.</p><button type="button" onClick={() => setNoticeOpen(false)}>Dismiss</button></div>}
          </div>
          <span className="topbar-divider" />
          <button className="topbar-user topbar-signout" type="button" aria-label="Sign out" onClick={signOut}>{getInitials(user.name)}</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="page-heading">
          <div><div className="date-line"><span className="live-dot" /> SATURDAY, OCTOBER 31, 2026 <span className="sample-pill">SAMPLE DATA</span></div>
            <h1>Good morning, {user.name.split(/\s+/)[0]} <span aria-hidden="true">✦</span></h1>
            <p>Here’s what’s happening across your business today.</p></div>
          <div className="heading-actions"><button type="button" className="button button-secondary period-button"><Icon name="clock" size={15} /><select aria-label="Dashboard time period" value={period} onChange={(event) => setPeriod(event.target.value)}><option>7 days</option><option>30 days</option><option>90 days</option></select><span className="select-chevron">⌄</span></button><button type="button" className="button button-primary" onClick={exportReport}><Icon name="download" size={15} /> Export report</button></div>
        </div>

        <section className="kpi-grid" aria-label="Business performance summary">
          {kpis.map((item) => <article className="kpi-card" key={item.label}>
            <div className="kpi-card-top"><span>{item.label}</span><span className={`kpi-icon ${item.tone}`}><Icon name={item.icon} size={17} /></span></div>
            <div className="kpi-value">{item.value}</div><div className="kpi-foot"><span className="positive-change">↗ {item.change}</span><span>{item.note}</span></div>
          </article>)}
        </section>

        <section className="primary-grid" aria-label="Financial and sales overview">
          <article className="panel revenue-panel" id="financials">
            <div className="panel-header"><div><div className="panel-kicker">FINANCIAL OVERVIEW</div><h2>Revenue performance</h2></div><button className="more-button" type="button" aria-label="More revenue options">•••</button></div>
            <div className="revenue-summary"><strong>RWF 48,240,000</strong><span className="positive-change">↗ 12.8%</span><small>vs. previous {period}</small></div>
            <div className="chart-legend"><span><i className="legend-current" /> This period</span><span><i className="legend-previous" /> Previous period</span></div>
            <div className="chart-container" role="img" aria-label={`Revenue trend over the last ${period}; values generally rise through the period.`}>
              <div className="chart-y-labels"><span>RWF 60M</span><span>RWF 40M</span><span>RWF 20M</span><span>RWF 0</span></div>
              <svg className="revenue-chart" viewBox="0 0 640 200" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2b8a69" stopOpacity=".17" /><stop offset="100%" stopColor="#2b8a69" stopOpacity="0" /></linearGradient></defs>
                <path className="chart-gridline" d="M24 42H622M24 86H622M24 130H622M24 176H622" />
                <path className="previous-line" d="M24 145 79 141 134 153 189 132 244 140 299 117 354 130 409 108 464 115 519 94 574 103 622 83" />
                <polygon points={`24,176 ${chartPoints} 629,176`} fill="url(#revenue-fill)" />
                <polyline className="current-line" points={chartPoints} />
                <circle className="chart-point" cx="629" cy={176 - trendValues[period].at(-1)! * 1.48} r="4" />
              </svg>
              <div className="chart-x-labels"><span>Oct 01</span><span>Oct 07</span><span>Oct 13</span><span>Oct 19</span><span>Oct 25</span><span>Oct 31</span></div>
            </div>
          </article>
          <article className="panel sales-panel" id="sales">
            <div className="panel-header"><div><div className="panel-kicker">SALES &amp; MARKETING</div><h2>Revenue by channel</h2></div><button className="more-button" type="button" aria-label="More channel options">•••</button></div>
            <div className="channel-total"><strong>RWF 48.2M</strong><span>total revenue</span></div>
            <div className="channel-chart" role="img" aria-label="Revenue channels: Direct sales 42 percent, Partnerships 28 percent, Digital 19 percent, and Other 11 percent.">
              <div className="donut-chart"><div className="donut-hole"><strong>42%</strong><span>Direct</span></div></div>
              <ul className="channel-legend">
                <li><i className="channel-dot direct" /><span>Direct sales</span><strong>42%</strong></li>
                <li><i className="channel-dot partner" /><span>Partnerships</span><strong>28%</strong></li>
                <li><i className="channel-dot digital" /><span>Digital</span><strong>19%</strong></li>
                <li><i className="channel-dot other" /><span>Other</span><strong>11%</strong></li>
              </ul>
            </div>
            <a className="panel-link" href="#sales" onClick={() => selectNavigation("Sales & marketing")}>View sales report <Icon name="arrow" size={14} /></a>
          </article>
        </section>

        <section className="lower-grid" aria-label="Operations, team, and growth">
          <article className="panel operations-panel" id="operations">
            <div className="panel-header"><div><div className="panel-kicker">BUSINESS OPERATIONS</div><h2>Operational pulse</h2></div><span className="status-tag"><i /> On track</span></div>
            <div className="operation-list">
              <div className="operation-row"><span className="operation-symbol ops-green">✓</span><span className="operation-copy"><strong>Service delivery</strong><small>On-time completion</small></span><strong className="operation-value">96.8%</strong></div>
              <div className="operation-row"><span className="operation-symbol ops-blue">↗</span><span className="operation-copy"><strong>Open opportunities</strong><small>Across active pipeline</small></span><strong className="operation-value">24</strong></div>
              <div className="operation-row"><span className="operation-symbol ops-gold">◷</span><span className="operation-copy"><strong>Pending decisions</strong><small>Items need your review</small></span><strong className="operation-value attention">3</strong></div>
            </div>
            <a className="panel-link" href="#operations" onClick={() => selectNavigation("Operations")}>View operations <Icon name="arrow" size={14} /></a>
          </article>
          <article className="panel team-panel" id="team">
            <div className="panel-header"><div><div className="panel-kicker">PEOPLE &amp; DELIVERY</div><h2>Team priorities</h2></div><button className="more-button" type="button" aria-label="More team options">•••</button></div>
            <div className="team-list">{team.map((member) => <div className="team-row" key={member.name}>
              <span className={`team-avatar ${member.color}`}>{member.initials}</span><span className="team-copy"><strong>{member.name}</strong><small>{member.role}</small></span><span className="team-progress"><span><i style={{ width: `${member.progress}%` }} /></span><small>{member.progress}%</small></span>
            </div>)}</div>
            <a className="panel-link" href="#team" onClick={() => selectNavigation("Team")}>View team overview <Icon name="arrow" size={14} /></a>
          </article>
          <article className="panel growth-panel" id="growth">
            <div className="panel-header"><div><div className="panel-kicker">STRATEGIC GROWTH</div><h2>Growth objective</h2></div><span className="growth-icon"><Icon name="compass" size={17} /></span></div>
            <div className="growth-title"><strong>Expand regional reach</strong><span>Q4 priority</span></div>
            <p className="growth-description">Build new partnerships and strengthen customer reach across priority markets.</p>
            <div className="growth-progress-label"><span>Quarterly progress</span><strong>68%</strong></div>
            <div className="growth-progress"><span /></div>
            <div className="growth-footer"><span>3 of 5 milestones complete</span><a href="#growth" onClick={() => selectNavigation("Strategic growth")}>Review <span aria-hidden="true">→</span></a></div>
          </article>
        </section>

        <section className="panel activity-panel" aria-label="Recent business activity">
          <div className="panel-header"><div><div className="panel-kicker">WORKSPACE UPDATES</div><h2>Recent activity</h2></div><button className="text-button" type="button" onClick={() => setNoticeOpen(true)}>See all activity <Icon name="arrow" size={14} /></button></div>
          <div className="activity-list">{activities.filter((item) => !search || `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase())).map((item) => <div className="activity-row" key={item.title}>
            <span className={`activity-avatar ${item.color}`}>{item.initials}</span><span className="activity-copy"><strong>{item.title}</strong><small>{item.detail}</small></span><span className="activity-time">{item.time}</span>
          </div>)}
            {search && !activities.some((item) => `${item.title} ${item.detail}`.toLowerCase().includes(search.toLowerCase())) && <p className="empty-search">No recent activity matches “{search}”.</p>}
          </div>
        </section>
        <footer className="dashboard-footer"><span>© 2026 Kora Collective</span><span><i /> All figures are illustrative sample data and are not connected to live systems.</span><a href="#settings">Privacy &amp; data</a></footer>
      </div>
    </main>
  </div>;
}

export default App;

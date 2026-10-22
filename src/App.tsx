import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Language = "kin" | "en";
type Category = { id: string; name_en: string; name_kin: string };
type Service = {
  id: string;
  category_id: string;
  category_en: string;
  category_kin: string;
  title_en: string;
  title_kin: string;
  requirements_en: string;
  requirements_kin: string;
  fee_rwf: number;
  processing_days: number;
  irembo_url: string;
  verification_status: "unverified" | "verified";
};
type AuthUser = { id: number; name: string; email: string; preferred_language: Language };
type ServiceActivity = { id: number; service_id: string; title_en: string; title_kin: string; created_at: string };

const labels = {
  kin: {
    language: "Ururimi",
    services: "Serivisi",
    howItWorks: "Uko bikora",
    help: "Ubufasha",
    signIn: "Injira",
    signOut: "Sohoka",
    createAccount: "Fungura konti",
    prototype: "Porototipi",
    eyebrow: "SERIVISI ZA LETA, ZISOBANUTSE",
    titleFirst: "Serivisi za leta.",
    titleSecond: "Ahantu hamwe.",
    intro: "Shakisha serivisi rusange, urebe amakuru y’icyitegererezo, hanyuma ukomeze kuri IremboGov kugira ngo urebe amabwiriza agezweho.",
    search: "Ni iyihe serivisi ushaka?",
    find: "Shakisha",
    independent: "Imboni yigenga; ntifitanye isano na IremboGov cyangwa Leta y’u Rwanda.",
    startHere: "TANGIRA HANO",
    unsure: "Nturaramenya aho uhera?",
    aside: "Hitamo serivisi urebe amakuru y’icyitegererezo. Gusaba bikorwa kuri IremboGov.",
    browse: "Reba serivisi",
    demoOnly: "Amakuru ni urugero; banza uyagenzure.",
    accurate: "Amakuru y’icyitegererezo",
    accurateSub: "Ntaremezwa n’inzego zibishinzwe",
    local: "Katalogi ibitswe muri mudasobwa",
    localSub: "Serivisi zigaragara utiriwe ubaza Irembo",
    safe: "Umutekano wawe",
    safeSub: "Ntushyire amakuru bwite muri Imboni",
    browseByNeed: "SHAKISHA UKO UBISHAKA",
    sectionTitle: "Ni iyihe serivisi ukeneye?",
    sectionDescription: "Aya ni amakuru make y’icyitegererezo, si urutonde rwuzuye rwa serivisi za IremboGov.",
    allServices: "Serivisi zose",
    resultCount: "serivisi",
    loading: "Serivisi zirimo gufunguka…",
    loadError: "Serivisi ntizifungutse",
    tryAgain: "Ongera ugerageze",
    noResults: "Nta serivisi ihuye n’ibyo ushaka",
    trySearch: "Gerageza irindi jambo cyangwa urebe serivisi zose.",
    noData: "Nta makuru ya serivisi aboneka.",
    category: "Icyiciro",
    requirements: "Ibisabwa (amakuru y’icyitegererezo)",
    estimate: "Amafaranga n’igihe (ntibyagenzuwe)",
    rwf: "RWF",
    day: "umunsi",
    days: "iminsi",
    unverified: "NTIBYAGENZUWE",
    warningTitle: "Icyitonderwa: amakuru ntaremezwa",
    warningText: "Ibisabwa, amafaranga n’igihe byatanzwe hano ntibyagenzuwe kandi bishobora kuba bitari byo cyangwa byarahindutse. Banza urebe amakuru agezweho kuri IremboGov cyangwa ku rwego rubifitiye ububasha. Imboni ntisaba cyangwa ngo ibike nomero z’indangamuntu, ibyangombwa, ubwishyu cyangwa dosiye za serivisi.",
    howTitle: "Komeza gusaba serivisi kuri IremboGov",
    howDescription: "Imboni igufasha gushakisha. Gusaba serivisi nyirizina bikorwa ku rubuga rwemewe rwa IremboGov.",
    stepOne: "Shakisha serivisi",
    stepOneText: "Koresha amagambo yo gushakisha cyangwa ibyiciro biri muri katalogi ibitswe hano.",
    stepTwo: "Genzura amakuru",
    stepTwoText: "Amakuru agaragara hano ni ingero; genzura ibisabwa n’amafaranga kuri IremboGov.",
    stepThree: "Komeza kuri IremboGov",
    stepThreeText: "Fungura urubuga rwa IremboGov kugira ngo ubone serivisi kandi utangize ubusabe.",
    needHelp: "UKENEYE UBUNDI BUFASHA?",
    helpTitle: "Koresha urubuga rwemewe ku busabe nyakuri.",
    helpText: "Imboni ntitanga serivisi za Leta, ntishyikiriza Leta ubusabe, kandi ntikurikirana dosiye.",
    back: "Subira kuri serivisi",
    footer: "Imboni — porototipi yigenga y’amakuru kuri serivisi rusange mu Rwanda.",
    notAffiliated: "Ntabwo ifitanye isano na IremboGov cyangwa urwego urwo ari rwo rwose rwa Leta.",
    account: "Konti ya Imboni",
    welcome: "Murakaza neza",
    name: "Amazina",
    email: "Imeli",
    password: "Ijambo ry’ibanga",
    confirmPassword: "Emeza ijambo ry’ibanga",
    passwordHelp: "Koresha inyuguti nibura 12.",
    accountSafety: "Koresha amakuru y’igerageza gusa. Ntukoreshe konti nyayo kandi ntushyiremo nomero y’indangamuntu cyangwa andi makuru y’ibanga.",
    create: "Fungura konti",
    wait: "Tegereza gato…",
    alreadyAccount: "Usanzwe ufite konti?",
    newAccount: "Nta konti ufite?",
    passwordMismatch: "Amagambo y’ibanga ntahura.",
    accountReady: "Konti ya porototipi yiteguye.",
    signedOut: "Wasohotse muri konti.",
    accountFailed: "Igikorwa cya konti nticyakunze.",
    openIrembo: "Komeza kuri IremboGov",
    externalNote: "IremboGov izafunguka mu rubuga rushya. Imboni ntimenya niba ubusabe bwatanzwe.",
    catalogueTitle: "Katalogi y’icyitegererezo",
    welcomeUser: "Muraho",
    history: "Amateka",
    historyTitle: "Amateka yo gufungura IremboGov",
    historyEmpty: "Nta murongo wafunguye urabikwa.",
    historyNote: "Ibi byerekana ko wafunguye umurongo gusa; Imboni ntimenya niba warangije cyangwa watanze ubusabe kuri IremboGov.",
    linkOpened: "Umurongo wafunguwe",
  },
  en: {
    language: "Language",
    services: "Services",
    howItWorks: "How it works",
    help: "Help",
    signIn: "Sign in",
    signOut: "Sign out",
    createAccount: "Create account",
    prototype: "Prototype",
    eyebrow: "PUBLIC SERVICES, MADE CLEAR",
    titleFirst: "Everyday services.",
    titleSecond: "One helpful place.",
    intro: "Browse example public-service listings, then continue to IremboGov to check current official details.",
    search: "What service are you looking for?",
    find: "Find services",
    independent: "Independent Imboni prototype; not affiliated with IremboGov or the Government of Rwanda.",
    startHere: "START HERE",
    unsure: "Not sure where to begin?",
    aside: "Choose a service to view example information. Applications take place on IremboGov.",
    browse: "Browse services",
    demoOnly: "Example information; verify before use.",
    accurate: "Example information",
    accurateSub: "Not verified by responsible authorities",
    local: "Locally stored catalogue",
    localSub: "Browse without querying Irembo",
    safe: "Your privacy",
    safeSub: "Do not enter personal details in Imboni",
    browseByNeed: "BROWSE BY NEED",
    sectionTitle: "Which service do you need?",
    sectionDescription: "These are a few example records, not a complete IremboGov service catalogue.",
    allServices: "All services",
    resultCount: "services",
    loading: "Loading services…",
    loadError: "Services could not be loaded",
    tryAgain: "Try again",
    noResults: "No matching services found",
    trySearch: "Try another search or browse all services.",
    noData: "No service information is available.",
    category: "Category",
    requirements: "Requirements (example information)",
    estimate: "Fee and processing time (unverified)",
    rwf: "RWF",
    day: "day",
    days: "days",
    unverified: "UNVERIFIED",
    warningTitle: "Please note: information is unverified",
    warningText: "Requirements, fees, and processing times shown here were supplied as examples and have not been verified; they may be inaccurate or outdated. Check current information on IremboGov or with the responsible authority. Imboni does not collect or store national ID numbers, documents, payments, or service applications.",
    howTitle: "Continue service applications on IremboGov",
    howDescription: "Imboni helps you browse. Actual service applications take place on the official IremboGov website.",
    stepOne: "Find a service",
    stepOneText: "Search or browse categories in this locally stored catalogue.",
    stepTwo: "Verify the details",
    stepTwoText: "The information here is illustrative; confirm requirements and fees on IremboGov.",
    stepThree: "Continue to IremboGov",
    stepThreeText: "Open IremboGov to locate the service and start an application.",
    needHelp: "NEED MORE HELP?",
    helpTitle: "Use official channels for real requests.",
    helpText: "Imboni does not provide government services, submit applications, or track cases.",
    back: "Back to services",
    footer: "Imboni — independent public-service information prototype for Rwanda.",
    notAffiliated: "Not affiliated with IremboGov or any government agency.",
    account: "Imboni demo account",
    welcome: "Welcome back",
    name: "Full name",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    passwordHelp: "Use at least 12 characters.",
    accountSafety: "Use synthetic test details only. Do not use a real account or enter a national ID number or other sensitive information.",
    create: "Create account",
    wait: "Please wait…",
    alreadyAccount: "Already have an account?",
    newAccount: "New to the demo?",
    passwordMismatch: "The passwords do not match.",
    accountReady: "Your demo account is ready.",
    signedOut: "You have signed out.",
    accountFailed: "The account request could not be completed.",
    openIrembo: "Continue to IremboGov",
    externalNote: "IremboGov opens in a new tab. Imboni cannot tell whether you submitted an application.",
    catalogueTitle: "Example catalogue",
    welcomeUser: "Hello",
    history: "History",
    historyTitle: "IremboGov link history",
    historyEmpty: "No opened service links have been recorded.",
    historyNote: "This records only that you opened a link. Imboni cannot tell whether you completed or submitted an application on IremboGov.",
    linkOpened: "Link opened",
  },
} as const;

const iremboCatalogueUrl = "https://irembo.gov.rw/home/citizen/all_services";

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

function App() {
  const [language, setLanguage] = useState<Language>("kin");
  const text = labels[language];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");
  const [selected, setSelected] = useState<Service | null>(null);
  const [toast, setToast] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register" | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activity, setActivity] = useState<ServiceActivity[]>([]);
  const [activityError, setActivityError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const authCloseRef = useRef<HTMLButtonElement>(null);
  const historyCloseRef = useRef<HTMLButtonElement>(null);
  const filteredServices = useMemo(() => services.filter((service) => {
    const matchesCategory = !category || service.category_id === category;
    const searchText = [
      service.title_en, service.title_kin, service.category_en, service.category_kin,
      service.requirements_en, service.requirements_kin,
    ].join(" ").toLowerCase();
    return matchesCategory && searchText.includes(query.trim().toLowerCase());
  }), [category, query, services]);

  useEffect(() => {
    let active = true;
    requestJson<{ user: AuthUser | null }>("/api/auth/me")
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        if (currentUser) setLanguage(currentUser.preferred_language);
      })
      .catch((error: unknown) => { if (active) setToast(error instanceof Error ? error.message : text.accountFailed); });
    requestJson<Service[]>("/api/catalogue")
      .then((items) => {
        if (!active) return;
        setServices(items);
        setCategories(Array.from(new Map(items.map((item) => [item.category_id, {
          id: item.category_id,
          name_en: item.category_en,
          name_kin: item.category_kin,
        }])).values()));
      })
      .catch((error: unknown) => { if (active) setServiceError(error instanceof Error ? error.message : text.loadError); })
      .finally(() => { if (active) setServiceLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "kin" ? "rw" : "en";
  }, [language]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!selected && !authMode && !historyOpen) return;
    if (selected) closeRef.current?.focus();
    if (authMode) authCloseRef.current?.focus();
    if (historyOpen) historyCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelected(null);
        setAuthMode(null);
        setHistoryOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected, authMode, historyOpen]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authMode || authBusy) return;
    setAuthError("");
    setAuthBusy(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    if (authMode === "register" && password !== String(formData.get("confirmPassword") || "")) {
      setAuthError(text.passwordMismatch);
      setAuthBusy(false);
      return;
    }
    const body = {
      email: String(formData.get("email") || ""),
      password,
      ...(authMode === "register" ? { name: String(formData.get("name") || "") } : {}),
    };
    try {
      const result = await requestJson<{ user: AuthUser }>(`/api/auth/${authMode}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setUser(result.user);
      setLanguage(result.user.preferred_language);
      setAuthMode(null);
      setToast(authMode === "register" ? text.accountReady : `${text.welcome}, ${result.user.name}.`);
      form.reset();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : text.accountFailed);
    } finally {
      setAuthBusy(false);
    }
  }

  async function signOut() {
    try {
      await requestJson<{ user: null }>("/api/auth/logout", { method: "POST" });
      setUser(null);
      setActivity([]);
      setHistoryOpen(false);
      setLanguage("kin");
      setToast(text.signedOut);
    } catch (error) {
      setToast(error instanceof Error ? error.message : text.accountFailed);
    }
  }

  function openAuth(mode: "login" | "register") {
    setSelected(null);
    setAuthError("");
    setAuthMode(mode);
  }

  function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    if (!user) return;
    requestJson<{ preferredLanguage: Language }>("/api/auth/preferences", {
      method: "PUT",
      body: JSON.stringify({ preferredLanguage: nextLanguage }),
    }).catch((error: unknown) => {
      setToast(error instanceof Error ? error.message : text.accountFailed);
    });
  }

  async function openHistory() {
    setActivityError("");
    setHistoryOpen(true);
    try {
      const records = await requestJson<ServiceActivity[]>("/api/service-activity");
      setActivity(records);
    } catch (error) {
      setActivityError(error instanceof Error ? error.message : text.accountFailed);
    }
  }

  function recordIremboLink(serviceId: string) {
    if (!user) return;
    requestJson<{ recorded: boolean }>("/api/service-activity", {
      method: "POST",
      body: JSON.stringify({ serviceId }),
    }).catch((error: unknown) => {
      setToast(error instanceof Error ? error.message : text.accountFailed);
    });
  }

  function titleFor(service: Service) {
    return language === "kin" ? service.title_kin : service.title_en;
  }

  function categoryFor(service: Service) {
    return language === "kin" ? service.category_kin : service.category_en;
  }

  function requirementsFor(service: Service) {
    return language === "kin" ? service.requirements_kin : service.requirements_en;
  }

  function serviceIcon(service: Service) {
    if (service.category_id === "TRANSPORT") return "↗";
    if (service.category_id === "LAND") return "⌂";
    if (service.category_id === "JUSTICE") return "§";
    return "▣";
  }

  return <div className="portal-shell">
    <header className="site-header">
      <a className="portal-brand" href="#home" aria-label="Imboni - urupapuro rw'ibanze">
        <span className="portal-brand-mark" aria-hidden="true">I</span>
        <span className="portal-brand-copy"><strong>Imboni</strong><small>Amakuru kuri serivisi zo mu Rwanda</small></span>
      </a>
      <nav className="portal-nav" aria-label={language === "kin" ? "Ibikubiye ku rubuga" : "Main navigation"}>
        <a href="#services">{text.services}</a><a href="#how-it-works">{text.howItWorks}</a><a href="#help">{text.help}</a>
      </nav>
      <div className="header-actions">
        <label className="language-select"><span className="sr-only">{text.language}</span>
          <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} aria-label={text.language}>
            <option value="kin">Kinyarwanda</option><option value="en">English</option>
          </select>
        </label>
        {user
          ? <><span className="account-greeting">{text.welcomeUser}, {user.name}</span><button className="account-button" type="button" onClick={openHistory}>{text.history}</button><button className="account-button" type="button" onClick={signOut}>{text.signOut}</button></>
          : <><button className="account-button" type="button" onClick={() => openAuth("login")}>{text.signIn}</button><button className="account-button account-primary" type="button" onClick={() => openAuth("register")}>{text.createAccount}</button></>}
        <span className="demo-label"><i aria-hidden="true" /> {text.prototype}</span>
      </div>
    </header>

    <main id="home">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow"><span /> {text.eyebrow}</div>
          <h1>{text.titleFirst}<br /><em>{text.titleSecond}</em></h1>
          <p>{text.intro}</p>
          <form className="hero-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}>
            <label className="sr-only" htmlFor="service-search">{text.search}</label><span aria-hidden="true">⌕</span>
            <input id="service-search" type="search" placeholder={text.search} value={query} onChange={(event) => { setQuery(event.target.value); setCategory(""); }} />
            <button type="submit">{text.find} <span aria-hidden="true">→</span></button>
          </form>
          <div className="hero-footnote"><span aria-hidden="true">ⓘ</span> {text.independent}</div>
        </div>
        <aside className="hero-side-card" aria-label={text.startHere}>
          <div className="side-card-top"><span className="side-card-icon" aria-hidden="true">✳</span><span>{text.startHere}</span></div>
          <h2>{text.unsure}</h2><p>{text.aside}</p><a href="#services">{text.browse} <span aria-hidden="true">↗</span></a>
          <div className="side-card-rule" /><div className="side-card-note"><span aria-hidden="true">ⓘ</span> {text.demoOnly}</div>
        </aside>
        <div className="hero-decoration" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="trust-strip" aria-label={text.accurate}>
        <div><span aria-hidden="true">◎</span><span><strong>{text.accurate}</strong><small>{text.accurateSub}</small></span></div>
        <div><span aria-hidden="true">⌂</span><span><strong>{text.local}</strong><small>{text.localSub}</small></span></div>
        <div><span aria-hidden="true">♧</span><span><strong>{text.safe}</strong><small>{text.safeSub}</small></span></div>
      </section>

      <section className="services-section" id="services">
        <div className="section-heading">
          <div><div className="section-kicker">{text.browseByNeed}</div><h2>{text.sectionTitle}</h2><p>{text.sectionDescription}</p></div>
          <span className="service-total" aria-live="polite">{filteredServices.length} {text.resultCount}</span>
        </div>
        <div className="catalog-warning" role="note"><strong>{text.warningTitle}</strong><p>{text.warningText}</p></div>
        <div className="category-list" aria-label={text.category}>
          <button className={`category-chip ${category === "" ? "selected" : ""}`} type="button" aria-pressed={category === ""} onClick={() => setCategory("")}>{text.allServices}</button>
          {categories.map((item) => <button key={item.id} className={`category-chip ${category === item.id ? "selected" : ""}`} type="button" aria-pressed={category === item.id} onClick={() => setCategory(item.id)}>{language === "kin" ? item.name_kin : item.name_en}</button>)}
        </div>
        {serviceLoading ? <div className="no-services" role="status"><strong>{text.loading}</strong></div>
          : serviceError ? <div className="no-services" role="alert"><strong>{text.loadError}</strong><p>{serviceError}</p><button type="button" onClick={() => window.location.reload()}>{text.tryAgain}</button></div>
            : filteredServices.length ? <div className="service-grid">{filteredServices.map((service) => <article className="service-card catalogue-card" key={service.id}>
              <div className="service-card-top"><span className={`service-icon icon-${service.category_id.toLowerCase()}`} aria-hidden="true">{serviceIcon(service)}</span><span className="service-category">{categoryFor(service)}</span></div>
              <span className="verification-badge">{text.unverified}</span>
              <h3>{titleFor(service)}</h3>
              <p className="catalogue-summary">{language === "kin" ? "Ibisabwa, amafaranga n’igihe ntibyagenzuwe." : "Requirements, fee, and timing have not been verified."}</p>
              <button className="service-link" type="button" onClick={() => setSelected(service)} aria-label={`${text.openIrembo}: ${titleFor(service)}`}>{text.openIrembo} <span aria-hidden="true">→</span></button>
            </article>)}</div>
              : <div className="no-services" role="status"><span aria-hidden="true">⌕</span><strong>{services.length ? text.noResults : text.noData}</strong><p>{text.trySearch}</p><button type="button" onClick={() => { setQuery(""); setCategory(""); }}>{text.allServices}</button></div>}
        <p className="synthetic-caption">{text.sectionDescription} <a href={iremboCatalogueUrl} target="_blank" rel="noreferrer">{text.openIrembo}</a></p>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="steps-intro"><div className="section-kicker">{text.howItWorks}</div><h2>{text.howTitle}</h2><p>{text.howDescription}</p></div>
        <ol className="steps-list">
          <li><span>01</span><div><strong>{text.stepOne}</strong><p>{text.stepOneText}</p></div></li>
          <li><span>02</span><div><strong>{text.stepTwo}</strong><p>{text.stepTwoText}</p></div></li>
          <li><span>03</span><div><strong>{text.stepThree}</strong><p>{text.stepThreeText}</p></div></li>
        </ol>
      </section>

      <section className="help-section" id="help">
        <div><div className="section-kicker">{text.needHelp}</div><h2>{text.helpTitle}</h2><p>{text.helpText}</p></div>
        <a href={iremboCatalogueUrl} target="_blank" rel="noreferrer">{text.openIrembo} <span aria-hidden="true">↗</span></a>
      </section>
    </main>

    <footer className="site-footer"><a className="footer-brand" href="#home"><span className="portal-brand-mark" aria-hidden="true">I</span><strong>Imboni</strong></a><p>{text.footer}</p><span className="footer-disclaimer">{text.notAffiliated}</span></footer>

    {selected && <div className="service-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
      <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
        <div className="modal-header"><div><div className="section-kicker">{categoryFor(selected)}</div><h2 id="service-modal-title">{titleFor(selected)}</h2></div>
          <button ref={closeRef} className="modal-close" type="button" aria-label={language === "kin" ? "Funga" : "Close"} onClick={() => setSelected(null)}>×</button>
        </div>
        <div className="modal-content">
          <span className="verification-badge">{text.unverified}</span>
          <div className="guide-notice"><span aria-hidden="true">ⓘ</span><p>{text.warningText}</p></div>
          <h3>{text.requirements}</h3><p className="catalogue-requirements">{requirementsFor(selected)}</p>
          <h3>{text.estimate}</h3><p className="catalogue-estimate">{selected.fee_rwf.toLocaleString(language === "kin" ? "rw-RW" : "en-RW")} {text.rwf} · {selected.processing_days} {selected.processing_days === 1 ? text.day : text.days}</p>
          <a className="provider-button" href={selected.irembo_url} target="_blank" rel="noreferrer" onClick={() => recordIremboLink(selected.id)}>{text.openIrembo} <span aria-hidden="true">↗</span></a>
          <p className="modal-footnote">{text.externalNote}</p>
        </div>
      </section>
    </div>}

    {historyOpen && <div className="service-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setHistoryOpen(false); }}>
      <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="history-title">
        <div className="modal-header"><div><div className="section-kicker">{text.history}</div><h2 id="history-title">{text.historyTitle}</h2></div>
          <button ref={historyCloseRef} className="modal-close" type="button" aria-label={language === "kin" ? "Funga" : "Close"} onClick={() => setHistoryOpen(false)}>×</button>
        </div>
        <div className="modal-content">
          <div className="guide-notice"><span aria-hidden="true">ⓘ</span><p>{text.historyNote}</p></div>
          {activityError ? <p className="auth-error" role="alert">{activityError}</p>
            : activity.length ? <ol className="activity-list">{activity.map((record) => <li key={record.id}>
              <strong>{language === "kin" ? record.title_kin : record.title_en}</strong>
              <span>{text.linkOpened} · {new Date(`${record.created_at.replace(" ", "T")}Z`).toLocaleString(language === "kin" ? "rw-RW" : "en-RW")}</span>
            </li>)}</ol>
              : <p className="catalogue-requirements">{text.historyEmpty}</p>}
        </div>
      </section>
    </div>}

    {authMode && <div className="service-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthMode(null); }}>
      <section className="service-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="modal-header"><div><div className="section-kicker">{text.account}</div><h2 id="auth-title">{authMode === "register" ? text.createAccount : text.welcome}</h2></div>
          <button ref={authCloseRef} className="modal-close" type="button" aria-label={language === "kin" ? "Funga" : "Close"} onClick={() => setAuthMode(null)}>×</button>
        </div>
        <form className="auth-form" onSubmit={submitAuth} noValidate>
          {authMode === "register" && <label>{text.name}<input name="name" type="text" autoComplete="name" maxLength={80} required /></label>}
          <label>{text.email}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <label>{text.password}<input name="password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={12} maxLength={128} required />
            <small>{authMode === "register" ? text.passwordHelp : ""}</small></label>
          {authMode === "register" && <label>{text.confirmPassword}<input name="confirmPassword" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label>}
          <p className="auth-safety-note">{text.accountSafety}</p>
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="provider-button" type="submit" disabled={authBusy}>{authBusy ? text.wait : authMode === "register" ? text.create : text.signIn}</button>
          <p className="auth-switch">{authMode === "register" ? text.alreadyAccount : text.newAccount} <button type="button" onClick={() => { setAuthError(""); setAuthMode(authMode === "register" ? "login" : "register"); }}>{authMode === "register" ? text.signIn : text.createAccount}</button></p>
        </form>
      </section>
    </div>}
    <div className={`portal-toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}

export default App;

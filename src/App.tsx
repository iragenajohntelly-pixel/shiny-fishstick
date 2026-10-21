import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type Category = "All services" | "Identity & family" | "Business" | "Land & housing" | "Transport" | "Permits";
type Service = { id: string; name: string; category: Exclude<Category, "All services">; description: string; icon: string; steps: string[] };

const categories: Category[] = ["All services", "Identity & family", "Business", "Land & housing", "Transport", "Permits"];
const services: Service[] = [
  { id: "birth", name: "Birth certificate", category: "Identity & family", description: "Learn how to request a birth certificate or replacement.", icon: "✳", steps: ["Check the official service provider's requirements.", "Prepare supporting documents requested by that provider.", "Submit through an authorized channel."] },
  { id: "marriage", name: "Marriage certificate", category: "Identity & family", description: "Find guidance for civil marriage registration documents.", icon: "♡", steps: ["Confirm eligibility and required documents with the registrar.", "Arrange an appointment if required.", "Follow the registrar's instructions to complete the process."] },
  { id: "national-id", name: "National ID services", category: "Identity & family", description: "Get oriented on identity registration and update services.", icon: "▣", steps: ["Choose the relevant service with the official provider.", "Check document and appointment requirements.", "Contact the provider directly for application status."] },
  { id: "business", name: "Register a business", category: "Business", description: "A starting point for business registration information.", icon: "▤", steps: ["Review current official business registration guidance.", "Prepare the requested business information.", "Submit through an authorized government service channel."] },
  { id: "tax", name: "Tax clearance information", category: "Business", description: "Find where to check requirements for tax clearance.", icon: "◫", steps: ["Check the tax authority's current guidance.", "Use its official channel to request a clearance.", "Contact the authority if your request needs follow-up."] },
  { id: "land", name: "Land title services", category: "Land & housing", description: "Explore guidance for land records and title services.", icon: "⌂", steps: ["Identify the land service that matches your need.", "Confirm document requirements with the official land office.", "Submit and follow up through its authorized channel."] },
  { id: "driving", name: "Driving licence", category: "Transport", description: "See where to confirm licence application requirements.", icon: "↗", steps: ["Check the transport authority's current application guidance.", "Confirm any test, appointment, and document requirements.", "Use an authorized channel for your application."] },
  { id: "permit", name: "Construction permit", category: "Permits", description: "Get oriented on where to start a permit application.", icon: "⌑", steps: ["Contact the relevant local authority to identify the permit type.", "Check current plans, documents, and fees with the authority.", "Submit through its approved process."] },
];
const demoReference = "DEMO-2026-1042";

function App() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All services");
  const [selected, setSelected] = useState<Service | null>(null);
  const [reference, setReference] = useState("");
  const [trackingMessage, setTrackingMessage] = useState("");
  const [toast, setToast] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const filteredServices = useMemo(() => services.filter((service) => {
    const matchesCategory = category === "All services" || service.category === category;
    const matchesQuery = `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesCategory && matchesQuery;
  }), [category, query]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!selected) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  function trackDemoRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTrackingMessage(reference.trim().toUpperCase() === demoReference
      ? "Demo status: received for review. This is an invented example, not a real request."
      : "This demo only recognizes the sample reference shown below. No real request can be tracked here.");
  }

  return <div className="portal-shell">
    <header className="site-header">
      <a className="portal-brand" href="#home" aria-label="Imboni home"><span className="portal-brand-mark" aria-hidden="true">I</span><span className="portal-brand-copy"><strong>Imboni</strong><small>Public service guide</small></span></a>
      <nav className="portal-nav" aria-label="Main navigation"><a href="#services">Services</a><a href="#how-it-works">How it works</a><a href="#help">Help</a></nav>
      <span className="demo-label"><i aria-hidden="true" /> Prototype</span>
    </header>

    <main id="home">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow"><span /> PUBLIC SERVICES, MADE CLEAR</div>
          <h1>Everyday services.<br /><em>One helpful place.</em></h1>
          <p>Find simple guidance for common public services in Rwanda. Know where to start, what to prepare, and who to contact.</p>
          <form className="hero-search" role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("services")?.scrollIntoView({ behavior: "smooth" }); }}>
            <label className="sr-only" htmlFor="service-search">Search public services</label><span aria-hidden="true">⌕</span>
            <input id="service-search" type="search" placeholder="What service are you looking for?" value={query} onChange={(event) => { setQuery(event.target.value); setCategory("All services"); }} />
            <button type="submit">Find a service <span aria-hidden="true">→</span></button>
          </form>
          <div className="hero-footnote"><span aria-hidden="true">ⓘ</span> Independent demo — not an official government service</div>
        </div>
        <aside className="hero-side-card" aria-label="Prototype information"><div className="side-card-top"><span className="side-card-icon" aria-hidden="true">✳</span><span>START HERE</span></div><h2>Not sure where to begin?</h2><p>Choose a service to see a short guide and links to the right type of official provider.</p><a href="#services">Browse popular services <span aria-hidden="true">↗</span></a><div className="side-card-rule" /><div className="side-card-note"><span aria-hidden="true">✓</span> No personal details needed in this demo</div></aside>
        <div className="hero-decoration" aria-hidden="true"><span /><span /><span /></div>
      </section>

      <section className="trust-strip" aria-label="Prototype service commitments"><div><span aria-hidden="true">◎</span><span><strong>Clear guidance</strong><small>Understand common next steps</small></span></div><div><span aria-hidden="true">⌂</span><span><strong>Find the right channel</strong><small>Confirm details with the provider</small></span></div><div><span aria-hidden="true">♧</span><span><strong>Your privacy matters</strong><small>No citizen data is collected here</small></span></div></section>

      <section className="services-section" id="services">
        <div className="section-heading"><div><div className="section-kicker">BROWSE BY NEED</div><h2>What can we help you with?</h2><p>Explore common services and practical starting points.</p></div><span className="service-total" aria-live="polite">{filteredServices.length} guides</span></div>
        <div className="category-list" aria-label="Filter services by category">{categories.map((item) => <button key={item} className={`category-chip ${category === item ? "selected" : ""}`} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
        {filteredServices.length ? <div className="service-grid">{filteredServices.map((service) => <article className="service-card" key={service.id}><div className="service-card-top"><span className={`service-icon icon-${service.id}`} aria-hidden="true">{service.icon}</span><span className="service-category">{service.category}</span></div><h3>{service.name}</h3><p>{service.description}</p><button className="service-link" type="button" onClick={() => setSelected(service)} aria-label={`View guide for ${service.name}`}>View service guide <span aria-hidden="true">→</span></button></article>)}</div> : <div className="no-services" role="status"><span aria-hidden="true">⌕</span><strong>No matching guides found</strong><p>Try a different search, or browse all service categories.</p><button type="button" onClick={() => { setQuery(""); setCategory("All services"); }}>Show all services</button></div>}
        <p className="synthetic-caption">Service names and guidance are illustrative. Always verify current requirements with an authorized provider.</p>
      </section>

      <section className="steps-section" id="how-it-works"><div className="steps-intro"><div className="section-kicker">A SIMPLE STARTING POINT</div><h2>Get ready for your next step.</h2><p>This guide helps you get oriented. Official providers remain the source for applications, fees, and decisions.</p></div><ol className="steps-list"><li><span>01</span><div><strong>Find your service</strong><p>Search or browse topics to find a relevant guide.</p></div></li><li><span>02</span><div><strong>Check what you need</strong><p>Use the guide as a prompt, then confirm details officially.</p></div></li><li><span>03</span><div><strong>Continue with the provider</strong><p>Apply and follow up only through authorized channels.</p></div></li></ol></section>

      <section className="track-section" aria-labelledby="track-title"><div className="track-copy"><span className="track-icon" aria-hidden="true">⌁</span><div className="section-kicker">DEMO FEATURE</div><h2 id="track-title">Track a request</h2><p>Try the sample reference to preview an example status. This tracker is not connected to any real service.</p></div><form className="track-form" onSubmit={trackDemoRequest}><label htmlFor="tracking-reference">Sample reference</label><div className="track-input-row"><input id="tracking-reference" type="text" autoComplete="off" placeholder="Enter demo reference" value={reference} onChange={(event) => { setReference(event.target.value); setTrackingMessage(""); }} /><button type="submit">Check status <span aria-hidden="true">→</span></button></div><small>Try: <button type="button" onClick={() => { setReference(demoReference); setTrackingMessage(""); }}>{demoReference}</button></small>{trackingMessage && <p className="tracking-message" role="status">{trackingMessage}</p>}</form></section>

      <section className="help-section" id="help"><div><div className="section-kicker">NEED MORE HELP?</div><h2>Use official channels for real requests.</h2><p>For current fees, eligibility, applications, or request status, contact the relevant government service provider or visit its official website.</p></div><a href="#services">Back to service guides <span aria-hidden="true">↑</span></a></section>
    </main>

    <footer className="site-footer"><a className="footer-brand" href="#home"><span className="portal-brand-mark" aria-hidden="true">I</span><strong>Imboni</strong></a><p>Independent public-service information prototype · Rwanda</p><span className="footer-disclaimer">Not affiliated with Irembo or any government agency</span></footer>

    {selected && <div className="service-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title"><div className="modal-header"><div><div className="section-kicker">{selected.category}</div><h2 id="service-modal-title">{selected.name}</h2></div><button ref={closeRef} className="modal-close" type="button" aria-label="Close service guide" onClick={() => setSelected(null)}>×</button></div><div className="modal-content"><p className="modal-description">{selected.description}</p><div className="guide-notice"><span aria-hidden="true">ⓘ</span><p>This is general demo guidance, not official instructions. Requirements and fees can change; confirm them with the authorized provider.</p></div><h3>A helpful place to start</h3><ol className="guide-steps">{selected.steps.map((step) => <li key={step}>{step}</li>)}</ol><button className="provider-button" type="button" onClick={() => { setSelected(null); setToast("No application is submitted by this prototype. Please use an authorized service provider."); }}>Use the official provider separately</button><p className="modal-footnote">This demo cannot accept applications, payments, identity numbers, or documents.</p></div></section></div>}
    <div className={`portal-toast ${toast ? "visible" : ""}`} role="status" aria-live="polite">{toast}</div>
  </div>;
}

export default App;


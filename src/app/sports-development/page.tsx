'use client';

import React, { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';

type Programme = { id: string; title: string; sport: string; description: string; location: string; schedule: string; startDate: string; endDate: string; eligibility: string; featured: boolean };
type Result = { id: string; eventTitle: string; competitionDate: string; athleteName: string; sport: string; position: string; medal: string; result: string };
type GalleryItem = { id: string; title: string; description: string; mediaUrl: string; mediaType: string; category: string };
type EventItem = { id: string; title: string; date: string; location: string; status: string };

const inputClass = 'form-control py-2';
const emptyAthlete = { fullName: '', email: '', phone: '', district: '', sport: '', ageRange: '', message: '' };
const emptySponsor = { organization: '', contactName: '', email: '', phone: '', supportType: '', message: '' };
const emptyRegistration = { eventId: '', fullName: '', email: '', phone: '', organization: '', accessibilityNeeds: '' };

export default function SportsDevelopmentPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState(emptyAthlete);
  const [sponsor, setSponsor] = useState(emptySponsor);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [submitting, setSubmitting] = useState('');
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch('/api/training-programs').then(r => r.ok ? r.json() : []),
      fetch('/api/competition-results').then(r => r.ok ? r.json() : []),
      fetch('/api/gallery').then(r => r.ok ? r.json() : []),
      fetch('/api/events').then(r => r.ok ? r.json() : []),
    ]).then(([p, r, g, e]) => {
      if (!active) return;
      setProgrammes(Array.isArray(p) ? p : []);
      setResults(Array.isArray(r) ? r : []);
      setGallery(Array.isArray(g) ? g : []);
      setEvents(Array.isArray(e) ? e.filter((item: EventItem) => ['Upcoming', 'Ongoing'].includes(item.status)) : []);
    }).catch(() => {
      if (active) setNotice({ kind: 'error', text: 'Some information could not be loaded. Please refresh the page.' });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function submitForm<T extends Record<string, string>>(endpoint: string, kind: string, values: T, reset: () => void) {
    setSubmitting(kind);
    setNotice(null);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Submission failed. Please try again.');
      reset();
      setNotice({ kind: 'success', text: payload.message || 'Your request has been received.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof Error ? error.message : 'Submission failed. Please try again.' });
    } finally {
      setSubmitting('');
    }
  }

  const field = (label: string, value: string, onChange: (v: string) => void, type = 'text', required = true) => (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}{required ? ' *' : ''}</label>
      <input className={inputClass} type={type} required={required} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );

  return (
    <main id="main-content">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb"><ol className="breadcrumb mb-2"><li className="breadcrumb-item"><Link href="/">Home</Link></li><li className="breadcrumb-item active">Sports Development</li></ol></nav>
          <h1 className="page-title mb-2">Sports Development & Opportunities</h1>
          <p className="page-subtitle">Discover training opportunities, follow Rwanda’s competition results, register for events and connect with NPC Rwanda.</p>
        </div>
      </header>

      <section className="py-5 bg-light">
        <div className="container">
          {notice && <div className={`alert ${notice.kind === 'success' ? 'alert-success' : 'alert-danger'}`} role="status">{notice.text}</div>}
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-4">
            <div><span className="text-primary fw-bold small text-uppercase">Developing talent</span><h2 className="h3 fw-bold mb-1">Training programmes</h2><p className="text-muted mb-0">Programmes published by NPC Rwanda.</p></div>
            <Link href="/athletes" className="btn btn-outline-primary">Meet our athletes</Link>
          </div>
          {loading ? <div className="text-center py-4" role="status">Loading programmes…</div> : programmes.length === 0 ? <div className="bg-white border rounded-3 p-4 text-muted">There are no training programmes published at the moment. Please check again later or send an athlete enquiry below.</div> : (
            <div className="row g-3 mb-5">{programmes.map(p => <div className="col-md-6 col-lg-4" key={p.id}><article className="card h-100 border-0 shadow-sm"><div className="card-body"><span className="badge bg-primary mb-2">{p.sport}</span>{p.featured && <span className="badge bg-warning text-dark ms-2">Featured</span>}<h3 className="h5 fw-bold">{p.title}</h3><p className="text-muted small">{p.description}</p><p className="small mb-1"><i className="fas fa-location-dot me-2 text-primary" />{p.location}</p>{p.schedule && <p className="small mb-1"><i className="fas fa-clock me-2 text-primary" />{p.schedule}</p>}{(p.startDate || p.endDate) && <p className="small mb-0"><i className="fas fa-calendar me-2 text-primary" />{p.startDate}{p.endDate ? ` – ${p.endDate}` : ''}</p>}{p.eligibility && <p className="small text-muted mt-3 mb-0"><strong>Eligibility:</strong> {p.eligibility}</p>}</div></article></div>)}</div>
          )}

          <div className="row g-4 mb-5">
            <div className="col-lg-7">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                <span className="text-primary fw-bold small text-uppercase">Get involved</span><h2 className="h4 fw-bold">Interested in becoming an athlete?</h2><p className="text-muted small">Tell us about yourself and the sport you are interested in. This is an enquiry, not confirmation of athlete selection.</p>
                <form onSubmit={(e: FormEvent) => { e.preventDefault(); void submitForm('/api/athlete-enquiries', 'athlete', athlete, () => setAthlete(emptyAthlete)); }}>
                  <div className="row">{field('Full name', athlete.fullName, v => setAthlete(s => ({ ...s, fullName: v })))}<div className="col-md-6">{field('Email', athlete.email, v => setAthlete(s => ({ ...s, email: v })), 'email')}</div><div className="col-md-6">{field('Phone', athlete.phone, v => setAthlete(s => ({ ...s, phone: v })), 'tel')}</div><div className="col-md-6">{field('District', athlete.district, v => setAthlete(s => ({ ...s, district: v })))}</div><div className="col-md-6">{field('Sport of interest', athlete.sport, v => setAthlete(s => ({ ...s, sport: v })))}</div><div className="col-md-6">{field('Age range', athlete.ageRange, v => setAthlete(s => ({ ...s, ageRange: v })), 'text', false)}</div></div>
                  <label className="form-label fw-semibold">Tell us more *</label><textarea className={inputClass} rows={3} minLength={10} required value={athlete.message} onChange={e => setAthlete(s => ({ ...s, message: e.target.value }))} />
                  <button className="btn btn-primary mt-3" disabled={submitting === 'athlete'}>{submitting === 'athlete' ? 'Submitting…' : 'Send athlete enquiry'}</button>
                </form>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="bg-white rounded-4 shadow-sm p-4 h-100">
                <span className="text-primary fw-bold small text-uppercase">Partnerships</span><h2 className="h4 fw-bold">Support para-sports in Rwanda</h2><p className="text-muted small">Organisations interested in sponsorship, equipment, technical support or athlete development can contact our team.</p>
                <form onSubmit={(e: FormEvent) => { e.preventDefault(); void submitForm('/api/sponsor-enquiries', 'sponsor', sponsor, () => setSponsor(emptySponsor)); }}>
                  {field('Organisation', sponsor.organization, v => setSponsor(s => ({ ...s, organization: v })))}{field('Contact person', sponsor.contactName, v => setSponsor(s => ({ ...s, contactName: v })))}{field('Email', sponsor.email, v => setSponsor(s => ({ ...s, email: v })), 'email')}{field('Phone', sponsor.phone, v => setSponsor(s => ({ ...s, phone: v })), 'tel', false)}
                  <label className="form-label fw-semibold">How would you like to support? *</label><select className={inputClass} required value={sponsor.supportType} onChange={e => setSponsor(s => ({ ...s, supportType: e.target.value }))}><option value="">Select support type</option><option>Sponsorship</option><option>Sports equipment</option><option>Training and coaching</option><option>Medical and rehabilitation support</option><option>Technical partnership</option><option>Other</option></select>
                  <label className="form-label fw-semibold mt-3">Message *</label><textarea className={inputClass} rows={3} minLength={10} required value={sponsor.message} onChange={e => setSponsor(s => ({ ...s, message: e.target.value }))} />
                  <button className="btn btn-outline-primary mt-3" disabled={submitting === 'sponsor'}>{submitting === 'sponsor' ? 'Submitting…' : 'Send partnership enquiry'}</button>
                </form>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-4 shadow-sm p-4 mb-5">
            <span className="text-primary fw-bold small text-uppercase">Join an event</span><h2 className="h4 fw-bold">Event registration enquiry</h2><p className="text-muted small">Submit your details for an upcoming event. The event team will confirm your registration.</p>
            {events.length === 0 ? <p className="text-muted mb-0">There are no events currently accepting registration. Visit the <Link href="/events">events page</Link> for updates.</p> : <form onSubmit={(e: FormEvent) => { e.preventDefault(); void submitForm('/api/event-registrations', 'registration', registration, () => setRegistration(emptyRegistration)); }}>
              <div className="row"><div className="col-md-6 mb-3"><label className="form-label fw-semibold">Event *</label><select className={inputClass} required value={registration.eventId} onChange={e => setRegistration(s => ({ ...s, eventId: e.target.value }))}><option value="">Choose an event</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.title} — {ev.date} ({ev.location})</option>)}</select></div><div className="col-md-6">{field('Full name', registration.fullName, v => setRegistration(s => ({ ...s, fullName: v })))}</div><div className="col-md-6">{field('Email', registration.email, v => setRegistration(s => ({ ...s, email: v }), 'email')}</div><div className="col-md-6">{field('Phone', registration.phone, v => setRegistration(s => ({ ...s, phone: v }), 'tel')}</div><div className="col-md-6">{field('Organisation / club', registration.organization, v => setRegistration(s => ({ ...s, organization: v })), 'text', false)}</div><div className="col-12 mb-3"><label className="form-label fw-semibold">Accessibility requirements (optional)</label><textarea className={inputClass} rows={2} value={registration.accessibilityNeeds} onChange={e => setRegistration(s => ({ ...s, accessibilityNeeds: e.target.value }))} placeholder="Please tell us about any access or support requirements." /></div></div>
              <button className="btn btn-primary" disabled={submitting === 'registration'}>{submitting === 'registration' ? 'Submitting…' : 'Submit registration enquiry'}</button>
            </form>}
          </div>

          <div className="mb-5"><div className="mb-3"><span className="text-primary fw-bold small text-uppercase">Performance</span><h2 className="h3 fw-bold mb-1">Competition results</h2><p className="text-muted mb-0">Published achievements and results from NPC Rwanda competitions.</p></div>
            {results.length === 0 ? <div className="bg-white border rounded-3 p-4 text-muted">Competition results will appear here when they are published.</div> : <div className="table-responsive bg-white rounded-3 shadow-sm"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Competition</th><th>Athlete</th><th>Sport</th><th>Result</th><th>Date</th></tr></thead><tbody>{results.map(r => <tr key={r.id}><td className="fw-semibold">{r.eventTitle}</td><td>{r.athleteName}</td><td>{r.sport}</td><td>{r.medal || r.position || r.result || '—'}</td><td>{r.competitionDate}</td></tr>)}</tbody></table></div>}
          </div>

          <div><div className="mb-3"><span className="text-primary fw-bold small text-uppercase">In action</span><h2 className="h3 fw-bold mb-1">Photo & video gallery</h2><p className="text-muted mb-0">Highlights from training, events and para-sports activities.</p></div>
            {gallery.length === 0 ? <div className="bg-white border rounded-3 p-4 text-muted">New photos and videos will be published here as they become available.</div> : <div className="row g-3">{gallery.map(item => <div className="col-6 col-md-4 col-lg-3" key={item.id}><article className="card h-100 border-0 shadow-sm overflow-hidden">{item.mediaType === 'video' ? <video src={item.mediaUrl} controls preload="metadata" className="w-100" style={{ aspectRatio: '4/3', objectFit: 'cover' }} /> : <img src={item.mediaUrl} alt={item.title} className="w-100" loading="lazy" style={{ aspectRatio: '4/3', objectFit: 'cover' }} />}<div className="card-body"><span className="small text-primary">{item.category}</span><h3 className="h6 fw-bold mt-1 mb-1">{item.title}</h3>{item.description && <p className="small text-muted mb-0">{item.description}</p>}</div></article></div>)}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

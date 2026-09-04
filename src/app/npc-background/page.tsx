'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

export default function NpcBackgroundPage() {
  const [activePillar, setActivePillar] = useState(1);
  const { siteContent } = useData();

  const parseLines = (val: string | undefined, defaultValue: string[]) => {
    if (!val || val.trim().length === 0) return defaultValue;
    return val.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  };

  const governingText = siteContent['background.governingText'] || "The supreme decision-making body of NPC Rwanda. The Governing Board consists of the Executive Board (Chairperson, Vice-Chairpersons, Secretary General, Treasurer) alongside specialized Advisors representing physical, visual, deaf, and intellectual impairment categories, ensuring comprehensive representation.";
  const tocText = siteContent['background.tocText'] || "Our Theory of Change process map directs the annual retreat and board guidelines. We hypothesize that by providing targeted athletic training and raising community awareness, we systematically dismantle social prejudices against persons with disabilities, enabling long-term social rehabilitation, confidence, and international athletic representation.";

  const strengths = parseLines(siteContent['background.strengths'], [
    'Active governing board and efficient, knowledgeable staff.',
    'Strong close collaboration with the Ministry of Sports (MINISPORTS) and the National Council of Persons with Disabilities (NCPD).',
    'Established governance guidelines, internal policies, and rules of procedure.',
    'Compliance with Rwanda Governance Board (RGB) and International Paralympic Committee (IPC) certification standards.',
    'Functional sports administration extending from national to regional levels.',
    'Active membership in the Union of Disability Organizations.'
  ]);

  const weaknesses = parseLines(siteContent['background.weaknesses'], [
    'Lack of dedicated office and training facilities owned by NPC Rwanda.',
    'Underprivileged training conditions for youth, coaches, and medical technicians.',
    'Lack of formal retention mechanisms for certified coaches, classifiers, and referees.',
    'Limited financial and administrative human resources.',
    'Decentralization of adapted sports is not yet fully executed down to the sector level.'
  ]);

  const opportunities = parseLines(siteContent['background.opportunities'], [
    'Strong political will and government support for para-sports programs.',
    'High enthusiasm and sporting capacity among persons with disabilities in Rwanda.',
    'Willingness of diverse corporate and NGO partners to collaborate on inclusion.',
    'Positive shift in community attitudes towards disabled sports participation.',
    'Role models who inspire young athletes and enhance the branding of NPC Rwanda.'
  ]);

  const threats = parseLines(siteContent['background.threats'], [
    'Geographical constraints in reaching isolated rural athletes.',
    'Lack of availability of specialized adaptive sports equipment in the local market.',
    'Limited number of accessible sports stadiums and facilities.',
    'Government restructuring policies that may impact sports funding.'
  ]);

  const pillar1Obj = parseLines(siteContent['background.pillar1'], [
    'Develop a tech and media-driven system to promote sports for persons with disabilities, positioning Rwanda as a leading African sports hub.',
    'Expand the variety of sports for persons with disabilities to ensure inclusive participation across different impairment groups.',
    'Promote honesty, integrity, and fair behavior among players, coaches, and leaders to uphold true sports values.',
    'Foster a sustainable culture of sports for young people with disabilities in families, schools, and specialized institutions.',
    'Boost active participation of people with disabilities in all government sports initiatives (e.g., Car Free Day, Kigali Night Run).'
  ]);

  const pillar2Obj = parseLines(siteContent['background.pillar2'], [
    'Enhance athlete performance through well-organized district and national championships in partnership with key stakeholders.',
    'Boost the number and performance of athletes in international competitions, focusing on the 2028 Paralympic Games.',
    'Develop elite training pathways for Sitting Volleyball, Para Athletics, Goalball, Wheelchair Basketball, Para-Powerlifting, and Boccia.'
  ]);

  const pillar3Obj = parseLines(siteContent['background.pillar3'], [
    'Strengthen the capacity of NPC Board members, internal audit committee, conflict resolution committee, commissions, staff, and volunteers.',
    'Enhance NPC staff skills in international resource mobilization, proposal development, and project management.',
    'Strengthen sports leadership and administrative capacity in all 30 district Paralympic committees.',
    'Advocate and build accessible sports infrastructure (offices, stadiums, hostels) capable of hosting international competitions.'
  ]);

  const pillar4Obj = parseLines(siteContent['background.pillar4'], [
    'Conduct research and archive key achievements in disability sports to share at international seminars and conferences.',
    'Develop a sustainable strategy to attract national and international investors to support disability sports activities.',
    'Utilize sports diplomacy as a platform for enhancing Rwanda’s international image and athletic exchange.'
  ]);

  const pillars = [
    {
      id: 1,
      title: 'Pillar 1: Promotion & Participation',
      icon: 'fa-users',
      objectives: pillar1Obj
    },
    {
      id: 2,
      title: 'Pillar 2: Performance & Competitions',
      icon: 'fa-medal',
      objectives: pillar2Obj
    },
    {
      id: 3,
      title: 'Pillar 3: Capacity & Professional Development',
      icon: 'fa-user-graduate',
      objectives: pillar3Obj
    },
    {
      id: 4,
      title: 'Pillar 4: Strategic Partnerships & Diplomacy',
      icon: 'fa-handshake',
      objectives: pillar4Obj
    }
  ];

  const swotData = {
    strengths,
    weaknesses,
    opportunities,
    threats
  };

  return (
    <main id="main-content" style={{ background: '#FAFBFD' }}>
      {/* Page Header */}
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                NPC Background
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">NPC Background &amp; Objectives</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Explore the historical background, strategic plan pillars, swot analysis, and structures guiding the Paralympic Movement in Rwanda.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-5">
        
        {/* Background Intro */}
        <section className="card border-0 shadow-sm p-4 p-md-5 mb-5 rounded-4 bg-white" data-aos="fade-up">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <span className="text-primary fw-bold text-uppercase small d-block mb-2">Our Foundation</span>
              <h2 className="fw-bold text-dark mb-3">Welcome to NPC Rwanda</h2>
              <p className="text-muted leading-relaxed mb-3">
                Established on <strong>November 1, 2001</strong> (originally founded as <em>FERHANDIS</em>), the National Paralympic Committee of Rwanda has transitioned from a small advocacy group into a highly structured national movement. Following compliance regulations of the International Paralympic Committee (IPC), the name was updated in 2007 to represent our unified Paralympic focus.
              </p>
              <p className="text-muted leading-relaxed mb-0">
                In the aftermath of the 1994 genocide against the Tutsi, adapted sports served as a powerful vehicle for rehabilitation, social inclusion, and the empowerment of persons with physical, visual, and intellectual impairments. Today, NPC Rwanda coordinates with sports associations, clubs, and local governments to scout talent and secure global representation.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="p-4 rounded-4" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05) 0%, rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(226,232,240,0.8)' }}>
                <h4 className="fw-bold text-dark mb-3">Core Pillars of Action</h4>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 small text-muted"><i className="fas fa-check text-success"></i> Promotion & Sports Variety</div>
                  <div className="d-flex align-items-center gap-2 small text-muted"><i className="fas fa-check text-success"></i> High-Level Athlete Performance</div>
                  <div className="d-flex align-items-center gap-2 small text-muted"><i className="fas fa-check text-success"></i> Decentralized District Committees</div>
                  <div className="d-flex align-items-center gap-2 small text-muted"><i className="fas fa-check text-success"></i> Accessible Infrastructure Advocacy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Governing Structures */}
        <section className="mb-5" data-aos="fade-up">
          <h2 className="text-center fw-bold text-dark mb-4">Organizational Structure</h2>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-primary-soft p-3 rounded-3 text-primary"><i className="fas fa-sitemap fa-lg"></i></div>
                  <h3 className="h5 fw-bold mb-0 text-dark">Governing Board Structure</h3>
                </div>
                <p className="text-muted small">
                  The supreme decision-making body of NPC Rwanda. The Governing Board consists of the Executive Board (Chairperson, Vice-Chairpersons, Secretary General, Treasurer) alongside specialized Advisors representing physical, visual, deaf, and intellectual impairment categories, ensuring comprehensive representation.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4 bg-white">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="bg-success-soft p-3 rounded-3 text-success"><i className="fas fa-users-cog fa-lg"></i></div>
                  <h3 className="h5 fw-bold mb-0 text-dark">Secretariat & Management</h3>
                </div>
                <p className="text-muted small">
                  Responsible for the daily execution of strategic goals. Led by the Executive Secretariat, it coordinates the Technical Directorate (coaching & classification), Sports Directorate (events & leagues), and the Administration and Finance Directorate.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 14 Strategic Objectives Accordion */}
        <section className="mb-5" data-aos="fade-up">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark mb-2">14 Strategic Objectives</h2>
            <p className="text-muted small">Grouped by our 4 core pillars of intervention under the 2024-2028 Strategic Framework.</p>
          </div>

          <div className="row g-4">
            {/* Tabs Sidebar */}
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-2">
                {pillars.map(pillar => (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillar(pillar.id)}
                    className={`btn text-start p-3 rounded-3 border-0 transition-all ${activePillar === pillar.id ? 'bg-primary text-white shadow' : 'bg-white text-dark hover-bg-light shadow-sm'}`}
                    style={{ fontWeight: 600, fontSize: '0.9rem' }}
                  >
                    <i className={`fas ${pillar.icon} me-2`}></i> {pillar.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Panel */}
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white h-100 d-flex flex-column justify-content-between">
                <div>
                  <h3 className="h5 fw-bold mb-4 text-dark border-bottom pb-2">
                    {pillars.find(p => p.id === activePillar)?.title}
                  </h3>
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
                    {pillars.find(p => p.id === activePillar)?.objectives.map((obj, i) => (
                      <li key={i} className="d-flex align-items-start gap-3">
                        <div className="d-flex align-items-center justify-content-center bg-primary-soft text-primary rounded-circle" style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                          <span className="small fw-bold">{i + 1}</span>
                        </div>
                        <span className="text-muted small leading-relaxed">{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SWOT Analysis Grid */}
        <section className="mb-5" data-aos="fade-up">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark mb-2">SWOT Analysis</h2>
            <p className="text-muted small">Our internal capacity strengths and weaknesses vs. external opportunity and threat landscapes.</p>
          </div>

          <div className="row g-4">
            {/* Strengths */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4" style={{ borderLeft: '4px solid #10B981', background: '#fff' }}>
                <h3 className="h5 fw-bold text-success mb-3"><i className="fas fa-arrow-trend-up me-2"></i> Strengths</h3>
                <ul className="small text-muted mb-0 pl-3">
                  {swotData.strengths.map((item, idx) => (
                    <li key={idx} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Weaknesses */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4" style={{ borderLeft: '4px solid #EF4444', background: '#fff' }}>
                <h3 className="h5 fw-bold text-danger mb-3"><i className="fas fa-circle-exclamation me-2"></i> Weaknesses</h3>
                <ul className="small text-muted mb-0 pl-3">
                  {swotData.weaknesses.map((item, idx) => (
                    <li key={idx} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Opportunities */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4" style={{ borderLeft: '4px solid #3B82F6', background: '#fff' }}>
                <h3 className="h5 fw-bold text-primary mb-3"><i className="fas fa-lightbulb me-2"></i> Opportunities</h3>
                <ul className="small text-muted mb-0 pl-3">
                  {swotData.opportunities.map((item, idx) => (
                    <li key={idx} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Threats */}
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100 rounded-4" style={{ borderLeft: '4px solid #F59E0B', background: '#fff' }}>
                <h3 className="h5 fw-bold text-warning mb-3"><i className="fas fa-shield-halved me-2"></i> Threats</h3>
                <ul className="small text-muted mb-0 pl-3">
                  {swotData.threats.map((item, idx) => (
                    <li key={idx} className="mb-2">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Theory of Change (ToC) */}
        <section className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white text-center" data-aos="fade-up">
          <div className="mx-auto" style={{ maxWidth: '720px' }}>
            <div className="text-primary mb-3"><i className="fas fa-route fa-3x"></i></div>
            <h2 className="fw-bold text-dark mb-3">Theory of Change (ToC)</h2>
            <p className="text-muted leading-relaxed mb-0 small">
              Our Theory of Change process map directs the annual retreat and board guidelines. We hypothesize that by providing targeted athletic training and raising community awareness, we systematically dismantle social prejudices against persons with disabilities, enabling long-term social rehabilitation, confidence, and international athletic representation.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}

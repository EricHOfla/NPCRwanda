'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ResourceItem {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  type: 'Document' | 'Policy';
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Documents' | 'Policies'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/governance-docs').then(r => r.json()),
      fetch('/api/governance-policies').then(r => r.json())
    ])
      .then(([docs, policies]) => {
        const docItems = (Array.isArray(docs) ? docs : []).map((d: any) => ({ ...d, type: 'Document' as const }));
        const policyItems = (Array.isArray(policies) ? policies : []).map((p: any) => ({ ...p, type: 'Policy' as const }));
        setResources([...docItems, ...policyItems]);
      })
      .catch((err) => console.error('Fetch resources error:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredResources = resources.filter(item => {
    const matchesTab = activeTab === 'All' || (activeTab === 'Documents' && item.type === 'Document') || (activeTab === 'Policies' && item.type === 'Policy');
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <main id="main-content" style={{ background: '#FAFBFD' }}>
      {/* Page Header */}
      <header
        className="py-5 text-white"
        style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container py-4 text-center">
          <span className="badge bg-white text-primary text-uppercase fw-bold mb-3 px-3 py-2" style={{ letterSpacing: '1px' }}>
            Publications & Files
          </span>
          <h1 className="text-white fw-bold mb-2">Publications & Resources</h1>
          <p className="text-white opacity-75 mx-auto mb-0" style={{ maxWidth: '640px' }}>
            Browse and download official statutes, policy manuals, strategic reports, and resources published by NPC Rwanda.
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="container py-5">
        <div className="row g-4 mb-5 align-items-center p-4 rounded-4 bg-white shadow-sm border" data-aos="fade-up">
          {/* Search bar */}
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 py-2"
                placeholder="Search publications..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="col-md-7">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {(['All', 'Documents', 'Policies'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`btn btn-sm px-4 py-2 rounded-pill fw-bold transition-all ${activeTab === tab ? 'bg-primary text-white' : 'bg-light text-dark border'}`}
                  style={{ fontSize: '0.85rem' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resources Listing */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading resources...</h5>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-5 card border-0 shadow-sm rounded-4 bg-white">
            <div className="text-muted mb-3"><i className="fas fa-file-excel fa-3x"></i></div>
            <h4 className="fw-bold text-dark">No publications found</h4>
            <p className="text-muted small">Try modifying your search text or category filters.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredResources.map(item => (
              <div key={item.id} className="col-md-6 col-lg-4" data-aos="fade-up">
                <article className="card border-0 shadow-sm h-100 rounded-4 bg-white p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className={`p-3 rounded-3 ${item.type === 'Document' ? 'bg-primary-soft text-primary' : 'bg-success-soft text-success'}`}>
                        <i className={`fas ${item.type === 'Document' ? 'fa-file-lines' : 'fa-shield-halved'} fa-lg`}></i>
                      </div>
                      <span className={`badge px-2 py-1 rounded-pill small ${item.type === 'Document' ? 'bg-primary text-white' : 'bg-success text-white'}`}>
                        {item.type}
                      </span>
                    </div>
                    <h3 className="h6 fw-bold text-dark mb-2 leading-snug">{item.title}</h3>
                    <p className="text-muted small leading-relaxed mb-4">{item.desc}</p>
                  </div>

                  <div className="border-top pt-3 mt-auto">
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-sm w-100 fw-bold py-2 ${item.type === 'Document' ? 'btn-outline-primary' : 'btn-outline-success'}`}
                    >
                      <i className="fas fa-download me-2"></i> Download Resource
                    </a>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

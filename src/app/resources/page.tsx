'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

interface ResourceItem {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  type: 'Document' | 'Policy';
  order: number;
}

const getFileMeta = (url: string) => {
  if (!url || url === '#' || url === '') {
    return { ext: 'FILE', badgeClass: 'bg-secondary', icon: 'fa-file-lines', label: 'File' };
  }
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) {
    return { ext: 'PDF', badgeClass: 'bg-danger text-white', icon: 'fa-file-pdf', label: 'PDF Document' };
  }
  if (clean.endsWith('.doc') || clean.endsWith('.docx')) {
    return { ext: 'DOC', badgeClass: 'bg-primary text-white', icon: 'fa-file-word', label: 'Word Document' };
  }
  if (clean.endsWith('.xls') || clean.endsWith('.xlsx') || clean.endsWith('.csv')) {
    return { ext: 'XLS', badgeClass: 'bg-success text-white', icon: 'fa-file-excel', label: 'Excel Spreadsheet' };
  }
  if (clean.endsWith('.ppt') || clean.endsWith('.pptx')) {
    return { ext: 'PPT', badgeClass: 'bg-warning text-dark', icon: 'fa-file-powerpoint', label: 'Presentation' };
  }
  return { ext: 'DOC', badgeClass: 'bg-primary text-white', icon: 'fa-file-lines', label: 'Document' };
};

export default function ResourcesPage() {
  const { governanceDocs, governancePolicies, loading } = useData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Documents' | 'Policies'>('All');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sortBy, setSortBy] = useState<'order' | 'title'>('order');

  const resources: ResourceItem[] = useMemo(() => {
    const docItems = (governanceDocs || []).map((d) => ({
      id: d.id,
      title: d.title,
      desc: d.desc,
      fileUrl: d.fileUrl,
      type: 'Document' as const,
      order: d.order ?? 0,
    }));
    const policyItems = (governancePolicies || []).map((p) => ({
      id: p.id,
      title: p.title,
      desc: p.desc,
      fileUrl: p.fileUrl,
      type: 'Policy' as const,
      order: p.order ?? 0,
    }));
    return [...docItems, ...policyItems];
  }, [governanceDocs, governancePolicies]);

  const filteredResources = useMemo(() => {
    const list = resources.filter(item => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Documents' && item.type === 'Document') ||
        (activeTab === 'Policies' && item.type === 'Policy');
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });

    if (sortBy === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => a.order - b.order);
  }, [resources, activeTab, search, sortBy]);

  const docCount = resources.filter(r => r.type === 'Document').length;
  const policyCount = resources.filter(r => r.type === 'Policy').length;

  return (
    <main id="main-content" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Official Government / National Agency Header Banner */}
      <header className="page-header" style={{ borderBottom: '3px solid #0072C6' }}>
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Official Publications</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge px-3 py-1 bg-white text-dark fw-bold rounded-pill text-uppercase border" style={{ fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              <i className="fas fa-landmark text-primary me-1" /> Official Portal
            </span>
          </div>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            Publications, Legal Frameworks &amp; Reports
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '850px' }}>
            Official repository of statutes, anti-doping policies, annual reports, strategic frameworks, and regulatory manuals published by the National Paralympic Committee of Rwanda.
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="container py-5">

        {/* Quick Stats Bar */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-4">
            <div className="bg-white p-3 rounded-3 border d-flex align-items-center gap-3 shadow-xs">
              <div className="rounded-3 p-3 bg-primary bg-opacity-10 text-primary">
                <i className="fas fa-folder-open fa-lg" />
              </div>
              <div>
                <span className="d-block text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Total Publications</span>
                <span className="h4 fw-bold mb-0 text-dark">{resources.length}</span>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="bg-white p-3 rounded-3 border d-flex align-items-center gap-3 shadow-xs">
              <div className="rounded-3 p-3 bg-info bg-opacity-10 text-info">
                <i className="fas fa-file-contract fa-lg" />
              </div>
              <div>
                <span className="d-block text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Statutes &amp; Documents</span>
                <span className="h4 fw-bold mb-0 text-dark">{docCount}</span>
              </div>
            </div>
          </div>
          <div className="col-sm-6 col-md-4">
            <div className="bg-white p-3 rounded-3 border d-flex align-items-center gap-3 shadow-xs">
              <div className="rounded-3 p-3 bg-success bg-opacity-10 text-success">
                <i className="fas fa-shield-alt fa-lg" />
              </div>
              <div>
                <span className="d-block text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Policies &amp; Guidelines</span>
                <span className="h4 fw-bold mb-0 text-dark">{policyCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Control Bar (Government Portal Style) */}
        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4" data-aos="fade-up">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="fas fa-search" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2 bg-light"
                  placeholder="Filter by document title, keywords or reference..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    className="btn btn-light border-start-0 border text-muted"
                    type="button"
                    onClick={() => setSearch('')}
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>

            {/* Classification Filter Tabs */}
            <div className="col-lg-4">
              <div className="btn-group w-100" role="group">
                {(['All', 'Documents', 'Policies'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`btn btn-sm py-2 fw-bold ${activeTab === tab ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {tab === 'All' ? `All (${resources.length})` : tab === 'Documents' ? `Documents (${docCount})` : `Policies (${policyCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & View Toggle */}
            <div className="col-lg-3 d-flex justify-content-lg-end gap-2 align-items-center">
              <select
                className="form-select form-select-sm w-auto"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'order' | 'title')}
                style={{ fontSize: '0.8rem', fontWeight: 600 }}
              >
                <option value="order">Sort: Official Order</option>
                <option value="title">Sort: Title (A-Z)</option>
              </select>

              <div className="btn-group" role="group" aria-label="View toggle">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`btn btn-sm ${viewMode === 'table' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  title="Official Register Table View"
                >
                  <i className="fas fa-table-list" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`btn btn-sm ${viewMode === 'cards' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  title="Grid View"
                >
                  <i className="fas fa-grid-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading official documents...</span>
            </div>
            <h6 className="text-muted fw-bold">Retrieving official gazette and publications repository...</h6>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-5">
            <div className="text-muted mb-3">
              <i className="fas fa-file-circle-question fa-3x text-secondary opacity-50" />
            </div>
            <h5 className="fw-bold text-dark">No publications matching your criteria</h5>
            <p className="text-muted small mb-3">No matching documents or policies found with the current filter settings.</p>
            <button
              onClick={() => { setSearch(''); setActiveTab('All'); }}
              className="btn btn-outline-primary btn-sm px-4 fw-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Official Government Register / Gazette Table View */
          <div className="card border rounded-4 shadow-sm overflow-hidden bg-white mb-4" data-aos="fade-up">
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary px-2 py-1" style={{ fontSize: '0.7rem' }}>REGISTER</span>
                <h6 className="mb-0 fw-bold text-dark" style={{ letterSpacing: '0.2px' }}>
                  Official Registry of Governance Documents &amp; Policy Instruments
                </h6>
              </div>
              <span className="small text-muted fw-semibold">
                Showing {filteredResources.length} of {resources.length} records
              </span>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ borderCollapse: 'separate' }}>
                <thead style={{ background: '#0F223D', color: '#FFFFFF' }}>
                  <tr>
                    <th scope="col" style={{ width: '60px', padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>#</th>
                    <th scope="col" style={{ width: '90px', padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Format</th>
                    <th scope="col" style={{ padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Title &amp; Reference</th>
                    <th scope="col" style={{ width: '130px', padding: '14px 16px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Category</th>
                    <th scope="col" style={{ width: '150px', padding: '14px 16px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Access</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((item, index) => {
                    const meta = getFileMeta(item.fileUrl);
                    const hasValidFile = Boolean(item.fileUrl && item.fileUrl !== '#' && item.fileUrl.trim() !== '');

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #EDF2F7', transition: 'background-color 0.15s ease' }}>
                        {/* Index */}
                        <td className="text-muted fw-bold small text-center" style={{ padding: '16px' }}>
                          {String(index + 1).padStart(2, '0')}
                        </td>

                        {/* Format Badge */}
                        <td style={{ padding: '16px' }}>
                          <span
                            className={`badge px-2 py-1 rounded fw-bold d-inline-flex align-items-center gap-1 ${meta.badgeClass}`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            <i className={`fas ${meta.icon}`} />
                            {meta.ext}
                          </span>
                        </td>

                        {/* Title and Description */}
                        <td style={{ padding: '16px' }}>
                          <div className="d-flex flex-column">
                            <span className="fw-bold text-dark mb-1" style={{ fontSize: '0.92rem', lineHeight: 1.35 }}>
                              {item.title}
                            </span>
                            {item.desc && (
                              <span className="text-muted small" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                                {item.desc}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '16px' }}>
                          <span
                            className={`badge rounded-pill px-3 py-1 fw-bold ${item.type === 'Document' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'}`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {item.type}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          {hasValidFile ? (
                            <div className="d-flex justify-content-center gap-1">
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary fw-bold px-3 py-1 d-inline-flex align-items-center gap-1 shadow-xs"
                                style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                                title={`Download ${item.title}`}
                              >
                                <i className="fas fa-download" />
                                <span>Download</span>
                              </a>
                            </div>
                          ) : (
                            <span className="badge bg-light text-muted border px-2 py-1 small" style={{ fontSize: '0.72rem' }}>
                              <i className="fas fa-lock me-1" /> Internal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card-footer bg-light px-4 py-3 border-top d-flex flex-wrap justify-content-between align-items-center text-muted small">
              <div>
                <i className="fas fa-check-circle text-success me-1" />
                All published policies comply with official IPC regulations &amp; Rwandan sports law standards.
              </div>
              <div className="fw-semibold">
                Official NPC Rwanda Documentation Registry
              </div>
            </div>
          </div>
        ) : (
          /* Cards View (Alternative grid view) */
          <div className="row g-4 mb-4" data-aos="fade-up">
            {filteredResources.map((item, index) => {
              const meta = getFileMeta(item.fileUrl);
              const hasValidFile = Boolean(item.fileUrl && item.fileUrl !== '#' && item.fileUrl.trim() !== '');

              return (
                <div key={item.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border rounded-4 bg-white p-4 shadow-sm d-flex flex-column justify-content-between transition-hover">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <span className={`badge px-2 py-1 rounded fw-bold ${meta.badgeClass}`} style={{ fontSize: '0.7rem' }}>
                          <i className={`fas ${meta.icon} me-1`} /> {meta.ext}
                        </span>
                        <span
                          className={`badge rounded-pill px-3 py-1 fw-bold ${item.type === 'Document' ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-success-subtle text-success border border-success-subtle'}`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {item.type}
                        </span>
                      </div>
                      <h3 className="h6 fw-bold text-dark mb-2 leading-snug" style={{ minHeight: '40px' }}>
                        {item.title}
                      </h3>
                      {item.desc && (
                        <p className="text-muted small leading-relaxed mb-4" style={{ minHeight: '44px' }}>
                          {item.desc}
                        </p>
                      )}
                    </div>

                    <div className="border-top pt-3 mt-auto">
                      {hasValidFile ? (
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-outline-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                        >
                          <i className="fas fa-download" /> Download Document
                        </a>
                      ) : (
                        <span className="btn btn-sm btn-light w-100 text-muted disabled border">
                          <i className="fas fa-lock me-1" /> Internal Record
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Verification and Public Transparency Note */}
        <div className="p-4 rounded-4 border bg-white shadow-xs d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle p-3 bg-primary bg-opacity-10 text-primary">
              <i className="fas fa-file-shield fa-2x" />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-dark">Need an unlisted official archive or regulatory clarification?</h6>
              <p className="text-muted small mb-0">
                Direct all public records and verification requests to the General Secretariat of NPC Rwanda.
              </p>
            </div>
          </div>
          <Link href="/contact" className="btn btn-primary btn-sm px-4 py-2 fw-bold text-nowrap rounded-3">
            Contact Secretariat <i className="fas fa-arrow-right ms-1" />
          </Link>
        </div>

      </div>
    </main>
  );
}

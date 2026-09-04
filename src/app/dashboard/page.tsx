'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import {
  useData,
  Athlete,
  NewsArticle,
  Career,
  ContactMessage,
  Sport,
  Leader,
  SystemComponent,
  VolunteerApplication,
  DonationInquiry,
  Partner,
  SocialLink,
  Event,
  MediaAsset
} from '@/context/DataContext';

// Professional Pagination Component
const PaginationComponent: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}> = ({ currentPage, totalPages, onPageChange, itemsPerPage = 10 }) => {
  const maxPagesToShow = 5;
  const pages: (number | string)[] = [];
  
  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top">
      <span className="small text-muted">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
      <nav>
        <ul className="pagination mb-0 gap-1">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
              <i className="fas fa-chevron-left" />
            </button>
          </li>
          {pages.map((page, idx) => (
            <li key={idx} className={`page-item ${page === '...' ? 'disabled' : ''} ${page === currentPage ? 'active' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button className="page-link" onClick={() => onPageChange(page as number)} disabled={page === currentPage}>
                  {page}
                </button>
              )}
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
              <i className="fas fa-chevron-right" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

type AdminTab =
  | 'overview'
  | 'athletes'
  | 'sports'
  | 'news'
  | 'events'
  | 'careers'
  | 'leadership'
  | 'system'
  | 'governance'
  | 'partners'
  | 'site-content'
  | 'contacts'
  | 'settings'
  | 'profile'
  | 'pages'
  | 'volunteers'
  | 'members';

// Reusable Custom CMS Components
interface CMSImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  openMediaSelector: (callback: (url: string) => void) => void;
  uploadMediaFile: (file: File, category?: string, entity?: string) => Promise<MediaAsset>;
  category?: 'athletes' | 'news' | 'events' | 'partners' | 'leaders' | 'site' | string;
  entity?: string;
}

const CMSImageField: React.FC<CMSImageFieldProps> = ({
  label,
  value,
  onChange,
  openMediaSelector,
  uploadMediaFile,
  category = 'site',
  entity,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMediaFile(file, category, entity);
      onChange(asset.url);
      alert('Image uploaded and selected successfully!');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/assets/img/curated/${path}`;
  };

  return (
    <div className="mb-3">
      <label className="form-label small fw-bold">{label}</label>
      
      {/* Current Preview */}
      {value ? (
        <div className="mb-2 p-2 border rounded bg-light d-flex align-items-center gap-3">
          <img 
            src={getFullImageUrl(value)} 
            style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', background: '#e2e8f0' }} 
            alt="Preview" 
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/curated/home-hero.jpg'; }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="small text-truncate d-block fw-semibold" style={{ maxWidth: '100%' }}>{value}</span>
            <span className="xsmall text-muted d-block">Path selected</span>
          </div>
          <button type="button" onClick={() => onChange('')} className="btn btn-sm btn-outline-danger py-1" title="Remove image">
            <i className="fas fa-trash" />
          </button>
        </div>
      ) : (
        <div className="mb-2 p-3 border border-dashed rounded bg-light text-center small text-muted">
          No image selected.
        </div>
      )}

      {/* Actions */}
      <div className="d-flex gap-2">
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className="btn btn-sm btn-outline-primary"
          disabled={uploading}
        >
          <i className="fas fa-upload me-1" /> {uploading ? 'Uploading...' : 'Upload New'}
        </button>
        <button 
          type="button" 
          onClick={() => {
            openMediaSelector((url) => {
              onChange(url);
            });
          }} 
          className="btn btn-sm btn-outline-secondary"
        >
          <i className="fas fa-images me-1" /> Select from Library
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept="image/*" 
          className="d-none" 
        />
      </div>
    </div>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  openMediaSelector: (callback: (url: string) => void) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  openMediaSelector,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end);
    const replacement = before + selection + after;
    const newVal = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newVal);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selection.length);
    }, 0);
  };

  return (
    <div className="border rounded bg-white mb-3">
      <div className="d-flex justify-content-between align-items-center bg-light border-bottom p-2">
        <span className="small fw-bold text-muted">{label}</span>
        <div className="btn-group btn-group-sm">
          <button type="button" onClick={() => setPreviewMode(false)} className={`btn btn-sm ${!previewMode ? 'btn-secondary' : 'btn-outline-secondary'}`}>Write</button>
          <button type="button" onClick={() => setPreviewMode(true)} className={`btn btn-sm ${previewMode ? 'btn-secondary' : 'btn-outline-secondary'}`}>Preview</button>
        </div>
      </div>
      
      {!previewMode ? (
        <div>
          <div className="d-flex flex-wrap gap-1 p-1 bg-light border-bottom">
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('**', '**')} title="Bold"><i className="fas fa-bold" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('*', '*')} title="Italic"><i className="fas fa-italic" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('<u>', '</u>')} title="Underline"><i className="fas fa-underline" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('### ')} title="Heading 3"><i className="fas fa-heading" />3</button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('- ')} title="Bullet List"><i className="fas fa-list-ul" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('1. ')} title="Numbered List"><i className="fas fa-list-ol" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('[', '](url)')} title="Link"><i className="fas fa-link" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => {
              openMediaSelector((url) => {
                insertText(`![image](${url})`);
              });
            }} title="Insert Image"><i className="fas fa-image" /></button>
            <button type="button" className="btn btn-xs btn-outline-secondary py-0 px-2 small" onClick={() => insertText('| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |')} title="Table"><i className="fas fa-table" /></button>
          </div>
          <textarea
            ref={textareaRef}
            className="form-control border-0 rounded-0"
            rows={5}
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ fontSize: '0.9rem', outline: 'none', boxShadow: 'none' }}
          />
        </div>
      ) : (
        <div className="p-3 bg-light" style={{ minHeight: '140px', fontSize: '0.9rem' }}>
          {value ? (
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {value.split('\n').map((line, idx) => {
                if (line.startsWith('### ')) return <h5 key={idx} className="mt-2 fw-bold">{line.replace('### ', '')}</h5>;
                if (line.startsWith('## ')) return <h4 key={idx} className="mt-2 fw-bold">{line.replace('## ', '')}</h4>;
                if (line.startsWith('# ')) return <h3 key={idx} className="mt-3 fw-bold">{line.replace('# ', '')}</h3>;
                if (line.startsWith('- ')) return <li key={idx} className="ms-3">{line.replace('- ', '')}</li>;
                return <p key={idx} className="mb-2">{line}</p>;
              })}
            </div>
          ) : (
            <span className="text-muted italic">Nothing to preview.</span>
          )}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    athletes,
    news,
    events,
    careers,
    contacts,
    sports,
    leadership,
    systemComponents,
    volunteers,
    donations,
    partners,
    siteContentList,
    contactInfo,
    socialLinks,
    addAthlete,
    updateAthlete,
    deleteAthlete,
    addNews,
    updateNews,
    deleteNews,
    addEvent,
    updateEvent,
    deleteEvent,
    addCareer,
    closeCareer,
    markContactAsRead,
    deleteContactMessage,
    addSport,
    updateSport,
    deleteSport,
    addLeader,
    updateLeader,
    deleteLeader,
    addSystemComponent,
    updateSystemComponent,
    deleteSystemComponent,
    markVolunteerAsRead,
    deleteVolunteerApplication,
    markDonationAsRead,
    deleteDonationInquiry,
    addPartner,
    updatePartner,
    deletePartner,
    saveSiteContent,
    updateContactInfo,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    mediaAssets,
    fetchMediaAssets,
    fetchProtectedData,
    uploadMediaFile,
    deleteMediaAsset,
    npcAssociations, npcClubs, npcFederations, dpscoContacts,
    addNpcAssociation, updateNpcAssociation, deleteNpcAssociation,
    addNpcClub, updateNpcClub, deleteNpcClub,
    addNpcFederation, updateNpcFederation, deleteNpcFederation,
    addDpscoContact, updateDpscoContact, deleteDpscoContact,
  } = useData();

  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [currentDateString, setCurrentDateString] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('avatar-1.svg');

  useEffect(() => {
    setCurrentDateString(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    const savedAvatar = localStorage.getItem('admin_avatar') || 'avatar-1.svg';
    setSelectedAvatar(savedAvatar);
  }, []);

  // Search states
  const [athleteSearch, setAthleteSearch] = useState('');
  const [newsSearch, setNewsSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [sportSearch, setSportSearch] = useState('');
  const [leaderSearch, setLeaderSearch] = useState('');
  const [systemSearch, setSystemSearch] = useState('');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [activeEditPage, setActiveEditPage] = useState<string | null>(null);
  const [previewModeEnabled, setPreviewModeEnabled] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [contentSearch, setContentSearch] = useState('');
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaModalCallback, setMediaModalCallback] = useState<((url: string) => void) | null>(null);

  const openMediaSelector = (callback: (url: string) => void) => {
    setMediaModalCallback(() => callback);
    setMediaModalOpen(true);
  };

  // Form states
  const [athleteFormOpen, setAthleteFormOpen] = useState(false);
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [athleteForm, setAthleteForm] = useState({
    name: '',
    sport: 'Sitting Volleyball',
    status: 'Active',
    country: 'Rwanda',
    avatar: 'avatar-1.svg',
    desc: ''
  });

  const [newsFormOpen, setNewsFormOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    date: 'Jul 2026',
    category: 'Sport',
    status: 'Draft',
    img: 'news-volleyball.jpg',
    desc: '',
    content: '',
    slug: ''
  });

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '2026-08-15',
    endDate: '2026-08-20',
    location: 'Amahoro Stadium, Kigali',
    category: 'National',
    status: 'Upcoming',
    img: 'sports-hero.jpg',
    featured: false
  });

  const [careerFormOpen, setCareerFormOpen] = useState(false);
  const [careerForm, setCareerForm] = useState({
    title: '',
    location: 'Kigali',
    status: 'Open',
    desc: '',
    slug: ''
  });

  const [sportFormOpen, setSportFormOpen] = useState(false);
  const [editingSportId, setEditingSportId] = useState<string | null>(null);
  const [sportForm, setSportForm] = useState({
    slug: '',
    title: '',
    img: 'index-sport-1.jpg',
    desc: ''
  });

  const [leaderFormOpen, setLeaderFormOpen] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);
  const [leaderForm, setLeaderForm] = useState({
    name: '',
    role: 'President',
    desc: '',
    avatar: 'avatar-4.svg',
    committee: 'Board of Directors',
    email: '',
    phone: '',
    impairment: ''
  });

  const [systemFormOpen, setSystemFormOpen] = useState(false);
  const [editingSystemId, setEditingSystemId] = useState<string | null>(null);
  const [systemForm, setSystemForm] = useState({
    title: '',
    desc: ''
  });

  
  // Members State
  const [assocFormOpen, setAssocFormOpen] = useState(false);
  const [editingAssocId, setEditingAssocId] = useState<string | null>(null);
  const [assocForm, setAssocForm] = useState({ name: '', acronym: '', desc: '', activities: [] as string[], icon: 'fa-users', order: 0, active: true });

  const handleAssocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssocId) await updateNpcAssociation({ id: editingAssocId, ...assocForm });
    else await addNpcAssociation(assocForm);
    setAssocFormOpen(false); setEditingAssocId(null);
    setAssocForm({ name: '', acronym: '', desc: '', activities: [], icon: 'fa-users', order: 0, active: true });
  };

  const [clubFormOpen, setClubFormOpen] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [clubForm, setClubForm] = useState({ name: '', location: '', order: 0, active: true });

  const handleClubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClubId) await updateNpcClub({ id: editingClubId, ...clubForm });
    else await addNpcClub(clubForm);
    setClubFormOpen(false); setEditingClubId(null);
    setClubForm({ name: '', location: '', order: 0, active: true });
  };

  const [fedFormOpen, setFedFormOpen] = useState(false);
  const [editingFedId, setEditingFedId] = useState<string | null>(null);
  const [fedForm, setFedForm] = useState({ name: '', logo: '', website: '', role: '', desc: '', order: 0, active: true });

  const handleFedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFedId) await updateNpcFederation({ id: editingFedId, ...fedForm });
    else await addNpcFederation(fedForm);
    setFedFormOpen(false); setEditingFedId(null);
    setFedForm({ name: '', logo: '', website: '', role: '', desc: '', order: 0, active: true });
  };

  const [dpscoFormOpen, setDpscoFormOpen] = useState(false);
  const [editingDpscoId, setEditingDpscoId] = useState<string | null>(null);
  const [dpscoForm, setDpscoForm] = useState({ province: 'Kigali City', district: '', coordinator: '', phone: '', email: '', active: true });

  const handleDpscoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDpscoId) await updateDpscoContact({ id: editingDpscoId, ...dpscoForm });
    else await addDpscoContact(dpscoForm);
    setDpscoFormOpen(false); setEditingDpscoId(null);
    setDpscoForm({ province: 'Kigali City', district: '', coordinator: '', phone: '', email: '', active: true });
  };

  const [partnerFormOpen, setPartnerFormOpen] = useState(false);
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    logo: 'partner-minisports.svg',
    website: '',
    category: 'Government Sector',
    order: 0,
    active: true
  });

  const [socialFormOpen, setSocialFormOpen] = useState(false);
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform: 'facebook',
    url: '',
    icon: 'fa-facebook',
    active: true,
    order: 0
  });

  const [contactForm, setContactForm] = useState({
    address: '',
    phone: '',
    email: '',
    mapUrl: ''
  });

  const [editingContentKey, setEditingContentKey] = useState<string | null>(null);
  const [contentFormValue, setContentFormValue] = useState('');

  const [contentSubTab, setContentSubTab] = useState<'hero' | 'about' | 'stats' | 'advanced'>('hero');
  const [siteForm, setSiteForm] = useState<Record<string, string>>({});

  // Inbox Modal Detail states
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [activeVolunteer, setActiveVolunteer] = useState<VolunteerApplication | null>(null);
  const [activeDonation, setActiveDonation] = useState<DonationInquiry | null>(null);
  const [inboxSubTab, setInboxSubTab] = useState<'messages' | 'volunteers' | 'donations'>('messages');

  // Pagination states - Professional configuration
  const [pageSizes] = useState({ 
    athletes: 10, 
    news: 8, 
    events: 10, 
    careers: 12, 
    contacts: 15,
    sports: 12,
    leaders: 10,
    partners: 12,
    media: 20,
    donations: 15,
    volunteers: 15
  });
  const [currentPage, setCurrentPage] = useState({ 
    athletes: 1, 
    news: 1, 
    events: 1, 
    careers: 1, 
    contacts: 1,
    sports: 1,
    leaders: 1,
    partners: 1,
    media: 1,
    donations: 1,
    volunteers: 1
  });

  // System Settings state
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    facebook: '',
    twitter: '',
    instagram: ''
  });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Admin Profile state
  const [profile, setProfile] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Governance Document/Policy States & CRUD Operations
  const [govDocs, setGovDocs] = useState<any[]>([]);
  const [govPolicies, setGovPolicies] = useState<any[]>([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govFormOpen, setGovFormOpen] = useState(false);
  const [govFormType, setGovFormType] = useState<'doc' | 'policy'>('doc');
  const [editingGovId, setEditingGovId] = useState<string | null>(null);
  const [govForm, setGovForm] = useState({
    title: '',
    desc: '',
    fileUrl: '',
    order: 0,
    published: true
  });

  const fetchGovData = async () => {
    try {
      setGovLoading(true);
      const [docsRes, polsRes] = await Promise.all([
        fetch('/api/governance-docs'),
        fetch('/api/governance-policies')
      ]);
      if (docsRes.ok) setGovDocs(await docsRes.json());
      if (polsRes.ok) setGovPolicies(await polsRes.json());
    } catch (err) {
      console.error('Fetch governance data error:', err);
    } finally {
      setGovLoading(false);
    }
  };

  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = govFormType === 'doc' ? '/api/governance-docs' : '/api/governance-policies';
    const method = editingGovId ? 'PUT' : 'POST';
    const url = editingGovId ? `${endpoint}/${editingGovId}` : endpoint;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(govForm)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save governance item');
      }
      alert('Governance item saved successfully!');
      setGovFormOpen(false);
      setEditingGovId(null);
      setGovForm({ title: '', desc: '', fileUrl: '', order: 0, published: true });
      fetchGovData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteGovItem = async (type: 'doc' | 'policy', id: string) => {
    if (!confirm('Are you sure you want to delete this governance item?')) return;
    const endpoint = type === 'doc' ? '/api/governance-docs' : '/api/governance-policies';
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete governance item');
      }
      alert('Governance item deleted successfully!');
      fetchGovData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Fetch settings on mount
  useEffect(() => {
    fetch('/api/system-settings')
      .then(r => (r.ok ? r.json() : {}))
      .then(data => setSysSettings(prev => ({ ...prev, ...data })))
      .catch(() => {});

    fetch('/api/auth/profile')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data) setProfile(prev => ({ ...prev, name: data.name, email: data.email }));
      })
      .catch(() => {});

    fetchMediaAssets();
    fetchGovData();
    fetchProtectedData();
  }, []);

  // Update contactForm states when loaded from DB
  useEffect(() => {
    if (contactInfo) {
      setContactForm({
        address: contactInfo.address,
        phone: contactInfo.phone,
        email: contactInfo.email,
        mapUrl: contactInfo.mapUrl || ''
      });
    }
  }, [contactInfo]);

  useEffect(() => {
    if (siteContentList && siteContentList.length > 0) {
      const initial: Record<string, string> = {};
      siteContentList.forEach(c => {
        initial[c.key] = c.value;
      });
      setSiteForm(initial);
    }
  }, [siteContentList]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-profile-dropdown]')) setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileDropdownOpen]);

  // Close bell dropdown on outside click
  useEffect(() => {
    if (!bellOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-bell-dropdown]')) setBellOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [bellOpen]);

  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    setSettingsMsg('');
    try {
      const res = await fetch('/api/system-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sysSettings)
      });
      const data = await res.json();
      if (res.ok) {
        setSysSettings(data.settings);
        setSettingsMsg('Settings saved successfully!');
      } else {
        setSettingsMsg(data.error || 'Failed to save settings.');
      }
    } catch {
      setSettingsMsg('An error occurred.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');
    if (profile.password && profile.password !== profile.confirmPassword) {
      setProfileError('Passwords do not match.');
      return;
    }
    setProfileSaving(true);
    try {
      const body: any = { name: profile.name, email: profile.email };
      if (profile.password) body.password = profile.password;
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('admin_avatar', selectedAvatar);
        setProfileMsg('Profile updated successfully!');
        setProfile(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        setProfileError(data.error || 'Failed to update profile.');
      }
    } catch {
      setProfileError('An error occurred.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const STATS = [
    { label: 'Total Athletes', value: String(athletes.length), icon: 'fa-person-running', color: '#0072C6' },
    { label: 'News Articles', value: String(news.length), icon: 'fa-newspaper', color: '#4CAF50' },
    { label: 'Events Count', value: String(events.length), icon: 'fa-calendar-alt', color: '#673AB7' },
    { label: 'Open Positions', value: String(careers.filter(c => c.status === 'Open').length), icon: 'fa-briefcase', color: '#E53935' },
    { label: 'Messages Inbox', value: String(contacts.filter(c => !c.read).length), icon: 'fa-envelope', color: '#FFA000' },
    { label: 'Partners Logos', value: String(partners.length), icon: 'fa-handshake', color: '#00838F' }
  ];

  // Forms Submissions
  const handleAthleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAthleteId) {
      await updateAthlete({ id: editingAthleteId, ...athleteForm });
    } else {
      await addAthlete(athleteForm);
    }
    setAthleteForm({ name: '', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: 'avatar-1.svg', desc: '' });
    setEditingAthleteId(null);
    setAthleteFormOpen(false);
  };

  const handleEditAthleteClick = (a: Athlete) => {
    setAthleteForm({
      name: a.name,
      sport: a.sport,
      status: a.status,
      country: a.country,
      avatar: a.avatar,
      desc: a.desc
    });
    setEditingAthleteId(a.id);
    setAthleteFormOpen(true);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugValue = newsForm.slug || newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalForm = { ...newsForm, slug: slugValue };

    if (editingNewsId) {
      await updateNews({ id: editingNewsId, ...finalForm });
    } else {
      await addNews(finalForm);
    }
    setNewsForm({ title: '', date: 'Jul 2026', category: 'Sport', status: 'Draft', img: 'news-volleyball.jpg', desc: '', content: '', slug: '' });
    setEditingNewsId(null);
    setNewsFormOpen(false);
  };

  const handleEditNewsClick = (article: NewsArticle) => {
    setNewsForm({
      title: article.title,
      date: article.date,
      category: article.category,
      status: article.status,
      img: article.img,
      desc: article.desc,
      content: article.content || '',
      slug: article.slug
    });
    setEditingNewsId(article.id);
    setNewsFormOpen(true);
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventId) {
      await updateEvent({ id: editingEventId, ...eventForm });
    } else {
      await addEvent(eventForm);
    }
    setEventForm({
      title: '',
      description: '',
      date: '2026-08-15',
      endDate: '2026-08-20',
      location: 'Amahoro Stadium, Kigali',
      category: 'National',
      status: 'Upcoming',
      img: 'sports-hero.jpg',
      featured: false
    });
    setEditingEventId(null);
    setEventFormOpen(false);
  };

  const handleEditEventClick = (ev: Event) => {
    setEventForm({
      title: ev.title,
      description: ev.description,
      date: ev.date,
      endDate: ev.endDate || '',
      location: ev.location,
      category: ev.category,
      status: ev.status,
      img: ev.img,
      featured: ev.featured
    });
    setEditingEventId(ev.id);
    setEventFormOpen(true);
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugValue = careerForm.slug || careerForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    await addCareer({ ...careerForm, slug: slugValue, applicants: 0 });
    setCareerForm({ title: '', location: 'Kigali', status: 'Open', desc: '', slug: '' });
    setCareerFormOpen(false);
  };

  const handleSportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slugValue = sportForm.slug || sportForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalForm = { ...sportForm, slug: slugValue };

    if (editingSportId) {
      await updateSport({ id: editingSportId, ...finalForm });
    } else {
      await addSport(finalForm);
    }
    setSportForm({ slug: '', title: '', img: 'index-sport-1.jpg', desc: '' });
    setEditingSportId(null);
    setSportFormOpen(false);
  };

  const handleEditSportClick = (s: Sport) => {
    setSportForm({ slug: s.slug, title: s.title, img: s.img, desc: s.desc });
    setEditingSportId(s.id);
    setSportFormOpen(true);
  };

  const handleLeaderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeaderId) {
      await updateLeader({ id: editingLeaderId, ...leaderForm });
    } else {
      await addLeader(leaderForm);
    }
    setLeaderForm({ name: '', role: 'President', desc: '', avatar: 'avatar-4.svg', committee: 'Board of Directors', email: '', phone: '', impairment: '' });
    setEditingLeaderId(null);
    setLeaderFormOpen(false);
  };

  const handleEditLeaderClick = (l: Leader) => {
    setLeaderForm({
      name: l.name,
      role: l.role,
      desc: l.desc,
      avatar: l.avatar,
      committee: l.committee || 'Board of Directors',
      email: l.email || '',
      phone: l.phone || '',
      impairment: l.impairment || ''
    });
    setEditingLeaderId(l.id);
    setLeaderFormOpen(true);
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSystemId) {
      await updateSystemComponent({ id: editingSystemId, ...systemForm });
    } else {
      await addSystemComponent(systemForm);
    }
    setSystemForm({ title: '', desc: '' });
    setEditingSystemId(null);
    setSystemFormOpen(false);
  };

  const handleEditSystemClick = (c: SystemComponent) => {
    setSystemForm({ title: c.title, desc: c.desc });
    setEditingSystemId(c.id);
    setSystemFormOpen(true);
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartnerId) {
      await updatePartner({ id: editingPartnerId, ...partnerForm });
    } else {
      await addPartner(partnerForm);
    }
    setPartnerForm({ name: '', logo: 'partner-minisports.svg', website: '', category: 'Government Sector', order: 0, active: true });
    setEditingPartnerId(null);
    setPartnerFormOpen(false);
  };

  const handleEditPartnerClick = (p: Partner) => {
    setPartnerForm({
      name: p.name,
      logo: p.logo,
      website: p.website || '',
      category: p.category || 'Government Sector',
      order: p.order,
      active: p.active
    });
    setEditingPartnerId(p.id);
    setPartnerFormOpen(true);
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSocialId) {
      await updateSocialLink({ id: editingSocialId, ...socialForm });
    } else {
      await addSocialLink(socialForm);
    }
    setSocialForm({ platform: 'facebook', url: '', icon: 'fa-facebook', active: true, order: 0 });
    setEditingSocialId(null);
    setSocialFormOpen(false);
  };

  const handleEditSocialClick = (s: SocialLink) => {
    setSocialForm({
      platform: s.platform,
      url: s.url,
      icon: s.icon,
      active: s.active,
      order: s.order
    });
    setEditingSocialId(s.id);
    setSocialFormOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateContactInfo(contactForm);
    alert('Contact details updated successfully!');
  };

  const handleSaveContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContentKey) return;
    await saveSiteContent(editingContentKey, contentFormValue);
    setEditingContentKey(null);
    setContentFormValue('');
  };

  const handleSectionSave = async (keys: string[]) => {
    try {
      await Promise.all(
        keys.map(k => saveSiteContent(k, siteForm[k] || ''))
      );
      alert('Section content saved to database successfully!');
    } catch (err) {
      console.error(err);
      alert('Error updating some section values.');
    }
  };

  // Searching logic
  const filteredAthletes = athletes.filter(a =>
    a.name.toLowerCase().includes(athleteSearch.toLowerCase()) ||
    a.sport.toLowerCase().includes(athleteSearch.toLowerCase())
  );

  const filteredNews = news.filter(n =>
    n.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
    n.category.toLowerCase().includes(newsSearch.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(eventSearch.toLowerCase())
  );

  const filteredCareers = careers.filter(c =>
    c.title.toLowerCase().includes(careerSearch.toLowerCase())
  );

  const filteredSports = sports.filter(s =>
    s.title.toLowerCase().includes(sportSearch.toLowerCase())
  );

  const filteredLeaders = leadership.filter(l =>
    l.name.toLowerCase().includes(leaderSearch.toLowerCase()) ||
    l.role.toLowerCase().includes(leaderSearch.toLowerCase())
  );

  const filteredSystem = systemComponents.filter(s =>
    s.title.toLowerCase().includes(systemSearch.toLowerCase())
  );

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(partnerSearch.toLowerCase())
  );

  const filteredContent = siteContentList.filter(c =>
    c.key.toLowerCase().includes(contentSearch.toLowerCase()) ||
    c.value.toLowerCase().includes(contentSearch.toLowerCase())
  );

  // Pagination helper
  const paginate = (array: any[], pageNumber: number, pageSize: number) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  };

  const totalPages = (total: number, size: number) => Math.ceil(total / size) || 1;

  return (
    <div className="admin-dashboard-root" style={{ display: 'flex', height: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* ── Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? '260px' : '72px',
        background: '#0F172A',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        flexShrink: 0,
        zIndex: 50,
      }}>
        {/* Logo block */}
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <img src="/assets/img/logo.png" style={{ height: '32px', width: 'auto' }} alt="NPC Logo" />
          {sidebarOpen && <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.5px' }}>NPC DASHBOARD</span>}
        </div>

        {/* Links Navigation */}
        <nav className="dashboard-sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '12px 0', overflowY: 'auto' }}>
          {[
            { id: 'overview', type: 'tab', tabId: 'overview', label: 'Overview', icon: 'fa-chart-pie' },
            { id: 'pages', type: 'page', tabId: 'pages', pageId: null, label: 'Pages CMS Hub', icon: 'fa-file-lines' },
            { id: 'athletes', type: 'page', tabId: 'pages', pageId: 'athletes', label: 'Athletes Directory', icon: 'fa-person-running' },
            { id: 'sports', type: 'page', tabId: 'pages', pageId: 'sports', label: 'Sports Programs', icon: 'fa-volleyball' },
            { id: 'news', type: 'page', tabId: 'pages', pageId: 'news', label: 'News Room', icon: 'fa-newspaper' },
            { id: 'announcements', type: 'page', tabId: 'pages', pageId: 'announcements', label: 'Announcements', icon: 'fa-bullhorn' },
            { id: 'events', type: 'page', tabId: 'pages', pageId: 'events', label: 'Events Scheduler', icon: 'fa-calendar-days' },
            { id: 'governance', type: 'page', tabId: 'pages', pageId: 'governance', label: 'Governance & Policies', icon: 'fa-scale-balanced' },
            { id: 'leadership', type: 'page', tabId: 'pages', pageId: 'leadership', label: 'Leadership Directory', icon: 'fa-users' },
            { id: 'members', type: 'tab', tabId: 'members', label: 'Members Directory', icon: 'fa-users-cog' },
            { id: 'contacts', type: 'tab', tabId: 'contacts', label: 'Inbox Messages', icon: 'fa-envelope' },
            { id: 'settings', type: 'tab', tabId: 'settings', label: 'System Settings', icon: 'fa-sliders' },
          ].map(item => {
            const isActive = item.type === 'tab'
              ? adminTab === item.tabId
              : (adminTab === 'pages' && activeEditPage === item.pageId);

            return (
              <button
                key={item.id}
                onClick={() => {
                  setAdminTab(item.tabId as AdminTab);
                  if (item.type === 'page') {
                    setActiveEditPage(item.pageId || null);
                    setPreviewModeEnabled(false);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: sidebarOpen ? '12px 24px' : '14px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  color: isActive ? '#FFF' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '4px solid #FFA000' : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <i className={`fas ${item.icon}`} style={{ fontSize: '1rem', width: '20px', textAlign: 'center', color: isActive ? '#FFA000' : 'inherit' }} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout & Profile Info */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
              <img 
                src={`/assets/img/${selectedAvatar}`} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', border: '1px solid rgba(255,255,255,0.15)' }} 
                alt="Admin avatar" 
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name || 'Admin'}</span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>System Administrator</span>
              </div>
            </div>
          )}
          <button 
            onClick={handleLogout}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FFA000'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,.7)'}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,.7)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'color 0.2s'
            }}
          >
            <i className="fas fa-sign-out-alt" />
            {sidebarOpen && <span>Logout Account</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Topbar Header */}
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #E2E8F0',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#4A5568' }}>
              <i className="fas fa-bars" />
            </button>
            <h1 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              {adminTab === 'overview' && 'Admin Overview'}
              {adminTab === 'pages' && 'Unified Website Pages CMS'}
              {adminTab === 'volunteers' && 'Volunteer Applications'}
              {adminTab === 'contacts' && 'Inbox Messages & Applications'}
              {adminTab === 'settings' && 'System Settings'}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Inbox bell count & dropdown */}
            {(() => {
              const unreadMsg = contacts.filter(c => !c.read).length;
              const unreadVol = volunteers.filter(v => !v.read).length;
              const unreadDon = donations.filter(d => !d.read).length;
              const totalUnread = unreadMsg + unreadVol + unreadDon;
              return (
                <div style={{ position: 'relative' }} data-bell-dropdown>
                  <button onClick={() => setBellOpen(!bellOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '6px' }}>
                    <i className="far fa-bell text-secondary fa-lg" />
                    {totalUnread > 0 && (
                      <span className="badge bg-danger rounded-circle position-absolute top-0 end-0" style={{ fontSize: '0.62rem', transform: 'translate(2px, -2px)', padding: '3px 6px' }}>
                        {totalUnread}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '40px',
                        right: '0',
                        width: '320px',
                        background: '#ffffff',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        padding: '8px 0',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>Notifications</span>
                        {totalUnread > 0 && <span className="badge bg-danger-subtle text-danger" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{totalUnread} New</span>}
                      </div>
                      
                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {totalUnread === 0 ? (
                          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                            <i className="far fa-bell-slash" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }} />
                            No new notifications
                          </div>
                        ) : (
                          <>
                            {/* Unread contact messages */}
                            {contacts.filter(c => !c.read).map(c => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setAdminTab('contacts');
                                  setInboxSubTab('messages');
                                  setActiveMessage(c);
                                  markContactAsRead(c.id);
                                  setBellOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 16px',
                                  textAlign: 'left',
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: '1px solid #F8FAFC',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0b63b6' }}>Message</span>
                                  <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{c.date}</span>
                                </div>
                                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  From {c.name}
                                </span>
                                <span style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  {c.subject}: {c.message}
                                </span>
                              </button>
                            ))}
                            
                            {/* Unread volunteer applications */}
                            {volunteers.filter(v => !v.read).map(v => (
                              <button
                                key={v.id}
                                onClick={() => {
                                  setAdminTab('contacts');
                                  setInboxSubTab('volunteers');
                                  setActiveVolunteer(v);
                                  markVolunteerAsRead(v.id);
                                  setBellOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 16px',
                                  textAlign: 'left',
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: '1px solid #F8FAFC',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#2e9e57' }}>Volunteer Form</span>
                                  <span style={{ fontSize: '0.65rem', color: '#2e9e57', fontWeight: 600 }}>New</span>
                                </div>
                                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  {v.name}
                                </span>
                                <span style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  Interested in {v.interest}
                                </span>
                              </button>
                            ))}

                            {/* Unread donation inquiries */}
                            {donations.filter(d => !d.read).map(d => (
                              <button
                                key={d.id}
                                onClick={() => {
                                  setAdminTab('contacts');
                                  setInboxSubTab('donations');
                                  setActiveDonation(d);
                                  markDonationAsRead(d.id);
                                  setBellOpen(false);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '10px 16px',
                                  textAlign: 'left',
                                  background: 'transparent',
                                  border: 'none',
                                  borderBottom: '1px solid #F8FAFC',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                  <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#FFD700' }}>Donation inquiry</span>
                                  <span style={{ fontSize: '0.65rem', color: '#FFD700', fontWeight: 600 }}>New</span>
                                </div>
                                <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  {d.name}
                                </span>
                                <span style={{ fontSize: '0.74rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', display: 'block' }}>
                                  Type: {d.supportType} ({d.category})
                                </span>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                      
                      <div style={{ padding: '8px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setAdminTab('contacts');
                            setBellOpen(false);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0b63b6',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          View all inbox notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            <div style={{ borderLeft: '1px solid #E2E8F0', height: '32px' }} />

            {/* Profile avatar dropdown */}
            <div style={{ position: 'relative' }} data-profile-dropdown>
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '4px 8px',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="small fw-semibold text-dark">{profile.name || 'Admin'}</span>
                <img 
                  src={`/assets/img/${selectedAvatar}`} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.08)' }} 
                  alt="Admin avatar" 
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                />
                <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: '#64748B' }} />
              </button>

              {profileDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: '0',
                    width: '240px',
                    background: '#ffffff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    zIndex: 100,
                    padding: '12px 0',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ padding: '0 16px 12px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img 
                      src={`/assets/img/${selectedAvatar}`} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', border: '1px solid rgba(0,0,0,0.08)' }} 
                      alt="Admin avatar" 
                    />
                    <div style={{ minWidth: 0 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name || 'Admin User'}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.email || 'admin@npcrwanda.org'}</span>
                    </div>
                  </div>

                  <div style={{ padding: '4px 0' }}>
                    <button
                      onClick={() => {
                        setAdminTab('profile');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.8rem',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <i className="fas fa-user-cog" style={{ color: '#64748B', width: '16px' }} />
                      Profile Settings
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab('settings');
                        setProfileDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.8rem',
                        color: '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <i className="fas fa-sliders" style={{ color: '#64748B', width: '16px' }} />
                      System Settings
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', padding: '4px 0 0 0', marginTop: '4px' }}>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '0.8rem',
                        color: '#EF4444',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <i className="fas fa-sign-out-alt" style={{ color: '#EF4444', width: '16px' }} />
                      Logout Account
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Content body panel */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* ──────────────────────────────
             TAB: OVERVIEW
             ────────────────────────────── */}
          {adminTab === 'overview' && (
            <div>
              {/* Welcome Panel */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #0b63b6 0%, #0a3f7a 100%)',
                  borderRadius: '16px',
                  padding: '24px 32px',
                  color: '#ffffff',
                  marginBottom: '24px',
                  boxShadow: '0 4px 20px rgba(11, 99, 182, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', right: '-20px', bottom: '-40px', opacity: 0.15, fontSize: '10rem', color: '#fff', pointerEvents: 'none' }}>
                  <i className="fas fa-chart-pie" />
                </div>
                
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                  Welcome back, {profile.name || 'Admin'}!
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)', margin: '0 0 20px 0', maxWidth: '600px', lineHeight: '1.5' }}>
                  Manage the official National Paralympic Committee (NPC) Rwanda portal. Today is {currentDateString || 'Loading date...'}.
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', position: 'relative', zIndex: 2 }}>
                  <button 
                    onClick={() => { setAdminTab('pages'); setActiveEditPage('news'); setNewsFormOpen(true); }}
                    className="btn btn-sm"
                    style={{ background: '#FFD700', color: '#000000', fontWeight: 700, borderRadius: '8px', border: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fas fa-plus" /> Write News Article
                  </button>
                  <button 
                    onClick={() => { setAdminTab('pages'); setActiveEditPage('athletes'); setAthleteFormOpen(true); }}
                    className="btn btn-sm"
                    style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fas fa-user-plus" /> Add Athlete
                  </button>
                  <button 
                    onClick={() => { setAdminTab('pages'); setActiveEditPage('events'); setEventFormOpen(true); }}
                    className="btn btn-sm"
                    style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fas fa-calendar-plus" /> Schedule Event
                  </button>
                   <button 
                    onClick={() => { setAdminTab('pages'); setActiveEditPage('announcements'); }}
                    className="btn btn-sm"
                    style={{ background: 'rgba(255, 255, 255, 0.18)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <i className="fas fa-bullhorn" /> Announcements
                  </button>
                  <a 
                    href="/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-link"
                    style={{ color: '#FFD700', fontWeight: 600, textDecoration: 'none', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}
                  >
                    View Website <i className="fas fa-external-link-alt" />
                  </a>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="row g-4 mb-4">
                {STATS.map(stat => (
                  <div key={stat.label} className="col-sm-6 col-md-4 col-lg-2">
                    <div 
                      style={{ 
                        background: '#ffffff', 
                        borderRadius: '12px', 
                        border: '1px solid #E2E8F0', 
                        padding: '20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: '0.85rem' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.2' }}>{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Two-Column Grid */}
              <div className="row g-4">
                
                {/* Left Column: Recent Activity / Inbox */}
                <div className="col-lg-7">
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Inbox Activity</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Unread messages and inquiries requiring attention</p>
                      </div>
                      <button 
                        onClick={() => setAdminTab('contacts')}
                        className="btn btn-xs btn-outline-primary"
                        style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}
                      >
                        Manage Inbox
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {(() => {
                        const items: { type: 'message' | 'volunteer' | 'donation'; raw: any; date: string; sender: string; title: string; subtitle: string }[] = [];
                        
                        contacts.filter(c => !c.read).slice(0, 3).forEach(c => {
                          items.push({ type: 'message', raw: c, date: c.date, sender: c.name, title: `Message: ${c.subject}`, subtitle: c.message });
                        });
                        volunteers.filter(v => !v.read).slice(0, 3).forEach(v => {
                          items.push({ type: 'volunteer', raw: v, date: 'New Application', sender: v.name, title: `Volunteer Registration`, subtitle: `Interested in ${v.interest}` });
                        });
                        donations.filter(d => !d.read).slice(0, 3).forEach(d => {
                          items.push({ type: 'donation', raw: d, date: 'New Donation', sender: d.name, title: `Donation: ${d.supportType}`, subtitle: `Category: ${d.category}` });
                        });

                        // Sort message items or take top 4
                        const displayItems = items.slice(0, 4);

                        if (displayItems.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                              <i className="far fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: '#CBD5E1' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your inbox is completely clear!</span>
                              <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>No unread messages or applications found.</p>
                            </div>
                          );
                        }

                        return displayItems.map((item, index) => {
                          let badgeBg = '#E0F2FE';
                          let badgeColor = '#0369A1';
                          let icon = 'fa-envelope';
                          if (item.type === 'volunteer') {
                            badgeBg = '#D1FAE5';
                            badgeColor = '#065F46';
                            icon = 'fa-hands-helping';
                          } else if (item.type === 'donation') {
                            badgeBg = '#FEF3C7';
                            badgeColor = '#92400E';
                            icon = 'fa-hand-holding-usd';
                          }

                          return (
                            <div 
                              key={index}
                              onClick={() => {
                                setAdminTab('contacts');
                                if (item.type === 'message') {
                                  setInboxSubTab('messages');
                                  setActiveMessage(item.raw);
                                  markContactAsRead(item.raw.id);
                                } else if (item.type === 'volunteer') {
                                  setInboxSubTab('volunteers');
                                  setActiveVolunteer(item.raw);
                                  markVolunteerAsRead(item.raw.id);
                                } else if (item.type === 'donation') {
                                  setInboxSubTab('donations');
                                  setActiveDonation(item.raw);
                                  markDonationAsRead(item.raw.id);
                                }
                              }}
                              style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                padding: '14px', 
                                border: '1px solid #E8ECF0', 
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: '#FFFFFF'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)';
                                e.currentTarget.style.backgroundColor = '#F8FAFC';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#E8ECF0';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.backgroundColor = '#FFFFFF';
                              }}
                            >
                              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: badgeBg, color: badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas ${icon}`} style={{ fontSize: '1.1rem' }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '2px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>{item.sender}</span>
                                  <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>{item.date}</span>
                                </div>
                                <h4 style={{ fontSize: '0.8rem', fontWeight: 600, color: badgeColor, margin: '0 0 2px 0' }}>{item.title}</h4>
                                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.subtitle}</p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

                {/* Right Column: Upcoming Events & System */}
                <div className="col-lg-5">
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Upcoming Events Schedule</h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Training and national sports events</p>
                      </div>
                      <button 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('events'); }}
                        className="btn btn-xs btn-outline-primary"
                        style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}
                      >
                        Manage Events
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                      {(() => {
                        const upcoming = events.slice(0, 3);
                        if (upcoming.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <i className="far fa-calendar-times" style={{ fontSize: '2.5rem', marginBottom: '12px', color: '#CBD5E1' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No upcoming events scheduled</span>
                              <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Add new events in the Events tab.</p>
                            </div>
                          );
                        }

                        return upcoming.map((ev, index) => {
                          const evDate = new Date(ev.date);
                          const day = evDate.getDate() || '??';
                          const monthStr = evDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() || 'M';
                          
                          return (
                            <div key={ev.id} style={{ display: 'flex', gap: '14px', alignItems: 'center', borderBottom: index < upcoming.length - 1 ? '1px dashed #E2E8F0' : 'none', paddingBottom: index < upcoming.length - 1 ? '12px' : 0 }}>
                              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#0b63b6', lineHeight: 1 }}>{monthStr}</span>
                                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{day}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ev.category === 'International' ? '#CF2F3B' : '#0b63b6', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                                  {ev.category} {ev.featured && '• Featured'}
                                </span>
                                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{ev.title}</h4>
                                <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <i className="fas fa-map-marker-alt" style={{ fontSize: '0.7rem' }} /> {ev.location}
                                </span>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ──────────────────────────────
             TAB: PAGES CMS
             ────────────────────────────── */}
          {adminTab === 'pages' && (
            <div>
              {/* Back button header if editing a page */}
              {activeEditPage !== null && (
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white border rounded">
                  <div className="d-flex align-items-center gap-3">
                    <button 
                      onClick={() => { setActiveEditPage(null); setPreviewModeEnabled(false); }} 
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="fas fa-arrow-left me-1" /> Back to Pages
                    </button>
                    <h3 className="h6 fw-bold mb-0 text-dark">
                      Editing Page: <span className="text-primary text-capitalize">{activeEditPage === 'about' ? 'About Us' : activeEditPage} Page</span>
                    </h3>
                  </div>
                  <div className="d-flex gap-2">
                    {/* Live Preview Toggle */}
                    <button 
                      type="button" 
                      onClick={() => setPreviewModeEnabled(!previewModeEnabled)} 
                      className={`btn btn-sm ${previewModeEnabled ? 'btn-success' : 'btn-outline-success'} fw-semibold`}
                    >
                      <i className="fas fa-eye me-1" /> {previewModeEnabled ? 'Edit Form' : 'Live Preview'}
                    </button>
                    {/* Save section buttons trigger based on active edit page */}
                    {['home', 'about', 'npc-background'].includes(activeEditPage) && (
                      <button 
                        type="button" 
                        onClick={() => {
                          if (activeEditPage === 'home') {
                            handleSectionSave(['hero.kicker', 'hero.title1', 'hero.title2', 'hero.lead', 'hero.image', 'hero.stat1.title', 'hero.stat1.desc', 'hero.stat2.title', 'hero.stat2.desc', 'hero.stat3.title', 'hero.stat3.desc', 'hero.stat4.title', 'hero.stat4.desc', 'stats.districts', 'stats.disciplines', 'stats.founded', 'stats.clubs', 'about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'cta.title', 'cta.desc']);
                          } else if (activeEditPage === 'about') {
                            handleSectionSave(['about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'about.heroImage', 'about.historyImage', 'about.historyParagraph1', 'about.historyParagraph2', 'about.vision', 'about.mission', 'about.value.phrase.Courage', 'about.value.phrase.Determination', 'about.value.phrase.Equality', 'about.value.phrase.Inspiration', 'about.value.phrase.Empowerment', 'about.value.phrase.Intersectionality', 'about.objective.phrase.Athlete Excellence', 'about.objective.phrase.Grassroots Development', 'about.objective.phrase.Safeguarding & Governance', 'about.objective.phrase.Partnership Growth']);
                          } else if (activeEditPage === 'npc-background') {
                            handleSectionSave(['background.governingText', 'background.tocText', 'background.strengths', 'background.weaknesses', 'background.opportunities', 'background.threats', 'background.pillar1', 'background.pillar2', 'background.pillar3', 'background.pillar4']);
                          }
                        }}
                        className="btn btn-sm btn-primary fw-semibold px-4"
                      >
                        <i className="fas fa-save me-1" /> Save Page Content
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 1. Pages Listing Index Catalog */}
              {activeEditPage === null && (
                <div>
                  <div className="row g-4">
                    {[
                      { id: 'home', title: 'Home Page', desc: 'Manage hero banner, impact stats, about section, CTA, and partner logos grid.', icon: 'fa-home', bg: '#eff6ff', border: '#bfdbfe' },
                      { id: 'about', title: 'About Us Page', desc: 'Edit vision, mission, organization history details, core values, and strategic plan objectives.', icon: 'fa-circle-info', bg: '#f0fdf4', border: '#bbf7d0' },
                      { id: 'npc-background', title: 'NPC Background Page', desc: 'Edit strategic objectives, SWOT analysis parameters, and Theory of Change.', icon: 'fa-circle-info', bg: '#f0fdf4', border: '#bbf7d0' },
                      { id: 'leadership', title: 'Leadership Page', desc: 'Manage board of directors, internal audit committees, and conflict resolution boards.', icon: 'fa-users', bg: '#fffbeb', border: '#fde68a' },
                      { id: 'athletes', title: 'Athletes Page', desc: 'Manage national para-athletes profiles, sport classifications, and display stats.', icon: 'fa-person-running', bg: '#fdf2f8', border: '#fbcfe8' },
                      { id: 'sports', title: 'Sports Programs', icon: 'fa-volleyball', desc: 'Configure sitting volleyball, wheelchair basketball, and goalball program highlights.', bg: '#f5f3ff', border: '#ddd6fe' },
                      { id: 'news', title: 'News Room', icon: 'fa-newspaper', desc: 'Write articles and event blog posts with the visual Markdown rich-text editor.', bg: '#ecfdf5', border: '#a7f3d0' },
                      { id: 'announcements', title: 'Announcements Page', desc: 'Configure header titles, subtitles, and view current public notifications.', icon: 'fa-bullhorn', bg: '#fef2f2', border: '#fecaca' },
                      { id: 'events', title: 'Events Calendar', icon: 'fa-calendar-days', desc: 'Schedule matches, championships, training camps, and featured event details.', bg: '#fef2f2', border: '#fecaca' },
                      { id: 'careers', title: 'Careers & Vacancies', icon: 'fa-briefcase', desc: 'Manage job vacancies, volunteer registrations, and applicant logs.', bg: '#f0fdfa', border: '#99f6e4' },
                      { id: 'contact', title: 'Contact & Footer', icon: 'fa-address-card', desc: 'Edit physical address, contact phone/email, map embeds, and footer social links.', bg: '#fafaf9', border: '#e7e5e4' },
                      { id: 'governance', title: 'Governance & Policies', icon: 'fa-scale-balanced', desc: 'Edit strategic plans, constitution document assets, and official policy manuals.', bg: '#f8fafc', border: '#cbd5e1' },
                      { id: 'partners', title: 'Partners & Sponsors', icon: 'fa-handshake', desc: 'Manage sponsors list, Ministry of Sports logos, and corporate partners URLs.', bg: '#fff7ed', border: '#fed7aa' },
                      { id: 'system', title: 'System Components', icon: 'fa-gears', desc: 'Define translation tags and metadata keys for the system components registry.', bg: '#f0fdfa', border: '#99f6e4' }
                    ].map(p => (
                      <div key={p.id} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0" style={{ border: `1px solid ${p.border}`, borderRadius: '12px', background: p.bg }}>
                          <div className="card-body p-4 d-flex flex-column justify-content-between">
                            <div>
                              <div className="d-flex align-items-center justify-content-between mb-3">
                                <span className="small text-muted fw-bold uppercase">PAGE CONFIG</span>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', border: `1px solid ${p.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className={`fas ${p.icon} text-primary`} />
                                </div>
                              </div>
                              <h4 className="h5 fw-bold text-dark mb-2">{p.title}</h4>
                              <p className="small text-muted mb-4">{p.desc}</p>
                            </div>
                            <button 
                              onClick={() => { setActiveEditPage(p.id); setPreviewModeEnabled(false); }} 
                              className="btn btn-primary btn-sm fw-bold py-2 px-4 w-auto align-self-start"
                              style={{ borderRadius: '8px' }}
                            >
                              <i className="fas fa-edit me-1" /> Edit Page Layout
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Visual rendering mockup based on page */}
              {activeEditPage !== null && previewModeEnabled && (
                <div className="bg-light p-3 rounded border">
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                    <span className="small fw-bold text-success"><i className="fas fa-circle-play me-2" />Live Mockup Preview Mode</span>
                    <button onClick={() => setPreviewModeEnabled(false)} className="btn btn-xs btn-outline-secondary">Exit Preview</button>
                  </div>
                  
                  {activeEditPage === 'home' && (
                    <div className="border rounded bg-white overflow-hidden shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      {/* Hero Section Mockup */}
                      <div style={{ 
                        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${siteForm['hero.image']?.startsWith('/') || siteForm['hero.image']?.startsWith('http') ? siteForm['hero.image'] : `/uploads/${siteForm['hero.image'] || 'home-hero.jpg'}`})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        padding: '80px 40px',
                        color: '#fff',
                        textAlign: 'center'
                      }}>
                        <span style={{ color: '#FFA000', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>{siteForm['hero.kicker']}</span>
                        <h2 className="display-6 fw-bold mt-2 mb-0" style={{ color: '#fff' }}>{siteForm['hero.title1']}</h2>
                        <h2 className="display-6 fw-bold text-primary mt-1">{siteForm['hero.title2']}</h2>
                        <p className="lead mx-auto mt-3 mb-4" style={{ maxWidth: '600px', fontSize: '1rem', color: '#cbd5e1' }}>{siteForm['hero.lead']}</p>
                        <button className="btn btn-primary px-4 py-2 fw-bold" style={{ borderRadius: '8px' }}>Explore Programs</button>
                      </div>

                      {/* Stats Strip Mockup */}
                      <div className="bg-primary text-white p-3 text-center">
                        <div className="row g-2 justify-content-center">
                          <div className="col-3">
                            <h4 className="fw-bold mb-0">{siteForm['stats.districts']}</h4>
                            <span className="xsmall text-light">Districts</span>
                          </div>
                          <div className="col-3 border-start">
                            <h4 className="fw-bold mb-0">{siteForm['stats.disciplines']}</h4>
                            <span className="xsmall text-light">Disciplines</span>
                          </div>
                          <div className="col-3 border-start">
                            <h4 className="fw-bold mb-0">{siteForm['stats.founded']}</h4>
                            <span className="xsmall text-light">Founded</span>
                          </div>
                          <div className="col-3 border-start">
                            <h4 className="fw-bold mb-0">{siteForm['stats.clubs']}</h4>
                            <span className="xsmall text-light">Member Clubs</span>
                          </div>
                        </div>
                      </div>

                      {/* About Section Mockup */}
                      <div className="p-5 row g-4 align-items-center">
                        <div className="col-md-6">
                          <span className="text-primary small fw-bold uppercase">{siteForm['about.eyebrow'] || 'Who We Are'}</span>
                          <h3 className="fw-bold text-dark mt-2 mb-3">{siteForm['about.previewTitle']}</h3>
                          <p className="small text-muted">{siteForm['about.previewText']}</p>
                          <div className="mt-3">
                            <div className="d-flex align-items-center gap-2 mb-2"><i className="fas fa-check text-success" /><span className="small">{siteForm['about.bullet1']}</span></div>
                            <div className="d-flex align-items-center gap-2 mb-2"><i className="fas fa-check text-success" /><span className="small">{siteForm['about.bullet2']}</span></div>
                            <div className="d-flex align-items-center gap-2"><i className="fas fa-check text-success" /><span className="small">{siteForm['about.bullet3']}</span></div>
                          </div>
                        </div>
                        <div className="col-md-6 text-center">
                          <img 
                            src={siteForm['about.previewImage']?.startsWith('/') || siteForm['about.previewImage']?.startsWith('http') ? siteForm['about.previewImage'] : `/uploads/${siteForm['about.previewImage'] || 'about-hero.jpg'}`} 
                            className="img-fluid rounded shadow-sm" 
                            style={{ maxHeight: '200px', objectFit: 'cover' }}
                            alt="" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'about' && (
                    <div className="border rounded bg-white overflow-hidden shadow p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">About NPC Rwanda</h2>
                        <span className="small text-muted">Vision, Mission & History Statement Mockup</span>
                      </div>

                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100" style={{ background: '#f8fafc' }}>
                            <span className="badge bg-primary mb-2">VISION</span>
                            <div className="small text-dark fw-semibold" dangerouslySetInnerHTML={{ __html: siteForm['about.vision'] || '' }} />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100" style={{ background: '#f8fafc' }}>
                            <span className="badge bg-success mb-2">MISSION</span>
                            <div className="small text-dark" dangerouslySetInnerHTML={{ __html: siteForm['about.mission'] || '' }} />
                          </div>
                        </div>
                      </div>

                      <div className="row g-4 align-items-center">
                        <div className="col-md-6">
                          <h4 className="fw-bold mb-3">Our History</h4>
                          <div className="small text-muted mb-2" dangerouslySetInnerHTML={{ __html: siteForm['about.historyParagraph1'] || '' }} />
                          <div className="small text-muted" dangerouslySetInnerHTML={{ __html: siteForm['about.historyParagraph2'] || '' }} />
                        </div>
                        <div className="col-md-6 text-center">
                          <img 
                            src={siteForm['about.historyImage']?.startsWith('/') || siteForm['about.historyImage']?.startsWith('http') ? siteForm['about.historyImage'] : `/uploads/${siteForm['about.historyImage'] || 'about-history.jpg'}`} 
                            className="img-fluid rounded" 
                            style={{ maxHeight: '180px', objectFit: 'cover' }}
                            alt="" 
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'leadership' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Our Leadership</h2>
                        <span className="small text-muted">NPC Rwanda Board of Directors & Committees Mockup</span>
                      </div>
                      <div className="row g-4 justify-content-center">
                        {leadership.map(l => (
                          <div key={l.id} className="col-sm-6 col-md-4">
                            <div className="border rounded p-3 text-center bg-white h-100 shadow-sm">
                              <img 
                                src={`/assets/img/${l.avatar || 'avatar-4.svg'}`} 
                                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', marginBottom: '12px' }} 
                                alt={l.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-4.svg'; }}
                              />
                              <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>{l.name}</h5>
                              <span className="badge bg-primary mb-2" style={{ fontSize: '0.7rem' }}>{l.role}</span>
                              <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>{l.desc}</p>
                              {l.committee && <div className="mt-2 text-secondary small fw-semibold" style={{ fontSize: '0.7rem' }}>{l.committee}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'athletes' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">National Para-Athletes</h2>
                        <span className="small text-muted">Elite representatives of Rwanda Paralympic sports Mockup</span>
                      </div>
                      <div className="row g-3">
                        {athletes.map(a => (
                          <div key={a.id} className="col-sm-6 col-md-3">
                            <div className="border rounded p-3 text-center h-100 bg-white shadow-sm">
                              <img 
                                src={`/assets/img/${a.avatar || 'avatar-1.svg'}`} 
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', background: '#F1F5F9', marginBottom: '10px' }} 
                                alt={a.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                              />
                              <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>{a.name}</h5>
                              <span className="badge bg-success mb-2" style={{ fontSize: '0.65rem' }}>{a.sport}</span>
                              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                <span>Country: {a.country}</span> • <span className={a.status === 'Active' ? 'text-success fw-bold' : 'text-danger'}>{a.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'sports' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Sports Disciplines</h2>
                        <span className="small text-muted">Paralympic sports disciplines supported by NPC Rwanda Mockup</span>
                      </div>
                      <div className="row g-4">
                        {sports.map(s => (
                          <div key={s.id} className="col-md-4">
                            <div className="border rounded overflow-hidden bg-white h-100 shadow-sm">
                              <img 
                                src={s.img?.startsWith('/') || s.img?.startsWith('http') ? s.img : `/assets/img/curated/${s.img || 'index-sport-1.jpg'}`} 
                                style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                                alt={s.title}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/sports-action.svg'; }}
                              />
                              <div className="p-3">
                                <h5 className="fw-bold text-dark mb-2">{s.title}</h5>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>{s.desc}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'news' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Latest News & Press Releases</h2>
                        <span className="small text-muted">Updates from NPC Rwanda sports press desk Mockup</span>
                      </div>
                      <div className="row g-4">
                        {news.map(n => (
                          <div key={n.id} className="col-md-4">
                            <div className="border rounded overflow-hidden bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                              <div>
                                <img 
                                  src={n.img?.startsWith('/') || n.img?.startsWith('http') ? n.img : `/assets/img/curated/${n.img || 'news-volleyball.jpg'}`} 
                                  style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                                  alt={n.title}
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/news-feature.svg'; }}
                                />
                                <div className="p-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>{n.category}</span>
                                    <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{n.date}</span>
                                  </div>
                                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>{n.title}</h5>
                                  <p className="small text-muted" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc}</p>
                                </div>
                              </div>
                              <div className="p-3 border-top bg-light text-end">
                                <span className={`badge ${n.status === 'Published' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>{n.status}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'announcements' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Latest Announcements & Updates</h2>
                        <span className="small text-muted">Stay informed with the latest notices, alerts, and official releases Mockup</span>
                      </div>
                      <div className="row g-4">
                        {news.filter(n => n.status === 'Published' || !n.status).map(n => (
                          <div key={n.id} className="col-md-4">
                            <div className="border rounded overflow-hidden bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                              <div>
                                <img 
                                  src={n.img?.startsWith('/') || n.img?.startsWith('http') ? n.img : `/assets/img/curated/${n.img || 'news-volleyball.jpg'}`} 
                                  style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                                  alt={n.title}
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/news-feature.svg'; }}
                                />
                                <div className="p-3">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>Announcement</span>
                                    <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{n.date}</span>
                                  </div>
                                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '0.95rem' }}>{n.title}</h5>
                                  <p className="small text-muted" style={{ fontSize: '0.78rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'events' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Events Calendar</h2>
                        <span className="small text-muted">Upcoming competitions, qualifiers, and assemblies Mockup</span>
                      </div>
                      <div className="row g-3">
                        {events.map(ev => (
                          <div key={ev.id} className="col-md-6">
                            <div className="border rounded p-3 bg-white h-100 shadow-sm d-flex gap-3 align-items-center">
                              <img 
                                src={ev.img?.startsWith('/') || ev.img?.startsWith('http') ? ev.img : `/assets/img/curated/${ev.img || 'sports-hero.jpg'}`} 
                                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }} 
                                alt={ev.title}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/sports-action.svg'; }}
                              />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <span className={`badge ${ev.category === 'International' ? 'bg-danger' : 'bg-primary'}`} style={{ fontSize: '0.6rem' }}>{ev.category}</span>
                                  <span className="small text-muted" style={{ fontSize: '0.7rem' }}>{ev.date}</span>
                                </div>
                                <h5 className="fw-bold text-dark mb-1 text-truncate" style={{ fontSize: '0.9rem' }}>{ev.title}</h5>
                                <p className="small text-muted text-truncate mb-1" style={{ fontSize: '0.75rem' }}>{ev.description}</p>
                                <span className="small text-secondary" style={{ fontSize: '0.72rem' }}>
                                  <i className="fas fa-map-marker-alt me-1" /> {ev.location}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'careers' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Careers & Opportunities</h2>
                        <span className="small text-muted">Join the team at NPC Rwanda organization Mockup</span>
                      </div>
                      <div className="row g-3">
                        {careers.map(c => (
                          <div key={c.id} className="col-md-6">
                            <div className="border rounded p-3 bg-white h-100 shadow-sm d-flex justify-content-between align-items-center">
                              <div>
                                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '0.95rem' }}>{c.title}</h5>
                                <span className="small text-secondary" style={{ fontSize: '0.75rem' }}>
                                  <i className="fas fa-map-marker-alt me-1" /> {c.location}
                                </span>
                                <div className="mt-2 text-muted small" style={{ fontSize: '0.72rem' }}>
                                  Applicants registered: <strong>{c.applicants}</strong>
                                </div>
                              </div>
                              <span className={`badge ${c.status === 'Open' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '0.7rem' }}>{c.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'contact' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Contact Information</h2>
                        <span className="small text-muted">Get in touch with the secretariat Mockup</span>
                      </div>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-light">
                            <h5 className="fw-bold text-dark mb-3"><i className="fas fa-address-book text-primary me-2" />Office Details</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Physical Address</span>
                                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{contactForm.address || contactInfo?.address || 'Amahoro Stadium, Kigali'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Phone Number</span>
                                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{contactForm.phone || contactInfo?.phone || '+250 788 123 456'}</span>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', display: 'block', textTransform: 'uppercase' }}>Email Address</span>
                                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{contactForm.email || contactInfo?.email || 'info@npcrwanda.org'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-light d-flex flex-column justify-content-between">
                            <h5 className="fw-bold text-dark mb-3"><i className="fas fa-map-marked-alt text-success me-2" />Office Location Map</h5>
                            <div style={{ flex: 1, minHeight: '120px', background: '#E2E8F0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.75rem', padding: '16px', textAlign: 'center' }}>
                              {contactForm.mapUrl || contactInfo?.mapUrl ? (
                                <div>
                                  <i className="fas fa-map-location-dot fa-2x mb-2 text-primary" />
                                  <span className="d-block text-truncate" style={{ maxWidth: '300px' }}>{contactForm.mapUrl || contactInfo?.mapUrl}</span>
                                </div>
                              ) : (
                                'No location map link configured.'
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'governance' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Governance Documents & Policies</h2>
                        <span className="small text-muted">Legal constitution, bylaws, strategic plans, and policy archives Mockup</span>
                      </div>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fas fa-file-pdf me-2" />Key Documents ({govDocs.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {govDocs.map(doc => (
                              <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block' }} className="text-truncate">{doc.title}</span>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{doc.desc}</span>
                                </div>
                                <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>PDF</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-scale-balanced me-2" />Official Policies ({govPolicies.length})</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {govPolicies.map(pol => (
                              <div key={pol.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block' }} className="text-truncate">{pol.title}</span>
                                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{pol.desc}</span>
                                </div>
                                <span className="badge bg-success" style={{ fontSize: '0.65rem' }}>Bylaws</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'partners' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">Sponsors & Corporate Partners</h2>
                        <span className="small text-muted">Ministry of Sports, APC, IPC, and global federation partners Mockup</span>
                      </div>
                      <div className="row g-4 justify-content-center align-items-center">
                        {partners.map(p => (
                          <div key={p.id} className="col-6 col-sm-4 col-md-3 text-center">
                            <div className="border rounded p-3 bg-light h-100 shadow-sm" style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <img 
                                src={`/assets/img/${p.logo || 'partner-minisports.svg'}`} 
                                style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain', filter: p.active ? 'none' : 'grayscale(1)' }} 
                                alt={p.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/partner-minisports.svg'; }}
                              />
                              <h5 className="fw-bold text-dark mt-2 mb-0" style={{ fontSize: '0.8rem' }}>{p.name}</h5>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'system' && (
                    <div className="border rounded bg-white p-4 shadow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">System Translation & Metadata Components</h2>
                        <span className="small text-muted">System keys mapping directory Mockup</span>
                      </div>
                      <div className="table-responsive bg-white rounded border shadow-sm">
                        <table className="table table-hover mb-0 align-middle">
                          <thead>
                            <tr>
                              <th>Title Key</th>
                              <th>Description Translation Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {systemComponents.map(s => (
                              <tr key={s.id}>
                                <td className="fw-bold text-primary">{s.title}</td>
                                <td className="small text-muted">{s.desc}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Page Form Editors */}
              {activeEditPage !== null && !previewModeEnabled && (
                <div>
                  {/* HOME PAGE EDITOR */}
                  {activeEditPage === 'home' && (
                    <div>
                      {/* Hero Section */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fas fa-star me-2" />Hero Banner Section</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Hero Kicker</label>
                              <input type="text" className="form-control" value={siteForm['hero.kicker'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.kicker': e.target.value })} />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Hero Title Line 1</label>
                              <input type="text" className="form-control" value={siteForm['hero.title1'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.title1': e.target.value })} />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-bold">Hero Title Line 2</label>
                              <input type="text" className="form-control" value={siteForm['hero.title2'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.title2': e.target.value })} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <CMSImageField 
                              label="Hero Background Image" 
                              value={siteForm['hero.image'] || ''} 
                              onChange={(url) => setSiteForm({ ...siteForm, 'hero.image': url })}
                              openMediaSelector={openMediaSelector}
                              uploadMediaFile={uploadMediaFile}
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Hero Lead text</label>
                            <textarea className="form-control" rows={2} value={siteForm['hero.lead'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.lead': e.target.value })} />
                          </div>
                        </div>

                        <hr className="my-4" />
                        <h5 className="small fw-bold text-muted mb-3">Hero Stat items (Quick Info block):</h5>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Stat 1 Title & Description</label>
                            <input type="text" className="form-control mb-2" value={siteForm['hero.stat1.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat1.title': e.target.value })} />
                            <input type="text" className="form-control form-control-sm" value={siteForm['hero.stat1.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat1.desc': e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Stat 2 Title & Description</label>
                            <input type="text" className="form-control mb-2" value={siteForm['hero.stat2.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat2.title': e.target.value })} />
                            <input type="text" className="form-control form-control-sm" value={siteForm['hero.stat2.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat2.desc': e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Stat 3 Title & Description</label>
                            <input type="text" className="form-control mb-2" value={siteForm['hero.stat3.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat3.title': e.target.value })} />
                            <input type="text" className="form-control form-control-sm" value={siteForm['hero.stat3.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat3.desc': e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Stat 4 Title & Description</label>
                            <input type="text" className="form-control mb-2" value={siteForm['hero.stat4.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat4.title': e.target.value })} />
                            <input type="text" className="form-control form-control-sm" value={siteForm['hero.stat4.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.stat4.desc': e.target.value })} />
                          </div>
                        </div>
                      </div>

                      {/* Impact Snapshot Section */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fas fa-chart-line me-2" />Impact Snapshot Section</h4>
                        <div className="row g-3 mb-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Impact Eyebrow</label>
                            <input type="text" className="form-control" value={siteForm['impact.eyebrow'] || ''} onChange={e => setSiteForm({ ...siteForm, 'impact.eyebrow': e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Impact Title</label>
                            <input type="text" className="form-control" value={siteForm['impact.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'impact.title': e.target.value })} />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Impact Description</label>
                            <textarea className="form-control" rows={2} value={siteForm['impact.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'impact.desc': e.target.value })} />
                          </div>
                        </div>
                        <hr />
                        <h5 className="small fw-bold text-muted mb-3">Counters numerical values:</h5>
                        <div className="row g-3">
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Districts Count</label>
                            <input type="text" className="form-control" value={siteForm['stats.districts'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.districts': e.target.value })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Disciplines Count</label>
                            <input type="text" className="form-control" value={siteForm['stats.disciplines'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.disciplines': e.target.value })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Founded Year</label>
                            <input type="text" className="form-control" value={siteForm['stats.founded'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.founded': e.target.value })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Member Clubs</label>
                            <input type="text" className="form-control" value={siteForm['stats.clubs'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.clubs': e.target.value })} />
                          </div>
                        </div>
                      </div>

                      {/* About Preview Section */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fas fa-circle-info me-2" />About Preview Section</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <div className="mb-3">
                              <label className="form-label small fw-bold">About Eyebrow</label>
                              <input type="text" className="form-control" value={siteForm['about.eyebrow'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.eyebrow': e.target.value })} />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-bold">About Preview Title</label>
                              <input type="text" className="form-control" value={siteForm['about.previewTitle'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.previewTitle': e.target.value })} />
                            </div>
                          </div>
                          <div className="col-md-6">
                            <CMSImageField 
                              label="About Preview Side Image" 
                              value={siteForm['about.previewImage'] || ''} 
                              onChange={(url) => setSiteForm({ ...siteForm, 'about.previewImage': url })}
                              openMediaSelector={openMediaSelector}
                              uploadMediaFile={uploadMediaFile}
                            />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label small fw-bold">About Preview text</label>
                            <textarea className="form-control" rows={3} value={siteForm['about.previewText'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.previewText': e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Bullet item 1</label>
                            <input type="text" className="form-control" value={siteForm['about.bullet1'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.bullet1': e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Bullet item 2</label>
                            <input type="text" className="form-control" value={siteForm['about.bullet2'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.bullet2': e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Bullet item 3</label>
                            <input type="text" className="form-control" value={siteForm['about.bullet3'] || ''} onChange={e => setSiteForm({ ...siteForm, 'about.bullet3': e.target.value })} />
                          </div>
                        </div>
                      </div>

                      {/* CTA Section Banner */}
                      <div className="custom-card p-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fas fa-bullhorn me-2" />CTA Banner Section</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">CTA Title</label>
                            <input type="text" className="form-control" value={siteForm['cta.title'] || ''} onChange={e => setSiteForm({ ...siteForm, 'cta.title': e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">CTA Description</label>
                            <input type="text" className="form-control" value={siteForm['cta.desc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'cta.desc': e.target.value })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ABOUT US PAGE EDITOR */}
                  {activeEditPage === 'about' && (
                    <div>
                      {/* Hero Image */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-image me-2" />About Page Hero Background</h4>
                        <div className="col-md-6">
                          <CMSImageField 
                            label="Hero Header Background" 
                            value={siteForm['about.heroImage'] || ''} 
                            onChange={(url) => setSiteForm({ ...siteForm, 'about.heroImage': url })}
                            openMediaSelector={openMediaSelector}
                            uploadMediaFile={uploadMediaFile}
                          />
                        </div>
                      </div>

                      {/* Vision & Mission */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-eye me-2" />Vision & Mission Statements</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <RichTextEditor 
                              value={siteForm['about.vision'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.vision': val })} 
                              label="Vision Statement" 
                              openMediaSelector={openMediaSelector}
                            />
                          </div>
                          <div className="col-md-6">
                            <RichTextEditor 
                              value={siteForm['about.mission'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.mission': val })} 
                              label="Mission Statement" 
                              openMediaSelector={openMediaSelector}
                            />
                          </div>
                        </div>
                      </div>

                      {/* History Section */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-clock-rotate-left me-2" />History Section</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <RichTextEditor 
                              value={siteForm['about.historyParagraph1'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.historyParagraph1': val })} 
                              label="History Paragraph 1" 
                              openMediaSelector={openMediaSelector}
                            />
                            <RichTextEditor 
                              value={siteForm['about.historyParagraph2'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.historyParagraph2': val })} 
                              label="History Paragraph 2" 
                              openMediaSelector={openMediaSelector}
                            />
                          </div>
                          <div className="col-md-6">
                            <CMSImageField 
                              label="History Illustration Image" 
                              value={siteForm['about.historyImage'] || ''} 
                              onChange={(url) => setSiteForm({ ...siteForm, 'about.historyImage': url })}
                              openMediaSelector={openMediaSelector}
                              uploadMediaFile={uploadMediaFile}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Core Values */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-heart me-2" />Core Organizational Values</h4>
                        <div className="row g-3">
                          {['Courage', 'Determination', 'Equality', 'Inspiration', 'Empowerment', 'Intersectionality'].map(valueKey => (
                            <div key={valueKey} className="col-md-6 col-lg-4">
                              <label className="form-label small fw-bold">{valueKey}</label>
                              <textarea className="form-control form-control-sm" rows={2} value={siteForm[`about.value.phrase.${valueKey}`] || ''} onChange={e => setSiteForm({ ...siteForm, [`about.value.phrase.${valueKey}`]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strategic Objectives */}
                      <div className="custom-card p-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-crosshairs me-2" />Strategic Plan Objectives</h4>
                        <div className="row g-3">
                          {['Athlete Excellence', 'Grassroots Development', 'Safeguarding & Governance', 'Partnership Growth'].map(objKey => (
                            <div key={objKey} className="col-md-6">
                              <label className="form-label small fw-bold">{objKey}</label>
                              <textarea className="form-control form-control-sm" rows={2} value={siteForm[`about.objective.phrase.${objKey}`] || ''} onChange={e => setSiteForm({ ...siteForm, [`about.objective.phrase.${objKey}`]: e.target.value })} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditPage === 'npc-background' && (
                    <div>
                      {/* Structure & Theory of Change */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-sitemap me-2" />Structures & Theory of Change</h4>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label small fw-bold">Governing Board & Management Structure Intro</label>
                            <textarea className="form-control" rows={3} value={siteForm['background.governingText'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.governingText': e.target.value })} />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Theory of Change Description</label>
                            <textarea className="form-control" rows={3} value={siteForm['background.tocText'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.tocText': e.target.value })} />
                          </div>
                        </div>
                      </div>

                      {/* SWOT Analysis */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-arrow-trend-up me-2" />SWOT Analysis (One item per line)</h4>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Strengths</label>
                            <textarea className="form-control text-sm" rows={5} value={siteForm['background.strengths'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.strengths': e.target.value })} placeholder="Strengths..." />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Weaknesses</label>
                            <textarea className="form-control text-sm" rows={5} value={siteForm['background.weaknesses'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.weaknesses': e.target.value })} placeholder="Weaknesses..." />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Opportunities</label>
                            <textarea className="form-control text-sm" rows={5} value={siteForm['background.opportunities'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.opportunities': e.target.value })} placeholder="Opportunities..." />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Threats</label>
                            <textarea className="form-control text-sm" rows={5} value={siteForm['background.threats'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.threats': e.target.value })} placeholder="Threats..." />
                          </div>
                        </div>
                      </div>

                      {/* Pillars Objectives */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-success"><i className="fas fa-crosshairs me-2" />Pillar Objectives (One objective per line)</h4>
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label small fw-bold">Pillar 1: Promotion & Participation</label>
                            <textarea className="form-control text-sm" rows={4} value={siteForm['background.pillar1'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.pillar1': e.target.value })} placeholder="Pillar 1 Objectives..." />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Pillar 2: Performance & Competitions</label>
                            <textarea className="form-control text-sm" rows={4} value={siteForm['background.pillar2'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.pillar2': e.target.value })} placeholder="Pillar 2 Objectives..." />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Pillar 3: Capacity & Professional Development</label>
                            <textarea className="form-control text-sm" rows={4} value={siteForm['background.pillar3'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.pillar3': e.target.value })} placeholder="Pillar 3 Objectives..." />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Pillar 4: Strategic Partnerships & Diplomacy</label>
                            <textarea className="form-control text-sm" rows={4} value={siteForm['background.pillar4'] || ''} onChange={e => setSiteForm({ ...siteForm, 'background.pillar4': e.target.value })} placeholder="Pillar 4 Objectives..." />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LEADERSHIP PAGE EDITOR */}
                  {activeEditPage === 'leadership' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Leadership Directory ({leadership.length})</h3>
                        <button
                          onClick={() => {
                            setEditingLeaderId(null);
                            setLeaderForm({ name: '', role: 'President', desc: '', avatar: 'avatar-4.svg', committee: 'Board of Directors', email: '', phone: '', impairment: '' });
                            setLeaderFormOpen(!leaderFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-4"
                        >
                          <i className="fas fa-plus me-1" /> New Committee Member
                        </button>
                      </div>

                      {leaderFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingLeaderId ? 'Edit Profile' : 'Register Member'}</h4>
                          <form onSubmit={handleLeaderSubmit} className="row g-3">
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Name</label>
                              <input type="text" className="form-control" required value={leaderForm.name} onChange={e => setLeaderForm({ ...leaderForm, name: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Role Title</label>
                              <input type="text" className="form-control" required value={leaderForm.role} onChange={e => setLeaderForm({ ...leaderForm, role: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Committee Group</label>
                              <select className="form-control" value={leaderForm.committee} onChange={e => setLeaderForm({ ...leaderForm, committee: e.target.value })}>
                                <option value="Board of Directors">Board of Directors</option>
                                <option value="Audit Committee">Audit Committee</option>
                                <option value="Conflict Resolution Committee">Conflict Resolution Committee</option>
                                <option value="Staff Team">Staff Team</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Email (Optional)</label>
                              <input type="email" className="form-control" value={leaderForm.email} onChange={e => setLeaderForm({ ...leaderForm, email: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Phone (Optional)</label>
                              <input type="text" className="form-control" value={leaderForm.phone} onChange={e => setLeaderForm({ ...leaderForm, phone: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Impairment Representation</label>
                              <select className="form-control" value={leaderForm.impairment} onChange={e => setLeaderForm({ ...leaderForm, impairment: e.target.value })}>
                                <option value="">None / Physical</option>
                                <option value="Physical">Physical</option>
                                <option value="Visual">Visual</option>
                                <option value="Deaf">Deaf</option>
                                <option value="Albenism">Albenism</option>
                                <option value="Mental">Intellectual / Mental</option>
                              </select>
                            </div>
                            <div className="col-md-12">
                              <CMSImageField 
                                label="Photo URL" 
                                value={leaderForm.avatar} 
                                onChange={(url) => setLeaderForm({ ...leaderForm, avatar: url })} 
                                openMediaSelector={openMediaSelector} 
                                uploadMediaFile={uploadMediaFile} 
                                category="leaders" 
                                entity={leaderForm.name || 'leader'} 
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Bio Description</label>
                              <textarea className="form-control" rows={3} required value={leaderForm.desc} onChange={e => setLeaderForm({ ...leaderForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingLeaderId ? 'Update' : 'Create'}</button>
                              <button type="button" onClick={() => setLeaderFormOpen(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom">
                          <input type="text" placeholder="Search leaders..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={leaderSearch} onChange={e => setLeaderSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Committee</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredLeaders, currentPage.leaders, pageSizes.leaders).map(l => (
                                <tr key={l.id}>
                                  <td className="fw-semibold small">{l.name}</td>
                                  <td className="small">{t(l.role)}</td>
                                  <td className="small text-muted">{l.committee}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => handleEditLeaderClick(l)} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteLeader(l.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredLeaders.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-inbox fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No leaders found</p>
                            </div>
                          )}
                        </div>
                        {filteredLeaders.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.leaders} 
                            totalPages={totalPages(filteredLeaders.length, pageSizes.leaders)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, leaders: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* ATHLETES PAGE EDITOR */}
                  {activeEditPage === 'athletes' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Athletes Database ({filteredAthletes.length})</h3>
                        <button
                          onClick={() => {
                            setEditingAthleteId(null);
                            setAthleteForm({ name: '', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: 'avatar-1.svg', desc: '' });
                            setAthleteFormOpen(!athleteFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${athleteFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {athleteFormOpen ? 'Cancel' : 'New Athlete'}
                        </button>
                      </div>

                      {athleteFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingAthleteId ? 'Edit Athlete' : 'Add Athlete'}</h4>
                          <form onSubmit={handleAthleteSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Name</label>
                              <input type="text" className="form-control" required value={athleteForm.name} onChange={e => setAthleteForm({ ...athleteForm, name: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Sport Classification</label>
                              <input type="text" className="form-control" required value={athleteForm.sport} onChange={e => setAthleteForm({ ...athleteForm, sport: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Country</label>
                              <input type="text" className="form-control" required value={athleteForm.country} onChange={e => setAthleteForm({ ...athleteForm, country: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={athleteForm.status} onChange={e => setAthleteForm({ ...athleteForm, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <CMSImageField 
                                label="Athlete Avatar / Photo" 
                                value={athleteForm.avatar} 
                                onChange={(url) => setAthleteForm({ ...athleteForm, avatar: url })} 
                                openMediaSelector={openMediaSelector} 
                                uploadMediaFile={uploadMediaFile} 
                                category="athletes" 
                                entity={athleteForm.name || 'athlete'} 
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Description / Achievements</label>
                              <textarea className="form-control" rows={3} required value={athleteForm.desc} onChange={e => setAthleteForm({ ...athleteForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingAthleteId ? 'Update' : 'Create'}</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom d-flex gap-2">
                          <input type="text" placeholder="Search athletes..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={athleteSearch} onChange={e => setAthleteSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Sport</th>
                                <th>Status</th>
                                <th>Country</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredAthletes, currentPage.athletes, pageSizes.athletes).map(a => (
                                <tr key={a.id}>
                                  <td className="fw-semibold small">{a.name}</td>
                                  <td className="small">{t(a.sport)}</td>
                                  <td>
                                    <span className={`badge ${a.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{a.status}</span>
                                  </td>
                                  <td className="small text-muted">{a.country}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setAthleteForm({ name: a.name, sport: a.sport, status: a.status, country: a.country, avatar: a.avatar, desc: a.desc });
                                        setEditingAthleteId(a.id);
                                        setAthleteFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteAthlete(a.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredAthletes.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-person-running fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No athletes found</p>
                            </div>
                          )}
                        </div>
                        {filteredAthletes.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.athletes} 
                            totalPages={totalPages(filteredAthletes.length, pageSizes.athletes)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, athletes: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* SPORTS PROGRAMS PAGE EDITOR */}
                  {activeEditPage === 'sports' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Sports Programs ({sports.length})</h3>
                        <button
                          onClick={() => {
                            setEditingSportId(null);
                            setSportForm({ slug: '', title: '', img: 'index-sport-1.jpg', desc: '' });
                            setSportFormOpen(!sportFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${sportFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {sportFormOpen ? 'Cancel' : 'New Sport'}
                        </button>
                      </div>

                      {sportFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingSportId ? 'Edit Sport' : 'Add Sport'}</h4>
                          <form onSubmit={handleSportSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Title</label>
                              <input type="text" className="form-control" required value={sportForm.title} onChange={e => setSportForm({ ...sportForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Slug</label>
                              <input type="text" className="form-control" required value={sportForm.slug} onChange={e => setSportForm({ ...sportForm, slug: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <CMSImageField 
                                label="Cover/Banner Image" 
                                value={sportForm.img} 
                                onChange={(url) => setSportForm({ ...sportForm, img: url })}
                                openMediaSelector={openMediaSelector}
                                uploadMediaFile={uploadMediaFile}
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Short summary</label>
                              <textarea className="form-control" rows={3} required value={sportForm.desc} onChange={e => setSportForm({ ...sportForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingSportId ? 'Update' : 'Create'}</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom">
                          <input type="text" placeholder="Search sports..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={sportSearch} onChange={e => setSportSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Cover</th>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredSports, currentPage.sports, pageSizes.sports).map(s => (
                                <tr key={s.id}>
                                  <td>
                                    <img src={s.img.startsWith('http') || s.img.startsWith('/') ? s.img : `/assets/img/${s.img}`} style={{ height: '30px', objectFit: 'contain' }} alt="" />
                                  </td>
                                  <td className="fw-semibold small">{s.title}</td>
                                  <td className="small text-muted">{s.slug}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setSportForm({ slug: s.slug, title: s.title, img: s.img, desc: s.desc });
                                        setEditingSportId(s.id);
                                        setSportFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteSport(s.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredSports.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-volleyball fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No sports programs found</p>
                            </div>
                          )}
                        </div>
                        {filteredSports.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.sports} 
                            totalPages={totalPages(filteredSports.length, pageSizes.sports)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, sports: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* NEWS ARTICLES PAGE EDITOR */}
                  {activeEditPage === 'news' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>News Articles ({news.length})</h3>
                        <button
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsForm({ title: '', date: 'Jul 2026', category: 'Sport', status: 'Draft', img: 'news-volleyball.jpg', desc: '', content: '', slug: '' });
                            setNewsFormOpen(!newsFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${newsFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {newsFormOpen ? 'Cancel' : 'Write Article'}
                        </button>
                      </div>

                      {newsFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingNewsId ? 'Edit Article' : 'New Article'}</h4>
                          <form onSubmit={handleNewsSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Title</label>
                              <input type="text" className="form-control" required value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Slug</label>
                              <input type="text" className="form-control" required value={newsForm.slug} onChange={e => setNewsForm({ ...newsForm, slug: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Category</label>
                              <select className="form-control" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}>
                                <option value="Sport">Sport</option>
                                <option value="Event">Event</option>
                                <option value="Finance">Finance</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={newsForm.status} onChange={e => setNewsForm({ ...newsForm, status: e.target.value })}>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <CMSImageField 
                                label="Cover Image" 
                                value={newsForm.img} 
                                onChange={(url) => setNewsForm({ ...newsForm, img: url })}
                                openMediaSelector={openMediaSelector}
                                uploadMediaFile={uploadMediaFile}
                                category="news"
                                entity={newsForm.slug || newsForm.title || 'article'}
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Brief Abstract</label>
                              <input type="text" className="form-control" required value={newsForm.desc} onChange={e => setNewsForm({ ...newsForm, desc: e.target.value })} />
                            </div>
                            <div className="col-md-12">
                              <RichTextEditor 
                                value={newsForm.content} 
                                onChange={(val) => setNewsForm({ ...newsForm, content: val })} 
                                label="Detailed Content (Supports Markdown / Rich Text)" 
                                openMediaSelector={openMediaSelector}
                              />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingNewsId ? 'Update' : 'Publish'}</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom">
                          <input type="text" placeholder="Search news..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={newsSearch} onChange={e => setNewsSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Cover</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredNews, currentPage.news, pageSizes.news).map(n => (
                                <tr key={n.id}>
                                  <td>
                                    <img src={n.img.startsWith('http') || n.img.startsWith('/') ? n.img : `/assets/img/${n.img}`} style={{ height: '30px', objectFit: 'contain' }} alt="" />
                                  </td>
                                  <td className="fw-semibold small">{t(n.title)}</td>
                                  <td className="small"><span className="badge bg-light text-dark border">{n.category}</span></td>
                                  <td>
                                    <span className={`badge ${n.status === 'Published' ? 'bg-success' : 'bg-warning'}`}>{n.status}</span>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setNewsForm({ title: n.title, date: n.date, category: n.category, status: n.status, img: n.img, desc: n.desc, content: n.content || '', slug: n.slug });
                                        setEditingNewsId(n.id);
                                        setNewsFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteNews(n.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredNews.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-newspaper fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No news articles found</p>
                            </div>
                          )}
                        </div>
                        {filteredNews.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.news} 
                            totalPages={totalPages(filteredNews.length, pageSizes.news)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, news: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* ANNOUNCEMENTS PAGE EDITOR */}
                  {activeEditPage === 'announcements' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Announcements ({news.filter(n => n.status === 'Published' || !n.status).length} published)</h3>
                        <button
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsForm({ title: '', date: 'Jul 2026', category: 'Announcement', status: 'Published', img: 'news-volleyball.jpg', desc: '', content: '', slug: '' });
                            setNewsFormOpen(!newsFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${newsFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {newsFormOpen ? 'Cancel' : 'New Announcement'}
                        </button>
                      </div>

                      {newsFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingNewsId ? 'Edit Announcement' : 'New Announcement'}</h4>
                          <form onSubmit={handleNewsSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Title</label>
                              <input type="text" className="form-control" required value={newsForm.title} onChange={e => setNewsForm({ ...newsForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Slug</label>
                              <input type="text" className="form-control" required value={newsForm.slug} onChange={e => setNewsForm({ ...newsForm, slug: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={newsForm.status} onChange={e => setNewsForm({ ...newsForm, status: e.target.value })}>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Date</label>
                              <input type="text" className="form-control" value={newsForm.date} onChange={e => setNewsForm({ ...newsForm, date: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <label className="form-label small fw-bold">Short Summary</label>
                              <textarea className="form-control" rows={3} value={newsForm.desc} onChange={e => setNewsForm({ ...newsForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <label className="form-label small fw-bold">Full Content</label>
                              <textarea className="form-control" rows={6} value={newsForm.content} onChange={e => setNewsForm({ ...newsForm, content: e.target.value })} />
                            </div>
                            <div className="col-12 d-flex gap-2">
                              <button type="submit" className="btn btn-primary btn-sm fw-bold px-4">
                                {editingNewsId ? 'Update' : 'Publish Announcement'}
                              </button>
                              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setNewsFormOpen(false)}>Cancel</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {news.map(n => (
                                <tr key={n.id}>
                                  <td className="fw-semibold small">{n.title}</td>
                                  <td className="small text-muted">{n.date}</td>
                                  <td>
                                    <span className={`badge ${n.status === 'Published' ? 'bg-success' : 'bg-warning'}`}>{n.status}</span>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setNewsForm({ title: n.title, date: n.date, category: n.category, status: n.status, img: n.img, desc: n.desc, content: n.content || '', slug: n.slug });
                                        setEditingNewsId(n.id);
                                        setNewsFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteNews(n.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EVENTS CALENDAR PAGE EDITOR */}
                  {activeEditPage === 'events' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Scheduled Events ({events.length})</h3>
                        <button
                          onClick={() => {
                            setEditingEventId(null);
                            setEventForm({ title: '', description: '', date: '2026-08-15', endDate: '2026-08-20', location: 'Amahoro Stadium, Kigali', category: 'National', status: 'Upcoming', img: 'sports-hero.jpg', featured: false });
                            setEventFormOpen(!eventFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${eventFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {eventFormOpen ? 'Cancel' : 'New Event'}
                        </button>
                      </div>

                      {eventFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">{editingEventId ? 'Edit Event' : 'Create Event'}</h4>
                          <form onSubmit={handleEventSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Title</label>
                              <input type="text" className="form-control" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Start Date</label>
                              <input type="date" className="form-control" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">End Date</label>
                              <input type="date" className="form-control" value={eventForm.endDate} onChange={e => setEventForm({ ...eventForm, endDate: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Location Venue</label>
                              <input type="text" className="form-control" required value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Category</label>
                              <select className="form-control" value={eventForm.category} onChange={e => setEventForm({ ...eventForm, category: e.target.value })}>
                                <option value="National">National</option>
                                <option value="Regional">Regional</option>
                                <option value="International">International</option>
                                <option value="Training">Training Camp</option>
                                <option value="Conference">Conference</option>
                              </select>
                            </div>
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={eventForm.status} onChange={e => setEventForm({ ...eventForm, status: e.target.value })}>
                                <option value="Upcoming">Upcoming</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>
                            <div className="col-md-6">
                              <CMSImageField 
                                label="Poster Image" 
                                value={eventForm.img} 
                                onChange={(url) => setEventForm({ ...eventForm, img: url })}
                                openMediaSelector={openMediaSelector}
                                uploadMediaFile={uploadMediaFile}
                                category="events"
                                entity={eventForm.title || 'event'}
                              />
                            </div>
                            <div className="col-md-6 d-flex align-items-center">
                              <div className="form-check mt-4">
                                <input type="checkbox" className="form-check-input" id="eventFeatured" checked={eventForm.featured} onChange={e => setEventForm({ ...eventForm, featured: e.target.checked })} />
                                <label className="form-check-label small fw-bold text-dark" htmlFor="eventFeatured">Featured (Displays in Hero Banner highlights)</label>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Full Details</label>
                              <textarea className="form-control" rows={3} required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingEventId ? 'Update' : 'Create'}</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom">
                          <input type="text" placeholder="Search events..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={eventSearch} onChange={e => setEventSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Cover</th>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredEvents, currentPage.events, pageSizes.events).map(e => (
                                <tr key={e.id}>
                                  <td>
                                    <img src={e.img.startsWith('http') || e.img.startsWith('/') ? e.img : `/assets/img/${e.img}`} style={{ height: '30px', objectFit: 'contain' }} alt="" />
                                  </td>
                                  <td className="fw-semibold small">{e.title}</td>
                                  <td className="small text-muted">{e.location}</td>
                                  <td className="small"><span className="badge bg-light text-dark border">{e.category}</span></td>
                                  <td>
                                    <span className={`badge ${e.status === 'Completed' ? 'bg-secondary' : 'bg-success'}`}>{e.status}</span>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setEventForm({ title: e.title, description: e.description, date: e.date, endDate: e.endDate, location: e.location, category: e.category, status: e.status, img: e.img, featured: e.featured });
                                        setEditingEventId(e.id);
                                        setEventFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-1">Edit</button>
                                      <button onClick={() => deleteEvent(e.id)} className="btn btn-sm btn-outline-danger py-1">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredEvents.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-calendar-alt fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No events found</p>
                            </div>
                          )}
                        </div>
                        {filteredEvents.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.events} 
                            totalPages={totalPages(filteredEvents.length, pageSizes.events)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, events: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* CAREERS PAGE EDITOR */}
                  {activeEditPage === 'careers' && (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Careers & Vacancies ({careers.length})</h3>
                        <button
                          onClick={() => {
                            setCareerForm({ title: '', location: 'Kigali', status: 'Open', desc: '', slug: '' });
                            setCareerFormOpen(!careerFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-3"
                        >
                          <i className={`fas ${careerFormOpen ? 'fa-minus' : 'fa-plus'} me-2`} />
                          {careerFormOpen ? 'Cancel' : 'New Position'}
                        </button>
                      </div>

                      {careerFormOpen && (
                        <div className="custom-card p-4 mb-4">
                          <h4 className="h6 fw-bold mb-3">Add Vacancy</h4>
                          <form onSubmit={handleCareerSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Position Title</label>
                              <input type="text" className="form-control" required value={careerForm.title} onChange={e => setCareerForm({ ...careerForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Location</label>
                              <input type="text" className="form-control" required value={careerForm.location} onChange={e => setCareerForm({ ...careerForm, location: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Slug URL</label>
                              <input type="text" className="form-control" required value={careerForm.slug} onChange={e => setCareerForm({ ...careerForm, slug: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={careerForm.status} onChange={e => setCareerForm({ ...careerForm, status: e.target.value })}>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Job Description</label>
                              <textarea className="form-control" rows={3} required value={careerForm.desc} onChange={e => setCareerForm({ ...careerForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">Register Position</button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="custom-card">
                        <div className="p-3 bg-light border-bottom">
                          <input type="text" placeholder="Search vacancies..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={careerSearch} onChange={e => setCareerSearch(e.target.value)} />
                        </div>
                        <div className="table-responsive">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Location</th>
                                <th>Applicants</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredCareers, currentPage.careers, pageSizes.careers).map(c => (
                                <tr key={c.id}>
                                  <td className="fw-semibold small">{c.title}</td>
                                  <td className="small text-muted">{c.location}</td>
                                  <td className="small fw-bold text-primary">{c.applicants}</td>
                                  <td>
                                    <span className={`badge ${c.status === 'Open' ? 'bg-success' : 'bg-secondary'}`}>{c.status}</span>
                                  </td>
                                  <td>
                                    {c.status === 'Open' && (
                                      <button onClick={() => closeCareer(c.id)} className="btn btn-sm btn-outline-secondary py-1">Close</button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {filteredCareers.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                              <i className="fas fa-briefcase fa-2x mb-3 d-block" />
                              <p style={{ margin: 0, fontSize: '0.9rem' }}>No vacancies found</p>
                            </div>
                          )}
                        </div>
                        {filteredCareers.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.careers} 
                            totalPages={totalPages(filteredCareers.length, pageSizes.careers)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, careers: page })}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* CONTACTS & FOOTER SOCIAL EDITORS */}
                  {activeEditPage === 'contact' && (
                    <div>
                      {/* Physical Address details */}
                      <div className="custom-card p-4 mb-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-dark"><i className="fas fa-address-card me-2 text-primary" />Contact Info Details</h4>
                        <form onSubmit={handleContactSubmit} className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Physical Address</label>
                            <input type="text" className="form-control" required value={contactForm.address} onChange={e => setContactForm({ ...contactForm, address: e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Phone Number</label>
                            <input type="text" className="form-control" required value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Support Email</label>
                            <input type="email" className="form-control" required value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Google Maps Embed Location URL</label>
                            <input type="text" className="form-control" value={contactForm.mapUrl} onChange={e => setContactForm({ ...contactForm, mapUrl: e.target.value })} />
                          </div>
                          <div className="col-12">
                            <button type="submit" className="btn btn-primary btn-sm px-4">Update Contact Info Details</button>
                          </div>
                        </form>
                      </div>

                      {/* Social Link List */}
                      <div className="custom-card p-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <h4 className="h6 fw-bold mb-0 text-dark"><i className="fas fa-share-nodes text-primary me-2" />Footer Social Links</h4>
                          <button
                            onClick={() => {
                              setEditingSocialId(null);
                              setSocialForm({ platform: 'facebook', url: '', icon: 'fa-facebook', active: true, order: 0 });
                              setSocialFormOpen(!socialFormOpen);
                            }}
                            className="btn btn-outline-primary btn-sm fw-bold"
                          >
                            <i className="fas fa-plus me-1" /> Add Social Link
                          </button>
                        </div>

                        {socialFormOpen && (
                          <form onSubmit={handleSocialSubmit} className="row g-3 mb-3 p-3 bg-light border rounded">
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Platform</label>
                              <select className="form-control" value={socialForm.platform} onChange={e => setSocialForm({ ...socialForm, platform: e.target.value })}>
                                <option value="facebook">Facebook</option>
                                <option value="twitter">Twitter / X</option>
                                <option value="instagram">Instagram</option>
                                <option value="youtube">YouTube</option>
                                <option value="linkedin">LinkedIn</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">URL</label>
                              <input type="url" className="form-control" required value={socialForm.url} onChange={e => setSocialForm({ ...socialForm, url: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold">FontAwesome Icon</label>
                              <input type="text" className="form-control" required value={socialForm.icon} onChange={e => setSocialForm({ ...socialForm, icon: e.target.value })} />
                            </div>
                            <div className="col-md-2">
                              <label className="form-label small fw-bold">Display Order</label>
                              <input type="number" className="form-control" value={socialForm.order} onChange={e => setSocialForm({ ...socialForm, order: parseInt(e.target.value, 10) || 0 })} />
                            </div>
                            <div className="col-md-1 d-flex align-items-center">
                              <div className="form-check mt-4">
                                <input type="checkbox" className="form-check-input" id="socActive" checked={socialForm.active} onChange={e => setSocialForm({ ...socialForm, active: e.target.checked })} />
                                <label className="form-check-label small" htmlFor="socActive">Active</label>
                              </div>
                            </div>
                            <div className="col-12 d-flex gap-2">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingSocialId ? 'Update Link' : 'Add Link'}</button>
                              <button type="button" onClick={() => setSocialFormOpen(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                            </div>
                          </form>
                        )}

                        <div className="table-responsive bg-white rounded border shadow-sm">
                          <table className="table table-hover mb-0 align-middle">
                            <thead>
                              <tr>
                                <th>Platform</th>
                                <th>URL</th>
                                <th>Icon</th>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {socialLinks.map(s => (
                                <tr key={s.id}>
                                  <td className="small fw-semibold">{s.platform}</td>
                                  <td className="small text-muted">{s.url}</td>
                                  <td className="small"><i className={`fab ${s.icon} me-1`} />{s.icon}</td>
                                  <td className="small">{s.order}</td>
                                  <td>
                                    <span className={`badge ${s.active ? 'bg-success' : 'bg-secondary'}`}>{s.active ? 'Active' : 'Inactive'}</span>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => handleEditSocialClick(s)} className="btn btn-sm btn-outline-primary py-0">Edit</button>
                                      <button onClick={() => deleteSocialLink(s.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* GOVERNANCE DOCUMENTS & POLICIES PAGE EDITOR */}
                  {activeEditPage === 'governance' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="h6 fw-bold mb-0 text-dark">Governance Documents & Policies ({govDocs.length + govPolicies.length})</h3>
                        <button
                          onClick={() => {
                            setEditingGovId(null);
                            setGovFormType('doc');
                            setGovForm({ title: '', desc: '', fileUrl: '', order: 0, published: true });
                            setGovFormOpen(!govFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-4"
                        >
                          <i className={`fas ${govFormOpen ? 'fa-minus' : 'fa-plus'} me-1`} /> 
                          {govFormOpen ? 'Cancel' : 'New Document / Policy'}
                        </button>
                      </div>

                      {govFormOpen && (
                        <form onSubmit={handleGovSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                          <h4 className="h6 fw-bold col-12">{editingGovId ? 'Edit Governance Item' : 'Create Governance Item'}</h4>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Title</label>
                            <input type="text" className="form-control" required value={govForm.title} onChange={e => setGovForm({ ...govForm, title: e.target.value })} />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Item Type</label>
                            <select className="form-control" value={govFormType} onChange={e => setGovFormType(e.target.value as any)} disabled={editingGovId !== null}>
                              <option value="doc">Key Document (Constitution/Reports)</option>
                              <option value="policy">Official Policy (Safeguarding/Anti-Doping)</option>
                            </select>
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Display Order</label>
                            <input type="number" className="form-control" value={govForm.order} onChange={e => setGovForm({ ...govForm, order: parseInt(e.target.value, 10) || 0 })} />
                          </div>
                          <div className="col-md-8">
                            <CMSImageField 
                              label="File Path / URL (PDF or Image)" 
                              value={govForm.fileUrl} 
                              onChange={(url) => setGovForm({ ...govForm, fileUrl: url })}
                              openMediaSelector={openMediaSelector}
                              uploadMediaFile={uploadMediaFile}
                            />
                          </div>
                          <div className="col-md-4 d-flex align-items-center">
                            <div className="form-check mt-4">
                              <input type="checkbox" className="form-check-input" id="govPublished" checked={govForm.published} onChange={e => setGovForm({ ...govForm, published: e.target.checked })} />
                              <label className="form-check-label small fw-bold text-dark" htmlFor="govPublished">Published (Visible on site)</label>
                            </div>
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Description Summary</label>
                            <textarea className="form-control" rows={2} required value={govForm.desc} onChange={e => setGovForm({ ...govForm, desc: e.target.value })} />
                          </div>
                          <div className="col-12 d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm px-4">{editingGovId ? 'Update Item' : 'Create Item'}</button>
                            <button type="button" onClick={() => setGovFormOpen(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                          </div>
                        </form>
                      )}

                      {govLoading ? (
                        <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
                      ) : (
                        <div className="row g-4">
                          <div className="col-md-6">
                            <div className="custom-card p-3">
                              <h5 className="h6 fw-bold border-bottom pb-2 mb-3 text-dark"><i className="fas fa-file-pdf text-danger me-2" />Key Documents ({govDocs.length})</h5>
                              <div className="table-responsive">
                                <table className="table table-hover table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>Order</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {govDocs.map(d => (
                                      <tr key={d.id}>
                                        <td className="small fw-semibold text-truncate text-dark" style={{ maxWidth: '180px' }} title={d.title}>{d.title}</td>
                                        <td className="small">{d.order}</td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button 
                                              onClick={() => {
                                                setGovFormType('doc');
                                                setGovForm({ title: d.title, desc: d.desc, fileUrl: d.fileUrl || '', order: d.order, published: d.published });
                                                setEditingGovId(d.id);
                                                setGovFormOpen(true);
                                              }} 
                                              className="btn btn-xs btn-outline-primary py-0"
                                            >Edit</button>
                                            <button onClick={() => deleteGovItem('doc', d.id)} className="btn btn-xs btn-outline-danger py-0">Delete</button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="custom-card p-3">
                              <h5 className="h6 fw-bold border-bottom pb-2 mb-3 text-dark"><i className="fas fa-scale-balanced text-success me-2" />Official Policies ({govPolicies.length})</h5>
                              <div className="table-responsive">
                                <table className="table table-hover table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>Order</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {govPolicies.map(p => (
                                      <tr key={p.id}>
                                        <td className="small fw-semibold text-truncate text-dark" style={{ maxWidth: '180px' }} title={p.title}>{p.title}</td>
                                        <td className="small">{p.order}</td>
                                        <td>
                                          <div className="d-flex gap-1">
                                            <button 
                                              onClick={() => {
                                                setGovFormType('policy');
                                                setGovForm({ title: p.title, desc: p.desc, fileUrl: p.fileUrl || '', order: p.order, published: p.published });
                                                setEditingGovId(p.id);
                                                setGovFormOpen(true);
                                              }} 
                                              className="btn btn-xs btn-outline-primary py-0"
                                            >Edit</button>
                                            <button onClick={() => deleteGovItem('policy', p.id)} className="btn btn-xs btn-outline-danger py-0">Delete</button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PARTNERS & SPONSORS PAGE EDITOR */}
                  {activeEditPage === 'partners' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="h6 fw-bold mb-0 text-dark">Partners & Sponsors Directory ({partners.length})</h3>
                        <button
                          onClick={() => {
                            setEditingPartnerId(null);
                            setPartnerForm({ name: '', logo: '', website: '', category: 'Government Sector', order: 0, active: true });
                            setPartnerFormOpen(!partnerFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-4"
                        >
                          <i className={`fas ${partnerFormOpen ? 'fa-minus' : 'fa-plus'} me-1`} />
                          {partnerFormOpen ? 'Cancel' : 'New Partner Logo'}
                        </button>
                      </div>

                      {partnerFormOpen && (
                        <form onSubmit={handlePartnerSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                          <h4 className="h6 fw-bold col-12">{editingPartnerId ? 'Edit Partner Details' : 'Register Partner'}</h4>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Partner Name</label>
                            <input type="text" className="form-control" required value={partnerForm.name} onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })} />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Website URL</label>
                            <input type="url" className="form-control" value={partnerForm.website} onChange={e => setPartnerForm({ ...partnerForm, website: e.target.value })} placeholder="https://example.com" />
                          </div>
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Sector Category</label>
                            <select className="form-control" value={partnerForm.category || 'Government Sector'} onChange={e => setPartnerForm({ ...partnerForm, category: e.target.value })}>
                              <option value="Government Sector">Government Sector</option>
                              <option value="International Sports Bodies">International Sports Bodies</option>
                              <option value="Other Non-Governmental Organizations">Other Non-Governmental Organizations</option>
                            </select>
                          </div>
                          <div className="col-md-8">
                            <CMSImageField 
                              label="Partner Logo Image" 
                              value={partnerForm.logo} 
                              onChange={(url) => setPartnerForm({ ...partnerForm, logo: url })}
                              openMediaSelector={openMediaSelector}
                              uploadMediaFile={uploadMediaFile}
                              category="partners"
                              entity={partnerForm.name || 'partner'}
                            />
                          </div>
                          <div className="col-md-3">
                            <label className="form-label small fw-bold">Display Order</label>
                            <input type="number" className="form-control" value={partnerForm.order} onChange={e => setPartnerForm({ ...partnerForm, order: parseInt(e.target.value, 10) || 0 })} />
                          </div>
                          <div className="col-md-3 d-flex align-items-center">
                            <div className="form-check mt-4">
                              <input type="checkbox" className="form-check-input" id="partAct" checked={partnerForm.active} onChange={e => setPartnerForm({ ...partnerForm, active: e.target.checked })} />
                              <label className="form-check-label small fw-bold text-dark" htmlFor="partAct">Active Partner</label>
                            </div>
                          </div>
                          <div className="col-12 d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm px-4">{editingPartnerId ? 'Update Partner' : 'Register Partner'}</button>
                            <button type="button" onClick={() => setPartnerFormOpen(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                          </div>
                        </form>
                      )}

                      <div className="p-3 bg-light border-bottom mb-3 rounded">
                        <input type="text" placeholder="Search partners..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} />
                      </div>

                      <div className="table-responsive bg-white rounded border shadow-sm">
                        <table className="table table-hover mb-0 align-middle">
                          <thead>
                            <tr>
                              <th>Logo</th>
                              <th>Name</th>
                              <th>Website</th>
                              <th>Order</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginate(filteredPartners, currentPage.partners, pageSizes.partners).map(p => (
                              <tr key={p.id}>
                                <td>
                                  <img 
                                    src={p.logo.startsWith('/') || p.logo.startsWith('http') ? p.logo : `/uploads/${p.logo}`} 
                                    style={{ height: '30px', maxWidth: '100px', objectFit: 'contain' }} 
                                    alt="" 
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                                  />
                                </td>
                                <td className="small fw-semibold text-dark">{p.name}</td>
                                <td className="small text-muted">{p.website || 'No website'}</td>
                                <td className="small">{p.order}</td>
                                <td>
                                  <span className={`badge ${p.active ? 'bg-success' : 'bg-secondary'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setPartnerForm({ name: p.name, logo: p.logo, website: p.website || '', category: p.category || 'Government Sector', order: p.order, active: p.active });
                                        setEditingPartnerId(p.id);
                                        setPartnerFormOpen(true);
                                      }} 
                                      className="btn btn-sm btn-outline-primary py-0"
                                    >Edit</button>
                                    <button onClick={() => deletePartner(p.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {filteredPartners.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#cbd5e1' }}>
                            <i className="fas fa-handshake fa-2x mb-3 d-block" />
                            <p style={{ margin: 0, fontSize: '0.9rem' }}>No partners found</p>
                          </div>
                        )}
                      </div>
                      {filteredPartners.length > 0 && (
                        <PaginationComponent 
                          currentPage={currentPage.partners} 
                          totalPages={totalPages(filteredPartners.length, pageSizes.partners)}
                          onPageChange={(page) => setCurrentPage({ ...currentPage, partners: page })}
                        />
                      )}
                    </div>
                  )}

                  {/* SYSTEM COMPONENTS PAGE EDITOR */}
                  {activeEditPage === 'system' && (
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3 className="h6 fw-bold mb-0 text-dark">System Components Translation Registry ({systemComponents.length})</h3>
                        <button
                          onClick={() => {
                            setEditingSystemId(null);
                            setSystemForm({ title: '', desc: '' });
                            setSystemFormOpen(!systemFormOpen);
                          }}
                          className="btn btn-primary btn-sm fw-bold px-4"
                        >
                          <i className={`fas ${systemFormOpen ? 'fa-minus' : 'fa-plus'} me-1`} />
                          {systemFormOpen ? 'Cancel' : 'New System Key'}
                        </button>
                      </div>

                      {systemFormOpen && (
                        <form onSubmit={handleSystemSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                          <h4 className="h6 fw-bold col-12">{editingSystemId ? 'Edit System Key' : 'Create System Key'}</h4>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Component Identifier Key</label>
                            <input type="text" className="form-control" required value={systemForm.title} onChange={e => setSystemForm({ ...systemForm, title: e.target.value })} placeholder="e.g. system.navbar" />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Description Translation / Value</label>
                            <textarea className="form-control" required rows={2} value={systemForm.desc} onChange={e => setSystemForm({ ...systemForm, desc: e.target.value })} placeholder="e.g. system.navbar_desc" />
                          </div>
                          <div className="col-12 d-flex gap-2">
                            <button type="submit" className="btn btn-primary btn-sm px-4">{editingSystemId ? 'Update Key' : 'Create Key'}</button>
                            <button type="button" onClick={() => setSystemFormOpen(false)} className="btn btn-light btn-sm px-4">Cancel</button>
                          </div>
                        </form>
                      )}

                      <div className="p-3 bg-light border-bottom mb-3 rounded">
                        <input type="text" placeholder="Search components..." className="form-control form-control-sm" style={{ maxWidth: '300px' }} value={systemSearch} onChange={e => setSystemSearch(e.target.value)} />
                      </div>

                      <div className="table-responsive bg-white rounded border shadow-sm">
                        <table className="table table-hover mb-0 align-middle">
                          <thead>
                            <tr>
                              <th>Component Key</th>
                              <th>Description / Value</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSystem.map(s => (
                              <tr key={s.id}>
                                <td className="small fw-semibold text-primary">{s.title}</td>
                                <td className="small text-muted">{s.desc}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <button 
                                      onClick={() => {
                                        setSystemForm({ title: s.title, desc: s.desc });
                                        setEditingSystemId(s.id);
                                        setSystemFormOpen(true);
                                      }} 
                                      className="btn btn-sm btn-outline-primary py-0"
                                    >Edit</button>
                                    <button onClick={() => deleteSystemComponent(s.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────
             TAB: MEDIA LIBRARY
             ────────────────────────────── */}
          {adminTab === 'volunteers' && (
            <div>
              <div className="custom-card p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="h5 fw-bold mb-0 text-dark"><i className="fas fa-users-gear text-primary me-2" />Volunteer Applications Portal</h4>
                  <span className="small text-muted fw-semibold">
                    Total Registrations: <span className="text-primary">{volunteers.length}</span>
                  </span>
                </div>

                <div className="p-3 bg-light border rounded mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <div className="position-relative" style={{ maxWidth: '350px', width: '100%' }}>
                    <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <input 
                      type="text" 
                      placeholder="Search volunteers by name or interest..." 
                      className="form-control form-control-sm ps-5" 
                      value={volunteerSearch}
                      onChange={e => setVolunteerSearch(e.target.value)}
                    />
                  </div>
                </div>

                {activeVolunteer && (
                  <div className="custom-card p-4 mb-4" style={{ background: '#FFFDF5', border: '1px solid #FFE082' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="fw-bold mb-0 text-dark">Application Details: {activeVolunteer.name}</h5>
                      <button onClick={() => setActiveVolunteer(null)} className="btn btn-close btn-sm"></button>
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-sm-6 small"><strong>Email:</strong> {activeVolunteer.email}</div>
                      <div className="col-sm-6 small"><strong>Interest Area:</strong> {activeVolunteer.interest}</div>
                      <div className="col-12 small"><strong>Skills:</strong> {activeVolunteer.skills}</div>
                    </div>
                    <div className="small text-dark p-3 rounded bg-white mb-3" style={{ border: '1px solid #F1F5F9', whiteSpace: 'pre-wrap' }}>
                      {activeVolunteer.details}
                    </div>
                    <div className="d-flex gap-2">
                      {!activeVolunteer.read && (
                        <button onClick={() => { markVolunteerAsRead(activeVolunteer.id); setActiveVolunteer(null); }} className="btn btn-success btn-sm">Mark Read</button>
                      )}
                      <button onClick={() => { deleteVolunteerApplication(activeVolunteer.id); setActiveVolunteer(null); }} className="btn btn-danger btn-sm">Delete Application</button>
                    </div>
                  </div>
                )}

                {volunteers.filter(v => 
                  v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) || 
                  v.interest.toLowerCase().includes(volunteerSearch.toLowerCase())
                ).length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light border border-dashed rounded">
                    <i className="fas fa-users-slash fa-4x mb-3 text-secondary" />
                    <p className="fw-semibold">No volunteer applications found</p>
                    <p className="small">Any new applications submitted on the Volunteer page will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Applicant Name</th>
                          <th>Interest Area</th>
                          <th>Skills/Background</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers
                          .filter(v => 
                            v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) || 
                            v.interest.toLowerCase().includes(volunteerSearch.toLowerCase())
                          )
                          .map(v => (
                            <tr key={v.id}>
                              <td className="fw-semibold small">{v.name}</td>
                              <td className="small">{v.interest}</td>
                              <td className="small text-muted">{v.skills}</td>
                              <td>
                                <span className={`badge ${v.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{v.read ? 'Read' : 'Unread'}</span>
                              </td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button onClick={() => setActiveVolunteer(v)} className="btn btn-sm btn-outline-primary py-0">Open Details</button>
                                  <button onClick={() => deleteVolunteerApplication(v.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ──────────────────────────────
             TAB: GOVERNANCE
             ────────────────────────────── */}
          {adminTab === 'governance' && (
            <div>
              <p className="text-muted small">Governance Documents and Policies are fully database-driven. Use the Governance API endpoints or configure them in Settings.</p>
            </div>
          )}

          {/* ──────────────────────────────
             TAB: CONTACTS / INBOX
             ────────────────────────────── */}
          {adminTab === 'contacts' && (
            <div>
              <div className="mb-4 d-flex gap-2 border-bottom pb-2">
                {[
                  { id: 'messages', label: `Messages Inbox (${contacts.filter(c => !c.read).length})` },
                  { id: 'volunteers', label: `Volunteers (${volunteers.filter(v => !v.read).length})` },
                  { id: 'donations', label: `Donation Inquiries (${donations.filter(d => !d.read).length})` },
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => setInboxSubTab(sub.id as any)}
                    className="btn btn-sm"
                    style={{
                      fontWeight: 600,
                      background: inboxSubTab === sub.id ? 'var(--primary-blue)' : 'transparent',
                      color: inboxSubTab === sub.id ? '#fff' : 'var(--text-dark)',
                      borderRadius: '8px',
                      border: 'none',
                      padding: '8px 16px',
                    }}
                  >{sub.label}</button>
                ))}
              </div>

              {/* Message Details Modals */}
              {activeMessage && (
                <div className="custom-card p-4 mb-4" style={{ background: '#FFFDF5', border: '1px solid #FFE082' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="h5 fw-bold mb-0">From: {activeMessage.name} &lt;{activeMessage.email}&gt;</h4>
                    <button onClick={() => setActiveMessage(null)} className="btn btn-close btn-sm"></button>
                  </div>
                  <h5 className="small mb-3"><strong>Subject:</strong> {activeMessage.subject}</h5>
                  <p className="small text-dark p-3 rounded bg-white" style={{ border: '1px solid #F1F5F9' }}>{activeMessage.message}</p>
                  <div className="d-flex gap-2 mt-3">
                    {!activeMessage.read && (
                      <button onClick={() => { markContactAsRead(activeMessage.id); setActiveMessage(null); }} className="btn btn-success btn-sm">Mark Read</button>
                    )}
                    <button onClick={() => { deleteContactMessage(activeMessage.id); setActiveMessage(null); }} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              )}

              {activeVolunteer && (
                <div className="custom-card p-4 mb-4" style={{ background: '#FFFDF5', border: '1px solid #FFE082' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="h5 fw-bold mb-0">Volunteer Application: {activeVolunteer.name} &lt;{activeVolunteer.email}&gt;</h4>
                    <button onClick={() => setActiveVolunteer(null)} className="btn btn-close btn-sm"></button>
                  </div>
                  <p className="small"><strong>Interests:</strong> {activeVolunteer.interest}</p>
                  <p className="small"><strong>Skills:</strong> {activeVolunteer.skills}</p>
                  <p className="small text-dark p-3 rounded bg-white" style={{ border: '1px solid #F1F5F9' }}>{activeVolunteer.details}</p>
                  <div className="d-flex gap-2 mt-3">
                    {!activeVolunteer.read && (
                      <button onClick={() => { markVolunteerAsRead(activeVolunteer.id); setActiveVolunteer(null); }} className="btn btn-success btn-sm">Mark Read</button>
                    )}
                    <button onClick={() => { deleteVolunteerApplication(activeVolunteer.id); setActiveVolunteer(null); }} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              )}

              {activeDonation && (
                <div className="custom-card p-4 mb-4" style={{ background: '#FFFDF5', border: '1px solid #FFE082' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="h5 fw-bold mb-0">Donation Inquiry: {activeDonation.name} &lt;{activeDonation.email}&gt;</h4>
                    <button onClick={() => setActiveDonation(null)} className="btn btn-close btn-sm"></button>
                  </div>
                  <p className="small"><strong>Category:</strong> {activeDonation.category}</p>
                  <p className="small"><strong>Support Type:</strong> {activeDonation.supportType}</p>
                  <p className="small text-dark p-3 rounded bg-white" style={{ border: '1px solid #F1F5F9' }}>{activeDonation.details}</p>
                  <div className="d-flex gap-2 mt-3">
                    {!activeDonation.read && (
                      <button onClick={() => { markDonationAsRead(activeDonation.id); setActiveDonation(null); }} className="btn btn-success btn-sm">Mark Read</button>
                    )}
                    <button onClick={() => { deleteDonationInquiry(activeDonation.id); setActiveDonation(null); }} className="btn btn-danger btn-sm">Delete</button>
                  </div>
                </div>
              )}

              {/* Tab views */}
              {inboxSubTab === 'messages' && (
                <div className="custom-card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Sender</th>
                          <th>Subject</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map(c => (
                          <tr key={c.id}>
                            <td className="fw-semibold small">{c.name}</td>
                            <td className="small">{c.subject}</td>
                            <td className="small text-muted">{c.date}</td>
                            <td>
                              <span className={`badge ${c.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{c.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveMessage(c)} className="btn btn-sm btn-outline-primary py-0">Open</button>
                                <button onClick={() => deleteContactMessage(c.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {inboxSubTab === 'volunteers' && (
                <div className="custom-card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Interest</th>
                          <th>Skills</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {volunteers.map(v => (
                          <tr key={v.id}>
                            <td className="fw-semibold small">{v.name}</td>
                            <td className="small">{v.interest}</td>
                            <td className="small text-muted">{v.skills}</td>
                            <td>
                              <span className={`badge ${v.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{v.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveVolunteer(v)} className="btn btn-sm btn-outline-primary py-0">Open</button>
                                <button onClick={() => deleteVolunteerApplication(v.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {inboxSubTab === 'donations' && (
                <div className="custom-card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Support Type</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map(d => (
                          <tr key={d.id}>
                            <td className="fw-semibold small">{d.name}</td>
                            <td className="small">{d.category}</td>
                            <td className="small text-muted">{d.supportType}</td>
                            <td>
                              <span className={`badge ${d.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{d.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveDonation(d)} className="btn btn-sm btn-outline-primary py-0">Open</button>
                                <button onClick={() => deleteDonationInquiry(d.id)} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────
             TAB: SETTINGS
             ────────────────────────────── */}
          
          {adminTab === 'members' && (
            <div className="animation-fade-in">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <h2 className="h3 fw-bold text-dark mb-1">Members Directory</h2>
                  <p className="text-muted mb-0 small">Manage NPC Associations, Clubs, Federations, and DPSCO Contacts.</p>
                </div>
              </div>

              {/* Associations */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0">National Associations</h3>
                  <button onClick={() => { setEditingAssocId(null); setAssocFormOpen(!assocFormOpen); }} className="btn btn-primary btn-sm fw-bold px-4">
                    <i className="fas fa-plus me-2"></i> {assocFormOpen ? 'Close Form' : 'New Association'}
                  </button>
                </div>
                {assocFormOpen && (
                  <form onSubmit={handleAssocSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                    <div className="col-md-6"><label className="form-label small fw-bold">Name</label><input type="text" className="form-control" required value={assocForm.name} onChange={e => setAssocForm({ ...assocForm, name: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label small fw-bold">Acronym</label><input type="text" className="form-control" required value={assocForm.acronym} onChange={e => setAssocForm({ ...assocForm, acronym: e.target.value })} /></div>
                    <div className="col-md-3"><label className="form-label small fw-bold">Icon (fa-class)</label><input type="text" className="form-control" required value={assocForm.icon} onChange={e => setAssocForm({ ...assocForm, icon: e.target.value })} /></div>
                    <div className="col-12"><label className="form-label small fw-bold">Description</label><textarea className="form-control" required value={assocForm.desc} onChange={e => setAssocForm({ ...assocForm, desc: e.target.value })} rows={3}></textarea></div>
                    <div className="col-12"><label className="form-label small fw-bold">Activities (comma separated)</label><input type="text" className="form-control" value={assocForm.activities.join(', ')} onChange={e => setAssocForm({ ...assocForm, activities: e.target.value.split(',').map(s=>s.trim()) })} /></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary btn-sm px-4">Save Association</button></div>
                  </form>
                )}
                <div className="table-responsive bg-white rounded shadow-sm border"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Icon</th><th>Name</th><th>Acronym</th><th>Actions</th></tr></thead><tbody>
                  {npcAssociations.map(p => (
                    <tr key={p.id}>
                      <td><i className={`fas ${p.icon} text-primary`}></i></td>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.acronym}</td>
                      <td>
                        <button onClick={() => { setAssocForm(p); setEditingAssocId(p.id); setAssocFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 me-2">Edit</button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcAssociation(p.id); }} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>

              {/* Member Clubs & Teams */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0">Member Clubs & Founder Teams</h3>
                  <button onClick={() => { setEditingClubId(null); setClubFormOpen(!clubFormOpen); }} className="btn btn-primary btn-sm fw-bold px-4">
                    <i className="fas fa-plus me-2"></i> {clubFormOpen ? 'Close Form' : 'New Club/Team'}
                  </button>
                </div>
                {clubFormOpen && (
                  <form onSubmit={handleClubSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                    <div className="col-md-6"><label className="form-label small fw-bold">Name</label><input type="text" className="form-control" required value={clubForm.name} onChange={e => setClubForm({ ...clubForm, name: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Location / Province</label><input type="text" className="form-control" required value={clubForm.location} onChange={e => setClubForm({ ...clubForm, location: e.target.value })} /></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary btn-sm px-4">Save Club/Team</button></div>
                  </form>
                )}
                <div className="table-responsive bg-white rounded shadow-sm border"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Name</th><th>Location / Province</th><th>Actions</th></tr></thead><tbody>
                  {npcClubs.map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.location}</td>
                      <td>
                        <button onClick={() => { setClubForm(p); setEditingClubId(p.id); setClubFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 me-2">Edit</button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcClub(p.id); }} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>

              {/* Federations */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0">NPC Federations</h3>
                  <button onClick={() => { setEditingFedId(null); setFedFormOpen(!fedFormOpen); }} className="btn btn-primary btn-sm fw-bold px-4">
                    <i className="fas fa-plus me-2"></i> {fedFormOpen ? 'Close Form' : 'New Federation'}
                  </button>
                </div>
                {fedFormOpen && (
                  <form onSubmit={handleFedSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                    <div className="col-md-6"><label className="form-label small fw-bold">Name</label><input type="text" className="form-control" required value={fedForm.name} onChange={e => setFedForm({ ...fedForm, name: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Role</label><input type="text" className="form-control" required value={fedForm.role} onChange={e => setFedForm({ ...fedForm, role: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Website</label><input type="text" className="form-control" value={fedForm.website} onChange={e => setFedForm({ ...fedForm, website: e.target.value })} /></div>
                    <div className="col-md-6">
                        <CMSImageField 
                          label="Federation Logo" 
                          value={fedForm.logo} 
                          onChange={(url) => setFedForm({ ...fedForm, logo: url })} 
                          openMediaSelector={openMediaSelector} 
                          uploadMediaFile={uploadMediaFile} 
                          category="partners"
                          entity={fedForm.name || 'federation'}
                        />
                    </div>
                    <div className="col-12"><label className="form-label small fw-bold">Description</label><textarea className="form-control" required value={fedForm.desc} onChange={e => setFedForm({ ...fedForm, desc: e.target.value })} rows={3}></textarea></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary btn-sm px-4">Save Federation</button></div>
                  </form>
                )}
                <div className="table-responsive bg-white rounded shadow-sm border"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Logo</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead><tbody>
                  {npcFederations.map(p => (
                    <tr key={p.id}>
                      <td><img src={p.logo} alt={p.name} style={{width:'40px'}} /></td>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.role}</td>
                      <td>
                        <button onClick={() => { setFedForm({name:p.name, logo:p.logo, website:p.website||'', role:p.role, desc:p.desc, order:p.order, active:p.active}); setEditingFedId(p.id); setFedFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 me-2">Edit</button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcFederation(p.id); }} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>

              {/* DPSCO Contacts */}
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="h5 fw-bold mb-0">DPSCO Contacts</h3>
                  <button onClick={() => { setEditingDpscoId(null); setDpscoFormOpen(!dpscoFormOpen); }} className="btn btn-primary btn-sm fw-bold px-4">
                    <i className="fas fa-plus me-2"></i> {dpscoFormOpen ? 'Close Form' : 'New DPSCO Contact'}
                  </button>
                </div>
                {dpscoFormOpen && (
                  <form onSubmit={handleDpscoSubmit} className="custom-card p-4 mb-4 row g-3 bg-light border">
                    <div className="col-md-4"><label className="form-label small fw-bold">Province</label>
                      <select className="form-select" value={dpscoForm.province} onChange={e => setDpscoForm({...dpscoForm, province: e.target.value})}>
                        <option value="Kigali City">Kigali City</option><option value="Northern Province">Northern Province</option><option value="Southern Province">Southern Province</option><option value="Eastern Province">Eastern Province</option><option value="Western Province">Western Province</option>
                      </select>
                    </div>
                    <div className="col-md-4"><label className="form-label small fw-bold">District</label><input type="text" className="form-control" required value={dpscoForm.district} onChange={e => setDpscoForm({ ...dpscoForm, district: e.target.value })} /></div>
                    <div className="col-md-4"><label className="form-label small fw-bold">Coordinator</label><input type="text" className="form-control" required value={dpscoForm.coordinator} onChange={e => setDpscoForm({ ...dpscoForm, coordinator: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Phone</label><input type="text" className="form-control" required value={dpscoForm.phone} onChange={e => setDpscoForm({ ...dpscoForm, phone: e.target.value })} /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Email</label><input type="email" className="form-control" required value={dpscoForm.email} onChange={e => setDpscoForm({ ...dpscoForm, email: e.target.value })} /></div>
                    <div className="col-12"><button type="submit" className="btn btn-primary btn-sm px-4">Save Contact</button></div>
                  </form>
                )}
                <div className="table-responsive bg-white rounded shadow-sm border"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Province</th><th>District</th><th>Coordinator</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead><tbody>
                  {dpscoContacts.map(p => (
                    <tr key={p.id}>
                      <td><span className="badge bg-secondary-soft text-secondary">{p.province}</span></td>
                      <td className="fw-bold">{p.district}</td>
                      <td>{p.coordinator}</td>
                      <td>{p.phone}</td>
                      <td>{p.email}</td>
                      <td>
                        <button onClick={() => { setDpscoForm(p); setEditingDpscoId(p.id); setDpscoFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 me-2">Edit</button>
                        <button onClick={() => { if(confirm('Delete?')) deleteDpscoContact(p.id); }} className="btn btn-sm btn-outline-danger py-0">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>

            </div>
          )}

          {adminTab === 'settings' && (
            <div style={{ maxWidth: '800px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-sliders" style={{ fontSize: '1.3rem', color: '#0072C6' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Site & Contact Settings</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>Configure global site details, contact info, and social links.</p>
                  </div>
                </div>

                {settingsMsg && (
                  <div style={{ padding: '12px 16px', background: settingsMsg.includes('success') ? '#E8F5E9' : '#FFEBEE', border: `1px solid ${settingsMsg.includes('success') ? '#C8E6C9' : '#FFCDD2'}`, borderRadius: '8px', color: settingsMsg.includes('success') ? '#2E7D32' : '#C62828', fontSize: '0.85rem', marginBottom: '20px', fontWeight: 500 }}>
                    <i className={`fas ${settingsMsg.includes('success') ? 'fa-circle-check' : 'fa-triangle-exclamation'} me-2`} />{settingsMsg}
                  </div>
                )}

                <form onSubmit={handleSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Site Name</label>
                      <input type="text" className="form-control" value={sysSettings.siteName || ''} onChange={e => setSysSettings(p => ({ ...p, siteName: e.target.value }))} placeholder="National Paralympic Committee..." required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Contact Email</label>
                      <input type="email" className="form-control" value={sysSettings.contactEmail || ''} onChange={e => setSysSettings(p => ({ ...p, contactEmail: e.target.value }))} placeholder="info@npcrwanda.org" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Contact Phone</label>
                      <input type="text" className="form-control" value={sysSettings.contactPhone || ''} onChange={e => setSysSettings(p => ({ ...p, contactPhone: e.target.value }))} placeholder="+250 788 123 456" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Physical Address</label>
                      <input type="text" className="form-control" value={sysSettings.address || ''} onChange={e => setSysSettings(p => ({ ...p, address: e.target.value }))} placeholder="Amahoro Stadium, Kigali" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button type="submit" disabled={settingsSaving} style={{ background: '#0072C6', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '0.88rem', cursor: settingsSaving ? 'not-allowed' : 'pointer', opacity: settingsSaving ? 0.7 : 1 }}>
                      <i className="fas fa-floppy-disk me-2" />{settingsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" onClick={() => setSettingsMsg('')} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '8px', padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ──────────────────────────────
             TAB: PROFILE
             ────────────────────────────── */}
          {adminTab === 'profile' && (
            <div style={{ maxWidth: '600px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-user-gear" style={{ fontSize: '1.3rem', color: '#FFA000' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>My Account Settings</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>Update password hash credentials and editor name.</p>
                  </div>
                </div>

                {profileMsg && <div className="alert alert-success small mb-3">{profileMsg}</div>}
                {profileError && <div className="alert alert-danger small mb-3">{profileError}</div>}

                 <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Choose Profile Picture */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Choose Profile Picture</label>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '4px 0' }}>
                      {['avatar-1.svg', 'avatar-2.svg', 'avatar-3.svg', 'avatar-4.svg', 'avatar-5.svg', 'avatar-6.svg'].map(av => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setSelectedAvatar(av)}
                          style={{
                            background: 'none',
                            border: selectedAvatar === av ? '2px solid var(--primary-blue)' : '2px solid transparent',
                            borderRadius: '50%',
                            padding: '3px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            transform: selectedAvatar === av ? 'scale(1.1)' : 'none'
                          }}
                        >
                          <img src={`/assets/img/${av}`} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', background: '#F8FAFC' }} alt="Avatar choice" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Full Name</label>
                    <input type="text" className="form-control" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Login Email</label>
                    <input type="email" className="form-control" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>New Password (leave blank to keep current)</label>
                    <input type="password" className="form-control" value={profile.password} onChange={e => setProfile({ ...profile, password: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Confirm Password</label>
                    <input type="password" className="form-control" value={profile.confirmPassword} onChange={e => setProfile({ ...profile, confirmPassword: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button type="submit" disabled={profileSaving} style={{ background: '#0072C6', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '0.88rem', cursor: profileSaving ? 'not-allowed' : 'pointer' }}>
                      {profileSaving ? 'Saving...' : 'Update Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

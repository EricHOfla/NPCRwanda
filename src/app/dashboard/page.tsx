'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccessRestricted from '@/components/shared/AccessRestricted';
import { hasPermission } from '@/lib/rbac';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/context/LanguageContext';
import { DEFAULT_SITE_CONTENT } from '@/lib/defaultSiteContent';
import {
  useData,
  PUBLIC_BUNDLE_QUERY_KEY,
  Athlete,
  NewsArticle,
  Career,
  JobApplication,
  ContactMessage,
  Sport,
  Leader,
  VolunteerApplication,
  DonationInquiry,
  Partner,
  SocialLink,
  Event,
  MediaAsset
} from '@/context/DataContext';
import { isAnnouncementCategory } from '@/lib/newsUtils';
import SubscribersTab from '@/components/SubscribersTab';
import DashboardAnalytics from '@/components/DashboardAnalytics';
import MarkdownRenderer from '@/components/MarkdownRenderer';


// Real-time Event Timing & Upcoming Status Checker
const getEventTiming = (ev: { date?: string; endDate?: string; status?: string }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const start = (ev.date || '').trim();
  const end = (ev.endDate || '').trim();

  if (ev.status === 'Cancelled') {
    return { isUpcoming: false, isOngoing: false, isPast: false, isCancelled: true, statusText: 'Cancelled', badgeClass: 'bg-danger' };
  }
  if (ev.status === 'Completed' && start && start < todayStr && (!end || end < todayStr)) {
    return { isUpcoming: false, isOngoing: false, isPast: true, isCancelled: false, statusText: 'Completed', badgeClass: 'bg-secondary' };
  }
  // Ongoing: started on or before today and ends on or after today, OR single-day today, OR explicit Ongoing status
  if ((start && end && start <= todayStr && end >= todayStr) || (start && start === todayStr) || ev.status === 'Ongoing') {
    return { isUpcoming: true, isOngoing: true, isPast: false, isCancelled: false, statusText: 'Ongoing Today', badgeClass: 'bg-success' };
  }
  // Upcoming: start date is strictly in the future
  if (start && start > todayStr) {
    const d = new Date(start);
    const today = new Date(todayStr);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const urgency = diffDays === 1 ? 'Tomorrow' : (diffDays > 0 ? `In ${diffDays} days` : 'Upcoming');
    return { isUpcoming: true, isOngoing: false, isPast: false, isCancelled: false, statusText: urgency, badgeClass: 'bg-primary' };
  }
  // Fallback if status is marked Upcoming with no past date
  if (ev.status === 'Upcoming' && (!start || start >= todayStr)) {
    return { isUpcoming: true, isOngoing: false, isPast: false, isCancelled: false, statusText: 'Upcoming', badgeClass: 'bg-primary' };
  }
  return { isUpcoming: false, isOngoing: false, isPast: true, isCancelled: false, statusText: 'Past Event', badgeClass: 'bg-secondary' };
};

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
  | 'governance'
  | 'partners'
  | 'site-content'
  | 'contacts'
  | 'subscribers'
  | 'settings'
  | 'profile'
  | 'pages'
  | 'volunteers'
  | 'members'
  | 'users';

// Reusable Custom CMS Components
interface CMSImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadMediaFile: (file: File, category?: string, entity?: string) => Promise<MediaAsset>;
  category?: 'athletes' | 'news' | 'events' | 'partners' | 'leaders' | 'site' | 'governance' | string;
  entity?: string;
  accept?: string;
  isDocument?: boolean;
}

const isImageFilePath = (path: string) => {
  if (!path) return false;
  const clean = path.split('?')[0].toLowerCase();
  return clean.endsWith('.jpg') || clean.endsWith('.jpeg') || clean.endsWith('.png') || 
         clean.endsWith('.webp') || clean.endsWith('.gif') || clean.endsWith('.svg');
};

const getDocTypeDetails = (path: string) => {
  if (!path || path === '#') return { icon: 'fa-file-lines', color: '#64748B', bg: '#F1F5F9', label: 'File' };
  const clean = path.split('?')[0].toLowerCase();
  if (clean.endsWith('.pdf')) return { icon: 'fa-file-pdf', color: '#DC2626', bg: '#FEE2E2', label: 'PDF Document' };
  if (clean.endsWith('.doc') || clean.endsWith('.docx')) return { icon: 'fa-file-word', color: '#2563EB', bg: '#DBEAFE', label: 'Word Document' };
  if (clean.endsWith('.xls') || clean.endsWith('.xlsx') || clean.endsWith('.csv')) return { icon: 'fa-file-excel', color: '#16A34A', bg: '#DCFCE7', label: 'Excel Spreadsheet' };
  if (clean.endsWith('.ppt') || clean.endsWith('.pptx')) return { icon: 'fa-file-powerpoint', color: '#EA580C', bg: '#FFEDD5', label: 'PowerPoint' };
  if (clean.endsWith('.txt') || clean.endsWith('.rtf')) return { icon: 'fa-file-lines', color: '#475569', bg: '#F1F5F9', label: 'Text File' };
  if (clean.endsWith('.zip') || clean.endsWith('.rar')) return { icon: 'fa-file-zipper', color: '#7C3AED', bg: '#EDE9FE', label: 'Archive' };
  return { icon: 'fa-file', color: '#0284C7', bg: '#E0F2FE', label: 'Document' };
};

const CMSImageField: React.FC<CMSImageFieldProps> = ({
  label,
  value,
  onChange,
  uploadMediaFile,
  category = 'site',
  entity,
  accept,
  isDocument = false,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => setPreviewError(false), [value]);

  const fileAccept = accept || (isDocument 
    ? '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.rtf,.odt,.ods,.odp,image/*,application/*' 
    : 'image/*');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMediaFile(file, category, entity);
      onChange(asset.url);
      alert(isDocument ? 'Document uploaded and selected successfully!' : 'Image uploaded and selected successfully!');
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('/')) return path;
    return `/assets/img/curated/${path}`;
  };

  const isImg = isImageFilePath(value);
  const docInfo = getDocTypeDetails(value);

  return (
    <div className="mb-3">
      <label className="form-label small fw-bold">{label}</label>
      
      {/* Current Preview */}
      {value && value !== '#' ? (
        <div className="mb-2 p-2 border rounded bg-light d-flex align-items-center gap-3">
          {isImg ? (
            <>
              {previewError ? (
                <div role="status" className="d-flex align-items-center justify-content-center text-muted border rounded" style={{ width: '80px', height: '60px', flexShrink: 0, fontSize: '0.65rem', textAlign: 'center', background: '#f8fafc' }}>
                  <span><i className="fas fa-image-slash d-block mb-1" />Preview unavailable</span>
                </div>
              ) : (
                <img
                  src={getFullImageUrl(value)}
                  style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', background: '#e2e8f0', flexShrink: 0 }}
                  alt="Selected image preview"
                  onError={() => setPreviewError(true)}
                />
              )}
            </>
          ) : (
            <div 
              style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '8px', 
                background: docInfo.bg, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0 
              }}
            >
              <i className={`fas ${docInfo.icon}`} style={{ fontSize: '1.8rem', color: docInfo.color }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="small text-truncate d-block fw-semibold text-dark" style={{ maxWidth: '100%' }} title={value}>
              {value}
            </span>
            <div className="d-flex align-items-center gap-2 mt-1">
              <span className="badge" style={{ backgroundColor: isImg ? '#0284C7' : docInfo.color, color: '#fff', fontSize: '0.68rem' }}>
                {isImg ? 'Image' : docInfo.label}
              </span>
              <a 
                href={getFullImageUrl(value)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="small text-primary text-decoration-none fw-semibold"
                style={{ fontSize: '0.75rem' }}
              >
                <i className="fas fa-arrow-up-right-from-square me-1" /> Open / Test Link
              </a>
            </div>
          </div>
          <button type="button" onClick={() => onChange('')} className="btn btn-sm btn-outline-danger py-1" title="Remove attachment">
            <i className="fas fa-trash" />
          </button>
        </div>
      ) : value === '#' ? (
        <div className="mb-2 p-2 border border-warning rounded bg-warning-subtle text-dark small d-flex align-items-center justify-content-between">
          <span className="d-flex align-items-center gap-2">
            <i className="fas fa-circle-exclamation text-warning" />
            <span>No file attached yet (Placeholder <code>#</code>). Upload a document below or paste a URL.</span>
          </span>
          <button type="button" onClick={() => onChange('')} className="btn btn-xs btn-outline-secondary py-0">Clear</button>
        </div>
      ) : (
        <div className="mb-2 p-3 border border-dashed rounded bg-light text-center small text-muted">
          {isDocument ? 'No document selected. Upload a document below or paste a link.' : 'No image selected.'}
        </div>
      )}

      {/* Manual URL Input */}
      <div className="input-group input-group-sm mb-2">
        <span className="input-group-text bg-light text-muted border-end-0">
          <i className="fas fa-link" style={{ fontSize: '0.75rem' }} />
        </span>
        <input 
          type="text" 
          className="form-control form-control-sm border-start-0 ps-1" 
          placeholder={isDocument ? "Or paste document URL / path directly..." : "Or paste image path directly..."}
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
        />
        {value && (
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onChange('')} title="Clear path">
            <i className="fas fa-times" />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="d-flex gap-2 flex-wrap">
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()} 
          className="btn btn-sm btn-outline-primary fw-semibold"
          disabled={uploading}
        >
          <i className={`fas ${uploading ? 'fa-spinner fa-spin' : isDocument ? 'fa-file-arrow-up' : 'fa-upload'} me-1`} /> 
          {uploading ? (isDocument ? 'Uploading Document...' : 'Uploading Photo...') : (isDocument ? 'Upload Document from Computer' : 'Upload Photo from Computer')}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept={fileAccept} 
          className="d-none" 
        />
      </div>
      {isDocument && (
        <span className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
          <i className="fas fa-check-circle text-success me-1" /> All documents allowed: PDF, Word (.doc/.docx), Excel (.xls/.xlsx), PowerPoint (.ppt/.pptx), Text, Images, etc.
        </span>
      )}
    </div>
  );
};

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  uploadMediaFile?: (file: File, category?: string, entity?: string) => Promise<MediaAsset>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  label,
  uploadMediaFile,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const imgInputRef = React.useRef<HTMLInputElement>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = textarea.value.substring(start, end) || defaultText;
    const replacement = before + selection + after;
    const newVal = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newVal);
    
    setTimeout(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selection.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    }, 0);
  };

  const handleInsertLink = () => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart || 0;
    const end = textarea?.selectionEnd || 0;
    const selectedText = textarea?.value.substring(start, end) || '';

    const url = prompt('Enter link URL (e.g. https://example.com or /news):', 'https://');
    if (!url) return;

    const linkText = selectedText || prompt('Enter link text (e.g. Read Document / Click Here):', 'Link Text') || 'Link';
    const markdownLink = `[${linkText}](${url})`;

    if (textarea) {
      const newVal = textarea.value.substring(0, start) + markdownLink + textarea.value.substring(end);
      onChange(newVal);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdownLink.length, start + markdownLink.length);
      }, 0);
    }
  };

  const handleInsertImage = () => {
    if (uploadMediaFile) {
      imgInputRef.current?.click();
    } else {
      const url = prompt('Enter image URL (e.g. https://... or /assets/...):', 'https://');
      if (!url) return;
      const alt = prompt('Enter image description (alt text):', 'Image') || 'Image';
      insertText(`![${alt}](`, ')', url);
    }
  };

  const handleImgFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadMediaFile) return;
    setImgUploading(true);
    try {
      const asset = await uploadMediaFile(file, 'news');
      const alt = prompt('Enter image description (alt text):', file.name.split('.')[0]) || 'Photo';
      insertText(`![${alt}](`, ')', asset.url);
      alert('Photo uploaded from computer and inserted successfully!');
    } catch (err: any) {
      alert(err.message || 'Photo upload failed');
    } finally {
      setImgUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  };

  return (
    <div className="border rounded bg-white mb-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center bg-light border-bottom px-3 py-2">
        <span className="small fw-bold text-dark">{label}</span>
        <div className="btn-group btn-group-sm">
          <button type="button" onClick={() => setPreviewMode(false)} className={`btn btn-sm ${!previewMode ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}>
            <i className="fas fa-edit me-1" />Write
          </button>
          <button type="button" onClick={() => setPreviewMode(true)} className={`btn btn-sm ${previewMode ? 'btn-primary fw-bold' : 'btn-outline-secondary'}`}>
            <i className="fas fa-eye me-1" />Preview
          </button>
        </div>
      </div>
      
      {!previewMode ? (
        <div>
          <div className="d-flex flex-wrap gap-1 p-2 bg-light border-bottom">
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small fw-bold" onClick={() => insertText('**', '**', 'bold text')} title="Bold (**text**)">
              <i className="fas fa-bold" /> Bold
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('*', '*', 'italic text')} title="Italic (*text*)">
              <i className="fas fa-italic" /> Italic
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('<u>', '</u>', 'underlined text')} title="Underline (<u>text</u>)">
              <i className="fas fa-underline" /> Underline
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('## ', '', 'Subheading Title')} title="Heading 2 (## Title)">
              <i className="fas fa-heading" /> H2
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('### ', '', 'Section Title')} title="Heading 3 (### Title)">
              <i className="fas fa-heading" /> H3
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('- ', '', 'List item')} title="Bullet List (- item)">
              <i className="fas fa-list-ul" /> List
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('1. ', '', 'First item')} title="Numbered List (1. item)">
              <i className="fas fa-list-ol" /> Numbered
            </button>
            <button type="button" className="btn btn-xs btn-outline-primary py-1 px-2 small fw-bold" onClick={handleInsertLink} title="Insert Link ([Text](URL))">
              <i className="fas fa-link me-1" /> Add Link
            </button>
            <button type="button" className="btn btn-xs btn-outline-success py-1 px-2 small fw-bold" onClick={handleInsertImage} disabled={imgUploading} title="Upload Photo from Computer (![Alt](URL))">
              <i className={`fas ${imgUploading ? 'fa-spinner fa-spin' : 'fa-image'} me-1`} /> {imgUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
            <input type="file" ref={imgInputRef} onChange={handleImgFileChange} accept="image/*" className="d-none" />
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('> ', '', 'Quoted statement')} title="Quote (> Quote)">
              <i className="fas fa-quote-right" /> Quote
            </button>
            <button type="button" className="btn btn-xs btn-outline-dark py-1 px-2 small" onClick={() => insertText('| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n')} title="Table">
              <i className="fas fa-table" /> Table
            </button>
          </div>
          <textarea
            ref={textareaRef}
            className="form-control border-0 rounded-0 p-3"
            rows={8}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Type your content here... Supports Markdown & HTML tags (**bold**, *italic*, [link text](url), ![image](url), <h2>Headings</h2>, <ul>lists</ul>, etc.)"
            style={{ fontSize: '0.95rem', fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace', lineHeight: 1.6 }}
          />
        </div>
      ) : (
        <div className="p-4 bg-white" style={{ minHeight: '180px' }}>
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <div className="text-muted italic py-4 text-center">
              <i className="fas fa-file-lines fa-2x mb-2 d-block text-secondary" />
              Nothing to preview. Switch to "Write" tab to add content.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
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
    volunteers,
    donations,
    jobApplications,
    markJobApplicationRead,
    updateJobApplicationStatus,
    deleteJobApplication,
    partners,
    siteContent,
    siteContentList,
    contactInfo,
    updateSystemSettings,
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
    updateCareer,
    deleteCareer,
    closeCareer,
    markContactAsRead,
    deleteContactMessage,
    addSport,
    updateSport,
    deleteSport,
    addLeader,
    updateLeader,
    deleteLeader,
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
    fetchProtectedData,
    uploadMediaFile,
    npcAssociations, npcClubs, npcFederations, dpscoContacts,
    addNpcAssociation, updateNpcAssociation, deleteNpcAssociation,
    addNpcClub, updateNpcClub, deleteNpcClub,
    addNpcFederation, updateNpcFederation, deleteNpcFederation,
    addDpscoContact, updateDpscoContact, deleteDpscoContact,
  } = useData();

  // Today's date helpers — used as default values in add-item forms
  const todayIso = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
  const todayMonthYear = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // e.g. "Oct 2026"

  const [adminTab, setAdminTab] = useState<AdminTab>('overview');
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
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [partnerSearch, setPartnerSearch] = useState('');
  const [activeEditPage, setActiveEditPage] = useState<string | null>('home');
  const [previewModeEnabled, setPreviewModeEnabled] = useState(false);
  const [contentSearch, setContentSearch] = useState('');

  // Real-time synchronization & overview events tab
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [overviewEventsTab, setOverviewEventsTab] = useState<'upcoming' | 'past'>('upcoming');


  // Form states
  const [athleteFormOpen, setAthleteFormOpen] = useState(false);
  const [editingAthleteId, setEditingAthleteId] = useState<string | null>(null);
  const [athleteForm, setAthleteForm] = useState({
    name: '',
    sport: 'Sitting Volleyball',
    status: 'Active',
    country: 'Rwanda',
    avatar: 'avatar-1.svg',
    desc: '',
    achievements: ''
  });

  const [newsFormOpen, setNewsFormOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    date: todayMonthYear,
    category: 'Sport',
    status: 'Draft',
    img: '',
    desc: '',
    content: '',
    slug: ''
  });

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: todayIso,
    endDate: todayIso,
    location: '',
    category: 'National',
    status: 'Upcoming',
    img: '',
    featured: false,
    resultsSummary: '',
    results: ''
  });

  const [careerFormOpen, setCareerFormOpen] = useState(false);
  const [editingCareerId, setEditingCareerId] = useState<string | null>(null);
  const [careerFormError, setCareerFormError] = useState('');
  const [careerForm, setCareerForm] = useState({
    title: '',
    location: 'Kigali',
    status: 'Open',
    desc: '',
    slug: '',
    deadline: '',
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
    impairment: '',
    order: 0 as number,
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
    logo: '',
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
  const [siteForm, setSiteForm] = useState<Record<string, string>>(DEFAULT_SITE_CONTENT);

  // Inbox Modal Detail states
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [activeVolunteer, setActiveVolunteer] = useState<VolunteerApplication | null>(null);
  const [activeDonation, setActiveDonation] = useState<DonationInquiry | null>(null);
  const [activeJobApplication, setActiveJobApplication] = useState<JobApplication | null>(null);
  const [jobAppSearch, setJobAppSearch] = useState('');
  const [inboxSubTab, setInboxSubTab] = useState<'messages' | 'volunteers' | 'donations' | 'applications'>('messages');

  const [inboxFeedback, setInboxFeedback] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Track pending deletion per submission so the correct row/button shows progress.
  const [deletingSubmissionIds, setDeletingSubmissionIds] = useState<string[]>([]);
  const runSubmissionDelete = async (
    id: string,
    remove: (id: string) => Promise<boolean | void>,
    label = 'Record'
  ): Promise<boolean> => {
    if (deletingSubmissionIds.includes(id)) return false;
    setDeletingSubmissionIds(prev => [...prev, id]);
    setInboxFeedback(null);
    try {
      const res = await remove(id);
      const ok = res !== false;
      if (ok) {
        setInboxFeedback({
          type: 'success',
          text: `${label} deleted successfully from database!`,
        });
        setTimeout(() => {
          setInboxFeedback(prev => (prev?.text.includes(label) ? null : prev));
        }, 6000);
        return true;
      } else {
        setInboxFeedback({
          type: 'danger',
          text: `Failed to delete ${label.toLowerCase()} from database. Please check your connection.`,
        });
        return false;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Server error';
      setInboxFeedback({
        type: 'danger',
        text: `Error deleting ${label.toLowerCase()}: ${errMsg}`,
      });
      return false;
    } finally {
      setDeletingSubmissionIds(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const [cleaningSpam, setCleaningSpam] = useState(false);
  const handleCleanSpam = async (target: 'messages' | 'volunteers' | 'donations' | 'applications') => {
    const targetMap: Record<string, string> = {
      messages: 'contacts',
      volunteers: 'volunteers',
      donations: 'donations',
      applications: 'applications',
    };
    const apiTarget = targetMap[target];
    if (!apiTarget || apiTarget === 'applications') {
      alert('Spam cleanup is available for Messages, Volunteers, and Donations.');
      return;
    }

    const choice = prompt(
      `Spam Cleanup for ${target.toUpperCase()}:\n\n` +
      `Type 'spam' to delete obvious bot and test submissions (e.g. example.com, test.com).\n` +
      `Type 'all' to delete all submissions in this tab.\n\n` +
      `Enter 'spam' or 'all':`,
      'spam'
    );
    if (!choice || (choice.trim() !== 'spam' && choice.trim() !== 'all')) return;

    try {
      setCleaningSpam(true);
      const res = await fetch('/api/admin/clean-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: apiTarget, mode: choice.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clean records');
      await fetchProtectedData();
      alert(`Cleanup complete: Removed ${data.cleaned?.[apiTarget] ?? 0} record(s).`);
    } catch (err: any) {
      alert(err.message || 'Error executing cleanup');
    } finally {
      setCleaningSpam(false);
    }
  };

  // Track whether tab/page state has been restored on client mount
  const isTabInitializedRef = useRef(false);

  // Restore active tab and page on client mount from URL or localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab') as AdminTab | null;
    const urlPage = params.get('page');
    const urlSubTab = params.get('subtab') as 'messages' | 'volunteers' | 'donations' | 'applications' | null;

    const storedTab = localStorage.getItem('admin_active_tab') as AdminTab | null;
    const storedPage = localStorage.getItem('admin_active_page');
    const storedSubTab = localStorage.getItem('admin_inbox_subtab') as 'messages' | 'volunteers' | 'donations' | 'applications' | null;

    const targetTab = urlTab || storedTab || 'overview';
    const targetPage = urlPage !== null && urlPage !== undefined ? urlPage : storedPage;
    const targetSubTab = urlSubTab || storedSubTab;

    const PAGE_IDS = ['athletes', 'sports', 'news', 'announcements', 'events', 'governance', 'leadership', 'careers', 'home', 'about', 'partners', 'npc-background', 'contact'];

    if (PAGE_IDS.includes(targetTab)) {
      setAdminTab('pages');
      setActiveEditPage(targetTab);
    } else {
      setAdminTab(targetTab);
      if (targetTab === 'pages' && targetPage) {
        setActiveEditPage(targetPage);
      }
    }

    if (targetSubTab && ['messages', 'volunteers', 'donations', 'applications'].includes(targetSubTab)) {
      setInboxSubTab(targetSubTab);
    }

    isTabInitializedRef.current = true;
  }, []);

  // Sync active tab, page, and subtab to URL and localStorage when changed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isTabInitializedRef.current) return;

    try {
      localStorage.setItem('admin_active_tab', adminTab);
      if (adminTab === 'pages' && activeEditPage) {
        localStorage.setItem('admin_active_page', activeEditPage);
      } else {
        localStorage.removeItem('admin_active_page');
      }

      if (adminTab === 'contacts') {
        localStorage.setItem('admin_inbox_subtab', inboxSubTab);
      }

      // Update URL query parameters without triggering full page reload
      const url = new URL(window.location.href);
      if (adminTab === 'overview') {
        url.searchParams.delete('tab');
        url.searchParams.delete('page');
        url.searchParams.delete('subtab');
      } else {
        url.searchParams.set('tab', adminTab);
        if (adminTab === 'pages' && activeEditPage) {
          url.searchParams.set('page', activeEditPage);
        } else {
          url.searchParams.delete('page');
        }
        if (adminTab === 'contacts' && inboxSubTab !== 'messages') {
          url.searchParams.set('subtab', inboxSubTab);
        } else {
          url.searchParams.delete('subtab');
        }
      }

      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore storage/url write errors
    }
  }, [adminTab, activeEditPage, inboxSubTab]);

  // Support browser Back and Forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTab = (params.get('tab') as AdminTab | null) || 'overview';
      const urlPage = params.get('page');
      const urlSubTab = params.get('subtab') as 'messages' | 'volunteers' | 'donations' | 'applications' | null;

      const PAGE_IDS = ['athletes', 'sports', 'news', 'announcements', 'events', 'governance', 'leadership', 'careers', 'home', 'about', 'partners', 'npc-background', 'contact'];
      if (PAGE_IDS.includes(urlTab)) {
        setAdminTab('pages');
        setActiveEditPage(urlTab);
      } else {
        setAdminTab(urlTab);
        setActiveEditPage(urlTab === 'pages' ? urlPage : null);
      }
      if (urlSubTab && ['messages', 'volunteers', 'donations', 'applications'].includes(urlSubTab)) {
        setInboxSubTab(urlSubTab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [pageSizes] = useState({ 
    athletes: 10, 
    news: 10, 
    events: 10, 
    careers: 10, 
    contacts: 10,
    sports: 10,
    leaders: 10,
    partners: 10,
    media: 10,
    donations: 10,
    volunteers: 10,
    applications: 10,
    announcements: 10,
    socialLinks: 10,
    govDocs: 10,
    govPolicies: 10,
    associations: 10,
    clubs: 10,
    federations: 10,
    dpsco: 10,
    users: 10
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
    volunteers: 1,
    applications: 1,
    announcements: 1,
    socialLinks: 1,
    govDocs: 1,
    govPolicies: 1,
    associations: 1,
    clubs: 1,
    federations: 1,
    dpsco: 1,
    users: 1
  });

  // System Settings state
  const [sysSettings, setSysSettings] = useState<Record<string, string>>({});
  const [savedSysSettings, setSavedSysSettings] = useState<Record<string, string>>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Admin Profile state
  const [profile, setProfile] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id?: string; name?: string; email?: string; role?: string }>({});

  // System User Management States & CRUD
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  }>({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
  });
  const [userSaving, setUserSaving] = useState(false);
  const [userMsg, setUserMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Role permissions helpers
  const userRole = (currentUser.role || 'EDITOR') as 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isAdmin = userRole === 'ADMIN' || isSuperAdmin;
  const isEditor = userRole === 'EDITOR';

  // Granular Permission Gates
  const canAccessSettings = hasPermission(userRole, 'system-settings.view');
  const canAccessUsers = hasPermission(userRole, 'users.view');
  const canAccessMembers = hasPermission(userRole, 'members.view');
  const canAccessDonations = hasPermission(userRole, 'donations.view');
  const canAccessCommunity = hasPermission(userRole, 'community.view');
  const editorAllowedPages = ['athletes', 'sports', 'news', 'announcements', 'events', 'careers'];
  const isPageRestricted = (page: string | null) => {
    if (isSuperAdmin) return false;
    if (isEditor && !editorAllowedPages.includes(page || 'home')) return true;
    return false;
  };

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

  // Fetch System Users
  const fetchSystemUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setSystemUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserSaving(true);
    setUserMsg(null);
    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : '/api/users';
      const method = editingUserId ? 'PUT' : 'POST';
      const payload: Record<string, any> = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
      };
      if (userForm.password && userForm.password.trim()) {
        payload.password = userForm.password;
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setUserMsg({ type: 'danger', text: data.error || 'Failed to save user account' });
      } else {
        setUserMsg({ type: 'success', text: data.message || 'User saved successfully.' });
        setUserFormOpen(false);
        setEditingUserId(null);
        setUserForm({ name: '', email: '', password: '', role: 'EDITOR' });
        fetchSystemUsers();
      }
    } catch (err: any) {
      setUserMsg({ type: 'danger', text: err.message || 'Network error saving user' });
    } finally {
      setUserSaving(false);
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
    });
    setUserMsg(null);
    setUserFormOpen(true);
  };

  const handleDeleteUser = async (u: any) => {
    if (!confirm(`Are you sure you want to permanently delete user account "${u.name}" (${u.email})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to delete user account');
      } else {
        setUserMsg({ type: 'success', text: data.message || 'User deleted successfully.' });
        fetchSystemUsers();
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert('Network error deleting user');
    }
  };

  // Fetch system settings with fallback to contactInfo
  const fetchSystemSettings = useCallback(async () => {
    try {
      const r = await fetch('/api/system-settings');
      if (r.ok) {
        const data = await r.json();
        setSysSettings(prev => ({
          ...prev,
          siteName: data.siteName || prev.siteName || '',
          contactEmail: data.contactEmail || prev.contactEmail || contactInfo?.email || '',
          contactPhone: data.contactPhone || prev.contactPhone || contactInfo?.phone || '',
          address: data.address || prev.address || contactInfo?.address || '',
          facebook: data.facebook !== undefined ? data.facebook : prev.facebook,
          twitter: data.twitter !== undefined ? data.twitter : prev.twitter,
          instagram: data.instagram !== undefined ? data.instagram : prev.instagram,
          ...data,
        }));
        setSavedSysSettings(data);
      } else if (contactInfo) {
        setSysSettings(prev => ({
          ...prev,
          contactPhone: contactInfo.phone || prev.contactPhone || '',
          contactEmail: contactInfo.email || prev.contactEmail || '',
          address: contactInfo.address || prev.address || '',
        }));
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
    }
  }, [contactInfo]);

  // Lazy-load system settings only when the settings tab is opened
  useEffect(() => {
    if (adminTab === 'settings') {
      fetchSystemSettings();
    }
  }, [adminTab, fetchSystemSettings]);

  // Session security & idle management
  const lastActivityRef = useRef<number>(Date.now());
  const [authVerified, setAuthVerified] = useState(true);

  const verifySession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile');
      if (res.status === 401 || res.status === 403) {
        queryClient.clear();
        try {
          localStorage.removeItem('admin_active_tab');
          localStorage.removeItem('admin_active_page');
          localStorage.removeItem('admin_inbox_subtab');
        } catch {}
        router.push('https://admin.npcrwanda.org/login?expired=true');
        return false;
      }
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        setProfile(prev => ({ ...prev, name: data.name, email: data.email }));
        setAuthVerified(true);
        return true;
      }
    } catch (err) {
      console.error('Session verification error:', err);
    }
    return false;
  }, [queryClient, router]);

  // Initial mount data fetch with session verification guard
  useEffect(() => {
    verifySession().then(isValid => {
      if (isValid) {
        // Run all three in parallel - no sequential waterfall
        void Promise.all([fetchGovData(), fetchProtectedData(), fetchSystemUsers()]);
      }
    });
  }, [verifySession, fetchSystemUsers]);

  // Real-time synchronization handler
  const refreshRealTimeData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: PUBLIC_BUNDLE_QUERY_KEY }),
        fetchProtectedData(),
        fetchGovData(),
      ]);
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Error refreshing real-time data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, fetchProtectedData, fetchGovData]);

  // Real-time auto-polling: refresh data every 30 seconds and on window focus
  useEffect(() => {
    if (!authVerified) return;
    setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: PUBLIC_BUNDLE_QUERY_KEY });
      fetchProtectedData();
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 30000);

    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: PUBLIC_BUNDLE_QUERY_KEY });
      fetchProtectedData();
      setLastSyncTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [authVerified, queryClient, fetchProtectedData]);

  // Inactivity timeout (60 minutes) & periodic session check
  useEffect(() => {
    if (!authVerified) return;

    const IDLE_LIMIT = 60 * 60 * 1000; // 60 minutes of inactivity

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', updateActivity, { passive: true });
    window.addEventListener('keydown', updateActivity, { passive: true });
    window.addEventListener('mousedown', updateActivity, { passive: true });
    window.addEventListener('touchstart', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });

    // When the user focuses back on this tab after being away
    const handleFocus = () => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > IDLE_LIMIT) {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        queryClient.clear();
        try {
          localStorage.removeItem('admin_active_tab');
          localStorage.removeItem('admin_active_page');
          localStorage.removeItem('admin_inbox_subtab');
        } catch {}
        router.push('https://admin.npcrwanda.org/login?expired=true');
      } else {
        verifySession();
      }
    };

    window.addEventListener('focus', handleFocus);

    // Periodic heartbeat check every 2 minutes
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;
      if (idleTime > IDLE_LIMIT) {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        queryClient.clear();
        try {
          localStorage.removeItem('admin_active_tab');
          localStorage.removeItem('admin_active_page');
          localStorage.removeItem('admin_inbox_subtab');
        } catch {}
        router.push('https://admin.npcrwanda.org/login?expired=true');
      } else {
        verifySession();
      }
    }, 2 * 60 * 1000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('mousedown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      window.removeEventListener('scroll', updateActivity);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [authVerified, verifySession, queryClient, router]);

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
    const initial: Record<string, string> = { ...DEFAULT_SITE_CONTENT };
    if (siteContentList && siteContentList.length > 0) {
      siteContentList.forEach(c => {
        if (c.value !== undefined && c.value !== null && c.value !== '') {
          initial[c.key] = c.value;
        }
      });
    }
    if (siteContent && typeof siteContent === 'object') {
      Object.keys(siteContent).forEach(k => {
        if (siteContent[k]) initial[k] = siteContent[k];
      });
    }
    setSiteForm(initial);
  }, [siteContentList, siteContent]);

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
        const updated = data.settings || sysSettings;
        setSysSettings(updated);
        setSavedSysSettings(updated);
        updateSystemSettings(updated);
        setSettingsMsg('Settings and contact details saved successfully!');

        // Also update contactInfo state in context if available
        if (updateContactInfo && (sysSettings.contactPhone || sysSettings.contactEmail || sysSettings.address)) {
          updateContactInfo({
            phone: sysSettings.contactPhone || contactInfo?.phone || '',
            email: sysSettings.contactEmail || contactInfo?.email || '',
            address: sysSettings.address || contactInfo?.address || '',
            mapUrl: contactInfo?.mapUrl || '',
          }).catch(() => {});
        }
      } else {
        setSettingsMsg(data.error || 'Failed to save settings.');
      }
    } catch {
      setSettingsMsg('An error occurred while saving settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSettingsCancel = () => {
    if (Object.keys(savedSysSettings).length > 0) {
      setSysSettings(savedSysSettings);
    } else {
      fetchSystemSettings();
    }
    setSettingsMsg('');
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
        queryClient.clear();
        try {
          localStorage.removeItem('admin_active_tab');
          localStorage.removeItem('admin_active_page');
          localStorage.removeItem('admin_inbox_subtab');
        } catch {}
        router.push('https://admin.npcrwanda.org/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Separate upcoming vs past events chronologically
  const upcomingEventsList = events
    .filter(ev => getEventTiming(ev).isUpcoming)
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : Infinity;
      const timeB = b.date ? new Date(b.date).getTime() : Infinity;
      return timeA - timeB;
    });

  const pastEventsList = events
    .filter(ev => !getEventTiming(ev).isUpcoming)
    .sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

  // Forms Submissions
  const handleAthleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAthleteId) {
      await updateAthlete({ id: editingAthleteId, ...athleteForm });
    } else {
      await addAthlete(athleteForm);
    }
    setAthleteForm({ name: '', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: 'avatar-1.svg', desc: '', achievements: '' });
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
      desc: a.desc,
      achievements: a.achievements || ''
    });
    setEditingAthleteId(a.id);
    setAthleteFormOpen(true);
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawSlug = newsForm.slug?.trim() || newsForm.title;
    const slugValue = rawSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const isAddingAnnouncement = activeEditPage === 'announcements' || isAnnouncementCategory(newsForm.category);
    const formCategory = isAddingAnnouncement ? (newsForm.category || 'Announcement') : (newsForm.category || 'Sport');
    const finalForm = { ...newsForm, category: formCategory, slug: slugValue };

    if (editingNewsId) {
      await updateNews({ id: editingNewsId, ...finalForm });
    } else {
      await addNews(finalForm);
    }
    const resetCategory = activeEditPage === 'announcements' ? 'Announcement' : 'Sport';
    const resetStatus = activeEditPage === 'announcements' ? 'Published' : 'Draft';
    setNewsForm({ title: '', date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), category: resetCategory, status: resetStatus, img: '', desc: '', content: '', slug: '' });
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
      date: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      location: '',
      category: 'National',
      status: 'Upcoming',
      img: '',
      featured: false,
      resultsSummary: '',
      results: ''
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
      featured: ev.featured,
      resultsSummary: ev.resultsSummary || '',
      results: ev.results || ''
    });
    setEditingEventId(ev.id);
    setEventFormOpen(true);
  };

  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCareerFormError('');
    const slugValue = (careerForm.slug.trim() || careerForm.title.toLowerCase())
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const payload = {
      ...careerForm,
      slug: slugValue,
      deadline: careerForm.deadline || null,
      applicants: editingCareerId ? careers.find(c => c.id === editingCareerId)?.applicants ?? 0 : 0,
    };

    try {
      if (editingCareerId) {
        await updateCareer({ id: editingCareerId, ...payload });
      } else {
        await addCareer(payload);
      }
      setCareerForm({ title: '', location: 'Kigali', status: 'Open', desc: '', slug: '', deadline: '' });
      setEditingCareerId(null);
      setCareerFormOpen(false);
    } catch (err) {
      setCareerFormError(err instanceof Error ? err.message : 'Could not save this vacancy. Your changes are still in the form.');
    }
  };

  const handleEditCareerClick = (career: Career) => {
    setCareerForm({
      title: career.title || '',
      location: career.location || 'Kigali',
      status: career.status || 'Open',
      desc: career.desc || '',
      slug: career.slug || '',
      deadline: career.deadline ? String(career.deadline).slice(0, 10) : '',
    });
    setCareerFormError('');
    setEditingCareerId(career.id);
    setCareerFormOpen(true);
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
      await updateLeader({ id: editingLeaderId, ...leaderForm, order: Number(leaderForm.order) || 0 });
    } else {
      await addLeader({ ...leaderForm, order: Number(leaderForm.order) || 0 });
    }
    setLeaderForm({ name: '', role: 'President', desc: '', avatar: 'avatar-4.svg', committee: 'Board of Directors', email: '', phone: '', impairment: '', order: 0 });
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
      impairment: l.impairment || '',
      order: l.order ?? 0,
    });
    setEditingLeaderId(l.id);
    setLeaderFormOpen(true);
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPartnerId) {
      await updatePartner({ id: editingPartnerId, ...partnerForm });
    } else {
      await addPartner(partnerForm);
    }
    setPartnerForm({ name: '', logo: '', website: '', category: 'Government Sector', order: 0, active: true });
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

  const [pageSaving, setPageSaving] = useState(false);

  const handleSectionSave = async (keys: string[]) => {
    setPageSaving(true);
    try {
      await Promise.all(
        keys.map(k => {
          const val = siteForm[k] !== undefined ? siteForm[k] : (DEFAULT_SITE_CONTENT[k] || '');
          return saveSiteContent(k, val);
        })
      );
      alert('Page content saved to database successfully!');
    } catch (err) {
      console.error(err);
      alert('Error saving some content values. Please check your connection.');
    } finally {
      setPageSaving(false);
    }
  };

  // Debounced search terms — prevents expensive filter re-runs on every keystroke
  const debouncedAthleteSearch = useDebounce(athleteSearch, 300);
  const debouncedNewsSearch = useDebounce(newsSearch, 300);
  const debouncedEventSearch = useDebounce(eventSearch, 300);
  const debouncedCareerSearch = useDebounce(careerSearch, 300);
  const debouncedVolunteerSearch = useDebounce(volunteerSearch, 300);
  const debouncedDonationSearch = useDebounce(donationSearch, 300);
  const debouncedPartnerSearch = useDebounce(partnerSearch, 300);
  const debouncedSportSearch = useDebounce(sportSearch, 300);
  const debouncedLeaderSearch = useDebounce(leaderSearch, 300);
  const debouncedContentSearch = useDebounce(contentSearch, 300);

  // Searching logic
  const filteredAthletes = athletes.filter(a =>
    a.name.toLowerCase().includes(debouncedAthleteSearch.toLowerCase()) ||
    a.sport.toLowerCase().includes(debouncedAthleteSearch.toLowerCase())
  );

  const filteredNews = news
    .filter(n => !isAnnouncementCategory(n.category))
    .filter(n =>
      n.title.toLowerCase().includes(debouncedNewsSearch.toLowerCase()) ||
      n.category.toLowerCase().includes(debouncedNewsSearch.toLowerCase())
    );

  const announcementsList = news.filter(n => isAnnouncementCategory(n.category));

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(debouncedEventSearch.toLowerCase()) ||
    e.category.toLowerCase().includes(debouncedEventSearch.toLowerCase())
  );

  const filteredCareers = careers.filter(c =>
    c.title.toLowerCase().includes(debouncedCareerSearch.toLowerCase())
  );

  const filteredSports = sports.filter(s =>
    s.title.toLowerCase().includes(debouncedSportSearch.toLowerCase())
  );

  const filteredLeaders = leadership.filter(l =>
    l.name.toLowerCase().includes(debouncedLeaderSearch.toLowerCase()) ||
    l.role.toLowerCase().includes(debouncedLeaderSearch.toLowerCase())
  );

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(debouncedPartnerSearch.toLowerCase())
  );

  const filteredContent = siteContentList.filter(c =>
    c.key.toLowerCase().includes(debouncedContentSearch.toLowerCase()) ||
    c.value.toLowerCase().includes(debouncedContentSearch.toLowerCase())
  );

  // Pagination helper
  const paginate = (array: any[], pageNumber: number, pageSize: number) => {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  };

  const totalPages = (total: number, size: number) => Math.ceil(total / size) || 1;

  return (
    <>
      <main className="dashboard-main-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {/* ──────────────────────────────
             TAB: OVERVIEW
             ────────────────────────────── */}
          {/* ── Access Guard Helper (rendered inline per restricted tab) ── */}
          {(() => {
            // Nothing rendered here — guards are applied per-tab below
            return null;
          })()}

          {adminTab === 'overview' && (
            <div>
              {/* Welcome Banner */}
              <div 
                className="dashboard-welcome-banner"
                style={{ 
                  background: 'linear-gradient(135deg, #074783 0%, #0b63b6 50%, #083866 100%)',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  color: '#ffffff',
                  marginBottom: '20px',
                  boxShadow: '0 8px 24px rgba(11, 99, 182, 0.16)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', right: '-15px', bottom: '-35px', opacity: 0.12, fontSize: '9rem', color: '#fff', pointerEvents: 'none' }}>
                  <i className="fas fa-chart-pie" />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 2 }}>
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge" style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.35)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isEditor ? 'Editor Portal' : 'Admin Operations'}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
                      Welcome back, {profile.name || 'Admin'}!
                    </h2>
                    <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '620px', lineHeight: '1.45' }}>
                      National Paralympic Committee (NPC) Rwanda Management Portal · Today is {currentDateString || 'Loading date...'}.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '6px 14px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(255, 255, 255, 0.18)' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 6px #4ADE80' }} />
                    <span>Live Sync {lastSyncTime ? `(${lastSyncTime})` : ''}</span>
                    <button 
                      onClick={refreshRealTimeData}
                      disabled={isRefreshing}
                      className="btn btn-link btn-sm p-0 text-white"
                      title="Sync live data now"
                      style={{ textDecoration: 'none', marginLeft: '6px', opacity: isRefreshing ? 0.5 : 1 }}
                    >
                      <i className={`fas fa-sync-alt ${isRefreshing ? 'fa-spin' : ''}`} style={{ fontSize: '0.75rem' }} />
                    </button>
                  </div>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '18px 0 16px' }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button 
                      onClick={() => { setAdminTab('pages'); setActiveEditPage('news'); setNewsFormOpen(true); }}
                      className="btn btn-sm"
                      style={{ background: '#FFD700', color: '#000000', fontWeight: 700, borderRadius: '8px', border: 'none', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    >
                      <i className="fas fa-plus" /> Write News Article
                    </button>
                    <button 
                      onClick={() => { setAdminTab('pages'); setActiveEditPage('athletes'); setAthleteFormOpen(true); }}
                      className="btn btn-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-user-plus" /> Add Athlete
                    </button>
                    <button 
                      onClick={() => { setAdminTab('pages'); setActiveEditPage('events'); setEventFormOpen(true); }}
                      className="btn btn-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-calendar-plus" /> Schedule Event
                    </button>
                    <button 
                      onClick={() => { setAdminTab('pages'); setActiveEditPage('announcements'); }}
                      className="btn btn-sm"
                      style={{ background: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <i className="fas fa-bullhorn" /> Announcements
                    </button>
                  </div>

                  <a 
                    href="https://npcrwanda.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ background: 'rgba(255, 255, 255, 0.12)', color: '#FFD700', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 215, 0, 0.35)', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    View Website <i className="fas fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }} />
                  </a>
                </div>
              </div>

              {/* Priority Action Required Queue (Admins only) */}
              {!isEditor && (() => {
                const unreadMessages = contacts.filter(c => !c.read).length;
                const unreadVolunteers = volunteers.filter(v => !v.read).length;
                const unreadDonations = donations.filter(d => !d.read).length;
                const unreadJobApps = jobApplications.filter(a => !a.read).length;
                const totalPending = unreadMessages + unreadVolunteers + unreadDonations + unreadJobApps;

                if (totalPending === 0) return null;

                return (
                  <div 
                    className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
                    style={{
                      background: 'linear-gradient(90deg, #FFFBEB 0%, #FEF3C7 100%)',
                      border: '1px solid #FCD34D',
                      borderRadius: '12px',
                      padding: '12px 18px',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)'
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#F59E0B',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <i className="fas fa-bell" style={{ fontSize: '0.85rem' }} />
                      </span>
                      <div>
                        <strong style={{ fontSize: '0.88rem', fontWeight: 800, color: '#78350F' }}>
                          Action Required: {totalPending} item{totalPending > 1 ? 's' : ''} awaiting review
                        </strong>
                        <span className="d-block" style={{ fontSize: '0.76rem', color: '#B45309' }}>
                          Unread submissions requiring staff follow-up or administrative action
                        </span>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {unreadMessages > 0 && (
                        <button
                          type="button"
                          onClick={() => { setAdminTab('contacts'); setInboxSubTab('messages'); }}
                          className="btn btn-xs"
                          style={{ background: '#FFFFFF', border: '1px solid #FCD34D', color: '#92400E', fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', padding: '5px 12px' }}
                        >
                          <i className="fas fa-envelope text-primary me-1" /> {unreadMessages} Message{unreadMessages > 1 ? 's' : ''}
                        </button>
                      )}
                      {unreadVolunteers > 0 && (
                        <button
                          type="button"
                          onClick={() => { setAdminTab('contacts'); setInboxSubTab('volunteers'); }}
                          className="btn btn-xs"
                          style={{ background: '#FFFFFF', border: '1px solid #FCD34D', color: '#92400E', fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', padding: '5px 12px' }}
                        >
                          <i className="fas fa-hands-helping text-success me-1" /> {unreadVolunteers} Volunteer{unreadVolunteers > 1 ? 's' : ''}
                        </button>
                      )}
                      {unreadDonations > 0 && (
                        <button
                          type="button"
                          onClick={() => { setAdminTab('contacts'); setInboxSubTab('donations'); }}
                          className="btn btn-xs"
                          style={{ background: '#FFFFFF', border: '1px solid #FCD34D', color: '#92400E', fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', padding: '5px 12px' }}
                        >
                          <i className="fas fa-hand-holding-usd text-warning me-1" /> {unreadDonations} Donation{unreadDonations > 1 ? 's' : ''}
                        </button>
                      )}
                      {unreadJobApps > 0 && (
                        <button
                          type="button"
                          onClick={() => { setAdminTab('contacts'); setInboxSubTab('applications'); }}
                          className="btn btn-xs"
                          style={{ background: '#FFFFFF', border: '1px solid #FCD34D', color: '#92400E', fontWeight: 700, borderRadius: '8px', fontSize: '0.75rem', padding: '5px 12px' }}
                        >
                          <i className="fas fa-briefcase me-1" style={{ color: '#7C3AED' }} /> {unreadJobApps} Application{unreadJobApps > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Role-Aware Middle Section */}
              {!isEditor ? (
                /* Super Admin / Admin: Live database analytics */
                <DashboardAnalytics 
                  onNavigate={(action) => {
                    if (action.url) {
                      router.push(action.url);
                      return;
                    }
                    if (action.tab === 'community') {
                      router.push('/dashboard/community');
                      return;
                    }
                    if (action.tab === 'pages') {
                      setAdminTab('pages');
                      if (action.page) setActiveEditPage(action.page);
                      return;
                    }
                    if (action.tab === 'contacts') {
                      setAdminTab('contacts');
                      if (action.subtab && ['messages', 'volunteers', 'donations', 'applications'].includes(action.subtab)) {
                        setInboxSubTab(action.subtab as any);
                      }
                      return;
                    }
                    if (action.tab) {
                      setAdminTab(action.tab as any);
                      if (action.page) setActiveEditPage(action.page);
                    }
                  }}
                />
              ) : (
                /* Editor: Editorial Content Workspace */
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <h3 style={{ margin: 0, color: '#0F172A', fontSize: '1.1rem', fontWeight: 800 }}>Editorial Content Workspace</h3>
                    <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.82rem' }}>Quick overview of live content and directories you can edit</p>
                  </div>
                  <div className="row g-3">
                    <div className="col-sm-6 col-lg-3">
                      <div 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('news'); }}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0072C6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>News Room</span>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DCFCE7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-newspaper" style={{ fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {news.filter(n => !isAnnouncementCategory(n.category)).length}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Published articles</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('announcements'); }}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0072C6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Announcements</span>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEF3C7', color: '#92400E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-bullhorn" style={{ fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {news.filter(n => isAnnouncementCategory(n.category)).length}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Active public notices</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('athletes'); }}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0072C6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Athletes Directory</span>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E0F2FE', color: '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-person-running" style={{ fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {athletes.length}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Registered profiles</span>
                      </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                      <div 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('events'); }}
                        style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0072C6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Upcoming Events</span>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#EDE9FE', color: '#6D28D9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-calendar-alt" style={{ fontSize: '0.8rem' }} />
                          </div>
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          {upcomingEventsList.length}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Scheduled competitions</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Two-Column Grid */}
              <div className="row g-4">
                
                {/* Left Column: Recent Activity / Inbox — role-aware */}
                <div className="col-lg-7">
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    {isEditor ? (
                      /* ── EDITOR: Recent Content Panel ── */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>My Recent Content</h3>
                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Latest news articles and events you can manage</p>
                          </div>
                          <button
                            onClick={() => { setAdminTab('pages'); setActiveEditPage('news'); }}
                            className="btn btn-xs btn-outline-primary"
                            style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}
                          >
                            Manage News
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(() => {
                            const recentNews = news.filter(n => !isAnnouncementCategory(n.category)).slice(0, 3);
                            const recentEvents = events.slice(0, 2);
                            const items = [
                              ...recentNews.map(n => ({ type: 'news' as const, id: n.id, title: n.title, subtitle: n.category, date: n.date })),
                              ...recentEvents.map(e => ({ type: 'event' as const, id: e.id, title: e.title, subtitle: e.location, date: e.date })),
                            ].slice(0, 5);
                            if (items.length === 0) {
                              return (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                                  <i className="fas fa-pen-to-square" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: '#CBD5E1' }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>No content published yet</span>
                                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>Start by writing a news article or scheduling an event.</p>
                                </div>
                              );
                            }
                            return items.map((item, index) => (
                              <div
                                key={index}
                                onClick={() => { setAdminTab('pages'); setActiveEditPage(item.type === 'news' ? 'news' : 'events'); }}
                                style={{ display: 'flex', gap: '16px', padding: '14px', border: '1px solid #E8ECF0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', background: '#FFFFFF' }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8ECF0'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                              >
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: item.type === 'news' ? '#D1FAE5' : '#E0F2FE', color: item.type === 'news' ? '#065F46' : '#0369A1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <i className={`fas ${item.type === 'news' ? 'fa-newspaper' : 'fa-calendar-day'}`} style={{ fontSize: '1.1rem' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '2px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: item.type === 'news' ? '#065F46' : '#0369A1' }}>{item.type === 'news' ? 'News' : 'Event'}</span>
                                    <span style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 600 }}>{item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : ''}</span>
                                  </div>
                                  <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.title}</h4>
                                  <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.subtitle}</p>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </>
                    ) : (
                      /* ── ADMIN / SUPER ADMIN: Inbox Panel with Messages, Volunteers, Donations & Job Applications ── */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Recent Inbox Activity</h3>
                              {(() => {
                                const unreadTotal = contacts.filter(c => !c.read).length + volunteers.filter(v => !v.read).length + donations.filter(d => !d.read).length + jobApplications.filter(a => !a.read).length;
                                return unreadTotal > 0 ? (
                                  <span className="badge bg-danger rounded-pill" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                                    {unreadTotal} Unread
                                  </span>
                                ) : (
                                  <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill" style={{ fontSize: '0.68rem', padding: '3px 8px' }}>
                                    All Clear
                                  </span>
                                );
                              })()}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Messages, volunteer registrations, donations & job applications</p>
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
                            const items: { type: 'message' | 'volunteer' | 'donation' | 'application'; raw: any; date: string; sender: string; title: string; subtitle: string }[] = [];
                            contacts.filter(c => !c.read).slice(0, 3).forEach(c => {
                              items.push({ type: 'message', raw: c, date: c.date, sender: c.name, title: `Message: ${c.subject}`, subtitle: c.message });
                            });
                            volunteers.filter(v => !v.read).slice(0, 3).forEach(v => {
                              items.push({ type: 'volunteer', raw: v, date: 'New Application', sender: v.name, title: `Volunteer Registration`, subtitle: `Interested in ${v.interest}` });
                            });
                            donations.filter(d => !d.read).slice(0, 3).forEach(d => {
                              items.push({ type: 'donation', raw: d, date: 'New Donation', sender: d.name, title: `Donation: ${d.supportType}`, subtitle: `Category: ${d.category}` });
                            });
                            jobApplications.filter(a => !a.read).slice(0, 3).forEach(a => {
                              items.push({
                                type: 'application',
                                raw: a,
                                date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'New Candidate',
                                sender: a.fullName,
                                title: `Job Application: ${a.careerTitle || 'General Vacancy'}`,
                                subtitle: `${a.email}${a.phone ? ` · ${a.phone}` : ''}`
                              });
                            });
                            const displayItems = items.slice(0, 5);
                            if (displayItems.length === 0) {
                              return (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8' }}>
                                  <i className="far fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '12px', display: 'block', color: '#CBD5E1' }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your inbox is completely clear!</span>
                                  <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0' }}>No unread messages, registrations, or job applications found.</p>
                                </div>
                              );
                            }
                            return displayItems.map((item, index) => {
                              let badgeBg = '#E0F2FE';
                              let badgeColor = '#0369A1';
                              let icon = 'fa-envelope';
                              if (item.type === 'volunteer') { badgeBg = '#D1FAE5'; badgeColor = '#065F46'; icon = 'fa-hands-helping'; }
                              else if (item.type === 'donation') { badgeBg = '#FEF3C7'; badgeColor = '#92400E'; icon = 'fa-hand-holding-usd'; }
                              else if (item.type === 'application') { badgeBg = '#EDE9FE'; badgeColor = '#6D28D9'; icon = 'fa-briefcase'; }
                              return (
                                <div
                                  key={index}
                                  onClick={() => {
                                    setAdminTab('contacts');
                                    if (item.type === 'message') { setInboxSubTab('messages'); setActiveMessage(item.raw); markContactAsRead(item.raw.id); }
                                    else if (item.type === 'volunteer') { setInboxSubTab('volunteers'); setActiveVolunteer(item.raw); markVolunteerAsRead(item.raw.id); }
                                    else if (item.type === 'donation') { setInboxSubTab('donations'); setActiveDonation(item.raw); markDonationAsRead(item.raw.id); }
                                    else if (item.type === 'application') { setInboxSubTab('applications'); setActiveJobApplication(item.raw); markJobApplicationRead(item.raw.id, true); }
                                  }}
                                  style={{ display: 'flex', gap: '16px', padding: '14px', border: '1px solid #E8ECF0', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', background: '#FFFFFF' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.03)'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E8ECF0'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
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
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column: Events Schedule & System */}
                <div className="col-lg-5">
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '24px', height: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>Events Schedule</h3>
                          <span className={`badge ${upcomingEventsList.length > 0 ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.7rem' }}>
                            {upcomingEventsList.length} Upcoming
                          </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '2px 0 0 0' }}>Real-time verification of upcoming vs completed events</p>
                      </div>
                      <button 
                        onClick={() => { setAdminTab('pages'); setActiveEditPage('events'); }}
                        className="btn btn-xs btn-outline-primary"
                        style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}
                      >
                        Manage Events
                      </button>
                    </div>

                    {/* Filter tabs: Upcoming vs Past Events */}
                    <div className="d-flex gap-2 mb-3 border-bottom pb-2">
                      <button
                        onClick={() => setOverviewEventsTab('upcoming')}
                        className={`btn btn-sm ${overviewEventsTab === 'upcoming' ? 'btn-primary' : 'btn-light border'} py-1 px-3`}
                        style={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: '6px' }}
                      >
                        <i className="fas fa-calendar-check me-1" /> Upcoming ({upcomingEventsList.length})
                      </button>
                      <button
                        onClick={() => setOverviewEventsTab('past')}
                        className={`btn btn-sm ${overviewEventsTab === 'past' ? 'btn-primary' : 'btn-light border'} py-1 px-3`}
                        style={{ fontSize: '0.78rem', fontWeight: 600, borderRadius: '6px' }}
                      >
                        <i className="fas fa-history me-1" /> Past ({pastEventsList.length})
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                      {(() => {
                        const targetList = overviewEventsTab === 'upcoming' ? upcomingEventsList : pastEventsList;
                        const displayEvents = targetList.slice(0, 4);

                        if (displayEvents.length === 0) {
                          return (
                            <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94A3B8', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <i className={`far ${overviewEventsTab === 'upcoming' ? 'fa-calendar-plus text-primary' : 'fa-calendar-times'} mb-2`} style={{ fontSize: '2.5rem', opacity: 0.7 }} />
                              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
                                {overviewEventsTab === 'upcoming' ? 'No Upcoming Events Right Now' : 'No Past Events Found'}
                              </span>
                              <p style={{ fontSize: '0.78rem', margin: '4px 0 16px 0', maxWidth: '300px' }}>
                                {overviewEventsTab === 'upcoming'
                                  ? (pastEventsList.length > 0 
                                      ? `All ${pastEventsList.length} recorded events have passed. Schedule a new event to appear here.`
                                      : 'Add your first upcoming event to display it here in real-time.')
                                  : 'No previous events recorded yet.'}
                              </p>
                              {overviewEventsTab === 'upcoming' && (
                                <button
                                  onClick={() => {
                                    setAdminTab('pages');
                                    setActiveEditPage('events');
                                    setEventFormOpen(true);
                                  }}
                                  className="btn btn-sm btn-primary"
                                  style={{ borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}
                                >
                                  <i className="fas fa-plus me-1" /> Schedule New Event
                                </button>
                              )}
                            </div>
                          );
                        }

                        return displayEvents.map((ev, index) => {
                          const evDate = new Date(ev.date);
                          const isValidDate = !isNaN(evDate.getTime());
                          const day = isValidDate ? evDate.getDate() : '??';
                          const monthStr = isValidDate ? evDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'DATE';
                          const timing = getEventTiming(ev);
                          
                          return (
                            <div 
                              key={ev.id} 
                              onClick={() => {
                                setAdminTab('pages');
                                setActiveEditPage('events');
                                setEditingEventId(ev.id);
                                setEventForm({
                                  title: ev.title,
                                  description: ev.description,
                                  date: ev.date,
                                  endDate: ev.endDate,
                                  location: ev.location,
                                  category: ev.category,
                                  status: ev.status,
                                  img: ev.img,
                                  featured: ev.featured,
                                  resultsSummary: ev.resultsSummary || '',
                                  results: ev.results || ''
                                });
                                setEventFormOpen(true);
                              }}
                              style={{ 
                                display: 'flex', 
                                gap: '14px', 
                                alignItems: 'center', 
                                borderBottom: index < displayEvents.length - 1 ? '1px dashed #E2E8F0' : 'none', 
                                paddingBottom: index < displayEvents.length - 1 ? '12px' : 0,
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease'
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
                            >
                              <div style={{ width: '50px', height: '50px', borderRadius: '10px', background: timing.isOngoing ? '#DCFCE7' : '#F1F5F9', border: `1px solid ${timing.isOngoing ? '#86EFAC' : '#E2E8F0'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: timing.isOngoing ? '#166534' : '#0b63b6', lineHeight: 1 }}>{monthStr}</span>
                                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: timing.isOngoing ? '#166534' : '#0F172A', lineHeight: 1.1 }}>{day}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="d-flex align-items-center gap-2 mb-1">
                                  <span className={`badge ${timing.badgeClass}`} style={{ fontSize: '0.62rem', fontWeight: 700 }}>
                                    {timing.statusText}
                                  </span>
                                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ev.category === 'International' ? '#CF2F3B' : '#0b63b6', textTransform: 'uppercase' }}>
                                    {ev.category} {ev.featured && '• Featured'}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', margin: '0 0 2px 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  {ev.title}
                                </h4>
                                <div className="d-flex align-items-center gap-3" style={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fas fa-map-marker-alt text-danger" style={{ fontSize: '0.68rem' }} /> {ev.location}
                                  </span>
                                  {ev.endDate && ev.endDate !== ev.date && (
                                    <span className="text-muted">
                                      <i className="far fa-calendar-range me-1" /> Until {ev.endDate}
                                    </span>
                                  )}
                                </div>
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
            isPageRestricted(activeEditPage) ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', padding: '32px', color: '#fff' }}>
                    <i className="fas fa-pen-slash" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: '#FFA000' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>
                      Editor Access Restricted
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' }}>
                      Editors are authorized to manage: Athletes Directory, Sports Programs, News Room, Announcements, Events Calendar, and Careers & Vacancies only.
                    </p>
                  </div>
                  <div className="card-body text-center py-3">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        if (isEditor) {
                          setAdminTab('pages');
                          setActiveEditPage('athletes');
                        } else {
                          setAdminTab('overview');
                        }
                      }}
                    >
                      <i className="fas fa-arrow-left me-2" />
                      {isEditor ? 'Go to Athletes Directory' : 'Back to Overview'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
            <div>
              {/* Page Editor Header Toolbar */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white border rounded">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary text-white px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    PAGE EDITOR
                  </span>
                  <h3 className="h6 fw-bold mb-0 text-dark">
                    {activeEditPage === 'home' ? 'Home Page Editor' :
                     activeEditPage === 'about' ? 'About Us Page Editor' :
                     activeEditPage === 'npc-background' ? 'NPC Background Page Editor' :
                     activeEditPage === 'leadership' ? 'Leadership Directory & Mandate' :
                     activeEditPage === 'athletes' ? 'Athletes Directory' :
                     activeEditPage === 'sports' ? 'Sports Programs' :
                     activeEditPage === 'news' ? 'News Room' :
                     activeEditPage === 'announcements' ? 'Official Announcements & Notices' :
                     activeEditPage === 'events' ? 'Events Calendar' :
                     activeEditPage === 'careers' ? 'Careers & Vacancies' :
                     activeEditPage === 'contact' ? 'Contact Info & Footer Settings' :
                     activeEditPage === 'governance' ? 'Governance Documents & Policies' :
                     activeEditPage === 'partners' ? 'Partners & Sponsors' : 'Home Page Editor'}
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
                  {['home', 'about', 'npc-background', 'leadership'].includes(activeEditPage || 'home') && (
                    <button 
                      type="button" 
                      onClick={() => {
                        const target = activeEditPage || 'home';
                        if (target === 'home') {
                          handleSectionSave(['hero.kicker', 'hero.title1', 'hero.title2', 'hero.lead', 'hero.image', 'hero.showcaseBadge', 'hero.showcaseTitle', 'hero.showcaseDesc', 'hero.stat1.title', 'hero.stat1.desc', 'hero.stat2.title', 'hero.stat2.desc', 'hero.stat3.title', 'hero.stat3.desc', 'hero.stat4.title', 'hero.stat4.desc', 'stats.districts', 'stats.disciplines', 'stats.founded', 'stats.clubs', 'stats.athletes', 'about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'cta.title', 'cta.desc', 'media.youtubeUrl', 'media.videoTitle', 'media.videoDesc', 'media.instagramTitle', 'media.instagramSubtitle', 'media.instagramDesc', 'media.instagramUrl']);
                        } else if (target === 'about') {
                          handleSectionSave(['about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'about.heroImage', 'about.historyImage', 'about.historyParagraph1', 'about.historyParagraph2', 'about.vision', 'about.mission', 'about.value.phrase.Courage', 'about.value.phrase.Determination', 'about.value.phrase.Equality', 'about.value.phrase.Inspiration', 'about.value.phrase.Empowerment', 'about.value.phrase.Intersectionality', 'about.objective.phrase.Athlete Excellence', 'about.objective.phrase.Grassroots Development', 'about.objective.phrase.Safeguarding & Governance', 'about.objective.phrase.Partnership Growth']);
                        } else if (target === 'npc-background') {
                          handleSectionSave(['background.governingText', 'background.tocText', 'background.strengths', 'background.weaknesses', 'background.opportunities', 'background.threats', 'background.pillar1', 'background.pillar2', 'background.pillar3', 'background.pillar4']);
                        } else if (target === 'leadership') {
                          handleSectionSave(['leadership.mandatePeriod']);
                        }
                      }}
                      disabled={pageSaving}
                      className="btn btn-sm btn-primary fw-semibold px-4"
                    >
                      <i className={`fas ${pageSaving ? 'fa-spinner fa-spin' : 'fa-save'} me-1`} /> {pageSaving ? 'Saving...' : 'Save Page Content'}
                    </button>
                  )}
                </div>
              </div>

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
                            src={siteForm['about.previewImage']?.startsWith('/') || siteForm['about.previewImage']?.startsWith('http') ? siteForm['about.previewImage'] : `/uploads/${siteForm['about.previewImage'] || ''}`} 
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

                  {activeEditPage === 'npc-background' && (
                    <div className="border rounded bg-white overflow-hidden shadow p-4" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded">
                        <h2 className="fw-bold text-dark">NPC Background & Strategic Framework</h2>
                        <span className="small text-muted">Governance, Theory of Change, SWOT & Strategic Pillars Mockup</span>
                      </div>

                      <div className="p-3 border rounded mb-4" style={{ background: '#f8fafc' }}>
                        <h5 className="fw-bold text-dark mb-2">Governing Board & Management</h5>
                        <p className="small text-muted mb-3">{siteForm['background.governingText'] || ''}</p>
                        <h5 className="fw-bold text-dark mb-2">Theory of Change</h5>
                        <p className="small text-muted mb-0">{siteForm['background.tocText'] || ''}</p>
                      </div>

                      <div className="row g-3 mb-4">
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-white shadow-sm border-success">
                            <span className="badge bg-success mb-2">STRENGTHS</span>
                            <pre className="small text-dark mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{siteForm['background.strengths'] || ''}</pre>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-white shadow-sm border-warning">
                            <span className="badge bg-warning text-dark mb-2">WEAKNESSES</span>
                            <pre className="small text-dark mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{siteForm['background.weaknesses'] || ''}</pre>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-white shadow-sm border-primary">
                            <span className="badge bg-primary mb-2">OPPORTUNITIES</span>
                            <pre className="small text-dark mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{siteForm['background.opportunities'] || ''}</pre>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 border rounded h-100 bg-white shadow-sm border-danger">
                            <span className="badge bg-danger mb-2">THREATS</span>
                            <pre className="small text-dark mb-0 font-monospace" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{siteForm['background.threats'] || ''}</pre>
                          </div>
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
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
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
                        {news.filter(n => !isAnnouncementCategory(n.category)).map(n => (
                          <div key={n.id} className="col-md-4">
                            <div className="border rounded overflow-hidden bg-white h-100 shadow-sm d-flex flex-column justify-content-between">
                              <div>
                                <img 
                                  src={n.img?.startsWith('/') || n.img?.startsWith('http') ? n.img : `/assets/img/curated/${n.img || 'news-volleyball.jpg'}`} 
                                  style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                                  alt={n.title}
                                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
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
                    <div className="border rounded-4 bg-white p-4 shadow-sm" style={{ maxWidth: '900px', margin: '0 auto' }}>
                      <div className="text-center py-4 bg-light mb-4 rounded-3 border-top border-3 border-primary">
                        <span className="badge bg-danger px-3 py-1 mb-2 text-uppercase" style={{ fontSize: '0.7rem' }}>Official Announcements Preview</span>
                        <h2 className="fw-bold text-dark h4 mb-1">Official Announcements &amp; Public Notices</h2>
                        <span className="small text-muted">Previewing live registry of communiqués and circulars as displayed to the public</span>
                      </div>
                      <div className="list-group list-group-flush border rounded-3 overflow-hidden">
                        {news.filter(n => isAnnouncementCategory(n.category) && (n.status === 'Published' || !n.status)).map(n => (
                          <div key={n.id} className="list-group-item p-3 d-flex align-items-center justify-content-between gap-3 bg-white">
                            <div className="d-flex align-items-center gap-3">
                              <div className="d-flex flex-column align-items-center justify-content-center rounded border bg-light px-2 py-1 text-center" style={{ minWidth: '70px' }}>
                                <i className="fas fa-calendar-day text-primary mb-1" style={{ fontSize: '0.75rem' }} />
                                <span className="fw-bold text-dark" style={{ fontSize: '0.7rem', lineHeight: 1.1 }}>{n.date || 'Notice'}</span>
                              </div>
                              <div>
                                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle text-uppercase fw-bold mb-1" style={{ fontSize: '0.62rem' }}>
                                  {n.category || 'Announcement'}
                                </span>
                                <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>{n.title}</h6>
                                <p className="small text-muted mb-0" style={{ fontSize: '0.75rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.desc}</p>
                              </div>
                            </div>
                            <span className="btn btn-xs btn-outline-primary fw-bold text-nowrap" style={{ fontSize: '0.72rem' }}>
                              Read Notice <i className="fas fa-arrow-right ms-1" />
                            </span>
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
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminTab('contacts');
                                      setInboxSubTab('applications');
                                      setJobAppSearch(c.title);
                                    }}
                                    className="btn btn-link p-0 text-decoration-none fw-semibold text-primary"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    Applicants registered: <strong>{c.applicants}</strong> <i className="fas fa-arrow-right ms-0.5" />
                                  </button>
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
                                <span style={{ fontSize: '0.85rem', color: '#0F172A' }}>{contactForm.address || contactInfo?.address || '—'}</span>
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
                                src={p.logo || '/assets/img/logo.png'} 
                                style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain', filter: p.active ? 'none' : 'grayscale(1)' }} 
                                alt={p.name}
                                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                              />
                              <h5 className="fw-bold text-dark mt-2 mb-0" style={{ fontSize: '0.8rem' }}>{p.name}</h5>
                            </div>
                          </div>
                        ))}
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
                              uploadMediaFile={uploadMediaFile}
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label small fw-bold">Hero Lead text</label>
                            <textarea className="form-control" rows={2} value={siteForm['hero.lead'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.lead': e.target.value })} />
                          </div>
                        </div>

                        <hr className="my-4" />
                        <h5 className="small fw-bold text-muted mb-3"><i className="fas fa-image me-1 text-primary" />Hero Right Showcase Card:</h5>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <label className="form-label small fw-bold">Showcase Badge</label>
                            <input type="text" className="form-control" value={siteForm['hero.showcaseBadge'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.showcaseBadge': e.target.value })} placeholder="Team Rwanda Spotlight" />
                          </div>
                          <div className="col-md-8">
                            <label className="form-label small fw-bold">Showcase Title</label>
                            <input type="text" className="form-control" value={siteForm['hero.showcaseTitle'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.showcaseTitle': e.target.value })} placeholder="Excellence in Motion: Leading Africa in Para-Sport" />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Showcase Description</label>
                            <textarea className="form-control" rows={2} value={siteForm['hero.showcaseDesc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'hero.showcaseDesc': e.target.value })} placeholder="Showcasing Rwandan resilience, elite athletic pathways, and world-class achievements across continental and global championships." />
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
                          <div className="col-6 col-md">
                            <label className="form-label small fw-bold">Districts Count</label>
                            <input type="text" className="form-control" value={siteForm['stats.districts'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.districts': e.target.value })} />
                          </div>
                          <div className="col-6 col-md">
                            <label className="form-label small fw-bold">Disciplines Count</label>
                            <input type="text" className="form-control" value={siteForm['stats.disciplines'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.disciplines': e.target.value })} />
                          </div>
                          <div className="col-6 col-md">
                            <label className="form-label small fw-bold">Athletes Count</label>
                            <input type="text" className="form-control" value={siteForm['stats.athletes'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.athletes': e.target.value })} placeholder="500+" />
                          </div>
                          <div className="col-6 col-md">
                            <label className="form-label small fw-bold">Founded Year</label>
                            <input type="text" className="form-control" value={siteForm['stats.founded'] || ''} onChange={e => setSiteForm({ ...siteForm, 'stats.founded': e.target.value })} />
                          </div>
                          <div className="col-6 col-md">
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

                      {/* Social Media Hub Settings */}
                      <div className="custom-card p-4">
                        <h4 className="h6 fw-bold mb-3 border-bottom pb-2 text-primary"><i className="fab fa-youtube me-2" /><i className="fab fa-instagram me-2" />Social Media Hub Settings (YouTube & Instagram)</h4>
                        <p className="small text-muted mb-3">Control the YouTube video embed and Instagram spotlight card shown on the homepage &ldquo;Stay Updated&rdquo; section.</p>
                        <div className="row g-3">
                          {/* YouTube Settings */}
                          <div className="col-12">
                            <span className="badge bg-danger text-white mb-1"><i className="fab fa-youtube me-1" /> YouTube Section</span>
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">YouTube Embed URL <span className="text-muted fw-normal">(video or playlist)</span></label>
                            <input type="text" className="form-control" value={siteForm['media.youtubeUrl'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.youtubeUrl': e.target.value })} placeholder="https://www.youtube.com/embed/videoseries?list=YOUR_PLAYLIST_ID" />
                            <small className="text-muted">Paste a YouTube embed URL (e.g. from &ldquo;Share → Embed&rdquo; on YouTube). Used for the homepage video card.</small>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Video Section Title</label>
                            <input type="text" className="form-control" value={siteForm['media.videoTitle'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.videoTitle': e.target.value })} placeholder="Rwanda Paralympic Highlights & Athlete Journeys" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Video Section Description</label>
                            <input type="text" className="form-control" value={siteForm['media.videoDesc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.videoDesc': e.target.value })} placeholder="Watch tournament highlights, athlete training diaries, and institutional coverage across all Rwanda para-sport disciplines." />
                          </div>

                          {/* Instagram Settings */}
                          <div className="col-12 pt-3 border-top">
                            <span className="badge text-white mb-1" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}><i className="fab fa-instagram me-1" /> Instagram Spotlight Card</span>
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Instagram Card Title</label>
                            <input type="text" className="form-control" value={siteForm['media.instagramTitle'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.instagramTitle': e.target.value })} placeholder="Instagram @npc.rwanda" />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Instagram Subtitle</label>
                            <input type="text" className="form-control" value={siteForm['media.instagramSubtitle'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.instagramSubtitle': e.target.value })} placeholder="Official Photo & Reel Updates" />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Instagram Description</label>
                            <textarea rows={2} className="form-control" value={siteForm['media.instagramDesc'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.instagramDesc': e.target.value })} placeholder="Follow Rwanda's para-athletes in training, continental qualification rounds, and community events across the nation." />
                          </div>
                          <div className="col-12">
                            <label className="form-label small fw-bold">Instagram Post / Reel URL to Embed</label>
                            <input type="text" className="form-control" value={siteForm['media.instagramPostUrl'] || ''} onChange={e => setSiteForm({ ...siteForm, 'media.instagramPostUrl': e.target.value })} placeholder="https://www.instagram.com/p/XXXXXXXXXX/ or /reel/XXXXXXXXXX/" />
                            <div className="form-text">Paste any Instagram post or Reel URL here to embed it live on the homepage — just like YouTube. Leave blank to show the Follow button card instead.</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Save Action Bar */}
                      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 p-3 bg-white border rounded shadow-sm gap-2">
                        <div>
                          <span className="fw-bold text-dark d-block">Save Home Page Changes</span>
                          <span className="small text-muted">All hero, statistics, impact snapshot, about preview, YouTube, and Instagram details will update live on the site.</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={pageSaving}
                          onClick={() => handleSectionSave(['hero.kicker', 'hero.title1', 'hero.title2', 'hero.lead', 'hero.image', 'hero.showcaseBadge', 'hero.showcaseTitle', 'hero.showcaseDesc', 'hero.stat1.title', 'hero.stat1.desc', 'hero.stat2.title', 'hero.stat2.desc', 'hero.stat3.title', 'hero.stat3.desc', 'hero.stat4.title', 'hero.stat4.desc', 'stats.districts', 'stats.disciplines', 'stats.founded', 'stats.clubs', 'stats.athletes', 'about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'cta.title', 'cta.desc', 'media.youtubeUrl', 'media.videoTitle', 'media.videoDesc', 'media.instagramTitle', 'media.instagramSubtitle', 'media.instagramDesc', 'media.instagramPostUrl'])}
                          className="btn btn-primary fw-bold px-4 py-2"
                        >
                          <i className={`fas ${pageSaving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} /> {pageSaving ? 'Saving...' : 'Save Home Page Content'}
                        </button>
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
                              />
                          </div>
                          <div className="col-md-6">
                            <RichTextEditor 
                              value={siteForm['about.mission'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.mission': val })} 
                              label="Mission Statement" 
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
                              />
                            <RichTextEditor 
                              value={siteForm['about.historyParagraph2'] || ''} 
                              onChange={(val) => setSiteForm({ ...siteForm, 'about.historyParagraph2': val })} 
                              label="History Paragraph 2" 
                              />
                          </div>
                          <div className="col-md-6">
                            <CMSImageField 
                              label="History Illustration Image" 
                              value={siteForm['about.historyImage'] || ''} 
                              onChange={(url) => setSiteForm({ ...siteForm, 'about.historyImage': url })}
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

                      {/* Bottom Save Action Bar */}
                      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 p-3 bg-white border rounded shadow-sm gap-2">
                        <div>
                          <span className="fw-bold text-dark d-block">Save About Us Changes</span>
                          <span className="small text-muted">All vision, mission, history, core values, and strategic plan objectives will update live on the site.</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={pageSaving}
                          onClick={() => handleSectionSave(['about.eyebrow', 'about.previewTitle', 'about.previewText', 'about.previewImage', 'about.bullet1', 'about.bullet2', 'about.bullet3', 'about.heroImage', 'about.historyImage', 'about.historyParagraph1', 'about.historyParagraph2', 'about.vision', 'about.mission', 'about.value.phrase.Courage', 'about.value.phrase.Determination', 'about.value.phrase.Equality', 'about.value.phrase.Inspiration', 'about.value.phrase.Empowerment', 'about.value.phrase.Intersectionality', 'about.objective.phrase.Athlete Excellence', 'about.objective.phrase.Grassroots Development', 'about.objective.phrase.Safeguarding & Governance', 'about.objective.phrase.Partnership Growth'])}
                          className="btn btn-primary fw-bold px-4 py-2"
                        >
                          <i className={`fas ${pageSaving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} /> {pageSaving ? 'Saving...' : 'Save About Us Content'}
                        </button>
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

                      {/* Bottom Save Action Bar */}
                      <div className="d-flex flex-wrap justify-content-between align-items-center mt-4 p-3 bg-white border rounded shadow-sm gap-2">
                        <div>
                          <span className="fw-bold text-dark d-block">Save NPC Background Changes</span>
                          <span className="small text-muted">All Theory of Change, SWOT analysis parameters, and 4 pillar objectives will update live on the site.</span>
                        </div>
                        <button 
                          type="button" 
                          disabled={pageSaving}
                          onClick={() => handleSectionSave(['background.governingText', 'background.tocText', 'background.strengths', 'background.weaknesses', 'background.opportunities', 'background.threats', 'background.pillar1', 'background.pillar2', 'background.pillar3', 'background.pillar4'])}
                          className="btn btn-primary fw-bold px-4 py-2"
                        >
                          <i className={`fas ${pageSaving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`} /> {pageSaving ? 'Saving...' : 'Save NPC Background Content'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* LEADERSHIP PAGE EDITOR */}
                  {activeEditPage === 'leadership' && (
                    <div>
                      {/* Leadership Mandate & Tenure Period Setting */}
                      <div className="custom-card p-4 mb-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                          <div>
                            <h4 className="h6 fw-bold mb-1 text-primary">
                              <i className="fas fa-calendar-check me-2" />Leadership Mandate &amp; Tenure Period
                            </h4>
                            <p className="small text-muted mb-0">Configure the official tenure period displayed across the Leadership page header and profile cards.</p>
                          </div>
                          <button
                            type="button"
                            disabled={pageSaving}
                            onClick={() => handleSectionSave(['leadership.mandatePeriod'])}
                            className="btn btn-primary btn-sm fw-bold px-3"
                          >
                            <i className={`fas ${pageSaving ? 'fa-spinner fa-spin' : 'fa-save'} me-1`} /> {pageSaving ? 'Saving...' : 'Save Mandate'}
                          </button>
                        </div>
                        <div className="row g-3 align-items-center">
                          <div className="col-md-6">
                            <label className="form-label small fw-bold">Mandate Period</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="2024–2028"
                              value={siteForm['leadership.mandatePeriod'] !== undefined ? siteForm['leadership.mandatePeriod'] : (siteContent['leadership.mandatePeriod'] || '2024–2028')}
                              onChange={e => setSiteForm({ ...siteForm, 'leadership.mandatePeriod': e.target.value })}
                            />
                            <small className="text-muted">Example: <strong>2024–2028</strong>. Updates live on leadership cards and KPIs.</small>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Leadership Directory ({leadership.length})</h3>
                        <button
                          onClick={() => {
                            setEditingLeaderId(null);
                            setLeaderForm({ name: '', role: 'President', desc: '', avatar: 'avatar-4.svg', committee: 'Board of Directors', email: '', phone: '', impairment: '', order: 0 });
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
                            <div className="col-md-3">
                              <label className="form-label small fw-bold">Committee Group</label>
                              <select className="form-control" value={leaderForm.committee} onChange={e => setLeaderForm({ ...leaderForm, committee: e.target.value })}>
                                <option value="Board of Directors">Board of Directors</option>
                                <option value="Audit Committee">Audit Committee</option>
                                <option value="Conflict Resolution Committee">Conflict Resolution Committee</option>
                                <option value="Staff Team">Staff Team</option>
                              </select>
                            </div>
                            <div className="col-md-1">
                              <label className="form-label small fw-bold">Order #</label>
                              <input
                                type="number"
                                className="form-control"
                                min={0}
                                value={leaderForm.order}
                                onChange={e => setLeaderForm({ ...leaderForm, order: Number(e.target.value) })}
                                title="Display order within the committee group (lower = shown first)"
                              />
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
                                <th style={{ width: '50px' }}>#</th>
                                <th>Name</th>
                                <th>Role</th>
                                <th>Committee</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredLeaders, currentPage.leaders, pageSizes.leaders).map(l => (
                                <tr key={l.id}>
                                  <td>
                                    <span className="badge bg-light text-dark border fw-bold" style={{ fontSize: '0.78rem', minWidth: '28px' }}>
                                      {l.order ?? 0}
                                    </span>
                                  </td>
                                  <td className="fw-semibold small">{l.name}</td>
                                  <td className="small">{t(l.role)}</td>
                                  <td className="small text-muted">{l.committee}</td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => handleEditLeaderClick(l)} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit leader"><i className="fas fa-pen" /></button>
                                      <button onClick={() => { if (confirm(`Delete leader ${l.name}?`)) deleteLeader(l.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete leader"><i className="fas fa-trash" /></button>
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
                            setAthleteForm({ name: '', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: 'avatar-1.svg', desc: '', achievements: '' });
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
uploadMediaFile={uploadMediaFile} 
                                category="athletes" 
                                entity={athleteForm.name || 'athlete'} 
                              />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Biography / Description</label>
                              <textarea className="form-control" rows={3} required value={athleteForm.desc} onChange={e => setAthleteForm({ ...athleteForm, desc: e.target.value })} />
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Achievements and Career Highlights</label>
                              <textarea className="form-control" rows={3} placeholder="Add medals, records, competitions, and notable achievements..." value={athleteForm.achievements} onChange={e => setAthleteForm({ ...athleteForm, achievements: e.target.value })} />
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
                                        setAthleteForm({ name: a.name, sport: a.sport, status: a.status, country: a.country, avatar: a.avatar, desc: a.desc, achievements: a.achievements || '' });
                                        setEditingAthleteId(a.id);
                                        setAthleteFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit athlete"><i className="fas fa-pen" /></button>
                                      <button onClick={() => { if (confirm(`Delete athlete ${a.name}?`)) deleteAthlete(a.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete athlete"><i className="fas fa-trash" /></button>
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
                                      }} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit sport"><i className="fas fa-pen" /></button>
                                      <button onClick={() => { if (confirm(`Delete sport ${s.title}?`)) deleteSport(s.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete sport"><i className="fas fa-trash" /></button>
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
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>News Articles ({news.filter(n => !isAnnouncementCategory(n.category)).length})</h3>
                        <button
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsForm({ title: '', date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), category: 'Sport', status: 'Draft', img: '', desc: '', content: '', slug: '' });
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
                                uploadMediaFile={uploadMediaFile} 
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
                                      }} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit article"><i className="fas fa-pen" /></button>
                                      <button onClick={() => { if (confirm(`Delete article "${n.title}"?`)) deleteNews(n.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete article"><i className="fas fa-trash" /></button>
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
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Announcements ({news.filter(n => isAnnouncementCategory(n.category) && (n.status === 'Published' || !n.status)).length} published)</h3>
                        <button
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsForm({ title: '', date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), category: 'Announcement', status: 'Published', img: '', desc: '', content: '', slug: '' });
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
                              <input type="text" className="form-control" required value={newsForm.title} onChange={e => {
                                const t = e.target.value;
                                setNewsForm({ ...newsForm, title: t, slug: newsForm.slug && newsForm.slug !== newsForm.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') ? newsForm.slug : t.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') });
                              }} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Slug <span className="text-muted fw-normal">(auto-generated)</span></label>
                              <input type="text" className="form-control" placeholder="auto-generated from title" value={newsForm.slug} onChange={e => setNewsForm({ ...newsForm, slug: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Classification / Badge</label>
                              <select className="form-control" value={newsForm.category} onChange={e => setNewsForm({ ...newsForm, category: e.target.value })}>
                                <option value="Announcement">Announcement</option>
                                <option value="Circular">Official Circular</option>
                                <option value="Public Notice">Public Notice</option>
                                <option value="Press Release">Press Release</option>
                                <option value="Important">Urgent Notice</option>
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
                              <label className="form-label small fw-bold">Publication Date (e.g. Oct 2026)</label>
                              <input type="text" className="form-control" value={newsForm.date} onChange={e => setNewsForm({ ...newsForm, date: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <label className="form-label small fw-bold">Short Summary</label>
                              <textarea className="form-control" rows={3} required value={newsForm.desc} onChange={e => setNewsForm({ ...newsForm, desc: e.target.value })} />
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
                                <th>Classification</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const list = news.filter(n => isAnnouncementCategory(n.category));
                                if (list.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={5} className="text-center text-muted py-4">No announcements published yet.</td>
                                    </tr>
                                  );
                                }
                                return paginate(list, currentPage.announcements, pageSizes.announcements).map(n => (
                                  <tr key={n.id}>
                                    <td className="fw-semibold small">{n.title}</td>
                                    <td>
                                      <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.4px' }}>
                                        {n.category || 'Announcement'}
                                      </span>
                                    </td>
                                    <td className="small text-muted">{n.date}</td>
                                    <td>
                                      <span className={`badge ${n.status === 'Published' ? 'bg-success' : 'bg-warning'}`}>{n.status}</span>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <button onClick={() => {
                                          setNewsForm({ title: n.title, date: n.date, category: n.category || 'Announcement', status: n.status, img: n.img, desc: n.desc, content: n.content || '', slug: n.slug });
                                          setEditingNewsId(n.id);
                                          setNewsFormOpen(true);
                                        }} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit announcement"><i className="fas fa-pen" /></button>
                                        <button onClick={() => deleteNews(n.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete announcement"><i className="fas fa-trash" /></button>
                                      </div>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                        {news.filter(n => isAnnouncementCategory(n.category)).length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.announcements} 
                            totalPages={totalPages(news.filter(n => isAnnouncementCategory(n.category)).length, pageSizes.announcements)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, announcements: page })}
                          />
                        )}
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
                            setEventForm({ title: '', description: '', date: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], location: '', category: 'National', status: 'Upcoming', img: '', featured: false, resultsSummary: '', results: '' });
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
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Results Summary</label>
                              <input type="text" className="form-control" placeholder="e.g. Rwanda won 4 medals" value={eventForm.resultsSummary} onChange={e => setEventForm({ ...eventForm, resultsSummary: e.target.value })} />
                              <small className="text-muted">Shown publicly for completed events.</small>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Competition Results / Highlights</label>
                              <textarea className="form-control" rows={4} placeholder="Add final scores, medal results, athlete performances, and highlights..." value={eventForm.results} onChange={e => setEventForm({ ...eventForm, results: e.target.value })} />
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
                                <th>Date Schedule</th>
                                <th>Location</th>
                                <th>Category</th>
                                <th>Timing Status</th>
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
                                  <td className="small text-nowrap">
                                    <div className="fw-semibold">{e.date || 'TBD'}</div>
                                    {e.endDate && e.endDate !== e.date && <div className="text-muted" style={{ fontSize: '0.7rem' }}>to {e.endDate}</div>}
                                  </td>
                                  <td className="small text-muted">{e.location}</td>
                                  <td className="small"><span className="badge bg-light text-dark border">{e.category}</span></td>
                                  <td>
                                    <span className={`badge ${getEventTiming(e).badgeClass}`} style={{ fontSize: '0.72rem' }}>
                                      {getEventTiming(e).statusText}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="d-flex gap-2">
                                      <button onClick={() => {
                                        setEventForm({ title: e.title, description: e.description, date: e.date, endDate: e.endDate, location: e.location, category: e.category, status: e.status, img: e.img, featured: e.featured, resultsSummary: e.resultsSummary || '', results: e.results || '' });
                                        setEditingEventId(e.id);
                                        setEventFormOpen(true);
                                      }} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit event"><i className="fas fa-pen" /></button>
                                      <button onClick={() => { if (confirm(`Delete event "${e.title}"?`)) deleteEvent(e.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete event"><i className="fas fa-trash" /></button>
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
                            setCareerForm({ title: '', location: 'Kigali', status: 'Open', desc: '', slug: '', deadline: '' });
                            setEditingCareerId(null);
                            setCareerFormError('');
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
                          <h4 className="h6 fw-bold mb-3">{editingCareerId ? 'Edit Vacancy' : 'Add Vacancy'}</h4>
                          {careerFormError && <div className="alert alert-danger py-2" role="alert">{careerFormError}</div>}
                          <form onSubmit={handleCareerSubmit} className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Position Title</label>
                              <input type="text" className="form-control" required value={careerForm.title} onChange={e => setCareerForm({ ...careerForm, title: e.target.value })} />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label small fw-bold">Location</label>
                              <input type="text" className="form-control" required value={careerForm.location} onChange={e => setCareerForm({ ...careerForm, location: e.target.value })} />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Slug URL</label>
                              <input type="text" className="form-control" value={careerForm.slug} onChange={e => setCareerForm({ ...careerForm, slug: e.target.value })} placeholder="Leave blank to generate from title" />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Status</label>
                              <select className="form-control" value={careerForm.status} onChange={e => setCareerForm({ ...careerForm, status: e.target.value })}>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                              </select>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small fw-bold">Application Deadline</label>
                              <input
                                type="date"
                                className="form-control"
                                value={careerForm.deadline}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setCareerForm({ ...careerForm, deadline: e.target.value })}
                              />
                              <div className="form-text text-muted" style={{ fontSize: '0.72rem' }}>
                                Position closes automatically after this date.
                              </div>
                            </div>
                            <div className="col-md-12">
                              <label className="form-label small fw-bold">Job Description</label>
                              <textarea className="form-control" rows={3} required value={careerForm.desc} onChange={e => setCareerForm({ ...careerForm, desc: e.target.value })} />
                            </div>
                            <div className="col-12">
                              <button type="submit" className="btn btn-primary btn-sm px-4">{editingCareerId ? 'Save Changes' : 'Register Position'}</button>
                              <button type="button" className="btn btn-outline-secondary btn-sm ms-2" onClick={() => { setCareerFormOpen(false); setEditingCareerId(null); setCareerFormError(''); }}>Cancel</button>
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
                                <th>Deadline</th>
                                <th>Status</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginate(filteredCareers, currentPage.careers, pageSizes.careers).map(c => {
                                const todayStr = new Date().toISOString().split('T')[0];
                                const isExpired = Boolean(c.deadline && c.deadline < todayStr);
                                return (
                                  <tr key={c.id}>
                                    <td className="fw-semibold small">{c.title}</td>
                                    <td className="small text-muted">{c.location}</td>
                                    <td className="small">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAdminTab('contacts');
                                          setInboxSubTab('applications');
                                          setJobAppSearch(c.title);
                                        }}
                                        className="btn btn-xs btn-outline-primary py-0 px-2 fw-semibold d-inline-flex align-items-center gap-1"
                                        title="View candidate applications for this position"
                                      >
                                        <i className="fas fa-users" />
                                        <span>{c.applicants}</span>
                                      </button>
                                    </td>
                                    <td className="small">
                                      {c.deadline ? (
                                        <span className={isExpired ? 'text-danger fw-semibold' : 'text-dark'}>
                                          <i className={`fas ${isExpired ? 'fa-calendar-times text-danger' : 'fa-calendar-day text-primary'} me-1`} />
                                          {new Date(c.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                          {isExpired && (
                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle ms-1" style={{ fontSize: '0.68rem' }}>
                                              Expired
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        <span className="text-muted fst-italic">Open-ended</span>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`badge ${c.status === 'Open' && !isExpired ? 'bg-success' : 'bg-secondary'}`}>
                                        {c.status === 'Open' && isExpired ? 'Closed (Expired)' : c.status}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="d-flex align-items-center gap-2">
                                        <button type="button" onClick={() => handleEditCareerClick(c)} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit vacancy">
                                          <i className="fas fa-pen" />
                                        </button>
                                        {c.status === 'Open' && (
                                          <button onClick={() => closeCareer(c.id)} className="btn btn-sm btn-outline-secondary py-0 px-2" title="Close vacancy">
                                            <i className="fas fa-ban" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to permanently delete the position "${c.title}"?`)) {
                                              deleteCareer(c.id);
                                            }
                                          }}
                                          className="btn btn-sm btn-outline-danger py-0 px-2"
                                          title="Delete position"
                                        >
                                          <i className="fas fa-trash" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
                          <h4 className="h6 fw-bold mb-0 text-dark"><i className="fas fa-share-nodes text-primary me-2" />Social Media Links <span className="text-muted fw-normal small">(Footer &amp; Homepage)</span></h4>
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
                              {paginate(socialLinks, currentPage.socialLinks, pageSizes.socialLinks).map(s => (
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
                                      <button onClick={() => handleEditSocialClick(s)} className="btn btn-sm btn-outline-primary py-0 px-2" title="Edit social link"><i className="fas fa-pen" /></button>
                                      <button onClick={() => deleteSocialLink(s.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete social link"><i className="fas fa-trash" /></button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {socialLinks.length === 0 && (
                            <div className="text-center py-4 text-muted small">No social links configured.</div>
                          )}
                        </div>
                        {socialLinks.length > 0 && (
                          <PaginationComponent 
                            currentPage={currentPage.socialLinks} 
                            totalPages={totalPages(socialLinks.length, pageSizes.socialLinks)}
                            onPageChange={(page) => setCurrentPage({ ...currentPage, socialLinks: page })}
                          />
                        )}
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
                              label="Document / Policy File (All documents allowed: PDF, Word, Excel, PPT, etc.)" 
                              value={govForm.fileUrl} 
                              onChange={(url) => setGovForm({ ...govForm, fileUrl: url })}
                              uploadMediaFile={uploadMediaFile}
                              category="governance"
                              entity={govForm.title || 'governance-document'}
                              accept="*/*"
                              isDocument={true}
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
                                <table className="table table-hover table-sm mb-0 align-middle">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>File</th>
                                      <th>Order</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginate(govDocs, currentPage.govDocs, pageSizes.govDocs).map(d => (
                                      <tr key={d.id}>
                                        <td className="small fw-semibold text-truncate text-dark" style={{ maxWidth: '160px' }} title={d.title}>{d.title}</td>
                                        <td>
                                          {d.fileUrl && d.fileUrl !== '#' ? (
                                            <a 
                                              href={d.fileUrl.startsWith('http') || d.fileUrl.startsWith('/') ? d.fileUrl : `/assets/img/curated/${d.fileUrl}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="badge bg-primary text-white text-decoration-none py-1 px-2"
                                              style={{ fontSize: '0.68rem' }}
                                              title={d.fileUrl}
                                            >
                                              <i className="fas fa-download me-1" />
                                              {d.fileUrl.split('?')[0].split('.').pop()?.toUpperCase() || 'File'}
                                            </a>
                                          ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning" style={{ fontSize: '0.65rem' }}>
                                              No file (#)
                                            </span>
                                          )}
                                        </td>
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
                                              className="btn btn-xs btn-outline-primary py-0 px-2"
                                              title="Edit document"
                                            ><i className="fas fa-pen" /></button>
                                            <button onClick={() => deleteGovItem('doc', d.id)} className="btn btn-xs btn-outline-danger py-0 px-2" title="Delete document"><i className="fas fa-trash" /></button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {govDocs.length === 0 && (
                                  <div className="text-center py-3 text-muted small">No documents uploaded.</div>
                                )}
                              </div>
                              {govDocs.length > 0 && (
                                <PaginationComponent 
                                  currentPage={currentPage.govDocs} 
                                  totalPages={totalPages(govDocs.length, pageSizes.govDocs)}
                                  onPageChange={(page) => setCurrentPage({ ...currentPage, govDocs: page })}
                                />
                              )}
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="custom-card p-3">
                              <h5 className="h6 fw-bold border-bottom pb-2 mb-3 text-dark"><i className="fas fa-scale-balanced text-success me-2" />Official Policies ({govPolicies.length})</h5>
                              <div className="table-responsive">
                                <table className="table table-hover table-sm mb-0 align-middle">
                                  <thead>
                                    <tr>
                                      <th>Title</th>
                                      <th>File</th>
                                      <th>Order</th>
                                      <th>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {paginate(govPolicies, currentPage.govPolicies, pageSizes.govPolicies).map(p => (
                                      <tr key={p.id}>
                                        <td className="small fw-semibold text-truncate text-dark" style={{ maxWidth: '160px' }} title={p.title}>{p.title}</td>
                                        <td>
                                          {p.fileUrl && p.fileUrl !== '#' ? (
                                            <a 
                                              href={p.fileUrl.startsWith('http') || p.fileUrl.startsWith('/') ? p.fileUrl : `/assets/img/curated/${p.fileUrl}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer" 
                                              className="badge bg-success text-white text-decoration-none py-1 px-2"
                                              style={{ fontSize: '0.68rem' }}
                                              title={p.fileUrl}
                                            >
                                              <i className="fas fa-download me-1" />
                                              {p.fileUrl.split('?')[0].split('.').pop()?.toUpperCase() || 'File'}
                                            </a>
                                          ) : (
                                            <span className="badge bg-warning-subtle text-warning border border-warning" style={{ fontSize: '0.65rem' }}>
                                              No file (#)
                                            </span>
                                          )}
                                        </td>
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
                                              className="btn btn-xs btn-outline-primary py-0 px-2"
                                              title="Edit policy"
                                            ><i className="fas fa-pen" /></button>
                                            <button onClick={() => deleteGovItem('policy', p.id)} className="btn btn-xs btn-outline-danger py-0 px-2" title="Delete policy"><i className="fas fa-trash" /></button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                {govPolicies.length === 0 && (
                                  <div className="text-center py-3 text-muted small">No policies uploaded.</div>
                                )}
                              </div>
                              {govPolicies.length > 0 && (
                                <PaginationComponent 
                                  currentPage={currentPage.govPolicies} 
                                  totalPages={totalPages(govPolicies.length, pageSizes.govPolicies)}
                                  onPageChange={(page) => setCurrentPage({ ...currentPage, govPolicies: page })}
                                />
                              )}
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
                                      className="btn btn-sm btn-outline-primary py-0 px-2"
                                      title="Edit partner"
                                    ><i className="fas fa-pen" /></button>
                                    <button onClick={() => deletePartner(p.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete partner"><i className="fas fa-trash" /></button>
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
                </div>
              )}
            </div>
            )
          )}

          {/* ──────────────────────────────
             TAB: MEDIA LIBRARY
             ────────────────────────────── */}
          {adminTab === 'volunteers' && (
            !isAdmin ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', padding: '32px', color: '#fff' }}>
                    <i className="fas fa-lock" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: '#FFA000' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Restricted Access Area</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' }}>Volunteer Applications require Administrator or higher privileges.</p>
                  </div>
                  <div className="card-body text-center py-3">
                    <button className="btn btn-primary btn-sm" onClick={() => setAdminTab('overview')}><i className="fas fa-arrow-left me-2" />Back to Overview</button>
                  </div>
                </div>
              </div>
            ) : (
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
                      <button onClick={async () => { if (confirm(`Delete volunteer application from ${activeVolunteer.name}?`)) { if (await runSubmissionDelete(activeVolunteer.id, deleteVolunteerApplication, 'Volunteer application')) setActiveVolunteer(null); } }} disabled={deletingSubmissionIds.includes(activeVolunteer.id)} className="btn btn-danger btn-sm">{deletingSubmissionIds.includes(activeVolunteer.id) ? 'Deleting…' : 'Delete Application'}</button>
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
                                  <button onClick={async () => { if (confirm(`Delete volunteer application from ${v.name}?`)) { await runSubmissionDelete(v.id, deleteVolunteerApplication, 'Volunteer application'); } }} disabled={deletingSubmissionIds.includes(v.id)} className="btn btn-sm btn-outline-danger py-1">{deletingSubmissionIds.includes(v.id) ? 'Deleting…' : 'Delete'}</button>
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
            )
          )}

          {/* ──────────────────────────────
             TAB: GOVERNANCE
             ────────────────────────────── */}
          {adminTab === 'governance' && (
            !isAdmin ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', padding: '32px', color: '#fff' }}>
                    <i className="fas fa-lock" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: '#FFA000' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Restricted Access Area</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' }}>Governance & Policies require Administrator or higher privileges.</p>
                  </div>
                  <div className="card-body text-center py-3">
                    <button className="btn btn-primary btn-sm" onClick={() => setAdminTab('overview')}><i className="fas fa-arrow-left me-2" />Back to Overview</button>
                  </div>
                </div>
              </div>
            ) : (
            <div>
              <p className="text-muted small">Governance Documents and Policies are fully database-driven. Use the Governance API endpoints or configure them in Settings.</p>
            </div>
            )
          )}

          {/* ──────────────────────────────
             TAB: CONTACTS / INBOX
             ────────────────────────────── */}
          {adminTab === 'contacts' && (
            !isAdmin ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', padding: '32px', color: '#fff' }}>
                    <i className="fas fa-lock" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: '#FFA000' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Restricted Access Area</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' }}>Inbox & Messages require Administrator or higher privileges.</p>
                  </div>
                  <div className="card-body text-center py-3">
                    <button className="btn btn-primary btn-sm" onClick={() => setAdminTab('overview')}><i className="fas fa-arrow-left me-2" />Back to Overview</button>
                  </div>
                </div>
              </div>
            ) : (
            <div>
              <div className="mb-4 d-flex justify-content-between align-items-center border-bottom pb-2 flex-wrap gap-2">
                <div className="d-flex gap-2 flex-wrap">
                  {[
                    { id: 'messages', label: `Messages Inbox (${contacts.filter(c => !c.read).length})` },
                    { id: 'applications', label: `Job Applications (${jobApplications.filter(a => !a.read).length})` },
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
                {inboxSubTab !== 'applications' && (
                  <button
                    onClick={() => handleCleanSpam(inboxSubTab)}
                    disabled={cleaningSpam}
                    className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-2"
                    style={{ borderRadius: '8px', fontWeight: 600 }}
                    title={`Clean spam submissions from ${inboxSubTab}`}
                  >
                    <i className={`fas ${cleaningSpam ? 'fa-spinner fa-spin' : 'fa-broom'}`} />
                    <span>{cleaningSpam ? 'Cleaning...' : `Clean ${inboxSubTab === 'messages' ? 'Spam Messages' : inboxSubTab === 'volunteers' ? 'Spam Volunteers' : 'Spam Inquiries'}`}</span>
                  </button>
                )}
              </div>

              {inboxFeedback && (
                <div
                  className={`alert ${inboxFeedback.type === 'success' ? 'alert-success' : 'alert-danger'} d-flex align-items-center justify-content-between mb-4 shadow-sm`}
                  role="alert"
                >
                  <div className="d-flex align-items-center gap-2">
                    <i className={`fas ${inboxFeedback.type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}`} />
                    <strong>{inboxFeedback.text}</strong>
                  </div>
                  <button type="button" className="btn-close" onClick={() => setInboxFeedback(null)} aria-label="Close" />
                </div>
              )}
              {/* Message Details Modals */}
              {activeJobApplication && (
                <div className="custom-card p-4 mb-4" style={{ background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <span className="badge bg-primary px-2.5 py-1 rounded-pill small mb-2 d-inline-block">{activeJobApplication.careerTitle}</span>
                      <h4 className="h5 fw-bold mb-1 text-dark">{activeJobApplication.fullName}</h4>
                      <div className="small text-muted d-flex gap-3 flex-wrap">
                        <span><i className="fas fa-envelope me-1 text-primary" />{activeJobApplication.email}</span>
                        <span><i className="fas fa-phone me-1 text-primary" />{activeJobApplication.phone}</span>
                        <span><i className="fas fa-clock me-1 text-muted" />{new Date(activeJobApplication.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => setActiveJobApplication(null)} className="btn btn-close btn-sm" aria-label="Close"></button>
                  </div>

                  <div className="mb-3">
                    <label className="small fw-bold text-muted text-uppercase d-block mb-1">Application Status</label>
                    <div className="d-flex gap-2 align-items-center flex-wrap">
                      {['Pending', 'Reviewed', 'Shortlisted', 'Rejected'].map(st => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            updateJobApplicationStatus(activeJobApplication.id, st);
                            setActiveJobApplication(prev => prev ? { ...prev, status: st } : null);
                          }}
                          className={`btn btn-sm ${activeJobApplication.status === st ? (st === 'Shortlisted' ? 'btn-success' : st === 'Rejected' ? 'btn-danger' : st === 'Reviewed' ? 'btn-info text-white' : 'btn-warning text-dark') : 'btn-outline-secondary'}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeJobApplication.resumeUrl ? (
                    <div className="p-3 mb-3 rounded bg-light border d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-file-pdf text-danger fa-2x" />
                        <div>
                          <span className="fw-semibold small d-block text-dark">Attached Resume / Curriculum Vitae</span>
                          <span className="text-muted" style={{ fontSize: '0.78rem' }}>{activeJobApplication.resumeUrl.split('/').pop()}</span>
                        </div>
                      </div>
                      <a
                        href={activeJobApplication.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm fw-semibold"
                        download
                      >
                        <i className="fas fa-arrow-down-to-bracket me-1" /> Download CV / Resume
                      </a>
                    </div>
                  ) : (
                    <p className="small text-muted mb-3"><i className="fas fa-info-circle me-1" /> No resume document attached with this application.</p>
                  )}

                  <div className="mb-3">
                    <label className="small fw-bold text-muted text-uppercase d-block mb-1">Cover Letter & Motivation Statement</label>
                    <div className="small text-dark p-3 rounded bg-white" style={{ border: '1px solid #E2E8F0', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                      {activeJobApplication.coverLetter}
                    </div>
                  </div>

                  <div className="d-flex gap-2 mt-3 pt-2 border-top">
                    {!activeJobApplication.read && (
                      <button
                        onClick={() => {
                          markJobApplicationRead(activeJobApplication.id, true);
                          setActiveJobApplication(prev => prev ? { ...prev, read: true } : null);
                        }}
                        className="btn btn-success btn-sm"
                      >
                        <i className="fas fa-check me-1" /> Mark as Read
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete the application from ${activeJobApplication.fullName}?`)) {
                          if (await runSubmissionDelete(activeJobApplication.id, deleteJobApplication, 'Job application')) {
                            setActiveJobApplication(null);
                          }
                        }
                      }}
                      disabled={deletingSubmissionIds.includes(activeJobApplication.id)}
                      className="btn btn-danger btn-sm"
                    >
                      <i className="fas fa-trash me-1" /> {deletingSubmissionIds.includes(activeJobApplication.id) ? 'Deleting…' : 'Delete Application'}
                    </button>
                  </div>
                </div>
              )}
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
                    <button onClick={async () => { if (confirm(`Delete contact message from ${activeMessage.name}?`)) { if (await runSubmissionDelete(activeMessage.id, deleteContactMessage, 'Contact message')) setActiveMessage(null); } }} disabled={deletingSubmissionIds.includes(activeMessage.id)} className="btn btn-danger btn-sm">{deletingSubmissionIds.includes(activeMessage.id) ? 'Deleting…' : 'Delete Message'}</button>
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
                    <button onClick={async () => { if (confirm(`Delete volunteer application from ${activeVolunteer.name}?`)) { if (await runSubmissionDelete(activeVolunteer.id, deleteVolunteerApplication, 'Volunteer application')) setActiveVolunteer(null); } }} disabled={deletingSubmissionIds.includes(activeVolunteer.id)} className="btn btn-danger btn-sm">{deletingSubmissionIds.includes(activeVolunteer.id) ? 'Deleting…' : 'Delete Application'}</button>
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
                    <button onClick={async () => { if (confirm(`Delete donation inquiry from ${activeDonation.name}?`)) { if (await runSubmissionDelete(activeDonation.id, deleteDonationInquiry, 'Donation inquiry')) setActiveDonation(null); } }} disabled={deletingSubmissionIds.includes(activeDonation.id)} className="btn btn-danger btn-sm">{deletingSubmissionIds.includes(activeDonation.id) ? 'Deleting…' : 'Delete Inquiry'}</button>
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
                        {contacts.length === 0 ? <tr><td colSpan={5} className="text-center text-muted py-4">No messages have been received yet.</td></tr> : paginate(contacts, currentPage.contacts, pageSizes.contacts).map(c => (
                          <tr key={c.id}>
                            <td className="fw-semibold small">{c.name}</td>
                            <td className="small">{c.subject}</td>
                            <td className="small text-muted">{c.date}</td>
                            <td>
                              <span className={`badge ${c.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{c.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveMessage(c)} className="btn btn-sm btn-outline-primary py-0 px-2" title="View message"><i className="fas fa-eye" /></button>
                                <button onClick={async () => { if (confirm(`Delete contact message from ${c.name}?`)) { await runSubmissionDelete(c.id, deleteContactMessage, 'Contact message'); } }} disabled={deletingSubmissionIds.includes(c.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete message"><i className="fas fa-trash" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {contacts.length > 0 && (
                    <PaginationComponent 
                      currentPage={currentPage.contacts} 
                      totalPages={totalPages(contacts.length, pageSizes.contacts)}
                      onPageChange={(page) => setCurrentPage({ ...currentPage, contacts: page })}
                    />
                  )}
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
                        {volunteers.length === 0 ? <tr><td colSpan={5} className="text-center text-muted py-4">No volunteer applications have been received yet.</td></tr> : paginate(volunteers, currentPage.volunteers, pageSizes.volunteers).map(v => (
                          <tr key={v.id}>
                            <td className="fw-semibold small">{v.name}</td>
                            <td className="small">{v.interest}</td>
                            <td className="small text-muted">{v.skills}</td>
                            <td>
                              <span className={`badge ${v.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{v.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveVolunteer(v)} className="btn btn-sm btn-outline-primary py-0 px-2" title="View volunteer application"><i className="fas fa-eye" /></button>
                                <button onClick={async () => { if (confirm(`Delete volunteer application from ${v.name}?`)) { await runSubmissionDelete(v.id, deleteVolunteerApplication, 'Volunteer application'); } }} disabled={deletingSubmissionIds.includes(v.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete application"><i className="fas fa-trash" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {volunteers.length > 0 && (
                    <PaginationComponent 
                      currentPage={currentPage.volunteers} 
                      totalPages={totalPages(volunteers.length, pageSizes.volunteers)}
                      onPageChange={(page) => setCurrentPage({ ...currentPage, volunteers: page })}
                    />
                  )}
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
                        {donations.length === 0 ? <tr><td colSpan={5} className="text-center text-muted py-4">No donation inquiries have been received yet.</td></tr> : paginate(donations, currentPage.donations, pageSizes.donations).map(d => (
                          <tr key={d.id}>
                            <td className="fw-semibold small">{d.name}</td>
                            <td className="small">{d.category}</td>
                            <td className="small text-muted">{d.supportType}</td>
                            <td>
                              <span className={`badge ${d.read ? 'bg-light text-dark' : 'bg-primary text-white'}`}>{d.read ? 'Read' : 'Unread'}</span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button onClick={() => setActiveDonation(d)} className="btn btn-sm btn-outline-primary py-0 px-2" title="View donation inquiry"><i className="fas fa-eye" /></button>
                                <button onClick={async () => { if (confirm(`Delete donation inquiry from ${d.name}?`)) { await runSubmissionDelete(d.id, deleteDonationInquiry, 'Donation inquiry'); } }} disabled={deletingSubmissionIds.includes(d.id)} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete inquiry"><i className="fas fa-trash" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {donations.length > 0 && (
                    <PaginationComponent 
                      currentPage={currentPage.donations} 
                      totalPages={totalPages(donations.length, pageSizes.donations)}
                      onPageChange={(page) => setCurrentPage({ ...currentPage, donations: page })}
                    />
                  )}
                </div>
              )}

              {inboxSubTab === 'applications' && (
                <div className="custom-card">
                  <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        placeholder="Search applicants by name, email, or role..."
                        className="form-control form-control-sm"
                        style={{ maxWidth: '320px' }}
                        value={jobAppSearch}
                        onChange={e => setJobAppSearch(e.target.value)}
                      />
                      {jobAppSearch && (
                        <button
                          onClick={() => setJobAppSearch('')}
                          className="btn btn-sm btn-outline-secondary py-1 px-2"
                          title="Clear filter"
                        >
                          <i className="fas fa-times" />
                        </button>
                      )}
                    </div>
                    <span className="small text-muted">
                      Total Applications: <strong>{jobApplications.length}</strong> ({jobApplications.filter(a => !a.read).length} unread)
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Applicant</th>
                          <th>Applied Position</th>
                          <th>Contact</th>
                          <th>CV / Resume</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginate(
                          jobApplications.filter(a => {
                            if (!jobAppSearch) return true;
                            const s = jobAppSearch.toLowerCase();
                            return (
                              a.fullName.toLowerCase().includes(s) ||
                              a.email.toLowerCase().includes(s) ||
                              a.careerTitle.toLowerCase().includes(s) ||
                              (a.status && a.status.toLowerCase().includes(s))
                            );
                          }),
                          currentPage.applications,
                          pageSizes.applications
                        ).map(a => (
                          <tr key={a.id} className={!a.read ? 'table-light' : ''}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {!a.read && <span className="badge rounded-pill bg-primary p-1" title="Unread"> </span>}
                                <div>
                                  <span className="fw-bold small d-block text-dark">{a.fullName}</span>
                                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>ID: {a.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1 small fw-semibold">
                                {a.careerTitle}
                              </span>
                            </td>
                            <td className="small">
                              <div className="text-dark">{a.email}</div>
                              <div className="text-muted" style={{ fontSize: '0.78rem' }}>{a.phone}</div>
                            </td>
                            <td>
                              {a.resumeUrl ? (
                                <a
                                  href={a.resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-xs btn-outline-primary py-1 px-2 d-inline-flex align-items-center gap-1"
                                  download
                                >
                                  <i className="fas fa-file-arrow-down" />
                                  <span>Download CV</span>
                                </a>
                              ) : (
                                <span className="text-muted small fst-italic">None</span>
                              )}
                            </td>
                            <td className="small text-muted">
                              {new Date(a.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  a.status === 'Shortlisted'
                                    ? 'bg-success'
                                    : a.status === 'Rejected'
                                    ? 'bg-danger'
                                    : a.status === 'Reviewed'
                                    ? 'bg-info text-white'
                                    : 'bg-warning text-dark'
                                }`}
                              >
                                {a.status || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <button
                                  onClick={() => {
                                    setActiveJobApplication(a);
                                    if (!a.read) markJobApplicationRead(a.id, true);
                                  }}
                                  className="btn btn-sm btn-outline-primary py-0 px-2"
                                  title="Review candidate"
                                >
                                  <i className="fas fa-eye" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Delete application from ${a.fullName}?`)) {
                                      await runSubmissionDelete(a.id, deleteJobApplication, 'Job application');
                                    }
                                  }}
                                  disabled={deletingSubmissionIds.includes(a.id)}
                                  className="btn btn-sm btn-outline-danger py-0 px-2"
                                  title="Delete application"
                                >
                                  <i className="fas fa-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {jobApplications.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                        <i className="fas fa-id-card-clip fa-3x mb-3 d-block text-secondary" />
                        <p className="fw-semibold mb-1">No job applications submitted yet</p>
                        <p className="small text-muted">Candidates applying via https://npcrwanda.org/careers will appear here.</p>
                      </div>
                    )}
                  </div>

                  {jobApplications.length > 0 && (
                    <PaginationComponent
                      currentPage={currentPage.applications}
                      totalPages={totalPages(
                        jobApplications.filter(a => {
                          if (!jobAppSearch) return true;
                          const s = jobAppSearch.toLowerCase();
                          return (
                            a.fullName.toLowerCase().includes(s) ||
                            a.email.toLowerCase().includes(s) ||
                            a.careerTitle.toLowerCase().includes(s)
                          );
                        }).length,
                        pageSizes.applications
                      )}
                      onPageChange={page => setCurrentPage({ ...currentPage, applications: page })}
                    />
                  )}
                </div>
              )}
            </div>
            )
          )}

          {/* ──────────────────────────────
             TAB: SETTINGS
             ────────────────────────────── */}
          
          {adminTab === 'members' && (
            !canAccessMembers ? (
              <AccessRestricted onReturn={() => setAdminTab('overview')} />
            ) : (
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
                  {paginate(npcAssociations, currentPage.associations, pageSizes.associations).map(p => (
                    <tr key={p.id}>
                      <td><i className={`fas ${p.icon} text-primary`}></i></td>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.acronym}</td>
                      <td>
                        <button onClick={() => { setAssocForm(p); setEditingAssocId(p.id); setAssocFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 px-2 me-2" title="Edit association"><i className="fas fa-pen" /></button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcAssociation(p.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete association"><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
                {npcAssociations.length > 0 && (
                  <PaginationComponent 
                    currentPage={currentPage.associations} 
                    totalPages={totalPages(npcAssociations.length, pageSizes.associations)}
                    onPageChange={(page) => setCurrentPage({ ...currentPage, associations: page })}
                  />
                )}
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
                  {paginate(npcClubs, currentPage.clubs, pageSizes.clubs).map(p => (
                    <tr key={p.id}>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.location}</td>
                      <td>
                        <button onClick={() => { setClubForm(p); setEditingClubId(p.id); setClubFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 px-2 me-2" title="Edit club"><i className="fas fa-pen" /></button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcClub(p.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete club"><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
                {npcClubs.length > 0 && (
                  <PaginationComponent 
                    currentPage={currentPage.clubs} 
                    totalPages={totalPages(npcClubs.length, pageSizes.clubs)}
                    onPageChange={(page) => setCurrentPage({ ...currentPage, clubs: page })}
                  />
                )}
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
                  {paginate(npcFederations, currentPage.federations, pageSizes.federations).map(p => (
                    <tr key={p.id}>
                      <td><img src={p.logo} alt={p.name} style={{width:'40px'}} /></td>
                      <td className="fw-bold">{p.name}</td>
                      <td>{p.role}</td>
                      <td>
                        <button onClick={() => { setFedForm({name:p.name, logo:p.logo, website:p.website||'', role:p.role, desc:p.desc, order:p.order, active:p.active}); setEditingFedId(p.id); setFedFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 px-2 me-2" title="Edit federation"><i className="fas fa-pen" /></button>
                        <button onClick={() => { if(confirm('Delete?')) deleteNpcFederation(p.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete federation"><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
                {npcFederations.length > 0 && (
                  <PaginationComponent 
                    currentPage={currentPage.federations} 
                    totalPages={totalPages(npcFederations.length, pageSizes.federations)}
                    onPageChange={(page) => setCurrentPage({ ...currentPage, federations: page })}
                  />
                )}
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
                  {paginate(dpscoContacts, currentPage.dpsco, pageSizes.dpsco).map(p => (
                    <tr key={p.id}>
                      <td><span className="badge bg-secondary-soft text-secondary">{p.province}</span></td>
                      <td className="fw-bold">{p.district}</td>
                      <td>{p.coordinator}</td>
                      <td>{p.phone}</td>
                      <td>{p.email}</td>
                      <td>
                        <button onClick={() => { setDpscoForm(p); setEditingDpscoId(p.id); setDpscoFormOpen(true); }} className="btn btn-sm btn-outline-primary py-0 px-2 me-2" title="Edit DPSCO contact"><i className="fas fa-pen" /></button>
                        <button onClick={() => { if(confirm('Delete?')) deleteDpscoContact(p.id); }} className="btn btn-sm btn-outline-danger py-0 px-2" title="Delete contact"><i className="fas fa-trash" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody></table></div>
                {dpscoContacts.length > 0 && (
                  <PaginationComponent 
                    currentPage={currentPage.dpsco} 
                    totalPages={totalPages(dpscoContacts.length, pageSizes.dpsco)}
                    onPageChange={(page) => setCurrentPage({ ...currentPage, dpsco: page })}
                  />
                )}
              </div>

            </div>
            )
          )}

          {/* ──────────────────────────────
             TAB: USERS MANAGEMENT
             ────────────────────────────── */}
          {adminTab === 'users' && (
            !canAccessUsers ? (
              <AccessRestricted onReturn={() => setAdminTab('overview')} />
            ) : (
            <div className="animation-fade-in">
              {/* Header */}
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom gap-3">
                <div>
                  <h2 className="h3 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <i className="fas fa-user-shield text-primary" />
                    <span>System User Management</span>
                  </h2>
                  <p className="text-muted mb-0 small">
                    Register and manage administrator and editor accounts with scoped role-based access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUserId(null);
                    setUserForm({ name: '', email: '', password: '', role: 'EDITOR' });
                    setUserMsg(null);
                    setUserFormOpen(true);
                  }}
                  className="btn btn-primary fw-bold px-4 py-2 d-inline-flex align-items-center gap-2 shadow-sm"
                >
                  <i className="fas fa-user-plus" />
                  <span>Register New User</span>
                </button>
              </div>

              {/* Alert Message */}
              {userMsg && (
                <div
                  className={`alert alert-${userMsg.type} alert-dismissible fade show d-flex align-items-center gap-2 mb-4`}
                  role="alert"
                >
                  <i className={`fas ${userMsg.type === 'success' ? 'fa-circle-check text-success' : 'fa-circle-exclamation text-danger'}`} />
                  <div className="flex-grow-1">{userMsg.text}</div>
                  <button type="button" className="btn-close" onClick={() => setUserMsg(null)} aria-label="Close" />
                </div>
              )}

              {/* Expandable Register / Edit User Form Card */}
              {userFormOpen && (
                <div className="custom-card p-4 p-md-5 mb-4 bg-white border rounded-4 shadow-sm" style={{ borderLeft: '4px solid #0072C6' }}>
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                    <div>
                      <h3 className="h5 fw-bold text-dark mb-1">
                        <i className={`fas ${editingUserId ? 'fa-user-pen text-primary' : 'fa-user-plus text-success'} me-2`} />
                        {editingUserId ? 'Edit User Credentials & Access Role' : 'Register New System Administrator / Editor'}
                      </h3>
                      <p className="small text-muted mb-0">
                        {editingUserId
                          ? 'Update name, email, access tier, or provide a new password to reset their credentials.'
                          : 'Provide name, email, temporary password, and access tier. The user can sign in immediately.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUserFormOpen(false);
                        setEditingUserId(null);
                      }}
                      className="btn btn-sm btn-outline-secondary rounded-circle"
                      style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Close"
                    >
                      <i className="fas fa-times" />
                    </button>
                  </div>

                  <form onSubmit={handleUserSubmit}>
                    <div className="row g-4">
                      {/* Name */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-user text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="e.g. Jean Damascene Ndayisaba"
                            required
                            value={userForm.name}
                            onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-envelope text-muted" />
                          </span>
                          <input
                            type="email"
                            className="form-control border-start-0"
                            placeholder="e.g. j.damascene@npcrwanda.org"
                            required
                            value={userForm.email}
                            onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          {editingUserId ? 'New Password (leave empty to keep unchanged)' : 'Initial Password'} <span className={editingUserId ? 'text-muted' : 'text-danger'}>*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-key text-muted" />
                          </span>
                          <input
                            type="password"
                            className="form-control border-start-0"
                            placeholder={editingUserId ? '•••••••• (leave blank to keep current)' : 'Min 6 characters'}
                            required={!editingUserId}
                            minLength={6}
                            value={userForm.password}
                            onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                          />
                        </div>
                        <small className="text-muted">Minimum 6 characters. User can change this after signing in.</small>
                      </div>

                      {/* Role */}
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark">
                          System Role <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fas fa-id-badge text-muted" />
                          </span>
                          <select
                            className="form-select border-start-0"
                            value={userForm.role}
                            onChange={e => setUserForm({ ...userForm, role: e.target.value as any })}
                          >
                            <option value="EDITOR">Editor (Can create &amp; publish articles, events, sports)</option>
                            <option value="ADMIN">Administrator (Can manage site content, members, announcements)</option>
                            {isSuperAdmin && <option value="SUPER_ADMIN">Super Administrator (Full unrestricted system control)</option>}
                          </select>
                        </div>
                      </div>

                      {/* Submit & Cancel Buttons */}
                      <div className="col-12 pt-3 border-top d-flex gap-2">
                        <button
                          type="submit"
                          disabled={userSaving}
                          className="btn btn-primary fw-bold px-4 py-2 d-inline-flex align-items-center gap-2"
                        >
                          <i className={`fas ${userSaving ? 'fa-spinner fa-spin' : 'fa-check'}`} />
                          <span>{userSaving ? 'Saving User...' : editingUserId ? 'Save User Changes' : 'Register User Account'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUserFormOpen(false);
                            setEditingUserId(null);
                          }}
                          className="btn btn-light border px-4 py-2 fw-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Users List & Filter Bar */}
              <div className="card border rounded-4 shadow-sm bg-white overflow-hidden">
                <div className="card-header bg-white border-bottom p-3 p-md-4">
                  <div className="row g-3 align-items-center justify-content-between">
                    <div className="col-md-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="fas fa-search text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0"
                          placeholder="Search users by name or email..."
                          value={userSearch}
                          onChange={e => setUserSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-7 d-flex justify-content-md-end gap-2 flex-wrap">
                      <div className="btn-group btn-group-sm">
                        {['ALL', 'SUPER_ADMIN', 'ADMIN', 'EDITOR'].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setUserRoleFilter(r)}
                            className={`btn ${userRoleFilter === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                          >
                            {r === 'ALL' ? 'All Roles' : r.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-uppercase small text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                      <tr>
                        <th style={{ width: '40px' }} className="ps-4">#</th>
                        <th>User Profile</th>
                        <th>Email Address</th>
                        <th>Assigned Role</th>
                        <th>Registered Date</th>
                        <th className="text-end pe-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                            <div className="small text-muted">Loading system user registry...</div>
                          </td>
                        </tr>
                      ) : (() => {
                        const filtered = systemUsers.filter((u: any) => {
                          const query = userSearch.toLowerCase().trim();
                          const matchesQuery = !query || u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
                          const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                          return matchesQuery && matchesRole;
                        });

                        if (filtered.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="text-center py-5">
                                <i className="fas fa-users-slash text-muted mb-2" style={{ fontSize: '2rem' }} />
                                <div className="fw-semibold text-dark">No users match your filter criteria</div>
                                <div className="small text-muted">Try adjusting your search query or role filter.</div>
                              </td>
                            </tr>
                          );
                        }

                        return paginate(filtered, currentPage.users, pageSizes.users).map((u: any, idx: number) => {
                          const isSelf = currentUser.email === u.email || currentUser.id === u.id;
                          const initials = (u.name || 'NP')
                            .split(/\s+/)
                            .map((p: string) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase();

                          const roleBadge = (() => {
                            switch (u.role) {
                              case 'SUPER_ADMIN':
                                return (
                                  <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }}>
                                    <i className="fas fa-crown text-warning me-1" /> Super Admin
                                  </span>
                                );
                              case 'ADMIN':
                                return (
                                  <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                                    <i className="fas fa-shield-halved text-primary me-1" /> Administrator
                                  </span>
                                );
                              default:
                                return (
                                  <span className="badge rounded-pill px-3 py-1.5 fw-bold" style={{ background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                                    <i className="fas fa-pen-nib text-success me-1" /> Editor
                                  </span>
                                );
                            }
                          })();

                          return (
                            <tr key={u.id}>
                              <td className="ps-4 text-muted small">{idx + 1}</td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs flex-shrink-0"
                                    style={{
                                      width: '38px',
                                      height: '38px',
                                      background: u.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #B45309 0%, #D97706 100%)' : 'linear-gradient(135deg, #0B2545 0%, #0072C6 100%)',
                                      fontSize: '0.8rem',
                                    }}
                                  >
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="fw-bold text-dark d-flex align-items-center gap-1">
                                      <span>{u.name}</span>
                                      {isSelf && (
                                        <span className="badge bg-secondary-subtle text-secondary small" style={{ fontSize: '0.65rem' }}>
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <small className="text-muted d-block d-md-none">{u.email}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="font-monospace small text-muted">{u.email}</td>
                              <td>{roleBadge}</td>
                              <td className="small text-muted">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                              </td>
                              <td className="text-end pe-4">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    onClick={() => handleEditUser(u)}
                                    className="btn btn-outline-primary btn-sm px-2.5"
                                    title="Edit user details & password"
                                  >
                                    <i className="fas fa-pen-to-square" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(u)}
                                    disabled={isSelf}
                                    className="btn btn-outline-danger btn-sm px-2.5"
                                    title={isSelf ? 'Cannot delete your own active account' : 'Delete user account'}
                                  >
                                    <i className="fas fa-trash-can" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer bg-light p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="small text-muted">
                    Total Registered Users: <strong>{systemUsers.length}</strong>
                  </span>
                  {(() => {
                    const filtered = systemUsers.filter((u: any) => {
                      const query = userSearch.toLowerCase().trim();
                      const matchesQuery = !query || u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query);
                      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                      return matchesQuery && matchesRole;
                    });
                    if (filtered.length <= pageSizes.users) return null;
                    return (
                      <PaginationComponent 
                        currentPage={currentPage.users} 
                        totalPages={totalPages(filtered.length, pageSizes.users)}
                        onPageChange={(page) => setCurrentPage({ ...currentPage, users: page })}
                      />
                    );
                  })()}
                  <button
                    type="button"
                    onClick={fetchSystemUsers}
                    className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                  >
                    <i className="fas fa-rotate me-1" /> Refresh list
                  </button>
                </div>
              </div>
            </div>
            )
          )}

          {adminTab === 'settings' && (
            !canAccessSettings ? (
              <AccessRestricted onReturn={() => setAdminTab('overview')} />
            ) : (
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Site Name</label>
                      <input type="text" className="form-control" value={sysSettings.siteName || ''} onChange={e => setSysSettings(p => ({ ...p, siteName: e.target.value }))} placeholder="NPC Rwanda" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Site Subtitle</label>
                      <input type="text" className="form-control" value={sysSettings.siteSubtitle || ''} onChange={e => setSysSettings(p => ({ ...p, siteSubtitle: e.target.value }))} placeholder="NATIONAL PARALYMPIC COMMITTEE OF RWANDA" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Contact Email</label>
                      <input type="email" className="form-control" value={sysSettings.contactEmail || ''} onChange={e => setSysSettings(p => ({ ...p, contactEmail: e.target.value }))} placeholder="info@npcrwanda.org" required />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Contact Phone</label>
                      <input type="text" className="form-control" value={sysSettings.contactPhone || ''} onChange={e => setSysSettings(p => ({ ...p, contactPhone: e.target.value }))} placeholder="+250 788 672 739" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Physical Address</label>
                      <input type="text" className="form-control" value={sysSettings.address || ''} onChange={e => setSysSettings(p => ({ ...p, address: e.target.value }))} placeholder="Amahoro Stadium, Kigali" />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Logo Path / URL</label>
                      <input type="text" className="form-control" value={sysSettings.siteLogo || ''} onChange={e => setSysSettings(p => ({ ...p, siteLogo: e.target.value }))} placeholder="/assets/img/logo.png" />
                      <small style={{ color: '#94A3B8', fontSize: '0.75rem' }}>Relative path or absolute URL to the logo image.</small>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                      <i className="fas fa-share-nodes text-primary me-2" />Social Media Profiles
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                          <i className="fab fa-facebook text-primary me-1" /> Facebook URL
                        </label>
                        <input type="text" className="form-control" value={sysSettings.facebook || ''} onChange={e => setSysSettings(p => ({ ...p, facebook: e.target.value }))} placeholder="https://facebook.com/npcrwanda" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                          <i className="fab fa-twitter text-info me-1" /> Twitter / X URL
                        </label>
                        <input type="text" className="form-control" value={sysSettings.twitter || ''} onChange={e => setSysSettings(p => ({ ...p, twitter: e.target.value }))} placeholder="https://twitter.com/npcrwanda" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                          <i className="fab fa-instagram text-danger me-1" /> Instagram URL
                        </label>
                        <input type="text" className="form-control" value={sysSettings.instagram || ''} onChange={e => setSysSettings(p => ({ ...p, instagram: e.target.value }))} placeholder="https://instagram.com/npc.rwanda" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                          <i className="fab fa-youtube text-danger me-1" /> YouTube Channel URL
                        </label>
                        <input type="text" className="form-control" value={sysSettings.youtube || ''} onChange={e => setSysSettings(p => ({ ...p, youtube: e.target.value }))} placeholder="https://www.youtube.com/@npcrwandaofficial1716" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                          <i className="fab fa-linkedin text-primary me-1" /> LinkedIn URL
                        </label>
                        <input type="text" className="form-control" value={sysSettings.linkedin || ''} onChange={e => setSysSettings(p => ({ ...p, linkedin: e.target.value }))} placeholder="https://linkedin.com/company/npcrwanda" />
                      </div>
                    </div>
                  </div>


                  {/* SMTP / Email Settings */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '18px' }}>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>
                      <i className="fas fa-envelope-open-text text-primary me-2" />Email (SMTP) Settings
                    </label>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginBottom: '12px' }}>Configure SMTP to send email notifications to newsletter subscribers. Leave blank to disable email sending.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>SMTP Host</label>
                        <input type="text" className="form-control" value={sysSettings.smtpHost || ''} onChange={e => setSysSettings(p => ({ ...p, smtpHost: e.target.value }))} placeholder="smtp.npcrwanda.org" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>SMTP Port</label>
                        <input type="text" className="form-control" value={sysSettings.smtpPort || ''} onChange={e => setSysSettings(p => ({ ...p, smtpPort: e.target.value }))} placeholder="587" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>SMTP Username</label>
                        <input type="text" className="form-control" value={sysSettings.smtpUser || ''} onChange={e => setSysSettings(p => ({ ...p, smtpUser: e.target.value }))} placeholder="info@npcrwanda.org" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>SMTP Password</label>
                        <input type="password" className="form-control" value={sysSettings.smtpPass || ''} onChange={e => setSysSettings(p => ({ ...p, smtpPass: e.target.value }))} placeholder="••••••••" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Sender Email (From)</label>
                        <input type="text" className="form-control" value={sysSettings.smtpFrom || ''} onChange={e => setSysSettings(p => ({ ...p, smtpFrom: e.target.value }))} placeholder="NPC Rwanda <info@npcrwanda.org>" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Use SSL/TLS (smtpSecure)</label>
                        <select className="form-control" value={sysSettings.smtpSecure || 'false'} onChange={e => setSysSettings(p => ({ ...p, smtpSecure: e.target.value }))}>
                          <option value="false">No (Port 587 STARTTLS)</option>
                          <option value="true">Yes (Port 465 SSL)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                    <button type="submit" disabled={settingsSaving} style={{ background: '#0072C6', color: '#fff', border: 'none', borderRadius: '8px', padding: '11px 24px', fontWeight: 700, fontSize: '0.88rem', cursor: settingsSaving ? 'not-allowed' : 'pointer', opacity: settingsSaving ? 0.7 : 1 }}>
                      <i className="fas fa-floppy-disk me-2" />{settingsSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                    <button type="button" onClick={handleSettingsCancel} style={{ background: '#F1F5F9', color: '#64748B', border: 'none', borderRadius: '8px', padding: '11px 20px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>

              {/* Database Backup & Disaster Recovery (.SQL) */}
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-database" style={{ fontSize: '1.3rem', color: '#D97706' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Database Backup & Disaster Recovery (.SQL)</h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>Download a complete, ready-to-restore .SQL database script containing all system tables and records.</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.6, marginBottom: '20px' }}>
                  Generate an instant offline SQL script backup of all database tables including athletes, news articles, events, careers, governance records, contact inquiries, volunteer applications, and subscriber lists. All user credentials and passwords are automatically scrubbed for security. Ready to import directly into PostgreSQL.
                </p>
                <a
                  href="/api/backup/export"
                  download="npcrwanda_backup.sql"
                  className="btn"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  <i className="fas fa-file-code" />
                  Export Full Database Backup (.SQL)
                </a>
              </div>
            </div>
            )
          )}


          {/* ──────────────────────────────
             TAB: SUBSCRIBERS
             ────────────────────────────── */}
          {adminTab === 'subscribers' && (
            !isAdmin ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '480px', borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ background: 'linear-gradient(135deg, #1E293B, #334155)', padding: '32px', color: '#fff' }}>
                    <i className="fas fa-lock" style={{ fontSize: '2.5rem', marginBottom: '16px', display: 'block', color: '#FFA000' }} />
                    <h4 style={{ fontWeight: 700, marginBottom: '8px' }}>Restricted Access Area</h4>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '0' }}>Subscribers management requires Administrator or higher privileges.</p>
                  </div>
                  <div className="card-body text-center py-3">
                    <button className="btn btn-primary btn-sm" onClick={() => setAdminTab('overview')}><i className="fas fa-arrow-left me-2" />Back to Overview</button>
                  </div>
                </div>
              </div>
            ) : (
              <SubscribersTab />
            )
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
    </>
  );
}

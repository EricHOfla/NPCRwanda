'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_SITE_CONTENT } from '@/lib/defaultSiteContent';

export const PUBLIC_BUNDLE_QUERY_KEY = ['npc-public-bundle'] as const;

// Type definitions matching Prisma schema
export interface Athlete {
  id: string;
  name: string;
  sport: string;
  status: string;
  country: string;
  avatar: string;
  desc: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  category: string;
  status: string;
  img: string;
  desc: string;
  content: string;
  slug: string;
}

export interface Career {
  id: string;
  title: string;
  location: string;
  applicants: number;
  status: string;
  desc: string;
  slug: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  interest: string;
  skills: string;
  details: string;
  read: boolean;
}

export interface DonationInquiry {
  id: string;
  name: string;
  email: string;
  category: string;
  supportType: string;
  details: string;
  read: boolean;
}

export interface SportDiscipline {
  id: string;
  slug: string;
  title: string;
  img: string;
  desc: string;
}

export type Sport = SportDiscipline;

export interface Leader {
  id: string;
  name: string;
  role: string;
  desc: string;
  avatar: string;
  committee: string;
  email?: string | null;
  phone?: string | null;
  impairment?: string | null;
}

export interface SystemComponent {
  id: string;
  title: string;
  desc: string;
}

export interface GovernanceDocument {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  order: number;
  published: boolean;
}

export interface GovernancePolicy {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  order: number;
  published: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  category: string;
  status: string;
  img: string;
  featured: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  category: string;
  order: number;
  active: boolean;
}

export interface ContactInfo {
  id: string;
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  active: boolean;
  order: number;
}

export interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
}

export interface NpcAssociation {
  id: string;
  name: string;
  acronym: string;
  desc: string;
  activities: string[];
  icon: string;
  order: number;
  active: boolean;
}

export interface NpcClub {
  id: string;
  name: string;
  location: string;
  order: number;
  active: boolean;
}

export interface NpcFederation {
  id: string;
  name: string;
  logo: string;
  website?: string | null;
  role: string;
  desc: string;
  order: number;
  active: boolean;
}

export interface DpscoContact {
  id: string;
  province: string;
  district: string;
  coordinator: string;
  phone: string;
  email: string;
  active: boolean;
}

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
  createdAt: string;
}

interface DataContextType {
  // Public Data
  athletes: Athlete[];
  news: NewsArticle[];
  careers: Career[];
  sports: SportDiscipline[];
  leaders: Leader[];
  leadership: Leader[];
  systemComponents: SystemComponent[];
  governanceDocs: GovernanceDocument[];
  governancePolicies: GovernancePolicy[];
  events: Event[];
  partners: Partner[];
  siteContent: Record<string, string>;
  siteContentList: SiteContent[];
  systemSettings: Record<string, string>;
  contactInfo: ContactInfo | null;
  socialLinks: SocialLink[];
  mediaAssets: MediaAsset[];
  fetchMediaAssets: () => Promise<void>;
  fetchProtectedData: () => Promise<void>;
  uploadMediaFile: (file: File, category?: string, entity?: string) => Promise<MediaAsset>;
  deleteMediaAsset: (id: string) => Promise<void>;
  
  // Athlete Actions
  addAthlete: (athlete: Omit<Athlete, 'id'>) => Promise<void>;
  updateAthlete: (athlete: Athlete) => Promise<void>;
  deleteAthlete: (id: string) => Promise<void>;
  
  // News Actions
  addNews: (article: Omit<NewsArticle, 'id'>) => Promise<void>;
  updateNews: (article: NewsArticle) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  
  // Career Actions
  addCareer: (career: Omit<Career, 'id'>) => Promise<void>;
  updateCareer: (career: Career) => Promise<void>;
  deleteCareer: (id: string) => Promise<void>;
  
  // Messages & Form Submissions
  messages: ContactMessage[];
  volunteers: VolunteerApplication[];
  donations: DonationInquiry[];
  submitContactMessage: (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => Promise<{ success: boolean; error?: string }>;
  submitVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'read'>) => Promise<{ success: boolean; error?: string }>;
  submitDonationInquiry: (inquiry: Omit<DonationInquiry, 'id' | 'read'>) => Promise<{ success: boolean; error?: string }>;
  addContactMessage: (name: string, email: string, subject: string, message: string) => Promise<void>;
  addVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'read'>) => Promise<void>;
  addDonationInquiry: (inquiry: Omit<DonationInquiry, 'id' | 'read'>) => Promise<void>;
  markMessageRead: (id: string, read: boolean) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  markVolunteerRead: (id: string, read: boolean) => Promise<void>;
  deleteVolunteer: (id: string) => Promise<void>;
  markDonationRead: (id: string, read: boolean) => Promise<void>;
  deleteDonation: (id: string) => Promise<void>;

  // Sports Actions
  addSport: (sport: Omit<SportDiscipline, 'id'>) => Promise<void>;
  updateSport: (sport: SportDiscipline) => Promise<void>;
  deleteSport: (id: string) => Promise<void>;

  // Leaders Actions
  addLeader: (leader: Omit<Leader, 'id'>) => Promise<void>;
  updateLeader: (leader: Leader) => Promise<void>;
  deleteLeader: (id: string) => Promise<void>;

  // Events Actions
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Governance Actions
  addGovDoc: (doc: Omit<GovernanceDocument, 'id'>) => Promise<void>;
  updateGovDoc: (doc: GovernanceDocument) => Promise<void>;
  deleteGovDoc: (id: string) => Promise<void>;
  addGovPolicy: (policy: Omit<GovernancePolicy, 'id'>) => Promise<void>;
  updateGovPolicy: (policy: GovernancePolicy) => Promise<void>;
  deleteGovPolicy: (id: string) => Promise<void>;

  // Partners Actions
  addPartner: (partner: Omit<Partner, 'id'>) => Promise<void>;
  updatePartner: (partner: Partner) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;

  // Site Content & Settings Actions
  updateSiteContent: (key: string, value: string, type?: string) => Promise<void>;
  updateSystemSettings: (settings: Record<string, string>) => void;
  updateContactInfo: (info: Omit<ContactInfo, 'id'>) => Promise<void>;
  addSocialLink: (link: Omit<SocialLink, 'id'>) => Promise<void>;
  updateSocialLink: (link: SocialLink) => Promise<void>;
  deleteSocialLink: (id: string) => Promise<void>;

  // Associations, Clubs, Federations, DPSCO Contacts
  associations: NpcAssociation[];
  clubs: NpcClub[];
  federations: NpcFederation[];
  npcAssociations: NpcAssociation[];
  npcClubs: NpcClub[];
  npcFederations: NpcFederation[];
  dpscoContacts: DpscoContact[];
  
  addAssociation: (item: Omit<NpcAssociation, 'id'>) => Promise<void>;
  updateAssociation: (item: NpcAssociation) => Promise<void>;
  deleteAssociation: (id: string) => Promise<void>;

  addClub: (item: Omit<NpcClub, 'id'>) => Promise<void>;
  updateClub: (item: NpcClub) => Promise<void>;
  deleteClub: (id: string) => Promise<void>;

  addFederation: (item: Omit<NpcFederation, 'id'>) => Promise<void>;
  updateFederation: (item: NpcFederation) => Promise<void>;
  deleteFederation: (id: string) => Promise<void>;

  addDpscoContact: (item: Omit<DpscoContact, 'id'>) => Promise<void>;
  updateDpscoContact: (item: DpscoContact) => Promise<void>;
  deleteDpscoContact: (id: string) => Promise<void>;

  // Aliases and Compatibility
  contacts: ContactMessage[];
  closeCareer: (id: string) => Promise<void>;
  markContactAsRead: (id: string, read?: boolean) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  addSystemComponent: (item: Omit<SystemComponent, 'id'>) => Promise<void>;
  updateSystemComponent: (item: SystemComponent) => Promise<void>;
  deleteSystemComponent: (id: string) => Promise<void>;
  markVolunteerAsRead: (id: string, read?: boolean) => Promise<void>;
  deleteVolunteerApplication: (id: string) => Promise<void>;
  markDonationAsRead: (id: string, read?: boolean) => Promise<void>;
  deleteDonationInquiry: (id: string) => Promise<void>;
  saveSiteContent: (key: string, value: string, type?: string) => Promise<void>;
  addNpcAssociation: (item: Omit<NpcAssociation, 'id'>) => Promise<void>;
  updateNpcAssociation: (item: NpcAssociation) => Promise<void>;
  deleteNpcAssociation: (id: string) => Promise<void>;
  addNpcClub: (item: Omit<NpcClub, 'id'>) => Promise<void>;
  updateNpcClub: (item: NpcClub) => Promise<void>;
  deleteNpcClub: (id: string) => Promise<void>;
  addNpcFederation: (item: Omit<NpcFederation, 'id'>) => Promise<void>;
  updateNpcFederation: (item: NpcFederation) => Promise<void>;
  deleteNpcFederation: (id: string) => Promise<void>;

  loading: boolean;
  error: string | null;
  refetchPublicData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [sports, setSports] = useState<SportDiscipline[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [systemComponents, setSystemComponents] = useState<SystemComponent[]>([]);
  const [governanceDocs, setGovernanceDocs] = useState<GovernanceDocument[]>([]);
  const [governancePolicies, setGovernancePolicies] = useState<GovernancePolicy[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [siteContent, setSiteContent] = useState<Record<string, string>>(DEFAULT_SITE_CONTENT);
  const [siteContentList, setSiteContentList] = useState<SiteContent[]>([]);
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  
  // Protected states
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [donations, setDonations] = useState<DonationInquiry[]>([]);

  // Member states
  const [associations, setAssociations] = useState<NpcAssociation[]>([]);
  const [clubs, setClubs] = useState<NpcClub[]>([]);
  const [federations, setFederations] = useState<NpcFederation[]>([]);
  const [dpscoContacts, setDpscoContacts] = useState<DpscoContact[]>([]);

  const queryClient = useQueryClient();

  // Fetch Public Data via TanStack Query with IndexedDB persistence
  const {
    data: bundleData,
    isLoading: queryIsLoading,
    isPending,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: PUBLIC_BUNDLE_QUERY_KEY,
    queryFn: async () => {
      const res = await fetch('/api/bundle');
      if (!res.ok) {
        throw new Error(`Failed to fetch public bundle (status ${res.status})`);
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    gcTime: 24 * 60 * 60 * 1000, // 24 hours in persistent cache
  });

  const invalidatePublicBundle = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: PUBLIC_BUNDLE_QUERY_KEY });
  }, [queryClient]);

  // Sync bundleData into state whenever query data arrives (from cache or server)
  useEffect(() => {
    if (!bundleData) return;
    const data = bundleData;

    setAthletes(Array.isArray(data.athletes) ? data.athletes : []);
    setNews(Array.isArray(data.news) ? data.news : []);
    setCareers(Array.isArray(data.careers) ? data.careers : []);
    setSports(Array.isArray(data.sports) ? data.sports : []);
    setLeaders(Array.isArray(data.leaders) ? data.leaders : []);
    setGovernanceDocs(Array.isArray(data.governanceDocs) ? data.governanceDocs : []);
    setGovernancePolicies(Array.isArray(data.governancePolicies) ? data.governancePolicies : []);
    setEvents(Array.isArray(data.events) ? data.events : []);
    setPartners(Array.isArray(data.partners) ? data.partners : []);
    setContactInfo(data.contactInfo || null);
    setSocialLinks(Array.isArray(data.socialLinks) ? data.socialLinks : []);
    setSystemComponents(Array.isArray(data.systemComponents) ? data.systemComponents : []);
    setAssociations(Array.isArray(data.associations) ? data.associations : []);
    setClubs(Array.isArray(data.clubs) ? data.clubs : []);
    setFederations(Array.isArray(data.federations) ? data.federations : []);
    setDpscoContacts(Array.isArray(data.dpscoContacts) ? data.dpscoContacts : []);

    if (data.systemSettings && typeof data.systemSettings === 'object') {
      setSystemSettings(data.systemSettings as Record<string, string>);
    }

    const contentList: SiteContent[] = Array.isArray(data.siteContent) ? data.siteContent : [];
    setSiteContentList(contentList);
    const map: Record<string, string> = { ...DEFAULT_SITE_CONTENT };
    contentList.forEach((c: SiteContent) => {
      if (c.value !== undefined && c.value !== null) {
        map[c.key] = c.value;
      }
    });
    if (data.siteContentMap && typeof data.siteContentMap === 'object') {
      Object.assign(map, data.siteContentMap);
    }
    setSiteContent(map);
  }, [bundleData]);

  // Loading is ONLY true if there is NO cached data available yet
  const loading = (isPending || queryIsLoading) && !bundleData;
  const error = queryError ? (queryError as Error).message : null;

  const fetchPublicData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Fetch Protected Data (Messages, Volunteers, Donations, Media) for dashboard
  const fetchProtectedData = async () => {
    try {
      const [msgRes, volRes, donRes, mediaRes] = await Promise.all([
        fetch('/api/contacts').then(r => r.ok ? r.json() : []),
        fetch('/api/volunteers').then(r => r.ok ? r.json() : []),
        fetch('/api/donations').then(r => r.ok ? r.json() : []),
        fetch('/api/media').then(r => r.ok ? r.json() : []),
      ]);
      setMessages(msgRes);
      setVolunteers(volRes);
      setDonations(donRes);
      setMediaAssets(mediaRes);
    } catch (err) {
      console.error('Error fetching protected dashboard data:', err);
    }
  };

  const fetchMediaAssets = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const data = await res.json();
        setMediaAssets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Athlete CRUD
  const addAthlete = async (athlete: Omit<Athlete, 'id'>) => {
    const res = await fetch('/api/athletes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(athlete),
    });
    if (res.ok) {
      const created = await res.json();
      setAthletes(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add athlete');
    }
  };

  const updateAthlete = async (athlete: Athlete) => {
    const res = await fetch(`/api/athletes/${athlete.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(athlete),
    });
    if (res.ok) {
      const updated = await res.json();
      setAthletes(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update athlete');
    }
  };

  const deleteAthlete = async (id: string) => {
    const res = await fetch(`/api/athletes/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setAthletes(prev => prev.filter(a => a.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete athlete');
    }
  };

  // News CRUD
  const addNews = async (article: Omit<NewsArticle, 'id'>) => {
    const res = await fetch('/api/news', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (res.ok) {
      const created = await res.json();
      setNews(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add news');
    }
  };

  const updateNews = async (article: NewsArticle) => {
    const res = await fetch(`/api/news/${article.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(article),
    });
    if (res.ok) {
      const updated = await res.json();
      setNews(prev => prev.map(n => (n.id === updated.id ? updated : n)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update news');
    }
  };

  const deleteNews = async (id: string) => {
    const res = await fetch(`/api/news/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setNews(prev => prev.filter(n => n.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete news');
    }
  };

  // Career CRUD
  const addCareer = async (career: Omit<Career, 'id'>) => {
    const res = await fetch('/api/careers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(career),
    });
    if (res.ok) {
      const created = await res.json();
      setCareers(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add career');
    }
  };

  const updateCareer = async (career: Career) => {
    const res = await fetch(`/api/careers/${career.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(career),
    });
    if (res.ok) {
      const updated = await res.json();
      setCareers(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update career');
    }
  };

  const deleteCareer = async (id: string) => {
    const res = await fetch(`/api/careers/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setCareers(prev => prev.filter(c => c.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete career');
    }
  };

  // Sports CRUD
  const addSport = async (sport: Omit<SportDiscipline, 'id'>) => {
    const res = await fetch('/api/sports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sport),
    });
    if (res.ok) {
      const created = await res.json();
      setSports(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add sport');
    }
  };

  const updateSport = async (sport: SportDiscipline) => {
    const res = await fetch(`/api/sports/${sport.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sport),
    });
    if (res.ok) {
      const updated = await res.json();
      setSports(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update sport');
    }
  };

  const deleteSport = async (id: string) => {
    const res = await fetch(`/api/sports/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSports(prev => prev.filter(s => s.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete sport');
    }
  };

  // Leaders CRUD
  const addLeader = async (leader: Omit<Leader, 'id'>) => {
    const res = await fetch('/api/leaders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leader),
    });
    if (res.ok) {
      const created = await res.json();
      setLeaders(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add leader');
    }
  };

  const updateLeader = async (leader: Leader) => {
    const res = await fetch(`/api/leaders/${leader.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leader),
    });
    if (res.ok) {
      const updated = await res.json();
      setLeaders(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update leader');
    }
  };

  const deleteLeader = async (id: string) => {
    const res = await fetch(`/api/leaders/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setLeaders(prev => prev.filter(l => l.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete leader');
    }
  };

  // Events CRUD
  const addEvent = async (event: Omit<Event, 'id'>) => {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      const created = await res.json();
      setEvents(prev => [created, ...prev]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add event');
    }
  };

  const updateEvent = async (event: Event) => {
    const res = await fetch(`/api/events/${event.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (res.ok) {
      const updated = await res.json();
      setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update event');
    }
  };

  const deleteEvent = async (id: string) => {
    const res = await fetch(`/api/events/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete event');
    }
  };

  // Governance Docs & Policies CRUD
  const addGovDoc = async (doc: Omit<GovernanceDocument, 'id'>) => {
    const res = await fetch('/api/governance-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      const created = await res.json();
      setGovernanceDocs(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add document');
    }
  };

  const updateGovDoc = async (doc: GovernanceDocument) => {
    const res = await fetch(`/api/governance-docs/${doc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (res.ok) {
      const updated = await res.json();
      setGovernanceDocs(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update document');
    }
  };

  const deleteGovDoc = async (id: string) => {
    const res = await fetch(`/api/governance-docs/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setGovernanceDocs(prev => prev.filter(d => d.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete document');
    }
  };

  const addGovPolicy = async (policy: Omit<GovernancePolicy, 'id'>) => {
    const res = await fetch('/api/governance-policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    if (res.ok) {
      const created = await res.json();
      setGovernancePolicies(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add policy');
    }
  };

  const updateGovPolicy = async (policy: GovernancePolicy) => {
    const res = await fetch(`/api/governance-policies/${policy.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    if (res.ok) {
      const updated = await res.json();
      setGovernancePolicies(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update policy');
    }
  };

  const deleteGovPolicy = async (id: string) => {
    const res = await fetch(`/api/governance-policies/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setGovernancePolicies(prev => prev.filter(p => p.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete policy');
    }
  };

  // Partners CRUD
  const addPartner = async (partner: Omit<Partner, 'id'>) => {
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    });
    if (res.ok) {
      const created = await res.json();
      setPartners(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add partner');
    }
  };

  const updatePartner = async (partner: Partner) => {
    const res = await fetch(`/api/partners/${partner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    });
    if (res.ok) {
      const updated = await res.json();
      setPartners(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update partner');
    }
  };

  const deletePartner = async (id: string) => {
    const res = await fetch(`/api/partners/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setPartners(prev => prev.filter(p => p.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete partner');
    }
  };

  // Site Content & Settings CRUD
  const updateSiteContent = async (key: string, value: string, type = 'text') => {
    const res = await fetch('/api/site-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, type }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSiteContent(prev => ({ ...prev, [key]: value }));
      invalidatePublicBundle();
      setSiteContentList(prev => {
        const index = prev.findIndex(item => item.key === key);
        if (index > -1) {
          const newList = [...prev];
          newList[index] = updated;
          return newList;
        }
        return [...prev, updated];
      });
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update site content');
    }
  };

  const updateSystemSettings = (settings: Record<string, string>) => {
    setSystemSettings(prev => ({ ...prev, ...settings }));
  };

  const updateContactInfo = async (info: Omit<ContactInfo, 'id'>) => {
    const res = await fetch('/api/contact-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(info),
    });
    if (res.ok) {
      const updated = await res.json();
      setContactInfo(updated);
      invalidatePublicBundle();
      setSystemSettings(prev => ({
        ...prev,
        address: updated.address,
        contactPhone: updated.phone,
        contactEmail: updated.email,
      }));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update contact info');
    }
  };

  const addSocialLink = async (link: Omit<SocialLink, 'id'>) => {
    const res = await fetch('/api/social-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    if (res.ok) {
      const created = await res.json();
      setSocialLinks(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add social link');
    }
  };

  const updateSocialLink = async (link: SocialLink) => {
    const res = await fetch(`/api/social-links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(link),
    });
    if (res.ok) {
      const updated = await res.json();
      setSocialLinks(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update social link');
    }
  };

  const deleteSocialLink = async (id: string) => {
    const res = await fetch(`/api/social-links/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setSocialLinks(prev => prev.filter(s => s.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete social link');
    }
  };

  const uploadMediaFile = async (file: File, category: string = 'site', entity?: string): Promise<MediaAsset> => {
    // Direct signed Cloudinary upload for large files to avoid server body limits (413)
    const tryDirectCloudinaryUpload = async (): Promise<MediaAsset | null> => {
      try {
        const signRes = await fetch('/api/upload/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, entity }),
        });
        if (!signRes.ok) return null;
        const signData = await signRes.json();
        const { signature, timestamp, apiKey, cloudName, folder } = signData;
        if (!signature || !cloudName) return null;

        const isImg = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const resourceType = isImg ? 'image' : isPdf ? 'auto' : 'raw';

        const cloudFormData = new FormData();
        cloudFormData.append('file', file);
        cloudFormData.append('api_key', apiKey);
        cloudFormData.append('timestamp', timestamp.toString());
        cloudFormData.append('signature', signature);
        cloudFormData.append('folder', folder);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
          method: 'POST',
          body: cloudFormData,
        });

        if (!cloudRes.ok) {
          const cloudErr = await cloudRes.json().catch(() => ({}));
          console.warn('Cloudinary direct upload failed:', cloudErr);
          return null;
        }

        const cloudResult = await cloudRes.json();
        const fileUrl = cloudResult.secure_url;

        // Save media asset in DB
        const saveRes = await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            url: fileUrl,
            fileSize: file.size,
            mimeType: file.type || 'application/octet-stream',
          }),
        });

        if (saveRes.ok) {
          const media = await saveRes.json();
          setMediaAssets(prev => [media, ...prev]);
          return media;
        }

        const fallbackMedia: MediaAsset = {
          id: `cloud-${Date.now()}`,
          filename: file.name,
          url: fileUrl,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          createdAt: new Date().toISOString(),
        };
        setMediaAssets(prev => [fallbackMedia, ...prev]);
        return fallbackMedia;
      } catch (directErr) {
        console.warn('Direct upload error, falling back to server route:', directErr);
        return null;
      }
    };

    const isDocFile = category === 'governance' || 
                      category.toLowerCase().includes('doc') || 
                      !file.type.startsWith('image/') || 
                      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|rtf|odt|ods|odp|zip|rar)$/i.test(file.name);

    // For large IMAGES > 3.5MB, upload directly to Cloudinary.
    // Documents are NEVER sent to Cloudinary — they are stored on the local system.
    if (!isDocFile && file.size > 3.5 * 1024 * 1024) {
      const directAsset = await tryDirectCloudinaryUpload();
      if (directAsset) return directAsset;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (entity) {
      formData.append('entity', entity);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    // If server returned 413 (Payload Too Large), fallback to direct signed upload
    if (res.status === 413) {
      const directAsset = await tryDirectCloudinaryUpload();
      if (directAsset) return directAsset;
    }

    const rawText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (!res.ok) {
      const errorMsg = data?.error || data?.message || (res.status === 413 ? 'File too large (exceeds server limit)' : `Upload failed (${res.status})`);
      throw new Error(errorMsg);
    }

    if (!data) {
      throw new Error('Invalid response from server');
    }

    setMediaAssets(prev => [data, ...prev]);
    return data;
  };

  const deleteMediaAsset = async (id: string) => {
    const res = await fetch(`/api/media?id=${id}`, {
      method: 'DELETE',
    });
    const rawText = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }

    if (res.ok) {
      setMediaAssets(prev => prev.filter(m => m.id !== id));
    } else {
      const errorMsg = data?.error || data?.message || `Failed to delete asset (${res.status})`;
      alert(errorMsg);
    }
  };

  // Form Submissions
  const submitContactMessage = async (msg: Omit<ContactMessage, 'id' | 'date' | 'read'>) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Submission failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitVolunteerApplication = async (app: Omit<VolunteerApplication, 'id' | 'read'>) => {
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(app),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Submission failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitDonationInquiry = async (inquiry: Omit<DonationInquiry, 'id' | 'read'>) => {
    try {
      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inquiry),
      });
      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Submission failed' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Messages/Volunteer/Donation Management
  const markMessageRead = async (id: string, read: boolean) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, read } : m)));
    }
  };

  const deleteMessage = async (id: string) => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const markVolunteerRead = async (id: string, read: boolean) => {
    const res = await fetch(`/api/volunteers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      setVolunteers(prev => prev.map(v => (v.id === id ? { ...v, read } : v)));
    }
  };

  const deleteVolunteer = async (id: string) => {
    const res = await fetch(`/api/volunteers/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setVolunteers(prev => prev.filter(v => v.id !== id));
    }
  };

  const markDonationRead = async (id: string, read: boolean) => {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (res.ok) {
      setDonations(prev => prev.map(d => (d.id === id ? { ...d, read } : d)));
    }
  };

  const deleteDonation = async (id: string) => {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setDonations(prev => prev.filter(d => d.id !== id));
    }
  };

  // Association Actions
  const addAssociation = async (item: Omit<NpcAssociation, 'id'>) => {
    const res = await fetch('/api/npc-associations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setAssociations(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add association');
    }
  };

  const updateAssociation = async (item: NpcAssociation) => {
    const res = await fetch(`/api/npc-associations/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const updated = await res.json();
      setAssociations(prev => prev.map(a => a.id === updated.id ? updated : a));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update association');
    }
  };

  const deleteAssociation = async (id: string) => {
    const res = await fetch(`/api/npc-associations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setAssociations(prev => prev.filter(a => a.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete association');
    }
  };

  // Club Actions
  const addClub = async (item: Omit<NpcClub, 'id'>) => {
    const res = await fetch('/api/npc-clubs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setClubs(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add club');
    }
  };

  const updateClub = async (item: NpcClub) => {
    const res = await fetch(`/api/npc-clubs/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const updated = await res.json();
      setClubs(prev => prev.map(c => c.id === updated.id ? updated : c));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update club');
    }
  };

  const deleteClub = async (id: string) => {
    const res = await fetch(`/api/npc-clubs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setClubs(prev => prev.filter(c => c.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete club');
    }
  };

  // Federation Actions
  const addFederation = async (item: Omit<NpcFederation, 'id'>) => {
    const res = await fetch('/api/npc-federations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setFederations(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add federation');
    }
  };

  const updateFederation = async (item: NpcFederation) => {
    const res = await fetch(`/api/npc-federations/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const updated = await res.json();
      setFederations(prev => prev.map(f => f.id === updated.id ? updated : f));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update federation');
    }
  };

  const deleteFederation = async (id: string) => {
    const res = await fetch(`/api/npc-federations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setFederations(prev => prev.filter(f => f.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete federation');
    }
  };

  // DPSCO Contact Actions
  const addDpscoContact = async (item: Omit<DpscoContact, 'id'>) => {
    const res = await fetch('/api/dpsco-contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const created = await res.json();
      setDpscoContacts(prev => [...prev, created]);
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to add DPSCO contact');
    }
  };

  const updateDpscoContact = async (item: DpscoContact) => {
    const res = await fetch(`/api/dpsco-contacts/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (res.ok) {
      const updated = await res.json();
      setDpscoContacts(prev => prev.map(d => d.id === updated.id ? updated : d));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to update DPSCO contact');
    }
  };

  const deleteDpscoContact = async (id: string) => {
    const res = await fetch(`/api/dpsco-contacts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDpscoContacts(prev => prev.filter(d => d.id !== id));
      invalidatePublicBundle();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete DPSCO contact');
    }
  };

  const addContactMessage = async (name: string, email: string, subject: string, message: string) => {
    const res = await submitContactMessage({ name, email, subject, message });
    if (!res.success) throw new Error(res.error || 'Failed to submit contact message');
  };

  const addVolunteerApplication = async (app: Omit<VolunteerApplication, 'id' | 'read'>) => {
    const res = await submitVolunteerApplication(app);
    if (!res.success) throw new Error(res.error || 'Failed to submit volunteer application');
  };

  const addDonationInquiry = async (inquiry: Omit<DonationInquiry, 'id' | 'read'>) => {
    const res = await submitDonationInquiry(inquiry);
    if (!res.success) throw new Error(res.error || 'Failed to submit donation inquiry');
  };

  return (
    <DataContext.Provider
      value={{
        athletes,
        news,
        careers,
        sports,
        leaders,
        leadership: leaders,
        systemComponents,
        governanceDocs,
        governancePolicies,
        events,
        partners,
        siteContent,
        siteContentList,
        systemSettings,
        contactInfo,
        socialLinks,
        mediaAssets,
        fetchMediaAssets,
        fetchProtectedData,
        uploadMediaFile,
        deleteMediaAsset,
        addAthlete,
        updateAthlete,
        deleteAthlete,
        addNews,
        updateNews,
        deleteNews,
        addCareer,
        updateCareer,
        deleteCareer,
        messages,
        volunteers,
        donations,
        submitContactMessage,
        submitVolunteerApplication,
        submitDonationInquiry,
        markMessageRead,
        deleteMessage,
        markVolunteerRead,
        deleteVolunteer,
        markDonationRead,
        deleteDonation,
        addSport,
        updateSport,
        deleteSport,
        addLeader,
        updateLeader,
        deleteLeader,
        addEvent,
        updateEvent,
        deleteEvent,
        addGovDoc,
        updateGovDoc,
        deleteGovDoc,
        addGovPolicy,
        updateGovPolicy,
        deleteGovPolicy,
        addPartner,
        updatePartner,
        deletePartner,
        updateSiteContent,
        updateSystemSettings,
        updateContactInfo,
        addSocialLink,
        updateSocialLink,
        deleteSocialLink,
        associations,
        clubs,
        federations,
        npcAssociations: associations,
        npcClubs: clubs,
        npcFederations: federations,
        dpscoContacts,
        addAssociation,
        updateAssociation,
        deleteAssociation,
        addClub,
        updateClub,
        deleteClub,
        addFederation,
        updateFederation,
        deleteFederation,
        addDpscoContact,
        updateDpscoContact,
        deleteDpscoContact,
        addContactMessage,
        addVolunteerApplication,
        addDonationInquiry,
        
        // Compatibility Aliases
        contacts: messages,
        closeCareer: async (id: string) => {
          const target = careers.find(c => c.id === id);
          if (target) await updateCareer({ ...target, status: 'Closed' });
        },
        markContactAsRead: async (id: string, read = true) => markMessageRead(id, read),
        deleteContactMessage: deleteMessage,
        addSystemComponent: async (item: Omit<SystemComponent, 'id'>) => {
          setSystemComponents(prev => [...prev, { ...item, id: Date.now().toString() }]);
        },
        updateSystemComponent: async (item: SystemComponent) => {
          setSystemComponents(prev => prev.map(c => c.id === item.id ? item : c));
        },
        deleteSystemComponent: async (id: string) => {
          setSystemComponents(prev => prev.filter(c => c.id !== id));
        },
        markVolunteerAsRead: async (id: string, read = true) => markVolunteerRead(id, read),
        deleteVolunteerApplication: deleteVolunteer,
        markDonationAsRead: async (id: string, read = true) => markDonationRead(id, read),
        deleteDonationInquiry: deleteDonation,
        saveSiteContent: async (key: string, value: string, type?: string) => {
          await updateSiteContent(key, value, type);
        },
        addNpcAssociation: addAssociation,
        updateNpcAssociation: updateAssociation,
        deleteNpcAssociation: deleteAssociation,
        addNpcClub: addClub,
        updateNpcClub: updateClub,
        deleteNpcClub: deleteClub,
        addNpcFederation: addFederation,
        updateNpcFederation: updateFederation,
        deleteNpcFederation: deleteFederation,

        loading,
        error,
        refetchPublicData: fetchPublicData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

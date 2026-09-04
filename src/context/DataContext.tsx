'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces for our datasets

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
  website: string | null;
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

export interface Sport {
  id: string;
  slug: string;
  title: string;
  img: string;
  desc: string;
}

export interface Leader {
  id: string;
  name: string;
  role: string;
  desc: string;
  avatar: string;
  committee?: string;
  email?: string | null;
  phone?: string | null;
  impairment?: string | null;
}

export interface SystemComponent {
  id: string;
  title: string;
  desc: string;
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

export interface Partner {
  id: string;
  name: string;
  logo: string;
  website: string;
  category?: string;
  order: number;
  active: boolean;
}

export interface SiteContent {
  id: string;
  key: string;
  value: string;
  type: string;
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

interface DataContextType {
  athletes: Athlete[];
  news: NewsArticle[];
  events: Event[];
  careers: Career[];
  contacts: ContactMessage[];
  sports: Sport[];
  leadership: Leader[];
  systemComponents: SystemComponent[];
  volunteers: VolunteerApplication[];
  donations: DonationInquiry[];
  partners: Partner[];

  npcAssociations: NpcAssociation[];
  npcClubs: NpcClub[];
  npcFederations: NpcFederation[];
  dpscoContacts: DpscoContact[];

  // Association Actions
  addNpcAssociation: (assoc: Omit<NpcAssociation, 'id'>) => Promise<void>;
  updateNpcAssociation: (assoc: NpcAssociation) => Promise<void>;
  deleteNpcAssociation: (id: string) => Promise<void>;

  // Club Actions
  addNpcClub: (club: Omit<NpcClub, 'id'>) => Promise<void>;
  updateNpcClub: (club: NpcClub) => Promise<void>;
  deleteNpcClub: (id: string) => Promise<void>;

  // Federation Actions
  addNpcFederation: (fed: Omit<NpcFederation, 'id'>) => Promise<void>;
  updateNpcFederation: (fed: NpcFederation) => Promise<void>;
  deleteNpcFederation: (id: string) => Promise<void>;

  // DPSCO Actions
  addDpscoContact: (contact: Omit<DpscoContact, 'id'>) => Promise<void>;
  updateDpscoContact: (contact: DpscoContact) => Promise<void>;
  deleteDpscoContact: (id: string) => Promise<void>;

  siteContent: Record<string, string>;
  siteContentList: SiteContent[];
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
  addCareer: (career: Omit<Career, 'id' | 'applicants'>) => Promise<void>;
  closeCareer: (id: string) => Promise<void>;
  
  // Contact Actions
  addContactMessage: (name: string, email: string, subject: string, message: string) => Promise<void>;
  markContactAsRead: (id: string) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;

  // Sport Actions
  addSport: (sport: Omit<Sport, 'id'>) => Promise<void>;
  updateSport: (sport: Sport) => Promise<void>;
  deleteSport: (id: string) => Promise<void>;

  // Leader Actions
  addLeader: (leader: Omit<Leader, 'id'>) => Promise<void>;
  updateLeader: (leader: Leader) => Promise<void>;
  deleteLeader: (id: string) => Promise<void>;

  // Event Actions
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (event: Event) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // System Actions
  addSystemComponent: (comp: Omit<SystemComponent, 'id'>) => Promise<void>;
  updateSystemComponent: (comp: SystemComponent) => Promise<void>;
  deleteSystemComponent: (id: string) => Promise<void>;

  // Volunteer Actions
  addVolunteerApplication: (app: Omit<VolunteerApplication, 'id' | 'read'>) => Promise<void>;
  markVolunteerAsRead: (id: string) => Promise<void>;
  deleteVolunteerApplication: (id: string) => Promise<void>;

  // Donation Actions
  addDonationInquiry: (inq: Omit<DonationInquiry, 'id' | 'read'>) => Promise<void>;
  markDonationAsRead: (id: string) => Promise<void>;
  deleteDonationInquiry: (id: string) => Promise<void>;

  // Partner Actions
  addPartner: (partner: Omit<Partner, 'id'>) => Promise<void>;
  updatePartner: (partner: Partner) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;

  // Site Content Actions
  saveSiteContent: (key: string, value: string, type?: string) => Promise<void>;

  // Contact Info Actions
  updateContactInfo: (info: Omit<ContactInfo, 'id'>) => Promise<void>;

  // Social Link Actions
  addSocialLink: (link: Omit<SocialLink, 'id'>) => Promise<void>;
  updateSocialLink: (link: SocialLink) => Promise<void>;
  deleteSocialLink: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [leadership, setLeadership] = useState<Leader[]>([]);
  const [systemComponents, setSystemComponents] = useState<SystemComponent[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [donations, setDonations] = useState<DonationInquiry[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  const [npcAssociations, setNpcAssociations] = useState<NpcAssociation[]>([]);
  const [npcClubs, setNpcClubs] = useState<NpcClub[]>([]);
  const [npcFederations, setNpcFederations] = useState<NpcFederation[]>([]);
  const [dpscoContacts, setDpscoContacts] = useState<DpscoContact[]>([]);

  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [siteContentList, setSiteContentList] = useState<SiteContent[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);

  const fetchMediaAssets = async () => {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        setMediaAssets(await res.json());
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
    }
  };

  // Helper to fetch dashboard messages after login or when active
  const fetchProtectedData = async () => {
    try {
      const [contactRes, volunteerRes, donationRes] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/volunteers'),
        fetch('/api/donations')
      ]);
      if (contactRes.ok) {
        setContacts(await contactRes.json());
      }
      if (volunteerRes.ok) {
        setVolunteers(await volunteerRes.json());
      }
      if (donationRes.ok) {
        setDonations(await donationRes.json());
      }
    } catch (err) {
      console.error('Failed to load protected admin inbox data:', err);
    }
  };

  const loadData = async () => {
    try {
      const [athRes, newsRes, eventsRes, carRes, sportsRes, leadersRes, sysRes, partnersRes, assocRes, clubRes, fedRes, dpscoRes, contentRes, contactRes, socialRes] = await Promise.all([
        fetch('/api/athletes').then(r => r.json()),
        fetch('/api/news').then(r => r.json()),
        fetch('/api/events').then(r => r.json()),
        fetch('/api/careers').then(r => r.json()),
        fetch('/api/sports').then(r => r.json()),
        fetch('/api/leaders').then(r => r.json()),
        fetch('/api/system').then(r => r.json()),
        fetch('/api/partners').then(r => r.json()),

        fetch('/api/npc-associations').then(r => r.json()),
        fetch('/api/npc-clubs').then(r => r.json()),
        fetch('/api/npc-federations').then(r => r.json()),
        fetch('/api/dpsco-contacts').then(r => r.json()),

        fetch('/api/site-content').then(r => r.json()),
        fetch('/api/contact-info').then(r => r.json()),
        fetch('/api/social-links').then(r => r.json()),
      ]);
      
      setAthletes(Array.isArray(athRes) ? athRes : []);
      setNews(Array.isArray(newsRes) ? newsRes : []);
      setEvents(Array.isArray(eventsRes) ? eventsRes : []);
      setCareers(Array.isArray(carRes) ? carRes : []);
      setSports(Array.isArray(sportsRes) ? sportsRes : []);
      setLeadership(Array.isArray(leadersRes) ? leadersRes : []);
      setSystemComponents(Array.isArray(sysRes) ? sysRes : []);
      setPartners(Array.isArray(partnersRes) ? partnersRes : []);

      setNpcAssociations(Array.isArray(assocRes) ? assocRes : []);
      setNpcClubs(Array.isArray(clubRes) ? clubRes : []);
      setNpcFederations(Array.isArray(fedRes) ? fedRes : []);
      setDpscoContacts(Array.isArray(dpscoRes) ? dpscoRes : []);

      if (contentRes && contentRes.map) {
        setSiteContent(contentRes.map);
        setSiteContentList(contentRes.list || []);
      }
      setContactInfo(contactRes);
      setSocialLinks(Array.isArray(socialRes) ? socialRes : []);
    } catch (err) {
      console.error('Error loading public data:', err);
    }
    await fetchProtectedData();
    await fetchMediaAssets();
  };

  useEffect(() => {
    loadData();
  }, []);

  // Athlete Handlers
  const addAthlete = async (athlete: Omit<Athlete, 'id'>) => {
    try {
      const res = await fetch('/api/athletes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(athlete),
      });
      if (res.ok) {
        const data = await res.json();
        setAthletes(prev => [data, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create athlete');
      }
    } catch (err) {
      console.error('Add athlete request error:', err);
    }
  };

  const updateAthlete = async (updatedAthlete: Athlete) => {
    try {
      const res = await fetch(`/api/athletes/${updatedAthlete.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAthlete),
      });
      if (res.ok) {
        const data = await res.json();
        setAthletes(prev => prev.map(a => a.id === data.id ? data : a));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update athlete');
      }
    } catch (err) {
      console.error('Update athlete request error:', err);
    }
  };

  const deleteAthlete = async (id: string) => {
    try {
      const res = await fetch(`/api/athletes/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAthletes(prev => prev.filter(a => a.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete athlete');
      }
    } catch (err) {
      console.error('Delete athlete request error:', err);
    }
  };

  // News Handlers
  const addNews = async (article: Omit<NewsArticle, 'id'>) => {
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      if (res.ok) {
        const data = await res.json();
        setNews(prev => [data, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create article');
      }
    } catch (err) {
      console.error('Add news request error:', err);
    }
  };

  const updateNews = async (updatedArticle: NewsArticle) => {
    try {
      const res = await fetch(`/api/news/${updatedArticle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle),
      });
      if (res.ok) {
        const data = await res.json();
        setNews(prev => prev.map(n => n.id === data.id ? data : n));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update article');
      }
    } catch (err) {
      console.error('Update news request error:', err);
    }
  };

  const deleteNews = async (id: string) => {
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNews(prev => prev.filter(n => n.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('Delete news request error:', err);
    }
  };

  // Career Handlers
  const addCareer = async (career: Omit<Career, 'id' | 'applicants'>) => {
    try {
      const res = await fetch('/api/careers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(career),
      });
      if (res.ok) {
        const data = await res.json();
        setCareers(prev => [data, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create career listing');
      }
    } catch (err) {
      console.error('Add career request error:', err);
    }
  };

  const closeCareer = async (id: string) => {
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Closed' }),
      });
      if (res.ok) {
        const data = await res.json();
        setCareers(prev => prev.map(c => c.id === data.id ? data : c));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to close career listing');
      }
    } catch (err) {
      console.error('Close career request error:', err);
    }
  };

  // Contact Message Handlers
  const addContactMessage = async (name: string, email: string, subject: string, message: string) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(prev => [data, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to send contact message');
      }
    } catch (err) {
      console.error('Send message request error:', err);
    }
  };

  const markContactAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });
      if (res.ok) {
        const data = await res.json();
        setContacts(prev => prev.map(c => c.id === data.id ? data : c));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to mark message as read');
      }
    } catch (err) {
      console.error('Mark read request error:', err);
    }
  };

  const deleteContactMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setContacts(prev => prev.filter(c => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Delete message request error:', err);
    }
  };

  // Sports Handlers
  const addSport = async (sport: Omit<Sport, 'id'>) => {
    try {
      const res = await fetch('/api/sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sport),
      });
      if (res.ok) {
        const data = await res.json();
        setSports(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add sport');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSport = async (updatedSport: Sport) => {
    try {
      const res = await fetch(`/api/sports/${updatedSport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSport),
      });
      if (res.ok) {
        const data = await res.json();
        setSports(prev => prev.map(s => s.id === data.id ? data : s));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update sport');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSport = async (id: string) => {
    try {
      const res = await fetch(`/api/sports/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSports(prev => prev.filter(s => s.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete sport');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Leaders Handlers
  const addLeader = async (leader: Omit<Leader, 'id'>) => {
    try {
      const res = await fetch('/api/leaders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leader),
      });
      if (res.ok) {
        const data = await res.json();
        setLeadership(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add leader');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateLeader = async (updatedLeader: Leader) => {
    try {
      const res = await fetch(`/api/leaders/${updatedLeader.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLeader),
      });
      if (res.ok) {
        const data = await res.json();
        setLeadership(prev => prev.map(l => l.id === data.id ? data : l));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update leader');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteLeader = async (id: string) => {
    try {
      const res = await fetch(`/api/leaders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeadership(prev => prev.filter(l => l.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete leader');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Event Handlers
  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => [data, ...prev]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEvent = async (updatedEvent: Event) => {
    try {
      const res = await fetch(`/api/events/${updatedEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => prev.map(e => e.id === data.id ? data : e));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // System Component Handlers
  const addSystemComponent = async (comp: Omit<SystemComponent, 'id'>) => {
    try {
      const res = await fetch('/api/system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comp),
      });
      if (res.ok) {
        const data = await res.json();
        setSystemComponents(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add system component');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSystemComponent = async (updatedComp: SystemComponent) => {
    try {
      const res = await fetch(`/api/system/${updatedComp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComp),
      });
      if (res.ok) {
        const data = await res.json();
        setSystemComponents(prev => prev.map(c => c.id === data.id ? data : c));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update system component');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSystemComponent = async (id: string) => {
    try {
      const res = await fetch(`/api/system/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSystemComponents(prev => prev.filter(c => c.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete system component');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Volunteer Handlers
  const addVolunteerApplication = async (app: Omit<VolunteerApplication, 'id' | 'read'>) => {
    const res = await fetch('/api/volunteers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(app),
    });
    if (res.ok) {
      const data = await res.json();
      setVolunteers(prev => [data, ...prev]);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit application');
    }
  };

  const markVolunteerAsRead = async (id: string) => {
    const item = volunteers.find(v => v.id === id);
    if (!item) return;
    const res = await fetch(`/api/volunteers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !item.read }),
    });
    if (res.ok) {
      const data = await res.json();
      setVolunteers(prev => prev.map(v => v.id === id ? data : v));
    }
  };

  const deleteVolunteerApplication = async (id: string) => {
    const res = await fetch(`/api/volunteers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setVolunteers(prev => prev.filter(v => v.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete application');
    }
  };

  // Donation Handlers
  const addDonationInquiry = async (inq: Omit<DonationInquiry, 'id' | 'read'>) => {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inq),
    });
    if (res.ok) {
      const data = await res.json();
      setDonations(prev => [data, ...prev]);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit inquiry');
    }
  };

  const markDonationAsRead = async (id: string) => {
    const item = donations.find(d => d.id === id);
    if (!item) return;
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read: !item.read }),
    });
    if (res.ok) {
      const data = await res.json();
      setDonations(prev => prev.map(d => d.id === id ? data : d));
    }
  };

  const deleteDonationInquiry = async (id: string) => {
    const res = await fetch(`/api/donations/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setDonations(prev => prev.filter(d => d.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete inquiry');
    }
  };

  // Partner Handlers
  const addPartner = async (partner: Omit<Partner, 'id'>) => {
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partner),
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add partner');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updatePartner = async (updatedPartner: Partner) => {
    try {
      const res = await fetch(`/api/partners/${updatedPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPartner),
      });
      if (res.ok) {
        const data = await res.json();
        setPartners(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update partner');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const res = await fetch(`/api/partners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPartners(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete partner');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Site Content Handlers
  const saveSiteContent = async (key: string, value: string, type = 'text') => {
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type }),
      });
      if (res.ok) {
        const data = await res.json();
        setSiteContent(prev => ({ ...prev, [key]: value }));
        setSiteContentList(prev => {
          const exists = prev.some(item => item.key === key);
          if (exists) {
            return prev.map(item => item.key === key ? data : item);
          }
          return [...prev, data];
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save site content');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Contact Info Handlers
  const updateContactInfo = async (info: Omit<ContactInfo, 'id'>) => {
    try {
      const res = await fetch('/api/contact-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info),
      });
      if (res.ok) {
        const data = await res.json();
        setContactInfo(data);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update contact info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Social Link Handlers
  const addSocialLink = async (link: Omit<SocialLink, 'id'>) => {
    try {
      const res = await fetch('/api/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(link),
      });
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add social link');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateSocialLink = async (updatedLink: SocialLink) => {
    try {
      const res = await fetch(`/api/social-links/${updatedLink.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLink),
      });
      if (res.ok) {
        const data = await res.json();
        setSocialLinks(prev => prev.map(s => s.id === data.id ? data : s));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update social link');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const res = await fetch(`/api/social-links/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSocialLinks(prev => prev.filter(s => s.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete social link');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadMediaFile = async (file: File, category: string = 'site', entity?: string): Promise<MediaAsset> => {
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
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Upload failed');
    }
    const data = await res.json();
    setMediaAssets(prev => [data, ...prev]);
    return data;
  };

  const deleteMediaAsset = async (id: string) => {
    const res = await fetch(`/api/media?id=${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setMediaAssets(prev => prev.filter(m => m.id !== id));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to delete asset');
    }
  };

  
  // NpcAssociation Actions
  const addNpcAssociation = async (assoc: Omit<NpcAssociation, 'id'>) => {
    try {
      const res = await fetch('/api/npc-associations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assoc),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcAssociations(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add association');
      }
    } catch (err) { console.error(err); }
  };
  const updateNpcAssociation = async (assoc: NpcAssociation) => {
    try {
      const res = await fetch(`/api/npc-associations/${assoc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assoc),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcAssociations(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update association');
      }
    } catch (err) { console.error(err); }
  };
  const deleteNpcAssociation = async (id: string) => {
    try {
      const res = await fetch(`/api/npc-associations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNpcAssociations(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete association');
      }
    } catch (err) { console.error(err); }
  };

  // NpcClub Actions
  const addNpcClub = async (club: Omit<NpcClub, 'id'>) => {
    try {
      const res = await fetch('/api/npc-clubs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(club),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcClubs(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add club');
      }
    } catch (err) { console.error(err); }
  };
  const updateNpcClub = async (club: NpcClub) => {
    try {
      const res = await fetch(`/api/npc-clubs/${club.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(club),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcClubs(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update club');
      }
    } catch (err) { console.error(err); }
  };
  const deleteNpcClub = async (id: string) => {
    try {
      const res = await fetch(`/api/npc-clubs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNpcClubs(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete club');
      }
    } catch (err) { console.error(err); }
  };

  // NpcFederation Actions
  const addNpcFederation = async (fed: Omit<NpcFederation, 'id'>) => {
    try {
      const res = await fetch('/api/npc-federations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fed),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcFederations(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add federation');
      }
    } catch (err) { console.error(err); }
  };
  const updateNpcFederation = async (fed: NpcFederation) => {
    try {
      const res = await fetch(`/api/npc-federations/${fed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fed),
      });
      if (res.ok) {
        const data = await res.json();
        setNpcFederations(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update federation');
      }
    } catch (err) { console.error(err); }
  };
  const deleteNpcFederation = async (id: string) => {
    try {
      const res = await fetch(`/api/npc-federations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNpcFederations(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete federation');
      }
    } catch (err) { console.error(err); }
  };

  // DpscoContact Actions
  const addDpscoContact = async (contact: Omit<DpscoContact, 'id'>) => {
    try {
      const res = await fetch('/api/dpsco-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        const data = await res.json();
        setDpscoContacts(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add DPSCO contact');
      }
    } catch (err) { console.error(err); }
  };
  const updateDpscoContact = async (contact: DpscoContact) => {
    try {
      const res = await fetch(`/api/dpsco-contacts/${contact.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact),
      });
      if (res.ok) {
        const data = await res.json();
        setDpscoContacts(prev => prev.map(p => p.id === data.id ? data : p));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update DPSCO contact');
      }
    } catch (err) { console.error(err); }
  };
  const deleteDpscoContact = async (id: string) => {
    try {
      const res = await fetch(`/api/dpsco-contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDpscoContacts(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete DPSCO contact');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <DataContext.Provider value={{
      athletes, news, events, careers, contacts, sports, leadership, systemComponents,
      volunteers, donations, partners, siteContent, siteContentList, contactInfo, socialLinks,

        npcAssociations, npcClubs, npcFederations, dpscoContacts,
        addNpcAssociation, updateNpcAssociation, deleteNpcAssociation,
        addNpcClub, updateNpcClub, deleteNpcClub,
        addNpcFederation, updateNpcFederation, deleteNpcFederation,
        addDpscoContact, updateDpscoContact, deleteDpscoContact,

      mediaAssets, fetchMediaAssets, fetchProtectedData, uploadMediaFile, deleteMediaAsset,
      addAthlete, updateAthlete, deleteAthlete,
      addNews, updateNews, deleteNews,
      addEvent, updateEvent, deleteEvent,
      addCareer, closeCareer,
      addContactMessage, markContactAsRead, deleteContactMessage,
      addSport, updateSport, deleteSport,
      addLeader, updateLeader, deleteLeader,
      addSystemComponent, updateSystemComponent, deleteSystemComponent,
      addVolunteerApplication, markVolunteerAsRead, deleteVolunteerApplication,
      addDonationInquiry, markDonationAsRead, deleteDonationInquiry,
      addPartner, updatePartner, deletePartner,
      saveSiteContent, updateContactInfo,
      addSocialLink, updateSocialLink, deleteSocialLink
    }}>
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

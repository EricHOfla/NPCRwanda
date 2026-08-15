const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'context', 'DataContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Interfaces
const interfaces = `
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
`;
if (!content.includes('export interface NpcAssociation')) {
  content = content.replace('export interface Athlete {', interfaces + '\nexport interface Athlete {');
}

// 2. DataContextType additions
const contextTypeAdditions = `
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
`;
if (!content.includes('npcAssociations: NpcAssociation[]')) {
  content = content.replace('  partners: Partner[];', '  partners: Partner[];\n' + contextTypeAdditions);
}

// 3. State Declarations
const stateDeclarations = `
  const [npcAssociations, setNpcAssociations] = useState<NpcAssociation[]>([]);
  const [npcClubs, setNpcClubs] = useState<NpcClub[]>([]);
  const [npcFederations, setNpcFederations] = useState<NpcFederation[]>([]);
  const [dpscoContacts, setDpscoContacts] = useState<DpscoContact[]>([]);
`;
if (!content.includes('const [npcAssociations, setNpcAssociations]')) {
  content = content.replace('const [partners, setPartners] = useState<Partner[]>([]);', 'const [partners, setPartners] = useState<Partner[]>([]);\n' + stateDeclarations);
}

// 4. Fetch logic inside loadData
const fetchPromises = `
        fetch('/api/npc-associations').then(r => r.json()),
        fetch('/api/npc-clubs').then(r => r.json()),
        fetch('/api/npc-federations').then(r => r.json()),
        fetch('/api/dpsco-contacts').then(r => r.json()),
`;
if (!content.includes('/api/npc-associations')) {
  content = content.replace("fetch('/api/partners').then(r => r.json()),", "fetch('/api/partners').then(r => r.json()),\n" + fetchPromises);
  
  // Need to inject variables in the Promise.all destructuring:
  content = content.replace(
    "sysRes, partnersRes, contentRes, contactRes, socialRes", 
    "sysRes, partnersRes, assocRes, clubRes, fedRes, dpscoRes, contentRes, contactRes, socialRes"
  );
  
  const setStates = `
      setNpcAssociations(Array.isArray(assocRes) ? assocRes : []);
      setNpcClubs(Array.isArray(clubRes) ? clubRes : []);
      setNpcFederations(Array.isArray(fedRes) ? fedRes : []);
      setDpscoContacts(Array.isArray(dpscoRes) ? dpscoRes : []);
`;
  content = content.replace("setPartners(Array.isArray(partnersRes) ? partnersRes : []);", "setPartners(Array.isArray(partnersRes) ? partnersRes : []);\n" + setStates);
}

// 5. Actions implementations
const actionsImpl = `
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
      const res = await fetch(\`/api/npc-associations/\${assoc.id}\`, {
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
      const res = await fetch(\`/api/npc-associations/\${id}\`, { method: 'DELETE' });
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
      const res = await fetch(\`/api/npc-clubs/\${club.id}\`, {
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
      const res = await fetch(\`/api/npc-clubs/\${id}\`, { method: 'DELETE' });
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
      const res = await fetch(\`/api/npc-federations/\${fed.id}\`, {
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
      const res = await fetch(\`/api/npc-federations/\${id}\`, { method: 'DELETE' });
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
      const res = await fetch(\`/api/dpsco-contacts/\${contact.id}\`, {
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
      const res = await fetch(\`/api/dpsco-contacts/\${id}\`, { method: 'DELETE' });
      if (res.ok) {
        setDpscoContacts(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete DPSCO contact');
      }
    } catch (err) { console.error(err); }
  };
`;
if (!content.includes('addNpcAssociation =')) {
  // Insert before the last return statement
  const insertIndex = content.lastIndexOf('return (');
  content = content.slice(0, insertIndex) + actionsImpl + '\n  ' + content.slice(insertIndex);
}

// 6. Provider export
const providerExports = `
        npcAssociations, npcClubs, npcFederations, dpscoContacts,
        addNpcAssociation, updateNpcAssociation, deleteNpcAssociation,
        addNpcClub, updateNpcClub, deleteNpcClub,
        addNpcFederation, updateNpcFederation, deleteNpcFederation,
        addDpscoContact, updateDpscoContact, deleteDpscoContact,
`;
if (!content.includes('npcAssociations, npcClubs,')) {
  content = content.replace(
    'volunteers, donations, partners, siteContent, siteContentList, contactInfo, socialLinks,',
    'volunteers, donations, partners, siteContent, siteContentList, contactInfo, socialLinks,\n' + providerExports
  );
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('DataContext updated successfully!');

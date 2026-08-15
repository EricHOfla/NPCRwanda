const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Destructure contexts from useData()
const useDataInjections = `
    npcAssociations, npcClubs, npcFederations, dpscoContacts,
    addNpcAssociation, updateNpcAssociation, deleteNpcAssociation,
    addNpcClub, updateNpcClub, deleteNpcClub,
    addNpcFederation, updateNpcFederation, deleteNpcFederation,
    addDpscoContact, updateDpscoContact, deleteDpscoContact,
`;
if (!content.includes('npcAssociations,')) {
  content = content.replace('  } = useData();', useDataInjections + '  } = useData();');
}

// 2. Add forms state and handlers
const stateInjections = `
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
`;
if (!content.includes('const [assocFormOpen,')) {
  content = content.replace('const [partnerFormOpen, setPartnerFormOpen] = useState(false);', stateInjections + '\n  const [partnerFormOpen, setPartnerFormOpen] = useState(false);');
}

// 3. Add Sidebar Link
const sidebarLink = `
              <li className="nav-item">
                <a href="#" className={\`nav-link \${activeTab === 'members' ? 'active' : 'text-dark'}\`} onClick={(e) => { e.preventDefault(); setActiveTab('members'); }}>
                  <i className="fas fa-users-cog me-2 text-muted"></i> Members Directory
                </a>
              </li>
`;
if (!content.includes("setActiveTab('members')")) {
  content = content.replace(
    /<a href="#" className=\{`nav-link \$\{activeTab === 'system' \? 'active' : 'text-dark'\}`\} onClick=\{\(e\) => \{ e\.preventDefault\(\); setActiveTab\('system'\); \}\}>\s*<i className="fas fa-sitemap me-2 text-muted"><\/i> System Directory\s*<\/a>\s*<\/li>/,
    "$&" + sidebarLink
  );
}

// 4. Add the Members UI Block inside the switch/render section
const membersUI = `
          {activeTab === 'members' && (
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
                      <td><i className={\`fas \${p.icon} text-primary\`}></i></td>
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
                       <CMSImageField label="Federation Logo" value={fedForm.logo} onChange={(url) => setFedForm({ ...fedForm, logo: url })} openMediaSelector={openMediaSelector} uploadMediaFile={uploadMediaFile} />
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
`;
if (!content.includes('activeTab === \'members\'')) {
  // Inject exactly after the activeTab === 'system' block ends
  const index = content.indexOf('{activeTab === \'partners\' && (');
  if (index !== -1) {
    content = content.slice(0, index) + membersUI + '\n          ' + content.slice(index);
  } else {
    console.error("Could not find partners UI block");
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard updated successfully!');

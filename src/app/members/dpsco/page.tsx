'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

export default function DpscoContactsPage() {
  const provinces = [
    {
      name: 'Kigali City',
      districts: [
        { name: 'Gasabo', coordinator: 'Mutuyimana Jean de Dieu', phone: '+250 788 111 222', email: 'dpsco.gasabo@npcrwanda.org' },
        { name: 'Kicukiro', coordinator: 'Mukamana Beatrice', phone: '+250 788 333 444', email: 'dpsco.kicukiro@npcrwanda.org' },
        { name: 'Nyarugenge', coordinator: 'Ndayisaba Eric', phone: '+250 788 555 666', email: 'dpsco.nyarugenge@npcrwanda.org' },
      ],
    },
    {
      name: 'Northern Province',
      districts: [
        { name: 'Musanze', coordinator: 'Hategekimana Emmanuel', phone: '+250 788 777 888', email: 'dpsco.musanze@npcrwanda.org' },
        { name: 'Gicumbi', coordinator: 'Uwamahoro Marie Claire', phone: '+250 788 999 000', email: 'dpsco.gicumbi@npcrwanda.org' },
        { name: 'Rulindo', coordinator: 'Ntirushwa Jean Bosco', phone: '+250 788 123 001', email: 'dpsco.rulindo@npcrwanda.org' },
        { name: 'Gakenke', coordinator: 'Nyirahabimana Vestine', phone: '+250 788 123 002', email: 'dpsco.gakenke@npcrwanda.org' },
        { name: 'Burera', coordinator: 'Sebihogo Faustin', phone: '+250 788 123 003', email: 'dpsco.burera@npcrwanda.org' },
      ],
    },
    {
      name: 'Southern Province',
      districts: [
        { name: 'Huye', coordinator: 'Nsengimana Vianney', phone: '+250 788 123 004', email: 'dpsco.huye@npcrwanda.org' },
        { name: 'Muhanga', coordinator: 'Mukandutiye Alphonsine', phone: '+250 788 123 005', email: 'dpsco.muhanga@npcrwanda.org' },
        { name: 'Nyanza', coordinator: 'Gasasira Augustin', phone: '+250 788 123 006', email: 'dpsco.nyanza@npcrwanda.org' },
        { name: 'Gisagara', coordinator: 'Habiyaremye Theogene', phone: '+250 788 123 007', email: 'dpsco.gisagara@npcrwanda.org' },
        { name: 'Nyamagabe', coordinator: 'Uwizeye Christine', phone: '+250 788 123 008', email: 'dpsco.nyamagabe@npcrwanda.org' },
        { name: 'Nyaruguru', coordinator: 'Karakire Jean Nepo', phone: '+250 788 123 009', email: 'dpsco.nyaruguru@npcrwanda.org' },
        { name: 'Ruhango', coordinator: 'Nyirankundabera Solange', phone: '+250 788 123 010', email: 'dpsco.ruhango@npcrwanda.org' },
        { name: 'Kamonyi', coordinator: 'Karemera Francois', phone: '+250 788 123 011', email: 'dpsco.kamonyi@npcrwanda.org' },
      ],
    },
    {
      name: 'Eastern Province',
      districts: [
        { name: 'Rwamagana', coordinator: 'Uwimana Jean Claude', phone: '+250 788 123 012', email: 'dpsco.rwamagana@npcrwanda.org' },
        { name: 'Bugesera', coordinator: 'Munyaneza Samuel', phone: '+250 788 123 013', email: 'dpsco.bugesera@npcrwanda.org' },
        { name: 'Kayonza', coordinator: 'Kakuze Chantal', phone: '+250 788 123 014', email: 'dpsco.kayonza@npcrwanda.org' },
        { name: 'Gatsibo', coordinator: 'Ruzindana James', phone: '+250 788 123 015', email: 'dpsco.gatsibo@npcrwanda.org' },
        { name: 'Nyagatare', coordinator: 'Umugwaneza Liliane', phone: '+250 788 123 016', email: 'dpsco.nyagatare@npcrwanda.org' },
        { name: 'Ngoma', coordinator: 'Bikorimana Alexis', phone: '+250 788 123 017', email: 'dpsco.ngoma@npcrwanda.org' },
        { name: 'Kirehe', coordinator: 'Nyiranzeyimana Grace', phone: '+250 788 123 018', email: 'dpsco.kirehe@npcrwanda.org' },
      ],
    },
    {
      name: 'Western Province',
      districts: [
        { name: 'Rubavu', coordinator: 'Dusabimana Theoneste', phone: '+250 788 123 019', email: 'dpsco.rubavu@npcrwanda.org' },
        { name: 'Rusizi', coordinator: 'Mukashyaka Specioza', phone: '+250 788 123 020', email: 'dpsco.rusizi@npcrwanda.org' },
        { name: 'Karongi', coordinator: 'Tuyishime Pacifique', phone: '+250 788 123 021', email: 'dpsco.karongi@npcrwanda.org' },
        { name: 'Nyamasheke', coordinator: 'Mureramanzi Jean Paul', phone: '+250 788 123 022', email: 'dpsco.nyamasheke@npcrwanda.org' },
        { name: 'Nyabihu', coordinator: 'Umutoni Jeanne', phone: '+250 788 123 023', email: 'dpsco.nyabihu@npcrwanda.org' },
        { name: 'Ngororero', coordinator: 'Ndahimana Sylvester', phone: '+250 788 123 024', email: 'dpsco.ngororero@npcrwanda.org' },
        { name: 'Rutsiro', coordinator: 'Uwingabire Delphine', phone: '+250 788 123 025', email: 'dpsco.rutsiro@npcrwanda.org' },
      ],
    },
  ];

  const [activeProvince, setActiveProvince] = useState('Kigali City');

  return (
    <main id="main-content">
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
                DPSCO
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            DPSCO Contacts
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            District Paralympic Sport Committees across all 30 districts of Rwanda.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="py-5 bg-light">
        <div className="container">
          
          {/* Province Selector tabs */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" data-aos="fade-up">
            {provinces.map((prov) => (
              <button
                key={prov.name}
                onClick={() => setActiveProvince(prov.name)}
                className={`btn btn-sm px-4 py-2 rounded-pill fw-bold ${
                  activeProvince === prov.name ? 'btn-primary' : 'btn-light border text-dark'
                }`}
              >
                {prov.name}
              </button>
            ))}
          </div>

          {/* Districts Contacts list */}
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            {provinces
              .find((prov) => prov.name === activeProvince)
              ?.districts.map((dist, idx) => (
                <div key={idx} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '12px', background: '#fff' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center text-primary bg-primary-soft me-3"
                        style={{ width: '45px', height: '45px', borderRadius: '10px' }}
                      >
                        <i className="fas fa-map-marker-alt text-lg"></i>
                      </div>
                      <div>
                        <h2 className="h5 fw-bold mb-0 text-dark">{dist.name} District</h2>
                        <span className="text-muted small">DPSCO Coordinator</span>
                      </div>
                    </div>
                    
                    <div className="border-top pt-3 mt-2">
                      <p className="mb-2 text-dark small">
                        <i className="fas fa-user text-muted me-2"></i>
                        <strong>Name:</strong> {dist.coordinator}
                      </p>
                      <p className="mb-2 text-dark small">
                        <i className="fas fa-phone text-muted me-2"></i>
                        <strong>Phone:</strong> <a href={`tel:${dist.phone}`} className="text-decoration-none">{dist.phone}</a>
                      </p>
                      <p className="mb-0 text-dark small text-truncate">
                        <i className="fas fa-envelope text-muted me-2"></i>
                        <strong>Email:</strong> <a href={`mailto:${dist.email}`} className="text-decoration-none">{dist.email}</a>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

        </div>
      </section>
    </main>
  );
}

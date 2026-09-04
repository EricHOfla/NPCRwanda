'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

export default function SportsPage() {
  const { t } = useTranslation();
  const { sports } = useData();
  const [currentPage, setCurrentPage] = React.useState(1);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(sports.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedSports = sports.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);
  const getSportImageSrc = (image?: string) => {
    if (!image) {
      return '/assets/img/curated/index-sport-1.jpg';
    }

    if (image.startsWith('/') || image.startsWith('http')) {
      return image;
    }

    if (image.includes('/')) {
      return `/${image}`;
    }

    return `/assets/img/curated/${image}`;
  };

  return (
    <main id="main-content">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/" className="text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">{t('phrase.Sports')}</li>
            </ol>
          </nav>
          <h1 className="text-white mb-2" data-aos="fade-up" data-aos-delay="50">{t('phrase.Our Sports Programs')}</h1>
          <p className="lead" data-aos="fade-up" data-aos-delay="100">
            Explore the diverse para-sports disciplines we manage and support across Rwanda.
          </p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {paginatedSports.map((sport, i) => (
              <div key={sport.id} className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                <div className="custom-card sport-card">
                  <img
                    src={getSportImageSrc(sport.img)}
                    alt={t(sport.title)}
                    className="card-img-top"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/curated/index-sport-1.jpg'; }}
                  />
                  <div className="card-body">
                    <h3>{t(sport.title)}</h3>
                    <p className="small text-muted">{t(sport.desc)}</p>
                    <Link href={`/sports#${sport.id}`} className="fw-bold text-primary text-decoration-none">
                      {t('phrase.Learn More')} <i className="fas fa-arrow-right small" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Sports pagination" />
        </div>
      </section>
    </main>
  );
}

'use client';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = 'Page navigation',
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages: Array<number | 'ellipsis'> = [];
  const addPage = (page: number) => {
    if (!pages.includes(page)) {
      pages.push(page);
    }
  };

  addPage(1);
  if (currentPage > 3) {
    pages.push('ellipsis');
  }

  for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
    addPage(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push('ellipsis');
  }
  addPage(totalPages);

  return (
    <div className="d-flex justify-content-center mt-5">
      <nav aria-label={ariaLabel}>
        <ul className="pagination gap-2 border-0 flex-wrap justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link rounded-3 px-3 py-2"
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              style={{ border: '1px solid #E2E8F0', color: 'var(--text-dark)' }}
            >
              <i className="fas fa-chevron-left" aria-hidden="true" />
            </button>
          </li>

          {pages.map((page, index) => (
            <li
              key={`${page}-${index}`}
              className={`page-item ${page === 'ellipsis' ? 'disabled' : ''} ${page === currentPage ? 'active' : ''}`}
            >
              {page === 'ellipsis' ? (
                <span className="page-link rounded-3 px-3 py-2" style={{ border: '1px solid #E2E8F0', color: 'var(--text-dark)' }}>
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  className="page-link rounded-3 px-3 py-2"
                  onClick={() => onPageChange(page)}
                  disabled={page === currentPage}
                  aria-current={page === currentPage ? 'page' : undefined}
                  style={{
                    background: currentPage === page ? 'var(--primary-blue)' : '#fff',
                    color: currentPage === page ? '#fff' : 'var(--text-dark)',
                    border: currentPage === page ? '1px solid var(--primary-blue)' : '1px solid #E2E8F0',
                    fontWeight: 600,
                  }}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              type="button"
              className="page-link rounded-3 px-3 py-2"
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              style={{ border: '1px solid #E2E8F0', color: 'var(--text-dark)' }}
            >
              <i className="fas fa-chevron-right" aria-hidden="true" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowRight
} from 'lucide-react';

/**
 * Modern, interactive Pagination component
 * @param {number}   currentPage - 1-based index
 * @param {number}   totalPages
 * @param {number}   totalItems
 * @param {number}   pageSize
 * @param {Function} onPageChange - (page: number) => void
 * @param {Function} [onPageSizeChange] - (newSize: number) => void
 * @param {number[]} [pageSizeOptions] - [10, 20, 50, 100]
 * @param {string}   itemName - plural unit name (e.g. 'candidates', 'recruiters', 'companies')
 * @param {boolean}  showPageSizeSelector - show rows per page dropdown
 * @param {boolean}  showJumpTo - show jump to page input
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  itemName = 'records',
  showPageSizeSelector = true,
  showJumpTo = true,
}) {
  const [jumpInput, setJumpInput] = useState('');

  // Sync jump input with currentPage
  useEffect(() => {
    setJumpInput('');
  }, [currentPage]);

  const from = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const to = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0;

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const targetPage = parseInt(jumpInput, 10);
    if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
      onPageChange(targetPage);
      setJumpInput('');
    }
  };

  const getPages = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        pages.push('...');
      }
    }
    return pages;
  };

  const pages = getPages();

  if (totalItems === 0 || totalPages < 1) return null;

  return (
    <div className="modern-pagination-container">
      {/* Left section: Summary & Page Size selector */}
      <div className="pagination-left-meta">
        {totalItems !== undefined && (
          <div className="pagination-badge-info">
            <span className="pagination-range-text">
              Showing <strong>{from}–{to}</strong> of <strong>{totalItems}</strong> {itemName}
            </span>
            <span className="pagination-pill-page">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}

        {onPageSizeChange && showPageSizeSelector && (
          <div className="pagination-page-size-wrap">
            <span className="pagination-size-label">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="pagination-select"
              aria-label="Select rows per page"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right section: Navigation controls & Quick jump */}
      <div className="pagination-right-controls">
        <div className="pagination-nav-group">
          {/* First Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Page numbers */}
          <div className="pagination-pages-list">
            {pages.map((page, idx) =>
              page === '...' ? (
                <span key={`dots-${idx}`} className="pagination-dots">
                  …
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  className={`pagination-btn pagination-num-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            )}
          </div>

          {/* Next Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>

        {/* Jump to Page */}
        {showJumpTo && totalPages > 2 && (
          <form onSubmit={handleJumpSubmit} className="pagination-jump-form" title="Quick Jump to Page">
            <span className="pagination-jump-label">Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={String(currentPage)}
              className="pagination-jump-input"
              aria-label="Jump to page"
            />
            <button
              type="submit"
              disabled={!jumpInput || parseInt(jumpInput, 10) < 1 || parseInt(jumpInput, 10) > totalPages || parseInt(jumpInput, 10) === currentPage}
              className="pagination-jump-btn"
              aria-label="Go"
            >
              <ArrowRight size={13} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

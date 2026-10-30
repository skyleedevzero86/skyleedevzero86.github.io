export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pagination-container">
      <div className="pagination">
        <button
          type="button"
          className="pagination-btn prev-btn"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="이전 페이지"
        >
          <i className="fas fa-chevron-left" />
        </button>
        <div className="pagination-numbers">
          {Array.from({ length: totalPages }, (_, index) => {
            const number = index + 1
            return (
              <button
                type="button"
                key={number}
                className={`page-number${number === page ? ' active' : ''}`}
                onClick={() => onChange(number)}
              >
                {number}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          className="pagination-btn next-btn"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="다음 페이지"
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  )
}

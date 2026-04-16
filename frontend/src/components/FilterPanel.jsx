function FilterPanel({ title, description, children }) {
  return (
    <section className="filter-panel mb-4 mb-lg-5">
      <div className="row g-4 align-items-end">
        <div className="col-xl-4">
          <h2 className="h4 fw-semibold mb-2">{title}</h2>
          <p className="mb-0">{description}</p>
        </div>
        <div className="col-xl-8">
          <div className="row g-3">{children}</div>
        </div>
      </div>
    </section>
  )
}

export default FilterPanel

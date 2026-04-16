function TransportCard({ transport }) {
  const typeClass = `transport-card__type transport-card__type--${transport.type.toLowerCase()}`

  return (
    <article className="transport-card h-100">
      <div className="transport-card__top mb-4">
        <div>
          <span className={typeClass}>{transport.type}</span>
          <h3 className="h5 fw-semibold mt-3 mb-1">{transport.company}</h3>
          <p className="mb-0">{transport.note}</p>
        </div>
        <div className="text-lg-end">
          <small className="d-block text-uppercase text-muted mb-1">Price</small>
          <div className="transport-card__price">{transport.price}</div>
        </div>
      </div>

      <div className="transport-card__route">
        <div className="row g-3">
          <div className="col-sm-4">
            <span>Departure</span>
            <strong>{transport.departure}</strong>
          </div>
          <div className="col-sm-4">
            <span>Arrival</span>
            <strong>{transport.arrival}</strong>
          </div>
          <div className="col-sm-4">
            <span>Date</span>
            <strong>{transport.date}</strong>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="transport-card__meta">
          <span>{transport.duration}</span>
          <span>{transport.serviceClass}</span>
        </div>
        <button className="btn btn-brand" type="button">
          Book Now
        </button>
      </div>
    </article>
  )
}

export default TransportCard

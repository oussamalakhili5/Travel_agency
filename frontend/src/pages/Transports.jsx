import FilterPanel from '../components/FilterPanel'
import SectionHeader from '../components/SectionHeader'
import TransportCard from '../components/TransportCard'
import transports from '../data/transports'

function Transports() {
  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow="Transport Booking"
          title="Compare flights, trains, and transfer options in one polished booking view."
          description="The transport page now behaves like a realistic reservation screen, combining route filters with a structured list of available services."
        />
      </section>

      <FilterPanel
        description="Choose a departure point, destination, date, and transport type. This is a clean frontend-only filter UI, ready for backend integration later."
        title="Search transport options"
      >
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="departure-city">
            Departure
          </label>
          <input
            className="form-control"
            id="departure-city"
            placeholder="Leaving from"
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="arrival-city">
            Destination
          </label>
          <input
            className="form-control"
            id="arrival-city"
            placeholder="Going to"
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="travel-date">
            Date
          </label>
          <input className="form-control" id="travel-date" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="travel-type">
            Type
          </label>
          <select className="form-select" id="travel-type">
            <option>All types</option>
            <option>Flight</option>
            <option>Train</option>
            <option>Bus</option>
          </select>
        </div>

        <div className="col-xl-2 d-grid">
          <button className="btn btn-dark btn-lg mt-xl-4" type="button">
            Search
          </button>
        </div>
      </FilterPanel>

      <div className="listing-summary">
        <p>{transports.length} transport options displayed with route, date, and pricing details.</p>
        <span className="results-pill">Flights, rail, and shuttle transfers</span>
      </div>

      <section>
        <div className="row g-4">
          {transports.map((transport) => (
            <div className="col-lg-6" key={transport.id}>
              <TransportCard transport={transport} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Transports

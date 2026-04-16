import FilterPanel from '../components/FilterPanel'
import HotelCard from '../components/HotelCard'
import SectionHeader from '../components/SectionHeader'
import hotels from '../data/hotels'

function Hotels() {
  return (
    <div className="container">
      <section className="mb-4">
        <SectionHeader
          eyebrow="Hotel Listings"
          title="Curated stays for business travel, city breaks, and premium vacations."
          description="This listing page uses realistic hotel cards, strong hierarchy, and a clean filter layout so it already feels close to a production booking experience."
        />
      </section>

      <FilterPanel
        description="Search by destination, stay dates, and budget range. The fields are UI-only for now and ready to connect to future backend filtering."
        title="Search accommodations"
      >
        <div className="col-md-6 col-xl-3">
          <label className="form-label" htmlFor="hotel-destination">
            Destination
          </label>
          <input
            className="form-control"
            id="hotel-destination"
            placeholder="Where are you going?"
            type="text"
          />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="check-in">
            Check-in
          </label>
          <input className="form-control" id="check-in" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="check-out">
            Check-out
          </label>
          <input className="form-control" id="check-out" type="date" />
        </div>

        <div className="col-md-6 col-xl-2">
          <label className="form-label" htmlFor="budget">
            Budget
          </label>
          <select className="form-select" id="budget">
            <option>Any budget</option>
            <option>$0 - $150</option>
            <option>$150 - $250</option>
            <option>$250+</option>
          </select>
        </div>

        <div className="col-xl-3 d-grid">
          <button className="btn btn-dark btn-lg mt-xl-4" type="button">
            Search Hotels
          </button>
        </div>
      </FilterPanel>

      <div className="listing-summary">
        <p>{hotels.length} curated hotel options ready for search and detail pages.</p>
        <span className="results-pill">Popular cities and premium stays</span>
      </div>

      <section>
        <div className="row g-4">
          {hotels.map((hotel) => (
            <div className="col-md-6 col-xl-4" key={hotel.id}>
              <HotelCard hotel={hotel} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Hotels
